// Configuration
let calendar;
let currentEvents = [];
let drugColorMap = {};
let currentRegimenData = null;
let editedRegimenData = null;
let customTreatments = [];

// Initialize the app
document.addEventListener('DOMContentLoaded', function() {
    initializeCalendar();
    loadRegimens();
    setDefaultDate();
    setupEventListeners();
});

// Initialize FullCalendar
function initializeCalendar() {
    const calendarEl = document.getElementById('calendar');
    calendar = new FullCalendar.Calendar(calendarEl, {
        initialView: 'dayGridMonth',
        fixedWeekCount: false,
        dayMaxEvents: false, // Show all events, no "+more" link
        headerToolbar: {
            left: 'prev,next today',
            center: 'title',
            right: 'dayGridMonth,listMonth,list3Month,listYear'
        },
        views: {
            listMonth: {
                buttonText: '1 Month List'
            },
            list3Month: {
                type: 'list',
                buttonText: '3 Months',
                duration: { months: 3 }
            },
            listYear: {
                buttonText: 'All Treatments',
                duration: { months: 12 }
            }
        },
        events: [],
        eventClick: function(info) {
            alert(`${info.event.title}\n\n${info.event.extendedProps.description}`);
        },
        eventClassNames: function(arg) {
            if (arg.event.extendedProps.type === 'medication') {
                return ['medication-event'];
            } else if (arg.event.extendedProps.type === 'rest') {
                return ['rest-event'];
            } else if (arg.event.extendedProps.drug_name) {
                // Assign a color class based on drug name
                const drugClass = getDrugColorClass(arg.event.extendedProps.drug_name);
                return [drugClass];
            }
            return [];
        },
        eventDidMount: function(info) {
            // Apply custom color class if it's a drug event
            // Avoid inline styles to ensure print styles work correctly
            if (info.event.extendedProps.drug_name && drugColorMap[info.event.extendedProps.drug_name]) {
                const drugClass = getDrugColorClass(info.event.extendedProps.drug_name);
                info.el.classList.add(drugClass);
            }
        }
    });
    calendar.render();
}

// Load available regimens from API
async function loadRegimens() {
    try {
        // Wait for additional regimens to load from JSON files
        await loadAdditionalRegimens();
        
        const regimens = getRegimens();
        
        const select = document.getElementById('regimen-select');
        regimens.forEach(regimen => {
            const option = document.createElement('option');
            option.value = regimen.id;
            option.textContent = regimen.name;
            select.appendChild(option);
        });
    } catch (error) {
        console.error('Error loading regimens:', error);
        alert('Error loading regimens: ' + error.message);
    }
}

// Set default date to today
function setDefaultDate() {
    const today = new Date().toISOString().split('T')[0];
    document.getElementById('start-date').value = today;
    document.getElementById('start-date').min = today;
}

// Setup event listeners
function setupEventListeners() {
    document.getElementById('generate-btn').addEventListener('click', generateSchedule);
    document.getElementById('print-btn').addEventListener('click', printCalendar);
    document.getElementById('regimen-select').addEventListener('change', showRegimenDetails);
    document.getElementById('edit-btn').addEventListener('click', showEditInterface);
    document.getElementById('apply-edits').addEventListener('click', applyEdits);
    document.getElementById('cancel-edits').addEventListener('click', cancelEdits);
    document.getElementById('add-treatment-btn').addEventListener('click', addCustomTreatment);
    
    // Toggle advanced options
    document.getElementById('show-advanced-options').addEventListener('change', function(e) {
        const advancedOptions = document.getElementById('advanced-options');
        advancedOptions.style.display = e.target.checked ? 'block' : 'none';
    });
    
    // Allow Enter key to add treatment
    document.getElementById('new-treatment-name').addEventListener('keypress', function(e) {
        if (e.key === 'Enter') {
            addCustomTreatment();
        }
    });
}

// Show regimen details when selected
async function showRegimenDetails() {
    const regimenId = document.getElementById('regimen-select').value;
    const detailsDiv = document.getElementById('regimen-details');
    
    if (!regimenId) {
        detailsDiv.style.display = 'none';
        return;
    }
    
    try {
        const regimen = getRegimenDetails(regimenId);
        
        let detailsHTML = `<h3>${regimen.name}</h3><p>${regimen.description}</p>`;
        
        if (regimen.schedule === 'weekdays') {
            detailsHTML += `<p><strong>Schedule:</strong> Monday-Friday for ${regimen.total_days} sessions</p>`;
        } else {
            detailsHTML += `<p><strong>Cycle length:</strong> ${regimen.cycle_days} days</p>`;
            detailsHTML += `<p><strong>Default cycles:</strong> ${regimen.total_cycles}</p>`;
            
            // Check if any drugs have cycle restrictions
            if (regimen.schedule && Array.isArray(regimen.schedule)) {
                const drugsWithCycles = regimen.schedule.filter(item => 
                    item.cycles && item.cycles !== 'all' && Array.isArray(item.cycles)
                );
                
                if (drugsWithCycles.length > 0) {
                    detailsHTML += `<p><strong>Note:</strong> Some medications are only given in specific cycles:</p><ul>`;
                    const drugCycleMap = {};
                    drugsWithCycles.forEach(item => {
                        const cycleRange = `cycles ${Math.min(...item.cycles)}-${Math.max(...item.cycles)}`;
                        if (!drugCycleMap[item.description]) {
                            drugCycleMap[item.description] = cycleRange;
                        }
                    });
                    Object.entries(drugCycleMap).forEach(([drug, cycles]) => {
                        detailsHTML += `<li>${drug}: ${cycles}</li>`;
                    });
                    detailsHTML += `</ul>`;
                }
            }
            
            if (regimen.daily_medication) {
                detailsHTML += `<p><strong>Note:</strong> Includes daily medication</p>`;
            }
        }
        
        // Update cycle count placeholder with default
        document.getElementById('cycle-count').placeholder = regimen.total_cycles.toString();
        
        detailsDiv.innerHTML = detailsHTML;
        detailsDiv.style.display = 'block';
    } catch (error) {
        console.error('Error loading regimen details:', error);
    }
}

// Define colorblind-safe palette based on Paul Tol's schemes
const drugColors = [
    { bg: '#88CCEE', border: '#4C99C7', text: '#000000' }, // Light blue
    { bg: '#CC6677', border: '#A94450', text: '#000000' }, // Rose
    { bg: '#DDCC77', border: '#B6A550', text: '#000000' }, // Sand
    { bg: '#117733', border: '#0A4D22', text: '#000000' }, // Green
    { bg: '#882255', border: '#5B1638', text: '#000000' }, // Wine
    { bg: '#44AA99', border: '#2D7368', text: '#000000' }, // Teal
    { bg: '#999933', border: '#666622', text: '#000000' }, // Olive
    { bg: '#AA4499', border: '#732D68', text: '#000000' }, // Purple
];

// Assign colors to drugs based on their names
function assignDrugColors(events) {
    drugColorMap = {}; // Reset color map
    const uniqueDrugs = [...new Set(events
        .filter(e => e.drug_name && e.type !== 'rest' && e.type !== 'medication')
        .map(e => e.drug_name))];
    
    uniqueDrugs.forEach((drug, index) => {
        drugColorMap[drug] = drugColors[index % drugColors.length];
    });
}

// Get drug color class (for fallback CSS)
function getDrugColorClass(drugName) {
    const drugs = Object.keys(drugColorMap);
    const index = drugs.indexOf(drugName);
    return `drug-color-${index % drugColors.length}`;
}

// Generate schedule based on selection
async function generateSchedule() {
    const regimenId = document.getElementById('regimen-select').value;
    const startDate = document.getElementById('start-date').value;
    const cycleCountInput = document.getElementById('cycle-count').value;
    const startingCycleInput = document.getElementById('starting-cycle').value;
    
    if (!regimenId || !startDate) {
        alert('Please select a regimen and start date');
        return;
    }
    
    // Prepare request body
    const requestBody = {
        regimen_id: regimenId,
        start_date: startDate
    };
    
    // Add custom cycle count if provided
    if (cycleCountInput && cycleCountInput.trim() !== '') {
        const cycleCount = parseInt(cycleCountInput);
        if (isNaN(cycleCount) || cycleCount < 1 || cycleCount > 100) {
            alert('Please enter a valid cycle count between 1 and 100');
            return;
        }
        requestBody.total_cycles = cycleCount;
    }
    
    // Add starting cycle if provided and not 1
    if (startingCycleInput && startingCycleInput.trim() !== '') {
        const startingCycle = parseInt(startingCycleInput);
        if (isNaN(startingCycle) || startingCycle < 1 || startingCycle > 101) {
            alert('Please enter a valid starting cycle between 1 and 101');
            return;
        }
        if (startingCycle > 1) {
            requestBody.starting_cycle = startingCycle;
        }
    }
    
    try {
        const data = calculateSchedule(requestBody);
        
        // Clear existing events
        calendar.removeAllEvents();
        
        // Assign colors to drugs
        assignDrugColors(data.events);
        
        // Add new events
        currentEvents = data.events.map(event => ({
            title: event.title,
            date: event.date,
            description: event.description,
            type: event.type,
            drug_name: event.drug_name
        }));
        
        // Check if no events were generated
        if (currentEvents.length === 0) {
            alert('No treatments are scheduled for the selected cycles. This can happen if your starting cycle is beyond the treatment plan. Please check your cycle settings.');
            // Still show the calendar but it will be empty
        }
        
        calendar.addEventSource(currentEvents);
        
        // Go to the start date
        calendar.gotoDate(startDate);
        
        // Show print and edit buttons even if no events
        document.getElementById('print-btn').style.display = 'inline-block';
        document.getElementById('edit-btn').style.display = 'inline-block';
        
        // Store the current regimen data
        currentRegimenData = data;
        
        // Add print header info for better printed output
        const calendarContainer = document.querySelector('.calendar-container');
        const regimenSelect = document.getElementById('regimen-select');
        const selectedRegimen = regimenSelect.options[regimenSelect.selectedIndex].text;
        calendarContainer.setAttribute('data-print-header', 
            `Treatment Schedule: ${selectedRegimen} - Starting ${startDate}`);
        
    } catch (error) {
        console.error('Error generating schedule:', error);
        alert('Error generating schedule: ' + error.message);
    }
}

// Print calendar functionality
function printCalendar() {
    window.print();
}

// Alternative PDF export using jsPDF and html2canvas
async function exportToPDF() {
    const { jsPDF } = window.jspdf;
    
    try {
        // Create loading indicator
        const printBtn = document.getElementById('print-btn');
        const originalText = printBtn.textContent;
        printBtn.textContent = 'Generating PDF...';
        printBtn.disabled = true;
        
        // Capture the calendar element
        const calendarElement = document.querySelector('.calendar-container');
        const canvas = await html2canvas(calendarElement, {
            scale: 2,
            logging: false,
            useCORS: true
        });
        
        // Create PDF
        const pdf = new jsPDF({
            orientation: 'landscape',
            unit: 'mm',
            format: 'a4'
        });
        
        // Calculate dimensions
        const imgWidth = 280;
        const imgHeight = (canvas.height * imgWidth) / canvas.width;
        
        // Add image to PDF
        const imgData = canvas.toDataURL('image/png');
        pdf.addImage(imgData, 'PNG', 10, 10, imgWidth, imgHeight);
        
        // Add title and metadata
        const regimenSelect = document.getElementById('regimen-select');
        const selectedRegimen = regimenSelect.options[regimenSelect.selectedIndex].text;
        const startDate = document.getElementById('start-date').value;
        
        pdf.setFontSize(16);
        pdf.text(`Treatment Schedule: ${selectedRegimen}`, 10, 10);
        pdf.setFontSize(12);
        pdf.text(`Start Date: ${startDate}`, 10, 18);
        
        // Save the PDF
        pdf.save(`treatment-schedule-${startDate}.pdf`);
        
        // Restore button
        printBtn.textContent = originalText;
        printBtn.disabled = false;
        
    } catch (error) {
        console.error('Error generating PDF:', error);
        alert('Error generating PDF. Please try using the print function instead.');
    }
}

// Show edit interface
function showEditInterface() {
    if (!currentRegimenData) {
        console.error('No regimen data available');
        alert('Please generate a schedule first');
        return;
    }
    
    console.log('Current regimen data:', currentRegimenData);
    
    const editDiv = document.getElementById('edit-regimen');
    const editGrid = document.getElementById('edit-grid');
    
    try {
        // Create a deep copy of the regimen data
        editedRegimenData = JSON.parse(JSON.stringify(currentRegimenData));
        
        // Reset custom treatments
        customTreatments = [];
        
        // Clear the input field
        document.getElementById('new-treatment-name').value = '';
        
        // Build the edit grid
        const gridHTML = buildEditGrid(editedRegimenData);
        editGrid.innerHTML = gridHTML;
        
        // Show the edit interface
        editDiv.style.display = 'block';
        
        // Scroll to edit interface
        editDiv.scrollIntoView({ behavior: 'smooth', block: 'start' });
    } catch (error) {
        console.error('Error showing edit interface:', error);
        alert('Error loading edit interface. Please check the console for details.');
    }
}

// Build the edit grid HTML
function buildEditGrid(regimenData) {
    if (!regimenData || !regimenData.regimen) {
        console.error('Invalid regimen data:', regimenData);
        throw new Error('Invalid regimen data structure');
    }
    
    const regimen = regimenData.regimen;
    const schedule = regimen.schedule;
    const totalCycles = regimenData.total_cycles || regimen.total_cycles;
    const cycleDays = regimen.cycle_days;
    const startingCycle = parseInt(document.getElementById('starting-cycle').value) || 1;
    
    // Get unique drugs and days
    const drugs = [...new Set(schedule.map(item => item.description))].sort();
    
    // Add custom treatments to the drug list
    customTreatments.forEach(treatment => {
        if (!drugs.includes(treatment)) {
            drugs.push(treatment);
        }
    });
    
    const maxDay = Math.max(...schedule.map(item => item.day));
    
    let html = '<table><thead><tr><th>Drug</th>';
    
    // Create cycle headers with adjusted numbers
    for (let cycle = 0; cycle < totalCycles; cycle++) {
        const actualCycle = startingCycle + cycle;
        html += `<th colspan="${cycleDays}" class="cycle-header">Cycle ${actualCycle}</th>`;
    }
    html += '</tr><tr><th></th>';
    
    // Create day headers for each cycle
    for (let cycle = 0; cycle < totalCycles; cycle++) {
        for (let day = 1; day <= cycleDays; day++) {
            const isFirstDayOfCycle = day === 1;
            const headerClass = `day-header${isFirstDayOfCycle ? ' cycle-separator' : ''}`;
            html += `<th class="${headerClass}" data-cycle="${cycle}" data-day="${day}" onclick="toggleDayColumn(${cycle}, ${day})">D${day}</th>`;
        }
    }
    html += '</tr></thead><tbody>';
    
    // Create rows for each drug
    drugs.forEach(drug => {
        const isCustom = customTreatments.includes(drug);
        const rowClass = isCustom ? 'custom-treatment' : '';
        html += `<tr class="${rowClass}"><td>${drug}</td>`;
        
        for (let cycle = 0; cycle < totalCycles; cycle++) {
            const actualCycle = startingCycle + cycle;
            for (let day = 1; day <= cycleDays; day++) {
                // Check if this drug is scheduled on this day in this actual cycle
                const isScheduled = schedule.some(item => {
                    if (item.description !== drug || item.day !== day) return false;
                    
                    // If no cycles specified, include in all cycles
                    if (!item.cycles) return true;
                    
                    // If cycles is "all", include in all cycles
                    if (item.cycles === "all") return true;
                    
                    // If cycles is an array, check if actualCycle is included
                    if (Array.isArray(item.cycles)) {
                        return item.cycles.includes(actualCycle);
                    }
                    
                    return false;
                });
                
                const checkboxId = `checkbox-${drug}-${cycle}-${day}`;
                const isFirstDayOfCycle = day === 1;
                const cellClass = isFirstDayOfCycle ? 'cycle-separator' : '';
                html += `<td class="${cellClass}">
                    <input type="checkbox" 
                           id="${checkboxId}" 
                           data-drug="${drug}" 
                           data-cycle="${cycle}" 
                           data-day="${day}"
                           data-actual-cycle="${actualCycle}"
                           ${isScheduled ? 'checked' : ''}>
                </td>`;
            }
        }
        html += '</tr>';
    });
    
    html += '</tbody></table>';
    return html;
}

// Apply edits and regenerate schedule
async function applyEdits() {
    if (!editedRegimenData) return;
    
    // Get all checkboxes
    const checkboxes = document.querySelectorAll('#edit-grid input[type="checkbox"]');
    
    // Rebuild the schedule based on checkbox states
    const newSchedule = [];
    const drugDayCycleMap = {};
    
    checkboxes.forEach(checkbox => {
        if (checkbox.checked) {
            const drug = checkbox.dataset.drug;
            const actualCycle = parseInt(checkbox.dataset.actualCycle);
            const day = parseInt(checkbox.dataset.day);
            
            const key = `${drug}-${day}`;
            if (!drugDayCycleMap[key]) {
                drugDayCycleMap[key] = {
                    description: drug,
                    day: day,
                    cycles: []
                };
            }
            drugDayCycleMap[key].cycles.push(actualCycle);
        }
    });
    
    // Convert map to array and sort
    Object.values(drugDayCycleMap).forEach(item => {
        item.cycles.sort((a, b) => a - b);
        newSchedule.push(item);
    });
    
    // Sort schedule by day and drug name
    newSchedule.sort((a, b) => {
        if (a.day !== b.day) return a.day - b.day;
        return a.description.localeCompare(b.description);
    });
    
    // Update the edited regimen data
    editedRegimenData.regimen.schedule = newSchedule;
    
    // Regenerate the calendar with edited data
    await regenerateCalendarWithEditedData();
    
    // Hide edit interface
    document.getElementById('edit-regimen').style.display = 'none';
}

// Cancel edits
function cancelEdits() {
    editedRegimenData = null;
    customTreatments = [];
    document.getElementById('new-treatment-name').value = '';
    document.getElementById('edit-regimen').style.display = 'none';
}

// Regenerate calendar with edited regimen data
async function regenerateCalendarWithEditedData() {
    const startDate = document.getElementById('start-date').value;
    const cycleCountInput = document.getElementById('cycle-count').value;
    const startingCycleInput = document.getElementById('starting-cycle').value;
    
    // Prepare request body with edited regimen
    const requestBody = {
        regimen_data: editedRegimenData.regimen,
        start_date: startDate
    };
    
    // Add custom cycle count if provided
    if (cycleCountInput && cycleCountInput.trim() !== '') {
        const cycleCount = parseInt(cycleCountInput);
        requestBody.total_cycles = cycleCount;
    }
    
    // Add starting cycle if provided and not 1
    if (startingCycleInput && startingCycleInput.trim() !== '') {
        const startingCycle = parseInt(startingCycleInput);
        if (startingCycle > 1) {
            requestBody.starting_cycle = startingCycle;
        }
    }
    
    try {
        const data = calculateScheduleCustom(requestBody);
        
        // Clear existing events
        calendar.removeAllEvents();
        
        // Assign colors to drugs
        assignDrugColors(data.events);
        
        // Add new events
        currentEvents = data.events.map(event => ({
            title: event.title,
            date: event.date,
            description: event.description,
            type: event.type,
            drug_name: event.drug_name
        }));
        
        calendar.addEventSource(currentEvents);
        
        // Update current regimen data
        currentRegimenData = data;
        
    } catch (error) {
        console.error('Error regenerating schedule:', error);
        alert('Error regenerating schedule. The backend may need to be updated to support custom regimens.');
    }
}

// Toggle all checkboxes for a specific day in a cycle
function toggleDayColumn(cycle, day) {
    const checkboxes = document.querySelectorAll(`#edit-grid input[type="checkbox"][data-cycle="${cycle}"][data-day="${day}"]`);
    
    // Check if any are checked
    let anyChecked = false;
    checkboxes.forEach(cb => {
        if (cb.checked) {
            anyChecked = true;
        }
    });
    
    // Toggle all checkboxes - if any are checked, uncheck all; otherwise check all
    checkboxes.forEach(cb => {
        cb.checked = !anyChecked;
    });
}

// Add custom treatment to the grid
function addCustomTreatment() {
    const input = document.getElementById('new-treatment-name');
    const treatmentName = input.value.trim();
    
    if (!treatmentName) {
        alert('Please enter a treatment name');
        input.focus();
        return;
    }
    
    // Check if treatment already exists
    const existingDrugs = [...new Set(editedRegimenData.regimen.schedule.map(item => item.description))];
    if (existingDrugs.includes(treatmentName) || customTreatments.includes(treatmentName)) {
        alert('This treatment already exists');
        input.focus();
        return;
    }
    
    // Add to custom treatments list
    customTreatments.push(treatmentName);
    
    // Rebuild the grid
    const editGrid = document.getElementById('edit-grid');
    const gridHTML = buildEditGrid(editedRegimenData);
    editGrid.innerHTML = gridHTML;
    
    // Clear the input
    input.value = '';
    input.focus();
    
    // Scroll to the new row
    setTimeout(() => {
        const rows = editGrid.querySelectorAll('tbody tr');
        const lastRow = rows[rows.length - 1];
        if (lastRow) {
            lastRow.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
    }, 100);
}
// Configuration
const API_BASE_URL = 'http://localhost:3000/api';
let calendar;
let currentEvents = [];
let drugColorMap = {};

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
        const response = await fetch(`${API_BASE_URL}/regimens`);
        const regimens = await response.json();
        
        const select = document.getElementById('regimen-select');
        regimens.forEach(regimen => {
            const option = document.createElement('option');
            option.value = regimen.id;
            option.textContent = regimen.name;
            select.appendChild(option);
        });
    } catch (error) {
        console.error('Error loading regimens:', error);
        alert('Error loading regimens. Make sure the backend server is running.');
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
        const response = await fetch(`${API_BASE_URL}/regimen/${regimenId}`);
        const regimen = await response.json();
        
        let detailsHTML = `<h3>${regimen.name}</h3><p>${regimen.description}</p>`;
        
        if (regimen.schedule === 'weekdays') {
            detailsHTML += `<p><strong>Schedule:</strong> Monday-Friday for ${regimen.total_days} sessions</p>`;
        } else {
            detailsHTML += `<p><strong>Cycle length:</strong> ${regimen.cycle_days} days</p>`;
            detailsHTML += `<p><strong>Default cycles:</strong> ${regimen.total_cycles} (you can customize this below)</p>`;
            if (regimen.daily_medication) {
                detailsHTML += `<p><strong>Note:</strong> Includes daily medication</p>`;
            }
        }
        
        // Update cycle count placeholder with default
        document.getElementById('cycle-count').placeholder = `Default: ${regimen.total_cycles} cycles`;
        
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
    
    try {
        const response = await fetch(`${API_BASE_URL}/calculate-schedule`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(requestBody)
        });
        
        const data = await response.json();
        
        if (!response.ok) {
            throw new Error(data.error || 'Failed to generate schedule');
        }
        
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
        
        // Go to the start date
        calendar.gotoDate(startDate);
        
        // Show print button
        document.getElementById('print-btn').style.display = 'inline-block';
        
        // Add print header info for better printed output
        const calendarContainer = document.querySelector('.calendar-container');
        const regimenSelect = document.getElementById('regimen-select');
        const selectedRegimen = regimenSelect.options[regimenSelect.selectedIndex].text;
        calendarContainer.setAttribute('data-print-header', 
            `Treatment Schedule: ${selectedRegimen} - Starting ${startDate}`);
        
    } catch (error) {
        console.error('Error generating schedule:', error);
        alert('Error generating schedule. Make sure the backend server is running.');
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
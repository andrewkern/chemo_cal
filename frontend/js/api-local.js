// Local API implementation for static site deployment
// Replaces Flask backend API calls with client-side functions

// Get all available drug regimens
function getRegimens() {
    const regimensList = [];
    for (const [key, regimen] of Object.entries(DRUG_REGIMENS)) {
        regimensList.push({
            id: key,
            name: regimen.name,
            description: regimen.description
        });
    }
    return regimensList;
}

// Get details of a specific regimen
function getRegimenDetails(regimenId) {
    if (!(regimenId in DRUG_REGIMENS)) {
        throw new Error('Regimen not found');
    }
    return DRUG_REGIMENS[regimenId];
}

// Calculate treatment schedule based on regimen and start date
function calculateSchedule({ regimen_id, start_date, total_cycles, starting_cycle = 1 }) {
    if (!regimen_id || !start_date) {
        throw new Error('Missing required parameters');
    }

    if (!(regimen_id in DRUG_REGIMENS)) {
        throw new Error('Invalid regimen');
    }

    // Parse the start date
    const startDate = new Date(start_date);
    if (isNaN(startDate.getTime())) {
        throw new Error('Invalid date format');
    }

    // Validate custom cycles if provided
    if (total_cycles !== undefined && total_cycles !== null && total_cycles !== '') {
        const cycles = parseInt(total_cycles);
        if (isNaN(cycles) || cycles < 1 || cycles > 100) {
            throw new Error('Cycle count must be between 1 and 100');
        }
        total_cycles = cycles;
    }

    // Validate starting cycle
    const startCycle = parseInt(starting_cycle);
    if (isNaN(startCycle) || startCycle < 1 || startCycle > 101) {
        throw new Error('Starting cycle must be between 1 and 101');
    }

    const regimen = DRUG_REGIMENS[regimen_id];
    const events = [];

    // Use custom cycles if provided, otherwise use default
    const totalCycles = total_cycles || regimen.total_cycles;

    if (regimen.schedule === 'weekdays') {
        // Special handling for daily radiation
        let currentDate = new Date(startDate);
        let sessionCount = 0;
        while (sessionCount < regimen.total_days) {
            if (currentDate.getDay() >= 1 && currentDate.getDay() <= 5) { // Monday = 1, Friday = 5
                events.push({
                    date: formatDate(currentDate),
                    title: `Session ${sessionCount + 1}`,
                    description: regimen.description_template
                });
                sessionCount++;
            }
            currentDate.setDate(currentDate.getDate() + 1);
        }
    } else {
        // Handle cycle-based regimens
        for (let cycle = 0; cycle < totalCycles; cycle++) {
            // Calculate the actual cycle number (starting from starting_cycle)
            const actualCycleNumber = startCycle + cycle;
            const cycleStart = new Date(startDate);
            cycleStart.setDate(cycleStart.getDate() + (cycle * regimen.cycle_days));

            for (const scheduleItem of regimen.schedule) {
                // Check if this item should occur in this cycle
                let shouldInclude = false;
                if (!scheduleItem.cycles) {
                    // No cycles specified, include in all cycles
                    shouldInclude = true;
                } else if (scheduleItem.cycles === 'all') {
                    // Explicitly include in all cycles
                    shouldInclude = true;
                } else if (Array.isArray(scheduleItem.cycles)) {
                    // Include only if actual cycle number is in the list
                    shouldInclude = scheduleItem.cycles.includes(actualCycleNumber);
                }

                if (shouldInclude) {
                    const eventDate = new Date(cycleStart);
                    eventDate.setDate(eventDate.getDate() + scheduleItem.day - 1);
                    
                    const event = {
                        date: formatDate(eventDate),
                        title: scheduleItem.description,
                        description: `Cycle ${actualCycleNumber}, Day ${scheduleItem.day}`,
                        drug_name: scheduleItem.description
                    };
                    
                    // Add type if specified
                    if (scheduleItem.type) {
                        event.type = scheduleItem.type;
                        if (scheduleItem.type === 'rest') {
                            event.title = 'Rest Day';
                        }
                    }
                    events.push(event);
                }
            }

            // Add daily medication reminders if applicable
            if (regimen.daily_medication) {
                const scheduleDays = regimen.schedule.map(s => s.day);
                for (let day = 1; day <= regimen.cycle_days; day++) {
                    if (!scheduleDays.includes(day)) {
                        const medDate = new Date(cycleStart);
                        medDate.setDate(medDate.getDate() + day - 1);
                        events.push({
                            date: formatDate(medDate),
                            title: 'Daily medication',
                            description: `Cycle ${actualCycleNumber}, Day ${day} - Take prescribed medication`,
                            type: 'medication'
                        });
                    }
                }
            }
        }
    }

    return {
        regimen: regimen,
        regimen_name: regimen.name,
        start_date: start_date,
        starting_cycle: startCycle,
        total_cycles: totalCycles,
        events: events.sort((a, b) => a.date.localeCompare(b.date))
    };
}

// Calculate treatment schedule based on custom edited regimen data
function calculateScheduleCustom({ regimen_data, start_date, total_cycles, starting_cycle = 1 }) {
    if (!regimen_data || !start_date) {
        throw new Error('Missing required parameters');
    }

    // Parse the start date
    const startDate = new Date(start_date);
    if (isNaN(startDate.getTime())) {
        throw new Error('Invalid date format');
    }

    // Validate custom cycles if provided
    if (total_cycles !== undefined && total_cycles !== null && total_cycles !== '') {
        const cycles = parseInt(total_cycles);
        if (isNaN(cycles) || cycles < 1 || cycles > 100) {
            throw new Error('Cycle count must be between 1 and 100');
        }
        total_cycles = cycles;
    }

    // Validate starting cycle
    const startCycle = parseInt(starting_cycle);
    if (isNaN(startCycle) || startCycle < 1 || startCycle > 101) {
        throw new Error('Starting cycle must be between 1 and 101');
    }

    const events = [];

    // Use custom cycles if provided, otherwise use regimen default
    const totalCycles = total_cycles || regimen_data.total_cycles || 1;

    // Update the regimen data with the actual total cycles used
    regimen_data.total_cycles = totalCycles;

    // Handle cycle-based regimens
    for (let cycle = 0; cycle < totalCycles; cycle++) {
        // Calculate the actual cycle number (starting from starting_cycle)
        const actualCycleNumber = startCycle + cycle;
        const cycleStart = new Date(startDate);
        cycleStart.setDate(cycleStart.getDate() + (cycle * regimen_data.cycle_days));

        for (const scheduleItem of regimen_data.schedule) {
            // Check if this item should occur in this cycle
            let shouldInclude = false;
            if (!scheduleItem.cycles) {
                // No cycles specified, include in all cycles
                shouldInclude = true;
            } else if (scheduleItem.cycles === 'all') {
                // Explicitly include in all cycles
                shouldInclude = true;
            } else if (Array.isArray(scheduleItem.cycles)) {
                // Include only if actual cycle number is in the list
                shouldInclude = scheduleItem.cycles.includes(actualCycleNumber);
            }

            if (shouldInclude) {
                const eventDate = new Date(cycleStart);
                eventDate.setDate(eventDate.getDate() + scheduleItem.day - 1);
                
                const event = {
                    date: formatDate(eventDate),
                    title: scheduleItem.description,
                    description: `Cycle ${actualCycleNumber}, Day ${scheduleItem.day}`,
                    drug_name: scheduleItem.description
                };
                
                // Add type if specified
                if (scheduleItem.type) {
                    event.type = scheduleItem.type;
                    if (scheduleItem.type === 'rest') {
                        event.title = 'Rest Day';
                    }
                }
                events.push(event);
            }
        }
    }

    return {
        regimen: regimen_data,
        start_date: start_date,
        starting_cycle: startCycle,
        total_cycles: totalCycles,
        events: events.sort((a, b) => a.date.localeCompare(b.date))
    };
}

// Helper function to format date as YYYY-MM-DD
function formatDate(date) {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
}
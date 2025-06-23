// Static drug regimens data
const DRUG_REGIMENS = {
    "Pola-R-CHP (Polatuzumab, Rituximab, Cyclophosphamide, Doxorubicin, Prednisone)": {
        "name": "Pola-R-CHP Regimen",
        "description": "Polatuzumab, Rituximab, Cyclophosphamide, Doxorubicin, Prednisone",
        "schedule": [
            {"day": 1, "description": "Polatuzumab", "cycles": [1, 2, 3, 4, 5, 6]},
            {"day": 1, "description": "Prednisone", "cycles": [1, 2, 3, 4, 5, 6]},
            {"day": 2, "description": "Prednisone", "cycles": [1, 2, 3, 4, 5, 6]},
            {"day": 3, "description": "Prednisone", "cycles": [1, 2, 3, 4, 5, 6]},
            {"day": 4, "description": "Prednisone", "cycles": [1, 2, 3, 4, 5, 6]},
            {"day": 5, "description": "Prednisone", "cycles": [1, 2, 3, 4, 5, 6]},
            {"day": 1, "description": "Cyclophosohamide", "cycles": [1, 2, 3, 4, 5, 6]},
            {"day": 1, "description": "Doxorubicin", "cycles": [1, 2, 3, 4, 5, 6]},
            {"day": 1, "description": "Rituximab", "cycles": [1, 2, 3, 4, 5, 6, 7, 8]},
        ],
        "cycle_days": 21,
        "total_cycles": 8,
    },
    "AmiCarboPem (Amivantimab, Carboplatin, Pemetrexed)": {
        "name": "AmiCarboPem Regimen",
        "description": "Amivantimab, Carboplatin, Pemetrexed",
        "schedule": [
            {"day": 1, "description": "Amivantimab", "cycles": [1, 2, 3, 4, 5, 6]},
            {"day": 8, "description": "Amivantimab", "cycles": [1]},
            {"day": 15, "description": "Amivantimab", "cycles": [1]},
            {"day": 1, "description": "Carboplatin", "cycles": [1, 2, 3, 4]},
            {"day": 1, "description": "Pemetrexed", "cycles": [1, 2, 3, 4, 5, 6]},
        ],
        "cycle_days": 21,
        "total_cycles": 6,
    },
    "DVd (Darzalex, Velcade, dexamethasone)": {
        "name": "DVd Regimen",
        "description": "Darzalex, Velcade, and dexamethasone regimen",
        "schedule": [
            {"day": 1, "description": "Darzalex", "cycles": [1, 2, 3, 4, 5, 6, 7, 8]},
            {"day": 8, "description": "Darzalex", "cycles": [1, 2, 3]},
            {"day": 15, "description": "Darzalex", "cycles": [1, 2, 3]},
            {"day": 1, "description": "Velcade", "cycles": [1, 2, 3, 4, 5, 6, 7, 8]},
            {"day": 4, "description": "Velcade", "cycles": [1, 2, 3, 4, 5, 6, 7, 8]},
            {"day": 8, "description": "Velcade", "cycles": [1, 2, 3, 4, 5, 6, 7, 8]},
            {"day": 11, "description": "Velcade", "cycles": [1, 2, 3, 4, 5, 6, 7, 8]},
            {
                "day": 1,
                "description": "Dexamethasone",
                "cycles": [1, 2, 3, 4, 5, 6, 7, 8],
            },
            {
                "day": 2,
                "description": "Dexamethasone",
                "cycles": [1, 2, 3, 4, 5, 6, 7, 8],
            },
            {
                "day": 4,
                "description": "Dexamethasone",
                "cycles": [1, 2, 3, 4, 5, 6, 7, 8],
            },
            {
                "day": 5,
                "description": "Dexamethasone",
                "cycles": [1, 2, 3, 4, 5, 6, 7, 8],
            },
            {
                "day": 8,
                "description": "Dexamethasone",
                "cycles": [1, 2, 3, 4, 5, 6, 7, 8],
            },
            {
                "day": 9,
                "description": "Dexamethasone",
                "cycles": [1, 2, 3, 4, 5, 6, 7, 8],
            },
            {
                "day": 11,
                "description": "Dexamethasone",
                "cycles": [1, 2, 3, 4, 5, 6, 7, 8],
            },
            {
                "day": 12,
                "description": "Dexamethasone",
                "cycles": [1, 2, 3, 4, 5, 6, 7, 8],
            },
        ],
        "cycle_days": 21,
        "total_cycles": 8,
    }
};

// List of additional regimen JSON files to load
const REGIMEN_JSON_FILES = [
    'ac-d-gcsf.json',
    'ac-t-gcsf.json',
    'atezolizumab-carboplatin-etoposide.json',
    'azacitadine-venetoclax.json',
    'carboplatin-docetaxel-dcb.json',
    'carboplatin-paclitaxel-radiation-therapy.json',
    'carboplatin-radiation-therapy-weekly.json',
    'cisplatin-radiation-therapy-weekly.json',
    'ddac-d-gcsf.json',
    'ddac-t-gcsf.json',
    'dexamethasone-premedication-docetaxel.json',
    'dexamethasone-premedication-pemetrexed-1.json',
    'dvd-simplified.json',
    'AC-D_GCSF.json',
    'AC-T_GCSF.json',
    'AmiCarboPem.json',
    'AmiCarboPem_2.json',
    'CP-AC.json',
    'DVd.json',
    'FOLFIRINOX.json',
    'Pola-R-CHP.json',
    'R-CHOP.json',
    'ddAC-D_GCSF.json',
    'ddAC-T_GCSF.json',
    'mini-RCHOP.json'
];

// Load additional regimens from JSON files
async function loadAdditionalRegimens() {
    console.log('Starting to load additional regimens...');
    let loadedCount = 0;
    
    for (const filename of REGIMEN_JSON_FILES) {
        try {
            // Use relative path from JS file location
            const url = `../data/${filename}`;
            console.log(`Attempting to load: ${url}`);
            const response = await fetch(url);
            if (response.ok) {
                const data = await response.json();
                // Merge the loaded regimen into DRUG_REGIMENS
                Object.assign(DRUG_REGIMENS, data);
                loadedCount++;
                console.log(`Loaded ${filename}`);
            } else {
                console.warn(`Failed to load ${filename}: ${response.status}`);
            }
        } catch (error) {
            console.warn(`Could not load ${filename}:`, error);
        }
    }
    console.log(`Loaded ${loadedCount} additional regimens. Total: ${Object.keys(DRUG_REGIMENS).length}`);
}

// Initialize regimens when the module loads
loadAdditionalRegimens();
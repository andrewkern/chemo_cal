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
    'ac-regimen.json',
    'bep-regimen.json',
    'cabazitaxel-prednisone-regimen.json',
    'carbo-taxol-regimen.json',
    'dd-mvac-regimen.json',
    'enfortumab-vedotin-pembrolizumab-regimen.json',
    'folfiri-regimen.json',
    'folfox-regimen.json',
    'gem-cis-regimen.json',
    'nivolumab-regimen.json',
    'r-chop-regimen.json',
    'r-dhap-regimen.json',
    'radiation-therapy-regimen.json',
    'tc-regimen.json'
];

// Load additional regimens from JSON files
async function loadAdditionalRegimens() {
    for (const filename of REGIMEN_JSON_FILES) {
        try {
            const response = await fetch(`../backend/new_jsons/${filename}`);
            if (response.ok) {
                const data = await response.json();
                // Merge the loaded regimen into DRUG_REGIMENS
                Object.assign(DRUG_REGIMENS, data);
            }
        } catch (error) {
            console.warn(`Could not load ${filename}:`, error);
        }
    }
}

// Initialize regimens when the module loads
loadAdditionalRegimens();
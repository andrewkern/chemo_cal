#!/usr/bin/env python3
"""
Maintenance script to build a combined regimens JavaScript file
from backend hardcoded regimens and JSON files
"""

import json
import os
import re
from pathlib import Path

def extract_hardcoded_regimens():
    """Extract hardcoded regimens from backend/app.py"""
    regimens = {}
    
    with open('backend/app.py', 'r') as f:
        content = f.read()
    
    # Find the DRUG_REGIMENS dictionary in the Python file
    match = re.search(r'DRUG_REGIMENS = {(.*?)^}', content, re.DOTALL | re.MULTILINE)
    if match:
        # This is a simplified extraction - in practice we'd need to parse the Python dict
        # For now, we'll just manually copy the three hardcoded ones
        regimens["Pola-R-CHP (Polatuzumab, Rituximab, Cyclophosphamide, Doxorubicin, Prednisone)"] = {
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
        }
        
        regimens["AmiCarboPem (Amivantimab, Carboplatin, Pemetrexed)"] = {
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
        }
        
        regimens["DVd (Darzalex, Velcade, dexamethasone)"] = {
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
                {"day": 1, "description": "Dexamethasone", "cycles": [1, 2, 3, 4, 5, 6, 7, 8]},
                {"day": 2, "description": "Dexamethasone", "cycles": [1, 2, 3, 4, 5, 6, 7, 8]},
                {"day": 4, "description": "Dexamethasone", "cycles": [1, 2, 3, 4, 5, 6, 7, 8]},
                {"day": 5, "description": "Dexamethasone", "cycles": [1, 2, 3, 4, 5, 6, 7, 8]},
                {"day": 8, "description": "Dexamethasone", "cycles": [1, 2, 3, 4, 5, 6, 7, 8]},
                {"day": 9, "description": "Dexamethasone", "cycles": [1, 2, 3, 4, 5, 6, 7, 8]},
                {"day": 11, "description": "Dexamethasone", "cycles": [1, 2, 3, 4, 5, 6, 7, 8]},
                {"day": 12, "description": "Dexamethasone", "cycles": [1, 2, 3, 4, 5, 6, 7, 8]},
            ],
            "cycle_days": 21,
            "total_cycles": 8,
        }
    
    return regimens

def load_json_regimens():
    """Load all regimens from backend/drug_json directory"""
    regimens = {}
    json_dir = Path('backend/drug_json')
    
    if not json_dir.exists():
        print(f"Warning: {json_dir} does not exist")
        return regimens
    
    for json_file in json_dir.glob('*.json'):
        try:
            with open(json_file, 'r') as f:
                data = json.load(f)
                regimens.update(data)
                print(f"Loaded {json_file.name}")
        except Exception as e:
            print(f"Error loading {json_file}: {e}")
    
    return regimens

def generate_javascript_file(all_regimens):
    """Generate the combined JavaScript file"""
    output = """// Auto-generated file containing all drug regimens
// Generated by build-regimens.py - DO NOT EDIT MANUALLY

const ALL_DRUG_REGIMENS = """
    
    output += json.dumps(all_regimens, indent=2)
    output += """;\n
// Export for use in app
const DRUG_REGIMENS = ALL_DRUG_REGIMENS;

// No need for async loading anymore
async function loadAdditionalRegimens() {
    console.log(`All ${Object.keys(DRUG_REGIMENS).length} regimens are already loaded.`);
    return Promise.resolve();
}
"""
    
    return output

def main():
    print("Building combined regimens file...")
    
    # Get hardcoded regimens
    hardcoded = extract_hardcoded_regimens()
    print(f"Found {len(hardcoded)} hardcoded regimens")
    
    # Get JSON regimens
    json_regimens = load_json_regimens()
    print(f"Found {len(json_regimens)} JSON regimens")
    
    # Combine them (JSON regimens will override hardcoded if there are duplicates)
    all_regimens = {**hardcoded, **json_regimens}
    print(f"Total unique regimens: {len(all_regimens)}")
    
    # Generate JavaScript file
    js_content = generate_javascript_file(all_regimens)
    
    # Write to file
    output_path = Path('frontend/js/all-regimens.js')
    with open(output_path, 'w') as f:
        f.write(js_content)
    
    print(f"Generated {output_path}")
    print("\nNext steps:")
    print("1. Update frontend/index.html to load all-regimens.js instead of regimens-data.js")
    print("2. Commit and push the changes")

if __name__ == "__main__":
    main()
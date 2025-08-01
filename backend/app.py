from flask import Flask, jsonify, request
from flask_cors import CORS
from datetime import datetime, timedelta
from dateutil.relativedelta import relativedelta
import json
import os
import glob

app = Flask(__name__)
CORS(app)


def load_regimens_from_json():
    """Load drug regimens from JSON files in the drug_json directory"""
    regimens = {}
    json_dir = os.path.join(os.path.dirname(__file__), "drug_json")

    # Check if directory exists
    if not os.path.exists(json_dir):
        print(f"Warning: {json_dir} directory not found")
        return regimens

    # Load all JSON files
    json_files = glob.glob(os.path.join(json_dir, "*.json"))

    for json_file in json_files:
        try:
            with open(json_file, "r") as f:
                data = json.load(f)
                # Each JSON file contains a single regimen with its key
                regimens.update(data)
                print(f"Loaded regimen from {os.path.basename(json_file)}")
        except Exception as e:
            print(f"Error loading {json_file}: {e}")

    return regimens


# Sample drug regimens with their schedules
DRUG_REGIMENS = {
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
    },
}

# Load regimens from JSON files and merge with hardcoded ones
loaded_regimens = load_regimens_from_json()
DRUG_REGIMENS.update(loaded_regimens)
print(f"Total regimens available: {len(DRUG_REGIMENS)}")


@app.route("/api/regimens", methods=["GET"])
def get_regimens():
    """Get all available drug regimens"""
    regimens_list = []
    for key, regimen in DRUG_REGIMENS.items():
        regimens_list.append(
            {"id": key, "name": regimen["name"], "description": regimen["description"]}
        )
    return jsonify(regimens_list)


@app.route("/api/regimen/<regimen_id>", methods=["GET"])
def get_regimen_details(regimen_id):
    """Get details of a specific regimen"""
    if regimen_id not in DRUG_REGIMENS:
        return jsonify({"error": "Regimen not found"}), 404
    return jsonify(DRUG_REGIMENS[regimen_id])


@app.route("/api/calculate-schedule", methods=["POST"])
def calculate_schedule():
    """Calculate treatment schedule based on regimen and start date"""
    data = request.json
    regimen_id = data.get("regimen_id")
    start_date_str = data.get("start_date")
    custom_cycles = data.get("total_cycles")  # Optional custom cycle count
    starting_cycle = data.get(
        "starting_cycle", 1
    )  # Optional starting cycle (default 1)

    if not regimen_id or not start_date_str:
        return jsonify({"error": "Missing required parameters"}), 400

    if regimen_id not in DRUG_REGIMENS:
        return jsonify({"error": "Invalid regimen"}), 400

    try:
        start_date = datetime.strptime(start_date_str, "%Y-%m-%d")
    except ValueError:
        return jsonify({"error": "Invalid date format"}), 400

    # Validate custom cycles if provided
    if custom_cycles is not None:
        try:
            custom_cycles = int(custom_cycles)
            if custom_cycles < 1 or custom_cycles > 100:
                return jsonify({"error": "Cycle count must be between 1 and 100"}), 400
        except (ValueError, TypeError):
            return jsonify({"error": "Invalid cycle count"}), 400

    # Validate starting cycle if provided
    try:
        starting_cycle = int(starting_cycle)
        if starting_cycle < 1 or starting_cycle > 101:
            return jsonify({"error": "Starting cycle must be between 1 and 101"}), 400
    except (ValueError, TypeError):
        return jsonify({"error": "Invalid starting cycle"}), 400

    regimen = DRUG_REGIMENS[regimen_id]
    events = []

    # Use custom cycles if provided, otherwise use default
    total_cycles = (
        custom_cycles if custom_cycles is not None else regimen["total_cycles"]
    )

    if regimen["schedule"] == "weekdays":
        # Special handling for daily radiation
        current_date = start_date
        session_count = 0
        while session_count < regimen["total_days"]:
            if current_date.weekday() < 5:  # Monday = 0, Friday = 4
                events.append(
                    {
                        "date": current_date.strftime("%Y-%m-%d"),
                        "title": f"Session {session_count + 1}",
                        "description": regimen["description_template"],
                    }
                )
                session_count += 1
            current_date += timedelta(days=1)
    else:
        # Handle cycle-based regimens
        for cycle in range(total_cycles):
            # Calculate the actual cycle number (starting from starting_cycle)
            actual_cycle_number = starting_cycle + cycle
            cycle_start = start_date + timedelta(days=cycle * regimen["cycle_days"])

            for schedule_item in regimen["schedule"]:
                # Check if this item should occur in this cycle
                should_include = False
                if "cycles" not in schedule_item:
                    # No cycles specified, include in all cycles (backwards compatibility)
                    should_include = True
                elif schedule_item["cycles"] == "all":
                    # Explicitly include in all cycles
                    should_include = True
                elif isinstance(schedule_item["cycles"], list):
                    # Include only if actual cycle number is in the list (1-based)
                    should_include = actual_cycle_number in schedule_item["cycles"]

                if should_include:
                    event_date = cycle_start + timedelta(days=schedule_item["day"] - 1)
                    event = {
                        "date": event_date.strftime("%Y-%m-%d"),
                        "title": schedule_item["description"],  # Use drug name as title
                        "description": f"Cycle {actual_cycle_number}, Day {schedule_item['day']}",
                        "drug_name": schedule_item[
                            "description"
                        ],  # Track drug name for coloring
                    }
                    # Add type if specified (e.g., 'rest' for rest days)
                    if "type" in schedule_item:
                        event["type"] = schedule_item["type"]
                        if schedule_item["type"] == "rest":
                            event["title"] = "Rest Day"
                    events.append(event)

            # Add daily medication reminders if applicable
            if regimen.get("daily_medication"):
                for day in range(1, regimen["cycle_days"] + 1):
                    if day not in [s["day"] for s in regimen["schedule"]]:
                        med_date = cycle_start + timedelta(days=day - 1)
                        events.append(
                            {
                                "date": med_date.strftime("%Y-%m-%d"),
                                "title": "Daily medication",
                                "description": f"Cycle {actual_cycle_number}, Day {day} - Take prescribed medication",
                                "type": "medication",
                            }
                        )

    return jsonify(
        {
            "regimen": regimen,
            "regimen_name": regimen["name"],
            "start_date": start_date_str,
            "starting_cycle": starting_cycle,
            "total_cycles": total_cycles,
            "events": sorted(events, key=lambda x: x["date"]),
        }
    )


@app.route("/api/calculate-schedule-custom", methods=["POST"])
def calculate_schedule_custom():
    """Calculate treatment schedule based on custom edited regimen data"""
    data = request.json
    regimen_data = data.get("regimen_data")
    start_date_str = data.get("start_date")
    custom_cycles = data.get("total_cycles")
    starting_cycle = data.get(
        "starting_cycle", 1
    )  # Optional starting cycle (default 1)

    if not regimen_data or not start_date_str:
        return jsonify({"error": "Missing required parameters"}), 400

    try:
        start_date = datetime.strptime(start_date_str, "%Y-%m-%d")
    except ValueError:
        return jsonify({"error": "Invalid date format"}), 400

    # Validate custom cycles if provided
    if custom_cycles is not None:
        try:
            custom_cycles = int(custom_cycles)
            if custom_cycles < 1 or custom_cycles > 100:
                return jsonify({"error": "Cycle count must be between 1 and 100"}), 400
        except (ValueError, TypeError):
            return jsonify({"error": "Invalid cycle count"}), 400

    # Validate starting cycle if provided
    try:
        starting_cycle = int(starting_cycle)
        if starting_cycle < 1 or starting_cycle > 101:
            return jsonify({"error": "Starting cycle must be between 1 and 101"}), 400
    except (ValueError, TypeError):
        return jsonify({"error": "Invalid starting cycle"}), 400

    events = []

    # Use custom cycles if provided, otherwise use regimen default
    total_cycles = (
        custom_cycles
        if custom_cycles is not None
        else regimen_data.get("total_cycles", 1)
    )

    # Update the regimen data with the actual total cycles used
    regimen_data["total_cycles"] = total_cycles

    # Handle cycle-based regimens
    for cycle in range(total_cycles):
        # Calculate the actual cycle number (starting from starting_cycle)
        actual_cycle_number = starting_cycle + cycle
        cycle_start = start_date + timedelta(days=cycle * regimen_data["cycle_days"])

        for schedule_item in regimen_data["schedule"]:
            # Check if this item should occur in this cycle
            should_include = False
            if "cycles" not in schedule_item:
                # No cycles specified, include in all cycles
                should_include = True
            elif schedule_item["cycles"] == "all":
                # Explicitly include in all cycles
                should_include = True
            elif isinstance(schedule_item["cycles"], list):
                # Include only if actual cycle number is in the list (1-based)
                should_include = actual_cycle_number in schedule_item["cycles"]

            if should_include:
                event_date = cycle_start + timedelta(days=schedule_item["day"] - 1)
                event = {
                    "date": event_date.strftime("%Y-%m-%d"),
                    "title": schedule_item["description"],
                    "description": f"Cycle {actual_cycle_number}, Day {schedule_item['day']}",
                    "drug_name": schedule_item["description"],
                }
                # Add type if specified
                if "type" in schedule_item:
                    event["type"] = schedule_item["type"]
                    if schedule_item["type"] == "rest":
                        event["title"] = "Rest Day"
                events.append(event)

    return jsonify(
        {
            "regimen": regimen_data,
            "start_date": start_date_str,
            "starting_cycle": starting_cycle,
            "total_cycles": total_cycles,
            "events": sorted(events, key=lambda x: x["date"]),
        }
    )


@app.route("/", methods=["GET"])
def index():
    """Root endpoint with API information"""
    return jsonify(
        {
            "message": "Drug Regimen Calendar API",
            "version": "1.0",
            "endpoints": {
                "GET /api/health": "Health check",
                "GET /api/regimens": "List all drug regimens",
                "GET /api/regimen/<id>": "Get specific regimen details",
                "POST /api/calculate-schedule": "Calculate treatment schedule",
                "POST /api/calculate-schedule-custom": "Calculate schedule with custom regimen",
            },
        }
    )


@app.route("/api/health", methods=["GET"])
def health_check():
    """Health check endpoint"""
    return jsonify({"status": "healthy"})


if __name__ == "__main__":
    app.run(debug=True, port=3000)

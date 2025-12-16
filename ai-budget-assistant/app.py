from flask import Flask, request, jsonify
from flask_cors import CORS
import pandas as pd
import numpy as np

app = Flask(__name__)
CORS(app)

@app.route('/')
def home():
    return "SHUBAKAR AI Budget Assistant is Running"

@app.route('/predict-budget', methods=['POST'])
def predict_budget():
    data = request.json
    
    event_type = data.get('event_type', 'Other')
    guests = int(data.get('guests', 0))
    total_budget = float(data.get('budget', 0))
    location = data.get('location', 'Generic')
    
    # Simple Rule-based Logic (Mocking the ML model for now)
    # Ratios based on typical Indian wedding/event data
    ratios = {
        'Wedding': {'Venue': 0.4, 'Catering': 0.3, 'Decor': 0.15, 'Photography': 0.1, 'Entertainment': 0.05},
        'Birthday': {'Venue': 0.2, 'Catering': 0.4, 'Decor': 0.2, 'Photography': 0.1, 'Entertainment': 0.1},
        'Corporate': {'Venue': 0.5, 'Catering': 0.3, 'Decor': 0.05, 'Photography': 0.05, 'Entertainment': 0.1},
        'Other': {'Venue': 0.3, 'Catering': 0.3, 'Decor': 0.2, 'Photography': 0.1, 'Entertainment': 0.1}
    }
    
    selected_ratios = ratios.get(event_type, ratios['Other'])
    
    # Adjust based on guest count (Mock logic)
    logging_factor = 1.0
    if guests > 500:
        logging_factor = 1.1 # 10% premium for large scale logistics
    
    estimated_total = total_budget 
    if total_budget == 0:
        # Estimate based on guests if no budget given
        avg_cost_per_head = 1000 # INR
        if event_type == 'Wedding': avg_cost_per_head = 2500
        estimated_total = guests * avg_cost_per_head * logging_factor

    breakdown = {}
    for category, ratio in selected_ratios.items():
        breakdown[category] = int(estimated_total * ratio)

    response = {
        "status": "success",
        "input": {
            "event_type": event_type,
            "guests": guests,
            "budget": total_budget
        },
        "estimated_total": int(estimated_total),
        "breakdown": breakdown,
        "message": "Budget estimation calculated based on market standards.",
        "warnings": []
    }
    
    if guests > 1000 and total_budget > 0 and total_budget < 500000:
        response['warnings'].append("Budget might be too low for the guest count.")

    return jsonify(response)

if __name__ == '__main__':
    app.run(port=5001, debug=True)

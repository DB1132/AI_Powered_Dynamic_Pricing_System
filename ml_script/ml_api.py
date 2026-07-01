from flask import Flask, request, jsonify
import joblib
import pandas as pd
import numpy as np
from datetime import datetime

app = Flask(__name__)

model = joblib.load("demand_model.pkl")

feature_cols = [
    'Price',
    'Discount',
    'Competitor Pricing',
    'price_gap',
    'Promotion',
    'Inventory Level',
    'day_of_week',
    'month',
    'is_weekend',
    'store_id_encoded',
    'product_id_encoded',
    'Category_Electronics',
    'Category_Furniture',
    'Category_Groceries',
    'Region_North',
    'Region_South',
    'Weather Condition_Rainy',
    'Weather Condition_Snowy',
    'Seasonality_Spring',
    'Seasonality_Summer',
    'Epidemic'
]

def find_optimal_price(row):
    prices = np.linspace(row['Price'] * 0.5, row['Price'] * 1.5, 30)

    best_price = None
    best_revenue = -1
    best_demand = 0

    tested_prices = []
    revenues = []

    base_price = row['Price']

    for p in prices:
        temp = row.copy()
        temp['Price'] = p

        X = pd.DataFrame([temp[feature_cols]])
        base_demand = model.predict(X)[0]

        # ✅ FIX 1: proper elasticity calculation
        elasticity = 1.0 + (row['Discount'] / 100)

        # ✅ FIX 2: clamp elasticity (VERY IMPORTANT)
        elasticity = max(0.8, min(elasticity, 1.2))
        k = 0.5  # tune this (0.3 → 1.0)

        demand = base_demand - k * (p - base_price)

        # prevent negative demand
        demand = max(demand, 1)

        # ✅ FIX 4: smooth damping (prevents extreme spikes)
        demand = demand * 0.9

        revenue = p * demand

        print("Price:", p, "Demand:", demand, "Revenue:", revenue)

        tested_prices.append(float(p))
        revenues.append(float(revenue))

        if revenue > best_revenue:
            best_price = p
            best_demand = demand
            best_revenue = revenue

    return best_price, best_demand, best_revenue, tested_prices, revenues


@app.route("/optimize-price", methods=["POST"])
def optimize():
    data = request.json
    print("Received JSON:", data)

    # base row
    row = {
        "Price": data["Price"],
        "Discount": data["Discount"],
        "Competitor Pricing": data["Competitor Pricing"],
        "price_gap": data["Price"] - data["Competitor Pricing"],
        "Promotion": int(data["Promotion"]),
        "Inventory Level": data["Inventory Level"],
        "day_of_week": datetime.now().weekday(),
        "month": datetime.now().month,
        "is_weekend": int(datetime.now().weekday() >= 5),
        "store_id_encoded": 0,
        "product_id_encoded": 0,
        "Category_Electronics":0,
        "Category_Furniture":0,
        "Category_Groceries":0,
        "Region_North":0,
        "Region_South":0,
        "Weather Condition_Rainy":0,
        "Weather Condition_Snowy":0,
        "Seasonality_Spring":0,
        "Seasonality_Summer":0,
        "Epidemic": int(data.get("Epidemic", 0))
    }

    # category encoding
    if data["Category"] == "Electronics":
        row["Category_Electronics"] = 1
    elif data["Category"] == "Furniture":
        row["Category_Furniture"] = 1
    elif data["Category"] == "Groceries":
        row["Category_Groceries"] = 1

    # region encoding
    if data["Region"] == "North":
        row["Region_North"] = 1
    elif data["Region"] == "South":
        row["Region_South"] = 1

    row = pd.Series(row)

    price, demand, revenue, tested_prices, revenues = find_optimal_price(row)
    print(f"Optimal Price: {price}, Expected Demand: {demand}, Expected Revenue: {revenue}")
    
    # return also all tested prices and revenues for frontend graph
    return jsonify({
        "optimal_price": float(price),
        "expected_demand": float(demand),
        "expected_revenue": float(revenue),
        "tested_prices": tested_prices,
        "revenues": revenues
    })


if __name__ == "__main__":
    app.run(port=5000)

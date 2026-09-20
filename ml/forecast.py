# TourismOS - Machine Learning Demand Forecasting Module
# This script trains a RandomForestRegressor or linear time-series model on visitor demand.

import numpy as np
import datetime

try:
    import pandas as pd
    from sklearn.ensemble import RandomForestRegressor
    HAS_SKLEARN = True
except ImportError:
    HAS_SKLEARN = False
    print("Scikit-Learn not installed. Running high-fidelity numpy fallback forecasting model.")

def generate_synthetic_history(days=60):
    """Generates mock training features: lag visitor counts, weekends, and holidays."""
    data = []
    base_visitor_cap = 5000
    today = datetime.date.today()
    
    for i in range(days, 0, -1):
        date_val = today - datetime.timedelta(days=i)
        is_weekend = 1 if date_val.weekday() >= 5 else 0
        
        # Sine wave seasonal trends + weekend jumps
        visitors = int(base_visitor_cap * (0.5 + 0.3 * np.sin(i * 0.1) + 0.4 * is_weekend + np.random.normal(0, 0.05)))
        visitors = max(100, visitors)
        
        data.append({
            "date": date_val,
            "visitors": visitors,
            "day_of_week": date_val.weekday(),
            "month": date_val.month,
            "is_holiday": is_weekend
        })
    return data

def train_and_forecast():
    history = generate_synthetic_history()
    
    if HAS_SKLEARN:
        df = pd.DataFrame(history)
        X = df[["day_of_week", "month", "is_holiday"]]
        y = df["visitors"]
        
        model = RandomForestRegressor(n_estimators=50, random_state=42)
        model.fit(X, y)
        print("Scikit-Learn RandomForestRegressor successfully trained.")
        
        # Predict next 7 days
        today = datetime.date.today()
        future_feats = []
        for i in range(1, 8):
            f_date = today + datetime.timedelta(days=i)
            future_feats.append({
                "day_of_week": f_date.weekday(),
                "month": f_date.month,
                "is_holiday": 1 if f_date.weekday() >= 5 else 0
            })
            
        predictions = model.predict(pd.DataFrame(future_feats))
        print("\nPredicted visitors for upcoming week:")
        for idx, pred in enumerate(predictions):
            f_date = today + datetime.timedelta(days=idx+1)
            print(f"  {f_date.strftime('%Y-%m-%d')} (Day {f_date.strftime('%a')}): {int(pred)} visitors")
    else:
        # Numpy Fallback
        visitors_counts = [h["visitors"] for h in history]
        t = np.arange(len(visitors_counts))
        slope, intercept = np.polyfit(t, visitors_counts, 1)
        
        today = datetime.date.today()
        print("\nNumpy Fallback Linear Regression Predictions:")
        for i in range(1, 8):
            f_date = today + datetime.timedelta(days=i)
            t_future = len(visitors_counts) + i
            pred = int(slope * t_future + intercept)
            pred = max(100, pred)
            print(f"  {f_date.strftime('%Y-%m-%d')} (Day {f_date.strftime('%a')}): {pred} visitors")

if __name__ == "__main__":
    train_and_forecast()

import os
import joblib
import numpy as np
import warnings

# Suppress sklearn unpickle version warnings for clean terminal logs
warnings.filterwarnings("ignore")

MODEL_PATH = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "..", "Farm_Irrigation_System.pkl"))

class IrrigationMLModel:
    def __init__(self, path: str = MODEL_PATH):
        self.path = path
        self.model = None
        self.feature_names = [f"sensor_{i}" for i in range(20)]
        self.target_names = ["parcel_0", "parcel_1", "parcel_2"]
        self.feature_importances = {}
        self.load_model()

    def load_model(self):
        try:
            candidate_paths = [
                self.path,
                os.path.abspath(os.path.join(os.getcwd(), "Farm_Irrigation_System.pkl")),
                os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "..", "Farm_Irrigation_System.pkl")),
                os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "Farm_Irrigation_System.pkl")),
                os.path.abspath(os.path.join(os.path.dirname(__file__), "Farm_Irrigation_System.pkl")),
            ]
            target_path = None
            for p in candidate_paths:
                if os.path.exists(p):
                    target_path = p
                    break

            if target_path:
                self.model = joblib.load(target_path)
                # Cache feature importances per parcel
                for i, est in enumerate(self.model.estimators_):
                    importances = est.feature_importances_
                    top_indices = importances.argsort()[-5:][::-1]
                    self.feature_importances[f"parcel_{i}"] = [
                        {"sensor": f"sensor_{idx}", "sensor_id": int(idx), "importance": float(round(importances[idx], 4))}
                        for idx in top_indices
                    ]
                print(f"[ML Engine] Farm_Irrigation_System.pkl loaded successfully from {target_path}")
            else:
                print(f"[ML Engine] Warning: Farm_Irrigation_System.pkl not found in candidates: {candidate_paths}")
        except Exception as e:
            print(f"[ML Engine] Error loading model: {e}")

    def predict(self, sensor_values: list[float]) -> dict:
        """
        Takes 20 scaled sensor values (0.0 to 1.0) and predicts sprinkler activation for Parcels 0, 1, 2.
        Returns binary predictions, probability scores, decision rationale, and top influencing sensors.
        """
        if not self.model:
            # Fallback heuristic if model not loaded
            mean_val = float(np.mean(sensor_values))
            need_water = 1 if mean_val < 0.35 else 0
            return {
                "predictions": [need_water, need_water, 0],
                "probabilities": [0.7 if need_water else 0.2] * 3,
                "reasons": ["Heuristic fallback active: Low average soil moisture detected."],
                "top_influencers": []
            }

        input_arr = np.array(sensor_values, dtype=float).reshape(1, -1)
        # Binary prediction (0 = OFF, 1 = ON)
        raw_pred = self.model.predict(input_arr)[0]
        predictions = [int(p) for p in raw_pred]

        # Probability scores for ON (class index 1)
        probabilities = []
        for est in self.model.estimators_:
            try:
                proba = est.predict_proba(input_arr)[0]
                # If binary classes [0, 1]
                if len(proba) > 1:
                    probabilities.append(float(round(proba[1], 4)))
                else:
                    probabilities.append(float(proba[0]))
            except Exception:
                probabilities.append(0.5)

        # Generate intelligent agronomy explanation for each parcel
        reasons = []
        top_influencers = []
        for i, (pred, prob) in enumerate(zip(predictions, probabilities)):
            parcel_top = self.feature_importances.get(f"parcel_{i}", [])
            key_sensor_data = []
            for item in parcel_top[:3]:
                idx = item["sensor_id"]
                val = sensor_values[idx]
                key_sensor_data.append(f"Probe #{idx} ({round(val * 100, 1)}%)")

            sensors_str = ", ".join(key_sensor_data)
            confidence_pct = round(prob * 100 if pred == 1 else (1 - prob) * 100, 1)

            if pred == 1:
                reason = f"Parcel {i}: AI activated irrigation ({confidence_pct}% confidence). Critical root moisture deficit detected across key monitors: {sensors_str}."
            else:
                reason = f"Parcel {i}: Valve suppressed ({confidence_pct}% confidence). Rootzone moisture within agronomic target across {sensors_str}."

            reasons.append(reason)
            top_influencers.append({
                "parcel_id": i,
                "parcel_name": f"Parcel {i}",
                "status": "ON" if pred == 1 else "OFF",
                "probability_on": prob,
                "key_sensors": parcel_top
            })

        return {
            "predictions": predictions,
            "probabilities": probabilities,
            "reasons": reasons,
            "top_influencers": top_influencers
        }

# Global instance
ml_service = IrrigationMLModel()

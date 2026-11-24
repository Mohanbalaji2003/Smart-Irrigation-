import asyncio
import time
from datetime import datetime, timezone
import random
from app.state import system_state
from app.model import ml_service

class IrrigationSimulator:
    def __init__(self):
        self._running = False
        self._task = None
        self._history_tick_counter = 0

    def start(self):
        if not self._running:
            self._running = True
            self._task = asyncio.create_task(self._simulation_loop())
            print("[Simulation] Physics-based Agronomic IoT Loop started.")

    def stop(self):
        self._running = False
        if self._task:
            self._task.cancel()
            self._task = None
            print("[Simulation] Loop stopped.")

    async def _simulation_loop(self):
        while self._running:
            try:
                await asyncio.sleep(2.0)
                if not system_state.simulation_active:
                    continue

                if system_state.emergency_stop:
                    # Enforce all valves shut immediately
                    for p in system_state.parcels:
                        p["valve_status"] = 0
                    continue

                # 1. Update moisture levels based on physical state
                for p in system_state.parcels:
                    is_active = p["valve_status"] == 1
                    sensor_indices = p["sensor_indices"]

                    if is_active:
                        # Water flow accumulation
                        flow_rate = p["flow_rate_lpm"]
                        liters_dispensed = flow_rate * (2.0 / 60.0)  # for 2-second interval
                        p["dispensed_liters_today"] = round(p["dispensed_liters_today"] + liters_dispensed, 1)
                        system_state.total_water_consumed_liters = round(
                            system_state.total_water_consumed_liters + liters_dispensed, 1
                        )
                        # Accumulate economic INR savings based on AI precision vs traditional flood irrigation
                        inr_saved = liters_dispensed * 0.045 * 0.386
                        system_state.rupees_saved_today = round(system_state.rupees_saved_today + inr_saved, 2)

                        # Moisture increase across parcel's sensors
                        for s_idx in sensor_indices:
                            current_val = system_state.sensors[s_idx]["value"]
                            # Deeper sensors absorb slightly slower
                            depth = system_state.sensors[s_idx]["depth_cm"]
                            absorption_rate = (0.022 if depth <= 30 else 0.014) * system_state.simulation_speed
                            # Add tiny stochastic variation
                            noise = random.uniform(-0.002, 0.003)
                            new_val = min(0.92, round(current_val + absorption_rate + noise, 3))
                            system_state.set_sensor_value(s_idx, new_val)
                    else:
                        # Gradual transpiration & percolation depletion
                        for s_idx in sensor_indices:
                            current_val = system_state.sensors[s_idx]["value"]
                            depletion_rate = 0.004 * system_state.simulation_speed
                            noise = random.uniform(-0.001, 0.001)
                            new_val = max(0.09, round(current_val - depletion_rate + noise, 3))
                            system_state.set_sensor_value(s_idx, new_val)

                # 2. In Autonomous AI Mode, run the ML model against the live 20-sensor array
                if system_state.mode == "AI_AUTONOMOUS":
                    sensor_vals = system_state.get_sensor_values()
                    ai_result = ml_service.predict(sensor_vals)
                    preds = ai_result["predictions"]
                    probs = ai_result["probabilities"]
                    reasons = ai_result["reasons"]

                    for idx, (p, pred, prob, reason) in enumerate(zip(system_state.parcels, preds, probs, reasons)):
                        p["ai_confidence"] = prob
                        p["ai_decision"] = reason

                        # Check for state transition
                        if p["valve_status"] != pred:
                            p["valve_status"] = pred
                            state_str = "ACTIVATED (ON)" if pred == 1 else "DEACTIVATED (OFF)"
                            system_state.add_log(
                                category="AI_ENGINE",
                                severity="SUCCESS" if pred == 1 else "INFO",
                                message=f"{p['name']} valve {state_str} by Random Forest classifier. Reason: {reason}"
                            )

                # 3. Periodically record chart history (every ~6 seconds / 3 ticks)
                self._history_tick_counter += 1
                if self._history_tick_counter >= 3:
                    self._history_tick_counter = 0
                    now_str = datetime.now(timezone.utc).strftime("%H:%M:%S")

                    # Calculate mean moisture per parcel
                    p0_vals = [system_state.sensors[i]["value"] for i in system_state.parcels[0]["sensor_indices"]]
                    p1_vals = [system_state.sensors[i]["value"] for i in system_state.parcels[1]["sensor_indices"]]
                    p2_vals = [system_state.sensors[i]["value"] for i in system_state.parcels[2]["sensor_indices"]]

                    total_flow = sum(
                        p["flow_rate_lpm"] for p in system_state.parcels if p["valve_status"] == 1
                    )

                    all_vals = system_state.get_sensor_values()

                    system_state.history.append({
                        "timestamp": now_str,
                        "parcel_0_moisture": round(sum(p0_vals) / len(p0_vals), 3),
                        "parcel_1_moisture": round(sum(p1_vals) / len(p1_vals), 3),
                        "parcel_2_moisture": round(sum(p2_vals) / len(p2_vals), 3),
                        "total_flow_lpm": total_flow,
                        "avg_moisture": round(sum(all_vals) / len(all_vals), 3)
                    })

                    # Maintain rolling window of 60 points
                    if len(system_state.history) > 60:
                        system_state.history.pop(0)

            except asyncio.CancelledError:
                break
            except Exception as e:
                print(f"[Simulation Loop Error]: {e}")
                await asyncio.sleep(2.0)

simulator = IrrigationSimulator()

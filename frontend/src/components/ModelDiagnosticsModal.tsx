import React, { useState } from 'react';
import { 
  FlaskConical, 
  X, 
  Cpu, 
  Sparkles, 
  Play, 
  CheckCircle2, 
  BarChart3, 
  Layers,
  ArrowRight
} from 'lucide-react';
import { MLModelInfo, PredictionResult, Sensor } from '../types';
import { api } from '../services/api';

interface ModelDiagnosticsModalProps {
  isOpen: boolean;
  onClose: () => void;
  mlInfo: MLModelInfo | null;
  currentSensors: Sensor[];
}

export const ModelDiagnosticsModal: React.FC<ModelDiagnosticsModalProps> = ({
  isOpen,
  onClose,
  mlInfo,
  currentSensors
}) => {
  const [testValues, setTestValues] = useState<number[]>(
    currentSensors.map(s => s.value)
  );
  const [prediction, setPrediction] = useState<PredictionResult | null>(null);
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  const handleRunInference = async () => {
    setLoading(true);
    try {
      const res = await api.predict(testValues);
      setPrediction(res);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleSliderChange = (idx: number, val: number) => {
    const updated = [...testValues];
    updated[idx] = val;
    setTestValues(updated);
  };

  const handleResetToCurrent = () => {
    setTestValues(currentSensors.map(s => s.value));
    setPrediction(null);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md">
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 max-w-4xl w-full max-h-[90vh] overflow-y-auto shadow-2xl flex flex-col justify-between">
        
        {/* Modal Header */}
        <div>
          <div className="flex items-center justify-between pb-4 border-b border-slate-800">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-teal-500/20 text-teal-400 flex items-center justify-center border border-teal-500/30">
                <FlaskConical className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-white flex items-center gap-2">
                  AI Model Explainability & Diagnostic Sandbox
                </h3>
                <p className="text-xs text-slate-400">
                  Scikit-Learn MultiOutputClassifier (Random Forest) Architecture & Feature Attribution
                </p>
              </div>
            </div>

            <button
              onClick={onClose}
              className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Model Specs Ribbon */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 my-4">
            <div className="bg-slate-950 p-3 rounded-xl border border-slate-800">
              <span className="text-[10px] text-slate-400 block uppercase font-mono">Algorithm</span>
              <span className="text-xs font-bold font-mono text-emerald-400">Random Forest Ensemble</span>
            </div>
            <div className="bg-slate-950 p-3 rounded-xl border border-slate-800">
              <span className="text-[10px] text-slate-400 block uppercase font-mono">Estimators</span>
              <span className="text-xs font-bold font-mono text-white">3 Multi-output Trees (200 ea)</span>
            </div>
            <div className="bg-slate-950 p-3 rounded-xl border border-slate-800">
              <span className="text-[10px] text-slate-400 block uppercase font-mono">Input Vector</span>
              <span className="text-xs font-bold font-mono text-white">20 Soil Sensors (0.0 to 1.0)</span>
            </div>
            <div className="bg-slate-950 p-3 rounded-xl border border-slate-800">
              <span className="text-[10px] text-slate-400 block uppercase font-mono">Target Outputs</span>
              <span className="text-xs font-bold font-mono text-cyan-400">3 Solenoids (Binary Multi-label)</span>
            </div>
          </div>

          {/* Feature Importances by Parcel */}
          <div className="mb-6">
            <h4 className="text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2 flex items-center gap-1.5">
              <BarChart3 className="w-4 h-4 text-emerald-400" />
              Agronomic Sensor Feature Importances (Gini Impurity)
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              {mlInfo?.feature_importances && Object.entries(mlInfo.feature_importances).map(([parcelKey, items], pIdx) => (
                <div key={parcelKey} className="bg-slate-950/70 p-3.5 rounded-xl border border-slate-800">
                  <span className="font-bold text-xs text-white block mb-2">
                    {pIdx === 0 ? 'Parcel 0 (Orchard)' : pIdx === 1 ? 'Parcel 1 (Vineyard)' : 'Parcel 2 (Valley)'}
                  </span>
                  <div className="space-y-1.5">
                    {items.slice(0, 4).map((f) => (
                      <div key={f.sensor} className="text-[11px]">
                        <div className="flex justify-between text-slate-400 mb-0.5">
                          <span className="font-mono text-slate-300">Probe #{f.sensor_id}</span>
                          <span className="font-mono text-emerald-400">{(f.importance * 100).toFixed(1)}%</span>
                        </div>
                        <div className="h-1 bg-slate-800 rounded-full overflow-hidden">
                          <div
                            className="h-full bg-emerald-500 rounded-full"
                            style={{ width: `${Math.min(100, f.importance * 400)}%` }}
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Interactive What-If Inference Sandbox */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <h4 className="text-xs font-semibold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
                <Sparkles className="w-4 h-4 text-teal-400" />
                What-If Scenario Simulation Canvas
              </h4>
              <button
                onClick={handleResetToCurrent}
                className="text-[11px] text-slate-400 hover:text-slate-200 underline"
              >
                Reset to Live Telemetry
              </button>
            </div>

            {/* Compact Sensor Grid for Tweaking */}
            <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-5 gap-2 bg-slate-950/80 p-3 rounded-xl border border-slate-800 max-h-48 overflow-y-auto mb-4">
              {testValues.map((val, idx) => (
                <div key={idx} className="bg-slate-900 p-2 rounded-lg border border-slate-800">
                  <div className="flex justify-between text-[10px] font-mono mb-1">
                    <span className="text-slate-400">Probe #{idx}</span>
                    <span className="text-emerald-400 font-bold">{Math.round(val * 100)}%</span>
                  </div>
                  <input
                    type="range"
                    min="0.0"
                    max="1.0"
                    step="0.01"
                    value={val}
                    onChange={(e) => handleSliderChange(idx, parseFloat(e.target.value))}
                    className="w-full h-1 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-emerald-500"
                  />
                </div>
              ))}
            </div>

            <div className="flex justify-center mb-4">
              <button
                onClick={handleRunInference}
                disabled={loading}
                className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-600 text-slate-950 font-bold text-xs shadow-lg shadow-emerald-500/20 hover:from-emerald-400 hover:to-teal-500 transition-all disabled:opacity-50"
              >
                <Play className="w-4 h-4 fill-slate-950" />
                <span>{loading ? 'Evaluating Random Forest...' : 'Execute Model Inference'}</span>
              </button>
            </div>

            {/* Inference Results Display */}
            {prediction && (
              <div className="p-4 rounded-xl bg-slate-950 border border-teal-500/40 animate-fadeIn">
                <h5 className="font-bold text-xs text-teal-300 uppercase tracking-wider mb-2">
                  Model Prediction Results:
                </h5>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  {prediction.predictions.map((pred, i) => {
                    const prob = prediction.probabilities[i];
                    return (
                      <div
                        key={i}
                        className={`p-3 rounded-xl border ${
                          pred === 1
                            ? 'bg-cyan-950/30 border-cyan-500/50 text-cyan-200'
                            : 'bg-slate-900 border-slate-800 text-slate-400'
                        }`}
                      >
                        <div className="flex items-center justify-between text-xs mb-1">
                          <span className="font-bold text-white">Zone {i}</span>
                          <span className={`font-mono text-xs font-black ${pred === 1 ? 'text-cyan-400' : 'text-slate-400'}`}>
                            {pred === 1 ? 'SPRINKLER ON' : 'STANDBY (OFF)'}
                          </span>
                        </div>
                        <div className="text-[11px] text-slate-400">
                          Confidence: <span className="font-mono text-white">{(prob * 100).toFixed(1)}%</span>
                        </div>
                        <p className="text-[10px] text-slate-400 mt-1 leading-snug">
                          {prediction.reasons[i]}
                        </p>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Modal Footer */}
        <div className="pt-4 border-t border-slate-800 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-white"
          >
            Close AI Lab
          </button>
        </div>

      </div>
    </div>
  );
};

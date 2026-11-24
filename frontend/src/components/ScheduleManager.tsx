import React, { useState } from 'react';
import { Calendar, Clock, CloudRain, Plus, Check, ShieldCheck } from 'lucide-react';
import { Schedule, Parcel } from '../types';

interface ScheduleManagerProps {
  schedules: Schedule[];
  parcels: Parcel[];
  onAddSchedule: (schedule: Omit<Schedule, 'id' | 'status'>) => void;
}

export const ScheduleManager: React.FC<ScheduleManagerProps> = ({
  schedules,
  parcels,
  onAddSchedule
}) => {
  const [showModal, setShowModal] = useState(false);
  const [name, setName] = useState('');
  const [timeWindow, setTimeWindow] = useState('05:00 - 06:00');
  const [duration, setDuration] = useState(30);
  const [selectedParcels, setSelectedParcels] = useState<number[]>([0]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name) return;
    onAddSchedule({
      name,
      parcel_ids: selectedParcels,
      time_window: timeWindow,
      max_duration_min: duration,
      days: ['Mon', 'Wed', 'Fri'],
      smart_weather_skip: true
    });
    setName('');
    setShowModal(false);
  };

  return (
    <div className="glass-panel p-5 rounded-2xl border border-slate-800/80">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-base font-bold text-white flex items-center gap-2">
            <Calendar className="w-4 h-4 text-emerald-400" />
            Automated Irrigation Schedules & Rain Delay
          </h3>
          <p className="text-xs text-slate-400">
            Automated cycles with integrated weather forecast skip interlocks
          </p>
        </div>

        <button
          onClick={() => setShowModal(true)}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-xs font-semibold transition-colors"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>New Schedule</span>
        </button>
      </div>

      <div className="space-y-2.5">
        {schedules.map(sch => (
          <div
            key={sch.id}
            className="p-3.5 rounded-xl border border-slate-800/80 bg-slate-950/60 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:border-slate-700 transition-colors"
          >
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="font-bold text-sm text-white">{sch.name}</span>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
                  {sch.status}
                </span>
                {sch.smart_weather_skip && (
                  <span className="flex items-center gap-1 text-[10px] text-cyan-400 font-medium">
                    <CloudRain className="w-3 h-3 text-cyan-400" />
                    Smart Skip Armed
                  </span>
                )}
              </div>
              <div className="flex items-center gap-3 text-xs text-slate-400">
                <span className="flex items-center gap-1 font-mono text-slate-300">
                  <Clock className="w-3 h-3 text-slate-500" />
                  {sch.time_window}
                </span>
                <span>•</span>
                <span>Max {sch.max_duration_min} mins</span>
                <span>•</span>
                <span className="text-slate-400">
                  Target: {sch.parcel_ids.map(id => parcels.find(p => p.id === id)?.name || `Zone ${id}`).join(', ')}
                </span>
              </div>
            </div>

            <div className="flex items-center gap-1.5">
              {sch.days.map(d => (
                <span
                  key={d}
                  className="px-2 py-0.5 rounded text-[10px] font-mono bg-slate-800 text-slate-300 border border-slate-700"
                >
                  {d}
                </span>
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* New Schedule Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 max-w-md w-full shadow-2xl">
            <h3 className="text-base font-bold text-white mb-4">Create Automated Irrigation Program</h3>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="text-xs text-slate-400 block mb-1">Program Name</label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Dawn Orchard Hydration"
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white focus:outline-none focus:border-emerald-500"
                  required
                />
              </div>

              <div>
                <label className="text-xs text-slate-400 block mb-1">Time Window</label>
                <input
                  type="text"
                  value={timeWindow}
                  onChange={(e) => setTimeWindow(e.target.value)}
                  placeholder="06:00 - 07:00"
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div>
                <label className="text-xs text-slate-400 block mb-1">Max Duration (Minutes)</label>
                <input
                  type="number"
                  value={duration}
                  onChange={(e) => setDuration(parseInt(e.target.value) || 30)}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white focus:outline-none focus:border-emerald-500"
                  min="5"
                  max="120"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 rounded-xl text-xs font-medium text-slate-400 hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl text-xs font-semibold bg-emerald-500 hover:bg-emerald-400 text-slate-950"
                >
                  Save Program
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

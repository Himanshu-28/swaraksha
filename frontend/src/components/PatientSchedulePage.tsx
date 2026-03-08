import { Calendar, Clock } from 'lucide-react';

export default function PatientSchedulePage() {
  return (
    <div className="flex-1 overflow-auto pb-24 md:pb-8">
      {/* Header */}
      <div className="bg-white border-b border-slate-100 px-4 md:px-8 pt-6 pb-5">
        <h1 className="text-2xl font-bold text-slate-900">Schedule</h1>
        <p className="text-slate-500 text-sm mt-1">Manage your appointments</p>
      </div>

      <div className="px-4 md:px-8 py-6 max-w-2xl">
        <div className="bg-white rounded-2xl border border-slate-100 shadow-[0px_1px_4px_rgba(0,0,0,0.04)]">
          <div className="flex flex-col items-center justify-center py-20 text-center px-6">
            <div className="bg-[#f0fdf4] rounded-2xl p-4 mb-4">
              <Calendar size={28} className="text-[#16a34a]" />
            </div>
            <p className="font-semibold text-slate-900 text-sm">Appointment scheduling coming soon</p>
            <p className="text-slate-400 text-xs mt-1 max-w-xs">
              You'll be able to view upcoming appointments and book new sessions directly from here.
            </p>
            <div className="mt-6 flex items-center gap-2 text-xs text-slate-400 bg-slate-50 rounded-xl px-4 py-2.5">
              <Clock size={13} />
              <span>Feature in development</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

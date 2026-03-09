import { Calendar } from 'lucide-react';

export default function SchedulePage() {
    return (
        <div className="flex flex-col min-h-screen bg-[#f8fafc] pb-20 md:pb-0">

            {/* Header */}
            <div className="bg-white border-b border-slate-100 px-6 py-5 md:px-8">
                <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Schedule</h1>
                <p className="text-slate-500 text-sm mt-0.5">Manage your appointments</p>
            </div>

            {/* Coming soon */}
            <div className="flex-1 flex flex-col items-center justify-center px-6 py-20 text-center">
                <div className="w-20 h-20 rounded-[28px] bg-[#eff6ff] flex items-center justify-center mb-5 shadow-sm">
                    <Calendar size={36} className="text-[#196ee6]" />
                </div>
                <h2 className="text-2xl font-bold text-slate-900 tracking-tight mb-2">Schedule is Coming Soon</h2>
                <p className="text-slate-500 text-base max-w-sm">
                    Appointment management and calendar integration are in development. Stay tuned for updates!
                </p>
                <div className="mt-8 flex items-center gap-2 bg-[#eff6ff] border border-[#bfdbfe] rounded-full px-5 py-2.5">
                    <div className="size-2 rounded-full bg-[#196ee6] animate-pulse" />
                    <span className="text-[#196ee6] font-semibold text-sm">In Development</span>
                </div>
            </div>
        </div>
    );
}

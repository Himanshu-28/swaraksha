import { useNavigate } from 'react-router-dom';
import { Calendar, FileText, User, Activity, Clock, ArrowRight } from 'lucide-react';
import { useUser } from '../contexts/UserContext';

export default function PatientDashboardPage() {
  const { displayName } = useUser();
  const navigate = useNavigate();
  const today = new Date().toLocaleDateString('en-IN', {
    weekday: 'long', day: 'numeric', month: 'long', year: 'numeric',
  });

  const quickActions = [
    {
      icon: FileText,
      label: 'My Transcriptions',
      description: 'View past consultation notes',
      color: 'bg-[#eff6ff] text-[#196ee6]',
      path: '/patient-transcriptions',
    },
    {
      icon: Calendar,
      label: 'Schedule',
      description: 'Book or view appointments',
      color: 'bg-[#f0fdf4] text-[#16a34a]',
      path: '/patient-schedule',
    },
    {
      icon: User,
      label: 'My Profile',
      description: 'View and update your info',
      color: 'bg-[#fefce8] text-[#ca8a04]',
      path: '/patient-profile',
    },
  ];

  return (
    <div className="flex-1 overflow-auto pb-24 md:pb-8">
      {/* Header */}
      <div className="bg-white border-b border-slate-100 px-4 md:px-8 pt-6 pb-5">
        <p className="text-sm text-slate-400 mb-1">{today}</p>
        <h1 className="text-2xl font-bold text-slate-900">
          Good {getGreeting()}, {displayName} 👋
        </h1>
        <p className="text-slate-500 text-sm mt-1">Here's an overview of your health journey</p>
      </div>

      <div className="px-4 md:px-8 py-6 max-w-4xl space-y-8">

        {/* Summary cards */}
        <div>
          <h2 className="text-xs font-semibold text-slate-400 uppercase tracking-widest mb-3">Health Summary</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {[
              { label: 'Consultations', value: '—', sub: 'lifetime', icon: Activity },
              { label: 'Transcriptions', value: '—', sub: 'saved notes', icon: FileText },
              { label: 'Upcoming', value: '—', sub: 'appointments', icon: Calendar },
              { label: 'Last Visit', value: '—', sub: 'date', icon: Clock },
            ].map(({ label, value, sub, icon: Icon }) => (
              <div key={label} className="bg-white rounded-2xl border border-slate-100 px-4 py-4 shadow-[0px_1px_4px_rgba(0,0,0,0.04)]">
                <Icon size={16} className="text-slate-300 mb-2" />
                <p className="text-xl font-bold text-slate-900">{value}</p>
                <p className="text-xs font-medium text-slate-400 mt-0.5">{label}</p>
                <p className="text-[10px] text-slate-300">{sub}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Quick actions */}
        <div>
          <h2 className="text-xs font-semibold text-slate-400 uppercase tracking-widest mb-3">Quick Actions</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            {quickActions.map(({ icon: Icon, label, description, color, path }) => (
              <button
                key={path}
                onClick={() => navigate(path)}
                className="group bg-white rounded-2xl border border-slate-100 shadow-[0px_1px_4px_rgba(0,0,0,0.04)] px-5 py-4 flex items-center gap-4 hover:border-[#196ee6]/20 hover:shadow-[0px_2px_8px_rgba(25,110,230,0.08)] transition-all text-left"
              >
                <div className={`rounded-xl p-2.5 ${color}`}>
                  <Icon size={20} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-slate-900 text-sm">{label}</p>
                  <p className="text-xs text-slate-400 mt-0.5 truncate">{description}</p>
                </div>
                <ArrowRight size={16} className="text-slate-300 group-hover:text-[#196ee6] transition-colors shrink-0" />
              </button>
            ))}
          </div>
        </div>

        {/* Recent activity */}
        <div>
          <h2 className="text-xs font-semibold text-slate-400 uppercase tracking-widest mb-3">Recent Activity</h2>
          <div className="bg-white rounded-2xl border border-slate-100 shadow-[0px_1px_4px_rgba(0,0,0,0.04)] overflow-hidden">
            <div className="flex flex-col items-center justify-center py-14 text-center px-6">
              <div className="bg-[#eff6ff] rounded-2xl p-4 mb-4">
                <Activity size={28} className="text-[#196ee6]" />
              </div>
              <p className="font-semibold text-slate-900 text-sm">No consultations yet</p>
              <p className="text-slate-400 text-xs mt-1 max-w-xs">
                Your consultation history and SOAP notes will appear here once your doctor records a session.
              </p>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}

function getGreeting(): string {
  const h = new Date().getHours();
  if (h < 12) return 'morning';
  if (h < 17) return 'afternoon';
  return 'evening';
}

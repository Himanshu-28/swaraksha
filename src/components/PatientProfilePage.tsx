import { User, Mail, Phone, Calendar, Stethoscope } from 'lucide-react';
import { useUser } from '../contexts/UserContext';

function Field({ icon: Icon, label, value }: {
  icon: React.ElementType;
  label: string;
  value: string;
}) {
  return (
    <div className="flex items-start gap-4 py-4 border-b border-slate-50 last:border-0">
      <div className="bg-[#eff6ff] rounded-xl p-2.5 shrink-0">
        <Icon size={16} className="text-[#196ee6]" />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-xs text-slate-400 font-medium mb-0.5">{label}</p>
        <p className="text-sm font-semibold text-slate-900 break-all">
          {value || <span className="text-slate-300 font-normal">Not set</span>}
        </p>
      </div>
    </div>
  );
}

function formatDOB(iso: string): string {
  if (!iso) return '';
  const [y, m, d] = iso.split('-');
  if (!y || !m || !d) return iso;
  return new Date(+y, +m - 1, +d).toLocaleDateString('en-IN', {
    day: 'numeric', month: 'long', year: 'numeric',
  });
}

export default function PatientProfilePage() {
  const { user, initials } = useUser();

  return (
    <div className="flex-1 overflow-auto pb-24 md:pb-8">
      {/* Header */}
      <div className="bg-white border-b border-slate-100 px-4 md:px-8 pt-6 pb-5">
        <h1 className="text-2xl font-bold text-slate-900">My Profile</h1>
        <p className="text-slate-500 text-sm mt-1">Your personal information</p>
      </div>

      <div className="px-4 md:px-8 py-6 max-w-xl space-y-5">

        {/* Avatar + name hero */}
        <div className="bg-white rounded-2xl border border-slate-100 shadow-[0px_1px_4px_rgba(0,0,0,0.04)] p-6 flex items-center gap-4">
          <div className="size-16 rounded-2xl bg-[#dbeafe] flex items-center justify-center shrink-0">
            <span className="text-2xl font-bold text-[#196ee6]">{initials}</span>
          </div>
          <div>
            <p className="text-xl font-bold text-slate-900">
              {user ? `${user.firstName} ${user.lastName}`.trim() || 'Patient' : '—'}
            </p>
            <div className="flex items-center gap-1.5 mt-1">
              <Stethoscope size={12} className="text-slate-400" />
              <span className="text-xs text-slate-400 font-medium">Patient · Swaraksha</span>
            </div>
          </div>
        </div>

        {/* Details card */}
        <div className="bg-white rounded-2xl border border-slate-100 shadow-[0px_1px_4px_rgba(0,0,0,0.04)] px-5 py-2">
          <Field icon={User}     label="Full Name"     value={user ? `${user.firstName} ${user.lastName}`.trim() : ''} />
          <Field icon={Mail}     label="Email"         value={user?.email ?? ''} />
          <Field icon={Phone}    label="Phone"         value={user?.phone ?? ''} />
          <Field icon={Calendar} label="Date of Birth" value={formatDOB(user?.dateOfBirth ?? '')} />
        </div>

      </div>
    </div>
  );
}

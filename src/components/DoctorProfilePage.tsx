import { useState } from 'react';
import { Save, User, CheckCircle } from 'lucide-react';
import { useDoctorProfile, type DoctorProfile } from '../contexts/DoctorProfileContext';

export default function DoctorProfilePage() {
    const { profile: savedProfile, updateProfile, initials: savedInitials } = useDoctorProfile();
    const [profile, setProfile] = useState<DoctorProfile>(savedProfile);
    const [saved, setSaved] = useState(false);

    const handleChange = (field: keyof DoctorProfile, value: string) => {
        setProfile(prev => ({ ...prev, [field]: value }));
    };

    const handleSave = () => {
        updateProfile(profile);
        setSaved(true);
        setTimeout(() => setSaved(false), 2500);
    };

    const initials = profile.fullName.trim().split(' ').filter(Boolean).map((w: string) => w[0].toUpperCase()).slice(0, 2).join('') || savedInitials;

    const FIELDS: { key: keyof DoctorProfile; label: string; placeholder: string; type?: string }[] = [
        { key: 'fullName', label: 'Full Name', placeholder: 'Dr. Ananya Sharma' },
        { key: 'specialty', label: 'Specialty', placeholder: 'e.g. General Physician, Cardiologist' },
        { key: 'email', label: 'Email Address', placeholder: 'you@hospital.com', type: 'email' },
        { key: 'phone', label: 'Phone Number', placeholder: '+91 98765 43210', type: 'tel' },
        { key: 'hospital', label: 'Hospital / Clinic', placeholder: 'AIIMS New Delhi' },
        { key: 'licenseNumber', label: 'Medical License No.', placeholder: 'MCI-12345' },
    ];

    return (
        <div className="flex flex-col min-h-screen bg-[#f8fafc] pb-20 md:pb-0">

            {/* Header */}
            <div className="bg-white border-b border-slate-100 px-6 py-5 md:px-8">
                <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Profile</h1>
                <p className="text-slate-500 text-sm mt-0.5">Manage your doctor details</p>
            </div>

            <div className="flex-1 px-4 md:px-8 py-6 max-w-2xl">

                {/* Avatar */}
                <div className="flex items-center gap-5 mb-8">
                    <div className="size-[72px] rounded-full bg-[#dbeafe] flex items-center justify-center shrink-0 border-2 border-white shadow-sm">
                        <span className="text-2xl font-bold text-[#196ee6]">{initials}</span>
                    </div>
                    <div>
                        <h2 className="text-lg font-bold text-slate-900">
                            {profile.fullName || 'Your Name'}
                        </h2>
                        <p className="text-slate-500 text-sm">{profile.specialty || 'Specialty not set'}</p>
                        {profile.hospital && (
                            <p className="text-slate-400 text-xs mt-0.5">{profile.hospital}</p>
                        )}
                    </div>
                </div>

                {/* Form */}
                <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
                    <div className="px-5 py-4 border-b border-slate-50">
                        <div className="flex items-center gap-2">
                            <User size={16} className="text-[#196ee6]" />
                            <span className="font-semibold text-slate-800 text-sm">Personal Information</span>
                        </div>
                    </div>

                    <div className="p-5 space-y-4">
                        {FIELDS.map(({ key, label, placeholder, type }) => (
                            <div key={key}>
                                <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wide mb-1.5">
                                    {label}
                                </label>
                                <input
                                    type={type || 'text'}
                                    value={profile[key]}
                                    placeholder={placeholder}
                                    onChange={e => handleChange(key, e.target.value)}
                                    className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#196ee6]/30 focus:border-[#196ee6] transition-all bg-[#f8fafc]"
                                />
                            </div>
                        ))}
                    </div>

                    {/* Save button */}
                    <div className="px-5 pb-5">
                        <button
                            onClick={handleSave}
                            className={`flex items-center justify-center gap-2 w-full py-3 rounded-xl font-semibold text-sm transition-all ${
                                saved
                                    ? 'bg-[#22c55e] text-white'
                                    : 'bg-[#196ee6] text-white hover:bg-[#1255b8] active:scale-[0.98]'
                            }`}
                        >
                            {saved ? (
                                <>
                                    <CheckCircle size={16} />
                                    Saved!
                                </>
                            ) : (
                                <>
                                    <Save size={16} />
                                    Save Profile
                                </>
                            )}
                        </button>
                    </div>
                </div>

                {/* App version chip */}
                <p className="text-center text-xs text-slate-400 mt-6">Swarksha v1.0 · AI Clinical Documentation</p>
            </div>
        </div>
    );
}

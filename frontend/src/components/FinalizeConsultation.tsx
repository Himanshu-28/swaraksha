import { useState, useEffect } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { fetchAuthSession } from 'aws-amplify/auth';
import {
    CheckCircle2, RefreshCw, Smartphone, LayoutDashboard,
    Users, Calendar, Settings, ArrowLeft, Lock, Loader2
} from 'lucide-react';
import { API_ENDPOINT } from '../aws-exports';

interface NoteData {
    subjective: string;
    objective: string;
    assessment: string;
    plan: string;
}

interface Patient {
    patientId: string;
    patientName: string;
    age?: string;
    gender?: string;
}

export default function FinalizeConsultation() {
    const { patientId } = useParams<{ patientId: string }>();
    const navigate = useNavigate();
    const location = useLocation();
    const note = location.state?.note as NoteData | undefined;

    const [patient, setPatient] = useState<Patient | null>(null);
    const [emrSynced, setEmrSynced] = useState(false);
    const [messageSent, setMessageSent] = useState(false);
    const [syncing, setSyncing] = useState(false);
    const [sending, setSending] = useState(false);

    useEffect(() => {
        const loadPatient = async () => {
            try {
                const session = await fetchAuthSession();
                const token = session.tokens?.idToken?.toString();
                const res = await fetch(`${API_ENDPOINT}/patients/${patientId}`, {
                    headers: { Authorization: `Bearer ${token}` },
                });
                if (!res.ok) return;
                const data = await res.json();
                setPatient(data.patient);
            } catch (e) {
                console.error('Failed to load patient for finalize page', e);
            }
        };
        if (patientId) loadPatient();
    }, [patientId]);

    const handleSyncEMR = async () => {
        setSyncing(true);
        await new Promise(r => setTimeout(r, 1500));
        setEmrSynced(true);
        setSyncing(false);
    };

    const handleSendPhone = async () => {
        setSending(true);
        await new Promise(r => setTimeout(r, 1500));
        setMessageSent(true);
        setSending(false);
    };

    const handleEndSession = () => {
        navigate('/');
    };

    const displayName = patient?.patientName ?? 'Patient';
    const displayId = patientId?.substring(0, 8).toUpperCase() ?? '—';
    const initials = displayName.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase();

    const assessmentLines = note?.assessment
        ?.split('\n')
        .filter(Boolean)
        .slice(0, 2) ?? ['Consultation note approved'];
    const planLines = note?.plan
        ?.split('\n')
        .filter(Boolean)
        .slice(0, 2) ?? [];

    return (
        <div className="bg-[#f6f7f8] font-['Inter'] text-slate-900 min-h-screen flex flex-col items-center pb-24 md:pb-8">
            {/* Header */}
            <header className="flex w-full items-center bg-white p-4 sticky top-0 z-20 border-b border-slate-200">
                <button
                    onClick={() => navigate(`/patient/${patientId}/review`)}
                    className="flex size-10 shrink-0 items-center justify-center rounded-full hover:bg-slate-100 cursor-pointer text-slate-900"
                >
                    <ArrowLeft size={24} />
                </button>
                <h2 className="text-lg font-bold leading-tight flex-1 text-center pr-10">
                    Consultation Complete
                </h2>
            </header>

            <main className="flex-1 w-full max-w-2xl lg:max-w-5xl px-4 pt-5 pb-8">
                {/* ── Responsive two-column on desktop ── */}
                <div className="md:grid md:grid-cols-2 md:gap-8 md:items-start space-y-4 md:space-y-0">

                    {/* ── Left column: Patient Summary ── */}
                    <div className="space-y-4">

                        {/* Patient Summary Card */}
                        <div className="rounded-3xl overflow-hidden shadow-lg"
                            style={{ background: 'linear-gradient(135deg, #196ee6 0%, #1a56c4 60%, #1346a0 100%)' }}>
                            <div className="flex items-center justify-between px-5 pt-5 pb-2">
                                <span className="text-white/70 text-sm font-medium">Patient Record</span>
                                <span className="flex items-center gap-1 bg-emerald-400/20 text-emerald-200 text-xs font-semibold px-3 py-1 rounded-full border border-emerald-400/30">
                                    <CheckCircle2 size={13} className="stroke-[2.5]" />
                                    Approved
                                </span>
                            </div>
                            <div className="flex items-center gap-4 px-5 pb-5">
                                <div className="size-14 rounded-2xl bg-white/20 text-white font-bold text-lg flex items-center justify-center shrink-0">
                                    {initials}
                                </div>
                                <div>
                                    <h2 className="text-white text-xl font-bold leading-tight">{displayName}</h2>
                                    <p className="text-white/60 text-sm">ID #{displayId}</p>
                                    {patient?.age && (
                                        <p className="text-white/60 text-xs mt-0.5">
                                            {patient.age}{patient.gender ? ` · ${patient.gender}` : ''}
                                        </p>
                                    )}
                                </div>
                            </div>
                            <div className="mx-4 mb-4 bg-white/10 backdrop-blur-sm rounded-2xl p-4 border border-white/20 space-y-3">
                                <p className="text-white/60 text-xs font-bold uppercase tracking-widest">Assessment & Plan</p>
                                <div className="space-y-1.5">
                                    {assessmentLines.map((line, i) => (
                                        <div key={i} className="flex items-start gap-2">
                                            <span className="mt-1.5 size-1.5 rounded-full bg-emerald-300 shrink-0" />
                                            <p className="text-white text-sm leading-snug">{line.replace(/^\d+\.\s*/, '')}</p>
                                        </div>
                                    ))}
                                    {planLines.map((line, i) => (
                                        <div key={i} className="flex items-start gap-2">
                                            <span className="mt-1.5 size-1.5 rounded-full bg-blue-200 shrink-0" />
                                            <p className="text-white/80 text-sm leading-snug">{line.replace(/^\d+\.\s*/, '')}</p>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>

                        {/* End Session (desktop: in left column) */}
                        <div className="hidden md:block pt-2 space-y-3">
                            <button
                                onClick={handleEndSession}
                                className="w-full flex items-center justify-center gap-2 bg-slate-900 hover:bg-slate-700 text-white font-bold py-4 rounded-2xl text-base transition-colors shadow-md"
                            >
                                End Session
                            </button>
                            <p className="flex items-center justify-center gap-1.5 text-slate-400 text-xs text-center">
                                <Lock size={12} />
                                Data will be securely cleared from device
                            </p>
                        </div>
                    </div>

                    {/* ── Right column: Distribution Actions ── */}
                    <div className="space-y-4">
                        <p className="text-xs font-bold uppercase tracking-widest text-slate-400 px-1 pt-2 md:pt-0">
                            Distribution
                        </p>

                        {/* EMR Integration */}
                        <div className="bg-white rounded-2xl p-5 shadow-sm border border-slate-100">
                            <div className="flex items-start justify-between mb-4">
                                <div>
                                    <h3 className="font-bold text-slate-900 text-base">Digital Records</h3>
                                    <p className="text-slate-500 text-sm">EMR / EHR Integration</p>
                                </div>
                                <span className={`flex items-center gap-1.5 text-xs font-semibold px-3 py-1 rounded-full ${emrSynced
                                    ? 'bg-emerald-50 text-emerald-600 border border-emerald-200'
                                    : 'bg-amber-50 text-amber-600 border border-amber-200'
                                    }`}>
                                    <span className={`size-2 rounded-full ${emrSynced ? 'bg-emerald-400' : 'bg-amber-400'}`} />
                                    {emrSynced ? 'Synced' : 'Ready to sync'}
                                </span>
                            </div>
                            <button
                                onClick={handleSyncEMR}
                                disabled={emrSynced || syncing}
                                className="w-full flex items-center justify-center gap-2 bg-[#196ee6] hover:bg-blue-700 disabled:opacity-60 disabled:cursor-not-allowed text-white font-semibold py-3 rounded-xl transition-colors"
                            >
                                {syncing ? (
                                    <Loader2 size={18} className="animate-spin" />
                                ) : emrSynced ? (
                                    <CheckCircle2 size={18} />
                                ) : (
                                    <RefreshCw size={18} />
                                )}
                                {syncing ? 'Syncing…' : emrSynced ? 'Synced to EMR' : 'Sync to EMR / EHR'}
                            </button>
                        </div>

                        {/* Patient Communication */}
                        <div className="bg-white rounded-2xl p-5 shadow-sm border border-slate-100">
                            <div className="flex items-start justify-between mb-4">
                                <div>
                                    <h3 className="font-bold text-slate-900 text-base">Patient Communication</h3>
                                    <p className="text-slate-500 text-sm">Summary & Prescription</p>
                                </div>
                                <span className={`flex items-center gap-1.5 text-xs font-semibold px-3 py-1 rounded-full ${messageSent
                                    ? 'bg-emerald-50 text-emerald-600 border border-emerald-200'
                                    : 'bg-slate-50 text-slate-500 border border-slate-200'
                                    }`}>
                                    <span className={`size-2 rounded-full ${messageSent ? 'bg-emerald-400' : 'bg-slate-300'}`} />
                                    {messageSent ? 'Sent' : 'Saved'}
                                </span>
                            </div>
                            <button
                                onClick={handleSendPhone}
                                disabled={messageSent || sending}
                                className="w-full flex items-center justify-center gap-2 bg-slate-900 hover:bg-slate-700 disabled:opacity-60 disabled:cursor-not-allowed text-white font-semibold py-3 rounded-xl transition-colors"
                            >
                                {sending ? (
                                    <Loader2 size={18} className="animate-spin" />
                                ) : messageSent ? (
                                    <CheckCircle2 size={18} />
                                ) : (
                                    <Smartphone size={18} />
                                )}
                                {sending ? 'Sending…' : messageSent ? 'Sent to Patient' : "Send to Patient's Phone"}
                            </button>
                        </div>

                        {/* End Session (mobile: in right column flow) */}
                        <div className="md:hidden pt-2 space-y-3">
                            <button
                                onClick={handleEndSession}
                                className="w-full flex items-center justify-center gap-2 bg-slate-900 hover:bg-slate-700 text-white font-bold py-4 rounded-2xl text-base transition-colors shadow-md"
                            >
                                End Session
                            </button>
                            <p className="flex items-center justify-center gap-1.5 text-slate-400 text-xs text-center">
                                <Lock size={12} />
                                Data will be securely cleared from device
                            </p>
                        </div>
                    </div>
                </div>
            </main>

            {/* ── Bottom Navigation (mobile only) ── */}
            <nav className="md:hidden fixed bottom-0 left-0 w-full bg-white border-t border-slate-200 flex items-center justify-around px-2 py-2 z-30">
                <button
                    onClick={() => navigate('/')}
                    className="flex flex-col items-center gap-0.5 px-4 py-2 rounded-xl text-slate-400 hover:text-[#196ee6] hover:bg-blue-50 transition-colors"
                >
                    <LayoutDashboard size={22} />
                    <span className="text-[10px] font-medium">Dashboard</span>
                </button>
                <button
                    onClick={() => navigate('/')}
                    className="flex flex-col items-center gap-0.5 px-4 py-2 rounded-xl text-slate-400 hover:text-[#196ee6] hover:bg-blue-50 transition-colors"
                >
                    <Users size={22} />
                    <span className="text-[10px] font-medium">Patients</span>
                </button>
                <button className="flex flex-col items-center gap-0.5 px-4 py-2 rounded-xl text-slate-400 hover:text-[#196ee6] hover:bg-blue-50 transition-colors">
                    <Calendar size={22} />
                    <span className="text-[10px] font-medium">Schedule</span>
                </button>
                <button className="flex flex-col items-center gap-0.5 px-4 py-2 rounded-xl text-slate-400 hover:text-[#196ee6] hover:bg-blue-50 transition-colors">
                    <Settings size={22} />
                    <span className="text-[10px] font-medium">Settings</span>
                </button>
            </nav>
        </div>
    );
}

import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { fetchAuthSession } from 'aws-amplify/auth';
import {
    ArrowLeft, Edit2, MoreVertical, Ruler, Weight, Activity,
    AlertTriangle, History, Stethoscope, ChevronDown, PlusCircle, Loader2,
    ChevronUp
} from 'lucide-react';
import { API_ENDPOINT } from '../aws-exports';

interface Patient {
    patientId: string;
    patientName: string;
    age: string;
    gender: string;
    createdAt: string;
    [key: string]: any;
}

export default function PatientDetails() {
    const { patientId } = useParams();
    const navigate = useNavigate();
    const [patient, setPatient] = useState<Patient | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const loadPatient = async () => {
            try {
                const session = await fetchAuthSession();
                const token = session.tokens?.idToken?.toString();

                if (!token) throw new Error("No token");

                const res = await fetch(`${API_ENDPOINT}/patients/${patientId}`, {
                    headers: { 'Authorization': `Bearer ${token}` }
                });
                if (!res.ok) throw new Error("Failed to load patient");

                const data = await res.json();
                setPatient(data.patient);
            } catch (err) {
                console.error('Failed to load patient', err);
            } finally {
                setIsLoading(false);
            }
        };

        if (patientId) {
            loadPatient();
        }
    }, [patientId]);

    if (isLoading) {
        return (
            <div className="flex flex-col items-center justify-center min-h-screen bg-[#f6f7f8]">
                <Loader2 size={32} className="animate-spin text-blue-500 mb-4" />
                <p className="font-['Inter'] text-slate-500">Loading Patient Record...</p>
            </div>
        );
    }

    if (!patient) {
        return (
            <div className="flex flex-col items-center justify-center min-h-screen bg-[#f6f7f8] p-4">
                <AlertTriangle size={48} className="text-red-400 mb-4" />
                <h2 className="text-xl font-bold font-['Inter'] mb-2">Patient Not Found</h2>
                <button onClick={() => navigate('/')} className="px-4 py-2 bg-blue-500 text-white rounded-lg">Go Back</button>
            </div>
        );
    }

    // Default formatting
    const initials = patient.patientName?.split(' ').map((n: string) => n[0]).join('').substring(0, 2).toUpperCase() || 'U';

    return (
        <div className="relative flex min-h-screen w-full flex-col overflow-x-hidden bg-[#f6f7f8] font-['Inter'] text-slate-900">

            {/* Top Navigation */}
            <header className="sticky top-0 z-50 flex items-center bg-white/80 backdrop-blur-md px-4 py-3 justify-between border-b border-slate-200">
                <div className="flex items-center gap-3">
                    <button onClick={() => navigate('/')} className="flex size-10 items-center justify-center rounded-full hover:bg-slate-100 transition-colors">
                        <ArrowLeft size={24} className="text-slate-600" />
                    </button>
                    <h1 className="text-lg font-bold tracking-tight">Patient Details</h1>
                </div>
                <div className="flex items-center gap-2">
                    <button className="flex size-10 items-center justify-center rounded-full hover:bg-slate-100 transition-colors">
                        <Edit2 size={20} className="text-slate-600" />
                    </button>
                    <button className="flex size-10 items-center justify-center rounded-full hover:bg-slate-100 transition-colors">
                        <MoreVertical size={24} className="text-slate-600" />
                    </button>
                </div>
            </header>

            {/* ── Responsive body: single column on mobile, two columns on desktop ── */}
            <div className="flex-1 flex flex-col md:flex-row md:items-start pb-32 md:pb-8">

                {/* ── Left column: Profile + Vitals ── */}
                <div className="md:w-80 lg:w-96 md:shrink-0 md:sticky md:top-[61px] md:h-[calc(100vh-61px)] md:overflow-y-auto">

                    {/* Profile Header */}
                    <section className="p-6 flex flex-col items-center bg-white border-b border-slate-100">
                        <div className="relative mb-4">
                            <div className="size-28 rounded-full border-4 border-blue-500/10 p-1">
                                <div className="size-full rounded-full bg-blue-50 flex items-center justify-center overflow-hidden">
                                    <span className="text-4xl font-bold text-blue-500">{initials}</span>
                                </div>
                            </div>
                            <div className="absolute bottom-[6px] right-[6px] size-6 bg-green-500 border-2 border-white rounded-full"></div>
                        </div>
                        <div className="text-center w-full px-4">
                            <h2 className="text-2xl font-bold break-words">{patient.patientName}</h2>
                            <p className="text-slate-500 text-sm mt-1">
                                Patient ID: <span className="font-medium text-slate-700">#{patient.patientId?.substring(0, 8).toUpperCase()}</span>
                            </p>
                            <div className="flex items-center justify-center gap-2 mt-3 flex-wrap">
                                <span className="text-xs bg-blue-50 text-blue-600 px-3 py-1.5 rounded-full font-medium border border-blue-100">
                                    Age: {patient.age || 'Unknown'}
                                </span>
                                <span className="text-xs bg-slate-100 text-slate-600 px-3 py-1.5 rounded-full font-medium border border-slate-200 capitalize">
                                    {patient.gender || 'Unknown'}
                                </span>
                            </div>
                        </div>
                    </section>

                    {/* Quick Stats Cards */}
                    <section className="px-4 py-6">
                        <div className="flex gap-3 overflow-x-auto hide-scrollbar pb-2">
                            <div className="flex min-w-[140px] flex-1 flex-col gap-2 rounded-xl p-4 bg-white border border-slate-200 shadow-sm">
                                <div className="flex items-center gap-2 text-slate-500">
                                    <Ruler size={16} />
                                    <p className="text-xs font-medium">Height</p>
                                </div>
                                <p className="text-xl font-bold text-slate-800">180 <span className="text-sm font-normal text-slate-400">cm</span></p>
                                <p className="text-[10px] text-green-600 font-medium bg-green-50 px-2 py-0.5 rounded-sm w-max">Stable</p>
                            </div>
                            <div className="flex min-w-[140px] flex-1 flex-col gap-2 rounded-xl p-4 bg-white border border-slate-200 shadow-sm">
                                <div className="flex items-center gap-2 text-slate-500">
                                    <Weight size={16} />
                                    <p className="text-xs font-medium">Weight</p>
                                </div>
                                <p className="text-xl font-bold text-slate-800">75.2 <span className="text-sm font-normal text-slate-400">kg</span></p>
                                <p className="text-[10px] text-green-600 font-medium flex items-center gap-0.5 bg-green-50 px-2 py-0.5 rounded-sm w-max">
                                    <ChevronUp size={10} /> 1.2%
                                </p>
                            </div>
                            <div className="flex min-w-[140px] flex-1 flex-col gap-2 rounded-xl p-4 bg-white border border-slate-200 shadow-sm">
                                <div className="flex items-center gap-2 text-slate-500">
                                    <Activity size={16} />
                                    <p className="text-xs font-medium">BMI</p>
                                </div>
                                <p className="text-xl font-bold text-slate-800">23.2</p>
                                <p className="text-[10px] text-blue-600 font-medium bg-blue-50 px-2 py-0.5 rounded-sm w-max">Normal</p>
                            </div>
                        </div>
                    </section>

                    {/* Desktop: Start Consultation button in left column */}
                    <div className="hidden md:block px-4 pb-6">
                        <button
                            onClick={() => navigate(`/patient/${patientId}/consultation`)}
                            className="w-full bg-[#196ee6] text-white font-bold py-[16px] rounded-[14px] flex items-center justify-center gap-3 shadow-lg hover:bg-blue-700 transition-colors"
                        >
                            <PlusCircle size={22} />
                            Start New Consultation
                        </button>
                    </div>
                </div>

                {/* ── Right column: Medical History + Consultations ── */}
                <div className="flex-1 md:border-l md:border-slate-100">

                    {/* Medical History */}
                    <section className="px-4 py-6 space-y-4">
                        <h3 className="font-bold text-lg text-slate-800 px-1">Medical History</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                            <div className="p-4 bg-white border border-slate-200 rounded-xl shadow-sm">
                                <div className="flex items-center gap-2 mb-3 text-red-500">
                                    <AlertTriangle size={18} />
                                    <h4 className="text-sm font-bold">Known Allergies</h4>
                                </div>
                                <div className="flex flex-wrap gap-2">
                                    <span className="text-xs bg-red-50 text-red-600 px-3 py-1.5 rounded-lg border border-red-100">Penicillin</span>
                                    <span className="text-xs bg-red-50 text-red-600 px-3 py-1.5 rounded-lg border border-red-100">Peanuts</span>
                                </div>
                            </div>

                            <div className="p-4 bg-white border border-slate-200 rounded-xl shadow-sm">
                                <div className="flex items-center gap-2 mb-3 text-blue-600">
                                    <History size={18} />
                                    <h4 className="text-sm font-bold">Chronic Conditions</h4>
                                </div>
                                <ul className="space-y-2">
                                    <li className="flex items-center justify-between text-xs py-2 border-b border-slate-50 last:border-0">
                                        <span className="font-medium text-slate-700">Type 2 Diabetes</span>
                                        <span className="text-slate-400 italic">Mock Data</span>
                                    </li>
                                </ul>
                            </div>
                        </div>
                    </section>

                    {/* Recent Consultations */}
                    <section className="px-4 py-6">
                        <div className="flex items-center justify-between mb-4 px-1">
                            <h3 className="font-bold text-lg text-slate-800">Recent Consultations</h3>
                            <button className="text-blue-600 text-sm font-semibold">View All</button>
                        </div>
                        <div className="space-y-3">
                            <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-sm">
                                <div className="p-4 flex items-center justify-between cursor-pointer border-b border-slate-100">
                                    <div className="flex items-center gap-3">
                                        <div className="size-10 rounded-full bg-blue-50 flex items-center justify-center text-blue-600">
                                            <Stethoscope size={20} />
                                        </div>
                                        <div>
                                            <h4 className="text-sm font-bold text-slate-800">Initial Check-up</h4>
                                            <p className="text-[11px] text-slate-500 font-medium uppercase tracking-wider mt-0.5">
                                                {new Date(patient.createdAt).toLocaleDateString()}
                                            </p>
                                        </div>
                                    </div>
                                    <ChevronDown size={20} className="text-slate-400" />
                                </div>
                                <div className="p-4 bg-slate-50 text-xs text-slate-600 leading-relaxed">
                                    <p className="font-bold mb-1 text-slate-800">Notes:</p>
                                    Patient record securely created in DynamoDB. AI-generated SOAP notes will appear here once audio has been processed.
                                    <button
                                        onClick={() => navigate(`/patient/${patientId}/review`)}
                                        className="mt-4 w-full bg-blue-100 hover:bg-blue-200 text-blue-700 font-semibold py-2.5 rounded-lg transition-colors text-sm flex items-center justify-center gap-2"
                                    >
                                        Review Draft Notes
                                    </button>
                                </div>
                            </div>
                        </div>
                    </section>
                </div>
            </div>

            {/* Mobile: Sticky Action Button */}
            <div className="md:hidden fixed bottom-0 left-0 right-0 p-4 bg-white/90 backdrop-blur-md border-t border-slate-200 z-50 rounded-t-[20px] shadow-[0px_-10px_30px_rgba(0,0,0,0.05)]">
                <button
                    onClick={() => navigate(`/patient/${patientId}/consultation`)}
                    className="w-full bg-[#196ee6] text-white font-bold py-[16px] rounded-[14px] flex items-center justify-center gap-3 shadow-lg hover:bg-blue-700 transition-colors"
                >
                    <PlusCircle size={22} />
                    Start New Consultation
                </button>
            </div>
        </div>
    );
}

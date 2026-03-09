import { useState, useEffect } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { fetchAuthSession } from 'aws-amplify/auth';
import {
    ArrowLeft, Plus, Trash2, Loader2, ChevronRight,
    Pill, FileText, AlertCircle,
} from 'lucide-react';
import { PRESCRIPTION_API_ENDPOINT } from '../aws-exports';

interface NoteData {
    subjective: string;
    objective: string;
    assessment: string;
    plan: string;
}

export interface Medicine {
    name: string;
    frequency: string;
    duration: string;
}

export interface Prescription {
    medicines: Medicine[];
    advice: string;
}

function emptyMedicine(): Medicine {
    return { name: '', frequency: '', duration: '' };
}

export default function PrescriptionPage() {
    const { patientId } = useParams<{ patientId: string }>();
    const navigate = useNavigate();
    const location = useLocation();
    const note = location.state?.note as NoteData | undefined;

    const [medicines, setMedicines] = useState<Medicine[]>([emptyMedicine()]);
    const [advice, setAdvice] = useState('');
    const [loading, setLoading] = useState(true);
    const [aiGenerated, setAiGenerated] = useState(false);
    const [apiError, setApiError] = useState(false);

    // Call the prescription extraction API on mount
    useEffect(() => {
        const extract = async () => {
            if (!note?.plan) {
                setLoading(false);
                return;
            }
            try {
                const session = await fetchAuthSession();
                const token = session.tokens?.idToken?.toString();
                const res = await fetch(PRESCRIPTION_API_ENDPOINT, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        ...(token ? { Authorization: `Bearer ${token}` } : {}),
                    },
                    body: JSON.stringify({ planText: note.plan }),
                });
                if (res.ok) {
                    const data = await res.json();
                    if (data.hasMedicines && data.medicines?.length > 0) {
                        setMedicines(data.medicines);
                        setAiGenerated(true);
                    }
                    if (data.advice) setAdvice(data.advice);
                } else {
                    setApiError(true);
                }
            } catch {
                setApiError(true);
            } finally {
                setLoading(false);
            }
        };
        extract();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const updateMedicine = (idx: number, field: keyof Medicine, value: string) => {
        setMedicines(prev => prev.map((m, i) => i === idx ? { ...m, [field]: value } : m));
    };

    const addMedicine = () => setMedicines(prev => [...prev, emptyMedicine()]);

    const removeMedicine = (idx: number) =>
        setMedicines(prev => prev.length > 1 ? prev.filter((_, i) => i !== idx) : prev);

    const handleContinue = () => {
        const prescription: Prescription = {
            medicines: medicines.filter(m => m.name.trim()),
            advice: advice.trim(),
        };
        navigate(`/patient/${patientId}/finalize`, { state: { note, prescription } });
    };

    const hasContent = medicines.some(m => m.name.trim()) || advice.trim();

    return (
        <div className="bg-[#f6f7f8] font-['Inter'] text-slate-900 min-h-screen flex flex-col items-center pb-24 md:pb-8">

            {/* Header */}
            <header className="flex w-full items-center bg-white p-4 sticky top-0 z-20 border-b border-slate-200">
                <button
                    onClick={() => navigate(`/patient/${patientId}/review`, { state: { note } })}
                    className="flex size-10 shrink-0 items-center justify-center rounded-full hover:bg-slate-100 cursor-pointer text-slate-900"
                >
                    <ArrowLeft size={24} />
                </button>
                <h2 className="text-lg font-bold leading-tight flex-1 text-center pr-10">Prescription</h2>
            </header>

            <main className="flex-1 w-full max-w-2xl lg:max-w-4xl px-4 pt-5 pb-8 space-y-5">

                {/* Status strip */}
                <div className={`flex items-center gap-2.5 px-4 py-2.5 rounded-2xl text-sm font-medium ${
                    loading
                        ? 'bg-blue-50 text-blue-600 border border-blue-100'
                        : aiGenerated
                            ? 'bg-emerald-50 text-emerald-700 border border-emerald-100'
                            : 'bg-amber-50 text-amber-700 border border-amber-100'
                }`}>
                    {loading ? (
                        <><Loader2 size={15} className="animate-spin shrink-0" />Extracting prescription from SOAP note…</>
                    ) : aiGenerated ? (
                        <><Pill size={15} className="shrink-0" />AI-extracted — review and edit before saving</>
                    ) : apiError ? (
                        <><AlertCircle size={15} className="shrink-0" />Could not auto-extract — fill in manually</>
                    ) : (
                        <><FileText size={15} className="shrink-0" />No medicines detected — add them manually</>
                    )}
                </div>

                {loading ? (
                    /* Loading skeleton */
                    <div className="space-y-3">
                        {[1, 2].map(i => (
                            <div key={i} className="bg-white rounded-2xl p-4 border border-slate-100 animate-pulse">
                                <div className="h-4 bg-slate-100 rounded w-2/3 mb-3" />
                                <div className="flex gap-2">
                                    <div className="h-8 bg-slate-100 rounded flex-1" />
                                    <div className="h-8 bg-slate-100 rounded flex-1" />
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <>
                        {/* Medicines section */}
                        <section className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
                            <div className="flex items-center justify-between px-4 pt-4 pb-3 border-b border-slate-100">
                                <div className="flex items-center gap-2">
                                    <Pill size={16} className="text-[#196ee6]" />
                                    <h3 className="font-semibold text-slate-800 text-sm">Medicines</h3>
                                </div>
                                <span className="text-xs text-slate-400 bg-slate-50 px-2.5 py-1 rounded-full border border-slate-200">
                                    {medicines.filter(m => m.name.trim()).length} added
                                </span>
                            </div>

                            <div className="divide-y divide-slate-50">
                                {/* Column headers */}
                                <div className="grid grid-cols-[1fr_1fr_1fr_2rem] gap-2 px-4 py-2 bg-slate-50">
                                    {['Medicine Name', 'Frequency', 'Duration', ''].map(h => (
                                        <span key={h} className="text-[10px] font-bold uppercase tracking-widest text-slate-400">{h}</span>
                                    ))}
                                </div>

                                {medicines.map((med, idx) => (
                                    <div key={idx} className="grid grid-cols-[1fr_1fr_1fr_2rem] gap-2 px-4 py-3 items-center">
                                        <input
                                            type="text"
                                            value={med.name}
                                            onChange={e => updateMedicine(idx, 'name', e.target.value)}
                                            placeholder="e.g. Paracetamol 500mg"
                                            className="text-sm bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#196ee6]/20 focus:border-[#196ee6] transition"
                                        />
                                        <input
                                            type="text"
                                            value={med.frequency}
                                            onChange={e => updateMedicine(idx, 'frequency', e.target.value)}
                                            placeholder="e.g. Twice daily"
                                            className="text-sm bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#196ee6]/20 focus:border-[#196ee6] transition"
                                        />
                                        <input
                                            type="text"
                                            value={med.duration}
                                            onChange={e => updateMedicine(idx, 'duration', e.target.value)}
                                            placeholder="e.g. 5 days"
                                            className="text-sm bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#196ee6]/20 focus:border-[#196ee6] transition"
                                        />
                                        <button
                                            onClick={() => removeMedicine(idx)}
                                            disabled={medicines.length === 1}
                                            className="flex items-center justify-center size-8 rounded-lg text-slate-400 hover:text-red-500 hover:bg-red-50 transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
                                        >
                                            <Trash2 size={15} />
                                        </button>
                                    </div>
                                ))}
                            </div>

                            <div className="px-4 pb-4 pt-2">
                                <button
                                    onClick={addMedicine}
                                    className="flex items-center gap-1.5 text-[#196ee6] text-sm font-semibold hover:bg-blue-50 px-3 py-2 rounded-xl transition-colors"
                                >
                                    <Plus size={16} />
                                    Add Medicine
                                </button>
                            </div>
                        </section>

                        {/* Advice section */}
                        <section className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
                            <div className="flex items-center gap-2 px-4 pt-4 pb-3 border-b border-slate-100">
                                <FileText size={16} className="text-[#196ee6]" />
                                <h3 className="font-semibold text-slate-800 text-sm">Advice / Instructions</h3>
                            </div>
                            <div className="p-4">
                                <textarea
                                    value={advice}
                                    onChange={e => setAdvice(e.target.value)}
                                    rows={4}
                                    placeholder="e.g. Drink plenty of water, take rest, avoid spicy food…"
                                    className="w-full text-sm bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#196ee6]/20 focus:border-[#196ee6] resize-none transition"
                                />
                            </div>
                        </section>

                        {/* Continue button — always enabled */}
                        <button
                            onClick={handleContinue}
                            className="w-full flex items-center justify-center gap-2 font-bold py-4 rounded-2xl text-base transition-all shadow-md bg-[#196ee6] hover:bg-blue-700 text-white shadow-[#196ee6]/20"
                        >
                            {hasContent ? 'Save Prescription & Continue' : 'Continue Without Prescription'}
                            <ChevronRight size={20} />
                        </button>
                    </>
                )}
            </main>
        </div>
    );
}

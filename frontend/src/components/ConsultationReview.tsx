import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { fetchAuthSession } from 'aws-amplify/auth';
import {
    ArrowLeft, Bold, Italic, List,
    ListOrdered, Link2, Wand2, CheckCircle, Loader2
} from 'lucide-react';
import { useConsultation } from '../contexts/ConsultationContext';
import { SOAP_API_ENDPOINT } from '../aws-exports';

interface SoapFields {
    subjective: string;
    objective: string;
    assessment: string;
    plan: string;
}

/**
 * Restore SOAP fields from the cached context string.
 * New format: JSON-serialized SoapFields object.
 * Legacy fallback: markdown string parsed with regex.
 */
function restoreSoapNote(cached: string): SoapFields {
    try {
        const parsed = JSON.parse(cached) as SoapFields;
        if (typeof parsed.subjective === 'string') return parsed;
    } catch { /* fall through to legacy regex parser */ }

    // Legacy markdown format: "**1. Subjective (S)**\n..."
    const extract = (label: string) => {
        const regex = new RegExp(
            `\\*\\*\\d+\\.\\s*${label}\\s*\\([A-Z]\\)\\*\\*\\n([\\s\\S]*?)(?=\\*\\*\\d+\\.|$)`,
            'i'
        );
        const match = cached.match(regex);
        return match ? match[1].trim() : '';
    };
    return {
        subjective: extract('Subjective'),
        objective: extract('Objective'),
        assessment: extract('Assessment'),
        plan: extract('Plan'),
    };
}

/** Build a basic SOAP template from the raw transcript when AI is unavailable. */
function buildClientFallback(transcript: string): SoapFields {
    return {
        subjective: transcript.trim(),
        objective: '',
        assessment: '',
        plan: '',
    };
}

export default function ConsultationReview() {
    const { patientId } = useParams();
    const navigate = useNavigate();
    const { finalTranscripts, insights, soapNote, setSoapNote } = useConsultation();

    const joinedTranscript = finalTranscripts.map(t => t.text).join('\n');

    const [note, setNote] = useState({
        subjective: joinedTranscript,
        objective: '',
        assessment: '',
        plan: '',
    });

    const [activeTab, setActiveTab] = useState<'doctor' | 'patient'>('doctor');
    const [loading, setLoading] = useState(false);
    const [aiGenerated, setAiGenerated] = useState(false);

    /** Calls the SOAP API; falls back to a client-side template on any failure. */
    const generateSoapNote = async () => {
        if (!joinedTranscript) return;
        setLoading(true);
        try {
            const session = await fetchAuthSession();
            const token = session.tokens?.idToken?.toString();
            const res = await fetch(SOAP_API_ENDPOINT, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    ...(token ? { Authorization: `Bearer ${token}` } : {}),
                },
                body: JSON.stringify({ consultationText: joinedTranscript }),
            });
            if (!res.ok) throw new Error(`SOAP API error: ${res.status}`);
            const data = await res.json();
            // API returns flat fields: { subjective, objective, assessment, plan }
            const structured: SoapFields = {
                subjective: data.subjective ?? '',
                objective: data.objective ?? '',
                assessment: data.assessment ?? '',
                plan: data.plan ?? '',
            };
            // Only count as AI-generated if at least objective or assessment are populated
            const isAi = !!(structured.objective || structured.assessment);
            setSoapNote(JSON.stringify(structured));
            setAiGenerated(isAi);
            setNote(prev => ({
                subjective: structured.subjective || prev.subjective,
                objective: structured.objective,
                assessment: structured.assessment,
                plan: structured.plan,
            }));
        } catch (err) {
            console.warn('SOAP API unavailable, using client fallback:', err);
            const fallback = buildClientFallback(joinedTranscript);
            setSoapNote(JSON.stringify(fallback));
            setAiGenerated(false);
            setNote(prev => ({ ...prev, ...fallback, subjective: fallback.subjective || prev.subjective }));
        } finally {
            setLoading(false);
        }
    };

    // On mount: use cached soapNote if available, otherwise call the API
    useEffect(() => {
        if (soapNote) {
            const parsed = restoreSoapNote(soapNote);
            const isAi = !!(parsed.objective || parsed.assessment);
            setAiGenerated(isAi);
            setNote(prev => ({
                subjective: parsed.subjective || prev.subjective,
                objective: parsed.objective,
                assessment: parsed.assessment,
                plan: parsed.plan,
            }));
        } else if (joinedTranscript) {
            generateSoapNote();
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    // Keep subjective in sync if transcript loads after mount
    useEffect(() => {
        if (joinedTranscript && !soapNote) {
            setNote(prev => ({ ...prev, subjective: joinedTranscript }));
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [finalTranscripts.length]);

    const handleSave = () => {
        // TODO: PUT the updated note to the backend
    };

    const handleFinalize = () => {
        navigate(`/patient/${patientId}/finalize`, { state: { note } });
    };

    return (
        <div className="bg-[#f6f7f8] font-['Inter'] text-slate-900 min-h-screen flex flex-col items-center">
            {/* Top App Bar */}
            <header className="flex w-full items-center bg-white p-4 sticky top-0 z-20 border-b border-slate-200">
                <div
                    onClick={() => navigate(`/patient/${patientId}`)}
                    className="flex size-10 shrink-0 items-center justify-center rounded-full hover:bg-slate-100 cursor-pointer text-slate-900"
                >
                    <ArrowLeft size={24} />
                </div>
                <h2 className="text-lg font-bold leading-tight flex-1 text-center pr-10">Consultation Review</h2>
                <div className="flex items-center justify-end absolute right-4">
                    <button onClick={handleSave} className="text-[#196ee6] font-semibold text-base">Save</button>
                </div>
            </header>

            {/* Content Area */}
            <main className="flex-1 flex flex-col w-full max-w-2xl lg:max-w-4xl bg-white shadow-sm min-h-[calc(100vh-64px)] pb-24 relative overflow-y-auto">
                {/* Toggle Tabs */}
                <div className="px-4 pt-4 pb-2 bg-white sticky top-0 z-10 w-full">
                    <div className="flex bg-slate-100 p-1 rounded-xl">
                        <button
                            onClick={() => setActiveTab('doctor')}
                            className={`flex-1 py-2 px-4 rounded-lg font-semibold text-sm transition-all text-center ${activeTab === 'doctor'
                                ? 'bg-white shadow-sm text-[#196ee6]'
                                : 'text-slate-500 hover:text-slate-700'
                                }`}
                        >
                            Doctor Note (SOAP)
                        </button>
                        <button
                            onClick={() => setActiveTab('patient')}
                            className={`flex-1 py-2 px-4 rounded-lg font-medium text-sm transition-all text-center ${activeTab === 'patient'
                                ? 'bg-white shadow-sm text-[#196ee6]'
                                : 'text-slate-500 hover:text-slate-700'
                                }`}
                        >
                            Patient Summary
                        </button>
                    </div>
                </div>

                {/* Insights summary chips — shown above the editor when insights exist */}
                <div className="px-4 py-3 bg-blue-50/60 border-b border-blue-100 flex flex-wrap gap-2">
                    {insights.symptoms.slice(0, 3).map(s => (
                        <span key={s} className="text-[11px] px-2 py-0.5 rounded-full bg-orange-100 text-orange-600 border border-orange-200 capitalize">{s}</span>
                    ))}
                    {insights.medications.slice(0, 2).map(m => (
                        <span key={m} className="text-[11px] px-2 py-0.5 rounded-full bg-green-100 text-green-700 border border-green-200 capitalize">{m}</span>
                    ))}
                    <span className="text-[11px] ml-auto self-center">
                        {aiGenerated
                            ? <span className="text-blue-400">✦ AI-generated note</span>
                            : <span className="text-slate-400">Transcript loaded — edit fields below</span>
                        }
                    </span>
                </div>

                {/* Formatting Toolbar */}
                <div className="flex justify-between items-center gap-2 px-4 py-2 border-b border-slate-100 bg-white sticky top-[64px] z-10 w-full">
                    <div className="flex gap-1 overflow-x-auto no-scrollbar">
                        <button className="p-2 rounded hover:bg-slate-100 text-slate-600 transition-colors">
                            <Bold size={18} />
                        </button>
                        <button className="p-2 rounded hover:bg-slate-100 text-slate-600 transition-colors">
                            <Italic size={18} />
                        </button>
                        <button className="p-2 rounded hover:bg-slate-100 text-slate-600 transition-colors">
                            <List size={18} />
                        </button>
                        <button className="p-2 rounded hover:bg-slate-100 text-slate-600 transition-colors">
                            <ListOrdered size={18} />
                        </button>
                        <button className="p-2 rounded hover:bg-slate-100 text-slate-600 transition-colors">
                            <Link2 size={18} />
                        </button>
                    </div>
                    <div className="h-6 w-px bg-slate-200 mx-1"></div>
                    <button
                        onClick={generateSoapNote}
                        disabled={loading || !joinedTranscript}
                        className="flex items-center gap-1 text-xs font-medium text-[#196ee6] bg-[#196ee6]/10 px-2 py-1.5 rounded-lg active:scale-95 transition-transform disabled:opacity-50"
                    >
                        {loading ? <Loader2 size={14} className="animate-spin" /> : <Wand2 size={14} />}
                        {loading ? 'Generating…' : 'AI Edit'}
                    </button>
                </div>

                {/* SOAP Note Content */}
                <div className="flex-1 px-4 py-6 space-y-6">
                    {activeTab === 'doctor' ? (
                        <>
                            {/* Subjective Section */}
                            <section className="group/section">
                                <div className="flex items-center gap-2 mb-3">
                                    <div className="size-6 rounded bg-[#196ee6]/10 text-[#196ee6] flex items-center justify-center font-bold text-xs ring-1 ring-[#196ee6]/20">S</div>
                                    <h3 className="text-slate-900 text-lg font-bold">Subjective</h3>
                                </div>
                                <div className="space-y-4">
                                    <label className="block">
                                        <span className="text-slate-500 text-xs font-bold uppercase tracking-wider mb-2 block pl-1">Patient History & Complaints</span>
                                        {loading ? (
                                            <div className="w-full rounded-xl border border-slate-200 bg-slate-50 p-4 min-h-[140px] flex items-center justify-center">
                                                <Loader2 size={24} className="animate-spin text-[#196ee6]" />
                                            </div>
                                        ) : (
                                            <textarea
                                                value={note.subjective}
                                                onChange={(e) => setNote({ ...note, subjective: e.target.value })}
                                                className="w-full resize-y rounded-xl border border-slate-200 bg-slate-50/50 focus:border-[#196ee6] focus:ring-2 focus:ring-[#196ee6]/20 transition-all text-slate-800 text-base leading-relaxed p-4 min-h-[140px]"
                                                placeholder="Enter patient complaints and history..."
                                            />
                                        )}
                                    </label>
                                </div>
                            </section>

                            {/* Objective Section */}
                            <section className="group/section pt-4 border-t border-dashed border-slate-200">
                                <div className="flex items-center gap-2 mb-3">
                                    <div className="size-6 rounded bg-[#196ee6]/10 text-[#196ee6] flex items-center justify-center font-bold text-xs ring-1 ring-[#196ee6]/20">O</div>
                                    <h3 className="text-slate-900 text-lg font-bold">Objective</h3>
                                </div>
                                <div className="space-y-4">
                                    <label className="block">
                                        <span className="text-slate-500 text-xs font-bold uppercase tracking-wider mb-2 block pl-1">Vitals & Exam Findings</span>
                                        {loading ? (
                                            <div className="w-full rounded-xl border border-slate-200 bg-slate-50 p-4 min-h-[140px] flex items-center justify-center">
                                                <Loader2 size={24} className="animate-spin text-[#196ee6]" />
                                            </div>
                                        ) : (
                                            <textarea
                                                value={note.objective}
                                                onChange={(e) => setNote({ ...note, objective: e.target.value })}
                                                className="w-full resize-y rounded-xl border border-slate-200 bg-slate-50/50 focus:border-[#196ee6] focus:ring-2 focus:ring-[#196ee6]/20 transition-all text-slate-800 text-base leading-relaxed p-4 min-h-[140px]"
                                                placeholder="Enter findings..."
                                            />
                                        )}
                                    </label>
                                </div>
                            </section>

                            {/* Assessment Section */}
                            <section className="group/section pt-4 border-t border-dashed border-slate-200">
                                <div className="flex items-center gap-2 mb-3">
                                    <div className="size-6 rounded bg-[#196ee6]/10 text-[#196ee6] flex items-center justify-center font-bold text-xs ring-1 ring-[#196ee6]/20">A</div>
                                    <h3 className="text-slate-900 text-lg font-bold">Assessment</h3>
                                </div>
                                <div className="space-y-4">
                                    <label className="block">
                                        {loading ? (
                                            <div className="w-full rounded-xl border border-slate-200 bg-slate-50 p-4 min-h-[120px] flex items-center justify-center">
                                                <Loader2 size={24} className="animate-spin text-[#196ee6]" />
                                            </div>
                                        ) : (
                                            <textarea
                                                value={note.assessment}
                                                onChange={(e) => setNote({ ...note, assessment: e.target.value })}
                                                className="w-full resize-y rounded-xl border border-slate-200 bg-slate-50/50 focus:border-[#196ee6] focus:ring-2 focus:ring-[#196ee6]/20 transition-all text-slate-800 text-base leading-relaxed p-4 min-h-[120px]"
                                                placeholder="Enter assessment..."
                                            />
                                        )}
                                    </label>
                                </div>
                            </section>

                            {/* Plan Section */}
                            <section className="group/section pt-4 border-t border-dashed border-slate-200">
                                <div className="flex items-center gap-2 mb-3">
                                    <div className="size-6 rounded bg-[#196ee6]/10 text-[#196ee6] flex items-center justify-center font-bold text-xs ring-1 ring-[#196ee6]/20">P</div>
                                    <h3 className="text-slate-900 text-lg font-bold">Plan</h3>
                                </div>
                                <div className="space-y-4">
                                    <label className="block">
                                        {loading ? (
                                            <div className="w-full rounded-xl border border-slate-200 bg-slate-50 p-4 min-h-[140px] flex items-center justify-center">
                                                <Loader2 size={24} className="animate-spin text-[#196ee6]" />
                                            </div>
                                        ) : (
                                            <textarea
                                                value={note.plan}
                                                onChange={(e) => setNote({ ...note, plan: e.target.value })}
                                                className="w-full resize-y rounded-xl border border-slate-200 bg-slate-50/50 focus:border-[#196ee6] focus:ring-2 focus:ring-[#196ee6]/20 transition-all text-slate-800 text-base leading-relaxed p-4 min-h-[140px]"
                                                placeholder="Enter plan..."
                                            />
                                        )}
                                    </label>
                                </div>
                            </section>
                        </>
                    ) : (
                        <div className="bg-blue-50/50 rounded-2xl p-6 border border-blue-100 flex flex-col gap-4">
                            <h3 className="text-xl font-bold text-slate-800">Your Summary</h3>
                            {loading ? (
                                <div className="flex items-center gap-2 text-slate-500">
                                    <Loader2 size={18} className="animate-spin" />
                                    <span>Generating patient summary…</span>
                                </div>
                            ) : (
                                <p className="text-slate-600 leading-relaxed text-lg whitespace-pre-wrap">
                                    {note.assessment || note.plan
                                        ? `${note.assessment}\n\n${note.plan}`
                                        : 'Patient summary will appear here after the AI generates the SOAP note.'}
                                </p>
                            )}
                        </div>
                    )}
                </div>
            </main>

            {/* Floating Action Button Area */}
            <div className="fixed bottom-6 w-full max-w-2xl lg:max-w-4xl px-6 z-20 flex justify-end">
                <button
                    onClick={handleFinalize}
                    disabled={loading}
                    className="flex items-center justify-center gap-2 bg-[#196ee6] hover:bg-blue-700 disabled:opacity-60 text-white shadow-xl hover:shadow-2xl hover:-translate-y-1 transition-all rounded-2xl py-4 px-8 font-bold text-lg tracking-wide w-full sm:w-auto"
                >
                    <CheckCircle size={22} className="stroke-[2.5]" />
                    Approve & Finalize
                </button>
            </div>
        </div>
    );
}

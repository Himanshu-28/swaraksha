import { useState, useRef, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
    ArrowLeft, Mic, MicOff, CheckCircle, Globe, Pause, Play,
    Activity, Pill, Clock, HeartPulse,
} from 'lucide-react';
import { useRealtimeSTT } from '../hooks/useRealtimeSTT';
import { useConsultation } from '../contexts/ConsultationContext';

// ── Helpers ──────────────────────────────────────────────────────────

const formatTime = (s: number) => {
    const h = Math.floor(s / 3600);
    const m = Math.floor((s % 3600) / 60);
    const sec = Math.floor(s % 60);
    return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}:${sec.toString().padStart(2, '0')}`;
};

const getLangLabel = (lang: string) => {
    if (!lang) return '';
    if (lang.startsWith('hi')) return '🇮🇳 Hindi';
    if (lang.startsWith('te')) return '🇮🇳 Telugu';
    if (lang.startsWith('en')) return '🇬🇧 English';
    return lang;
};

// Alternate speaker labels per entry index to simulate doctor/patient
const SPEAKERS = ['Patient', 'Doctor'] as const;
const AVATAR_COLORS = ['bg-violet-100 text-violet-600', 'bg-blue-100 text-blue-600'];

// ── WaveformBars ─────────────────────────────────────────────────────

function WaveformBars() {
    return (
        <span className="flex items-end gap-[3px] h-4">
            {[3, 5, 7, 5, 3].map((h, i) => (
                <span
                    key={i}
                    style={{ height: `${h * 2}px`, animationDelay: `${i * 0.12}s` }}
                    className="w-[3px] rounded-full bg-[#196ee6] animate-pulse"
                />
            ))}
        </span>
    );
}

// ── InsightBadge ─────────────────────────────────────────────────────

interface InsightBadgeProps {
    label: string;
    variant: 'symptom' | 'medication' | 'timeline';
}

function InsightBadge({ label, variant }: InsightBadgeProps) {
    const styles = {
        symptom: 'border border-orange-300 text-orange-600 bg-orange-50',
        medication: 'border border-green-300 text-green-700 bg-green-50',
        timeline: 'border border-blue-300 text-blue-600 bg-blue-50',
    };
    return (
        <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium capitalize ${styles[variant]}`}>
            {label}
        </span>
    );
}

// ── InsightsList ──────────────────────────────────────────────────────

function InsightsList({ insights }: { insights: { symptoms: string[]; medications: string[]; timeline: string[] } }) {
    return (
        <div className="flex flex-col gap-3">
            {insights.symptoms.length > 0 && (
                <div className="bg-white rounded-2xl p-4 shadow-sm border border-slate-200">
                    <div className="flex items-center gap-2 mb-3">
                        <span className="w-2.5 h-2.5 rounded-full bg-orange-400" />
                        <span className="font-semibold text-slate-700 text-sm">Symptoms</span>
                    </div>
                    <div className="flex flex-wrap gap-2">
                        {insights.symptoms.map(s => <InsightBadge key={s} label={s} variant="symptom" />)}
                    </div>
                </div>
            )}
            {insights.medications.length > 0 && (
                <div className="bg-white rounded-2xl p-4 shadow-sm border border-slate-200">
                    <div className="flex items-center gap-2 mb-3">
                        <Pill size={15} className="text-green-600" />
                        <span className="font-semibold text-slate-700 text-sm">Medications</span>
                    </div>
                    <div className="flex flex-wrap gap-2">
                        {insights.medications.map(m => <InsightBadge key={m} label={m} variant="medication" />)}
                    </div>
                </div>
            )}
            {insights.timeline.length > 0 && (
                <div className="bg-white rounded-2xl p-4 shadow-sm border border-slate-200">
                    <div className="flex items-center gap-2 mb-3">
                        <Clock size={15} className="text-blue-500" />
                        <span className="font-semibold text-slate-700 text-sm">Timeline</span>
                    </div>
                    <div className="flex flex-wrap gap-2">
                        {insights.timeline.map(t => <InsightBadge key={t} label={t} variant="timeline" />)}
                    </div>
                </div>
            )}
        </div>
    );
}

// ── ExtractedVitals ───────────────────────────────────────────────────

function ExtractedVitals() {
    return (
        <section>
            <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                    <HeartPulse size={16} className="text-[#196ee6]" />
                    <span className="text-[11px] font-bold uppercase tracking-widest text-slate-400">Extracted Entities</span>
                </div>
                <span className="text-[11px] font-semibold text-emerald-600 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200">Real-time</span>
            </div>
            <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
                <div className="flex items-center justify-between px-4 py-3 border-b border-slate-100">
                    <span className="font-semibold text-slate-700 text-sm">Vitals</span>
                    <span className="text-slate-300 text-lg">+</span>
                </div>
                <div className="grid grid-cols-2 divide-x divide-slate-100">
                    <div className="p-4 text-center">
                        <p className="text-[11px] text-slate-400 font-medium mb-1">Blood Pressure</p>
                        <p className="text-slate-300 text-sm italic">—</p>
                    </div>
                    <div className="p-4 text-center">
                        <p className="text-[11px] text-slate-400 font-medium mb-1">Heart Rate</p>
                        <p className="text-slate-300 text-sm italic">—</p>
                    </div>
                </div>
            </div>
        </section>
    );
}

// ── Main Component ───────────────────────────────────────────────────

export default function ActiveConsultation() {
    const { patientId } = useParams();
    const navigate = useNavigate();

    const {
        finalTranscripts,
        insights,
        recordingTime: _recordingTime,
        addTranscript,
        setRecordingTime: saveTime,
        startSession,
    } = useConsultation();

    const transcriptEndRef = useRef<HTMLDivElement | null>(null);
    const [localTime, setLocalTime] = useState(0);
    const [isPaused, setIsPaused] = useState(false);
    // Source of truth for display — accumulates across pause/resume cycles
    const [localTranscripts, setLocalTranscripts] = useState<typeof finalTranscripts>([]);

    // Start a fresh session for this patient
    useEffect(() => {
        if (patientId) {
            startSession(patientId);
            setLocalTranscripts([]);
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [patientId]);

    // Stable callback ref so onTranscript doesn't change between renders
    // (avoids re-creating the WS connection and avoids the React setState conflict)
    const pushEntryRef = useRef<(text: string, lang: string) => void>(null!);
    pushEntryRef.current = (text: string, lang: string) => {
        const entry = { text, language: lang, confidence: 0, timestamp: Date.now() };
        setLocalTranscripts(prev => [...prev, entry]);
    };

    // STT hook — use onTranscript callback for immediate, synchronous push
    const {
        isListening,
        isConnected,
        interimText,
        detectedLanguage,
        error,
        startListening,
        stopListening,
    } = useRealtimeSTT({
        onTranscript: (msg) => {
            if (msg.type === 'final' && msg.text) {
                pushEntryRef.current(msg.text, msg.language || '');
            }
        },
    });

    // Sync localTranscripts → context (in a separate effect so it never conflicts with renders)
    const lastSyncedRef = useRef(0);
    useEffect(() => {
        if (localTranscripts.length > lastSyncedRef.current) {
            const newEntries = localTranscripts.slice(lastSyncedRef.current);
            newEntries.forEach(e => addTranscript(e));
            lastSyncedRef.current = localTranscripts.length;
        }
    }, [localTranscripts, addTranscript]);

    // Auto-commit debounce: if isFinal never fires, commit interim after 2s of silence
    const lastInterimRef = useRef('');
    useEffect(() => {
        if (!interimText) return;
        lastInterimRef.current = interimText;
        const timer = setTimeout(() => {
            // Only commit if the interim still matches (no newer update came in)
            if (lastInterimRef.current === interimText && interimText.trim()) {
                const lang = detectedLanguage || '';
                pushEntryRef.current(interimText, lang);
            }
        }, 2000);
        return () => clearTimeout(timer);
    }, [interimText, detectedLanguage]);

    // Timer
    useEffect(() => {
        let timer: ReturnType<typeof setInterval>;
        if (isListening && !isPaused) {
            timer = setInterval(() => {
                setLocalTime(t => {
                    const next = t + 1;
                    saveTime(next);
                    return next;
                });
            }, 1000);
        }
        return () => clearInterval(timer);
    }, [isListening, isPaused, saveTime]);

    // Auto-scroll
    useEffect(() => {
        transcriptEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [finalTranscripts, interimText]);

    const handleStartStop = useCallback(() => {
        if (isListening) {
            if (isPaused) {
                setIsPaused(false);
            } else {
                setIsPaused(true);
                stopListening();
            }
        } else {
            setIsPaused(false);
            setLocalTime(0);
            startListening();
        }
    }, [isListening, isPaused, startListening, stopListening]);

    const handleFinish = useCallback(() => {
        stopListening();
        navigate(`/patient/${patientId}/review`);
    }, [stopListening, navigate, patientId]);

    const hasTranscripts = localTranscripts.length > 0;
    const hasInsights = insights.symptoms.length > 0 || insights.medications.length > 0 || insights.timeline.length > 0;

    return (
        <div className="bg-[#f0f2f5] font-['Inter'] antialiased min-h-screen flex flex-col overflow-hidden text-slate-900">

            {/* ── Header ── */}
            <header className="flex items-center justify-between px-4 py-3 bg-white border-b border-slate-200 shrink-0 z-10 sticky top-0">
                <button
                    onClick={() => navigate(`/patient/${patientId}`)}
                    className="flex items-center justify-center p-2 rounded-full hover:bg-slate-100 transition-colors"
                >
                    <ArrowLeft size={22} className="text-slate-700" />
                </button>

                <div className="flex flex-col items-center">
                    <h2 className="text-[15px] font-bold text-slate-800 leading-tight">Active Consultation</h2>
                    {isListening && !isPaused && (
                        <div className="flex items-center gap-1.5 mt-0.5">
                            <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse" />
                            <span className="text-[11px] text-slate-500 font-medium">Recording... {formatTime(localTime)}</span>
                        </div>
                    )}
                    {isPaused && (
                        <span className="text-[11px] text-amber-500 font-semibold mt-0.5">Paused — {formatTime(localTime)}</span>
                    )}
                </div>

                <button
                    onClick={handleStartStop}
                    className="flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-full border transition-colors
                        border-slate-200 text-slate-600 hover:bg-slate-50"
                >
                    {isListening && !isPaused ? (
                        <><Pause size={13} />Pause</>
                    ) : (
                        <><Play size={13} />{isListening ? 'Resume' : 'Start'}</>
                    )}
                </button>
            </header>

            {/* ── Recording Status Bar (full width) ── */}
            {!isListening && !hasTranscripts && (
                <div className="bg-white border-b border-slate-100 px-4 py-6 flex flex-col items-center gap-4 shrink-0">
                    <button
                        onClick={handleStartStop}
                        className="relative flex items-center justify-center cursor-pointer hover:scale-105 transition-transform"
                    >
                        <div className="w-20 h-20 bg-blue-50 rounded-full flex items-center justify-center hover:bg-blue-100 transition-colors border-2 border-blue-200">
                            <Mic size={32} className="text-[#196ee6]" />
                        </div>
                    </button>
                    <div className="text-center">
                        <p className="font-semibold text-slate-700">Tap to Start Recording</p>
                        <p className="text-sm text-slate-400 mt-0.5">Speak in English, Hindi, or Hinglish</p>
                    </div>
                    {error && (
                        <p className="text-sm text-red-500 bg-red-50 px-3 py-2 rounded-lg border border-red-100">{error}</p>
                    )}
                </div>
            )}

            {/* Listening Waveform Banner (full width) */}
            {isListening && !isPaused && (
                <div className="bg-[#196ee6]/5 border-b border-[#196ee6]/10 px-4 py-3 flex items-center justify-between shrink-0">
                    <div className="flex items-center gap-3">
                        <WaveformBars />
                        <span className="text-sm font-semibold text-[#196ee6]">Recording...</span>
                    </div>
                    {detectedLanguage && (
                        <div className="flex items-center gap-1 text-xs text-slate-500 bg-white px-2 py-1 rounded-full border border-slate-200">
                            <Globe size={11} />
                            {getLangLabel(detectedLanguage)}
                        </div>
                    )}
                    {isConnected && (
                        <span className="flex items-center gap-1 text-[11px] font-medium text-emerald-600">
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />Live
                        </span>
                    )}
                </div>
            )}

            {/* ── Two-column layout on desktop ── */}
            <div className="flex-1 flex flex-col md:flex-row overflow-hidden">

                {/* Left column: Transcript + Action Bar */}
                <div className="flex-1 flex flex-col overflow-hidden md:border-r md:border-slate-200">
                    <main className="flex-1 overflow-y-auto px-4 py-4 flex flex-col gap-4 pb-36 md:pb-4">

                        {/* Live Transcript */}
                        <section>
                            <div className="flex items-center gap-2 mb-3">
                                <span className="text-[11px] font-bold uppercase tracking-widest text-slate-400">Live Transcript</span>
                                {isListening && !isPaused && (
                                    <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
                                )}
                            </div>

                            <div className="flex flex-col gap-3">
                                {!hasTranscripts && !interimText ? (
                                    <div className="bg-white rounded-2xl p-5 shadow-sm border border-slate-200 text-center">
                                        <p className="text-slate-400 text-sm italic">
                                            {isListening
                                                ? 'Waiting for speech...'
                                                : 'Start recording to see the live transcript here.'}
                                        </p>
                                    </div>
                                ) : (
                                    <>
                                        {localTranscripts.map((entry, i) => {
                                            const speakerIdx = i % 2;
                                            const speaker = SPEAKERS[speakerIdx];
                                            const avatarStyle = AVATAR_COLORS[speakerIdx];
                                            const isDoctor = speakerIdx === 1;
                                            const ts = new Date(entry.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

                                            return (
                                                <div key={i} className={`flex gap-3 ${isDoctor ? 'flex-row-reverse' : ''}`}>
                                                    <div className={`shrink-0 w-9 h-9 rounded-full flex items-center justify-center text-sm font-bold ${avatarStyle}`}>
                                                        {speaker[0]}
                                                    </div>
                                                    <div className={`flex flex-col gap-1 max-w-[75%] ${isDoctor ? 'items-end' : 'items-start'}`}>
                                                        <div className="flex items-baseline gap-2">
                                                            <span className="text-xs font-semibold text-slate-600">{speaker}</span>
                                                            <span className="text-[10px] text-slate-400">{ts}</span>
                                                        </div>
                                                        <div className={`rounded-2xl px-4 py-3 shadow-sm text-sm leading-relaxed
                                                            ${isDoctor
                                                                ? 'bg-[#196ee6] text-white rounded-tr-sm'
                                                                : 'bg-white text-slate-800 rounded-tl-sm border border-slate-200'
                                                            }`}>
                                                            {entry.text}
                                                        </div>
                                                        {entry.language && (
                                                            <span className="text-[10px] text-slate-400 px-1">{getLangLabel(entry.language)}</span>
                                                        )}
                                                    </div>
                                                </div>
                                            );
                                        })}

                                        {interimText && (
                                            <div className="flex gap-3 items-end">
                                                <div className="shrink-0 w-9 h-9 rounded-full bg-violet-100 flex items-center justify-center text-sm font-bold text-violet-600">P</div>
                                                <div className="flex flex-col gap-1 items-start">
                                                    <div className="flex items-center gap-2 bg-white rounded-2xl rounded-tl-sm px-4 py-3 border border-slate-200 shadow-sm">
                                                        <WaveformBars />
                                                        <span className="text-slate-400 text-sm italic">{interimText}</span>
                                                    </div>
                                                    <span className="text-[10px] text-slate-400 px-1">Listening...</span>
                                                </div>
                                            </div>
                                        )}
                                    </>
                                )}
                                <div ref={transcriptEndRef} />
                            </div>
                        </section>

                        {/* Mobile: Insights inline */}
                        <div className="md:hidden">
                            {hasInsights && (
                                <section>
                                    <div className="flex items-center justify-between mb-3">
                                        <div className="flex items-center gap-2">
                                            <Activity size={16} className="text-[#196ee6]" />
                                            <span className="text-[11px] font-bold uppercase tracking-widest text-slate-400">Detected Insights</span>
                                        </div>
                                        <span className="text-[11px] font-semibold text-[#196ee6] bg-[#196ee6]/10 px-2.5 py-1 rounded-full">AI Active</span>
                                    </div>
                                    <InsightsList insights={insights} />
                                </section>
                            )}
                            {hasTranscripts && <ExtractedVitals />}
                        </div>
                    </main>

                    {/* Action Bar — absolute on mobile, static on desktop */}
                    <div className="absolute md:static bottom-0 left-0 right-0 md:left-auto md:right-auto bg-gradient-to-t md:bg-none from-[#f0f2f5] via-[#f0f2f5]/95 to-transparent pt-8 pb-5 px-4 md:pt-4 md:pb-4 md:border-t md:border-slate-200">
                        <div className="flex items-center gap-3">
                            <button
                                onClick={handleStartStop}
                                className="shrink-0 w-14 h-14 rounded-2xl border-2 border-slate-200 bg-white flex items-center justify-center text-slate-500 hover:bg-slate-50 transition-colors shadow-sm"
                            >
                                {isListening && !isPaused ? <Pause size={22} /> : isListening ? <Play size={22} /> : <MicOff size={22} />}
                            </button>
                            <button
                                onClick={handleFinish}
                                disabled={!hasTranscripts}
                                className={`flex-1 font-bold text-[16px] py-4 rounded-2xl shadow-lg flex items-center justify-center gap-2.5 transition-all active:scale-[0.98]
                                    ${!hasTranscripts
                                        ? 'bg-slate-200 text-slate-400 cursor-not-allowed shadow-none'
                                        : 'bg-[#196ee6] hover:bg-blue-700 text-white shadow-[#196ee6]/30'
                                    }`}
                            >
                                <CheckCircle size={22} />
                                Finish &amp; Generate Draft
                            </button>
                        </div>
                    </div>
                </div>

                {/* Right column: Insights (desktop only) */}
                <div className="hidden md:flex flex-col w-80 lg:w-96 overflow-y-auto bg-white p-4 gap-4">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                            <Activity size={16} className="text-[#196ee6]" />
                            <span className="text-[11px] font-bold uppercase tracking-widest text-slate-400">Detected Insights</span>
                        </div>
                        {hasInsights && (
                            <span className="text-[11px] font-semibold text-[#196ee6] bg-[#196ee6]/10 px-2.5 py-1 rounded-full">AI Active</span>
                        )}
                    </div>

                    {!hasInsights ? (
                        <div className="flex flex-col items-center justify-center flex-1 text-center py-12">
                            <Activity size={32} className="text-slate-200 mb-3" />
                            <p className="text-slate-400 text-sm">AI insights will appear here as you record.</p>
                        </div>
                    ) : (
                        <InsightsList insights={insights} />
                    )}

                    {hasTranscripts && <ExtractedVitals />}
                </div>
            </div>
        </div>
    );
}

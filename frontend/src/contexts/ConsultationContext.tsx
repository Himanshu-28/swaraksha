/**
 * ConsultationContext — shared, localStorage-persisted state for the consultation flow.
 *
 * Provides transcript entries, detected insights, and recording metadata so that
 * both ActiveConsultation and ConsultationReview read from the same source of truth,
 * surviving page refreshes and back-navigation.
 */

import { createContext, useContext, useState, useCallback, useEffect } from 'react';
import type { ReactNode } from 'react';
import type { TranscriptEntry } from '../hooks/useRealtimeSTT';

// ── Insight types ───────────────────────────────────────────────────

export interface Insights {
    symptoms: string[];
    medications: string[];
    timeline: string[];
}

// ── Keywords for inline extraction ──────────────────────────────────

const SYMPTOM_KEYWORDS = [
    'cough', 'fever', 'fatigue', 'headache', 'pain', 'ache', 'nausea',
    'vomiting', 'dizziness', 'shortness of breath', 'chest', 'cold', 'flu',
    'sore throat', 'runny nose', 'congestion', 'rash', 'swelling', 'tired',
    'weakness', 'chills', 'thigh', 'knee', 'back', 'stomach', 'radiation',
    'discomfort', 'pressure', 'tightness', 'burning', 'itching',
];

const MED_KEYWORDS = [
    'ibuprofen', 'paracetamol', 'acetaminophen', 'tylenol', 'aspirin',
    'antibiotic', 'amoxicillin', 'metformin', 'insulin', 'omeprazole',
    'atorvastatin', 'cough syrup', 'antihistamine', 'inhaler', 'tablet',
    'capsule', 'medicine', 'medication', 'drug', 'prescription',
];

const TIMELINE_KEYWORDS = [
    'yesterday', 'today', 'this morning', 'last night', 'last week',
    'last month', 'this week', 'a few days', 'recently', 'since',
    'for the past', 'for about', 'evenings', 'nights', 'mornings',
];
const DURATION_REGEX = /\b(\d+)\s*(day|days|week|weeks|month|months|hour|hours)\b/gi;

function extractInsights(text: string): Partial<Insights> {
    const lower = text.toLowerCase();
    const found: Partial<Insights> = {};

    const symptoms = SYMPTOM_KEYWORDS.filter(k => lower.includes(k));
    if (symptoms.length) found.symptoms = symptoms;

    const medications = MED_KEYWORDS.filter(k => lower.includes(k));
    if (medications.length) found.medications = medications;

    const timeline: string[] = [];
    TIMELINE_KEYWORDS.forEach(k => { if (lower.includes(k)) timeline.push(k); });
    const durationMatches = text.match(DURATION_REGEX) || [];
    durationMatches.forEach(m => { if (!timeline.includes(m.toLowerCase())) timeline.push(m.toLowerCase()); });
    if (timeline.length) found.timeline = timeline;

    return found;
}

function mergeInsights(prev: Insights, next: Partial<Insights>): Insights {
    const mergeArr = (a: string[], b: string[] = []) =>
        Array.from(new Set([...a, ...b]));
    return {
        symptoms: mergeArr(prev.symptoms, next.symptoms),
        medications: mergeArr(prev.medications, next.medications),
        timeline: mergeArr(prev.timeline, next.timeline),
    };
}

// ── Storage key ──────────────────────────────────────────────────────
const STORAGE_KEY = 'swaraksha_consultation';

interface StoredData {
    patientId: string;
    finalTranscripts: TranscriptEntry[];
    insights: Insights;
    recordingTime: number;
    soapNote: string;
}

function loadFromStorage(): StoredData | null {
    try {
        const raw = localStorage.getItem(STORAGE_KEY);
        return raw ? JSON.parse(raw) : null;
    } catch {
        return null;
    }
}

function saveToStorage(data: StoredData) {
    try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
    } catch { /* ignore quota errors */ }
}

// ── Context shape ─────────────────────────────────────────────────────

interface ConsultationContextValue {
    patientId: string;
    finalTranscripts: TranscriptEntry[];
    insights: Insights;
    recordingTime: number;
    soapNote: string;
    /** Call this when the STT hook emits a new final transcript entry */
    addTranscript: (entry: TranscriptEntry) => void;
    /** Update elapsed recording time */
    setRecordingTime: (t: number) => void;
    /** Clear everything and set the active patient */
    startSession: (patientId: string) => void;
    /** Store the AI-generated SOAP note so it survives navigation */
    setSoapNote: (note: string) => void;
}

const ConsultationContext = createContext<ConsultationContextValue | null>(null);

export function ConsultationProvider({ children }: { children: ReactNode }) {
    const [state, setState] = useState<StoredData>(() => {
        const stored = loadFromStorage();
        return stored ?? {
            patientId: '',
            finalTranscripts: [],
            insights: { symptoms: [], medications: [], timeline: [] },
            recordingTime: 0,
            soapNote: '',
        };
    });

    // Persist to localStorage whenever state changes
    useEffect(() => {
        saveToStorage(state);
    }, [state]);

    const startSession = useCallback((patientId: string) => {
        const fresh: StoredData = {
            patientId,
            finalTranscripts: [],
            insights: { symptoms: [], medications: [], timeline: [] },
            recordingTime: 0,
            soapNote: '',
        };
        setState(fresh);
        saveToStorage(fresh);
    }, []);

    const addTranscript = useCallback((entry: TranscriptEntry) => {
        setState(prev => {
            const newInsights = extractInsights(entry.text);
            return {
                ...prev,
                finalTranscripts: [...prev.finalTranscripts, entry],
                insights: mergeInsights(prev.insights, newInsights),
            };
        });
    }, []);

    const setRecordingTime = useCallback((t: number) => {
        setState(prev => ({ ...prev, recordingTime: t }));
    }, []);

    const setSoapNote = useCallback((note: string) => {
        setState(prev => ({ ...prev, soapNote: note }));
    }, []);

    return (
        <ConsultationContext.Provider value={{
            ...state,
            addTranscript,
            setRecordingTime,
            startSession,
            setSoapNote,
        }}>
            {children}
        </ConsultationContext.Provider>
    );
}

export function useConsultation() {
    const ctx = useContext(ConsultationContext);
    if (!ctx) throw new Error('useConsultation must be used inside <ConsultationProvider>');
    return ctx;
}

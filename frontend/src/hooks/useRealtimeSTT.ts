/**
 * useRealtimeSTT — React hook for real-time Speech-to-Text via WebSocket.
 *
 * Connects to the Swaraksha STT WebSocket service, streams Base64-encoded
 * 16kHz PCM audio, and provides interim/final transcript state.
 *
 * Protocol:
 *   1. onopen  → send { sample_rate: 16000 }
 *   2. onmsg   → wait for { status: 'ready' }
 *   3. stream  → send { audioData: <base64 int16 PCM> }
 *   4. receive → { transcript, isFinal, language_code }
 *
 * Usage:
 *   const { interimText, finalTranscripts, isListening, startListening, stopListening }
 *     = useRealtimeSTT();
 */

import { useState, useRef, useCallback, useEffect } from "react";

// ── Types ────────────────────────────────────────────────────────

export interface TranscriptMessage {
    type: "interim" | "final" | "utterance_end" | "speech_started" | "ready" | "error";
    text: string;
    language?: string;
    confidence?: number;
    isFinal?: boolean;
    message?: string;
}

export interface TranscriptEntry {
    text: string;
    language: string;
    confidence: number;
    timestamp: number;
}

export interface UseRealtimeSTTOptions {
    /** WebSocket URL of the STT server */
    serverUrl?: string;
    /** Audio sample rate (must match server config) */
    sampleRate?: number;
    /** Language hint ('multi' for auto-detect) */
    language?: string;
    /** Called on each transcript message */
    onTranscript?: (msg: TranscriptMessage) => void;
    /** Called on error */
    onError?: (error: string) => void;
}


// ── Hook ─────────────────────────────────────────────────────────

export function useRealtimeSTT(options: UseRealtimeSTTOptions = {}) {
    const {
        serverUrl = import.meta.env.VITE_STT_WS_URL || "wss://stt.swaraksha.click",
        sampleRate = 16000,
        onTranscript,
        onError,
    } = options;

    // State
    const [isListening, setIsListening] = useState(false);
    const [isConnected, setIsConnected] = useState(false);
    const [interimText, setInterimText] = useState("");
    const [finalTranscripts, setFinalTranscripts] = useState<TranscriptEntry[]>([]);
    const [detectedLanguage, setDetectedLanguage] = useState("");
    const [error, setError] = useState<string | null>(null);

    // Refs for cleanup
    const wsRef = useRef<WebSocket | null>(null);
    const streamRef = useRef<MediaStream | null>(null);
    const audioContextRef = useRef<AudioContext | null>(null);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const processorRef = useRef<any>(null);
    const detectedLanguageRef = useRef("");

    // Keep ref in sync
    useEffect(() => {
        detectedLanguageRef.current = detectedLanguage;
    }, [detectedLanguage]);

    // ── Cleanup ──────────────────────────────────────────────────

    const cleanup = useCallback(() => {
        if (processorRef.current) {
            try { processorRef.current.disconnect(); } catch (_) { }
            processorRef.current = null;
        }
        if (audioContextRef.current) {
            audioContextRef.current.close();
            audioContextRef.current = null;
        }
        if (streamRef.current) {
            streamRef.current.getTracks().forEach((track) => track.stop());
            streamRef.current = null;
        }
        if (wsRef.current) {
            wsRef.current.close();
            wsRef.current = null;
        }
        setIsListening(false);
        setIsConnected(false);
    }, []);

    useEffect(() => {
        return cleanup;
    }, [cleanup]);

    // ── Start Listening ──────────────────────────────────────────

    const startListening = useCallback(async () => {
        try {
            setError(null);
            setInterimText("");

            // 1. Get microphone access
            const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
            streamRef.current = stream;

            // 2. Connect WebSocket
            const ws = new WebSocket(serverUrl);
            wsRef.current = ws;

            // 3. On open: send sample_rate config and wait for 'ready'
            await new Promise<void>((resolve, reject) => {
                const timeout = setTimeout(() => {
                    ws.close();
                    reject(new Error("WebSocket connection timeout"));
                }, 10000);

                ws.onopen = () => {
                    setIsConnected(true);
                    ws.send(JSON.stringify({ sample_rate: sampleRate }));
                };

                ws.onerror = () => {
                    clearTimeout(timeout);
                    reject(new Error("WebSocket connection failed"));
                };

                // Wait for server ready signal before resolving
                ws.onmessage = (event) => {
                    try {
                        const msg = JSON.parse(
                            typeof event.data === 'string' ? event.data : new TextDecoder().decode(event.data)
                        );
                        if (msg.status === 'ready') {
                            clearTimeout(timeout);
                            resolve();
                        } else if (msg.error) {
                            clearTimeout(timeout);
                            reject(new Error(msg.error));
                        }
                    } catch (_) { }
                };
            });

            // 4. Handle incoming transcript messages
            ws.onmessage = (event) => {
                try {
                    const msg = JSON.parse(
                        typeof event.data === 'string' ? event.data : new TextDecoder().decode(event.data)
                    );

                    if (msg.transcript !== undefined) {
                        // Accept both camelCase (isFinal) and snake_case (is_final) from server
                        // eslint-disable-next-line @typescript-eslint/no-explicit-any
                        const isFinal = !!(msg.isFinal ?? (msg as any).is_final);
                        console.log('[STT]', JSON.stringify({ transcript: msg.transcript, isFinal, raw_isFinal: msg.isFinal, raw_is_final: (msg as any).is_final }));
                        const text: string = msg.transcript;
                        const lang: string = msg.language_code || "";

                        onTranscript?.({
                            type: isFinal ? "final" : "interim",
                            text,
                            language: lang,
                        });

                        if (isFinal) {
                            setInterimText("");
                            if (text) {
                                setFinalTranscripts((prev) => [
                                    ...prev,
                                    { text, language: lang, confidence: 0, timestamp: Date.now() },
                                ]);
                            }
                        } else {
                            setInterimText(text);
                        }

                        if (lang) setDetectedLanguage(lang);
                    } else if (msg.error) {
                        const errMsg: string = msg.error;
                        setError(errMsg);
                        onError?.(errMsg);
                    }
                } catch (e) {
                    console.warn("Failed to parse STT message:", e);
                }
            };

            ws.onclose = () => {
                setIsConnected(false);
                setIsListening(false);
            };

            // 5. Capture audio at 16kHz, encode as Base64 Int16 PCM, send as JSON
            const audioCtx = new AudioContext({ sampleRate: 16000 });
            audioContextRef.current = audioCtx;

            const source = audioCtx.createMediaStreamSource(stream);
            // ScriptProcessor: 4096 samples at 16kHz ≈ 256ms chunks
            const processor = audioCtx.createScriptProcessor(4096, 1, 1);
            processorRef.current = processor;

            processor.onaudioprocess = (e) => {
                if (ws.readyState !== WebSocket.OPEN) return;

                const float32 = e.inputBuffer.getChannelData(0);
                const int16 = new Int16Array(float32.length);
                for (let i = 0; i < float32.length; i++) {
                    const s = Math.max(-1, Math.min(1, float32[i]));
                    int16[i] = s < 0 ? s * 0x8000 : s * 0x7FFF;
                }

                // Base64-encode the raw PCM bytes
                const bytes = new Uint8Array(int16.buffer);
                let binary = '';
                for (let i = 0; i < bytes.byteLength; i++) {
                    binary += String.fromCharCode(bytes[i]);
                }
                const base64Audio = btoa(binary);

                ws.send(JSON.stringify({ audioData: base64Audio }));
            };

            source.connect(processor);
            processor.connect(audioCtx.destination);

            setIsListening(true);
        } catch (e: unknown) {
            const errMsg = (e as Error).message || "Failed to start listening";
            setError(errMsg);
            onError?.(errMsg);
            cleanup();
        }
    }, [serverUrl, sampleRate, onTranscript, onError, cleanup]);

    // ── Stop Listening ───────────────────────────────────────────

    const stopListening = useCallback(() => {
        cleanup();
        setInterimText("");
    }, [cleanup]);

    // ── Clear Transcripts ────────────────────────────────────────

    const clearTranscripts = useCallback(() => {
        setFinalTranscripts([]);
        setInterimText("");
    }, []);

    return {
        isListening,
        isConnected,
        interimText,
        finalTranscripts,
        detectedLanguage,
        error,
        startListening,
        stopListening,
        clearTranscripts,
    };
}

export default useRealtimeSTT;

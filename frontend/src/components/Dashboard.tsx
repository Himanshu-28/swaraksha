import React, { useState, useRef, useEffect } from 'react';
import { Mic, Square, Upload, FileText, Loader2, Pill } from 'lucide-react';

interface Note {
    id: string;
    date: string;
    patientName: string;
    summary: string;
}

interface SoapNote {
    subjective: string;
    objective: string;
    assessment: string;
    plan: string;
}

export const Dashboard: React.FC = () => {
    const [isRecording, setIsRecording] = useState(false);
    const [audioBlob, setAudioBlob] = useState<Blob | null>(null);
    const [isUploading, setIsUploading] = useState(false);
    const [recentNotes, setRecentNotes] = useState<Note[]>([]);
    const [loadingNotes, setLoadingNotes] = useState(true);
    const [soapData, setSoapData] = useState<SoapNote | null>(null);

    const mediaRecorderRef = useRef<MediaRecorder | null>(null);
    const audioChunksRef = useRef<Blob[]>([]);

    // Fetch recent doctor's notes from API Gateway
    useEffect(() => {
        const fetchNotes = async () => {
            try {
                setLoadingNotes(true);
                // Using Amplify API to fetch from our REST endpoint
                // const restOperation = get({ apiName: 'DrsAPI', path: '/notes' });
                // const { body } = await restOperation.response;
                // const data = await body.json();

                // Mock data since API is placeholder
                setTimeout(() => {
                    setRecentNotes([
                        { id: '1', date: '2026-03-04', patientName: 'John Doe', summary: 'Follow-up for hypertension.' },
                        { id: '2', date: '2026-03-03', patientName: 'Jane Smith', summary: 'Routine checkup.' }
                    ]);
                    setLoadingNotes(false);
                }, 800);
            } catch (error) {
                console.error('Error fetching notes:', error);
                setLoadingNotes(false);
            }
        };
        fetchNotes();
    }, []);

    const handleStartRecording = async () => {
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
            const mediaRecorder = new MediaRecorder(stream);
            mediaRecorderRef.current = mediaRecorder;
            audioChunksRef.current = [];

            mediaRecorder.ondataavailable = (event) => {
                if (event.data.size > 0) {
                    audioChunksRef.current.push(event.data);
                }
            };

            mediaRecorder.onstop = () => {
                const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/wav' });
                setAudioBlob(audioBlob);

                // Mock SOAP Note generation delay upon recording complete
                generateMockSoapNote();
            };

            mediaRecorder.start();
            setIsRecording(true);
        } catch (error) {
            console.error('Error accessing microphone:', error);
        }
    };

    const handleStopRecording = () => {
        if (mediaRecorderRef.current && isRecording) {
            mediaRecorderRef.current.stop();
            setIsRecording(false);
            // Stop all tracks to release microphone
            mediaRecorderRef.current.stream.getTracks().forEach((track) => track.stop());
        }
    };

    const generateMockSoapNote = () => {
        setTimeout(() => {
            setSoapData({
                subjective: 'Patient reports mild headaches and occasional dizziness over the past week. Pain is described as a dull ache.',
                objective: 'BP: 130/80, HR: 72 bpm, Temp: 98.6°F. No distress. Neurological exam within normal limits.',
                assessment: 'Tension headache versus mild dehydration.',
                plan: 'Increase water intake to 2L daily. Prescribed Acetaminophen 500mg as needed for headaches. Follow up in 2 weeks if symptoms persist.'
            });
        }, 2000);
    };

    const handleUploadAudio = async () => {
        if (!audioBlob) return;

        setIsUploading(true);
        try {
            // const filename = `recording-${Date.now()}.wav`;

            // Upload to S3 using AWS Amplify Storage
            /*
            await uploadData({
              key: filename,
              data: audioBlob,
              options: { contentType: 'audio/wav' }
            }).result;
            */

            // Simulate network wait
            await new Promise(resolve => setTimeout(resolve, 1500));

            alert('Audio successfully uploaded to S3!');
            setAudioBlob(null);
        } catch (error) {
            console.error('Error uploading audio:', error);
            alert('Failed to upload audio.');
        } finally {
            setIsUploading(false);
        }
    };

    return (
        <div className="min-h-screen bg-slate-50 text-slate-900 font-sans">
            {/* Header */}
            <header className="bg-white border-b border-slate-200 sticky top-0 z-10 px-6 py-4 flex items-center justify-between shadow-sm">
                <div className="flex items-center space-x-2">
                    <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
                        <Pill className="text-white w-5 h-5" />
                    </div>
                    <h1 className="text-xl font-bold tracking-tight text-slate-800">Swaraksha API</h1>
                </div>
                <div className="flex items-center space-x-4">
                    <div className="text-sm font-medium text-slate-500">Dr. Smith</div>
                    <div className="w-10 h-10 bg-slate-200 rounded-full border-2 border-white shadow-sm flex items-center justify-center overflow-hidden">
                        <img src="https://api.dicebear.com/7.x/avataaars/svg?seed=Felix" alt="Doctor avatar" />
                    </div>
                </div>
            </header>

            {/* Main Content Multi-Column Layout */}
            <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">

                    {/* Left Column: Actions & History */}
                    <div className="lg:col-span-4 space-y-6">

                        {/* Audio Recording Card */}
                        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6">
                            <h2 className="text-lg font-semibold text-slate-800 mb-4 flex items-center">
                                <Mic className="w-5 h-5 mr-2 text-blue-500" />
                                New Visit Recording
                            </h2>

                            <div className="flex flex-col items-center justify-center p-8 bg-slate-50 rounded-xl border-2 border-dashed border-slate-200 mb-4 transition-all duration-300">
                                {isRecording ? (
                                    <div className="flex flex-col items-center">
                                        <div className="relative flex justify-center items-center w-20 h-20">
                                            <div className="absolute animate-ping inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></div>
                                            <div className="relative w-16 h-16 bg-red-500 rounded-full flex items-center justify-center shadow-lg cursor-pointer hover:bg-red-600 transition-colors" onClick={handleStopRecording}>
                                                <Square className="text-white w-6 h-6 fill-current" />
                                            </div>
                                        </div>
                                        <p className="mt-4 text-sm font-medium text-red-500 animate-pulse">Recording Audio...</p>
                                    </div>
                                ) : (
                                    <div className="flex flex-col items-center">
                                        <button
                                            onClick={handleStartRecording}
                                            className="w-16 h-16 bg-blue-600 rounded-full flex items-center justify-center shadow-md hover:bg-blue-700 hover:scale-105 transition-all"
                                        >
                                            <Mic className="text-white w-6 h-6" />
                                        </button>
                                        <p className="mt-4 text-sm font-medium text-slate-600">Tap to Start Recording</p>
                                    </div>
                                )}
                            </div>

                            {audioBlob && !isRecording && (
                                <div className="bg-blue-50 rounded-xl p-4 flex flex-col space-y-3">
                                    <div className="flex items-center justify-between">
                                        <span className="text-sm font-medium text-blue-800">Audio Ready</span>
                                        <span className="text-xs font-semibold px-2 py-1 bg-blue-200 text-blue-800 rounded-full">WAV File</span>
                                    </div>
                                    <button
                                        onClick={handleUploadAudio}
                                        disabled={isUploading}
                                        className="w-full flex items-center justify-center py-2 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors disabled:opacity-50"
                                    >
                                        {isUploading ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Upload className="w-4 h-4 mr-2" />}
                                        {isUploading ? 'Uploading to S3...' : 'Upload Audio Data'}
                                    </button>
                                </div>
                            )}
                        </div>

                        {/* Recent Notes List */}
                        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6">
                            <h2 className="text-lg font-semibold text-slate-800 mb-4 flex items-center">
                                <FileText className="w-5 h-5 mr-2 text-slate-400" />
                                Recent Notes (Gateway)
                            </h2>
                            {loadingNotes ? (
                                <div className="flex justify-center p-6"><Loader2 className="w-6 h-6 text-blue-500 animate-spin" /></div>
                            ) : (
                                <ul className="space-y-3">
                                    {recentNotes.map(note => (
                                        <li key={note.id} className="p-3 bg-slate-50 rounded-lg border border-slate-100 hover:border-blue-200 transition-colors cursor-pointer">
                                            <div className="flex justify-between items-start mb-1">
                                                <span className="font-medium text-sm text-slate-900">{note.patientName}</span>
                                                <span className="text-xs text-slate-500">{note.date}</span>
                                            </div>
                                            <p className="text-sm text-slate-600 line-clamp-2">{note.summary}</p>
                                        </li>
                                    ))}
                                </ul>
                            )}
                        </div>

                    </div>

                    {/* Right Column: AI Generated SOAP Notes */}
                    <div className="lg:col-span-8">
                        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 h-full flex flex-col overflow-hidden">
                            <div className="px-6 py-5 border-b border-slate-100 bg-slate-50/50">
                                <h2 className="text-lg font-semibold text-slate-800">AI Generated SOAP Note</h2>
                                <p className="text-sm text-slate-500 mt-1">Automatically transcribed and structured from audio upload.</p>
                            </div>

                            <div className="p-6 flex-1 bg-white">
                                {!soapData ? (
                                    <div className="h-full flex flex-col items-center justify-center text-center p-12 lg:min-h-[400px]">
                                        <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mb-4">
                                            <FileText className="w-10 h-10 text-slate-300" />
                                        </div>
                                        <h3 className="text-lg font-medium text-slate-700">No Active Note</h3>
                                        <p className="text-slate-500 mt-2 max-w-sm">
                                            Start recording the patient visit audio to automatically generate a structured SOAP note.
                                        </p>
                                    </div>
                                ) : (
                                    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
                                        {/* S: Subjective */}
                                        <div className="group">
                                            <h3 className="text-xs font-bold uppercase tracking-wider text-blue-600 mb-2 flex items-center">
                                                <span className="w-6 h-6 rounded bg-blue-100 flex items-center justify-center mr-2">S</span>
                                                Subjective
                                            </h3>
                                            <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 text-sm text-slate-700 leading-relaxed group-hover:border-blue-200 transition-colors">
                                                {soapData.subjective}
                                            </div>
                                        </div>

                                        {/* O: Objective */}
                                        <div className="group">
                                            <h3 className="text-xs font-bold uppercase tracking-wider text-indigo-600 mb-2 flex items-center">
                                                <span className="w-6 h-6 rounded bg-indigo-100 flex items-center justify-center mr-2">O</span>
                                                Objective
                                            </h3>
                                            <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 text-sm text-slate-700 leading-relaxed group-hover:border-indigo-200 transition-colors">
                                                {soapData.objective}
                                            </div>
                                        </div>

                                        {/* A: Assessment */}
                                        <div className="group">
                                            <h3 className="text-xs font-bold uppercase tracking-wider text-purple-600 mb-2 flex items-center">
                                                <span className="w-6 h-6 rounded bg-purple-100 flex items-center justify-center mr-2">A</span>
                                                Assessment
                                            </h3>
                                            <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 text-sm text-slate-700 leading-relaxed group-hover:border-purple-200 transition-colors">
                                                {soapData.assessment}
                                            </div>
                                        </div>

                                        {/* P: Plan */}
                                        <div className="group">
                                            <h3 className="text-xs font-bold uppercase tracking-wider text-emerald-600 mb-2 flex items-center">
                                                <span className="w-6 h-6 rounded bg-emerald-100 flex items-center justify-center mr-2">P</span>
                                                Plan & Prescriptions
                                            </h3>
                                            <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 text-sm text-slate-700 leading-relaxed group-hover:border-emerald-200 transition-colors">
                                                {soapData.plan}
                                            </div>
                                        </div>

                                        <div className="pt-4 flex justify-end space-x-3 border-t border-slate-100">
                                            <button className="px-4 py-2 text-sm font-medium text-slate-600 bg-white border border-slate-300 rounded-lg shadow-sm hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-slate-500">
                                                Edit Note
                                            </button>
                                            <button className="px-4 py-2 text-sm font-medium text-white bg-slate-800 rounded-lg shadow-sm hover:bg-slate-900 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-slate-900">
                                                Save to Patient Record
                                            </button>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>

                </div>
            </main>
        </div>
    );
};

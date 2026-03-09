import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, ChevronRight, Loader2, Users } from 'lucide-react';
import { fetchAuthSession } from 'aws-amplify/auth';
import { API_ENDPOINT } from '../aws-exports';

interface Patient {
    patientId: string;
    patientName: string;
    age: string;
    gender?: string;
    createdAt: string;
    [key: string]: any;
}

export default function PatientsPage() {
    const navigate = useNavigate();
    const [patients, setPatients] = useState<Patient[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');

    useEffect(() => {
        const load = async () => {
            setIsLoading(true);
            try {
                const session = await fetchAuthSession();
                const token = session.tokens?.idToken?.toString();
                if (!token) throw new Error('No token');
                const res = await fetch(`${API_ENDPOINT}/patients`, {
                    headers: { Authorization: `Bearer ${token}` },
                });
                const data = await res.json();
                const sorted = (data.patients || []).sort(
                    (a: Patient, b: Patient) =>
                        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
                );
                setPatients(sorted);
            } catch (err) {
                console.error('Failed to load patients', err);
                setPatients([]);
            } finally {
                setIsLoading(false);
            }
        };
        load();
    }, []);

    const filtered = patients.filter(p => {
        const q = searchQuery.toLowerCase();
        return (
            !q ||
            p.patientName?.toLowerCase().includes(q) ||
            p.patientId?.toLowerCase().includes(q)
        );
    });

    return (
        <div className="flex flex-col min-h-screen bg-[#f8fafc] pb-20 md:pb-0">

            {/* Header */}
            <div className="bg-white border-b border-slate-100 px-6 py-5 md:px-8">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Patients</h1>
                        <p className="text-slate-500 text-sm mt-0.5">
                            {isLoading ? 'Loading…' : `${patients.length} patient${patients.length !== 1 ? 's' : ''} registered`}
                        </p>
                    </div>
                    <div className="border border-[#e2e8f0] flex items-center justify-center overflow-clip p-px rounded-full size-[40px] cursor-pointer bg-slate-100">
                        <img
                            src="https://ui-avatars.com/api/?name=Dr.+Smith&background=random"
                            alt="Doctor Profile"
                            className="w-full h-full rounded-full object-cover"
                        />
                    </div>
                </div>

                {/* Search */}
                <div className="bg-[#f8fafc] flex h-[48px] items-center overflow-clip px-4 rounded-[14px] border border-slate-200 w-full mt-4">
                    <Search size={18} className="text-[#94a3b8] mr-3 shrink-0" />
                    <input
                        type="text"
                        placeholder="Search by name or ID…"
                        value={searchQuery}
                        onChange={e => setSearchQuery(e.target.value)}
                        className="flex-1 bg-transparent border-none outline-none text-[15px] text-slate-900 placeholder-slate-400"
                    />
                </div>
            </div>

            {/* Content */}
            <div className="flex-1 px-4 md:px-8 py-6">
                {isLoading ? (
                    <div className="flex justify-center py-16">
                        <Loader2 size={28} className="animate-spin text-[#196ee6]" />
                    </div>
                ) : filtered.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-20 text-center">
                        <div className="w-16 h-16 rounded-2xl bg-slate-100 flex items-center justify-center mb-4">
                            <Users size={28} className="text-slate-400" />
                        </div>
                        <h3 className="font-semibold text-slate-700 text-lg mb-1">
                            {searchQuery ? 'No results found' : 'No patients yet'}
                        </h3>
                        <p className="text-slate-400 text-sm max-w-xs">
                            {searchQuery
                                ? `No patients match "${searchQuery}". Try a different search.`
                                : 'Add your first patient from the Dashboard.'}
                        </p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                        {filtered.map((patient, index) => {
                            const nameParts = patient.patientName?.split(' ') || [];
                            const initials = nameParts.length > 1
                                ? `${nameParts[0][0]}${nameParts[nameParts.length - 1][0]}`.toUpperCase()
                                : (patient.patientName?.[0] || 'U').toUpperCase();
                            const joinedDate = new Date(patient.createdAt).toLocaleDateString('en-US', {
                                month: 'short', day: 'numeric', year: 'numeric',
                            });

                            return (
                                <div
                                    key={patient.patientId || index}
                                    onClick={() => navigate(`/patient/${patient.patientId}`)}
                                    className="bg-white border border-slate-100 rounded-2xl p-4 shadow-sm cursor-pointer hover:shadow-md hover:border-slate-200 transition-all"
                                >
                                    <div className="flex items-center gap-3">
                                        {index % 2 === 0 ? (
                                            <div className="size-12 rounded-full overflow-hidden shrink-0">
                                                <img
                                                    src={`https://ui-avatars.com/api/?name=${encodeURIComponent(patient.patientName || 'Unknown')}&background=random`}
                                                    alt="avatar"
                                                    className="size-full object-cover"
                                                />
                                            </div>
                                        ) : (
                                            <div className="size-12 rounded-full bg-[#dbeafe] flex items-center justify-center shrink-0">
                                                <span className="font-bold text-[#196ee6] text-lg">{initials}</span>
                                            </div>
                                        )}
                                        <div className="flex-1 min-w-0">
                                            <h4 className="font-semibold text-slate-900 text-sm truncate">{patient.patientName}</h4>
                                            <p className="text-slate-400 text-xs mt-0.5">
                                                Age {patient.age}
                                                {patient.gender ? ` · ${patient.gender}` : ''}
                                            </p>
                                        </div>
                                        <ChevronRight size={18} className="text-slate-300 shrink-0" />
                                    </div>
                                    <div className="mt-3 pt-3 border-t border-slate-50 flex items-center justify-between">
                                        <span className="text-[11px] text-slate-400 font-mono">
                                            #{patient.patientId?.substring(0, 8).toUpperCase()}
                                        </span>
                                        <span className="text-[11px] text-slate-400">Added {joinedDate}</span>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>
        </div>
    );
}

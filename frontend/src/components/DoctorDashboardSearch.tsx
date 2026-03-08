import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Home, Users, Calendar, User, Menu, Search, CalendarPlus, FolderOpen, ChevronRight, Plus, Loader2, LogOut, Stethoscope } from 'lucide-react';
import { fetchAuthSession, signOut } from 'aws-amplify/auth';
import CreateNewPatientModal from './CreateNewPatientModal';
import { API_ENDPOINT } from '../aws-exports';

interface Patient {
    patientId: string;
    patientName: string;
    age: string;
    createdAt: string;
    [key: string]: any ;
}

export default function DoctorDashboardSearch() {
    const navigate = useNavigate();
    const [isNewPatientModalOpen, setIsNewPatientModalOpen] = useState(false);
    const [patients, setPatients] = useState<any[]> ([]);
    const [isLoadingPatients, setIsLoadingPatients] = useState(true);

    const loadPatients = async () => {
        setIsLoadingPatients(true);
        try {
            const session = await fetchAuthSession();
            const token = session.tokens?.idToken?.toString();

            if (!token) throw new Error("No token");

            const res = await fetch(`${API_ENDPOINT}/patients`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            const data = await res.json();
            // Sort patients by creation date descending
            const sortedPatients = (data.patients || []).sort((a: Patient, b: Patient) =>
                new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
            );
            setPatients(sortedPatients);
        } catch (err) {
            console.error('Failed to load patients', err);
            setPatients([]);
        } finally {
            setIsLoadingPatients(false);
        }
    };

    useEffect(() => {
        loadPatients();
    }, []);

    return (
        <div className="bg-[#f8fafc] flex min-h-screen">

            {/* ── Desktop Left Sidebar ── */}
            <aside className="hidden md:flex flex-col w-64 shrink-0 bg-white border-r border-slate-100 sticky top-0 h-screen">
                {/* Logo */}
                <div className="flex items-center gap-3 px-6 py-5 border-b border-slate-100">
                    <div className="w-9 h-9 rounded-xl bg-[#196ee6] flex items-center justify-center shadow-sm">
                        <Stethoscope size={18} color="white" />
                    </div>
                    <span className="text-lg font-bold text-slate-900 tracking-tight">Swarksha</span>
                </div>

                {/* Nav Links */}
                <nav className="flex flex-col gap-1 p-3 flex-1 mt-2">
                    {[
                        { icon: Home, label: 'Home', active: true },
                        { icon: Users, label: 'Patients', active: false },
                        { icon: Calendar, label: 'Schedule', active: false },
                        { icon: User, label: 'Profile', active: false },
                    ].map(({ icon: Icon, label, active }) => (
                        <button
                            key={label}
                            className={`flex items-center gap-3 px-4 py-2.5 rounded-xl font-medium text-sm transition-colors ${active
                                ? 'bg-[#eff6ff] text-[#196ee6]'
                                : 'text-slate-500 hover:bg-slate-50 hover:text-slate-800'
                                }`}
                        >
                            <Icon size={18} />
                            {label}
                        </button>
                    ))}
                </nav>

                {/* Online status + Sign out */}
                <div className="p-4 border-t border-slate-100 space-y-2">
                    <div className="flex items-center gap-2 px-4 py-2">
                        <div className="bg-[#22c55e] rounded-full size-[8px]" />
                        <p className="font-medium text-[#64748b] text-xs">Online</p>
                    </div>
                    <button
                        onClick={() => signOut()}
                        className="flex items-center gap-3 px-4 py-2.5 rounded-xl font-medium text-sm text-slate-500 hover:bg-red-50 hover:text-red-600 transition-colors w-full"
                    >
                        <LogOut size={18} />
                        Sign Out
                    </button>
                </div>
            </aside>

            {/* ── Main Content ── */}
            <div className="flex flex-col flex-1 min-w-0">

                {/* Mobile Bottom Navigation */}
                <div className="md:hidden fixed bg-white border-[#f1f5f9] border-solid border-t bottom-0 content-stretch flex flex-col items-start left-0 pt-[9px] px-[24px] w-full z-[3]">
                    <div className="absolute bg-[rgba(255,255,255,0)] bottom-0 left-0 shadow-[0px_-4px_6px_-1px_rgba(0,0,0,0.02)] top-[-1px] w-full" />
                    <div className="relative shrink-0 w-full mb-4">
                        <div className="flex items-end justify-between pb-[16px] relative w-full">
                            <div className="flex flex-[1_0_0] flex-col gap-[4px] items-center cursor-pointer">
                                <Home size={24} className="text-[#196ee6]" />
                                <p className="font-['Inter'] font-medium text-[#196ee6] text-[10px] leading-[15px]">Home</p>
                            </div>
                            <div className="flex flex-[1_0_0] flex-col gap-[4px] items-center cursor-pointer">
                                <Users size={24} className="text-[#94a3b8]" />
                                <p className="font-['Inter'] font-medium text-[#94a3b8] text-[10px] leading-[15px]">Patients</p>
                            </div>
                            <div className="flex flex-[1_0_0] flex-col gap-[4px] items-center cursor-pointer">
                                <Calendar size={24} className="text-[#94a3b8]" />
                                <p className="font-['Inter'] font-medium text-[#94a3b8] text-[10px] leading-[15px]">Schedule</p>
                            </div>
                            <div className="flex flex-[1_0_0] flex-col gap-[4px] items-center cursor-pointer">
                                <User size={24} className="text-[#94a3b8]" />
                                <p className="font-['Inter'] font-medium text-[#94a3b8] text-[10px] leading-[15px]">Profile</p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Header */}
                <div className="bg-white flex items-center justify-between pb-[8px] px-[24px] pt-[24px] shrink-0 w-full z-[2] md:border-b md:border-slate-100 md:px-8 md:py-4">
                    <div className="flex items-center justify-center rounded-full size-[40px] cursor-pointer md:hidden">
                        <Menu size={24} className="text-[#64748b]" />
                    </div>
                    <div className="hidden md:block">
                        <h1 className="text-xl font-bold text-slate-800">Dashboard</h1>
                    </div>
                    <div className="flex gap-[8px] items-center">
                        <div className="bg-[#22c55e] rounded-full size-[8px] md:hidden" />
                        <p className="font-['Inter'] font-medium text-[#64748b] text-[12px] leading-[16px] md:hidden">Online</p>
                    </div>
                    <div className="border border-[#e2e8f0] flex items-center justify-center overflow-clip p-px rounded-full size-[40px] cursor-pointer bg-slate-100">
                        <img src="https://ui-avatars.com/api/?name=Dr.+Smith&background=random" alt="Doctor Profile" className="w-full h-full rounded-full object-cover" />
                    </div>
                </div>

                {/* Scrollable content */}
                <div className="flex flex-col items-start overflow-y-auto pb-[96px] md:pb-8 pt-[32px] px-[24px] md:px-8 w-full z-[1]">

                    {/* Welcome Message */}
                    <div className="flex flex-col items-start pb-[40px] w-full">
                        <div className="flex flex-col gap-[8px] items-start w-full">
                            <h1 className="font-['Inter'] font-bold text-[#0f172a] text-[30px] tracking-[-0.75px]">
                                Good Morning, Dr. Smith
                            </h1>
                            <p className="font-['Inter'] font-normal text-[#64748b] text-[16px]">
                                Ready to start your rounds?
                            </p>
                        </div>
                    </div>

                    {/* Search Section */}
                    <div className="flex flex-col items-start pb-[40px] w-full">
                        <div className="bg-white flex h-[56px] items-center overflow-clip px-[16px] rounded-[16px] shadow-sm border border-slate-200 w-full">
                            <Search size={20} className="text-[#94a3b8] mr-3" />
                            <input
                                type="text"
                                placeholder="Search Patient by Name or ID"
                                className="flex-1 bg-transparent border-none outline-none text-[16px] text-[#0f172a] placeholder-[#94a3b8]"
                            />
                        </div>
                    </div>

                    {/* Quick Actions Grid */}
                    <div className="flex flex-col gap-4 pb-[32px] w-full md:flex-row">
                        {/* Main Action */}
                        <div
                            className="bg-[#196ee6] flex flex-col items-center justify-center py-[24px] rounded-[16px] shadow-md cursor-pointer transition-transform hover:scale-[1.02] md:flex-1"
                            onClick={() => setIsNewPatientModalOpen(true)}
                        >
                            <div className="bg-white/20 flex items-center justify-center rounded-full size-[48px] mb-3">
                                <Plus size={24} className="text-white" />
                            </div>
                            <h2 className="font-['Inter'] font-semibold text-[18px] text-white">New Patient</h2>
                            <p className="font-['Inter'] text-[14px] text-blue-100 mt-1">Create a new record</p>
                        </div>

                        {/* Secondary Actions Row */}
                        <div className="flex gap-4 w-full md:w-auto md:flex-1">
                            <div className="bg-white border border-[#f1f5f9] flex flex-1 flex-col items-center justify-center py-[16px] rounded-[16px] shadow-sm cursor-pointer transition-colors hover:bg-slate-50">
                                <div className="bg-[#eff6ff] flex items-center justify-center rounded-full size-[40px] mb-2">
                                    <CalendarPlus size={20} className="text-[#196ee6]" />
                                </div>
                                <p className="font-['Inter'] font-medium text-[14px] text-[#334155]">Schedule</p>
                            </div>
                            <div className="bg-white border border-[#f1f5f9] flex flex-1 flex-col items-center justify-center py-[16px] rounded-[16px] shadow-sm cursor-pointer transition-colors hover:bg-slate-50">
                                <div className="bg-[#eff6ff] flex items-center justify-center rounded-full size-[40px] mb-2">
                                    <FolderOpen size={20} className="text-[#196ee6]" />
                                </div>
                                <p className="font-['Inter'] font-medium text-[14px] text-[#334155]">Records</p>
                            </div>
                        </div>
                    </div>

                    {/* Recent Patients */}
                    <div className="flex flex-col gap-[16px] w-full">
                        <div className="flex items-center justify-between w-full">
                            <h3 className="font-['Inter'] font-semibold text-[#0f172a] text-[18px]">Recent Patients</h3>
                            <span className="font-['Inter'] font-medium text-[#196ee6] text-[14px] cursor-pointer hover:underline">View All</span>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-[12px] w-full">
                            {isLoadingPatients ? (
                                <div className="flex justify-center py-4 col-span-full">
                                    <Loader2 size={24} className="animate-spin text-blue-500" />
                                </div>
                            ) : patients.length === 0 ? (
                                <div className="text-center p-8 text-slate-500 font-['Inter'] text-sm bg-white rounded-[16px] col-span-full">
                                    No patients found. Click "New Patient" to add one.
                                </div>
                            ) : (
                                patients.map((patient, index) => {
                                    const nameParts = patient.patientName?.split(' ') || [];
                                    const initials = nameParts.length > 1
                                        ? `${nameParts[0][0]}${nameParts[nameParts.length - 1][0]}`.toUpperCase()
                                        : (patient.patientName?.[0] || 'U').toUpperCase();

                                    return (
                                        <div
                                            key={patient.patientId || index}
                                            onClick={() => navigate(`/patient/${patient.patientId}`)}
                                            className="bg-white border border-[#f1f5f9] flex items-center p-[16px] rounded-[12px] shadow-sm cursor-pointer hover:shadow-md transition-shadow"
                                        >
                                            {index % 2 === 0 ? (
                                                <div className="size-[40px] rounded-full overflow-hidden shrink-0">
                                                    <img src={`https://ui-avatars.com/api/?name=${encodeURIComponent(patient.patientName || 'Unknown')}&background=random`} alt="Patient avatar" className="size-full object-cover" />
                                                </div>
                                            ) : (
                                                <div className="size-[40px] rounded-full bg-[#dbeafe] flex items-center justify-center shrink-0">
                                                    <span className="font-['Inter'] font-bold text-[#196ee6] text-[16px]">
                                                        {initials}
                                                    </span>
                                                </div>
                                            )}
                                            <div className="flex-1 pl-[12px]">
                                                <h4 className="font-['Inter'] font-semibold text-[#0f172a] text-[14px]">{patient.patientName}</h4>
                                                <p className="font-['Inter'] text-[#64748b] text-[12px] mt-0.5">ID: {patient.patientId?.substring(0, 8)} • Age: {patient.age}</p>
                                            </div>
                                            <ChevronRight size={20} className="text-[#94a3b8]" />
                                        </div>
                                    );
                                })
                            )}
                        </div>
                    </div>

                </div>
            </div>

            {/* Modal */}
            {isNewPatientModalOpen && (
                <CreateNewPatientModal
                    onClose={() => setIsNewPatientModalOpen(false)}
                    onSuccess={() => {
                        setIsNewPatientModalOpen(false);
                        loadPatients();
                    }}
                />
            )}
        </div>
    );
}

import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Menu, Search, CalendarPlus, FolderOpen, ChevronRight, Loader2 } from 'lucide-react';
import { fetchAuthSession } from 'aws-amplify/auth';
import { API_ENDPOINT } from '../aws-exports';
import { useDoctorProfile } from '../contexts/DoctorProfileContext';

interface Patient {
    patientId: string;
    patientName: string;
    age: string;
    createdAt: string;
    [key: string]: any ;
}

export default function DoctorDashboardSearch() {
    const navigate = useNavigate();
    const { displayName, initials } = useDoctorProfile();
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
        <div className="flex flex-col flex-1 min-w-0 min-h-screen bg-[#f8fafc]">

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
                    <div className="border border-[#e2e8f0] flex items-center justify-center overflow-clip p-px rounded-full size-[40px] cursor-pointer bg-[#dbeafe]">
                        <span className="font-bold text-[#196ee6] text-sm">{initials}</span>
                    </div>
                </div>

                {/* Scrollable content */}
                <div className="flex flex-col items-start overflow-y-auto pb-[96px] md:pb-8 pt-[32px] px-[24px] md:px-8 w-full z-[1]">

                    {/* Welcome Message */}
                    <div className="flex flex-col items-start pb-[40px] w-full">
                        <div className="flex flex-col gap-[8px] items-start w-full">
                            <h1 className="font-['Inter'] font-bold text-[#0f172a] text-[30px] tracking-[-0.75px]">
                                Good Morning, {displayName}
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
                        {/* Secondary Actions Row */}
                        <div className="flex gap-4 w-full">
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
                            <span className="font-['Inter'] font-medium text-[#196ee6] text-[14px] cursor-pointer hover:underline" onClick={() => navigate('/patients')}>View All</span>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-[12px] w-full">
                            {isLoadingPatients ? (
                                <div className="flex justify-center py-4 col-span-full">
                                    <Loader2 size={24} className="animate-spin text-blue-500" />
                                </div>
                            ) : patients.length === 0 ? (
                                <div className="text-center p-8 text-slate-500 font-['Inter'] text-sm bg-white rounded-[16px] col-span-full">
                                    No patients yet — patients will appear here once they sign up on Swarksha.
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
    );
}

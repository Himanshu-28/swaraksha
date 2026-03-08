import { useState } from 'react';
import { Camera, User, Calendar, ChevronDown, CheckCircle2, Phone, X, Loader2 } from 'lucide-react';
import { fetchAuthSession } from 'aws-amplify/auth';
import { API_ENDPOINT } from '../aws-exports';

interface CreateNewPatientModalProps {
    onClose: () => void;
    onSuccess: () => void;
}

export default function CreateNewPatientModal({ onClose, onSuccess }: CreateNewPatientModalProps) {
    const [fullName, setFullName] = useState('');
    const [dob, setDob] = useState('');
    const [gender, setGender] = useState('');
    const [phone, setPhone] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [errorMsg, setErrorMsg] = useState('');

    const handleSubmit = async () => {
        if (!fullName) {
            setErrorMsg("Full Name is required");
            return;
        }

        setIsLoading(true);
        setErrorMsg('');

        try {
            // Get Cognito JWT Token
            const session = await fetchAuthSession();
            const token = session.tokens?.idToken?.toString();

            if (!token) throw new Error("Authentication error");

            // Format age (basic calc for demo)
            let age = 0;
            if (dob) {
                const birthYear = new Date(dob).getFullYear();
                if (!isNaN(birthYear)) {
                    age = new Date().getFullYear() - birthYear;
                }
            }

            const payload = {
                patientName: fullName,
                age: age || 30, // Default if not parsed
                gender: gender || 'unknown',
                contactNumber: phone
            };

            const response = await fetch(`${API_ENDPOINT}/patients`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify(payload)
            });

            if (!response.ok) {
                throw new Error("Failed to create patient");
            }

            onSuccess(); // Close modal and refresh list

        } catch (err: any ) {
            console.error(err);
            setErrorMsg(err.message || "An error occurred");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex flex-col justify-end md:items-center md:justify-center backdrop-blur-[2px] bg-black/40 pt-10 md:pt-0">
            {/* Modal Content */}
            <div className="bg-white flex flex-col items-start w-full md:max-w-lg md:rounded-2xl max-h-[90vh] overflow-y-auto rounded-t-[16px] shadow-[0px_25px_50px_-12px_rgba(0,0,0,0.25)] animate-in slide-in-from-bottom duration-300 md:animate-none">

                {/* Modal Header */}
                <div className="border-b border-[#f0f2f4] flex items-center justify-between py-[20px] px-[20px] w-full sticky top-0 bg-white z-10">
                    <div className="flex flex-col gap-[2px] items-start">
                        <h3 className="font-['Inter'] font-bold text-[#111418] text-[20px] leading-[28px]">New Patient</h3>
                        <p className="font-['Inter'] font-normal text-[#637288] text-[14px] leading-[20px]">
                            Create a record for a new visitor.
                        </p>
                    </div>
                    <button
                        onClick={onClose}
                        className="bg-[#f6f7f8] flex items-center justify-center rounded-full size-[32px] hover:bg-slate-200 transition-colors"
                    >
                        <X size={16} className="text-slate-600" />
                    </button>
                </div>

                {/* Modal Body */}
                <div className="flex flex-col gap-[20px] items-start p-[20px] w-full">

                    {/* Avatar Upload */}
                    <div className="flex justify-center w-full pb-2">
                        <div className="relative">
                            <div className="bg-[#f6f7f8] border-2 border-[rgba(45,55,72,0.2)] border-dashed rounded-full flex items-center justify-center size-[96px]">
                                <Camera size={32} className="text-slate-400" />
                            </div>
                            <button className="absolute bottom-0 right-0 bg-[#196ee6] flex items-center justify-center rounded-full size-[32px] shadow-md hover:bg-blue-700 transition-colors border-2 border-white">
                                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                    <path d="M17 3a2.828 2.828 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5L17 3z"></path>
                                </svg>
                            </button>
                        </div>
                    </div>

                    {/* Error Message */}
                    {errorMsg && (
                        <div className="w-full bg-red-100 text-red-600 p-3 rounded-lg text-sm font-medium">
                            {errorMsg}
                        </div>
                    )}

                    {/* Input: Full Name */}
                    <div className="flex flex-col gap-[6.5px] w-full">
                        <label className="font-['Inter'] font-medium text-[#111418] text-[14px]">Full Name</label>
                        <div className="bg-[#f6f7f8] flex items-center p-[13px] rounded-[12px] w-full border border-transparent focus-within:border-blue-500 focus-within:ring-1 focus-within:ring-blue-500 transition-all">
                            <User size={18} className="text-slate-400 mr-[12px]" />
                            <input
                                type="text"
                                placeholder="e.g. Sarah Connor"
                                value={fullName}
                                onChange={(e) => setFullName(e.target.value)}
                                className="bg-transparent border-none outline-none w-full font-['Inter'] text-[14px] text-[#111418] placeholder-slate-400"
                            />
                        </div>
                    </div>

                    {/* Input Group: DOB & Gender */}
                    <div className="flex gap-[16px] w-full">
                        <div className="flex flex-1 flex-col gap-[6.5px]">
                            <label className="font-['Inter'] font-medium text-[#111418] text-[14px]">Date of Birth</label>
                            <div className="bg-[#f6f7f8] flex items-center p-[13px] rounded-[12px] border border-transparent focus-within:border-blue-500 focus-within:ring-1 focus-within:ring-blue-500 transition-all">
                                <Calendar size={18} className="text-slate-400 mr-[12px]" />
                                <input
                                    type="date"
                                    value={dob}
                                    onChange={(e) => setDob(e.target.value)}
                                    className="bg-transparent border-none outline-none w-full font-['Inter'] text-[14px] text-[#111418] placeholder-slate-400"
                                />
                            </div>
                        </div>
                        <div className="flex flex-1 flex-col gap-[6.5px]">
                            <label className="font-['Inter'] font-medium text-[#111418] text-[14px]">Gender</label>
                            <div className="bg-[#f6f7f8] flex items-center px-[13px] py-[13px] rounded-[12px] relative border border-transparent focus-within:border-blue-500 focus-within:ring-1 focus-within:ring-blue-500 transition-all cursor-pointer">
                                <select
                                    value={gender}
                                    onChange={(e) => setGender(e.target.value)}
                                    className="bg-transparent border-none outline-none w-full font-['Inter'] text-[14px] text-[#111418] appearance-none cursor-pointer"
                                >
                                    <option value="" disabled>Select</option>
                                    <option value="male">Male</option>
                                    <option value="female">Female</option>
                                    <option value="other">Other</option>
                                </select>
                                <ChevronDown size={16} className="text-slate-500 absolute right-[12px] pointer-events-none" />
                            </div>
                        </div>
                    </div>

                    {/* Input: Patient ID (Auto-generated look) */}
                    <div className="flex flex-col gap-[6px] w-full">
                        <div className="flex justify-between items-center w-full">
                            <label className="font-['Inter'] font-medium text-[#111418] text-[14px]">Patient ID</label>
                            <button className="font-['Inter'] font-normal text-[#196ee6] text-[12px] hover:underline">
                                Generate New
                            </button>
                        </div>
                        <div className="bg-[#f6f7f8] flex items-center p-[13px] rounded-[12px] w-full border border-transparent">
                            <svg className="mr-[12px] text-slate-400 size-[20px]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 6H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V8a2 2 0 00-2-2h-5m-4 0V5a2 2 0 114 0v1m-4 0a2 2 0 104 0m-5 8a2 2 0 100-4 2 2 0 000 4zm0 0c1.306 0 2.417.835 2.83 2M9 14a3.001 3.001 0 00-2.83 2M15 11h3m-3 4h2" />
                            </svg>
                            <input
                                type="text"
                                value="PAT-2023-8839"
                                readOnly
                                className="bg-transparent border-none outline-none w-full font-['Inter'] text-[14px] text-[#111418] font-medium opacity-70"
                            />
                            <CheckCircle2 size={18} className="text-emerald-500" />
                        </div>
                    </div>

                    {/* Input: Contact Number */}
                    <div className="flex flex-col gap-[6.5px] w-full">
                        <label className="font-['Inter'] font-medium text-[#111418] text-[14px]">Phone Number</label>
                        <div className="bg-[#f6f7f8] flex items-center p-[13px] rounded-[12px] w-full border border-transparent focus-within:border-blue-500 focus-within:ring-1 focus-within:ring-blue-500 transition-all">
                            <Phone size={18} className="text-slate-400 mr-[12px]" />
                            <input
                                type="tel"
                                placeholder="(555) 000-0000"
                                value={phone}
                                onChange={(e) => setPhone(e.target.value)}
                                className="bg-transparent border-none outline-none w-full font-['Inter'] text-[14px] text-[#111418] placeholder-slate-400"
                            />
                        </div>
                    </div>

                </div>

                {/* Modal Footer */}
                <div className="border-t border-[#f0f2f4] flex flex-col gap-[12px] p-[20px] w-full bg-white pb-safe">
                    <button
                        onClick={onClose}
                        disabled={isLoading}
                        className="bg-[#f6f7f8] font-['Inter'] font-semibold text-[#111418] text-[14px] rounded-[12px] py-[12px] w-full hover:bg-slate-200 transition-colors disabled:opacity-50"
                    >
                        Cancel
                    </button>
                    <button
                        onClick={handleSubmit}
                        disabled={isLoading}
                        className="bg-[#196ee6] flex gap-[8px] items-center justify-center font-['Inter'] font-bold text-white text-[14px] rounded-[12px] py-[12px] w-full shadow-[0px_4px_6px_-4px_rgba(59,130,246,0.5)] hover:bg-blue-700 transition-colors px-[24px] disabled:opacity-70"
                    >
                        {isLoading ? <Loader2 size={16} className="animate-spin" /> : <User size={16} />}
                        {isLoading ? 'Processing...' : 'Add Patient'}
                    </button>
                </div>
            </div>
        </div>
    );
}

import { createContext, useContext, useState, type ReactNode } from 'react';

const STORAGE_KEY = 'swarksha_doctor_profile';

export interface DoctorProfile {
    fullName: string;
    specialty: string;
    email: string;
    phone: string;
    hospital: string;
    licenseNumber: string;
}

const DEFAULT_PROFILE: DoctorProfile = {
    fullName: '',
    specialty: '',
    email: '',
    phone: '',
    hospital: '',
    licenseNumber: '',
};

interface DoctorProfileContextValue {
    profile: DoctorProfile;
    updateProfile: (updated: DoctorProfile) => void;
    /** Initials derived from fullName (e.g. "Ananya Sharma" → "AS") */
    initials: string;
    /** Display name — fullName if set, otherwise "Doctor" */
    displayName: string;
}

const DoctorProfileContext = createContext<DoctorProfileContextValue | null>(null);

function deriveInitials(name: string): string {
    const parts = name.trim().split(' ').filter(Boolean);
    if (parts.length === 0) return 'DR';
    return parts.map(p => p[0].toUpperCase()).slice(0, 2).join('');
}

export function DoctorProfileProvider({ children }: { children: ReactNode }) {
    const [profile, setProfile] = useState<DoctorProfile>(() => {
        try {
            const stored = localStorage.getItem(STORAGE_KEY);
            return stored ? { ...DEFAULT_PROFILE, ...JSON.parse(stored) } : DEFAULT_PROFILE;
        } catch {
            return DEFAULT_PROFILE;
        }
    });

    const updateProfile = (updated: DoctorProfile) => {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
        setProfile(updated);
    };

    const initials = deriveInitials(profile.fullName);
    const displayName = profile.fullName.trim() || 'Doctor';

    return (
        <DoctorProfileContext.Provider value={{ profile, updateProfile, initials, displayName }}>
            {children}
        </DoctorProfileContext.Provider>
    );
}

export function useDoctorProfile(): DoctorProfileContextValue {
    const ctx = useContext(DoctorProfileContext);
    if (!ctx) throw new Error('useDoctorProfile must be used within DoctorProfileProvider');
    return ctx;
}

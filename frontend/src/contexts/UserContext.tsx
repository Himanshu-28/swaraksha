import {
  createContext,
  useContext,
  useState,
  useEffect,
  type ReactNode,
} from 'react';
import { fetchUserAttributes } from 'aws-amplify/auth';

export type UserRole = 'DOCTOR' | 'PATIENT' | null;

export interface UserProfile {
  role: UserRole;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  /** ISO date string YYYY-MM-DD — patients only */
  dateOfBirth: string;
  /** Doctors only */
  specialization: string;
  /** Raw Cognito sub */
  sub: string;
}

interface UserContextValue {
  user: UserProfile | null;
  /** true while Cognito attributes are being fetched */
  loadingUser: boolean;
  /** Re-fetch if attributes change (e.g. after profile update) */
  refreshUser: () => Promise<void>;
  /** Convenience: "Priya" from given_name, or "User" fallback */
  displayName: string;
  /** Two-letter initials */
  initials: string;
  role: UserRole;
}

const UserContext = createContext<UserContextValue | null>(null);

function deriveInitials(first: string, last: string): string {
  const a = first.trim()[0]?.toUpperCase() ?? '';
  const b = last.trim()[0]?.toUpperCase() ?? '';
  return (a + b) || 'U';
}

export function UserProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [loadingUser, setLoadingUser] = useState(true);

  const loadAttributes = async () => {
    setLoadingUser(true);
    try {
      const attrs = await fetchUserAttributes();
      setUser({
        role: (attrs['custom:role'] as UserRole) ?? null,
        firstName: attrs['given_name'] ?? '',
        lastName: attrs['family_name'] ?? '',
        email: attrs['email'] ?? '',
        phone: attrs['phone_number'] ?? '',
        dateOfBirth: attrs['birthdate'] ?? '',
        specialization: attrs['custom:specialization'] ?? '',
        sub: attrs['sub'] ?? '',
      });
    } catch {
      setUser(null);
    } finally {
      setLoadingUser(false);
    }
  };

  useEffect(() => { loadAttributes(); }, []);

  const displayName = user
    ? (user.firstName.trim() || user.lastName.trim() || 'User')
    : 'User';

  const initials = user
    ? deriveInitials(user.firstName, user.lastName)
    : 'U';

  return (
    <UserContext.Provider
      value={{
        user,
        loadingUser,
        refreshUser: loadAttributes,
        displayName,
        initials,
        role: user?.role ?? null,
      }}
    >
      {children}
    </UserContext.Provider>
  );
}

export function useUser(): UserContextValue {
  const ctx = useContext(UserContext);
  if (!ctx) throw new Error('useUser must be used within UserProvider');
  return ctx;
}

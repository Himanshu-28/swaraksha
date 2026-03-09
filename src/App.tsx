import { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Hub } from 'aws-amplify/utils';
import { getCurrentUser } from 'aws-amplify/auth';
import { Stethoscope } from 'lucide-react';
import LoginPage from './components/LoginPage';
import AppLayout from './components/AppLayout';
import DoctorDashboardSearch from './components/DoctorDashboardSearch';
import PatientsPage from './components/PatientsPage';
import DoctorProfilePage from './components/DoctorProfilePage';
import SchedulePage from './components/SchedulePage';
import PatientDetails from './components/PatientDetails';
import ActiveConsultation from './components/ActiveConsultation';
import ConsultationReview from './components/ConsultationReview';
import FinalizeConsultation from './components/FinalizeConsultation';
import PrescriptionPage from './components/PrescriptionPage';
import PatientAppLayout from './components/PatientAppLayout';
import PatientDashboardPage from './components/PatientDashboardPage';
import PatientTranscriptionsPage from './components/PatientTranscriptionsPage';
import PatientSchedulePage from './components/PatientSchedulePage';
import PatientProfilePage from './components/PatientProfilePage';
import { ConsultationProvider } from './contexts/ConsultationContext';
import { DoctorProfileProvider } from './contexts/DoctorProfileContext';
import { UserProvider, useUser } from './contexts/UserContext';
import './index.css';

function AuthenticatedApp() {
  const { role, loadingUser } = useUser();

  if (loadingUser) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#f8fafc]">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-[#196ee6] flex items-center justify-center shadow-lg animate-pulse">
            <Stethoscope size={24} color="white" />
          </div>
          <p className="text-slate-500 text-sm font-medium">Loading Swarksha…</p>
        </div>
      </div>
    );
  }

  if (role === 'PATIENT') {
    return (
      <div className="min-h-screen w-full bg-slate-50 font-sans text-slate-900">
        <Routes>
          <Route element={<PatientAppLayout />}>
            <Route path="/patient-home" element={<PatientDashboardPage />} />
            <Route path="/patient-transcriptions" element={<PatientTranscriptionsPage />} />
            <Route path="/patient-schedule" element={<PatientSchedulePage />} />
            <Route path="/patient-profile" element={<PatientProfilePage />} />
          </Route>
          {/* Redirect any unknown path to patient home */}
          <Route path="*" element={<Navigate to="/patient-home" replace />} />
        </Routes>
      </div>
    );
  }

  // Default: DOCTOR role (or null/unknown — safe fallback to doctor UI)
  return (
    <DoctorProfileProvider>
      <ConsultationProvider>
        <div className="min-h-screen w-full bg-slate-50 font-sans text-slate-900">
          <Routes>
            <Route element={<AppLayout />}>
              <Route path="/" element={<DoctorDashboardSearch />} />
              <Route path="/patients" element={<PatientsPage />} />
              <Route path="/schedule" element={<SchedulePage />} />
              <Route path="/profile" element={<DoctorProfilePage />} />
            </Route>
            <Route path="/patient/:patientId" element={<PatientDetails />} />
            <Route path="/patient/:patientId/consultation" element={<ActiveConsultation />} />
            <Route path="/patient/:patientId/review" element={<ConsultationReview />} />
            <Route path="/patient/:patientId/prescription" element={<PrescriptionPage />} />
            <Route path="/patient/:patientId/finalize" element={<FinalizeConsultation />} />
            {/* Redirect any unmatched path to home */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </div>
      </ConsultationProvider>
    </DoctorProfileProvider>
  );
}

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const checkAuth = async () => {
      try {
        await getCurrentUser();
        setIsAuthenticated(true);
      } catch {
        setIsAuthenticated(false);
      } finally {
        setIsLoading(false);
      }
    };

    checkAuth();

    const unsubscribe = Hub.listen('auth', ({ payload }) => {
      if (payload.event === 'signedIn') setIsAuthenticated(true);
      if (payload.event === 'signedOut') setIsAuthenticated(false);
    });

    return unsubscribe;
  }, []);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#f8fafc]">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-[#196ee6] flex items-center justify-center shadow-lg animate-pulse">
            <Stethoscope size={24} color="white" />
          </div>
          <p className="text-slate-500 text-sm font-medium">Loading Swarksha…</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <LoginPage />;
  }

  return (
    <BrowserRouter>
      <UserProvider>
        <AuthenticatedApp />
      </UserProvider>
    </BrowserRouter>
  );
}

export default App;

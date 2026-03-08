import { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { Hub } from 'aws-amplify/utils';
import { getCurrentUser } from 'aws-amplify/auth';
import { Stethoscope } from 'lucide-react';
import LoginPage from './components/LoginPage';
import DoctorDashboardSearch from './components/DoctorDashboardSearch';
import PatientDetails from './components/PatientDetails';
import ActiveConsultation from './components/ActiveConsultation';
import ConsultationReview from './components/ConsultationReview';
import FinalizeConsultation from './components/FinalizeConsultation';
import { ConsultationProvider } from './contexts/ConsultationContext';
import './index.css';

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
      <ConsultationProvider>
        <div className="min-h-screen w-full bg-slate-50 font-sans text-slate-900">
          <Routes>
            <Route path="/" element={<DoctorDashboardSearch />} />
            <Route path="/patient/:patientId" element={<PatientDetails />} />
            <Route path="/patient/:patientId/consultation" element={<ActiveConsultation />} />
            <Route path="/patient/:patientId/review" element={<ConsultationReview />} />
            <Route path="/patient/:patientId/finalize" element={<FinalizeConsultation />} />
          </Routes>
        </div>
      </ConsultationProvider>
    </BrowserRouter>
  );
}

export default App;

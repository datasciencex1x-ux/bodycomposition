import { useEffect } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useStore } from './store/useStore';
import Layout from './components/Layout';
import Dashboard from './pages/Dashboard';
import Patients from './pages/Patients';
import PatientDetail from './pages/PatientDetail';
import NewEvaluation from './pages/NewEvaluation';
import Results from './pages/Results';
import Comparator from './pages/Comparator';
import SportsComparison from './pages/SportsComparison';
import Reports from './pages/Reports';
import MethodsLibrary from './pages/MethodsLibrary';
import SettingsPage from './pages/Settings';
import Agenda from './pages/Agenda';
import Metabolism from './pages/Metabolism';
import Diet from './pages/Diet';
import Supplements from './pages/Supplements';
import Performance from './pages/Performance';
import Wearables from './pages/Wearables';

export default function App() {
  const theme = useStore((s) => s.settings.theme);

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
  }, [theme]);

  return (
    <Layout>
      <Routes>
        <Route path="/" element={<Dashboard />} />
        <Route path="/patients" element={<Patients />} />
        <Route path="/patients/:id" element={<PatientDetail />} />
        <Route path="/new" element={<NewEvaluation />} />
        <Route path="/new/:patientId" element={<NewEvaluation />} />
        <Route path="/results/:id" element={<Results />} />
        <Route path="/agenda" element={<Agenda />} />
        <Route path="/metabolism" element={<Metabolism />} />
        <Route path="/diet" element={<Diet />} />
        <Route path="/supplements" element={<Supplements />} />
        <Route path="/performance" element={<Performance />} />
        <Route path="/wearables" element={<Wearables />} />
        <Route path="/comparator" element={<Comparator />} />
        <Route path="/sports" element={<SportsComparison />} />
        <Route path="/sports/:evalId" element={<SportsComparison />} />
        <Route path="/reports" element={<Reports />} />
        <Route path="/reports/:id" element={<Reports />} />
        <Route path="/methods" element={<MethodsLibrary />} />
        <Route path="/settings" element={<SettingsPage />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Layout>
  );
}

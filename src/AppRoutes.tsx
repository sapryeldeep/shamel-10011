import { Routes, Route, Navigate } from 'react-router-dom';
import Dashboard from './pages/Dashboard';
import Patients from './pages/Patients';
import Appointments from './pages/Appointments';
import Prescription from './pages/Prescription';
import HospitalOperations from './pages/HospitalOperations';
import PayrollAndStaff from './pages/PayrollAndStaff';
import InsuranceManagement from './pages/InsuranceManagement';
import ClinicalReports from './pages/ClinicalReports';
import Pharmacy from './pages/Pharmacy';
import Accounting from './pages/Accounting';
import AuditLogs from './pages/AuditLogs';
import Settings from './pages/Settings';
import MasterPanel from './pages/MasterPanel';
import QueueDisplayScreen from './pages/QueueDisplayScreen';
import StaffPermissions from './pages/StaffPermissions';
import { User } from './types';

interface AppRoutesProps {
  currentUser: User | null;
}

export default function AppRoutes({ currentUser }: AppRoutesProps) {
  const isMaster = currentUser?.role === 'master_admin' || currentUser?.role === 'developer';

  return (
    <Routes>
      <Route path="/" element={isMaster ? <MasterPanel /> : <Dashboard />} />
      <Route path="/patients" element={<Patients />} />
      <Route path="/appointments" element={<Appointments />} />
      <Route path="/prescription" element={<Prescription />} />
      <Route path="/operations" element={<HospitalOperations />} />
      <Route path="/accounting" element={<Accounting />} />
      <Route path="/audit-logs" element={<AuditLogs />} />
      <Route path="/staff-payroll" element={<PayrollAndStaff />} />
      <Route path="/insurance" element={<InsuranceManagement />} />
      <Route path="/reports" element={<ClinicalReports />} />
      <Route path="/pharmacy" element={<Pharmacy />} />
      <Route path="/settings" element={<Settings />} />
      <Route path="/staff-permissions" element={<StaffPermissions />} />
      <Route path="/master" element={isMaster ? <MasterPanel /> : <Navigate to="/" replace />} />
      <Route path="/queue-screen" element={<QueueDisplayScreen />} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import PractitionerLayout from './PractitionerLayout';
import EnhancedPractitionerDashboard from './EnhancedPractitionerDashboard';
import PractitionerProfileManagement from './PractitionerProfileManagement';
import AdvancedAppointmentScheduling from './AdvancedAppointmentScheduling';
import AdvancedPatientManagement from './AdvancedPatientManagement';
import TherapyPlanManagement from './TherapyPlanManagement';
import TreatmentHistoryMedicalRecords from './TreatmentHistoryMedicalRecords';
import AvailabilityScheduleManagement from './AvailabilityScheduleManagement';
import CommunicationMessaging from './CommunicationMessaging';
import RevenueEarningsTracking from './RevenueEarningsTracking';
import ReportsAnalytics from './ReportsAnalytics';
import NotificationManagement from './NotificationManagement';

const PractitionerRouter = () => {
  return (
    <Routes>
      <Route path="/" element={<PractitionerLayout />}>
        <Route index element={<Navigate to="/practitioner/dashboard" replace />} />
        <Route path="dashboard" element={<EnhancedPractitionerDashboard />} />
        <Route path="profile" element={<PractitionerProfileManagement />} />
        <Route path="appointments" element={<AdvancedAppointmentScheduling />} />
        <Route path="patients" element={<AdvancedPatientManagement />} />
        <Route path="therapy-plans" element={<TherapyPlanManagement />} />
        <Route path="medical-records" element={<TreatmentHistoryMedicalRecords />} />
        <Route path="availability" element={<AvailabilityScheduleManagement />} />
        <Route path="messages" element={<CommunicationMessaging />} />
        <Route path="revenue" element={<RevenueEarningsTracking />} />
        <Route path="analytics" element={<ReportsAnalytics />} />
        <Route path="notifications" element={<NotificationManagement />} />
      </Route>
    </Routes>
  );
};

export default PractitionerRouter;

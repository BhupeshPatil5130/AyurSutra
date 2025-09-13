import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import PatientLayout from './PatientLayout';
import EnhancedPatientDashboard from './EnhancedPatientDashboard';
import EnhancedPatientProfile from './EnhancedPatientProfile';
import PatientTherapyPlans from './PatientTherapyPlans';
import PatientAppointmentBooking from './PatientAppointmentBooking';
import PatientPractitionerSearch from './PatientPractitionerSearch';
import PatientMedicalRecords from './PatientMedicalRecords';
import PatientPaymentBilling from './PatientPaymentBilling';
import PatientCommunicationMessaging from './PatientCommunicationMessaging';
import PatientFeedbackReviews from './PatientFeedbackReviews';
import PatientHealthTracking from './PatientHealthTracking';
import PatientNotificationManagement from './PatientNotificationManagement';
import PatientDocumentManagement from './PatientDocumentManagement';

const PatientRouter = () => {
  return (
    <Routes>
      <Route path="/" element={<PatientLayout />}>
        <Route index element={<Navigate to="/patient/dashboard" replace />} />
        <Route path="dashboard" element={<EnhancedPatientDashboard />} />
        <Route path="profile" element={<EnhancedPatientProfile />} />
        <Route path="therapy-plans" element={<PatientTherapyPlans />} />
        <Route path="appointments" element={<PatientAppointmentBooking />} />
        <Route path="practitioners" element={<PatientPractitionerSearch />} />
        <Route path="medical-records" element={<PatientMedicalRecords />} />
        <Route path="payments" element={<PatientPaymentBilling />} />
        <Route path="messages" element={<PatientCommunicationMessaging />} />
        <Route path="feedback" element={<PatientFeedbackReviews />} />
        <Route path="health-tracking" element={<PatientHealthTracking />} />
        <Route path="notifications" element={<PatientNotificationManagement />} />
        <Route path="documents" element={<PatientDocumentManagement />} />
      </Route>
    </Routes>
  );
};

export default PatientRouter;

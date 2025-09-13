import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import AdminLayout from './AdminLayout';
import EnhancedAdminDashboard from './EnhancedAdminDashboard';
import UserManagement from './UserManagement';
import PractitionerManagement from './PractitionerManagement';
import PatientManagement from './PatientManagement';
import AppointmentManagement from './AppointmentManagement';
import SystemAnalytics from './SystemAnalytics';
import RevenueManagement from './RevenueManagement';
import ContentManagement from './ContentManagement';
import NotificationCenter from './NotificationCenter';
import AuditLogs from './AuditLogs';
import SystemSettings from './SystemSettings';

const AdminRouter = () => {
  return (
    <Routes>
      <Route path="/" element={<AdminLayout />}>
        <Route index element={<Navigate to="/admin/dashboard" replace />} />
        <Route path="dashboard" element={<EnhancedAdminDashboard />} />
        <Route path="users" element={<UserManagement />} />
        <Route path="practitioners" element={<PractitionerManagement />} />
        <Route path="patients" element={<PatientManagement />} />
        <Route path="appointments" element={<AppointmentManagement />} />
        <Route path="analytics" element={<SystemAnalytics />} />
        <Route path="revenue" element={<RevenueManagement />} />
        <Route path="content" element={<ContentManagement />} />
        <Route path="notifications" element={<NotificationCenter />} />
        <Route path="audit" element={<AuditLogs />} />
        <Route path="settings" element={<SystemSettings />} />
      </Route>
    </Routes>
  );
};

export default AdminRouter;

import React, { useState, useEffect } from 'react';
import { 
  LayoutDashboard, 
  Users, 
  UserCheck, 
  Calendar, 
  BarChart3, 
  Settings, 
  FileText, 
  Bell, 
  Shield, 
  Activity,
  DollarSign,
  Heart,
  MessageSquare,
  Database,
  LogOut,
  Menu,
  X
} from 'lucide-react';

// Import all admin components
import EnhancedAdminDashboard from './EnhancedAdminDashboard';
import UserManagement from './UserManagement';
import PractitionerManagement from './PractitionerManagement';
import PatientManagement from './PatientManagement';
import AppointmentManagement from './AppointmentManagement';
import SystemAnalytics from './SystemAnalytics';
import RevenueManagement from './RevenueManagement';
import SystemSettings from './SystemSettings';
import AuditLogs from './AuditLogs';
import NotificationCenter from './NotificationCenter';
import ContentManagement from './ContentManagement';

const AdminLayout = () => {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [adminInfo, setAdminInfo] = useState({
    name: 'Admin User',
    email: 'admin@panchakarma.com',
    avatar: null
  });

  useEffect(() => {
    // Fetch admin info from localStorage or API
    const userInfo = JSON.parse(localStorage.getItem('user') || '{}');
    if (userInfo.role === 'admin') {
      setAdminInfo({
        name: `${userInfo.firstName} ${userInfo.lastName}`,
        email: userInfo.email,
        avatar: userInfo.profileImage
      });
    }
  }, []);

  const menuItems = [
    {
      id: 'dashboard',
      label: 'Dashboard',
      icon: LayoutDashboard,
      component: EnhancedAdminDashboard,
      description: 'System overview and analytics'
    },
    {
      id: 'users',
      label: 'User Management',
      icon: Users,
      component: UserManagement,
      description: 'Manage all system users'
    },
    {
      id: 'practitioners',
      label: 'Practitioners',
      icon: UserCheck,
      component: PractitionerManagement,
      description: 'Practitioner verification and management'
    },
    {
      id: 'patients',
      label: 'Patients',
      icon: Heart,
      component: PatientManagement,
      description: 'Patient records and management'
    },
    {
      id: 'appointments',
      label: 'Appointments',
      icon: Calendar,
      component: AppointmentManagement,
      description: 'Appointment scheduling and management'
    },
    {
      id: 'analytics',
      label: 'Analytics',
      icon: BarChart3,
      component: SystemAnalytics,
      description: 'System analytics and reports'
    },
    {
      id: 'revenue',
      label: 'Revenue',
      icon: DollarSign,
      component: RevenueManagement,
      description: 'Financial management and billing'
    },
    {
      id: 'content',
      label: 'Content',
      icon: FileText,
      component: ContentManagement,
      description: 'Content and resource management'
    },
    {
      id: 'notifications',
      label: 'Notifications',
      icon: Bell,
      component: NotificationCenter,
      description: 'System notifications and alerts'
    },
    {
      id: 'audit',
      label: 'Audit Logs',
      icon: Activity,
      component: AuditLogs,
      description: 'System activity and audit trails'
    },
    {
      id: 'settings',
      label: 'Settings',
      icon: Settings,
      component: SystemSettings,
      description: 'System configuration and settings'
    }
  ];

  const ActiveComponent = menuItems.find(item => item.id === activeTab)?.component || EnhancedAdminDashboard;

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    window.location.href = '/login';
  };

  return (
    <div className="flex h-screen bg-gray-100">
      {/* Sidebar */}
      <div className={`${sidebarOpen ? 'w-64' : 'w-16'} bg-white shadow-lg transition-all duration-300 flex flex-col`}>
        {/* Header */}
        <div className="p-4 border-b border-gray-200">
          <div className="flex items-center justify-between">
            {sidebarOpen && (
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-gradient-to-r from-green-500 to-blue-600 rounded-lg flex items-center justify-center">
                  <Shield className="h-5 w-5 text-white" />
                </div>
                <div>
                  <h1 className="text-lg font-bold text-gray-900">Admin Panel</h1>
                  <p className="text-xs text-gray-500">Panchakarma System</p>
                </div>
              </div>
            )}
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="p-1 rounded-md hover:bg-gray-100"
            >
              {sidebarOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </button>
          </div>
        </div>

        {/* Admin Info */}
        {sidebarOpen && (
          <div className="p-4 border-b border-gray-200">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center text-white font-semibold">
                {adminInfo.name.split(' ').map(n => n[0]).join('')}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-900 truncate">{adminInfo.name}</p>
                <p className="text-xs text-gray-500 truncate">{adminInfo.email}</p>
              </div>
            </div>
          </div>
        )}

        {/* Navigation */}
        <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            
            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`w-full flex items-center space-x-3 px-3 py-2 rounded-lg text-left transition-colors ${
                  isActive
                    ? 'bg-green-100 text-green-700 border border-green-200'
                    : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
                }`}
                title={!sidebarOpen ? item.label : ''}
              >
                <Icon className={`h-5 w-5 ${isActive ? 'text-green-600' : 'text-gray-500'}`} />
                {sidebarOpen && (
                  <div className="flex-1 min-w-0">
                    <span className="text-sm font-medium">{item.label}</span>
                    <p className="text-xs text-gray-500 truncate">{item.description}</p>
                  </div>
                )}
              </button>
            );
          })}
        </nav>

        {/* Logout */}
        <div className="p-4 border-t border-gray-200">
          <button
            onClick={handleLogout}
            className="w-full flex items-center space-x-3 px-3 py-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
            title={!sidebarOpen ? 'Logout' : ''}
          >
            <LogOut className="h-5 w-5" />
            {sidebarOpen && <span className="text-sm font-medium">Logout</span>}
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Top Bar */}
        <header className="bg-white shadow-sm border-b border-gray-200 px-6 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-semibold text-gray-900">
                {menuItems.find(item => item.id === activeTab)?.label || 'Dashboard'}
              </h2>
              <p className="text-sm text-gray-600">
                {menuItems.find(item => item.id === activeTab)?.description || 'System overview and analytics'}
              </p>
            </div>
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2 text-sm text-gray-600">
                <Database className="h-4 w-4" />
                <span>System Status: Online</span>
              </div>
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
            </div>
          </div>
        </header>

        {/* Content Area */}
        <main className="flex-1 overflow-y-auto p-6">
          <ActiveComponent />
        </main>
      </div>
    </div>
  );
};

export default AdminLayout;

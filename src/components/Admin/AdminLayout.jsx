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
  X,
  ChevronRight,
  Home,
  TrendingUp,
  UserCog,
  Stethoscope,
  FileBarChart,
  CreditCard,
  BookOpen,
  AlertCircle,
  History,
  Cog
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
      icon: Home,
      component: EnhancedAdminDashboard,
      description: 'System overview and analytics',
      color: 'text-blue-600',
      bgColor: 'bg-blue-50',
      borderColor: 'border-blue-200'
    },
    {
      id: 'users',
      label: 'User Management',
      icon: UserCog,
      component: UserManagement,
      description: 'Manage all system users',
      color: 'text-purple-600',
      bgColor: 'bg-purple-50',
      borderColor: 'border-purple-200'
    },
    {
      id: 'practitioners',
      label: 'Practitioners',
      icon: Stethoscope,
      component: PractitionerManagement,
      description: 'Practitioner verification and management',
      color: 'text-green-600',
      bgColor: 'bg-green-50',
      borderColor: 'border-green-200'
    },
    {
      id: 'patients',
      label: 'Patients',
      icon: Heart,
      component: PatientManagement,
      description: 'Patient records and management',
      color: 'text-pink-600',
      bgColor: 'bg-pink-50',
      borderColor: 'border-pink-200'
    },
    {
      id: 'appointments',
      label: 'Appointments',
      icon: Calendar,
      component: AppointmentManagement,
      description: 'Appointment scheduling and management',
      color: 'text-indigo-600',
      bgColor: 'bg-indigo-50',
      borderColor: 'border-indigo-200'
    },
    {
      id: 'analytics',
      label: 'Analytics',
      icon: TrendingUp,
      component: SystemAnalytics,
      description: 'System analytics and reports',
      color: 'text-orange-600',
      bgColor: 'bg-orange-50',
      borderColor: 'border-orange-200'
    },
    {
      id: 'revenue',
      label: 'Revenue',
      icon: CreditCard,
      component: RevenueManagement,
      description: 'Financial management and billing',
      color: 'text-emerald-600',
      bgColor: 'bg-emerald-50',
      borderColor: 'border-emerald-200'
    },
    {
      id: 'content',
      label: 'Content',
      icon: BookOpen,
      component: ContentManagement,
      description: 'Content and resource management',
      color: 'text-cyan-600',
      bgColor: 'bg-cyan-50',
      borderColor: 'border-cyan-200'
    },
    {
      id: 'notifications',
      label: 'Notifications',
      icon: Bell,
      component: NotificationCenter,
      description: 'System notifications and alerts',
      color: 'text-yellow-600',
      bgColor: 'bg-yellow-50',
      borderColor: 'border-yellow-200'
    },
    {
      id: 'audit',
      label: 'Audit Logs',
      icon: History,
      component: AuditLogs,
      description: 'System activity and audit trails',
      color: 'text-gray-600',
      bgColor: 'bg-gray-50',
      borderColor: 'border-gray-200'
    },
    {
      id: 'settings',
      label: 'Settings',
      icon: Cog,
      component: SystemSettings,
      description: 'System configuration and settings',
      color: 'text-slate-600',
      bgColor: 'bg-slate-50',
      borderColor: 'border-slate-200'
    },
    {
      id: 'data-management',
      label: 'Data Management',
      icon: Database,
      component: () => import('./AdminDataManagement').then(module => module.default),
      description: 'Comprehensive data management system',
      color: 'text-red-600',
      bgColor: 'bg-red-50',
      borderColor: 'border-red-200'
    }
  ];

  const ActiveComponent = menuItems.find(item => item.id === activeTab)?.component || EnhancedAdminDashboard;

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    window.location.href = '/login';
  };

  return (
    <div className="flex h-screen bg-gradient-to-br from-slate-50 to-gray-100">
      {/* Sidebar */}
      <div className={`${sidebarOpen ? 'w-72' : 'w-20'} bg-white/80 backdrop-blur-xl shadow-2xl border-r border-gray-200/50 transition-all duration-300 flex flex-col`}>
        {/* Header */}
        <div className="p-6 border-b border-gray-200/50">
          <div className="flex items-center justify-between">
            {sidebarOpen && (
              <div className="flex items-center space-x-4">
                <div className="w-12 h-12 bg-gradient-to-br from-indigo-600 via-purple-600 to-pink-600 rounded-2xl flex items-center justify-center shadow-lg">
                  <Shield className="h-7 w-7 text-white" />
                </div>
                <div>
                  <h1 className="text-xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent">
                    Admin Panel
                  </h1>
                  <p className="text-sm text-gray-500 font-medium">AyurSutra System</p>
                </div>
              </div>
            )}
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="p-2 rounded-xl hover:bg-gray-100/80 transition-all duration-200 hover:scale-105"
            >
              {sidebarOpen ? <X className="h-5 w-5 text-gray-600" /> : <Menu className="h-5 w-5 text-gray-600" />}
            </button>
          </div>
        </div>

        {/* Admin Info */}
        {sidebarOpen && (
          <div className="p-6 border-b border-gray-200/50">
            <div className="flex items-center space-x-4">
              <div className="w-14 h-14 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-2xl flex items-center justify-center text-white font-bold text-lg shadow-lg">
                {adminInfo.name.split(' ').map(n => n[0]).join('')}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-base font-semibold text-gray-900 truncate">{adminInfo.name}</p>
                <p className="text-sm text-gray-500 truncate">{adminInfo.email}</p>
                <div className="flex items-center mt-1">
                  <div className="w-2 h-2 bg-green-500 rounded-full mr-2"></div>
                  <span className="text-xs text-green-600 font-medium">Online</span>
                </div>
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
                className={`w-full flex items-center space-x-4 px-4 py-3 rounded-2xl text-left transition-all duration-200 group ${
                  isActive
                    ? `${item.bgColor} ${item.color} border ${item.borderColor} shadow-lg transform scale-105`
                    : 'text-gray-600 hover:bg-gray-100/80 hover:text-gray-900 hover:shadow-md hover:scale-102'
                }`}
                title={!sidebarOpen ? item.label : ''}
              >
                <div className={`p-2 rounded-xl ${isActive ? 'bg-white/80' : 'group-hover:bg-white/60'}`}>
                  <Icon className={`h-5 w-5 ${isActive ? item.color : 'text-gray-500 group-hover:text-gray-700'}`} />
                </div>
                {sidebarOpen && (
                  <div className="flex-1 min-w-0">
                    <span className={`text-sm font-semibold ${isActive ? item.color : 'text-gray-700 group-hover:text-gray-900'}`}>
                      {item.label}
                    </span>
                    <p className="text-xs text-gray-500 truncate mt-0.5">{item.description}</p>
                  </div>
                )}
                {sidebarOpen && (
                  <ChevronRight className={`h-4 w-4 transition-transform duration-200 ${isActive ? 'rotate-90' : 'group-hover:translate-x-1'}`} />
                )}
              </button>
            );
          })}
        </nav>

        {/* Logout */}
        <div className="p-4 border-t border-gray-200/50">
          <button
            onClick={handleLogout}
            className="w-full flex items-center space-x-4 px-4 py-3 text-red-600 hover:bg-red-50/80 rounded-2xl transition-all duration-200 hover:shadow-md hover:scale-102 group"
            title={!sidebarOpen ? 'Logout' : ''}
          >
            <div className="p-2 rounded-xl group-hover:bg-red-100/60">
              <LogOut className="h-5 w-5" />
            </div>
            {sidebarOpen && <span className="text-sm font-semibold">Logout</span>}
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Top Bar */}
        <header className="bg-white/80 backdrop-blur-xl shadow-lg border-b border-gray-200/50 px-8 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent">
                {menuItems.find(item => item.id === activeTab)?.label || 'Dashboard'}
              </h2>
              <p className="text-gray-600 font-medium mt-1">
                {menuItems.find(item => item.id === activeTab)?.description || 'System overview and analytics'}
              </p>
            </div>
            <div className="flex items-center space-x-6">
              <div className="flex items-center space-x-3 px-4 py-2 bg-green-50 rounded-full border border-green-200">
                <Database className="h-5 w-5 text-green-600" />
                <span className="text-sm font-semibold text-green-700">System Online</span>
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
              </div>
              <div className="flex items-center space-x-2 text-sm text-gray-600">
                <Bell className="h-5 w-5" />
                <span className="font-medium">Notifications</span>
                <div className="w-2 h-2 bg-red-500 rounded-full"></div>
              </div>
            </div>
          </div>
        </header>

        {/* Content Area */}
        <main className="flex-1 overflow-y-auto p-8 bg-gradient-to-br from-gray-50/50 to-white/50">
          <div className="max-w-7xl mx-auto">
            <ActiveComponent />
          </div>
        </main>
      </div>
    </div>
  );
};

export default AdminLayout;

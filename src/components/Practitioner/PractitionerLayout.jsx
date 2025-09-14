import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate, Outlet } from 'react-router-dom';
import { 
  LayoutDashboard, 
  Users, 
  Calendar, 
  Heart, 
  FileText, 
  MessageSquare, 
  DollarSign,
  BarChart3,
  Settings,
  Bell,
  User,
  Clock,
  Activity,
  Star,
  LogOut,
  Menu,
  X,
  Stethoscope
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';


const PractitionerLayout = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { logout } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [practitionerInfo, setPractitionerInfo] = useState({
    name: 'Dr. Practitioner',
    email: 'practitioner@panchakarma.com',
    specialization: 'Ayurveda',
    verificationStatus: 'verified',
    avatar: null
  });

  // Get current active tab from URL
  const getCurrentTab = () => {
    const path = location.pathname.split('/').pop();
    return path || 'dashboard';
  };

  const activeTab = getCurrentTab();

  useEffect(() => {
    // Fetch practitioner info from localStorage or API
    const userInfo = JSON.parse(localStorage.getItem('user') || '{}');
    if (userInfo.role === 'practitioner') {
      setPractitionerInfo({
        name: `${userInfo.firstName} ${userInfo.lastName}`,
        email: userInfo.email,
        specialization: userInfo.specialization || 'Ayurveda',
        verificationStatus: userInfo.verificationStatus || 'pending',
        avatar: userInfo.profileImage
      });
    }
  }, []);

  const menuItems = [
    {
      id: 'dashboard',
      label: 'Dashboard',
      icon: LayoutDashboard,
      path: '/practitioner/dashboard',
      description: 'Overview and analytics'
    },
    {
      id: 'profile',
      label: 'Profile',
      icon: User,
      path: '/practitioner/profile',
      description: 'Manage your profile'
    },
    {
      id: 'appointments',
      label: 'Appointments',
      icon: Calendar,
      path: '/practitioner/appointments',
      description: 'Schedule and manage appointments'
    },
    {
      id: 'patients',
      label: 'Patients',
      icon: Users,
      path: '/practitioner/patients',
      description: 'Patient management'
    },
    {
      id: 'therapy-plans',
      label: 'Therapy Plans',
      icon: Heart,
      path: '/practitioner/therapy-plans',
      description: 'Create and manage therapy plans'
    },
    {
      id: 'medical-records',
      label: 'Medical Records',
      icon: FileText,
      path: '/practitioner/medical-records',
      description: 'Patient medical records'
    },
    {
      id: 'availability',
      label: 'Availability',
      icon: Clock,
      path: '/practitioner/availability',
      description: 'Manage your schedule'
    },
    {
      id: 'messages',
      label: 'Messages',
      icon: MessageSquare,
      path: '/practitioner/messages',
      description: 'Communication with patients'
    },
    
    {
      id: 'analytics',
      label: 'Analytics',
      icon: BarChart3,
      path: '/practitioner/analytics',
      description: 'Reports and analytics'
    },
    {
      id: 'notifications',
      label: 'Notifications',
      icon: Bell,
      path: '/practitioner/notifications',
      description: 'Manage notifications'
    }
  ];


  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const handleNavigation = (path) => {
    console.log('Navigating to:', path);
    navigate(path);
  };

  const getVerificationStatusColor = (status) => {
    switch (status) {
      case 'verified': return 'bg-green-100 text-green-700';
      case 'pending': return 'bg-yellow-100 text-yellow-700';
      case 'rejected': return 'bg-red-100 text-red-700';
      default: return 'bg-gray-100 text-gray-700';
    }
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
                  <Stethoscope className="h-5 w-5 text-white" />
                </div>
                <div>
                  <h1 className="text-lg font-bold text-gray-900">Practitioner</h1>
                  <p className="text-xs text-gray-500">Panchakarma Portal</p>
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

        {/* Practitioner Info */}
        {sidebarOpen && (
          <div className="p-4 border-b border-gray-200">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center text-white font-semibold">
                {practitionerInfo.name.split(' ').map(n => n[0]).join('')}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-900 truncate">{practitionerInfo.name}</p>
                <p className="text-xs text-gray-500 truncate">{practitionerInfo.specialization}</p>
                <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${getVerificationStatusColor(practitionerInfo.verificationStatus)}`}>
                  {practitionerInfo.verificationStatus}
                </span>
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
                onClick={() => handleNavigation(item.path)}
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
                {menuItems.find(item => item.id === activeTab)?.description || 'Overview and analytics'}
              </p>
            </div>
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2 text-sm text-gray-600">
                <Activity className="h-4 w-4" />
                <span>Status: {practitionerInfo.verificationStatus === 'verified' ? 'Active' : 'Pending Verification'}</span>
              </div>
              <div className={`w-2 h-2 rounded-full animate-pulse ${
                practitionerInfo.verificationStatus === 'verified' ? 'bg-green-500' : 'bg-yellow-500'
              }`}></div>
            </div>
          </div>
        </header>

        {/* Content Area */}
        <main className="flex-1 overflow-y-auto p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default PractitionerLayout;

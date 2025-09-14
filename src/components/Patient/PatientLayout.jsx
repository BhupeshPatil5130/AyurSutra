import React, { useState, useEffect } from 'react';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import { 
  User, 
  Calendar, 
  FileText, 
  CreditCard, 
  MessageSquare, 
  Star, 
  Activity, 
  Bell, 
  Search,
  Heart,
  Menu,
  X,
  LogOut,
  Settings,
  Home,
  Users,
  Stethoscope,
  Folder
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

const PatientLayout = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = async () => {
    try {
      setLoading(true);
      await logout();
      
      navigate('/login');
    } catch (error) {
      
    } finally {
      setLoading(false);
    }
  };

  const navigation = [
    {
      name: 'Dashboard',
      href: '/patient',
      icon: Home,
      current: location.pathname === '/patient' || location.pathname === '/patient/dashboard'
    },
    {
      name: 'Profile',
      href: '/patient/profile',
      icon: User,
      current: location.pathname === '/patient/profile'
    },
    {
      name: 'Appointments',
      href: '/patient/appointments',
      icon: Calendar,
      current: location.pathname === '/patient/appointments'
    },
    {
      name: 'Find Practitioners',
      href: '/patient/practitioners',
      icon: Search,
      current: location.pathname === '/patient/practitioners'
    },
    {
      name: 'Therapy Plans',
      href: '/patient/therapy-plans',
      icon: Heart,
      current: location.pathname === '/patient/therapy-plans'
    },
    {
      name: 'Medical Records',
      href: '/patient/medical-records',
      icon: FileText,
      current: location.pathname === '/patient/medical-records'
    },
    {
      name: 'Health Tracking',
      href: '/patient/health-tracking',
      icon: Activity,
      current: location.pathname === '/patient/health-tracking'
    },
    {
      name: 'Messages',
      href: '/patient/messages',
      icon: MessageSquare,
      current: location.pathname === '/patient/messages'
    },
    {
      name: 'Payments & Billing',
      href: '/patient/payments',
      icon: CreditCard,
      current: location.pathname === '/patient/payments'
    },
    {
      name: 'Feedback & Reviews',
      href: '/patient/feedback',
      icon: Star,
      current: location.pathname === '/patient/feedback'
    },
    {
      name: 'Documents',
      href: '/patient/documents',
      icon: Folder,
      current: location.pathname === '/patient/documents'
    },
    {
      name: 'Notifications',
      href: '/patient/notifications',
      icon: Bell,
      current: location.pathname === '/patient/notifications'
    }
  ];

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Mobile sidebar overlay */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 bg-gray-600 bg-opacity-75 z-20 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <div className={`
        fixed inset-y-0 left-0 z-30 w-64 bg-white shadow-lg transform transition-transform duration-300 ease-in-out lg:translate-x-0 lg:static lg:inset-0
        ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}
      `}>
        <div className="flex items-center justify-between h-16 px-6 border-b border-gray-200">
          <div className="flex items-center">
            <Heart className="h-8 w-8 text-blue-600" />
            <span className="ml-2 text-xl font-bold text-gray-900">Patient Portal</span>
          </div>
          <button
            onClick={() => setSidebarOpen(false)}
            className="lg:hidden p-1 rounded-md text-gray-400 hover:text-gray-500 hover:bg-gray-100"
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        {/* User Info */}
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center">
            <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center">
              <User className="h-6 w-6 text-blue-600" />
            </div>
            <div className="ml-3">
              <p className="text-sm font-medium text-gray-900">
                {user?.name || 'Patient'}
              </p>
              <p className="text-xs text-gray-500">
                {user?.email}
              </p>
            </div>
          </div>
        </div>

        {/* Navigation */}
        <nav className="mt-6 px-3">
          <div className="space-y-1">
            {navigation.map((item) => {
              const Icon = item.icon;
              return (
                <button
                  key={item.name}
                  onClick={() => {
                    navigate(item.href);
                    setSidebarOpen(false);
                  }}
                  className={`
                    w-full flex items-center px-3 py-2 text-sm font-medium rounded-md transition-colors
                    ${item.current
                      ? 'bg-blue-100 text-blue-700 border-r-2 border-blue-700'
                      : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                    }
                  `}
                >
                  <Icon className={`mr-3 h-5 w-5 ${item.current ? 'text-blue-700' : 'text-gray-400'}`} />
                  {item.name}
                </button>
              );
            })}
          </div>
        </nav>

        {/* Bottom Actions */}
        <div className="absolute bottom-0 left-0 right-0 p-3 border-t border-gray-200">
          <button
            onClick={handleLogout}
            disabled={loading}
            className="w-full flex items-center px-3 py-2 text-sm font-medium text-gray-600 hover:text-gray-900 hover:bg-gray-50 rounded-md transition-colors"
          >
            <LogOut className="mr-3 h-5 w-5 text-gray-400" />
            {loading ? 'Logging out...' : 'Logout'}
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col lg:ml-0">
        {/* Top Navigation */}
        <header className="bg-white shadow-sm border-b border-gray-200">
          <div className="flex items-center justify-between h-16 px-4 sm:px-6 lg:px-8">
            <div className="flex items-center">
              <button
                onClick={() => setSidebarOpen(true)}
                className="lg:hidden p-2 rounded-md text-gray-400 hover:text-gray-500 hover:bg-gray-100"
              >
                <Menu className="h-6 w-6" />
              </button>
              <h1 className="ml-2 lg:ml-0 text-2xl font-semibold text-gray-900">
                Patient Dashboard
              </h1>
            </div>
            
            <div className="flex items-center space-x-4">
              <button className="p-2 text-gray-400 hover:text-gray-500 hover:bg-gray-100 rounded-full">
                <Bell className="h-6 w-6" />
              </button>
              <button className="p-2 text-gray-400 hover:text-gray-500 hover:bg-gray-100 rounded-full">
                <Settings className="h-6 w-6" />
              </button>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 overflow-y-auto">
          <div className="p-6">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
};

export default PatientLayout;

import React, { useState, useEffect } from 'react';
import { 
  AlertTriangle, 
  UserCheck, 
  Calendar, 
  DollarSign,
  Bell,
  Settings,
  Activity,
  FileText,
  Users,
  TrendingUp,
  Shield,
  Database
} from 'lucide-react';
import api from '../../utils/api';


const AdminQuickActions = ({ onNavigate }) => {
  const [quickStats, setQuickStats] = useState({
    pendingVerifications: 0,
    todayAppointments: 0,
    unreadNotifications: 0,
    systemAlerts: 0,
    pendingPayments: 0,
    activeUsers: 0
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchQuickStats();
  }, []);

  const fetchQuickStats = async () => {
    try {
      const response = await api.get('/admin/dashboard');
      setQuickStats(response.data);
    } catch (error) {
      console.error('Error fetching quick stats:', error);
    } finally {
      setLoading(false);
    }
  };

  const performQuickAction = async (action) => {
    try {
      switch (action) {
        case 'backup':
          await api.post('/admin/system/backup');
          
          break;
        case 'maintenance':
          await api.post('/admin/system/maintenance-mode');
          
          break;
        case 'clear-cache':
          await api.post('/admin/system/clear-cache');
          
          break;
        default:
          break;
      }
    } catch (error) {
      console.error('Error performing quick action:', error);
      
    }
  };

  const quickActions = [
    {
      id: 'verifications',
      title: 'Pending Verifications',
      description: `${quickStats.pendingVerifications} practitioners awaiting verification`,
      icon: UserCheck,
      color: 'bg-yellow-500',
      bgColor: 'bg-yellow-50',
      textColor: 'text-yellow-700',
      borderColor: 'border-yellow-200',
      count: quickStats.pendingVerifications,
      action: () => onNavigate('practitioners'),
      urgent: quickStats.pendingVerifications > 5
    },
    {
      id: 'appointments',
      title: 'Today\'s Appointments',
      description: `${quickStats.todayAppointments} appointments scheduled today`,
      icon: Calendar,
      color: 'bg-blue-500',
      bgColor: 'bg-blue-50',
      textColor: 'text-blue-700',
      borderColor: 'border-blue-200',
      count: quickStats.todayAppointments,
      action: () => onNavigate('appointments')
    },
    {
      id: 'notifications',
      title: 'System Notifications',
      description: `${quickStats.unreadNotifications} unread notifications`,
      icon: Bell,
      color: 'bg-purple-500',
      bgColor: 'bg-purple-50',
      textColor: 'text-purple-700',
      borderColor: 'border-purple-200',
      count: quickStats.unreadNotifications,
      action: () => onNavigate('notifications')
    },
    {
      id: 'alerts',
      title: 'System Alerts',
      description: `${quickStats.systemAlerts} active system alerts`,
      icon: AlertTriangle,
      color: 'bg-red-500',
      bgColor: 'bg-red-50',
      textColor: 'text-red-700',
      borderColor: 'border-red-200',
      count: quickStats.systemAlerts,
      action: () => onNavigate('audit'),
      urgent: quickStats.systemAlerts > 0
    },
    {
      id: 'payments',
      title: 'Pending Payments',
      description: `${quickStats.pendingPayments} payments require attention`,
      icon: DollarSign,
      color: 'bg-green-500',
      bgColor: 'bg-green-50',
      textColor: 'text-green-700',
      borderColor: 'border-green-200',
      count: quickStats.pendingPayments,
      action: () => onNavigate('revenue')
    },
    {
      id: 'users',
      title: 'Active Users',
      description: `${quickStats.activeUsers} users online now`,
      icon: Users,
      color: 'bg-indigo-500',
      bgColor: 'bg-indigo-50',
      textColor: 'text-indigo-700',
      borderColor: 'border-indigo-200',
      count: quickStats.activeUsers,
      action: () => onNavigate('users')
    }
  ];

  const systemActions = [
    {
      id: 'backup',
      title: 'System Backup',
      description: 'Create system backup',
      icon: Database,
      action: () => performQuickAction('backup')
    },
    {
      id: 'maintenance',
      title: 'Maintenance Mode',
      description: 'Toggle maintenance mode',
      icon: Settings,
      action: () => performQuickAction('maintenance')
    },
    {
      id: 'cache',
      title: 'Clear Cache',
      description: 'Clear system cache',
      icon: Activity,
      action: () => performQuickAction('clear-cache')
    },
    {
      id: 'analytics',
      title: 'View Analytics',
      description: 'System performance',
      icon: TrendingUp,
      action: () => onNavigate('analytics')
    }
  ];

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="bg-white rounded-lg shadow p-4 animate-pulse">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-gray-200 rounded-lg"></div>
                <div className="flex-1">
                  <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                  <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Quick Action Cards */}
      <div>
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {quickActions.map((action) => {
            const Icon = action.icon;
            return (
              <button
                key={action.id}
                onClick={action.action}
                className={`relative p-4 rounded-lg border-2 transition-all hover:shadow-md ${action.bgColor} ${action.borderColor} ${
                  action.urgent ? 'ring-2 ring-red-200 animate-pulse' : ''
                }`}
              >
                <div className="flex items-center space-x-3">
                  <div className={`p-2 rounded-lg ${action.color} bg-opacity-10`}>
                    <Icon className={`h-6 w-6 ${action.textColor}`} />
                  </div>
                  <div className="flex-1 text-left">
                    <div className="flex items-center justify-between">
                      <h4 className="font-medium text-gray-900">{action.title}</h4>
                      {action.count > 0 && (
                        <span className={`px-2 py-1 text-xs font-bold rounded-full ${action.color} text-white`}>
                          {action.count}
                        </span>
                      )}
                    </div>
                    <p className="text-sm text-gray-600 mt-1">{action.description}</p>
                  </div>
                </div>
                {action.urgent && (
                  <div className="absolute top-2 right-2">
                    <div className="w-2 h-2 bg-red-500 rounded-full animate-ping"></div>
                  </div>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* System Actions */}
      <div>
        <h3 className="text-lg font-semibold text-gray-900 mb-4">System Actions</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {systemActions.map((action) => {
            const Icon = action.icon;
            return (
              <button
                key={action.id}
                onClick={action.action}
                className="p-4 bg-white rounded-lg border border-gray-200 hover:border-gray-300 hover:shadow-md transition-all"
              >
                <div className="flex flex-col items-center text-center space-y-2">
                  <div className="p-3 bg-gray-100 rounded-full">
                    <Icon className="h-6 w-6 text-gray-600" />
                  </div>
                  <div>
                    <h4 className="font-medium text-gray-900">{action.title}</h4>
                    <p className="text-xs text-gray-500 mt-1">{action.description}</p>
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* System Status */}
      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">System Status</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="flex items-center space-x-3">
            <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
            <div>
              <p className="text-sm font-medium text-gray-900">Database</p>
              <p className="text-xs text-gray-500">Online</p>
            </div>
          </div>
          <div className="flex items-center space-x-3">
            <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
            <div>
              <p className="text-sm font-medium text-gray-900">API Server</p>
              <p className="text-xs text-gray-500">Healthy</p>
            </div>
          </div>
          <div className="flex items-center space-x-3">
            <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
            <div>
              <p className="text-sm font-medium text-gray-900">File Storage</p>
              <p className="text-xs text-gray-500">Available</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminQuickActions;

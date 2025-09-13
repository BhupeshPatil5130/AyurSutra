import React, { useState, useEffect } from 'react';
import { 
  Calendar, 
  Users, 
  Plus, 
  Clock,
  Heart,
  MessageSquare,
  FileText,
  Star,
  Activity,
  AlertTriangle,
  CheckCircle,
  Bell,
  DollarSign
} from 'lucide-react';
import api from '../../utils/api';
import toast from 'react-hot-toast';

const PractitionerQuickActions = ({ onNavigate }) => {
  const [quickStats, setQuickStats] = useState({
    todayAppointments: 0,
    pendingAppointments: 0,
    newPatients: 0,
    unreadMessages: 0,
    pendingTherapyPlans: 0,
    upcomingAppointments: 0
  });
  const [todaySchedule, setTodaySchedule] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchQuickStats();
    fetchTodaySchedule();
  }, []);

  const fetchQuickStats = async () => {
    try {
      const response = await api.get('/practitioner/dashboard/quick-stats');
      setQuickStats(response.data);
    } catch (error) {
      console.error('Error fetching quick stats:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchTodaySchedule = async () => {
    try {
      const response = await api.get('/practitioner/appointments/today');
      setTodaySchedule(response.data.slice(0, 3)); // Show only first 3
    } catch (error) {
      console.error('Error fetching today schedule:', error);
    }
  };

  const performQuickAction = async (action) => {
    try {
      switch (action) {
        case 'mark-available':
          await api.patch('/practitioner/availability/toggle');
          toast.success('Availability status updated');
          break;
        case 'emergency-mode':
          await api.post('/practitioner/emergency-mode');
          toast.success('Emergency mode activated');
          break;
        default:
          break;
      }
    } catch (error) {
      console.error('Error performing quick action:', error);
      toast.error('Error performing action');
    }
  };

  const quickActions = [
    {
      id: 'appointments',
      title: 'Today\'s Appointments',
      description: `${quickStats.todayAppointments} appointments scheduled`,
      icon: Calendar,
      color: 'bg-blue-500',
      bgColor: 'bg-blue-50',
      textColor: 'text-blue-700',
      borderColor: 'border-blue-200',
      count: quickStats.todayAppointments,
      action: () => onNavigate('appointments'),
      urgent: quickStats.pendingAppointments > 0
    },
    {
      id: 'patients',
      title: 'New Patients',
      description: `${quickStats.newPatients} new patients this week`,
      icon: Users,
      color: 'bg-green-500',
      bgColor: 'bg-green-50',
      textColor: 'text-green-700',
      borderColor: 'border-green-200',
      count: quickStats.newPatients,
      action: () => onNavigate('patients')
    },
    {
      id: 'messages',
      title: 'Unread Messages',
      description: `${quickStats.unreadMessages} messages waiting`,
      icon: MessageSquare,
      color: 'bg-purple-500',
      bgColor: 'bg-purple-50',
      textColor: 'text-purple-700',
      borderColor: 'border-purple-200',
      count: quickStats.unreadMessages,
      action: () => onNavigate('messages'),
      urgent: quickStats.unreadMessages > 5
    },
    {
      id: 'therapy-plans',
      title: 'Pending Plans',
      description: `${quickStats.pendingTherapyPlans} therapy plans to review`,
      icon: Heart,
      color: 'bg-pink-500',
      bgColor: 'bg-pink-50',
      textColor: 'text-pink-700',
      borderColor: 'border-pink-200',
      count: quickStats.pendingTherapyPlans,
      action: () => onNavigate('therapy-plans')
    },
    {
      id: 'upcoming',
      title: 'Upcoming Sessions',
      description: `${quickStats.upcomingAppointments} sessions this week`,
      icon: Clock,
      color: 'bg-yellow-500',
      bgColor: 'bg-yellow-50',
      textColor: 'text-yellow-700',
      borderColor: 'border-yellow-200',
      count: quickStats.upcomingAppointments,
      action: () => onNavigate('appointments')
    },
    {
      id: 'revenue',
      title: 'Today\'s Revenue',
      description: 'View earnings and billing',
      icon: DollarSign,
      color: 'bg-emerald-500',
      bgColor: 'bg-emerald-50',
      textColor: 'text-emerald-700',
      borderColor: 'border-emerald-200',
      action: () => onNavigate('revenue')
    }
  ];

  const practitionerActions = [
    {
      id: 'new-appointment',
      title: 'Schedule Appointment',
      description: 'Book new patient session',
      icon: Plus,
      action: () => onNavigate('appointments')
    },
    {
      id: 'create-plan',
      title: 'Create Therapy Plan',
      description: 'Design treatment program',
      icon: Heart,
      action: () => onNavigate('therapy-plans')
    },
    {
      id: 'add-record',
      title: 'Add Medical Record',
      description: 'Document patient visit',
      icon: FileText,
      action: () => onNavigate('medical-records')
    },
    {
      id: 'availability',
      title: 'Update Availability',
      description: 'Manage your schedule',
      icon: Clock,
      action: () => performQuickAction('mark-available')
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
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Overview</h3>
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
                      {action.count !== undefined && action.count > 0 && (
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

      {/* Today's Schedule */}
      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Today's Schedule</h3>
        {todaySchedule.length > 0 ? (
          <div className="space-y-3">
            {todaySchedule.map((appointment, index) => (
              <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-gradient-to-r from-blue-400 to-purple-500 rounded-full flex items-center justify-center text-white font-semibold text-sm">
                    {appointment.patient?.firstName?.charAt(0) || 'P'}
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-900">
                      {appointment.patient?.firstName} {appointment.patient?.lastName}
                    </p>
                    <p className="text-xs text-gray-600">
                      {new Date(appointment.scheduledAt).toLocaleTimeString()} - {appointment.type}
                    </p>
                  </div>
                </div>
                <span className={`px-2 py-1 text-xs font-semibold rounded-full ${
                  appointment.status === 'confirmed' ? 'bg-green-100 text-green-700' :
                  appointment.status === 'pending' ? 'bg-yellow-100 text-yellow-700' :
                  'bg-gray-100 text-gray-700'
                }`}>
                  {appointment.status}
                </span>
              </div>
            ))}
            <button
              onClick={() => onNavigate('appointments')}
              className="w-full text-center text-sm text-blue-600 hover:text-blue-800 font-medium py-2"
            >
              View All Appointments
            </button>
          </div>
        ) : (
          <div className="text-center py-8">
            <Calendar className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-500">No appointments scheduled for today</p>
          </div>
        )}
      </div>

      {/* Practitioner Actions */}
      <div>
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {practitionerActions.map((action) => {
            const Icon = action.icon;
            return (
              <button
                key={action.id}
                onClick={action.action}
                className="p-4 bg-white rounded-lg border border-gray-200 hover:border-gray-300 hover:shadow-md transition-all"
              >
                <div className="flex flex-col items-center text-center space-y-2">
                  <div className="p-3 bg-green-100 rounded-full">
                    <Icon className="h-6 w-6 text-green-600" />
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

      {/* Practice Status */}
      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Practice Status</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="flex items-center space-x-3">
            <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
            <div>
              <p className="text-sm font-medium text-gray-900">Status</p>
              <p className="text-xs text-gray-500">Available</p>
            </div>
          </div>
          <div className="flex items-center space-x-3">
            <div className="w-3 h-3 bg-blue-500 rounded-full animate-pulse"></div>
            <div>
              <p className="text-sm font-medium text-gray-900">Next Appointment</p>
              <p className="text-xs text-gray-500">
                {todaySchedule.length > 0 ? 
                  new Date(todaySchedule[0].scheduledAt).toLocaleTimeString() : 
                  'None scheduled'
                }
              </p>
            </div>
          </div>
          <div className="flex items-center space-x-3">
            <div className="w-3 h-3 bg-yellow-500 rounded-full animate-pulse"></div>
            <div>
              <p className="text-sm font-medium text-gray-900">Notifications</p>
              <p className="text-xs text-gray-500">{quickStats.unreadMessages} unread</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PractitionerQuickActions;

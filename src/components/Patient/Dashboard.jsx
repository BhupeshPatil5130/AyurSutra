import React, { useState, useEffect } from 'react';
import { 
  Calendar, 
  Clock, 
  Activity, 
  Heart, 
  TrendingUp, 
  Bell,
  MessageCircle,
  FileText,
  Target,
  Award
} from 'lucide-react';

const Dashboard = () => {
  const [dashboardData, setDashboardData] = useState({
    overview: {
      upcomingAppointments: 0,
      activeTherapyPlans: 0,
      completedSessions: 0,
      healthGoalsProgress: 0,
      unreadMessages: 0,
      pendingInvoices: 0
    },
    upcomingAppointments: [],
    recentActivity: [],
    healthMetrics: {},
    notifications: []
  });

  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('/api/patient/dashboard', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      const data = await response.json();
      setDashboardData(data);
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600"></div>
      </div>
    );
  }

  const StatCard = ({ icon: Icon, title, value, subtitle, color = "green" }) => (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 hover:shadow-md transition-shadow">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-gray-600">{title}</p>
          <p className={`text-3xl font-bold text-${color}-600 mt-1`}>{value}</p>
          {subtitle && <p className="text-sm text-gray-500 mt-1">{subtitle}</p>}
        </div>
        <div className={`p-3 bg-${color}-100 rounded-lg`}>
          <Icon className={`h-6 w-6 text-${color}-600`} />
        </div>
      </div>
    </div>
  );

  const AppointmentCard = ({ appointment }) => (
    <div className="bg-white rounded-lg border border-gray-200 p-4 hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <h4 className="font-semibold text-gray-900">
            Dr. {appointment.practitioner?.firstName} {appointment.practitioner?.lastName}
          </h4>
          <p className="text-sm text-gray-600 mt-1">{appointment.type}</p>
          <div className="flex items-center mt-2 text-sm text-gray-500">
            <Calendar className="h-4 w-4 mr-1" />
            {new Date(appointment.appointmentDate).toLocaleDateString()}
            <Clock className="h-4 w-4 ml-3 mr-1" />
            {appointment.startTime}
          </div>
        </div>
        <span className={`px-2 py-1 text-xs font-medium rounded-full ${
          appointment.status === 'confirmed' 
            ? 'bg-green-100 text-green-800'
            : appointment.status === 'pending'
            ? 'bg-yellow-100 text-yellow-800'
            : 'bg-gray-100 text-gray-800'
        }`}>
          {appointment.status}
        </span>
      </div>
    </div>
  );

  const ActivityItem = ({ activity }) => (
    <div className="flex items-start space-x-3 py-3">
      <div className="flex-shrink-0">
        <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
          <Activity className="h-4 w-4 text-green-600" />
        </div>
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-gray-900">{activity.title}</p>
        <p className="text-sm text-gray-500">{activity.description}</p>
        <p className="text-xs text-gray-400 mt-1">
          {new Date(activity.createdAt).toLocaleDateString()}
        </p>
      </div>
    </div>
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-green-600 to-green-700 rounded-xl p-6 text-white">
        <h1 className="text-2xl font-bold">Welcome back!</h1>
        <p className="text-green-100 mt-1">Here's your wellness journey overview</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <StatCard
          icon={Calendar}
          title="Upcoming Appointments"
          value={dashboardData.overview.upcomingAppointments}
          subtitle="Next 7 days"
        />
        <StatCard
          icon={Activity}
          title="Active Therapy Plans"
          value={dashboardData.overview.activeTherapyPlans}
          subtitle="In progress"
        />
        <StatCard
          icon={Award}
          title="Completed Sessions"
          value={dashboardData.overview.completedSessions}
          subtitle="This month"
        />
        <StatCard
          icon={Target}
          title="Health Goals"
          value={`${dashboardData.overview.healthGoalsProgress}%`}
          subtitle="Average progress"
          color="blue"
        />
        <StatCard
          icon={MessageCircle}
          title="Unread Messages"
          value={dashboardData.overview.unreadMessages}
          subtitle="From practitioners"
          color="purple"
        />
        <StatCard
          icon={FileText}
          title="Pending Invoices"
          value={dashboardData.overview.pendingInvoices}
          subtitle="Awaiting payment"
          color="orange"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Upcoming Appointments */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100">
          <div className="p-6 border-b border-gray-100">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold text-gray-900">Upcoming Appointments</h2>
              <Calendar className="h-5 w-5 text-gray-400" />
            </div>
          </div>
          <div className="p-6">
            {dashboardData.upcomingAppointments.length > 0 ? (
              <div className="space-y-4">
                {dashboardData.upcomingAppointments.slice(0, 3).map((appointment, index) => (
                  <AppointmentCard key={index} appointment={appointment} />
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <Calendar className="h-12 w-12 text-gray-300 mx-auto mb-3" />
                <p className="text-gray-500">No upcoming appointments</p>
                <button className="mt-3 text-green-600 hover:text-green-700 font-medium">
                  Book an appointment
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Recent Activity */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100">
          <div className="p-6 border-b border-gray-100">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold text-gray-900">Recent Activity</h2>
              <Activity className="h-5 w-5 text-gray-400" />
            </div>
          </div>
          <div className="p-6">
            {dashboardData.recentActivity.length > 0 ? (
              <div className="space-y-1">
                {dashboardData.recentActivity.slice(0, 4).map((activity, index) => (
                  <ActivityItem key={index} activity={activity} />
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <Activity className="h-12 w-12 text-gray-300 mx-auto mb-3" />
                <p className="text-gray-500">No recent activity</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Health Metrics */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100">
        <div className="p-6 border-b border-gray-100">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-gray-900">Health Metrics</h2>
            <Heart className="h-5 w-5 text-gray-400" />
          </div>
        </div>
        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center">
              <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-3">
                <Heart className="h-8 w-8 text-red-600" />
              </div>
              <p className="text-sm font-medium text-gray-600">Blood Pressure</p>
              <p className="text-lg font-bold text-gray-900">
                {dashboardData.healthMetrics.bloodPressure || '120/80'}
              </p>
              <p className="text-xs text-gray-500">mmHg</p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-3">
                <TrendingUp className="h-8 w-8 text-blue-600" />
              </div>
              <p className="text-sm font-medium text-gray-600">Weight</p>
              <p className="text-lg font-bold text-gray-900">
                {dashboardData.healthMetrics.weight || '70'} kg
              </p>
              <p className="text-xs text-gray-500">Last updated today</p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-3">
                <Activity className="h-8 w-8 text-green-600" />
              </div>
              <p className="text-sm font-medium text-gray-600">BMI</p>
              <p className="text-lg font-bold text-gray-900">
                {dashboardData.healthMetrics.bmi || '22.9'}
              </p>
              <p className="text-xs text-gray-500">Normal range</p>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100">
        <div className="p-6 border-b border-gray-100">
          <h2 className="text-lg font-semibold text-gray-900">Quick Actions</h2>
        </div>
        <div className="p-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <button className="flex flex-col items-center p-4 border border-gray-200 rounded-lg hover:border-green-300 hover:bg-green-50 transition-colors">
              <Calendar className="h-8 w-8 text-green-600 mb-2" />
              <span className="text-sm font-medium text-gray-700">Book Appointment</span>
            </button>
            <button className="flex flex-col items-center p-4 border border-gray-200 rounded-lg hover:border-green-300 hover:bg-green-50 transition-colors">
              <MessageCircle className="h-8 w-8 text-green-600 mb-2" />
              <span className="text-sm font-medium text-gray-700">Message Doctor</span>
            </button>
            <button className="flex flex-col items-center p-4 border border-gray-200 rounded-lg hover:border-green-300 hover:bg-green-50 transition-colors">
              <FileText className="h-8 w-8 text-green-600 mb-2" />
              <span className="text-sm font-medium text-gray-700">View Records</span>
            </button>
            <button className="flex flex-col items-center p-4 border border-gray-200 rounded-lg hover:border-green-300 hover:bg-green-50 transition-colors">
              <Target className="h-8 w-8 text-green-600 mb-2" />
              <span className="text-sm font-medium text-gray-700">Health Goals</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;

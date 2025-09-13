import React, { useState, useEffect } from 'react';
import { 
  Calendar, 
  Users, 
  TrendingUp, 
  DollarSign,
  Clock,
  Star,
  Activity,
  AlertTriangle,
  CheckCircle,
  Eye,
  Plus,
  RefreshCw,
  Download,
  Filter,
  Bell,
  MessageSquare,
  FileText,
  BarChart3,
  PieChart,
  ArrowUpRight,
  ArrowDownRight,
  User,
  Heart,
  Zap
} from 'lucide-react';
import { Link } from 'react-router-dom';
import api from '../../utils/api';
import toast from 'react-hot-toast';

const EnhancedPractitionerDashboard = () => {
  const [dashboardData, setDashboardData] = useState({});
  const [todayAppointments, setTodayAppointments] = useState([]);
  const [recentPatients, setRecentPatients] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [timeRange, setTimeRange] = useState('7d');

  useEffect(() => {
    fetchDashboardData();
  }, [timeRange]);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const [dashboardRes, appointmentsRes, patientsRes, notificationsRes] = await Promise.all([
        api.get(`/practitioner/dashboard/stats?timeRange=${timeRange}`),
        api.get('/practitioner/appointments/today'),
        api.get('/practitioner/patients/recent'),
        api.get('/practitioner/notifications/unread')
      ]);

      setDashboardData(dashboardRes.data);
      setTodayAppointments(appointmentsRes.data);
      setRecentPatients(patientsRes.data);
      setNotifications(notificationsRes.data);
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      toast.error('Error loading dashboard data');
    } finally {
      setLoading(false);
    }
  };

  const markAppointmentComplete = async (appointmentId) => {
    try {
      await api.patch(`/practitioner/appointments/${appointmentId}/status`, {
        status: 'completed'
      });
      toast.success('Appointment marked as completed');
      fetchDashboardData();
    } catch (error) {
      console.error('Error updating appointment:', error);
      toast.error('Error updating appointment');
    }
  };

  const getPercentageChange = (current, previous) => {
    if (!previous || previous === 0) return 0;
    return ((current - previous) / previous * 100).toFixed(1);
  };

  const getChangeIcon = (change) => {
    if (change > 0) return <ArrowUpRight className="h-4 w-4 text-green-500" />;
    if (change < 0) return <ArrowDownRight className="h-4 w-4 text-red-500" />;
    return null;
  };

  const getAppointmentStatusColor = (status) => {
    switch (status) {
      case 'scheduled': return 'bg-blue-100 text-blue-700';
      case 'confirmed': return 'bg-green-100 text-green-700';
      case 'in-progress': return 'bg-yellow-100 text-yellow-700';
      case 'completed': return 'bg-green-100 text-green-700';
      case 'cancelled': return 'bg-red-100 text-red-700';
      default: return 'bg-gray-100 text-gray-700';
    }
  };

  const formatTime = (time) => {
    return new Date(`2000-01-01T${time}`).toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-500"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Practitioner Dashboard</h1>
          <p className="text-gray-600">Welcome back! Here's your practice overview</p>
        </div>
        <div className="flex items-center space-x-3">
          <select
            value={timeRange}
            onChange={(e) => setTimeRange(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
          >
            <option value="7d">Last 7 Days</option>
            <option value="30d">Last 30 Days</option>
            <option value="90d">Last 90 Days</option>
          </select>
          <button
            onClick={fetchDashboardData}
            className="flex items-center px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700"
          >
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </button>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-gradient-to-r from-blue-500 to-blue-600 rounded-lg p-6 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-blue-100">Total Patients</p>
              <p className="text-3xl font-bold">{dashboardData.totalPatients?.current || 0}</p>
              <div className="flex items-center mt-2">
                {getChangeIcon(getPercentageChange(dashboardData.totalPatients?.current, dashboardData.totalPatients?.previous))}
                <span className="text-sm ml-1">
                  {Math.abs(getPercentageChange(dashboardData.totalPatients?.current, dashboardData.totalPatients?.previous))}%
                </span>
              </div>
            </div>
            <Users className="h-12 w-12 text-blue-200" />
          </div>
        </div>

        <div className="bg-gradient-to-r from-green-500 to-green-600 rounded-lg p-6 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-green-100">Appointments</p>
              <p className="text-3xl font-bold">{dashboardData.totalAppointments?.current || 0}</p>
              <div className="flex items-center mt-2">
                {getChangeIcon(getPercentageChange(dashboardData.totalAppointments?.current, dashboardData.totalAppointments?.previous))}
                <span className="text-sm ml-1">
                  {Math.abs(getPercentageChange(dashboardData.totalAppointments?.current, dashboardData.totalAppointments?.previous))}%
                </span>
              </div>
            </div>
            <Calendar className="h-12 w-12 text-green-200" />
          </div>
        </div>

        <div className="bg-gradient-to-r from-purple-500 to-purple-600 rounded-lg p-6 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-purple-100">Revenue</p>
              <p className="text-3xl font-bold">₹{(dashboardData.totalRevenue?.current || 0).toLocaleString()}</p>
              <div className="flex items-center mt-2">
                {getChangeIcon(getPercentageChange(dashboardData.totalRevenue?.current, dashboardData.totalRevenue?.previous))}
                <span className="text-sm ml-1">
                  {Math.abs(getPercentageChange(dashboardData.totalRevenue?.current, dashboardData.totalRevenue?.previous))}%
                </span>
              </div>
            </div>
            <DollarSign className="h-12 w-12 text-purple-200" />
          </div>
        </div>

        <div className="bg-gradient-to-r from-yellow-500 to-yellow-600 rounded-lg p-6 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-yellow-100">Avg Rating</p>
              <p className="text-3xl font-bold">{(dashboardData.avgRating?.current || 0).toFixed(1)}</p>
              <div className="flex items-center mt-2">
                <Star className="h-4 w-4 text-yellow-200 mr-1" />
                <span className="text-sm">
                  {dashboardData.totalReviews || 0} reviews
                </span>
              </div>
            </div>
            <Star className="h-12 w-12 text-yellow-200" />
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
          <Link
            to="/practitioner/appointments/schedule"
            className="flex flex-col items-center p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
          >
            <Plus className="h-8 w-8 text-green-600 mb-2" />
            <span className="text-sm font-medium text-gray-900">New Appointment</span>
          </Link>
          
          <Link
            to="/practitioner/patients/add"
            className="flex flex-col items-center p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
          >
            <User className="h-8 w-8 text-blue-600 mb-2" />
            <span className="text-sm font-medium text-gray-900">Add Patient</span>
          </Link>
          
          <Link
            to="/practitioner/therapy-plans/create"
            className="flex flex-col items-center p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
          >
            <FileText className="h-8 w-8 text-purple-600 mb-2" />
            <span className="text-sm font-medium text-gray-900">Create Plan</span>
          </Link>
          
          <Link
            to="/practitioner/sessions"
            className="flex flex-col items-center p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
          >
            <Activity className="h-8 w-8 text-orange-600 mb-2" />
            <span className="text-sm font-medium text-gray-900">View Sessions</span>
          </Link>
          
          <Link
            to="/practitioner/feedback"
            className="flex flex-col items-center p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
          >
            <MessageSquare className="h-8 w-8 text-pink-600 mb-2" />
            <span className="text-sm font-medium text-gray-900">Reviews</span>
          </Link>
          
          <Link
            to="/practitioner/reports"
            className="flex flex-col items-center p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
          >
            <BarChart3 className="h-8 w-8 text-indigo-600 mb-2" />
            <span className="text-sm font-medium text-gray-900">Reports</span>
          </Link>
        </div>
      </div>

      {/* Today's Schedule & Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Today's Appointments */}
        <div className="bg-white rounded-lg shadow">
          <div className="px-6 py-4 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold text-gray-900">Today's Schedule</h3>
              <Link
                to="/practitioner/appointments"
                className="text-sm text-green-600 hover:text-green-800"
              >
                View All
              </Link>
            </div>
          </div>
          <div className="divide-y divide-gray-200 max-h-96 overflow-y-auto">
            {todayAppointments.length > 0 ? (
              todayAppointments.map((appointment) => (
                <div key={appointment._id} className="p-4 hover:bg-gray-50">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 bg-gradient-to-r from-green-400 to-blue-500 rounded-full flex items-center justify-center text-white font-semibold">
                        {appointment.patient?.firstName?.charAt(0)}{appointment.patient?.lastName?.charAt(0)}
                      </div>
                      <div>
                        <p className="font-medium text-gray-900">
                          {appointment.patient?.firstName} {appointment.patient?.lastName}
                        </p>
                        <p className="text-sm text-gray-600">
                          {formatTime(appointment.startTime)} - {formatTime(appointment.endTime)}
                        </p>
                        <p className="text-xs text-gray-500 capitalize">{appointment.type}</p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <span className={`px-2 py-1 text-xs font-semibold rounded-full ${getAppointmentStatusColor(appointment.status)}`}>
                        {appointment.status}
                      </span>
                      {appointment.status === 'confirmed' && (
                        <button
                          onClick={() => markAppointmentComplete(appointment._id)}
                          className="p-1 text-green-600 hover:text-green-800"
                          title="Mark Complete"
                        >
                          <CheckCircle className="h-4 w-4" />
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="p-8 text-center">
                <Calendar className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-500">No appointments scheduled for today</p>
              </div>
            )}
          </div>
        </div>

        {/* Recent Patients */}
        <div className="bg-white rounded-lg shadow">
          <div className="px-6 py-4 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold text-gray-900">Recent Patients</h3>
              <Link
                to="/practitioner/patients"
                className="text-sm text-green-600 hover:text-green-800"
              >
                View All
              </Link>
            </div>
          </div>
          <div className="divide-y divide-gray-200 max-h-96 overflow-y-auto">
            {recentPatients.length > 0 ? (
              recentPatients.map((patient) => (
                <div key={patient._id} className="p-4 hover:bg-gray-50">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 bg-gradient-to-r from-purple-400 to-pink-500 rounded-full flex items-center justify-center text-white font-semibold">
                        {patient.firstName?.charAt(0)}{patient.lastName?.charAt(0)}
                      </div>
                      <div>
                        <p className="font-medium text-gray-900">
                          {patient.firstName} {patient.lastName}
                        </p>
                        <p className="text-sm text-gray-600">{patient.email}</p>
                        <p className="text-xs text-gray-500">
                          Last visit: {patient.lastAppointment 
                            ? new Date(patient.lastAppointment).toLocaleDateString()
                            : 'Never'
                          }
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <span className={`px-2 py-1 text-xs font-semibold rounded-full ${
                        patient.riskLevel === 'high' ? 'bg-red-100 text-red-700' :
                        patient.riskLevel === 'medium' ? 'bg-yellow-100 text-yellow-700' :
                        'bg-green-100 text-green-700'
                      }`}>
                        {patient.riskLevel || 'low'} risk
                      </span>
                      <Link
                        to={`/practitioner/patients/${patient._id}`}
                        className="p-1 text-blue-600 hover:text-blue-800"
                        title="View Details"
                      >
                        <Eye className="h-4 w-4" />
                      </Link>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="p-8 text-center">
                <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-500">No recent patients</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Performance Analytics */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Performance Metrics */}
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Performance Metrics</h3>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-gray-600">Patient Satisfaction</span>
              <div className="flex items-center">
                <div className="w-24 bg-gray-200 rounded-full h-2 mr-3">
                  <div className="bg-green-500 h-2 rounded-full" style={{width: `${(dashboardData.patientSatisfaction || 0)}%`}}></div>
                </div>
                <span className="text-sm font-medium">{(dashboardData.patientSatisfaction || 0)}%</span>
              </div>
            </div>
            
            <div className="flex items-center justify-between">
              <span className="text-gray-600">Treatment Success Rate</span>
              <div className="flex items-center">
                <div className="w-24 bg-gray-200 rounded-full h-2 mr-3">
                  <div className="bg-blue-500 h-2 rounded-full" style={{width: `${(dashboardData.successRate || 0)}%`}}></div>
                </div>
                <span className="text-sm font-medium">{(dashboardData.successRate || 0)}%</span>
              </div>
            </div>
            
            <div className="flex items-center justify-between">
              <span className="text-gray-600">Appointment Completion</span>
              <div className="flex items-center">
                <div className="w-24 bg-gray-200 rounded-full h-2 mr-3">
                  <div className="bg-purple-500 h-2 rounded-full" style={{width: `${(dashboardData.completionRate || 0)}%`}}></div>
                </div>
                <span className="text-sm font-medium">{(dashboardData.completionRate || 0)}%</span>
              </div>
            </div>
          </div>
        </div>

        {/* Recent Reviews */}
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Reviews</h3>
          <div className="space-y-3">
            {dashboardData.recentReviews?.slice(0, 3).map((review, index) => (
              <div key={index} className="border-l-4 border-yellow-400 pl-3">
                <div className="flex items-center mb-1">
                  <div className="flex text-yellow-400">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} className={`h-3 w-3 ${i < review.rating ? 'fill-current' : ''}`} />
                    ))}
                  </div>
                  <span className="text-xs text-gray-500 ml-2">{review.rating}/5</span>
                </div>
                <p className="text-sm text-gray-700 line-clamp-2">{review.comment}</p>
                <p className="text-xs text-gray-500 mt-1">- {review.patientName}</p>
              </div>
            )) || (
              <p className="text-gray-500 text-center py-4">No reviews yet</p>
            )}
          </div>
        </div>

        {/* Notifications */}
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Notifications</h3>
          <div className="space-y-3">
            {notifications.slice(0, 4).map((notification, index) => (
              <div key={index} className="flex items-start space-x-3 p-2 bg-gray-50 rounded">
                <div className={`p-1 rounded-full ${
                  notification.type === 'appointment' ? 'bg-blue-100' :
                  notification.type === 'review' ? 'bg-yellow-100' :
                  notification.type === 'payment' ? 'bg-green-100' :
                  'bg-gray-100'
                }`}>
                  {notification.type === 'appointment' ? <Calendar className="h-3 w-3 text-blue-600" /> :
                   notification.type === 'review' ? <Star className="h-3 w-3 text-yellow-600" /> :
                   notification.type === 'payment' ? <DollarSign className="h-3 w-3 text-green-600" /> :
                   <Bell className="h-3 w-3 text-gray-600" />}
                </div>
                <div className="flex-1">
                  <p className="text-sm text-gray-900">{notification.title}</p>
                  <p className="text-xs text-gray-500">{notification.message}</p>
                  <p className="text-xs text-gray-400 mt-1">
                    {new Date(notification.createdAt).toLocaleString()}
                  </p>
                </div>
              </div>
            ))}
            {notifications.length === 0 && (
              <p className="text-gray-500 text-center py-4">No new notifications</p>
            )}
          </div>
        </div>
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Appointment Trends</h3>
          <div className="h-64 flex items-center justify-center bg-gray-50 rounded-md">
            <div className="text-center">
              <BarChart3 className="h-16 w-16 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500">Chart visualization</p>
              <p className="text-sm text-gray-400">Integration with charting library needed</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Revenue Distribution</h3>
          <div className="h-64 flex items-center justify-center bg-gray-50 rounded-md">
            <div className="text-center">
              <PieChart className="h-16 w-16 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500">Chart visualization</p>
              <p className="text-sm text-gray-400">Integration with charting library needed</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EnhancedPractitionerDashboard;

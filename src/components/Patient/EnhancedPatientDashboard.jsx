import React, { useState, useEffect } from 'react';
import { 
  Calendar, Clock, User, Heart, Activity, Bell, MessageSquare,
  TrendingUp, CheckCircle, AlertCircle, Star, DollarSign,
  FileText, Phone, Video, Plus, RefreshCw, ArrowRight,
  Thermometer, Weight, Zap, Target, Award, BookOpen, Stethoscope
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import api from '../../utils/api';
import { getDashboardData } from '../../services/mockPatientData';
import toast from 'react-hot-toast';

const EnhancedPatientDashboard = () => {
  const [dashboardData, setDashboardData] = useState({});
  const [loading, setLoading] = useState(true);
  const [timeRange, setTimeRange] = useState('week');
  const [usingMockData, setUsingMockData] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    fetchDashboardData();
  }, [timeRange]);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      setUsingMockData(false);
      const response = await api.get(`/patient/dashboard?range=${timeRange}`);
      setDashboardData(response.data);
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      console.log('Using mock data as fallback');
      // Use mock data as fallback
      const mockData = getDashboardData(timeRange);
      setDashboardData(mockData);
      setUsingMockData(true);
      toast.success('Dashboard loaded with sample data');
    } finally {
      setLoading(false);
    }
  };

  const quickActions = [
    { 
      title: 'Book Appointment', 
      icon: Calendar, 
      color: 'bg-gradient-to-br from-blue-500 to-blue-600', 
      hoverColor: 'hover:from-blue-600 hover:to-blue-700',
      action: () => navigate('/patient/appointments'),
      description: 'Schedule with practitioner'
    },
    { 
      title: 'Find Practitioner', 
      icon: Stethoscope, 
      color: 'bg-gradient-to-br from-emerald-500 to-emerald-600', 
      hoverColor: 'hover:from-emerald-600 hover:to-emerald-700',
      action: () => navigate('/patient/practitioners'),
      description: 'Search specialists'
    },
    { 
      title: 'Therapy Plans', 
      icon: Heart, 
      color: 'bg-gradient-to-br from-purple-500 to-purple-600', 
      hoverColor: 'hover:from-purple-600 hover:to-purple-700',
      action: () => navigate('/patient/therapy-plans'),
      description: 'View your plans'
    },
    { 
      title: 'Health Records', 
      icon: FileText, 
      color: 'bg-gradient-to-br from-orange-500 to-orange-600', 
      hoverColor: 'hover:from-orange-600 hover:to-orange-700',
      action: () => navigate('/patient/medical-records'),
      description: 'Medical history'
    },
    { 
      title: 'Messages', 
      icon: MessageSquare, 
      color: 'bg-gradient-to-br from-indigo-500 to-indigo-600', 
      hoverColor: 'hover:from-indigo-600 hover:to-indigo-700',
      action: () => navigate('/patient/messages'),
      description: 'Chat with doctors'
    },
    { 
      title: 'Payments', 
      icon: DollarSign, 
      color: 'bg-gradient-to-br from-amber-500 to-amber-600', 
      hoverColor: 'hover:from-amber-600 hover:to-amber-700',
      action: () => navigate('/patient/payments'),
      description: 'Billing & payments'
    }
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="flex flex-col items-center space-y-4">
          <div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-200 border-t-blue-600"></div>
          <p className="text-gray-600 font-medium">Loading your dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8 max-w-7xl mx-auto">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-2xl p-6 border border-blue-100">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              Welcome back, {dashboardData.patient?.firstName || 'Patient'}! 👋
            </h1>
            <p className="text-gray-600 text-lg">Here's your health journey overview</p>
            {usingMockData && (
              <div className="mt-3 inline-flex items-center px-3 py-1 rounded-full text-sm bg-blue-100 text-blue-800">
                <div className="w-2 h-2 bg-blue-500 rounded-full mr-2"></div>
                Using sample data for demonstration
              </div>
            )}
          </div>
          <div className="flex items-center space-x-3">
            <select
              value={timeRange}
              onChange={(e) => setTimeRange(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white shadow-sm"
            >
              <option value="week">Last 7 Days</option>
              <option value="month">Last 30 Days</option>
              <option value="quarter">Last 3 Months</option>
            </select>
            <button
              onClick={fetchDashboardData}
              className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors shadow-sm"
            >
              <RefreshCw className="h-4 w-4 mr-2" />
              Refresh
            </button>
          </div>
        </div>
      </div>

      {/* Health Status Alert */}
      {dashboardData.healthAlert && (
        <div className="bg-gradient-to-r from-amber-50 to-orange-50 border-l-4 border-amber-400 p-4 rounded-lg shadow-sm">
          <div className="flex items-center">
            <AlertCircle className="h-5 w-5 text-amber-500 mr-3" />
            <div>
              <h3 className="text-sm font-semibold text-amber-800">Health Reminder</h3>
              <p className="text-sm text-amber-700 mt-1">{dashboardData.healthAlert}</p>
            </div>
          </div>
        </div>
      )}

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 hover:shadow-md transition-shadow">
          <div className="flex items-center">
            <div className="p-3 bg-gradient-to-br from-blue-100 to-blue-200 rounded-xl">
              <Calendar className="h-6 w-6 text-blue-600" />
            </div>
            <div className="ml-4 flex-1">
              <p className="text-sm font-medium text-gray-600 mb-1">Next Appointment</p>
              <p className="text-lg font-bold text-gray-900">
                {dashboardData.nextAppointment ? 
                  new Date(dashboardData.nextAppointment.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) : 
                  'Not scheduled'
                }
              </p>
              <p className="text-sm text-blue-600 truncate">
                {dashboardData.nextAppointment?.practitioner || 'Book now'}
              </p>
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 hover:shadow-md transition-shadow">
          <div className="flex items-center">
            <div className="p-3 bg-gradient-to-br from-emerald-100 to-emerald-200 rounded-xl">
              <TrendingUp className="h-6 w-6 text-emerald-600" />
            </div>
            <div className="ml-4 flex-1">
              <p className="text-sm font-medium text-gray-600 mb-1">Treatment Progress</p>
              <p className="text-2xl font-bold text-gray-900">{dashboardData.treatmentProgress || 0}%</p>
              <p className="text-sm text-emerald-600">On track</p>
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 hover:shadow-md transition-shadow">
          <div className="flex items-center">
            <div className="p-3 bg-gradient-to-br from-purple-100 to-purple-200 rounded-xl">
              <Heart className="h-6 w-6 text-purple-600" />
            </div>
            <div className="ml-4 flex-1">
              <p className="text-sm font-medium text-gray-600 mb-1">Health Score</p>
              <p className="text-2xl font-bold text-gray-900">{dashboardData.healthScore || 85}</p>
              <p className="text-sm text-purple-600">Excellent</p>
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 hover:shadow-md transition-shadow">
          <div className="flex items-center">
            <div className="p-3 bg-gradient-to-br from-orange-100 to-orange-200 rounded-xl">
              <Activity className="h-6 w-6 text-orange-600" />
            </div>
            <div className="ml-4 flex-1">
              <p className="text-sm font-medium text-gray-600 mb-1">Sessions Completed</p>
              <p className="text-2xl font-bold text-gray-900">{dashboardData.completedSessions || 0}</p>
              <p className="text-sm text-orange-600">This month</p>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
        <h3 className="text-xl font-bold text-gray-900 mb-6">Quick Actions</h3>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          {quickActions.map((action, index) => (
            <button
              key={index}
              onClick={action.action}
              className={`group flex flex-col items-center p-4 border border-gray-200 rounded-xl hover:border-gray-300 hover:shadow-md transition-all duration-200 transform hover:-translate-y-1`}
            >
              <div className={`p-3 ${action.color} ${action.hoverColor} rounded-xl mb-3 group-hover:scale-110 transition-transform duration-200 shadow-lg`}>
                <action.icon className="h-6 w-6 text-white" />
              </div>
              <h4 className="font-semibold text-gray-900 text-sm text-center group-hover:text-gray-700">{action.title}</h4>
              <p className="text-xs text-gray-500 text-center mt-1 group-hover:text-gray-600">{action.description}</p>
            </button>
          ))}
        </div>
      </div>

      {/* Today's Schedule & Health Vitals */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Today's Schedule */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-xl font-bold text-gray-900">Today's Schedule</h3>
            <button 
              onClick={() => navigate('/patient/appointments')}
              className="text-blue-600 hover:text-blue-800 text-sm font-semibold hover:underline transition-colors"
            >
              View All
            </button>
          </div>
          <div className="space-y-3">
            {dashboardData.todaySchedule?.length > 0 ? (
              dashboardData.todaySchedule.map((item, index) => (
                <div key={index} className="flex items-center p-4 bg-gradient-to-r from-gray-50 to-gray-100 rounded-xl border border-gray-200 hover:shadow-sm transition-shadow">
                  <div className="flex-shrink-0">
                    <div className="p-2 bg-white rounded-lg shadow-sm">
                      <Clock className="h-5 w-5 text-blue-600" />
                    </div>
                  </div>
                  <div className="ml-4 flex-1">
                    <p className="text-sm font-semibold text-gray-900">{item.title}</p>
                    <p className="text-sm text-gray-600">{item.time} - {item.practitioner}</p>
                  </div>
                  <div className="flex-shrink-0">
                    <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold ${
                      item.status === 'confirmed' ? 'bg-emerald-100 text-emerald-800' :
                      item.status === 'completed' ? 'bg-blue-100 text-blue-800' :
                      item.status === 'pending' ? 'bg-amber-100 text-amber-800' :
                      'bg-gray-100 text-gray-800'
                    }`}>
                      {item.status}
                    </span>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-12">
                <div className="w-16 h-16 bg-gradient-to-br from-blue-100 to-blue-200 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Calendar className="h-8 w-8 text-blue-600" />
                </div>
                <p className="text-gray-500 mb-3">No appointments today</p>
                <button 
                  onClick={() => navigate('/patient/appointments')}
                  className="text-blue-600 hover:text-blue-800 text-sm font-semibold hover:underline transition-colors"
                >
                  Schedule an appointment
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Health Vitals */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-xl font-bold text-gray-900">Health Vitals</h3>
            <button 
              onClick={() => navigate('/patient/health-tracking')}
              className="text-blue-600 hover:text-blue-800 text-sm font-semibold hover:underline transition-colors"
            >
              Update Vitals
            </button>
          </div>
          <div className="space-y-3">
            <div className="flex items-center justify-between p-4 bg-gradient-to-r from-red-50 to-pink-50 rounded-xl border border-red-100">
              <div className="flex items-center">
                <div className="p-2 bg-white rounded-lg shadow-sm mr-3">
                  <Thermometer className="h-5 w-5 text-red-500" />
                </div>
                <span className="text-sm font-semibold text-gray-900">Body Temperature</span>
              </div>
              <span className="text-sm font-bold text-red-600">{dashboardData.vitals?.temperature || '98.6°F'}</span>
            </div>
            
            <div className="flex items-center justify-between p-4 bg-gradient-to-r from-rose-50 to-red-50 rounded-xl border border-rose-100">
              <div className="flex items-center">
                <div className="p-2 bg-white rounded-lg shadow-sm mr-3">
                  <Heart className="h-5 w-5 text-rose-500" />
                </div>
                <span className="text-sm font-semibold text-gray-900">Blood Pressure</span>
              </div>
              <span className="text-sm font-bold text-rose-600">{dashboardData.vitals?.bloodPressure || '120/80'}</span>
            </div>
            
            <div className="flex items-center justify-between p-4 bg-gradient-to-r from-blue-50 to-cyan-50 rounded-xl border border-blue-100">
              <div className="flex items-center">
                <div className="p-2 bg-white rounded-lg shadow-sm mr-3">
                  <Weight className="h-5 w-5 text-blue-500" />
                </div>
                <span className="text-sm font-semibold text-gray-900">Weight</span>
              </div>
              <span className="text-sm font-bold text-blue-600">{dashboardData.vitals?.weight || '70 kg'}</span>
            </div>
            
            <div className="flex items-center justify-between p-4 bg-gradient-to-r from-yellow-50 to-amber-50 rounded-xl border border-yellow-100">
              <div className="flex items-center">
                <div className="p-2 bg-white rounded-lg shadow-sm mr-3">
                  <Zap className="h-5 w-5 text-yellow-500" />
                </div>
                <span className="text-sm font-semibold text-gray-900">Energy Level</span>
              </div>
              <div className="flex items-center space-x-1">
                {[1, 2, 3, 4, 5].map((star) => (
                  <Star
                    key={star}
                    className={`h-4 w-4 ${
                      star <= (dashboardData.vitals?.energyLevel || 4)
                        ? 'text-yellow-400 fill-current'
                        : 'text-gray-300'
                    }`}
                  />
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Treatment Progress & Notifications */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Treatment Progress */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-xl font-bold text-gray-900">Treatment Progress</h3>
            <button 
              onClick={() => navigate('/patient/therapy-plans')}
              className="text-blue-600 hover:text-blue-800 text-sm font-semibold hover:underline transition-colors"
            >
              View Details
            </button>
          </div>
          
          {dashboardData.currentTreatment ? (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-gray-900">
                  {dashboardData.currentTreatment.name}
                </span>
                <span className="text-sm text-gray-600">
                  {dashboardData.currentTreatment.progress}% Complete
                </span>
              </div>
              
              <div className="w-full bg-gray-200 rounded-full h-3 shadow-inner">
                <div
                  className="bg-gradient-to-r from-emerald-500 to-emerald-600 h-3 rounded-full shadow-sm transition-all duration-500"
                  style={{ width: `${dashboardData.currentTreatment.progress}%` }}
                ></div>
              </div>
              
              <div className="grid grid-cols-2 gap-4 mt-6">
                <div className="text-center p-4 bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl border border-blue-200">
                  <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center mx-auto mb-2">
                    <Target className="h-5 w-5 text-white" />
                  </div>
                  <p className="text-xs font-medium text-gray-600 mb-1">Sessions Left</p>
                  <p className="text-xl font-bold text-blue-600">
                    {dashboardData.currentTreatment.sessionsLeft || 0}
                  </p>
                </div>
                
                <div className="text-center p-4 bg-gradient-to-br from-emerald-50 to-emerald-100 rounded-xl border border-emerald-200">
                  <div className="w-10 h-10 bg-emerald-600 rounded-full flex items-center justify-center mx-auto mb-2">
                    <Award className="h-5 w-5 text-white" />
                  </div>
                  <p className="text-xs font-medium text-gray-600 mb-1">Milestones</p>
                  <p className="text-xl font-bold text-emerald-600">
                    {dashboardData.currentTreatment.milestones || 0}
                  </p>
                </div>
              </div>
              
              <div className="mt-4">
                <h4 className="text-sm font-medium text-gray-900 mb-2">Next Steps</h4>
                <ul className="space-y-2">
                  {dashboardData.currentTreatment.nextSteps?.map((step, index) => (
                    <li key={index} className="flex items-center text-sm text-gray-600">
                      <CheckCircle className="h-4 w-4 text-green-500 mr-2" />
                      {step}
                    </li>
                  )) || (
                    <li className="text-sm text-gray-500">No upcoming steps</li>
                  )}
                </ul>
              </div>
            </div>
          ) : (
            <div className="text-center py-12">
              <div className="w-16 h-16 bg-gradient-to-br from-purple-100 to-purple-200 rounded-full flex items-center justify-center mx-auto mb-4">
                <BookOpen className="h-8 w-8 text-purple-600" />
              </div>
              <p className="text-gray-500 mb-3">No active treatment plan</p>
              <button 
                onClick={() => navigate('/patient/practitioners')}
                className="text-blue-600 hover:text-blue-800 text-sm font-semibold hover:underline transition-colors"
              >
                Explore treatment options
              </button>
            </div>
          )}
        </div>

        {/* Recent Notifications */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-xl font-bold text-gray-900">Recent Notifications</h3>
            <button 
              onClick={() => navigate('/patient/notifications')}
              className="text-blue-600 hover:text-blue-800 text-sm font-semibold hover:underline transition-colors"
            >
              View All
            </button>
          </div>
          
          <div className="space-y-3">
            {dashboardData.notifications?.length > 0 ? (
              dashboardData.notifications.slice(0, 5).map((notification, index) => (
                <div key={index} className={`flex items-start p-4 rounded-xl border transition-all ${
                  notification.read 
                    ? 'bg-gray-50 border-gray-200' 
                    : 'bg-blue-50 border-blue-200 shadow-sm'
                }`}>
                  <div className="flex-shrink-0">
                    <div className={`p-2 rounded-lg ${
                      notification.type === 'appointment' ? 'bg-blue-100' :
                      notification.type === 'message' ? 'bg-emerald-100' :
                      notification.type === 'reminder' ? 'bg-orange-100' :
                      'bg-purple-100'
                    }`}>
                      {notification.type === 'appointment' && <Calendar className="h-4 w-4 text-blue-600" />}
                      {notification.type === 'message' && <MessageSquare className="h-4 w-4 text-emerald-600" />}
                      {notification.type === 'reminder' && <Bell className="h-4 w-4 text-orange-600" />}
                      {notification.type === 'payment' && <DollarSign className="h-4 w-4 text-purple-600" />}
                    </div>
                  </div>
                  <div className="ml-4 flex-1">
                    <p className="text-sm font-semibold text-gray-900">{notification.title}</p>
                    <p className="text-sm text-gray-600 mt-1">{notification.message}</p>
                    <p className="text-xs text-gray-500 mt-2">{notification.time}</p>
                  </div>
                  {!notification.read && (
                    <div className="flex-shrink-0">
                      <div className="w-3 h-3 bg-blue-600 rounded-full shadow-sm"></div>
                    </div>
                  )}
                </div>
              ))
            ) : (
              <div className="text-center py-12">
                <div className="w-16 h-16 bg-gradient-to-br from-gray-100 to-gray-200 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Bell className="h-8 w-8 text-gray-500" />
                </div>
                <p className="text-gray-500">No new notifications</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Recent Activity & Health Tips */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Activity */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <h3 className="text-xl font-bold text-gray-900 mb-6">Recent Activity</h3>
          <div className="space-y-4">
            {dashboardData.recentActivity?.length > 0 ? (
              dashboardData.recentActivity.map((activity, index) => (
                <div key={index} className="flex items-center p-4 border-l-4 border-blue-500 bg-gradient-to-r from-blue-50 to-blue-100 rounded-r-xl">
                  <div className="flex-1">
                    <p className="text-sm font-semibold text-gray-900">{activity.action}</p>
                    <p className="text-sm text-gray-600 mt-1">{activity.details}</p>
                    <p className="text-xs text-gray-500 mt-2">{activity.timestamp}</p>
                  </div>
                  <div className="p-2 bg-blue-600 rounded-full">
                    <ArrowRight className="h-4 w-4 text-white" />
                  </div>
                </div>
              ))
            ) : (
              <p className="text-gray-500 text-center py-4">No recent activity</p>
            )}
          </div>
        </div>

        {/* Health Tips */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <h3 className="text-xl font-bold text-gray-900 mb-6">Health Tips</h3>
          <div className="space-y-4">
            {dashboardData.healthTips?.length > 0 ? (
              dashboardData.healthTips.map((tip, index) => (
                <div key={index} className="p-4 bg-gradient-to-r from-emerald-50 to-green-50 border border-emerald-200 rounded-xl">
                  <div className="flex items-start">
                    <div className="p-2 bg-emerald-600 rounded-full mr-4">
                      <Heart className="h-4 w-4 text-white" />
                    </div>
                    <div>
                      <h4 className="text-sm font-semibold text-emerald-900">{tip.title}</h4>
                      <p className="text-sm text-emerald-700 mt-2">{tip.description}</p>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-12">
                <div className="w-16 h-16 bg-gradient-to-br from-emerald-100 to-emerald-200 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Heart className="h-8 w-8 text-emerald-600" />
                </div>
                <p className="text-gray-500">No health tips available</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default EnhancedPatientDashboard;

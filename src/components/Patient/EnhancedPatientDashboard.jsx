import React, { useState, useEffect } from 'react';
import { 
  Calendar, Clock, User, Heart, Activity, Bell, MessageSquare,
  TrendingUp, CheckCircle, AlertCircle, Star, DollarSign,
  FileText, Phone, Video, Plus, RefreshCw, ArrowRight,
  Thermometer, Weight, Zap, Target, Award, BookOpen
} from 'lucide-react';
import api from '../../utils/api';
import toast from 'react-hot-toast';

const EnhancedPatientDashboard = () => {
  const [dashboardData, setDashboardData] = useState({});
  const [loading, setLoading] = useState(true);
  const [timeRange, setTimeRange] = useState('week');

  useEffect(() => {
    fetchDashboardData();
  }, [timeRange]);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const response = await api.get(`/patient/dashboard?range=${timeRange}`);
      setDashboardData(response.data);
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      toast.error('Error loading dashboard');
    } finally {
      setLoading(false);
    }
  };

  const quickActions = [
    { 
      title: 'Book Appointment', 
      icon: Calendar, 
      color: 'bg-blue-500', 
      action: () => window.location.href = '/patient/appointments/book',
      description: 'Schedule with practitioner'
    },
    { 
      title: 'Find Practitioner', 
      icon: User, 
      color: 'bg-green-500', 
      action: () => window.location.href = '/patient/practitioners',
      description: 'Search specialists'
    },
    { 
      title: 'View Therapy Plan', 
      icon: FileText, 
      color: 'bg-purple-500', 
      action: () => window.location.href = '/patient/therapy-plans',
      description: 'Check your plan'
    },
    { 
      title: 'Health Records', 
      icon: Activity, 
      color: 'bg-orange-500', 
      action: () => window.location.href = '/patient/health-records',
      description: 'View medical history'
    },
    { 
      title: 'Messages', 
      icon: MessageSquare, 
      color: 'bg-indigo-500', 
      action: () => window.location.href = '/patient/messages',
      description: 'Chat with practitioner'
    },
    { 
      title: 'Payments', 
      icon: DollarSign, 
      color: 'bg-yellow-500', 
      action: () => window.location.href = '/patient/payments',
      description: 'Billing & payments'
    }
  ];

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
          <h1 className="text-3xl font-bold text-gray-900">
            Welcome back, {dashboardData.patient?.firstName || 'Patient'}!
          </h1>
          <p className="text-gray-600">Here's your health journey overview</p>
        </div>
        <div className="flex items-center space-x-3">
          <select
            value={timeRange}
            onChange={(e) => setTimeRange(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
          >
            <option value="week">Last 7 Days</option>
            <option value="month">Last 30 Days</option>
            <option value="quarter">Last 3 Months</option>
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

      {/* Health Status Alert */}
      {dashboardData.healthAlert && (
        <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 rounded-md">
          <div className="flex items-center">
            <AlertCircle className="h-5 w-5 text-yellow-400 mr-3" />
            <div>
              <h3 className="text-sm font-medium text-yellow-800">Health Reminder</h3>
              <p className="text-sm text-yellow-700 mt-1">{dashboardData.healthAlert}</p>
            </div>
          </div>
        </div>
      )}

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="p-2 bg-blue-100 rounded-lg">
              <Calendar className="h-6 w-6 text-blue-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Next Appointment</p>
              <p className="text-lg font-bold text-gray-900">
                {dashboardData.nextAppointment ? 
                  new Date(dashboardData.nextAppointment.date).toLocaleDateString() : 
                  'Not scheduled'
                }
              </p>
              <p className="text-sm text-blue-600">
                {dashboardData.nextAppointment?.practitioner || 'Book now'}
              </p>
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="p-2 bg-green-100 rounded-lg">
              <CheckCircle className="h-6 w-6 text-green-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Treatment Progress</p>
              <p className="text-2xl font-bold text-gray-900">{dashboardData.treatmentProgress || 0}%</p>
              <p className="text-sm text-green-600">On track</p>
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="p-2 bg-purple-100 rounded-lg">
              <Heart className="h-6 w-6 text-purple-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Health Score</p>
              <p className="text-2xl font-bold text-gray-900">{dashboardData.healthScore || 85}</p>
              <p className="text-sm text-purple-600">Good</p>
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="p-2 bg-orange-100 rounded-lg">
              <Activity className="h-6 w-6 text-orange-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Sessions Completed</p>
              <p className="text-2xl font-bold text-gray-900">{dashboardData.completedSessions || 0}</p>
              <p className="text-sm text-orange-600">This month</p>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h3>
        <div className="grid grid-cols-2 md:grid-cols-6 gap-4">
          {quickActions.map((action, index) => (
            <button
              key={index}
              onClick={action.action}
              className="flex flex-col items-center p-4 border border-gray-200 rounded-lg hover:bg-gray-50 hover:border-gray-300 transition-colors"
            >
              <div className={`p-3 ${action.color} rounded-full mb-3`}>
                <action.icon className="h-6 w-6 text-white" />
              </div>
              <h4 className="font-medium text-gray-900 text-sm text-center">{action.title}</h4>
              <p className="text-xs text-gray-500 text-center mt-1">{action.description}</p>
            </button>
          ))}
        </div>
      </div>

      {/* Today's Schedule & Health Vitals */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Today's Schedule */}
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">Today's Schedule</h3>
            <button className="text-blue-600 hover:text-blue-800 text-sm font-medium">
              View All
            </button>
          </div>
          <div className="space-y-4">
            {dashboardData.todaySchedule?.length > 0 ? (
              dashboardData.todaySchedule.map((item, index) => (
                <div key={index} className="flex items-center p-3 bg-gray-50 rounded-lg">
                  <div className="flex-shrink-0">
                    <Clock className="h-5 w-5 text-gray-600" />
                  </div>
                  <div className="ml-3 flex-1">
                    <p className="text-sm font-medium text-gray-900">{item.title}</p>
                    <p className="text-sm text-gray-600">{item.time} - {item.practitioner}</p>
                  </div>
                  <div className="flex-shrink-0">
                    <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                      item.status === 'confirmed' ? 'bg-green-100 text-green-800' :
                      item.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                      'bg-gray-100 text-gray-800'
                    }`}>
                      {item.status}
                    </span>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-8">
                <Calendar className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-500">No appointments today</p>
                <button className="mt-2 text-blue-600 hover:text-blue-800 text-sm font-medium">
                  Schedule an appointment
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Health Vitals */}
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">Health Vitals</h3>
            <button className="text-blue-600 hover:text-blue-800 text-sm font-medium">
              Update Vitals
            </button>
          </div>
          <div className="space-y-4">
            <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <div className="flex items-center">
                <Thermometer className="h-5 w-5 text-red-500 mr-3" />
                <span className="text-sm font-medium text-gray-900">Body Temperature</span>
              </div>
              <span className="text-sm text-gray-600">{dashboardData.vitals?.temperature || '98.6°F'}</span>
            </div>
            
            <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <div className="flex items-center">
                <Heart className="h-5 w-5 text-red-500 mr-3" />
                <span className="text-sm font-medium text-gray-900">Blood Pressure</span>
              </div>
              <span className="text-sm text-gray-600">{dashboardData.vitals?.bloodPressure || '120/80'}</span>
            </div>
            
            <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <div className="flex items-center">
                <Weight className="h-5 w-5 text-blue-500 mr-3" />
                <span className="text-sm font-medium text-gray-900">Weight</span>
              </div>
              <span className="text-sm text-gray-600">{dashboardData.vitals?.weight || '70 kg'}</span>
            </div>
            
            <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <div className="flex items-center">
                <Zap className="h-5 w-5 text-yellow-500 mr-3" />
                <span className="text-sm font-medium text-gray-900">Energy Level</span>
              </div>
              <div className="flex items-center">
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
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">Treatment Progress</h3>
            <button className="text-blue-600 hover:text-blue-800 text-sm font-medium">
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
              
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div
                  className="bg-green-600 h-2 rounded-full"
                  style={{ width: `${dashboardData.currentTreatment.progress}%` }}
                ></div>
              </div>
              
              <div className="grid grid-cols-2 gap-4 mt-4">
                <div className="text-center p-3 bg-blue-50 rounded-lg">
                  <Target className="h-6 w-6 text-blue-600 mx-auto mb-1" />
                  <p className="text-xs text-gray-600">Sessions Left</p>
                  <p className="text-lg font-bold text-blue-600">
                    {dashboardData.currentTreatment.sessionsLeft || 0}
                  </p>
                </div>
                
                <div className="text-center p-3 bg-green-50 rounded-lg">
                  <Award className="h-6 w-6 text-green-600 mx-auto mb-1" />
                  <p className="text-xs text-gray-600">Milestones</p>
                  <p className="text-lg font-bold text-green-600">
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
            <div className="text-center py-8">
              <BookOpen className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500">No active treatment plan</p>
              <button className="mt-2 text-blue-600 hover:text-blue-800 text-sm font-medium">
                Explore treatment options
              </button>
            </div>
          )}
        </div>

        {/* Recent Notifications */}
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">Recent Notifications</h3>
            <button className="text-blue-600 hover:text-blue-800 text-sm font-medium">
              View All
            </button>
          </div>
          
          <div className="space-y-3">
            {dashboardData.notifications?.length > 0 ? (
              dashboardData.notifications.slice(0, 5).map((notification, index) => (
                <div key={index} className="flex items-start p-3 bg-gray-50 rounded-lg">
                  <div className="flex-shrink-0">
                    {notification.type === 'appointment' && <Calendar className="h-5 w-5 text-blue-500" />}
                    {notification.type === 'message' && <MessageSquare className="h-5 w-5 text-green-500" />}
                    {notification.type === 'reminder' && <Bell className="h-5 w-5 text-orange-500" />}
                    {notification.type === 'payment' && <DollarSign className="h-5 w-5 text-purple-500" />}
                  </div>
                  <div className="ml-3 flex-1">
                    <p className="text-sm font-medium text-gray-900">{notification.title}</p>
                    <p className="text-sm text-gray-600 mt-1">{notification.message}</p>
                    <p className="text-xs text-gray-500 mt-1">{notification.time}</p>
                  </div>
                  {!notification.read && (
                    <div className="flex-shrink-0">
                      <div className="w-2 h-2 bg-blue-600 rounded-full"></div>
                    </div>
                  )}
                </div>
              ))
            ) : (
              <div className="text-center py-8">
                <Bell className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-500">No new notifications</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Recent Activity & Health Tips */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Activity */}
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Activity</h3>
          <div className="space-y-4">
            {dashboardData.recentActivity?.length > 0 ? (
              dashboardData.recentActivity.map((activity, index) => (
                <div key={index} className="flex items-center p-3 border-l-4 border-blue-500 bg-blue-50 rounded-r-lg">
                  <div className="flex-1">
                    <p className="text-sm font-medium text-gray-900">{activity.action}</p>
                    <p className="text-sm text-gray-600">{activity.details}</p>
                    <p className="text-xs text-gray-500 mt-1">{activity.timestamp}</p>
                  </div>
                  <ArrowRight className="h-4 w-4 text-blue-500" />
                </div>
              ))
            ) : (
              <p className="text-gray-500 text-center py-4">No recent activity</p>
            )}
          </div>
        </div>

        {/* Health Tips */}
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Health Tips</h3>
          <div className="space-y-4">
            {dashboardData.healthTips?.length > 0 ? (
              dashboardData.healthTips.map((tip, index) => (
                <div key={index} className="p-4 bg-green-50 border border-green-200 rounded-lg">
                  <div className="flex items-start">
                    <Heart className="h-5 w-5 text-green-600 mt-0.5 mr-3" />
                    <div>
                      <h4 className="text-sm font-medium text-green-900">{tip.title}</h4>
                      <p className="text-sm text-green-700 mt-1">{tip.description}</p>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-8">
                <Heart className="h-12 w-12 text-gray-400 mx-auto mb-4" />
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

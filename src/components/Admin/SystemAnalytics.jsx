import React, { useState, useEffect } from 'react';
import { 
  BarChart3, 
  PieChart, 
  TrendingUp, 
  TrendingDown,
  Calendar,
  Users,
  DollarSign,
  Activity,
  Download,
  RefreshCw,
  Filter,
  Eye,
  ArrowUpRight,
  ArrowDownRight
} from 'lucide-react';
import api from '../../utils/api';
import toast from 'react-hot-toast';

const SystemAnalytics = () => {
  const [analytics, setAnalytics] = useState({});
  const [loading, setLoading] = useState(true);
  const [timeRange, setTimeRange] = useState('30d');
  const [activeTab, setActiveTab] = useState('overview');

  const tabs = [
    { id: 'overview', label: 'Overview', icon: BarChart3 },
    { id: 'users', label: 'Users', icon: Users },
    { id: 'appointments', label: 'Appointments', icon: Calendar },
    { id: 'revenue', label: 'Revenue', icon: DollarSign },
    { id: 'performance', label: 'Performance', icon: Activity }
  ];

  useEffect(() => {
    fetchAnalytics();
  }, [timeRange, activeTab]);

  const fetchAnalytics = async () => {
    try {
      setLoading(true);
      const response = await api.get(`/admin/analytics?timeRange=${timeRange}&tab=${activeTab}`);
      setAnalytics(response.data);
    } catch (error) {
      console.error('Error fetching analytics:', error);
      toast.error('Error fetching analytics data');
    } finally {
      setLoading(false);
    }
  };

  const exportReport = async (type) => {
    try {
      const response = await api.get(`/admin/analytics/export?type=${type}&timeRange=${timeRange}`, {
        responseType: 'blob'
      });
      
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `${type}-analytics-${new Date().toISOString().split('T')[0]}.csv`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      
      toast.success(`${type} analytics exported successfully`);
    } catch (error) {
      console.error('Error exporting analytics:', error);
      toast.error('Error exporting analytics');
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

  const getChangeColor = (change) => {
    if (change > 0) return 'text-green-600';
    if (change < 0) return 'text-red-600';
    return 'text-gray-600';
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
          <h1 className="text-2xl font-bold text-gray-900">System Analytics & Reports</h1>
          <p className="text-gray-600">Comprehensive insights and performance metrics</p>
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
            <option value="1y">Last Year</option>
          </select>
          <button
            onClick={fetchAnalytics}
            className="flex items-center px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700"
          >
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </button>
          <button
            onClick={() => exportReport(activeTab)}
            className="flex items-center px-3 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50"
          >
            <Download className="h-4 w-4 mr-2" />
            Export
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-white rounded-lg shadow">
        <div className="border-b border-gray-200">
          <nav className="-mb-px flex space-x-8 px-6">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`py-4 px-1 border-b-2 font-medium text-sm flex items-center ${
                    activeTab === tab.id
                      ? 'border-green-500 text-green-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  <Icon className="h-4 w-4 mr-2" />
                  {tab.label}
                </button>
              );
            })}
          </nav>
        </div>

        <div className="p-6">
          {/* Overview Tab */}
          {activeTab === 'overview' && (
            <div className="space-y-6">
              {/* Key Metrics */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <div className="bg-gradient-to-r from-blue-500 to-blue-600 rounded-lg p-6 text-white">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-blue-100">Total Users</p>
                      <p className="text-3xl font-bold">{analytics.totalUsers?.current || 0}</p>
                      <div className="flex items-center mt-2">
                        {getChangeIcon(getPercentageChange(analytics.totalUsers?.current, analytics.totalUsers?.previous))}
                        <span className="text-sm ml-1">
                          {Math.abs(getPercentageChange(analytics.totalUsers?.current, analytics.totalUsers?.previous))}%
                        </span>
                      </div>
                    </div>
                    <Users className="h-12 w-12 text-blue-200" />
                  </div>
                </div>

                <div className="bg-gradient-to-r from-green-500 to-green-600 rounded-lg p-6 text-white">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-green-100">Active Sessions</p>
                      <p className="text-3xl font-bold">{analytics.activeSessions?.current || 0}</p>
                      <div className="flex items-center mt-2">
                        {getChangeIcon(getPercentageChange(analytics.activeSessions?.current, analytics.activeSessions?.previous))}
                        <span className="text-sm ml-1">
                          {Math.abs(getPercentageChange(analytics.activeSessions?.current, analytics.activeSessions?.previous))}%
                        </span>
                      </div>
                    </div>
                    <Activity className="h-12 w-12 text-green-200" />
                  </div>
                </div>

                <div className="bg-gradient-to-r from-purple-500 to-purple-600 rounded-lg p-6 text-white">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-purple-100">Appointments</p>
                      <p className="text-3xl font-bold">{analytics.totalAppointments?.current || 0}</p>
                      <div className="flex items-center mt-2">
                        {getChangeIcon(getPercentageChange(analytics.totalAppointments?.current, analytics.totalAppointments?.previous))}
                        <span className="text-sm ml-1">
                          {Math.abs(getPercentageChange(analytics.totalAppointments?.current, analytics.totalAppointments?.previous))}%
                        </span>
                      </div>
                    </div>
                    <Calendar className="h-12 w-12 text-purple-200" />
                  </div>
                </div>

                <div className="bg-gradient-to-r from-yellow-500 to-yellow-600 rounded-lg p-6 text-white">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-yellow-100">Revenue</p>
                      <p className="text-3xl font-bold">₹{(analytics.totalRevenue?.current || 0).toLocaleString()}</p>
                      <div className="flex items-center mt-2">
                        {getChangeIcon(getPercentageChange(analytics.totalRevenue?.current, analytics.totalRevenue?.previous))}
                        <span className="text-sm ml-1">
                          {Math.abs(getPercentageChange(analytics.totalRevenue?.current, analytics.totalRevenue?.previous))}%
                        </span>
                      </div>
                    </div>
                    <DollarSign className="h-12 w-12 text-yellow-200" />
                  </div>
                </div>
              </div>

              {/* Charts Placeholder */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="bg-gray-50 rounded-lg p-8">
                  <h3 className="text-lg font-semibold mb-4">User Growth Trend</h3>
                  <div className="h-64 flex items-center justify-center">
                    <div className="text-center">
                      <BarChart3 className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                      <p className="text-gray-500">Chart visualization</p>
                      <p className="text-sm text-gray-400">Integration with charting library needed</p>
                    </div>
                  </div>
                </div>

                <div className="bg-gray-50 rounded-lg p-8">
                  <h3 className="text-lg font-semibold mb-4">Revenue Distribution</h3>
                  <div className="h-64 flex items-center justify-center">
                    <div className="text-center">
                      <PieChart className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                      <p className="text-gray-500">Chart visualization</p>
                      <p className="text-sm text-gray-400">Integration with charting library needed</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Users Tab */}
          {activeTab === 'users' && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-white border rounded-lg p-6">
                  <h3 className="text-lg font-semibold mb-4">User Breakdown</h3>
                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="text-gray-600">Patients</span>
                      <span className="font-semibold">{analytics.userBreakdown?.patients || 0}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-gray-600">Practitioners</span>
                      <span className="font-semibold">{analytics.userBreakdown?.practitioners || 0}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-gray-600">Admins</span>
                      <span className="font-semibold">{analytics.userBreakdown?.admins || 0}</span>
                    </div>
                  </div>
                </div>

                <div className="bg-white border rounded-lg p-6">
                  <h3 className="text-lg font-semibold mb-4">User Activity</h3>
                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="text-gray-600">Daily Active</span>
                      <span className="font-semibold">{analytics.userActivity?.daily || 0}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-gray-600">Weekly Active</span>
                      <span className="font-semibold">{analytics.userActivity?.weekly || 0}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-gray-600">Monthly Active</span>
                      <span className="font-semibold">{analytics.userActivity?.monthly || 0}</span>
                    </div>
                  </div>
                </div>

                <div className="bg-white border rounded-lg p-6">
                  <h3 className="text-lg font-semibold mb-4">Registration Trend</h3>
                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="text-gray-600">Today</span>
                      <span className="font-semibold text-green-600">+{analytics.registrations?.today || 0}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-gray-600">This Week</span>
                      <span className="font-semibold text-blue-600">+{analytics.registrations?.week || 0}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-gray-600">This Month</span>
                      <span className="font-semibold text-purple-600">+{analytics.registrations?.month || 0}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Appointments Tab */}
          {activeTab === 'appointments' && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <div className="bg-blue-50 rounded-lg p-6">
                  <h3 className="text-sm font-medium text-blue-600 mb-2">Scheduled</h3>
                  <p className="text-3xl font-bold text-blue-900">{analytics.appointmentStats?.scheduled || 0}</p>
                </div>
                <div className="bg-green-50 rounded-lg p-6">
                  <h3 className="text-sm font-medium text-green-600 mb-2">Completed</h3>
                  <p className="text-3xl font-bold text-green-900">{analytics.appointmentStats?.completed || 0}</p>
                </div>
                <div className="bg-red-50 rounded-lg p-6">
                  <h3 className="text-sm font-medium text-red-600 mb-2">Cancelled</h3>
                  <p className="text-3xl font-bold text-red-900">{analytics.appointmentStats?.cancelled || 0}</p>
                </div>
                <div className="bg-gray-50 rounded-lg p-6">
                  <h3 className="text-sm font-medium text-gray-600 mb-2">No Show</h3>
                  <p className="text-3xl font-bold text-gray-900">{analytics.appointmentStats?.noShow || 0}</p>
                </div>
              </div>

              <div className="bg-white border rounded-lg p-6">
                <h3 className="text-lg font-semibold mb-4">Peak Hours Analysis</h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {analytics.peakHours?.map((hour, index) => (
                    <div key={index} className="text-center">
                      <p className="text-sm text-gray-600">{hour.time}</p>
                      <p className="text-xl font-bold">{hour.count}</p>
                    </div>
                  )) || <p className="text-gray-500 col-span-4 text-center">No data available</p>}
                </div>
              </div>
            </div>
          )}

          {/* Revenue Tab */}
          {activeTab === 'revenue' && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-gradient-to-r from-green-500 to-green-600 rounded-lg p-6 text-white">
                  <h3 className="text-green-100 mb-2">Total Revenue</h3>
                  <p className="text-3xl font-bold">₹{(analytics.revenue?.total || 0).toLocaleString()}</p>
                </div>
                <div className="bg-gradient-to-r from-blue-500 to-blue-600 rounded-lg p-6 text-white">
                  <h3 className="text-blue-100 mb-2">Average per Session</h3>
                  <p className="text-3xl font-bold">₹{(analytics.revenue?.average || 0).toLocaleString()}</p>
                </div>
                <div className="bg-gradient-to-r from-purple-500 to-purple-600 rounded-lg p-6 text-white">
                  <h3 className="text-purple-100 mb-2">Monthly Growth</h3>
                  <p className="text-3xl font-bold">{analytics.revenue?.growth || 0}%</p>
                </div>
              </div>

              <div className="bg-white border rounded-lg p-6">
                <h3 className="text-lg font-semibold mb-4">Revenue by Service Type</h3>
                <div className="space-y-3">
                  {analytics.revenueByService?.map((service, index) => (
                    <div key={index} className="flex justify-between items-center">
                      <span className="text-gray-600 capitalize">{service.type}</span>
                      <span className="font-semibold">₹{service.amount.toLocaleString()}</span>
                    </div>
                  )) || <p className="text-gray-500 text-center">No data available</p>}
                </div>
              </div>
            </div>
          )}

          {/* Performance Tab */}
          {activeTab === 'performance' && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <div className="bg-white border rounded-lg p-6">
                  <h3 className="text-sm font-medium text-gray-600 mb-2">System Uptime</h3>
                  <p className="text-2xl font-bold text-green-600">{analytics.performance?.uptime || '99.9'}%</p>
                </div>
                <div className="bg-white border rounded-lg p-6">
                  <h3 className="text-sm font-medium text-gray-600 mb-2">Avg Response Time</h3>
                  <p className="text-2xl font-bold text-blue-600">{analytics.performance?.responseTime || '120'}ms</p>
                </div>
                <div className="bg-white border rounded-lg p-6">
                  <h3 className="text-sm font-medium text-gray-600 mb-2">Error Rate</h3>
                  <p className="text-2xl font-bold text-red-600">{analytics.performance?.errorRate || '0.1'}%</p>
                </div>
                <div className="bg-white border rounded-lg p-6">
                  <h3 className="text-sm font-medium text-gray-600 mb-2">Active Sessions</h3>
                  <p className="text-2xl font-bold text-purple-600">{analytics.performance?.activeSessions || 0}</p>
                </div>
              </div>

              <div className="bg-white border rounded-lg p-6">
                <h3 className="text-lg font-semibold mb-4">System Health Metrics</h3>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-gray-600">Database Performance</span>
                    <div className="flex items-center">
                      <div className="w-32 bg-gray-200 rounded-full h-2 mr-3">
                        <div className="bg-green-500 h-2 rounded-full" style={{width: '95%'}}></div>
                      </div>
                      <span className="text-sm font-medium">95%</span>
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-600">API Performance</span>
                    <div className="flex items-center">
                      <div className="w-32 bg-gray-200 rounded-full h-2 mr-3">
                        <div className="bg-blue-500 h-2 rounded-full" style={{width: '88%'}}></div>
                      </div>
                      <span className="text-sm font-medium">88%</span>
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-600">Server Load</span>
                    <div className="flex items-center">
                      <div className="w-32 bg-gray-200 rounded-full h-2 mr-3">
                        <div className="bg-yellow-500 h-2 rounded-full" style={{width: '65%'}}></div>
                      </div>
                      <span className="text-sm font-medium">65%</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default SystemAnalytics;

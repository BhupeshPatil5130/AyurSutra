import React, { useState, useEffect } from 'react';
import { 
  Users, 
  UserCheck, 
  Calendar, 
  Heart, 
  TrendingUp, 
  TrendingDown,
  DollarSign,
  Activity,
  AlertTriangle,
  CheckCircle,
  Clock,
  Star,
  BarChart3,
  PieChart,
  ArrowUpRight,
  ArrowDownRight,
  RefreshCw,
  Download,
  Filter,
  Eye
} from 'lucide-react';
import api from '../../utils/api';
import toast from 'react-hot-toast';

const EnhancedAdminDashboard = () => {
  const [stats, setStats] = useState({});
  const [recentActivities, setRecentActivities] = useState([]);
  const [systemHealth, setSystemHealth] = useState({});
  const [revenueData, setRevenueData] = useState({});
  const [loading, setLoading] = useState(true);
  const [timeRange, setTimeRange] = useState('7d');
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    fetchDashboardData();
  }, [timeRange]);

  const fetchDashboardData = async () => {
    try {
      setRefreshing(true);
      const [statsRes, activitiesRes, healthRes, revenueRes] = await Promise.all([
        api.get(`/admin/dashboard/stats?timeRange=${timeRange}`),
        api.get('/admin/dashboard/activities'),
        api.get('/admin/dashboard/system-health'),
        api.get(`/admin/dashboard/revenue?timeRange=${timeRange}`)
      ]);

      setStats(statsRes.data);
      setRecentActivities(activitiesRes.data);
      setSystemHealth(healthRes.data);
      setRevenueData(revenueRes.data);
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      toast.error('Error loading dashboard data');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const exportReport = async (type) => {
    try {
      const response = await api.get(`/admin/reports/export?type=${type}&timeRange=${timeRange}`, {
        responseType: 'blob'
      });
      
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `${type}-report-${new Date().toISOString().split('T')[0]}.csv`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      
      toast.success(`${type} report exported successfully`);
    } catch (error) {
      console.error('Error exporting report:', error);
      toast.error('Error exporting report');
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

  const getHealthStatus = (status) => {
    switch (status) {
      case 'excellent': return { color: 'text-green-600 bg-green-100', icon: CheckCircle };
      case 'good': return { color: 'text-blue-600 bg-blue-100', icon: CheckCircle };
      case 'warning': return { color: 'text-yellow-600 bg-yellow-100', icon: AlertTriangle };
      case 'critical': return { color: 'text-red-600 bg-red-100', icon: AlertTriangle };
      default: return { color: 'text-gray-600 bg-gray-100', icon: Clock };
    }
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
          <h1 className="text-3xl font-bold text-gray-900">Admin Dashboard</h1>
          <p className="text-gray-600">Comprehensive system overview and management</p>
        </div>
        <div className="flex items-center space-x-3">
          <select
            value={timeRange}
            onChange={(e) => setTimeRange(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
          >
            <option value="1d">Last 24 Hours</option>
            <option value="7d">Last 7 Days</option>
            <option value="30d">Last 30 Days</option>
            <option value="90d">Last 90 Days</option>
            <option value="1y">Last Year</option>
          </select>
          <button
            onClick={fetchDashboardData}
            disabled={refreshing}
            className="flex items-center px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:opacity-50"
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${refreshing ? 'animate-spin' : ''}`} />
            Refresh
          </button>
          <div className="flex space-x-2">
            <button
              onClick={() => exportReport('users')}
              className="flex items-center px-3 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50"
            >
              <Download className="h-4 w-4 mr-1" />
              Export
            </button>
          </div>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Total Users */}
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Users</p>
              <p className="text-3xl font-bold text-gray-900">{stats.totalUsers?.current || 0}</p>
              <div className="flex items-center mt-2">
                {getChangeIcon(getPercentageChange(stats.totalUsers?.current, stats.totalUsers?.previous))}
                <span className={`text-sm font-medium ml-1 ${getChangeColor(getPercentageChange(stats.totalUsers?.current, stats.totalUsers?.previous))}`}>
                  {Math.abs(getPercentageChange(stats.totalUsers?.current, stats.totalUsers?.previous))}%
                </span>
                <span className="text-sm text-gray-500 ml-1">vs previous period</span>
              </div>
            </div>
            <div className="p-3 bg-blue-100 rounded-full">
              <Users className="h-8 w-8 text-blue-600" />
            </div>
          </div>
        </div>

        {/* Active Practitioners */}
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Active Practitioners</p>
              <p className="text-3xl font-bold text-gray-900">{stats.activePractitioners?.current || 0}</p>
              <div className="flex items-center mt-2">
                {getChangeIcon(getPercentageChange(stats.activePractitioners?.current, stats.activePractitioners?.previous))}
                <span className={`text-sm font-medium ml-1 ${getChangeColor(getPercentageChange(stats.activePractitioners?.current, stats.activePractitioners?.previous))}`}>
                  {Math.abs(getPercentageChange(stats.activePractitioners?.current, stats.activePractitioners?.previous))}%
                </span>
                <span className="text-sm text-gray-500 ml-1">vs previous period</span>
              </div>
            </div>
            <div className="p-3 bg-green-100 rounded-full">
              <UserCheck className="h-8 w-8 text-green-600" />
            </div>
          </div>
        </div>

        {/* Total Appointments */}
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Appointments</p>
              <p className="text-3xl font-bold text-gray-900">{stats.totalAppointments?.current || 0}</p>
              <div className="flex items-center mt-2">
                {getChangeIcon(getPercentageChange(stats.totalAppointments?.current, stats.totalAppointments?.previous))}
                <span className={`text-sm font-medium ml-1 ${getChangeColor(getPercentageChange(stats.totalAppointments?.current, stats.totalAppointments?.previous))}`}>
                  {Math.abs(getPercentageChange(stats.totalAppointments?.current, stats.totalAppointments?.previous))}%
                </span>
                <span className="text-sm text-gray-500 ml-1">vs previous period</span>
              </div>
            </div>
            <div className="p-3 bg-purple-100 rounded-full">
              <Calendar className="h-8 w-8 text-purple-600" />
            </div>
          </div>
        </div>

        {/* Revenue */}
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Revenue</p>
              <p className="text-3xl font-bold text-gray-900">₹{(revenueData.totalRevenue?.current || 0).toLocaleString()}</p>
              <div className="flex items-center mt-2">
                {getChangeIcon(getPercentageChange(revenueData.totalRevenue?.current, revenueData.totalRevenue?.previous))}
                <span className={`text-sm font-medium ml-1 ${getChangeColor(getPercentageChange(revenueData.totalRevenue?.current, revenueData.totalRevenue?.previous))}`}>
                  {Math.abs(getPercentageChange(revenueData.totalRevenue?.current, revenueData.totalRevenue?.previous))}%
                </span>
                <span className="text-sm text-gray-500 ml-1">vs previous period</span>
              </div>
            </div>
            <div className="p-3 bg-yellow-100 rounded-full">
              <DollarSign className="h-8 w-8 text-yellow-600" />
            </div>
          </div>
        </div>
      </div>

      {/* System Health & Quick Actions */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* System Health */}
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">System Health</h3>
          <div className="space-y-4">
            {Object.entries(systemHealth).map(([key, value]) => {
              const health = getHealthStatus(value.status);
              const Icon = health.icon;
              return (
                <div key={key} className="flex items-center justify-between">
                  <div className="flex items-center">
                    <div className={`p-2 rounded-full ${health.color}`}>
                      <Icon className="h-4 w-4" />
                    </div>
                    <div className="ml-3">
                      <p className="text-sm font-medium text-gray-900 capitalize">{key.replace(/([A-Z])/g, ' $1')}</p>
                      <p className="text-xs text-gray-500">{value.description}</p>
                    </div>
                  </div>
                  <span className={`px-2 py-1 text-xs font-semibold rounded-full ${health.color}`}>
                    {value.status}
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Quick Actions */}
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h3>
          <div className="space-y-3">
            <button className="w-full flex items-center justify-between p-3 border border-gray-200 rounded-md hover:bg-gray-50">
              <div className="flex items-center">
                <UserCheck className="h-5 w-5 text-green-600 mr-3" />
                <span className="text-sm font-medium">Verify Practitioners</span>
              </div>
              <span className="bg-red-100 text-red-600 text-xs px-2 py-1 rounded-full">
                {stats.pendingVerifications || 0}
              </span>
            </button>
            
            <button className="w-full flex items-center justify-between p-3 border border-gray-200 rounded-md hover:bg-gray-50">
              <div className="flex items-center">
                <AlertTriangle className="h-5 w-5 text-yellow-600 mr-3" />
                <span className="text-sm font-medium">Review Reports</span>
              </div>
              <span className="bg-yellow-100 text-yellow-600 text-xs px-2 py-1 rounded-full">
                {stats.pendingReports || 0}
              </span>
            </button>
            
            <button className="w-full flex items-center justify-between p-3 border border-gray-200 rounded-md hover:bg-gray-50">
              <div className="flex items-center">
                <Activity className="h-5 w-5 text-blue-600 mr-3" />
                <span className="text-sm font-medium">System Maintenance</span>
              </div>
            </button>
            
            <button className="w-full flex items-center justify-between p-3 border border-gray-200 rounded-md hover:bg-gray-50">
              <div className="flex items-center">
                <BarChart3 className="h-5 w-5 text-purple-600 mr-3" />
                <span className="text-sm font-medium">Generate Reports</span>
              </div>
            </button>
          </div>
        </div>

        {/* Recent Alerts */}
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Alerts</h3>
          <div className="space-y-3">
            {stats.recentAlerts?.slice(0, 5).map((alert, index) => (
              <div key={index} className="flex items-start space-x-3 p-3 bg-gray-50 rounded-md">
                <AlertTriangle className="h-4 w-4 text-yellow-500 mt-0.5" />
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-900">{alert.title}</p>
                  <p className="text-xs text-gray-600">{alert.message}</p>
                  <p className="text-xs text-gray-500 mt-1">{new Date(alert.timestamp).toLocaleString()}</p>
                </div>
              </div>
            )) || (
              <p className="text-sm text-gray-500 text-center py-4">No recent alerts</p>
            )}
          </div>
        </div>
      </div>

      {/* Charts and Analytics */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* User Growth Chart */}
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">User Growth</h3>
            <button className="flex items-center text-sm text-gray-600 hover:text-gray-900">
              <Eye className="h-4 w-4 mr-1" />
              View Details
            </button>
          </div>
          <div className="h-64 flex items-center justify-center bg-gray-50 rounded-md">
            <div className="text-center">
              <BarChart3 className="h-12 w-12 text-gray-400 mx-auto mb-2" />
              <p className="text-sm text-gray-500">Chart visualization would go here</p>
              <p className="text-xs text-gray-400">Integration with charting library needed</p>
            </div>
          </div>
        </div>

        {/* Revenue Analytics */}
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">Revenue Analytics</h3>
            <button className="flex items-center text-sm text-gray-600 hover:text-gray-900">
              <Eye className="h-4 w-4 mr-1" />
              View Details
            </button>
          </div>
          <div className="h-64 flex items-center justify-center bg-gray-50 rounded-md">
            <div className="text-center">
              <PieChart className="h-12 w-12 text-gray-400 mx-auto mb-2" />
              <p className="text-sm text-gray-500">Revenue breakdown chart</p>
              <p className="text-xs text-gray-400">Integration with charting library needed</p>
            </div>
          </div>
        </div>
      </div>

      {/* Recent Activities */}
      <div className="bg-white rounded-lg shadow">
        <div className="px-6 py-4 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold text-gray-900">Recent Activities</h3>
            <button className="text-sm text-green-600 hover:text-green-800">View All</button>
          </div>
        </div>
        <div className="divide-y divide-gray-200">
          {recentActivities.slice(0, 10).map((activity, index) => (
            <div key={index} className="px-6 py-4 flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-gradient-to-r from-green-400 to-blue-500 rounded-full flex items-center justify-center text-white font-semibold text-sm">
                  {activity.user?.charAt(0) || 'S'}
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-900">{activity.action}</p>
                  <p className="text-xs text-gray-600">{activity.details}</p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-xs text-gray-500">{new Date(activity.timestamp).toLocaleString()}</p>
                <span className={`inline-flex items-center px-2 py-1 text-xs font-semibold rounded-full ${
                  activity.type === 'success' ? 'bg-green-100 text-green-700' :
                  activity.type === 'warning' ? 'bg-yellow-100 text-yellow-700' :
                  activity.type === 'error' ? 'bg-red-100 text-red-700' :
                  'bg-gray-100 text-gray-700'
                }`}>
                  {activity.type}
                </span>
              </div>
            </div>
          ))}
          {recentActivities.length === 0 && (
            <div className="px-6 py-8 text-center">
              <Activity className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500">No recent activities</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default EnhancedAdminDashboard;

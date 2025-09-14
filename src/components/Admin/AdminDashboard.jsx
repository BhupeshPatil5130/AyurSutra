import React, { useState, useEffect } from 'react';
import { 
  Users, 
  UserCheck, 
  Calendar, 
  CheckCircle, 
  Clock, 
  AlertTriangle,
  TrendingUp,
  Activity,
  Heart,
  Stethoscope,
  BarChart3,
  ArrowUpRight,
  ArrowDownRight,
  Eye,
  Settings,
  Plus
} from 'lucide-react';
import api from '../../utils/api';
import { mockAdminStats, simulateApiDelay } from '../../services/mockAdminData';

const AdminDashboard = () => {
  const [stats, setStats] = useState({
    totalPractitioners: 0,
    pendingVerifications: 0,
    approvedPractitioners: 0,
    totalPatients: 0,
    totalAppointments: 0,
    completedAppointments: 0
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardStats();
  }, []);

  const fetchDashboardStats = async () => {
    try {
      // Simulate API delay
      await simulateApiDelay(800);
      
      // Try to fetch from API first, fallback to mock data
      try {
        const response = await api.get('/admin/dashboard');
        setStats(response.data);
      } catch (apiError) {
        console.log('API not available, using mock data:', apiError.message);
        // Use mock data as fallback
        setStats(mockAdminStats);
      }
    } catch (error) {
      console.error('Error fetching dashboard stats:', error);
      // Use mock data as final fallback
      setStats(mockAdminStats);
    } finally {
      setLoading(false);
    }
  };

  const statCards = [
    {
      title: 'Total Practitioners',
      value: stats.totalPractitioners,
      icon: Stethoscope,
      color: 'from-blue-500 to-blue-600',
      bgColor: 'bg-blue-50',
      textColor: 'text-blue-600',
      change: '+12%',
      changeType: 'positive',
      description: 'Active practitioners'
    },
    {
      title: 'Pending Verifications',
      value: stats.pendingVerifications,
      icon: Clock,
      color: 'from-amber-500 to-orange-500',
      bgColor: 'bg-amber-50',
      textColor: 'text-amber-600',
      change: '+3',
      changeType: 'neutral',
      description: 'Awaiting review'
    },
    {
      title: 'Approved Practitioners',
      value: stats.approvedPractitioners,
      icon: CheckCircle,
      color: 'from-green-500 to-emerald-600',
      bgColor: 'bg-green-50',
      textColor: 'text-green-600',
      change: '+8%',
      changeType: 'positive',
      description: 'Verified professionals'
    },
    {
      title: 'Total Patients',
      value: stats.totalPatients,
      icon: Heart,
      color: 'from-purple-500 to-pink-500',
      bgColor: 'bg-purple-50',
      textColor: 'text-purple-600',
      change: '+24%',
      changeType: 'positive',
      description: 'Registered patients'
    },
    {
      title: 'Total Appointments',
      value: stats.totalAppointments,
      icon: Calendar,
      color: 'from-indigo-500 to-blue-600',
      bgColor: 'bg-indigo-50',
      textColor: 'text-indigo-600',
      change: '+18%',
      changeType: 'positive',
      description: 'Scheduled sessions'
    },
    {
      title: 'Completed Sessions',
      value: stats.completedAppointments,
      icon: Activity,
      color: 'from-emerald-500 to-teal-600',
      bgColor: 'bg-emerald-50',
      textColor: 'text-emerald-600',
      change: '+15%',
      changeType: 'positive',
      description: 'Finished treatments'
    }
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-4 border-indigo-200 border-t-indigo-600 mx-auto mb-4"></div>
          <p className="text-gray-600 font-medium">Loading dashboard data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Welcome Section */}
      <div className="bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 rounded-3xl p-8 text-white">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold mb-2">Welcome to AyurSutra Admin</h1>
            <p className="text-indigo-100 text-lg">Monitor and manage your holistic health platform</p>
          </div>
          <div className="hidden md:block">
            <div className="w-24 h-24 bg-white/20 rounded-2xl flex items-center justify-center backdrop-blur-sm">
              <BarChart3 className="h-12 w-12 text-white" />
            </div>
          </div>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {statCards.map((stat, index) => (
          <div key={index} className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg border border-gray-200/50 p-6 hover:shadow-xl transition-all duration-300 hover:scale-105">
            <div className="flex items-center justify-between mb-4">
              <div className={`p-3 rounded-2xl bg-gradient-to-r ${stat.color} shadow-lg`}>
                <stat.icon className="h-6 w-6 text-white" />
              </div>
              <div className="flex items-center space-x-1">
                {stat.changeType === 'positive' ? (
                  <ArrowUpRight className="h-4 w-4 text-green-500" />
                ) : stat.changeType === 'negative' ? (
                  <ArrowDownRight className="h-4 w-4 text-red-500" />
                ) : null}
                <span className={`text-sm font-semibold ${
                  stat.changeType === 'positive' ? 'text-green-600' : 
                  stat.changeType === 'negative' ? 'text-red-600' : 'text-gray-600'
                }`}>
                  {stat.change}
                </span>
              </div>
            </div>
            <div>
              <p className="text-3xl font-bold text-gray-900 mb-1">{stat.value}</p>
              <p className="text-sm font-semibold text-gray-600 mb-1">{stat.title}</p>
              <p className="text-xs text-gray-500">{stat.description}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Quick Actions & System Overview */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Quick Actions */}
        <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg border border-gray-200/50 p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold text-gray-900">Quick Actions</h2>
            <Settings className="h-5 w-5 text-gray-400" />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <button className="p-4 bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-200 rounded-xl hover:shadow-md transition-all duration-200 text-left group">
              <div className="flex items-center mb-3">
                <div className="p-2 bg-amber-100 rounded-lg group-hover:bg-amber-200 transition-colors">
                  <AlertTriangle className="h-5 w-5 text-amber-600" />
                </div>
                <div className="ml-3">
                  <h3 className="font-semibold text-gray-900">Pending Verifications</h3>
                  <p className="text-sm text-amber-600 font-medium">{stats.pendingVerifications} waiting</p>
                </div>
              </div>
            </button>
            
            <button className="p-4 bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-xl hover:shadow-md transition-all duration-200 text-left group">
              <div className="flex items-center mb-3">
                <div className="p-2 bg-blue-100 rounded-lg group-hover:bg-blue-200 transition-colors">
                  <Stethoscope className="h-5 w-5 text-blue-600" />
                </div>
                <div className="ml-3">
                  <h3 className="font-semibold text-gray-900">Manage Practitioners</h3>
                  <p className="text-sm text-blue-600 font-medium">View all professionals</p>
                </div>
              </div>
            </button>
            
            <button className="p-4 bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 rounded-xl hover:shadow-md transition-all duration-200 text-left group">
              <div className="flex items-center mb-3">
                <div className="p-2 bg-green-100 rounded-lg group-hover:bg-green-200 transition-colors">
                  <Calendar className="h-5 w-5 text-green-600" />
                </div>
                <div className="ml-3">
                  <h3 className="font-semibold text-gray-900">View Appointments</h3>
                  <p className="text-sm text-green-600 font-medium">Monitor sessions</p>
                </div>
              </div>
            </button>
            
            <button className="p-4 bg-gradient-to-r from-purple-50 to-pink-50 border border-purple-200 rounded-xl hover:shadow-md transition-all duration-200 text-left group">
              <div className="flex items-center mb-3">
                <div className="p-2 bg-purple-100 rounded-lg group-hover:bg-purple-200 transition-colors">
                  <Heart className="h-5 w-5 text-purple-600" />
                </div>
                <div className="ml-3">
                  <h3 className="font-semibold text-gray-900">Patient Management</h3>
                  <p className="text-sm text-purple-600 font-medium">View patient records</p>
                </div>
              </div>
            </button>
          </div>
        </div>

        {/* System Overview */}
        <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg border border-gray-200/50 p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold text-gray-900">System Overview</h2>
            <Activity className="h-5 w-5 text-gray-400" />
          </div>
          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 bg-gradient-to-r from-amber-50 to-orange-50 rounded-xl border border-amber-200">
              <div className="flex items-center">
                <div className="p-2 bg-amber-100 rounded-lg">
                  <AlertTriangle className="h-5 w-5 text-amber-600" />
                </div>
                <div className="ml-3">
                  <span className="text-sm font-semibold text-gray-900">
                    {stats.pendingVerifications} practitioner(s) awaiting verification
                  </span>
                </div>
              </div>
              <button className="px-3 py-1 bg-amber-100 text-amber-700 rounded-lg text-sm font-medium hover:bg-amber-200 transition-colors">
                Review Now
              </button>
            </div>
            
            <div className="flex items-center justify-between p-4 bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl border border-green-200">
              <div className="flex items-center">
                <div className="p-2 bg-green-100 rounded-lg">
                  <CheckCircle className="h-5 w-5 text-green-600" />
                </div>
                <div className="ml-3">
                  <span className="text-sm font-semibold text-gray-900">
                    {stats.approvedPractitioners} verified practitioners active
                  </span>
                </div>
              </div>
              <div className="w-2 h-2 bg-green-500 rounded-full"></div>
            </div>
            
            <div className="flex items-center justify-between p-4 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl border border-blue-200">
              <div className="flex items-center">
                <div className="p-2 bg-blue-100 rounded-lg">
                  <Users className="h-5 w-5 text-blue-600" />
                </div>
                <div className="ml-3">
                  <span className="text-sm font-semibold text-gray-900">
                    {stats.totalPatients} patients registered
                  </span>
                </div>
              </div>
              <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
            </div>
          </div>
        </div>
      </div>

      {/* Recent Activity Chart Placeholder */}
      <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg border border-gray-200/50 p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold text-gray-900">System Performance</h2>
          <TrendingUp className="h-5 w-5 text-gray-400" />
        </div>
        <div className="h-64 bg-gradient-to-br from-gray-50 to-gray-100 rounded-xl flex items-center justify-center">
          <div className="text-center">
            <BarChart3 className="h-16 w-16 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-500 font-medium">Performance metrics will be displayed here</p>
            <p className="text-sm text-gray-400">Charts and analytics coming soon</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;

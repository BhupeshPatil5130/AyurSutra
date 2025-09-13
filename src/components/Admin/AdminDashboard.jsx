import React, { useState, useEffect } from 'react';
import { Users, UserCheck, Calendar, CheckCircle, Clock, AlertTriangle } from 'lucide-react';
import api from '../../utils/api';

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
      const response = await api.get('/admin/dashboard');
      setStats(response.data);
    } catch (error) {
      console.error('Error fetching dashboard stats:', error);
    } finally {
      setLoading(false);
    }
  };

  const statCards = [
    {
      title: 'Total Practitioners',
      value: stats.totalPractitioners,
      icon: UserCheck,
      color: 'bg-blue-500',
      textColor: 'text-blue-600'
    },
    {
      title: 'Pending Verifications',
      value: stats.pendingVerifications,
      icon: Clock,
      color: 'bg-yellow-500',
      textColor: 'text-yellow-600'
    },
    {
      title: 'Approved Practitioners',
      value: stats.approvedPractitioners,
      icon: CheckCircle,
      color: 'bg-green-500',
      textColor: 'text-green-600'
    },
    {
      title: 'Total Patients',
      value: stats.totalPatients,
      icon: Users,
      color: 'bg-purple-500',
      textColor: 'text-purple-600'
    },
    {
      title: 'Total Appointments',
      value: stats.totalAppointments,
      icon: Calendar,
      color: 'bg-indigo-500',
      textColor: 'text-indigo-600'
    },
    {
      title: 'Completed Sessions',
      value: stats.completedAppointments,
      icon: CheckCircle,
      color: 'bg-emerald-500',
      textColor: 'text-emerald-600'
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
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Admin Dashboard</h1>
        <p className="text-gray-600">Overview of your Panchakarma platform</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {statCards.map((stat, index) => (
          <div key={index} className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className={`p-3 rounded-full ${stat.color} bg-opacity-10`}>
                <stat.icon className={`h-6 w-6 ${stat.textColor}`} />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">{stat.title}</p>
                <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Quick Actions */}
      <div className="bg-white rounded-lg shadow">
        <div className="p-6">
          <h2 className="text-lg font-medium text-gray-900 mb-4">Quick Actions</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <button className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 text-left">
              <AlertTriangle className="h-6 w-6 text-yellow-500 mb-2" />
              <h3 className="font-medium text-gray-900">Pending Verifications</h3>
              <p className="text-sm text-gray-600">{stats.pendingVerifications} practitioners waiting</p>
            </button>
            
            <button className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 text-left">
              <Users className="h-6 w-6 text-blue-500 mb-2" />
              <h3 className="font-medium text-gray-900">Manage Practitioners</h3>
              <p className="text-sm text-gray-600">View all practitioners</p>
            </button>
            
            <button className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 text-left">
              <Calendar className="h-6 w-6 text-green-500 mb-2" />
              <h3 className="font-medium text-gray-900">View Appointments</h3>
              <p className="text-sm text-gray-600">Monitor all appointments</p>
            </button>
            
            <button className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 text-left">
              <UserCheck className="h-6 w-6 text-purple-500 mb-2" />
              <h3 className="font-medium text-gray-900">Patient Management</h3>
              <p className="text-sm text-gray-600">View patient records</p>
            </button>
          </div>
        </div>
      </div>

      {/* Recent Activity */}
      <div className="bg-white rounded-lg shadow">
        <div className="p-6">
          <h2 className="text-lg font-medium text-gray-900 mb-4">System Overview</h2>
          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 bg-yellow-50 rounded-lg">
              <div className="flex items-center">
                <AlertTriangle className="h-5 w-5 text-yellow-500 mr-3" />
                <span className="text-sm font-medium text-gray-900">
                  {stats.pendingVerifications} practitioner(s) awaiting verification
                </span>
              </div>
              <button className="text-sm text-yellow-600 hover:text-yellow-800 font-medium">
                Review Now
              </button>
            </div>
            
            <div className="flex items-center justify-between p-4 bg-green-50 rounded-lg">
              <div className="flex items-center">
                <CheckCircle className="h-5 w-5 text-green-500 mr-3" />
                <span className="text-sm font-medium text-gray-900">
                  {stats.approvedPractitioners} verified practitioners active
                </span>
              </div>
            </div>
            
            <div className="flex items-center justify-between p-4 bg-blue-50 rounded-lg">
              <div className="flex items-center">
                <Users className="h-5 w-5 text-blue-500 mr-3" />
                <span className="text-sm font-medium text-gray-900">
                  {stats.totalPatients} patients registered
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;

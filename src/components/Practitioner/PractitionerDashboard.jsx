import React, { useState, useEffect } from 'react';
import { Calendar, Users, Heart, Star, Clock, CheckCircle, AlertCircle } from 'lucide-react';
import api from '../../utils/api';

const PractitionerDashboard = () => {
  const [stats, setStats] = useState({
    verificationStatus: 'pending',
    totalPatients: 0,
    todayAppointments: 0,
    activeTherapyPlans: 0,
    totalReviews: 0,
    rating: 0
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardStats();
  }, []);

  const fetchDashboardStats = async () => {
    try {
      const response = await api.get('/practitioner/dashboard');
      setStats(response.data);
    } catch (error) {
      console.error('Error fetching dashboard stats:', error);
    } finally {
      setLoading(false);
    }
  };

  const getVerificationStatus = () => {
    switch (stats.verificationStatus) {
      case 'approved':
        return {
          icon: CheckCircle,
          color: 'text-green-600',
          bgColor: 'bg-green-50',
          message: 'Your profile is verified and active'
        };
      case 'rejected':
        return {
          icon: AlertCircle,
          color: 'text-red-600',
          bgColor: 'bg-red-50',
          message: 'Profile verification rejected. Please update your information.'
        };
      default:
        return {
          icon: Clock,
          color: 'text-yellow-600',
          bgColor: 'bg-yellow-50',
          message: 'Profile verification pending. You cannot schedule appointments yet.'
        };
    }
  };

  const verificationInfo = getVerificationStatus();

  const statCards = [
    {
      title: 'My Patients',
      value: stats.totalPatients,
      icon: Users,
      color: 'bg-blue-500',
      textColor: 'text-blue-600'
    },
    {
      title: "Today's Appointments",
      value: stats.todayAppointments,
      icon: Calendar,
      color: 'bg-green-500',
      textColor: 'text-green-600'
    },
    {
      title: 'Active Therapy Plans',
      value: stats.activeTherapyPlans,
      icon: Heart,
      color: 'bg-purple-500',
      textColor: 'text-purple-600'
    },
    {
      title: 'Total Reviews',
      value: stats.totalReviews,
      icon: Star,
      color: 'bg-yellow-500',
      textColor: 'text-yellow-600'
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
        <h1 className="text-2xl font-bold text-gray-900">Practitioner Dashboard</h1>
        <p className="text-gray-600">Manage your practice and patient care</p>
      </div>

      {/* Verification Status */}
      <div className={`p-4 rounded-lg border ${verificationInfo.bgColor}`}>
        <div className="flex items-center">
          <verificationInfo.icon className={`h-6 w-6 ${verificationInfo.color} mr-3`} />
          <div>
            <h3 className="font-medium text-gray-900">Verification Status</h3>
            <p className={`text-sm ${verificationInfo.color}`}>{verificationInfo.message}</p>
          </div>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
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

      {/* Rating Card */}
      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-medium text-gray-900">Your Rating</h3>
            <div className="flex items-center mt-2">
              <div className="flex items-center">
                {[1, 2, 3, 4, 5].map((star) => (
                  <Star
                    key={star}
                    className={`h-5 w-5 ${
                      star <= Math.floor(stats.rating)
                        ? 'text-yellow-400 fill-current'
                        : 'text-gray-300'
                    }`}
                  />
                ))}
              </div>
              <span className="ml-2 text-lg font-semibold text-gray-900">
                {stats.rating.toFixed(1)}
              </span>
              <span className="ml-1 text-sm text-gray-600">
                ({stats.totalReviews} reviews)
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="bg-white rounded-lg shadow">
        <div className="p-6">
          <h2 className="text-lg font-medium text-gray-900 mb-4">Quick Actions</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <button 
              className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 text-left"
              disabled={stats.verificationStatus !== 'approved'}
            >
              <Calendar className="h-6 w-6 text-blue-500 mb-2" />
              <h3 className="font-medium text-gray-900">Schedule Appointment</h3>
              <p className="text-sm text-gray-600">Book new patient session</p>
            </button>
            
            <button className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 text-left">
              <Users className="h-6 w-6 text-green-500 mb-2" />
              <h3 className="font-medium text-gray-900">View Patients</h3>
              <p className="text-sm text-gray-600">Manage patient records</p>
            </button>
            
            <button 
              className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 text-left"
              disabled={stats.verificationStatus !== 'approved'}
            >
              <Heart className="h-6 w-6 text-purple-500 mb-2" />
              <h3 className="font-medium text-gray-900">Create Therapy Plan</h3>
              <p className="text-sm text-gray-600">Design treatment program</p>
            </button>
          </div>
        </div>
      </div>

      {/* Today's Schedule */}
      <div className="bg-white rounded-lg shadow">
        <div className="p-6">
          <h2 className="text-lg font-medium text-gray-900 mb-4">Today's Schedule</h2>
          {stats.todayAppointments > 0 ? (
            <div className="space-y-3">
              <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
                <div className="flex items-center">
                  <Clock className="h-5 w-5 text-blue-500 mr-3" />
                  <span className="text-sm font-medium text-gray-900">
                    {stats.todayAppointments} appointment(s) scheduled for today
                  </span>
                </div>
                <button className="text-sm text-blue-600 hover:text-blue-800 font-medium">
                  View Details
                </button>
              </div>
            </div>
          ) : (
            <div className="text-center py-8">
              <Calendar className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500">No appointments scheduled for today</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default PractitionerDashboard;

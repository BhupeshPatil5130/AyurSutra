import React, { useState, useEffect } from 'react';
import { 
  Users, 
  Calendar, 
  Heart, 
  DollarSign,
  TrendingUp,
  TrendingDown,
  Activity,
  Star,
  Clock,
  CheckCircle,
  AlertTriangle,
  FileText
} from 'lucide-react';
import api from '../../utils/api';

const PractitionerDashboardStats = () => {
  const [stats, setStats] = useState({
    totalPatients: { current: 0, previous: 0 },
    todayAppointments: { current: 0, previous: 0 },
    thisWeekAppointments: { current: 0, previous: 0 },
    activeTherapyPlans: { current: 0, previous: 0 },
    completedSessions: { current: 0, previous: 0 },
    totalRevenue: { current: 0, previous: 0 },
    averageRating: 4.5,
    totalReviews: 0,
    verificationStatus: 'pending'
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      const response = await api.get('/practitioner/dashboard/stats');
      setStats(response.data);
    } catch (error) {
      console.error('Error fetching stats:', error);
    } finally {
      setLoading(false);
    }
  };

  const getPercentageChange = (current, previous) => {
    if (!previous || previous === 0) return 0;
    return ((current - previous) / previous * 100).toFixed(1);
  };

  const getChangeIcon = (change) => {
    if (change > 0) return <TrendingUp className="h-4 w-4 text-green-500" />;
    if (change < 0) return <TrendingDown className="h-4 w-4 text-red-500" />;
    return null;
  };

  const getChangeColor = (change) => {
    if (change > 0) return 'text-green-600';
    if (change < 0) return 'text-red-600';
    return 'text-gray-600';
  };

  const getVerificationStatus = () => {
    switch (stats.verificationStatus) {
      case 'verified':
        return {
          icon: CheckCircle,
          color: 'text-green-600 bg-green-100',
          message: 'Profile Verified'
        };
      case 'rejected':
        return {
          icon: AlertTriangle,
          color: 'text-red-600 bg-red-100',
          message: 'Verification Rejected'
        };
      default:
        return {
          icon: Clock,
          color: 'text-yellow-600 bg-yellow-100',
          message: 'Verification Pending'
        };
    }
  };

  const statCards = [
    {
      title: 'Total Patients',
      value: stats.totalPatients.current,
      previous: stats.totalPatients.previous,
      icon: Users,
      color: 'bg-blue-500',
      bgColor: 'bg-blue-100',
      textColor: 'text-blue-600'
    },
    {
      title: 'Today\'s Appointments',
      value: stats.todayAppointments.current,
      previous: stats.todayAppointments.previous,
      icon: Calendar,
      color: 'bg-green-500',
      bgColor: 'bg-green-100',
      textColor: 'text-green-600'
    },
    {
      title: 'This Week',
      value: stats.thisWeekAppointments.current,
      previous: stats.thisWeekAppointments.previous,
      icon: Activity,
      color: 'bg-purple-500',
      bgColor: 'bg-purple-100',
      textColor: 'text-purple-600'
    },
    {
      title: 'Active Therapy Plans',
      value: stats.activeTherapyPlans.current,
      previous: stats.activeTherapyPlans.previous,
      icon: Heart,
      color: 'bg-pink-500',
      bgColor: 'bg-pink-100',
      textColor: 'text-pink-600'
    },
    {
      title: 'Completed Sessions',
      value: stats.completedSessions.current,
      previous: stats.completedSessions.previous,
      icon: CheckCircle,
      color: 'bg-emerald-500',
      bgColor: 'bg-emerald-100',
      textColor: 'text-emerald-600'
    },
    {
      title: 'Total Revenue',
      value: `₹${(stats.totalRevenue.current || 0).toLocaleString()}`,
      previous: stats.totalRevenue.previous,
      icon: DollarSign,
      color: 'bg-yellow-500',
      bgColor: 'bg-yellow-100',
      textColor: 'text-yellow-600',
      isRevenue: true
    }
  ];

  const verificationInfo = getVerificationStatus();
  const VerificationIcon = verificationInfo.icon;

  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {[...Array(6)].map((_, i) => (
          <div key={i} className="bg-white rounded-lg shadow p-6 animate-pulse">
            <div className="flex items-center">
              <div className="w-12 h-12 bg-gray-200 rounded-full"></div>
              <div className="ml-4 flex-1">
                <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                <div className="h-6 bg-gray-200 rounded w-1/2"></div>
              </div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Verification Status */}
      <div className={`p-4 rounded-lg border ${verificationInfo.color}`}>
        <div className="flex items-center">
          <VerificationIcon className="h-6 w-6 mr-3" />
          <div>
            <h3 className="font-medium text-gray-900">Account Status</h3>
            <p className="text-sm">{verificationInfo.message}</p>
            {stats.verificationStatus === 'pending' && (
              <p className="text-xs mt-1">Complete your profile to get verified faster</p>
            )}
          </div>
        </div>
      </div>

      {/* Main Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {statCards.map((stat, index) => {
          const Icon = stat.icon;
          const change = getPercentageChange(
            stat.isRevenue ? stats.totalRevenue.current : stat.value,
            stat.previous
          );
          
          return (
            <div key={index} className="bg-white rounded-lg shadow hover:shadow-md transition-shadow p-6">
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-600 mb-1">{stat.title}</p>
                  <p className="text-3xl font-bold text-gray-900 mb-2">
                    {stat.isRevenue ? stat.value : stat.value.toLocaleString()}
                  </p>
                  <div className="flex items-center">
                    {getChangeIcon(change)}
                    <span className={`text-sm font-medium ml-1 ${getChangeColor(change)}`}>
                      {Math.abs(change)}%
                    </span>
                    <span className="text-sm text-gray-500 ml-1">vs last period</span>
                  </div>
                </div>
                <div className={`p-3 rounded-full ${stat.bgColor}`}>
                  <Icon className={`h-8 w-8 ${stat.textColor}`} />
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Additional Stats Row */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="p-3 bg-yellow-100 rounded-full">
              <Star className="h-6 w-6 text-yellow-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Average Rating</p>
              <div className="flex items-center">
                <p className="text-2xl font-bold text-gray-900">{stats.averageRating}</p>
                <div className="flex ml-2">
                  {[...Array(5)].map((_, i) => (
                    <Star
                      key={i}
                      className={`h-4 w-4 ${
                        i < Math.floor(stats.averageRating)
                          ? 'text-yellow-400 fill-current'
                          : 'text-gray-300'
                      }`}
                    />
                  ))}
                </div>
              </div>
              <p className="text-xs text-gray-500">{stats.totalReviews} reviews</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="p-3 bg-indigo-100 rounded-full">
              <FileText className="h-6 w-6 text-indigo-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Medical Records</p>
              <p className="text-2xl font-bold text-gray-900">{stats.totalMedicalRecords || 0}</p>
              <p className="text-xs text-gray-500">Patient records managed</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="p-3 bg-green-100 rounded-full">
              <Activity className="h-6 w-6 text-green-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Success Rate</p>
              <p className="text-2xl font-bold text-gray-900">{stats.successRate || 95}%</p>
              <p className="text-xs text-gray-500">Treatment success rate</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PractitionerDashboardStats;

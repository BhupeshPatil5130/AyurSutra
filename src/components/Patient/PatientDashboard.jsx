import React, { useState, useEffect } from 'react';
import { Calendar, Heart, User, Clock, CheckCircle, ArrowRight } from 'lucide-react';
import { format } from 'date-fns';
import api from '../../utils/api';

const PatientDashboard = () => {
  const [stats, setStats] = useState({
    totalAppointments: 0,
    completedSessions: 0,
    upcomingAppointments: 0,
    activeTherapyPlans: 0,
    nextAppointment: null
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardStats();
  }, []);

  const fetchDashboardStats = async () => {
    try {
      const response = await api.get('/patient/dashboard');
      setStats(response.data);
    } catch (error) {
      console.error('Error fetching dashboard stats:', error);
    } finally {
      setLoading(false);
    }
  };

  const statCards = [
    {
      title: 'Total Appointments',
      value: stats.totalAppointments,
      icon: Calendar,
      color: 'bg-blue-500',
      textColor: 'text-blue-600'
    },
    {
      title: 'Completed Sessions',
      value: stats.completedSessions,
      icon: CheckCircle,
      color: 'bg-green-500',
      textColor: 'text-green-600'
    },
    {
      title: 'Upcoming Appointments',
      value: stats.upcomingAppointments,
      icon: Clock,
      color: 'bg-yellow-500',
      textColor: 'text-yellow-600'
    },
    {
      title: 'Active Therapy Plans',
      value: stats.activeTherapyPlans,
      icon: Heart,
      color: 'bg-purple-500',
      textColor: 'text-purple-600'
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
        <h1 className="text-2xl font-bold text-gray-900">Patient Dashboard</h1>
        <p className="text-gray-600">Track your wellness journey and appointments</p>
      </div>

      {/* Next Appointment Card */}
      {stats.nextAppointment && (
        <div className="bg-gradient-to-r from-green-50 to-blue-50 rounded-lg p-6 border border-green-200">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">Next Appointment</h3>
              <div className="space-y-1">
                <p className="text-sm text-gray-600">
                  <strong>Date:</strong> {format(new Date(stats.nextAppointment.appointmentDate), 'PPP')}
                </p>
                <p className="text-sm text-gray-600">
                  <strong>Time:</strong> {stats.nextAppointment.startTime} - {stats.nextAppointment.endTime}
                </p>
                <p className="text-sm text-gray-600">
                  <strong>Practitioner:</strong> Dr. {stats.nextAppointment.practitionerId?.userId?.firstName} {stats.nextAppointment.practitionerId?.userId?.lastName}
                </p>
                <p className="text-sm text-gray-600">
                  <strong>Type:</strong> {stats.nextAppointment.type}
                </p>
              </div>
            </div>
            <div className="text-right">
              <Calendar className="h-12 w-12 text-green-500 mb-2" />
              <button className="text-sm text-green-600 hover:text-green-800 font-medium flex items-center">
                View Details <ArrowRight className="h-4 w-4 ml-1" />
              </button>
            </div>
          </div>
        </div>
      )}

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

      {/* Quick Actions */}
      <div className="bg-white rounded-lg shadow">
        <div className="p-6">
          <h2 className="text-lg font-medium text-gray-900 mb-4">Quick Actions</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <button className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 text-left">
              <Calendar className="h-6 w-6 text-blue-500 mb-2" />
              <h3 className="font-medium text-gray-900">Book Appointment</h3>
              <p className="text-sm text-gray-600">Schedule with practitioner</p>
            </button>
            
            <button className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 text-left">
              <Heart className="h-6 w-6 text-purple-500 mb-2" />
              <h3 className="font-medium text-gray-900">View Therapy Plans</h3>
              <p className="text-sm text-gray-600">Check your treatment progress</p>
            </button>
            
            <button className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 text-left">
              <User className="h-6 w-6 text-green-500 mb-2" />
              <h3 className="font-medium text-gray-900">Find Practitioners</h3>
              <p className="text-sm text-gray-600">Browse available doctors</p>
            </button>
          </div>
        </div>
      </div>

      {/* Wellness Progress */}
      <div className="bg-white rounded-lg shadow">
        <div className="p-6">
          <h2 className="text-lg font-medium text-gray-900 mb-4">Your Wellness Journey</h2>
          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 bg-green-50 rounded-lg">
              <div className="flex items-center">
                <CheckCircle className="h-5 w-5 text-green-500 mr-3" />
                <span className="text-sm font-medium text-gray-900">
                  {stats.completedSessions} sessions completed
                </span>
              </div>
            </div>
            
            <div className="flex items-center justify-between p-4 bg-blue-50 rounded-lg">
              <div className="flex items-center">
                <Clock className="h-5 w-5 text-blue-500 mr-3" />
                <span className="text-sm font-medium text-gray-900">
                  {stats.upcomingAppointments} upcoming appointments
                </span>
              </div>
              <button className="text-sm text-blue-600 hover:text-blue-800 font-medium">
                View Schedule
              </button>
            </div>
            
            <div className="flex items-center justify-between p-4 bg-purple-50 rounded-lg">
              <div className="flex items-center">
                <Heart className="h-5 w-5 text-purple-500 mr-3" />
                <span className="text-sm font-medium text-gray-900">
                  {stats.activeTherapyPlans} active therapy plan(s)
                </span>
              </div>
              <button className="text-sm text-purple-600 hover:text-purple-800 font-medium">
                View Plans
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Health Tips */}
      <div className="bg-white rounded-lg shadow">
        <div className="p-6">
          <h2 className="text-lg font-medium text-gray-900 mb-4">Daily Wellness Tips</h2>
          <div className="space-y-3">
            <div className="p-4 bg-gradient-to-r from-green-50 to-blue-50 rounded-lg">
              <h4 className="font-medium text-gray-900 mb-1">🧘‍♀️ Morning Meditation</h4>
              <p className="text-sm text-gray-600">Start your day with 10 minutes of mindful breathing</p>
            </div>
            <div className="p-4 bg-gradient-to-r from-yellow-50 to-orange-50 rounded-lg">
              <h4 className="font-medium text-gray-900 mb-1">🥗 Ayurvedic Diet</h4>
              <p className="text-sm text-gray-600">Eat warm, cooked foods that match your constitution</p>
            </div>
            <div className="p-4 bg-gradient-to-r from-purple-50 to-pink-50 rounded-lg">
              <h4 className="font-medium text-gray-900 mb-1">💧 Stay Hydrated</h4>
              <p className="text-sm text-gray-600">Drink warm water throughout the day for better digestion</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PatientDashboard;

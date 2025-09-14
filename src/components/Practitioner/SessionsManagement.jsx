import React, { useState, useEffect } from 'react';
import { 
  Calendar, 
  Clock, 
  User, 
  Search, 
  Filter, 
  Eye, 
  Edit, 
  CheckCircle, 
  XCircle,
  AlertCircle,
  Heart,
  FileText,
  Phone,
  MapPin
} from 'lucide-react';
import api from '../../utils/api';


const SessionsManagement = () => {
  const [sessions, setSessions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [dateFilter, setDateFilter] = useState('all');
  const [selectedSession, setSelectedSession] = useState(null);
  const [showSessionDetails, setShowSessionDetails] = useState(false);
  const [viewMode, setViewMode] = useState('list'); // 'list' or 'calendar'

  useEffect(() => {
    fetchSessions();
  }, [statusFilter, dateFilter]);

  const fetchSessions = async () => {
    try {
      const params = new URLSearchParams();
      if (statusFilter !== 'all') {
        params.append('status', statusFilter);
      }
      if (dateFilter !== 'all') {
        params.append('dateFilter', dateFilter);
      }

      const response = await api.get(`/practitioner/appointments?${params}`);
      setSessions(response.data.appointments || []);
    } catch (error) {
      console.error('Error fetching sessions:', error);
      
    } finally {
      setLoading(false);
    }
  };

  const updateSessionStatus = async (sessionId, newStatus) => {
    try {
      await api.put(`/practitioner/appointments/${sessionId}`, { status: newStatus });
      
      fetchSessions();
    } catch (error) {
      console.error('Error updating session:', error);
      
    }
  };

  const fetchSessionDetails = async (sessionId) => {
    try {
      const response = await api.get(`/practitioner/appointments/${sessionId}`);
      setSelectedSession(response.data);
      setShowSessionDetails(true);
    } catch (error) {
      console.error('Error fetching session details:', error);
      
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'scheduled': return 'text-blue-700 bg-blue-100';
      case 'confirmed': return 'text-green-700 bg-green-100';
      case 'in-progress': return 'text-yellow-700 bg-yellow-100';
      case 'completed': return 'text-purple-700 bg-purple-100';
      case 'cancelled': return 'text-red-700 bg-red-100';
      case 'no-show': return 'text-gray-700 bg-gray-100';
      default: return 'text-gray-700 bg-gray-100';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'scheduled': return <Clock className="h-4 w-4" />;
      case 'confirmed': return <CheckCircle className="h-4 w-4" />;
      case 'in-progress': return <AlertCircle className="h-4 w-4" />;
      case 'completed': return <CheckCircle className="h-4 w-4" />;
      case 'cancelled': return <XCircle className="h-4 w-4" />;
      case 'no-show': return <XCircle className="h-4 w-4" />;
      default: return <Clock className="h-4 w-4" />;
    }
  };

  const isToday = (date) => {
    const today = new Date();
    const sessionDate = new Date(date);
    return sessionDate.toDateString() === today.toDateString();
  };

  const isUpcoming = (date) => {
    const today = new Date();
    const sessionDate = new Date(date);
    return sessionDate > today;
  };

  const filteredSessions = sessions.filter(session => {
    const matchesSearch = 
      session.patientId?.userId?.firstName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      session.patientId?.userId?.lastName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      session.type?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      session.therapyPlanId?.title?.toLowerCase().includes(searchTerm.toLowerCase());
    
    return matchesSearch;
  });

  const groupSessionsByDate = (sessions) => {
    const grouped = {};
    sessions.forEach(session => {
      const date = new Date(session.appointmentDate).toDateString();
      if (!grouped[date]) {
        grouped[date] = [];
      }
      grouped[date].push(session);
    });
    return grouped;
  };

  const groupedSessions = groupSessionsByDate(filteredSessions);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-500"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Sessions Management</h1>
          <p className="text-gray-600">View and manage all therapy sessions</p>
        </div>
        <div className="flex items-center space-x-3">
          <div className="flex bg-gray-100 rounded-lg p-1">
            <button
              onClick={() => setViewMode('list')}
              className={`px-3 py-1 rounded-md text-sm ${
                viewMode === 'list' 
                  ? 'bg-white text-gray-900 shadow-sm' 
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              List View
            </button>
            <button
              onClick={() => setViewMode('calendar')}
              className={`px-3 py-1 rounded-md text-sm ${
                viewMode === 'calendar' 
                  ? 'bg-white text-gray-900 shadow-sm' 
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              Calendar View
            </button>
          </div>
        </div>
      </div>

      {/* Search and Filter */}
      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search sessions by patient name, type, or therapy plan..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
              />
            </div>
          </div>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
          >
            <option value="all">All Status</option>
            <option value="scheduled">Scheduled</option>
            <option value="confirmed">Confirmed</option>
            <option value="in-progress">In Progress</option>
            <option value="completed">Completed</option>
            <option value="cancelled">Cancelled</option>
            <option value="no-show">No Show</option>
          </select>
          <select
            value={dateFilter}
            onChange={(e) => setDateFilter(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
          >
            <option value="all">All Dates</option>
            <option value="today">Today</option>
            <option value="upcoming">Upcoming</option>
            <option value="past">Past</option>
          </select>
        </div>
      </div>

      {/* Sessions Content */}
      {viewMode === 'list' ? (
        <div className="space-y-4">
          {Object.keys(groupedSessions).length > 0 ? (
            Object.keys(groupedSessions)
              .sort((a, b) => new Date(a) - new Date(b))
              .map(date => (
                <div key={date} className="bg-white rounded-lg shadow">
                  <div className="bg-gray-50 px-6 py-3 border-b border-gray-200">
                    <h3 className="text-lg font-medium text-gray-900">
                      {new Date(date).toLocaleDateString('en-US', { 
                        weekday: 'long', 
                        year: 'numeric', 
                        month: 'long', 
                        day: 'numeric' 
                      })}
                      {isToday(date) && (
                        <span className="ml-2 px-2 py-1 text-xs font-semibold bg-green-100 text-green-700 rounded-full">
                          Today
                        </span>
                      )}
                    </h3>
                  </div>
                  <div className="divide-y divide-gray-200">
                    {groupedSessions[date].map((session) => (
                      <div key={session._id} className="p-6 hover:bg-gray-50">
                        <div className="flex items-start justify-between">
                          <div className="flex items-start space-x-4">
                            <div className="flex-shrink-0">
                              <div className="w-10 h-10 bg-gradient-to-r from-green-400 to-blue-500 rounded-full flex items-center justify-center text-white font-semibold">
                                {session.patientId?.userId?.firstName?.charAt(0)}
                                {session.patientId?.userId?.lastName?.charAt(0)}
                              </div>
                            </div>
                            <div className="flex-1">
                              <div className="flex items-center space-x-2">
                                <h4 className="text-lg font-medium text-gray-900">
                                  {session.patientId?.userId?.firstName} {session.patientId?.userId?.lastName}
                                </h4>
                                <span className={`inline-flex items-center px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(session.status)}`}>
                                  {getStatusIcon(session.status)}
                                  <span className="ml-1">{session.status}</span>
                                </span>
                              </div>
                              <div className="mt-1 flex items-center space-x-4 text-sm text-gray-600">
                                <div className="flex items-center">
                                  <Clock className="h-4 w-4 mr-1" />
                                  {session.startTime} - {session.endTime}
                                </div>
                                <div className="flex items-center">
                                  <Heart className="h-4 w-4 mr-1" />
                                  {session.type}
                                </div>
                                <div className="flex items-center">
                                  <FileText className="h-4 w-4 mr-1" />
                                  {session.duration} min
                                </div>
                              </div>
                              {session.therapyPlanId?.title && (
                                <div className="mt-1 text-sm text-gray-600">
                                  Therapy Plan: {session.therapyPlanId.title}
                                </div>
                              )}
                              {session.notes && (
                                <div className="mt-2 text-sm text-gray-700">
                                  Notes: {session.notes}
                                </div>
                              )}
                            </div>
                          </div>
                          <div className="flex items-center space-x-2">
                            <button
                              onClick={() => fetchSessionDetails(session._id)}
                              className="p-2 text-blue-600 hover:bg-blue-100 rounded-md"
                            >
                              <Eye className="h-4 w-4" />
                            </button>
                            {session.status === 'scheduled' && (
                              <button
                                onClick={() => updateSessionStatus(session._id, 'confirmed')}
                                className="p-2 text-green-600 hover:bg-green-100 rounded-md"
                                title="Confirm Session"
                              >
                                <CheckCircle className="h-4 w-4" />
                              </button>
                            )}
                            {(session.status === 'scheduled' || session.status === 'confirmed') && (
                              <button
                                onClick={() => updateSessionStatus(session._id, 'cancelled')}
                                className="p-2 text-red-600 hover:bg-red-100 rounded-md"
                                title="Cancel Session"
                              >
                                <XCircle className="h-4 w-4" />
                              </button>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))
          ) : (
            <div className="text-center py-8">
              <Calendar className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500">No sessions found</p>
            </div>
          )}
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow p-6">
          <div className="text-center py-8">
            <Calendar className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-500">Calendar view coming soon...</p>
          </div>
        </div>
      )}

      {/* Session Details Modal */}
      {showSessionDetails && selectedSession && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 overflow-y-auto">
          <div className="bg-white rounded-lg p-6 w-full max-w-3xl max-h-screen overflow-y-auto m-4">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-semibold text-gray-900">Session Details</h3>
              <button
                onClick={() => setShowSessionDetails(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                ×
              </button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Session Information */}
              <div className="space-y-4">
                <div className="bg-gray-50 rounded-lg p-4">
                  <h4 className="font-medium text-gray-900 mb-3">Session Information</h4>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">Date:</span>
                      <span className="text-sm font-medium">
                        {new Date(selectedSession.appointmentDate).toLocaleDateString()}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">Time:</span>
                      <span className="text-sm font-medium">
                        {selectedSession.startTime} - {selectedSession.endTime}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">Duration:</span>
                      <span className="text-sm font-medium">{selectedSession.duration} minutes</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">Type:</span>
                      <span className="text-sm font-medium">{selectedSession.type}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">Status:</span>
                      <span className={`inline-flex items-center px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(selectedSession.status)}`}>
                        {getStatusIcon(selectedSession.status)}
                        <span className="ml-1">{selectedSession.status}</span>
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">Fee:</span>
                      <span className="text-sm font-medium">₹{selectedSession.fee}</span>
                    </div>
                  </div>
                </div>

                {/* Patient Information */}
                <div className="bg-gray-50 rounded-lg p-4">
                  <h4 className="font-medium text-gray-900 mb-3">Patient Information</h4>
                  <div className="space-y-2">
                    <div className="flex items-center">
                      <User className="h-4 w-4 text-gray-400 mr-2" />
                      <span className="text-sm">
                        {selectedSession.patientId?.userId?.firstName} {selectedSession.patientId?.userId?.lastName}
                      </span>
                    </div>
                    <div className="flex items-center">
                      <Phone className="h-4 w-4 text-gray-400 mr-2" />
                      <span className="text-sm">{selectedSession.patientId?.phone || 'Not provided'}</span>
                    </div>
                    <div className="flex items-center">
                      <MapPin className="h-4 w-4 text-gray-400 mr-2" />
                      <span className="text-sm">{selectedSession.patientId?.address || 'Not provided'}</span>
                    </div>
                  </div>
                </div>

                {/* Therapy Plan */}
                {selectedSession.therapyPlanId && (
                  <div className="bg-gray-50 rounded-lg p-4">
                    <h4 className="font-medium text-gray-900 mb-3">Therapy Plan</h4>
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-600">Title:</span>
                        <span className="text-sm font-medium">{selectedSession.therapyPlanId.title}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-600">Type:</span>
                        <span className="text-sm font-medium">{selectedSession.therapyPlanId.therapyType}</span>
                      </div>
                      <div className="text-sm text-gray-700 mt-2">
                        {selectedSession.therapyPlanId.description}
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Session Notes and Details */}
              <div className="space-y-4">
                {selectedSession.notes && (
                  <div className="bg-gray-50 rounded-lg p-4">
                    <h4 className="font-medium text-gray-900 mb-3">Session Notes</h4>
                    <p className="text-sm text-gray-700">{selectedSession.notes}</p>
                  </div>
                )}

                {selectedSession.symptoms?.length > 0 && (
                  <div className="bg-gray-50 rounded-lg p-4">
                    <h4 className="font-medium text-gray-900 mb-3">Symptoms</h4>
                    <div className="space-y-1">
                      {selectedSession.symptoms.map((symptom, index) => (
                        <div key={index} className="text-sm text-gray-700 bg-white px-2 py-1 rounded">
                          {symptom}
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {selectedSession.diagnosis && (
                  <div className="bg-gray-50 rounded-lg p-4">
                    <h4 className="font-medium text-gray-900 mb-3">Diagnosis</h4>
                    <p className="text-sm text-gray-700">{selectedSession.diagnosis}</p>
                  </div>
                )}

                {selectedSession.treatment && (
                  <div className="bg-gray-50 rounded-lg p-4">
                    <h4 className="font-medium text-gray-900 mb-3">Treatment</h4>
                    <p className="text-sm text-gray-700">{selectedSession.treatment}</p>
                  </div>
                )}

                {selectedSession.prescription?.length > 0 && (
                  <div className="bg-gray-50 rounded-lg p-4">
                    <h4 className="font-medium text-gray-900 mb-3">Prescription</h4>
                    <div className="space-y-2">
                      {selectedSession.prescription.map((med, index) => (
                        <div key={index} className="bg-white p-2 rounded border">
                          <div className="font-medium text-sm">{med.medicine}</div>
                          <div className="text-xs text-gray-600">
                            {med.dosage} • {med.frequency} • {med.duration}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {selectedSession.nextAppointment && (
                  <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                    <h4 className="font-medium text-green-900 mb-2">Next Appointment</h4>
                    <p className="text-sm text-green-700">
                      {new Date(selectedSession.nextAppointment).toLocaleDateString()}
                    </p>
                  </div>
                )}
              </div>
            </div>

            <div className="flex justify-end space-x-3 mt-6">
              <button
                onClick={() => setShowSessionDetails(false)}
                className="px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50"
              >
                Close
              </button>
              {selectedSession.status === 'scheduled' && (
                <button
                  onClick={() => {
                    updateSessionStatus(selectedSession._id, 'confirmed');
                    setShowSessionDetails(false);
                  }}
                  className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700"
                >
                  Confirm Session
                </button>
              )}
              {selectedSession.status === 'confirmed' && (
                <button
                  onClick={() => {
                    updateSessionStatus(selectedSession._id, 'completed');
                    setShowSessionDetails(false);
                  }}
                  className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                >
                  Mark Complete
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SessionsManagement;

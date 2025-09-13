import React, { useState, useEffect } from 'react';
import { 
  Calendar, Clock, User, Plus, Search, Filter, Eye, Edit, CheckCircle,
  AlertCircle, Activity, FileText, Trash2, RefreshCw, Download, Save,
  X, ChevronLeft, ChevronRight, Star, Heart, TrendingUp
} from 'lucide-react';
import api from '../../utils/api';
import toast from 'react-hot-toast';

const AdvancedSessionsManagement = () => {
  const [sessions, setSessions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [dateFilter, setDateFilter] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [modalType, setModalType] = useState('view');
  const [selectedSession, setSelectedSession] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [sessionsPerPage] = useState(10);

  useEffect(() => {
    fetchSessions();
  }, [statusFilter, dateFilter]);

  const fetchSessions = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (statusFilter !== 'all') params.append('status', statusFilter);
      if (dateFilter) params.append('date', dateFilter);

      const response = await api.get(`/practitioner/sessions?${params}`);
      setSessions(response.data);
    } catch (error) {
      console.error('Error fetching sessions:', error);
      toast.error('Error loading sessions');
    } finally {
      setLoading(false);
    }
  };

  const updateSessionStatus = async (sessionId, status) => {
    try {
      await api.patch(`/practitioner/sessions/${sessionId}/status`, { status });
      toast.success(`Session ${status} successfully`);
      fetchSessions();
    } catch (error) {
      console.error('Error updating session status:', error);
      toast.error('Error updating session status');
    }
  };

  const deleteSession = async (sessionId) => {
    if (window.confirm('Are you sure you want to delete this session?')) {
      try {
        await api.delete(`/practitioner/sessions/${sessionId}`);
        toast.success('Session deleted successfully');
        fetchSessions();
      } catch (error) {
        console.error('Error deleting session:', error);
        toast.error('Error deleting session');
      }
    }
  };

  const openModal = (type, session = null) => {
    setModalType(type);
    setSelectedSession(session);
    setShowModal(true);
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'scheduled': return 'bg-blue-100 text-blue-700';
      case 'in-progress': return 'bg-yellow-100 text-yellow-700';
      case 'completed': return 'bg-green-100 text-green-700';
      case 'cancelled': return 'bg-red-100 text-red-700';
      case 'no-show': return 'bg-gray-100 text-gray-700';
      default: return 'bg-gray-100 text-gray-700';
    }
  };

  const filteredSessions = sessions.filter(session =>
    session.patientId?.firstName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    session.patientId?.lastName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    session.therapyType?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const indexOfLastSession = currentPage * sessionsPerPage;
  const indexOfFirstSession = indexOfLastSession - sessionsPerPage;
  const currentSessions = filteredSessions.slice(indexOfFirstSession, indexOfLastSession);
  const totalPages = Math.ceil(filteredSessions.length / sessionsPerPage);

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
          <h1 className="text-3xl font-bold text-gray-900">Sessions Management</h1>
          <p className="text-gray-600">Track and manage therapy sessions with detailed analytics</p>
        </div>
        <div className="flex items-center space-x-3">
          <button
            onClick={() => openModal('create')}
            className="flex items-center px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700"
          >
            <Plus className="h-4 w-4 mr-2" />
            New Session
          </button>
          <button
            onClick={fetchSessions}
            className="flex items-center px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700"
          >
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </button>
        </div>
      </div>

      {/* Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="p-2 bg-blue-100 rounded-lg">
              <Activity className="h-6 w-6 text-blue-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Total Sessions</p>
              <p className="text-2xl font-bold text-gray-900">{sessions.length}</p>
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="p-2 bg-green-100 rounded-lg">
              <CheckCircle className="h-6 w-6 text-green-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Completed</p>
              <p className="text-2xl font-bold text-gray-900">
                {sessions.filter(s => s.status === 'completed').length}
              </p>
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="p-2 bg-yellow-100 rounded-lg">
              <Clock className="h-6 w-6 text-yellow-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">In Progress</p>
              <p className="text-2xl font-bold text-gray-900">
                {sessions.filter(s => s.status === 'in-progress').length}
              </p>
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="p-2 bg-purple-100 rounded-lg">
              <TrendingUp className="h-6 w-6 text-purple-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">This Week</p>
              <p className="text-2xl font-bold text-gray-900">
                {sessions.filter(s => {
                  const sessionDate = new Date(s.date);
                  const weekAgo = new Date();
                  weekAgo.setDate(weekAgo.getDate() - 7);
                  return sessionDate >= weekAgo;
                }).length}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Search and Filter */}
      <div className="bg-white rounded-lg shadow p-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search sessions..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
            />
          </div>
          
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
          >
            <option value="all">All Status</option>
            <option value="scheduled">Scheduled</option>
            <option value="in-progress">In Progress</option>
            <option value="completed">Completed</option>
            <option value="cancelled">Cancelled</option>
          </select>
          
          <input
            type="date"
            value={dateFilter}
            onChange={(e) => setDateFilter(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
          />
          
          <div className="flex space-x-2">
            <button
              onClick={() => {
                setSearchTerm('');
                setStatusFilter('all');
                setDateFilter('');
              }}
              className="flex-1 px-4 py-2 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200"
            >
              Clear
            </button>
            <button className="flex items-center px-3 py-2 bg-blue-100 text-blue-700 rounded-md hover:bg-blue-200">
              <Download className="h-4 w-4 mr-1" />
              Export
            </button>
          </div>
        </div>
      </div>

      {/* Sessions List */}
      <div className="bg-white rounded-lg shadow">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900">Sessions</h3>
        </div>
        
        <div className="divide-y divide-gray-200">
          {currentSessions.length > 0 ? (
            currentSessions.map((session) => (
              <div key={session._id} className="p-6 hover:bg-gray-50">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <div className="w-12 h-12 bg-gradient-to-r from-purple-400 to-pink-500 rounded-full flex items-center justify-center text-white font-semibold">
                      {session.patientId?.firstName?.charAt(0)}
                      {session.patientId?.lastName?.charAt(0)}
                    </div>
                    <div>
                      <h4 className="text-lg font-medium text-gray-900">
                        {session.patientId?.firstName} {session.patientId?.lastName}
                      </h4>
                      <div className="flex items-center space-x-4 text-sm text-gray-600">
                        <span className="flex items-center">
                          <Calendar className="h-4 w-4 mr-1" />
                          {new Date(session.date).toLocaleDateString()}
                        </span>
                        <span className="flex items-center">
                          <Clock className="h-4 w-4 mr-1" />
                          {session.duration} min
                        </span>
                        <span className="capitalize">{session.therapyType}</span>
                        <span>₹{session.fee}</span>
                      </div>
                      {session.notes && (
                        <p className="text-sm text-gray-500 mt-1">{session.notes}</p>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center space-x-3">
                    <span className={`px-3 py-1 text-sm font-semibold rounded-full ${getStatusColor(session.status)}`}>
                      {session.status}
                    </span>
                    <div className="flex items-center space-x-2">
                      {session.status === 'scheduled' && (
                        <button
                          onClick={() => updateSessionStatus(session._id, 'in-progress')}
                          className="p-2 text-yellow-600 hover:text-yellow-800"
                          title="Start Session"
                        >
                          <Activity className="h-4 w-4" />
                        </button>
                      )}
                      {session.status === 'in-progress' && (
                        <button
                          onClick={() => updateSessionStatus(session._id, 'completed')}
                          className="p-2 text-green-600 hover:text-green-800"
                          title="Complete Session"
                        >
                          <CheckCircle className="h-4 w-4" />
                        </button>
                      )}
                      <button
                        onClick={() => openModal('view', session)}
                        className="p-2 text-blue-600 hover:text-blue-800"
                        title="View Details"
                      >
                        <Eye className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => openModal('edit', session)}
                        className="p-2 text-purple-600 hover:text-purple-800"
                        title="Edit Session"
                      >
                        <Edit className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => deleteSession(session._id)}
                        className="p-2 text-red-600 hover:text-red-800"
                        title="Delete Session"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="p-12 text-center">
              <Activity className="h-16 w-16 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500 text-lg">No sessions found</p>
              <p className="text-gray-400">Try adjusting your filters or create a new session</p>
            </div>
          )}
        </div>

        {/* Pagination */}
        <div className="px-6 py-4 border-t border-gray-200">
          <div className="flex items-center justify-between">
            <div className="text-sm text-gray-700">
              Showing {indexOfFirstSession + 1} to {Math.min(indexOfLastSession, filteredSessions.length)} of {filteredSessions.length} results
            </div>
            <div className="flex items-center space-x-2">
              <button
                onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                disabled={currentPage === 1}
                className="p-2 border border-gray-300 rounded-md disabled:opacity-50"
              >
                <ChevronLeft className="h-4 w-4" />
              </button>
              <span className="px-3 py-2 text-sm">
                Page {currentPage} of {totalPages}
              </span>
              <button
                onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                disabled={currentPage === totalPages}
                className="p-2 border border-gray-300 rounded-md disabled:opacity-50"
              >
                <ChevronRight className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-2xl max-h-screen overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold">
                {modalType === 'create' ? 'Create New Session' : 
                 modalType === 'edit' ? 'Edit Session' : 'Session Details'}
              </h3>
              <button
                onClick={() => setShowModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="h-6 w-6" />
              </button>
            </div>
            <div className="text-center py-8">
              <p className="text-gray-500">Modal content for {modalType} operation</p>
              <p className="text-sm text-gray-400 mt-2">Full form implementation needed</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdvancedSessionsManagement;

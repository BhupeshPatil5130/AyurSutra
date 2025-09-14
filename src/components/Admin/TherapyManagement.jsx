import React, { useState, useEffect } from 'react';
import { 
  Calendar, 
  Clock, 
  Users, 
  AlertCircle, 
  CheckCircle, 
  RefreshCw, 
  Settings,
  BarChart3,
  TrendingUp,
  Activity,
  Filter,
  Search,
  Download,
  Upload,
  Eye,
  Edit,
  Trash2
} from 'lucide-react';
import therapyService from '../../services/therapyService';

const TherapyManagement = () => {
  const [readyTherapies, setReadyTherapies] = useState([]);
  const [waitingTherapies, setWaitingTherapies] = useState([]);
  const [loading, setLoading] = useState(false);
  const [stats, setStats] = useState({
    total: 0,
    scheduled: 0,
    waiting: 0,
    completed: 0,
    cancelled: 0
  });
  const [filters, setFilters] = useState({
    status: 'all',
    priority: 'all',
    dateRange: 'all'
  });
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    fetchAllTherapies();
  }, []);

  const fetchAllTherapies = async () => {
    setLoading(true);
    try {
      const [ready, waiting] = await Promise.all([
        therapyService.getReadyTherapies(),
        therapyService.getWaitingTherapies()
      ]);
      setReadyTherapies(ready);
      setWaitingTherapies(waiting);
      
      // Calculate stats
      const allTherapies = [...ready, ...waiting];
      setStats({
        total: allTherapies.length,
        scheduled: allTherapies.filter(t => t.status === 'scheduled').length,
        waiting: allTherapies.filter(t => t.status === 'waiting').length,
        completed: allTherapies.filter(t => t.status === 'completed').length,
        cancelled: allTherapies.filter(t => t.status === 'cancelled').length
      });
    } catch (error) {
      console.error('Error fetching therapies:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleRescheduleAll = async () => {
    try {
      await therapyService.rescheduleTherapies();
      fetchAllTherapies();
    } catch (error) {
      console.error('Error rescheduling therapies:', error);
    }
  };

  const handleMoveToWaiting = async (therapyId, reason) => {
    try {
      await therapyService.moveToWaitingQueue(therapyId, reason);
      fetchAllTherapies();
    } catch (error) {
      console.error('Error moving therapy to waiting:', error);
    }
  };

  const formatTime = (dateString) => {
    return new Date(dateString).toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'scheduled': return 'bg-green-100 text-green-800';
      case 'waiting': return 'bg-yellow-100 text-yellow-800';
      case 'completed': return 'bg-blue-100 text-blue-800';
      case 'cancelled': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 1: return 'bg-red-100 text-red-800';
      case 2: return 'bg-yellow-100 text-yellow-800';
      case 3: return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const allTherapies = [...readyTherapies, ...waitingTherapies];
  const filteredTherapies = allTherapies.filter(therapy => {
    const matchesStatus = filters.status === 'all' || therapy.status === filters.status;
    const matchesPriority = filters.priority === 'all' || therapy.priority.toString() === filters.priority;
    const matchesSearch = searchTerm === '' || 
      therapy.sessionId.toLowerCase().includes(searchTerm.toLowerCase()) ||
      therapy.patientId.toLowerCase().includes(searchTerm.toLowerCase()) ||
      therapy.practitionerId.toLowerCase().includes(searchTerm.toLowerCase());
    
    return matchesStatus && matchesPriority && matchesSearch;
  });

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Therapy Management</h1>
          <p className="text-gray-600">Admin dashboard for therapy scheduling and queue management</p>
        </div>
        <div className="flex space-x-3">
          <button
            onClick={handleRescheduleAll}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg flex items-center space-x-2 hover:bg-blue-700"
          >
            <RefreshCw className="w-4 h-4" />
            <span>Auto Reschedule All</span>
          </button>
          <button className="bg-green-600 text-white px-4 py-2 rounded-lg flex items-center space-x-2 hover:bg-green-700">
            <Download className="w-4 h-4" />
            <span>Export Data</span>
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-6">
        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <div className="flex items-center">
            <div className="p-2 bg-blue-100 rounded-lg">
              <Activity className="w-6 h-6 text-blue-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Total Sessions</p>
              <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
            </div>
          </div>
        </div>
        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <div className="flex items-center">
            <div className="p-2 bg-green-100 rounded-lg">
              <CheckCircle className="w-6 h-6 text-green-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Scheduled</p>
              <p className="text-2xl font-bold text-gray-900">{stats.scheduled}</p>
            </div>
          </div>
        </div>
        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <div className="flex items-center">
            <div className="p-2 bg-yellow-100 rounded-lg">
              <AlertCircle className="w-6 h-6 text-yellow-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Waiting</p>
              <p className="text-2xl font-bold text-gray-900">{stats.waiting}</p>
            </div>
          </div>
        </div>
        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <div className="flex items-center">
            <div className="p-2 bg-blue-100 rounded-lg">
              <Clock className="w-6 h-6 text-blue-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Completed</p>
              <p className="text-2xl font-bold text-gray-900">{stats.completed}</p>
            </div>
          </div>
        </div>
        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <div className="flex items-center">
            <div className="p-2 bg-red-100 rounded-lg">
              <AlertCircle className="w-6 h-6 text-red-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Cancelled</p>
              <p className="text-2xl font-bold text-gray-900">{stats.cancelled}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Filters and Search */}
      <div className="bg-white p-6 rounded-lg shadow-sm border">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between space-y-4 md:space-y-0">
          <div className="flex items-center space-x-4">
            <div className="relative">
              <Search className="w-5 h-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Search sessions..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
              />
            </div>
            <Filter className="w-5 h-5 text-gray-500" />
          </div>
          <div className="flex space-x-4">
            <select
              value={filters.status}
              onChange={(e) => setFilters({ ...filters, status: e.target.value })}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
            >
              <option value="all">All Status</option>
              <option value="scheduled">Scheduled</option>
              <option value="waiting">Waiting</option>
              <option value="completed">Completed</option>
              <option value="cancelled">Cancelled</option>
            </select>
            <select
              value={filters.priority}
              onChange={(e) => setFilters({ ...filters, priority: e.target.value })}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
            >
              <option value="all">All Priorities</option>
              <option value="1">High Priority</option>
              <option value="2">Medium Priority</option>
              <option value="3">Low Priority</option>
            </select>
          </div>
        </div>
      </div>

      {/* Queue Status */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Ready Queue */}
        <div className="bg-white rounded-lg shadow-sm border">
          <div className="p-6 border-b">
            <h2 className="text-lg font-semibold text-gray-900 flex items-center">
              <CheckCircle className="w-5 h-5 text-green-500 mr-2" />
              Ready Queue ({readyTherapies.length})
            </h2>
            <p className="text-sm text-gray-600 mt-1">Therapies ready to be performed</p>
          </div>
          <div className="p-6 max-h-96 overflow-y-auto">
            {readyTherapies.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <CheckCircle className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                <p>No therapies in ready queue</p>
              </div>
            ) : (
              <div className="space-y-3">
                {readyTherapies.map((therapy) => (
                  <div key={therapy._id} className="border rounded-lg p-3 hover:bg-gray-50">
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <div className="flex items-center space-x-2 mb-1">
                          <span className="font-medium text-sm">{therapy.sessionId}</span>
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${getPriorityColor(therapy.priority)}`}>
                            P{therapy.priority}
                          </span>
                        </div>
                        <p className="text-xs text-gray-600">Patient: {therapy.patientId}</p>
                        <p className="text-xs text-gray-600">Time: {formatTime(therapy.timeSlot)}</p>
                      </div>
                      <div className="flex space-x-1">
                        <button
                          onClick={() => handleMoveToWaiting(therapy._id, 'Admin moved')}
                          className="p-1 text-yellow-600 hover:bg-yellow-100 rounded"
                          title="Move to waiting"
                        >
                          <AlertCircle className="w-4 h-4" />
                        </button>
                        <button className="p-1 text-green-600 hover:bg-green-100 rounded" title="Mark complete">
                          <CheckCircle className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Waiting Queue */}
        <div className="bg-white rounded-lg shadow-sm border">
          <div className="p-6 border-b">
            <h2 className="text-lg font-semibold text-gray-900 flex items-center">
              <AlertCircle className="w-5 h-5 text-yellow-500 mr-2" />
              Waiting Queue ({waitingTherapies.length})
            </h2>
            <p className="text-sm text-gray-600 mt-1">Therapies waiting to be rescheduled</p>
          </div>
          <div className="p-6 max-h-96 overflow-y-auto">
            {waitingTherapies.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <AlertCircle className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                <p>No therapies in waiting queue</p>
              </div>
            ) : (
              <div className="space-y-3">
                {waitingTherapies.map((therapy) => (
                  <div key={therapy._id} className="border rounded-lg p-3 hover:bg-gray-50">
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <div className="flex items-center space-x-2 mb-1">
                          <span className="font-medium text-sm">{therapy.sessionId}</span>
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${getPriorityColor(therapy.priority)}`}>
                            P{therapy.priority}
                          </span>
                        </div>
                        <p className="text-xs text-gray-600">Patient: {therapy.patientId}</p>
                        <p className="text-xs text-gray-600">Original: {formatTime(therapy.timeSlot)}</p>
                        {therapy.reason && (
                          <p className="text-xs text-red-600">Reason: {therapy.reason}</p>
                        )}
                      </div>
                      <div className="flex space-x-1">
                        <button className="p-1 text-blue-600 hover:bg-blue-100 rounded" title="Reschedule">
                          <RefreshCw className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* All Therapies Table */}
      <div className="bg-white rounded-lg shadow-sm border">
        <div className="p-6 border-b">
          <h2 className="text-lg font-semibold text-gray-900">All Therapy Sessions</h2>
          <p className="text-sm text-gray-600 mt-1">Complete overview of all therapy sessions</p>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Session ID</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Patient</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Practitioner</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Time Slot</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Priority</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {loading ? (
                <tr>
                  <td colSpan="7" className="px-6 py-4 text-center">
                    <RefreshCw className="w-6 h-6 animate-spin mx-auto text-gray-400" />
                  </td>
                </tr>
              ) : filteredTherapies.length === 0 ? (
                <tr>
                  <td colSpan="7" className="px-6 py-4 text-center text-gray-500">
                    No therapy sessions found
                  </td>
                </tr>
              ) : (
                filteredTherapies.map((therapy) => (
                  <tr key={therapy._id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {therapy.sessionId}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {therapy.patientId}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {therapy.practitionerId}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {formatTime(therapy.timeSlot)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(therapy.status)}`}>
                        {therapy.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getPriorityColor(therapy.priority)}`}>
                        {therapy.priority}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex space-x-2">
                        <button className="text-blue-600 hover:text-blue-900" title="View">
                          <Eye className="w-4 h-4" />
                        </button>
                        <button className="text-green-600 hover:text-green-900" title="Edit">
                          <Edit className="w-4 h-4" />
                        </button>
                        <button className="text-red-600 hover:text-red-900" title="Delete">
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default TherapyManagement;

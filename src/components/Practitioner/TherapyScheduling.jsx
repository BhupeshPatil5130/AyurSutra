import React, { useState, useEffect } from 'react';
import { 
  Calendar, 
  Clock, 
  Users, 
  AlertCircle, 
  CheckCircle, 
  RefreshCw, 
  Plus,
  User,
  Phone,
  Mail,
  MapPin,
  Activity,
  Settings,
  ArrowUp,
  ArrowDown
} from 'lucide-react';
import therapyService from '../../services/therapyService';

const TherapyScheduling = () => {
  const [readyTherapies, setReadyTherapies] = useState([]);
  const [waitingTherapies, setWaitingTherapies] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showScheduleModal, setShowScheduleModal] = useState(false);
  const [selectedTherapy, setSelectedTherapy] = useState(null);
  const [newTherapy, setNewTherapy] = useState({
    patientId: '',
    timeSlot: '',
    priority: 1,
    reason: ''
  });

  useEffect(() => {
    fetchTherapies();
  }, []);

  const fetchTherapies = async () => {
    setLoading(true);
    try {
      const [ready, waiting] = await Promise.all([
        therapyService.getReadyTherapies(),
        therapyService.getWaitingTherapies()
      ]);
      setReadyTherapies(ready);
      setWaitingTherapies(waiting);
    } catch (error) {
      console.error('Error fetching therapies:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleScheduleTherapy = async (e) => {
    e.preventDefault();
    try {
      await therapyService.scheduleTherapy({
        ...newTherapy,
        practitionerId: 'current-practitioner-id', // Get from auth context
        timeSlot: new Date(newTherapy.timeSlot).toISOString()
      });
      setShowScheduleModal(false);
      setNewTherapy({ patientId: '', timeSlot: '', priority: 1, reason: '' });
      fetchTherapies();
    } catch (error) {
      console.error('Error scheduling therapy:', error);
    }
  };

  const handleMoveToWaiting = async (therapyId, reason) => {
    try {
      await therapyService.moveToWaitingQueue(therapyId, reason);
      fetchTherapies();
    } catch (error) {
      console.error('Error moving therapy to waiting:', error);
    }
  };

  const handleReschedule = async () => {
    try {
      await therapyService.rescheduleTherapies();
      fetchTherapies();
    } catch (error) {
      console.error('Error rescheduling therapies:', error);
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

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 1: return 'bg-red-100 text-red-800';
      case 2: return 'bg-yellow-100 text-yellow-800';
      case 3: return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'scheduled': return <CheckCircle className="w-4 h-4 text-green-500" />;
      case 'waiting': return <AlertCircle className="w-4 h-4 text-yellow-500" />;
      case 'completed': return <CheckCircle className="w-4 h-4 text-blue-500" />;
      default: return <Clock className="w-4 h-4 text-gray-500" />;
    }
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Therapy Scheduling</h1>
          <p className="text-gray-600">Manage therapy sessions with priority queue system</p>
        </div>
        <div className="flex space-x-3">
          <button
            onClick={() => setShowScheduleModal(true)}
            className="bg-green-600 text-white px-4 py-2 rounded-lg flex items-center space-x-2 hover:bg-green-700"
          >
            <Plus className="w-4 h-4" />
            <span>Schedule Therapy</span>
          </button>
          <button
            onClick={handleReschedule}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg flex items-center space-x-2 hover:bg-blue-700"
          >
            <RefreshCw className="w-4 h-4" />
            <span>Auto Reschedule</span>
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <div className="flex items-center">
            <div className="p-2 bg-green-100 rounded-lg">
              <CheckCircle className="w-6 h-6 text-green-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Ready Queue</p>
              <p className="text-2xl font-bold text-gray-900">{readyTherapies.length}</p>
            </div>
          </div>
        </div>
        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <div className="flex items-center">
            <div className="p-2 bg-yellow-100 rounded-lg">
              <AlertCircle className="w-6 h-6 text-yellow-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Waiting Queue</p>
              <p className="text-2xl font-bold text-gray-900">{waitingTherapies.length}</p>
            </div>
          </div>
        </div>
        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <div className="flex items-center">
            <div className="p-2 bg-blue-100 rounded-lg">
              <Activity className="w-6 h-6 text-blue-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Total Sessions</p>
              <p className="text-2xl font-bold text-gray-900">{readyTherapies.length + waitingTherapies.length}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Ready Queue */}
      <div className="bg-white rounded-lg shadow-sm border">
        <div className="p-6 border-b">
          <h2 className="text-lg font-semibold text-gray-900 flex items-center">
            <CheckCircle className="w-5 h-5 text-green-500 mr-2" />
            Ready Queue (Scheduled Therapies)
          </h2>
          <p className="text-sm text-gray-600 mt-1">Therapies ready to be performed, sorted by priority</p>
        </div>
        <div className="p-6">
          {loading ? (
            <div className="flex justify-center py-8">
              <RefreshCw className="w-6 h-6 animate-spin text-gray-400" />
            </div>
          ) : readyTherapies.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <Calendar className="w-12 h-12 mx-auto mb-4 text-gray-300" />
              <p>No scheduled therapies</p>
            </div>
          ) : (
            <div className="space-y-4">
              {readyTherapies.map((therapy) => (
                <div key={therapy._id} className="border rounded-lg p-4 hover:bg-gray-50">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      {getStatusIcon(therapy.status)}
                      <div>
                        <div className="flex items-center space-x-2">
                          <span className="font-medium text-gray-900">Session {therapy.sessionId}</span>
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${getPriorityColor(therapy.priority)}`}>
                            Priority {therapy.priority}
                          </span>
                        </div>
                        <p className="text-sm text-gray-600">Patient ID: {therapy.patientId}</p>
                        <p className="text-sm text-gray-600">Time: {formatTime(therapy.timeSlot)}</p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => handleMoveToWaiting(therapy._id, 'Emergency')}
                        className="px-3 py-1 text-sm bg-yellow-100 text-yellow-800 rounded-lg hover:bg-yellow-200"
                      >
                        Move to Waiting
                      </button>
                      <button className="px-3 py-1 text-sm bg-green-100 text-green-800 rounded-lg hover:bg-green-200">
                        Mark Complete
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
            Waiting Queue
          </h2>
          <p className="text-sm text-gray-600 mt-1">Therapies waiting to be rescheduled</p>
        </div>
        <div className="p-6">
          {waitingTherapies.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <AlertCircle className="w-12 h-12 mx-auto mb-4 text-gray-300" />
              <p>No therapies in waiting queue</p>
            </div>
          ) : (
            <div className="space-y-4">
              {waitingTherapies.map((therapy) => (
                <div key={therapy._id} className="border rounded-lg p-4 hover:bg-gray-50">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      {getStatusIcon(therapy.status)}
                      <div>
                        <div className="flex items-center space-x-2">
                          <span className="font-medium text-gray-900">Session {therapy.sessionId}</span>
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${getPriorityColor(therapy.priority)}`}>
                            Priority {therapy.priority}
                          </span>
                        </div>
                        <p className="text-sm text-gray-600">Patient ID: {therapy.patientId}</p>
                        <p className="text-sm text-gray-600">Original Time: {formatTime(therapy.timeSlot)}</p>
                        {therapy.reason && (
                          <p className="text-sm text-red-600">Reason: {therapy.reason}</p>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <button className="px-3 py-1 text-sm bg-blue-100 text-blue-800 rounded-lg hover:bg-blue-200">
                        Reschedule
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Schedule Modal */}
      {showScheduleModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Schedule New Therapy</h3>
            <form onSubmit={handleScheduleTherapy} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Patient ID</label>
                <input
                  type="text"
                  value={newTherapy.patientId}
                  onChange={(e) => setNewTherapy({ ...newTherapy, patientId: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Time Slot</label>
                <input
                  type="datetime-local"
                  value={newTherapy.timeSlot}
                  onChange={(e) => setNewTherapy({ ...newTherapy, timeSlot: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Priority</label>
                <select
                  value={newTherapy.priority}
                  onChange={(e) => setNewTherapy({ ...newTherapy, priority: parseInt(e.target.value) })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                >
                  <option value={1}>High (1)</option>
                  <option value={2}>Medium (2)</option>
                  <option value={3}>Low (3)</option>
                </select>
              </div>
              <div className="flex justify-end space-x-3 pt-4">
                <button
                  type="button"
                  onClick={() => setShowScheduleModal(false)}
                  className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
                >
                  Schedule
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default TherapyScheduling;

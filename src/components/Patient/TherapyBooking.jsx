import React, { useState, useEffect } from 'react';
import { 
  Calendar, 
  Clock, 
  User, 
  MapPin, 
  Phone, 
  Mail,
  CheckCircle,
  AlertCircle,
  RefreshCw,
  BookOpen,
  Star,
  Filter,
  Search
} from 'lucide-react';
import therapyService from '../../services/therapyService';

const TherapyBooking = () => {
  const [myTherapies, setMyTherapies] = useState([]);
  const [availableSlots, setAvailableSlots] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showBookingModal, setShowBookingModal] = useState(false);
  const [selectedSlot, setSelectedSlot] = useState(null);
  const [filters, setFilters] = useState({
    status: 'all',
    priority: 'all'
  });

  useEffect(() => {
    fetchMyTherapies();
  }, []);

  const fetchMyTherapies = async () => {
    setLoading(true);
    try {
      // In a real app, you'd filter by current user's patientId
      const readyTherapies = await therapyService.getReadyTherapies();
      const waitingTherapies = await therapyService.getWaitingTherapies();
      
      // Filter for current patient (in real app, use actual patient ID from auth)
      const currentPatientId = 'current-patient-id';
      const myReady = readyTherapies.filter(t => t.patientId === currentPatientId);
      const myWaiting = waitingTherapies.filter(t => t.patientId === currentPatientId);
      
      setMyTherapies([...myReady, ...myWaiting]);
    } catch (error) {
      console.error('Error fetching my therapies:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleBookTherapy = async (slot) => {
    try {
      await therapyService.scheduleTherapy({
        patientId: 'current-patient-id', // Get from auth context
        practitionerId: slot.practitionerId,
        timeSlot: slot.timeSlot,
        priority: 2 // Default medium priority for patient bookings
      });
      setShowBookingModal(false);
      fetchMyTherapies();
    } catch (error) {
      console.error('Error booking therapy:', error);
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

  const filteredTherapies = myTherapies.filter(therapy => {
    if (filters.status !== 'all' && therapy.status !== filters.status) return false;
    if (filters.priority !== 'all' && therapy.priority.toString() !== filters.priority) return false;
    return true;
  });

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">My Therapy Sessions</h1>
          <p className="text-gray-600">View and manage your scheduled therapy sessions</p>
        </div>
        <button
          onClick={() => setShowBookingModal(true)}
          className="bg-green-600 text-white px-4 py-2 rounded-lg flex items-center space-x-2 hover:bg-green-700"
        >
          <BookOpen className="w-4 h-4" />
          <span>Book New Session</span>
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-lg shadow-sm border">
          <div className="flex items-center">
            <CheckCircle className="w-8 h-8 text-green-500" />
            <div className="ml-3">
              <p className="text-sm text-gray-600">Scheduled</p>
              <p className="text-xl font-bold">{myTherapies.filter(t => t.status === 'scheduled').length}</p>
            </div>
          </div>
        </div>
        <div className="bg-white p-4 rounded-lg shadow-sm border">
          <div className="flex items-center">
            <AlertCircle className="w-8 h-8 text-yellow-500" />
            <div className="ml-3">
              <p className="text-sm text-gray-600">Waiting</p>
              <p className="text-xl font-bold">{myTherapies.filter(t => t.status === 'waiting').length}</p>
            </div>
          </div>
        </div>
        <div className="bg-white p-4 rounded-lg shadow-sm border">
          <div className="flex items-center">
            <Clock className="w-8 h-8 text-blue-500" />
            <div className="ml-3">
              <p className="text-sm text-gray-600">Completed</p>
              <p className="text-xl font-bold">{myTherapies.filter(t => t.status === 'completed').length}</p>
            </div>
          </div>
        </div>
        <div className="bg-white p-4 rounded-lg shadow-sm border">
          <div className="flex items-center">
            <Star className="w-8 h-8 text-purple-500" />
            <div className="ml-3">
              <p className="text-sm text-gray-600">Total</p>
              <p className="text-xl font-bold">{myTherapies.length}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white p-4 rounded-lg shadow-sm border">
        <div className="flex items-center space-x-4">
          <Filter className="w-5 h-5 text-gray-500" />
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

      {/* Therapy Sessions List */}
      <div className="bg-white rounded-lg shadow-sm border">
        <div className="p-6 border-b">
          <h2 className="text-lg font-semibold text-gray-900">My Therapy Sessions</h2>
        </div>
        <div className="p-6">
          {loading ? (
            <div className="flex justify-center py-8">
              <RefreshCw className="w-6 h-6 animate-spin text-gray-400" />
            </div>
          ) : filteredTherapies.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <Calendar className="w-12 h-12 mx-auto mb-4 text-gray-300" />
              <p>No therapy sessions found</p>
            </div>
          ) : (
            <div className="space-y-4">
              {filteredTherapies.map((therapy) => (
                <div key={therapy._id} className="border rounded-lg p-4 hover:bg-gray-50">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      <div className="p-2 bg-gray-100 rounded-lg">
                        <Calendar className="w-5 h-5 text-gray-600" />
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center space-x-2 mb-1">
                          <span className="font-medium text-gray-900">Session {therapy.sessionId}</span>
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(therapy.status)}`}>
                            {therapy.status}
                          </span>
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${getPriorityColor(therapy.priority)}`}>
                            Priority {therapy.priority}
                          </span>
                        </div>
                        <div className="flex items-center space-x-4 text-sm text-gray-600">
                          <div className="flex items-center space-x-1">
                            <Clock className="w-4 h-4" />
                            <span>{formatTime(therapy.timeSlot)}</span>
                          </div>
                          <div className="flex items-center space-x-1">
                            <User className="w-4 h-4" />
                            <span>Practitioner: {therapy.practitionerId}</span>
                          </div>
                        </div>
                        {therapy.reason && (
                          <p className="text-sm text-red-600 mt-1">Reason: {therapy.reason}</p>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      {therapy.status === 'scheduled' && (
                        <button className="px-3 py-1 text-sm bg-red-100 text-red-800 rounded-lg hover:bg-red-200">
                          Cancel
                        </button>
                      )}
                      {therapy.status === 'waiting' && (
                        <button className="px-3 py-1 text-sm bg-blue-100 text-blue-800 rounded-lg hover:bg-blue-200">
                          Reschedule
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Booking Modal */}
      {showBookingModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Book New Therapy Session</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Select Time Slot</label>
                <input
                  type="datetime-local"
                  value={selectedSlot}
                  onChange={(e) => setSelectedSlot(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                />
              </div>
              <div className="text-sm text-gray-600">
                <p>• Sessions are scheduled based on availability</p>
                <p>• You'll be notified of any changes</p>
                <p>• Priority is set to Medium by default</p>
              </div>
            </div>
            <div className="flex justify-end space-x-3 pt-4">
              <button
                onClick={() => setShowBookingModal(false)}
                className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200"
              >
                Cancel
              </button>
              <button
                onClick={() => handleBookTherapy({ timeSlot: selectedSlot, practitionerId: 'default-practitioner' })}
                disabled={!selectedSlot}
                className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50"
              >
                Book Session
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TherapyBooking;

import React, { useState, useEffect } from 'react';
import { 
  Calendar, 
  Clock, 
  User, 
  Heart, 
  CheckCircle, 
  XCircle,
  AlertCircle,
  FileText,
  Star,
  MessageSquare,
  Filter,
  Search
} from 'lucide-react';
import api from '../../utils/api';


const AppointmentHistory = () => {
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [selectedAppointment, setSelectedAppointment] = useState(null);
  const [showAppointmentDetails, setShowAppointmentDetails] = useState(false);
  const [showReviewModal, setShowReviewModal] = useState(false);
  const [reviewData, setReviewData] = useState({
    rating: 5,
    comment: '',
    aspects: {
      treatment: 5,
      communication: 5,
      facility: 5,
      overall: 5
    },
    isAnonymous: false
  });

  useEffect(() => {
    fetchAppointments();
  }, [statusFilter]);

  const fetchAppointments = async () => {
    try {
      const params = new URLSearchParams();
      if (statusFilter !== 'all') {
        params.append('status', statusFilter);
      }

      const response = await api.get(`/patient/appointments?${params}`);
      setAppointments(response.data);
    } catch (error) {
      console.error('Error fetching appointments:', error);
      
    } finally {
      setLoading(false);
    }
  };

  const fetchAppointmentDetails = async (appointmentId) => {
    try {
      const response = await api.get(`/patient/appointments/${appointmentId}`);
      setSelectedAppointment(response.data);
      setShowAppointmentDetails(true);
    } catch (error) {
      console.error('Error fetching appointment details:', error);
      
    }
  };

  const submitReview = async () => {
    try {
      await api.post('/patient/reviews', {
        ...reviewData,
        appointmentId: selectedAppointment._id,
        practitionerId: selectedAppointment.practitionerId._id
      });
      
      setShowReviewModal(false);
      setShowAppointmentDetails(false);
      fetchAppointments();
    } catch (error) {
      console.error('Error submitting review:', error);
      
    }
  };

  const cancelAppointment = async (appointmentId) => {
    if (window.confirm('Are you sure you want to cancel this appointment?')) {
      try {
        await api.put(`/patient/appointments/${appointmentId}/cancel`);
        
        fetchAppointments();
      } catch (error) {
        console.error('Error cancelling appointment:', error);
        
      }
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

  const isUpcoming = (date) => {
    return new Date(date) > new Date();
  };

  const canCancel = (appointment) => {
    return ['scheduled', 'confirmed'].includes(appointment.status) && isUpcoming(appointment.appointmentDate);
  };

  const canReview = (appointment) => {
    return appointment.status === 'completed' && !appointment.hasReview;
  };

  const filteredAppointments = appointments.filter(appointment =>
    appointment.practitionerId?.userId?.firstName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    appointment.practitionerId?.userId?.lastName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    appointment.type?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    appointment.therapyPlanId?.title?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const renderStars = (rating, onRatingChange = null, size = 'h-5 w-5') => {
    return (
      <div className="flex items-center">
        {[...Array(5)].map((_, i) => (
          <Star
            key={i}
            className={`${size} cursor-pointer ${
              i < rating ? 'text-yellow-400 fill-current' : 'text-gray-300'
            }`}
            onClick={() => onRatingChange && onRatingChange(i + 1)}
          />
        ))}
      </div>
    );
  };

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
          <h1 className="text-2xl font-bold text-gray-900">Appointment History</h1>
          <p className="text-gray-600">View your past and upcoming therapy sessions</p>
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
                placeholder="Search appointments by practitioner, type, or therapy plan..."
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
            <option value="completed">Completed</option>
            <option value="cancelled">Cancelled</option>
          </select>
        </div>
      </div>

      {/* Appointments List */}
      <div className="space-y-4">
        {filteredAppointments.length > 0 ? (
          filteredAppointments.map((appointment) => (
            <div key={appointment._id} className="bg-white rounded-lg shadow p-6">
              <div className="flex items-start justify-between">
                <div className="flex items-start space-x-4">
                  <div className="flex-shrink-0">
                    <div className="w-12 h-12 bg-gradient-to-r from-green-400 to-blue-500 rounded-full flex items-center justify-center text-white font-semibold">
                      {appointment.practitionerId?.userId?.firstName?.charAt(0)}
                      {appointment.practitionerId?.userId?.lastName?.charAt(0)}
                    </div>
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center space-x-3 mb-2">
                      <h3 className="text-lg font-semibold text-gray-900">
                        Dr. {appointment.practitionerId?.userId?.firstName} {appointment.practitionerId?.userId?.lastName}
                      </h3>
                      <span className={`inline-flex items-center px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(appointment.status)}`}>
                        {getStatusIcon(appointment.status)}
                        <span className="ml-1">{appointment.status}</span>
                      </span>
                      {isUpcoming(appointment.appointmentDate) && (
                        <span className="px-2 py-1 text-xs font-semibold bg-blue-100 text-blue-700 rounded-full">
                          Upcoming
                        </span>
                      )}
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm text-gray-600 mb-3">
                      <div className="flex items-center">
                        <Calendar className="h-4 w-4 mr-2" />
                        {new Date(appointment.appointmentDate).toLocaleDateString()}
                      </div>
                      <div className="flex items-center">
                        <Clock className="h-4 w-4 mr-2" />
                        {appointment.startTime} - {appointment.endTime}
                      </div>
                      <div className="flex items-center">
                        <Heart className="h-4 w-4 mr-2" />
                        {appointment.type}
                      </div>
                    </div>

                    {appointment.therapyPlanId && (
                      <div className="text-sm text-gray-600 mb-2">
                        <span className="font-medium">Therapy Plan:</span> {appointment.therapyPlanId.title}
                      </div>
                    )}

                    {appointment.notes && (
                      <div className="text-sm text-gray-700 bg-gray-50 rounded p-2 mb-3">
                        <span className="font-medium">Notes:</span> {appointment.notes}
                      </div>
                    )}

                    <div className="text-sm font-medium text-gray-900">
                      Fee: ₹{appointment.fee} • Payment: {appointment.paymentStatus}
                    </div>
                  </div>
                </div>
                
                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => fetchAppointmentDetails(appointment._id)}
                    className="p-2 text-blue-600 hover:bg-blue-100 rounded-md"
                    title="View Details"
                  >
                    <FileText className="h-4 w-4" />
                  </button>
                  
                  {canReview(appointment) && (
                    <button
                      onClick={() => {
                        setSelectedAppointment(appointment);
                        setShowReviewModal(true);
                      }}
                      className="p-2 text-yellow-600 hover:bg-yellow-100 rounded-md"
                      title="Leave Review"
                    >
                      <Star className="h-4 w-4" />
                    </button>
                  )}
                  
                  {canCancel(appointment) && (
                    <button
                      onClick={() => cancelAppointment(appointment._id)}
                      className="p-2 text-red-600 hover:bg-red-100 rounded-md"
                      title="Cancel Appointment"
                    >
                      <XCircle className="h-4 w-4" />
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))
        ) : (
          <div className="text-center py-8">
            <Calendar className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-500">No appointments found</p>
          </div>
        )}
      </div>

      {/* Appointment Details Modal */}
      {showAppointmentDetails && selectedAppointment && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 overflow-y-auto">
          <div className="bg-white rounded-lg p-6 w-full max-w-3xl max-h-screen overflow-y-auto m-4">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-semibold text-gray-900">Appointment Details</h3>
              <button
                onClick={() => setShowAppointmentDetails(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                ×
              </button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Appointment Info */}
              <div className="space-y-4">
                <div className="bg-gray-50 rounded-lg p-4">
                  <h4 className="font-medium text-gray-900 mb-3">Appointment Information</h4>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">Date:</span>
                      <span className="text-sm font-medium">
                        {new Date(selectedAppointment.appointmentDate).toLocaleDateString()}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">Time:</span>
                      <span className="text-sm font-medium">
                        {selectedAppointment.startTime} - {selectedAppointment.endTime}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">Duration:</span>
                      <span className="text-sm font-medium">{selectedAppointment.duration} minutes</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">Type:</span>
                      <span className="text-sm font-medium">{selectedAppointment.type}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">Status:</span>
                      <span className={`inline-flex items-center px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(selectedAppointment.status)}`}>
                        {getStatusIcon(selectedAppointment.status)}
                        <span className="ml-1">{selectedAppointment.status}</span>
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">Fee:</span>
                      <span className="text-sm font-medium">₹{selectedAppointment.fee}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">Payment:</span>
                      <span className="text-sm font-medium">{selectedAppointment.paymentStatus}</span>
                    </div>
                  </div>
                </div>

                {/* Practitioner Info */}
                <div className="bg-gray-50 rounded-lg p-4">
                  <h4 className="font-medium text-gray-900 mb-3">Practitioner</h4>
                  <div className="flex items-center">
                    <div className="w-10 h-10 bg-gradient-to-r from-green-400 to-blue-500 rounded-full flex items-center justify-center text-white font-semibold">
                      {selectedAppointment.practitionerId?.userId?.firstName?.charAt(0)}
                      {selectedAppointment.practitionerId?.userId?.lastName?.charAt(0)}
                    </div>
                    <div className="ml-3">
                      <p className="font-medium text-gray-900">
                        Dr. {selectedAppointment.practitionerId?.userId?.firstName} {selectedAppointment.practitionerId?.userId?.lastName}
                      </p>
                      <p className="text-sm text-gray-600">
                        {selectedAppointment.practitionerId?.specializations?.[0]}
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Session Details */}
              <div className="space-y-4">
                {selectedAppointment.symptoms?.length > 0 && (
                  <div className="bg-gray-50 rounded-lg p-4">
                    <h4 className="font-medium text-gray-900 mb-3">Symptoms Discussed</h4>
                    <div className="space-y-1">
                      {selectedAppointment.symptoms.map((symptom, index) => (
                        <div key={index} className="text-sm text-gray-700 bg-white px-2 py-1 rounded">
                          {symptom}
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {selectedAppointment.diagnosis && (
                  <div className="bg-gray-50 rounded-lg p-4">
                    <h4 className="font-medium text-gray-900 mb-3">Diagnosis</h4>
                    <p className="text-sm text-gray-700">{selectedAppointment.diagnosis}</p>
                  </div>
                )}

                {selectedAppointment.treatment && (
                  <div className="bg-gray-50 rounded-lg p-4">
                    <h4 className="font-medium text-gray-900 mb-3">Treatment Given</h4>
                    <p className="text-sm text-gray-700">{selectedAppointment.treatment}</p>
                  </div>
                )}

                {selectedAppointment.prescription?.length > 0 && (
                  <div className="bg-gray-50 rounded-lg p-4">
                    <h4 className="font-medium text-gray-900 mb-3">Prescription</h4>
                    <div className="space-y-2">
                      {selectedAppointment.prescription.map((med, index) => (
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

                {selectedAppointment.nextAppointment && (
                  <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                    <h4 className="font-medium text-green-900 mb-2">Next Appointment</h4>
                    <p className="text-sm text-green-700">
                      {new Date(selectedAppointment.nextAppointment).toLocaleDateString()}
                    </p>
                  </div>
                )}
              </div>
            </div>

            <div className="flex justify-end space-x-3 mt-6">
              <button
                onClick={() => setShowAppointmentDetails(false)}
                className="px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50"
              >
                Close
              </button>
              {canReview(selectedAppointment) && (
                <button
                  onClick={() => setShowReviewModal(true)}
                  className="px-4 py-2 bg-yellow-600 text-white rounded-md hover:bg-yellow-700"
                >
                  Leave Review
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Review Modal */}
      {showReviewModal && selectedAppointment && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 overflow-y-auto">
          <div className="bg-white rounded-lg p-6 w-full max-w-2xl max-h-screen overflow-y-auto m-4">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-semibold text-gray-900">Leave a Review</h3>
              <button
                onClick={() => setShowReviewModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                ×
              </button>
            </div>

            <div className="space-y-6">
              {/* Overall Rating */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Overall Rating</label>
                {renderStars(reviewData.rating, (rating) => setReviewData(prev => ({ ...prev, rating })), 'h-6 w-6')}
              </div>

              {/* Aspect Ratings */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">Rate Different Aspects</label>
                <div className="space-y-3">
                  {Object.entries(reviewData.aspects).map(([aspect, rating]) => (
                    <div key={aspect} className="flex items-center justify-between">
                      <span className="text-sm text-gray-700 capitalize">{aspect}</span>
                      {renderStars(rating, (newRating) => 
                        setReviewData(prev => ({
                          ...prev,
                          aspects: { ...prev.aspects, [aspect]: newRating }
                        }))
                      )}
                    </div>
                  ))}
                </div>
              </div>

              {/* Comment */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Your Review</label>
                <textarea
                  value={reviewData.comment}
                  onChange={(e) => setReviewData(prev => ({ ...prev, comment: e.target.value }))}
                  rows={4}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                  placeholder="Share your experience with this practitioner..."
                />
              </div>

              {/* Anonymous Option */}
              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="anonymous"
                  checked={reviewData.isAnonymous}
                  onChange={(e) => setReviewData(prev => ({ ...prev, isAnonymous: e.target.checked }))}
                  className="h-4 w-4 text-green-600 focus:ring-green-500 border-gray-300 rounded"
                />
                <label htmlFor="anonymous" className="ml-2 text-sm text-gray-700">
                  Submit anonymously
                </label>
              </div>
            </div>

            <div className="flex justify-end space-x-3 mt-6">
              <button
                onClick={() => setShowReviewModal(false)}
                className="px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={submitReview}
                className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700"
              >
                Submit Review
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AppointmentHistory;

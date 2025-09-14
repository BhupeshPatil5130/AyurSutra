import React, { useState, useEffect } from 'react';
import { 
  Calendar, Clock, User, MapPin, Search, Filter, Plus,
  ChevronLeft, ChevronRight, CheckCircle, X, Star,
  Phone, Video, MessageSquare, CreditCard, AlertCircle,
  RefreshCw, Download, Eye, Edit, Trash2, Stethoscope
} from 'lucide-react';
import api from '../../utils/api';
import { getAppointments, getPractitioners } from '../../services/mockPatientData';


const PatientAppointmentBooking = () => {
  const [appointments, setAppointments] = useState([]);
  const [practitioners, setPractitioners] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showBookingModal, setShowBookingModal] = useState(false);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [viewMode, setViewMode] = useState('upcoming');
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [selectedPractitioner, setSelectedPractitioner] = useState(null);
  const [availableSlots, setAvailableSlots] = useState([]);
  const [usingMockData, setUsingMockData] = useState(false);
  const [bookingData, setBookingData] = useState({
    practitionerId: '',
    date: '',
    timeSlot: '',
    type: 'consultation',
    symptoms: '',
    notes: '',
    preferredMode: 'in-person'
  });

  const appointmentTypes = [
    { value: 'consultation', label: 'Initial Consultation', duration: 60, fee: 2500, icon: Stethoscope, color: 'blue' },
    { value: 'follow-up', label: 'Follow-up', duration: 30, fee: 1500, icon: RefreshCw, color: 'green' },
    { value: 'therapy', label: 'Therapy Session', duration: 90, fee: 3000, icon: User, color: 'purple' },
    { value: 'emergency', label: 'Emergency Consultation', duration: 45, fee: 3500, icon: AlertCircle, color: 'red' }
  ];

  const viewModes = [
    { value: 'upcoming', label: 'Upcoming', icon: Calendar, count: appointments.filter(a => ['scheduled', 'confirmed'].includes(a.status) && new Date(a.date) >= new Date()).length },
    { value: 'past', label: 'Past', icon: Clock, count: appointments.filter(a => new Date(a.date) < new Date()).length },
    { value: 'cancelled', label: 'Cancelled', icon: X, count: appointments.filter(a => a.status === 'cancelled').length },
    { value: 'all', label: 'All Appointments', icon: Calendar, count: appointments.length }
  ];

  useEffect(() => {
    fetchAppointments();
    fetchPractitioners();
  }, [viewMode, filterStatus]);

  const fetchAppointments = async () => {
    try {
      setLoading(true);
      setUsingMockData(false);
      const response = await api.get(`/patient/appointments?type=${viewMode}&status=${filterStatus}`);
      setAppointments(response.data.appointments || []);
    } catch (error) {
      console.error('Error fetching appointments:', error);
      // Use mock data as fallback
      const mockAppointments = getAppointments({ type: viewMode, status: filterStatus });
      setAppointments(mockAppointments);
      setUsingMockData(true);
      
    } finally {
      setLoading(false);
    }
  };

  const fetchPractitioners = async () => {
    try {
      const response = await api.get('/patient/practitioners');
      setPractitioners(response.data.practitioners || []);
    } catch (error) {
      console.error('Error fetching practitioners:', error);
      // Use mock data as fallback
      const mockPractitioners = getPractitioners();
      setPractitioners(mockPractitioners);
    }
  };


  const fetchAvailableSlots = async (practitionerId, date) => {
    try {
      const response = await api.get(`/patient/practitioners/${practitionerId}/slots?date=${date}`);
      setAvailableSlots(Array.isArray(response.data) ? response.data : []);
    } catch (error) {
      console.error('Error fetching slots:', error);
      // Generate mock slots as fallback
      const mockSlots = [
        { time: '09:00', available: true, duration: 60 },
        { time: '10:00', available: true, duration: 60 },
        { time: '11:00', available: false, duration: 60 },
        { time: '14:00', available: true, duration: 60 },
        { time: '15:00', available: true, duration: 60 },
        { time: '16:00', available: true, duration: 60 }
      ];
      setAvailableSlots(mockSlots);
      
    }
  };

  const bookAppointment = async () => {
    try {
      const selectedType = appointmentTypes.find(type => type.value === bookingData.type);
      const appointmentPayload = {
        ...bookingData,
        duration: selectedType.duration,
        fee: selectedType.fee,
        status: 'pending'
      };

      const response = await api.post('/patient/appointments', appointmentPayload);
      setAppointments(prev => [response.data, ...prev]);
      setShowBookingModal(false);
      setBookingData({
        practitionerId: '',
        date: '',
        timeSlot: '',
        type: 'consultation',
        symptoms: '',
        notes: '',
        preferredMode: 'in-person'
      });
      
    } catch (error) {
      console.error('Error booking appointment:', error);
      
    }
  };

  const cancelAppointment = async (appointmentId) => {
    if (!window.confirm('Are you sure you want to cancel this appointment?')) return;

    try {
      await api.patch(`/patient/appointments/${appointmentId}/cancel`);
      setAppointments(prev => 
        prev.map(apt => 
          apt._id === appointmentId 
            ? { ...apt, status: 'cancelled' }
            : apt
        )
      );
      
    } catch (error) {
      console.error('Error cancelling appointment:', error);
      
    }
  };

  const rescheduleAppointment = async (appointmentId, newDate, newTime) => {
    try {
      await api.patch(`/patient/appointments/${appointmentId}/reschedule`, {
        date: newDate,
        timeSlot: newTime
      });
      fetchAppointments();
      
    } catch (error) {
      console.error('Error rescheduling appointment:', error);
      
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'confirmed':
        return 'bg-green-100 text-green-800';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'cancelled':
        return 'bg-red-100 text-red-800';
      case 'completed':
        return 'bg-blue-100 text-blue-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const filteredAppointments = appointments.filter(appointment =>
    appointment.practitioner?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    appointment.type?.toLowerCase().includes(searchTerm.toLowerCase())
  );

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
          <h1 className="text-3xl font-bold text-gray-900">My Appointments</h1>
          <p className="text-gray-600">Book and manage your appointments</p>
        </div>
        <div className="flex items-center space-x-3">
          <button
            onClick={fetchAppointments}
            className="flex items-center px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700"
          >
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </button>
          <button
            onClick={() => setShowBookingModal(true)}
            className="flex items-center px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700"
          >
            <Plus className="h-4 w-4 mr-2" />
            Book Appointment
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg shadow p-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search appointments..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
            />
          </div>
          
          <select
            value={viewMode}
            onChange={(e) => setViewMode(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
          >
            {viewModes.map((mode) => (
              <option key={mode.value} value={mode.value}>{mode.label}</option>
            ))}
          </select>
          
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
          >
            <option value="all">All Types</option>
            <option value="consultation">Consultation</option>
            <option value="follow-up">Follow-up</option>
            <option value="therapy">Therapy</option>
            <option value="emergency">Emergency</option>
          </select>
          
          <button className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700">
            <Download className="h-4 w-4 mr-2" />
            Export
          </button>
        </div>
      </div>

      {/* Appointments List */}
      <div className="bg-white rounded-lg shadow">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900">
            {viewMode.charAt(0).toUpperCase() + viewMode.slice(1)} Appointments ({filteredAppointments.length})
          </h3>
        </div>
        
        <div className="divide-y divide-gray-200">
          {filteredAppointments.length > 0 ? (
            filteredAppointments.map((appointment) => (
              <div key={appointment._id} className="p-6 hover:bg-gray-50">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <div className="flex-shrink-0">
                      <div className="w-12 h-12 bg-gradient-to-r from-blue-400 to-purple-500 rounded-full flex items-center justify-center text-white font-semibold">
                        {appointment.practitioner?.name?.charAt(0) || 'P'}
                      </div>
                    </div>
                    
                    <div className="flex-1">
                      <div className="flex items-center space-x-3">
                        <h4 className="text-lg font-medium text-gray-900">
                          {appointment.practitioner?.name || 'Unknown Practitioner'}
                        </h4>
                        <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(appointment.status)}`}>
                          {appointment.status}
                        </span>
                      </div>
                      
                      <div className="mt-1 flex items-center space-x-4 text-sm text-gray-600">
                        <div className="flex items-center">
                          <Calendar className="h-4 w-4 mr-1" />
                          {new Date(appointment.date).toLocaleDateString()}
                        </div>
                        <div className="flex items-center">
                          <Clock className="h-4 w-4 mr-1" />
                          {appointment.timeSlot}
                        </div>
                        <div className="flex items-center">
                          <User className="h-4 w-4 mr-1" />
                          {appointment.type}
                        </div>
                        <div className="flex items-center">
                          <CreditCard className="h-4 w-4 mr-1" />
                          ₹{appointment.fee}
                        </div>
                      </div>
                      
                      <div className="mt-2 flex items-center space-x-4">
                        <div className="flex items-center text-sm text-gray-500">
                          <MapPin className="h-4 w-4 mr-1" />
                          {appointment.mode === 'video' ? 'Video Call' : 
                           appointment.mode === 'phone' ? 'Phone Call' : 'In-Person'}
                        </div>
                        {appointment.practitioner?.rating && (
                          <div className="flex items-center text-sm text-gray-500">
                            <Star className="h-4 w-4 mr-1 text-yellow-400 fill-current" />
                            {appointment.practitioner.rating}
                          </div>
                        )}
                      </div>
                      
                      {appointment.symptoms && (
                        <div className="mt-2 text-sm text-gray-600">
                          <span className="font-medium">Symptoms:</span> {appointment.symptoms}
                        </div>
                      )}
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    {appointment.status === 'confirmed' && new Date(appointment.date) > new Date() && (
                      <>
                        {appointment.mode === 'video' && (
                          <button className="p-2 text-blue-600 hover:bg-blue-100 rounded-full" title="Join Video Call">
                            <Video className="h-5 w-5" />
                          </button>
                        )}
                        {appointment.mode === 'phone' && (
                          <button className="p-2 text-green-600 hover:bg-green-100 rounded-full" title="Call">
                            <Phone className="h-5 w-5" />
                          </button>
                        )}
                        <button className="p-2 text-purple-600 hover:bg-purple-100 rounded-full" title="Message">
                          <MessageSquare className="h-5 w-5" />
                        </button>
                      </>
                    )}
                    
                    <button className="p-2 text-gray-600 hover:bg-gray-100 rounded-full" title="View Details">
                      <Eye className="h-5 w-5" />
                    </button>
                    
                    {(appointment.status === 'pending' || appointment.status === 'confirmed') && 
                     new Date(appointment.date) > new Date() && (
                      <>
                        <button className="p-2 text-blue-600 hover:bg-blue-100 rounded-full" title="Reschedule">
                          <Edit className="h-5 w-5" />
                        </button>
                        <button
                          onClick={() => cancelAppointment(appointment._id)}
                          className="p-2 text-red-600 hover:bg-red-100 rounded-full"
                          title="Cancel"
                        >
                          <Trash2 className="h-5 w-5" />
                        </button>
                      </>
                    )}
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="p-12 text-center">
              <Calendar className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No appointments found</h3>
              <p className="text-gray-500 mb-4">
                {viewMode === 'upcoming' ? "You don't have any upcoming appointments." : 
                 `No ${viewMode} appointments to display.`}
              </p>
              <button
                onClick={() => setShowBookingModal(true)}
                className="inline-flex items-center px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700"
              >
                <Plus className="h-4 w-4 mr-2" />
                Book Your First Appointment
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Booking Modal */}
      {showBookingModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-2xl max-h-screen overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-semibold text-gray-900">Book New Appointment</h3>
              <button
                onClick={() => setShowBookingModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="h-6 w-6" />
              </button>
            </div>
            
            <div className="space-y-6">
              {/* Practitioner Selection */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Select Practitioner
                </label>
                <select
                  value={bookingData.practitionerId}
                  onChange={(e) => {
                    setBookingData(prev => ({ ...prev, practitionerId: e.target.value }));
                    if (e.target.value && bookingData.date) {
                      fetchAvailableSlots(e.target.value, bookingData.date);
                    }
                  }}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                  required
                >
                  <option value="">Choose a practitioner</option>
                  {practitioners.map((practitioner) => (
                    <option key={practitioner._id} value={practitioner._id}>
                      {practitioner.name} - {practitioner.specialization}
                    </option>
                  ))}
                </select>
              </div>

              {/* Appointment Type */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Appointment Type
                </label>
                <select
                  value={bookingData.type}
                  onChange={(e) => setBookingData(prev => ({ ...prev, type: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                >
                  {appointmentTypes.map((type) => (
                    <option key={type.value} value={type.value}>
                      {type.label} ({type.duration} min) - ₹{type.fee}
                    </option>
                  ))}
                </select>
              </div>

              {/* Date Selection */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Preferred Date
                </label>
                <input
                  type="date"
                  value={bookingData.date}
                  min={new Date().toISOString().split('T')[0]}
                  onChange={(e) => {
                    setBookingData(prev => ({ ...prev, date: e.target.value }));
                    if (bookingData.practitionerId && e.target.value) {
                      fetchAvailableSlots(bookingData.practitionerId, e.target.value);
                    }
                  }}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                  required
                />
              </div>

              {/* Time Slot Selection */}
              {availableSlots.length > 0 && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Available Time Slots
                  </label>
                  <div className="grid grid-cols-3 gap-2">
                    {availableSlots.map((slot) => (
                      <button
                        key={slot.time}
                        onClick={() => setBookingData(prev => ({ ...prev, timeSlot: slot.time }))}
                        className={`p-2 text-sm border rounded-md ${
                          bookingData.timeSlot === slot.time
                            ? 'bg-green-600 text-white border-green-600'
                            : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
                        }`}
                      >
                        {slot.time}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Preferred Mode */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Consultation Mode
                </label>
                <div className="grid grid-cols-3 gap-4">
                  {[
                    { value: 'in-person', label: 'In-Person', icon: User },
                    { value: 'video', label: 'Video Call', icon: Video },
                    { value: 'phone', label: 'Phone Call', icon: Phone }
                  ].map((mode) => (
                    <button
                      key={mode.value}
                      onClick={() => setBookingData(prev => ({ ...prev, preferredMode: mode.value }))}
                      className={`flex flex-col items-center p-4 border rounded-lg ${
                        bookingData.preferredMode === mode.value
                          ? 'bg-green-50 border-green-500 text-green-700'
                          : 'bg-white border-gray-300 text-gray-700 hover:bg-gray-50'
                      }`}
                    >
                      <mode.icon className="h-6 w-6 mb-2" />
                      <span className="text-sm font-medium">{mode.label}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Symptoms */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Symptoms/Concerns
                </label>
                <textarea
                  value={bookingData.symptoms}
                  onChange={(e) => setBookingData(prev => ({ ...prev, symptoms: e.target.value }))}
                  rows={3}
                  placeholder="Describe your symptoms or health concerns..."
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                />
              </div>

              {/* Additional Notes */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Additional Notes
                </label>
                <textarea
                  value={bookingData.notes}
                  onChange={(e) => setBookingData(prev => ({ ...prev, notes: e.target.value }))}
                  rows={2}
                  placeholder="Any additional information for the practitioner..."
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                />
              </div>

              {/* Booking Summary */}
              {bookingData.practitionerId && bookingData.type && (
                <div className="bg-gray-50 p-4 rounded-lg">
                  <h4 className="font-medium text-gray-900 mb-2">Booking Summary</h4>
                  <div className="space-y-1 text-sm text-gray-600">
                    <p><span className="font-medium">Practitioner:</span> {practitioners.find(p => p._id === bookingData.practitionerId)?.name}</p>
                    <p><span className="font-medium">Type:</span> {appointmentTypes.find(t => t.value === bookingData.type)?.label}</p>
                    <p><span className="font-medium">Duration:</span> {appointmentTypes.find(t => t.value === bookingData.type)?.duration} minutes</p>
                    <p><span className="font-medium">Fee:</span> ₹{appointmentTypes.find(t => t.value === bookingData.type)?.fee}</p>
                    {bookingData.date && <p><span className="font-medium">Date:</span> {new Date(bookingData.date).toLocaleDateString()}</p>}
                    {bookingData.timeSlot && <p><span className="font-medium">Time:</span> {bookingData.timeSlot}</p>}
                  </div>
                </div>
              )}
            </div>

            <div className="flex items-center justify-end space-x-3 mt-6">
              <button
                onClick={() => setShowBookingModal(false)}
                className="px-4 py-2 bg-gray-300 text-gray-700 rounded-md hover:bg-gray-400"
              >
                Cancel
              </button>
              <button
                onClick={bookAppointment}
                disabled={!bookingData.practitionerId || !bookingData.date || !bookingData.timeSlot}
                className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Book Appointment
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PatientAppointmentBooking;

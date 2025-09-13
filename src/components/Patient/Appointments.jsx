import React, { useState, useEffect } from 'react';
import { 
  Calendar, 
  Clock, 
  Plus, 
  Search, 
  Filter,
  MapPin,
  User,
  Phone,
  Mail,
  CheckCircle,
  XCircle,
  AlertCircle,
  Edit,
  Trash2
} from 'lucide-react';

const Appointments = () => {
  const [appointments, setAppointments] = useState([]);
  const [practitioners, setPractitioners] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showBookingModal, setShowBookingModal] = useState(false);
  const [selectedAppointment, setSelectedAppointment] = useState(null);
  const [filters, setFilters] = useState({
    status: 'all',
    dateRange: 'upcoming',
    practitioner: 'all'
  });

  const [bookingForm, setBookingForm] = useState({
    practitionerId: '',
    appointmentDate: '',
    startTime: '',
    type: 'consultation',
    notes: ''
  });

  useEffect(() => {
    fetchAppointments();
    fetchPractitioners();
  }, [filters]);

  const fetchAppointments = async () => {
    try {
      const token = localStorage.getItem('token');
      const queryParams = new URLSearchParams();
      
      if (filters.status !== 'all') queryParams.append('status', filters.status);
      if (filters.practitioner !== 'all') queryParams.append('practitionerId', filters.practitioner);
      
      const response = await fetch(`/api/patient/appointments?${queryParams}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await response.json();
      setAppointments(data.appointments || []);
    } catch (error) {
      console.error('Error fetching appointments:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchPractitioners = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('/api/patient/practitioners', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await response.json();
      setPractitioners(data.practitioners || []);
    } catch (error) {
      console.error('Error fetching practitioners:', error);
    }
  };

  const handleBookAppointment = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('/api/patient/appointments', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(bookingForm)
      });

      if (response.ok) {
        setShowBookingModal(false);
        setBookingForm({
          practitionerId: '',
          appointmentDate: '',
          startTime: '',
          type: 'consultation',
          notes: ''
        });
        fetchAppointments();
      }
    } catch (error) {
      console.error('Error booking appointment:', error);
    }
  };

  const handleCancelAppointment = async (appointmentId) => {
    if (!window.confirm('Are you sure you want to cancel this appointment?')) return;
    
    try {
      const token = localStorage.getItem('token');
      await fetch(`/api/patient/appointments/${appointmentId}/cancel`, {
        method: 'PUT',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      fetchAppointments();
    } catch (error) {
      console.error('Error cancelling appointment:', error);
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'confirmed':
        return <CheckCircle className="h-5 w-5 text-green-500" />;
      case 'pending':
        return <AlertCircle className="h-5 w-5 text-yellow-500" />;
      case 'cancelled':
        return <XCircle className="h-5 w-5 text-red-500" />;
      case 'completed':
        return <CheckCircle className="h-5 w-5 text-blue-500" />;
      default:
        return <Clock className="h-5 w-5 text-gray-500" />;
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

  const AppointmentCard = ({ appointment }) => (
    <div className="bg-white rounded-lg border border-gray-200 p-6 hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center space-x-3">
          <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
            <User className="h-6 w-6 text-green-600" />
          </div>
          <div>
            <h3 className="font-semibold text-gray-900">
              Dr. {appointment.practitioner?.firstName} {appointment.practitioner?.lastName}
            </h3>
            <p className="text-sm text-gray-600">{appointment.practitioner?.specializations?.join(', ')}</p>
          </div>
        </div>
        <div className="flex items-center space-x-2">
          {getStatusIcon(appointment.status)}
          <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(appointment.status)}`}>
            {appointment.status}
          </span>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4 mb-4">
        <div className="flex items-center text-sm text-gray-600">
          <Calendar className="h-4 w-4 mr-2" />
          {new Date(appointment.appointmentDate).toLocaleDateString()}
        </div>
        <div className="flex items-center text-sm text-gray-600">
          <Clock className="h-4 w-4 mr-2" />
          {appointment.startTime} - {appointment.endTime}
        </div>
        <div className="flex items-center text-sm text-gray-600">
          <MapPin className="h-4 w-4 mr-2" />
          {appointment.type}
        </div>
        <div className="flex items-center text-sm text-gray-600">
          <Phone className="h-4 w-4 mr-2" />
          ₹{appointment.fee}
        </div>
      </div>

      {appointment.notes && (
        <div className="mb-4">
          <p className="text-sm text-gray-600">
            <strong>Notes:</strong> {appointment.notes}
          </p>
        </div>
      )}

      <div className="flex items-center justify-between pt-4 border-t border-gray-100">
        <div className="flex items-center space-x-2">
          <Phone className="h-4 w-4 text-gray-400" />
          <span className="text-sm text-gray-600">{appointment.practitioner?.phone}</span>
        </div>
        <div className="flex items-center space-x-2">
          {appointment.status === 'pending' && (
            <button
              onClick={() => handleCancelAppointment(appointment._id)}
              className="text-red-600 hover:text-red-700 text-sm font-medium"
            >
              Cancel
            </button>
          )}
          <button
            onClick={() => setSelectedAppointment(appointment)}
            className="text-green-600 hover:text-green-700 text-sm font-medium"
          >
            View Details
          </button>
        </div>
      </div>
    </div>
  );

  const BookingModal = () => (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4">
        <h2 className="text-xl font-semibold mb-4">Book New Appointment</h2>
        
        <form onSubmit={handleBookAppointment} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Select Practitioner
            </label>
            <select
              value={bookingForm.practitionerId}
              onChange={(e) => setBookingForm({...bookingForm, practitionerId: e.target.value})}
              className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-500"
              required
            >
              <option value="">Choose a practitioner</option>
              {practitioners.map(practitioner => (
                <option key={practitioner._id} value={practitioner._id}>
                  Dr. {practitioner.firstName} {practitioner.lastName} - {practitioner.specializations?.join(', ')}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Date
            </label>
            <input
              type="date"
              value={bookingForm.appointmentDate}
              onChange={(e) => setBookingForm({...bookingForm, appointmentDate: e.target.value})}
              className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-500"
              min={new Date().toISOString().split('T')[0]}
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Time
            </label>
            <select
              value={bookingForm.startTime}
              onChange={(e) => setBookingForm({...bookingForm, startTime: e.target.value})}
              className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-500"
              required
            >
              <option value="">Select time</option>
              <option value="09:00">09:00 AM</option>
              <option value="10:00">10:00 AM</option>
              <option value="11:00">11:00 AM</option>
              <option value="14:00">02:00 PM</option>
              <option value="15:00">03:00 PM</option>
              <option value="16:00">04:00 PM</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Appointment Type
            </label>
            <select
              value={bookingForm.type}
              onChange={(e) => setBookingForm({...bookingForm, type: e.target.value})}
              className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-500"
            >
              <option value="consultation">Consultation</option>
              <option value="therapy">Therapy Session</option>
              <option value="follow-up">Follow-up</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Notes (Optional)
            </label>
            <textarea
              value={bookingForm.notes}
              onChange={(e) => setBookingForm({...bookingForm, notes: e.target.value})}
              className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-500"
              rows="3"
              placeholder="Any specific concerns or requirements..."
            />
          </div>

          <div className="flex space-x-3 pt-4">
            <button
              type="button"
              onClick={() => setShowBookingModal(false)}
              className="flex-1 px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex-1 px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700"
            >
              Book Appointment
            </button>
          </div>
        </form>
      </div>
    </div>
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Appointments</h1>
          <p className="text-gray-600">Manage your appointments and book new sessions</p>
        </div>
        <button
          onClick={() => setShowBookingModal(true)}
          className="flex items-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
        >
          <Plus className="h-5 w-5 mr-2" />
          Book Appointment
        </button>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg border border-gray-200 p-4">
        <div className="flex flex-wrap items-center gap-4">
          <div className="flex items-center space-x-2">
            <Filter className="h-5 w-5 text-gray-400" />
            <span className="text-sm font-medium text-gray-700">Filters:</span>
          </div>
          
          <select
            value={filters.status}
            onChange={(e) => setFilters({...filters, status: e.target.value})}
            className="border border-gray-300 rounded-md px-3 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
          >
            <option value="all">All Status</option>
            <option value="pending">Pending</option>
            <option value="confirmed">Confirmed</option>
            <option value="completed">Completed</option>
            <option value="cancelled">Cancelled</option>
          </select>

          <select
            value={filters.dateRange}
            onChange={(e) => setFilters({...filters, dateRange: e.target.value})}
            className="border border-gray-300 rounded-md px-3 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
          >
            <option value="upcoming">Upcoming</option>
            <option value="past">Past</option>
            <option value="all">All Dates</option>
          </select>

          <select
            value={filters.practitioner}
            onChange={(e) => setFilters({...filters, practitioner: e.target.value})}
            className="border border-gray-300 rounded-md px-3 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
          >
            <option value="all">All Practitioners</option>
            {practitioners.map(practitioner => (
              <option key={practitioner._id} value={practitioner._id}>
                Dr. {practitioner.firstName} {practitioner.lastName}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Appointments List */}
      <div className="space-y-4">
        {appointments.length > 0 ? (
          appointments.map(appointment => (
            <AppointmentCard key={appointment._id} appointment={appointment} />
          ))
        ) : (
          <div className="bg-white rounded-lg border border-gray-200 p-12 text-center">
            <Calendar className="h-16 w-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No appointments found</h3>
            <p className="text-gray-600 mb-6">Book your first appointment to get started with your wellness journey</p>
            <button
              onClick={() => setShowBookingModal(true)}
              className="inline-flex items-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
            >
              <Plus className="h-5 w-5 mr-2" />
              Book Your First Appointment
            </button>
          </div>
        )}
      </div>

      {/* Booking Modal */}
      {showBookingModal && <BookingModal />}

      {/* Appointment Details Modal */}
      {selectedAppointment && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-lg mx-4">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold">Appointment Details</h2>
              <button
                onClick={() => setSelectedAppointment(null)}
                className="text-gray-400 hover:text-gray-600"
              >
                <XCircle className="h-6 w-6" />
              </button>
            </div>
            
            <div className="space-y-4">
              <div className="flex items-center space-x-3">
                <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                  <User className="h-6 w-6 text-green-600" />
                </div>
                <div>
                  <h3 className="font-semibold">
                    Dr. {selectedAppointment.practitioner?.firstName} {selectedAppointment.practitioner?.lastName}
                  </h3>
                  <p className="text-sm text-gray-600">{selectedAppointment.practitioner?.specializations?.join(', ')}</p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 py-4 border-t border-gray-100">
                <div>
                  <p className="text-sm font-medium text-gray-700">Date</p>
                  <p className="text-sm text-gray-900">{new Date(selectedAppointment.appointmentDate).toLocaleDateString()}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-700">Time</p>
                  <p className="text-sm text-gray-900">{selectedAppointment.startTime} - {selectedAppointment.endTime}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-700">Type</p>
                  <p className="text-sm text-gray-900">{selectedAppointment.type}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-700">Fee</p>
                  <p className="text-sm text-gray-900">₹{selectedAppointment.fee}</p>
                </div>
              </div>

              {selectedAppointment.notes && (
                <div className="py-4 border-t border-gray-100">
                  <p className="text-sm font-medium text-gray-700 mb-2">Notes</p>
                  <p className="text-sm text-gray-900">{selectedAppointment.notes}</p>
                </div>
              )}

              <div className="flex items-center space-x-2 py-4 border-t border-gray-100">
                {getStatusIcon(selectedAppointment.status)}
                <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(selectedAppointment.status)}`}>
                  {selectedAppointment.status}
                </span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Appointments;

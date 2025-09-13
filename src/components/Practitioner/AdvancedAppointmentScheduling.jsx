import React, { useState, useEffect } from 'react';
import { 
  Calendar, Clock, Plus, Search, Filter, Eye, Edit, Trash2, 
  CheckCircle, X, Save, User, MapPin, Phone, Mail, 
  ChevronLeft, ChevronRight, RefreshCw, Download
} from 'lucide-react';
import api from '../../utils/api';
import toast from 'react-hot-toast';

const AdvancedAppointmentScheduling = () => {
  const [appointments, setAppointments] = useState([]);
  const [patients, setPatients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [viewMode, setViewMode] = useState('day'); // day, week, month
  const [showModal, setShowModal] = useState(false);
  const [modalType, setModalType] = useState('create');
  const [selectedAppointment, setSelectedAppointment] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [formData, setFormData] = useState({
    patientId: '',
    appointmentDate: '',
    startTime: '',
    endTime: '',
    duration: 60,
    type: 'consultation',
    notes: '',
    fee: 0
  });

  useEffect(() => {
    fetchAppointments();
    fetchPatients();
  }, [selectedDate]);

  const fetchAppointments = async () => {
    try {
      setLoading(true);
      const response = await api.get(`/practitioner/appointments?date=${selectedDate}&view=${viewMode}`);
      setAppointments(Array.isArray(response.data) ? response.data : []);
    } catch (error) {
      console.error('Error fetching appointments:', error);
      setAppointments([]);
      toast.error('Error loading appointments');
    } finally {
      setLoading(false);
    }
  };

  const fetchPatients = async () => {
    try {
      const response = await api.get('/practitioner/patients');
      setPatients(Array.isArray(response.data) ? response.data : []);
    } catch (error) {
      console.error('Error fetching patients:', error);
      setPatients([]);
    }
  };

  const handleCreateAppointment = async () => {
    try {
      await api.post('/practitioner/appointments', formData);
      toast.success('Appointment created successfully');
      setShowModal(false);
      resetForm();
      fetchAppointments();
    } catch (error) {
      console.error('Error creating appointment:', error);
      toast.error('Error creating appointment');
    }
  };

  const handleUpdateAppointment = async () => {
    try {
      await api.put(`/practitioner/appointments/${selectedAppointment._id}`, formData);
      toast.success('Appointment updated successfully');
      setShowModal(false);
      resetForm();
      fetchAppointments();
    } catch (error) {
      console.error('Error updating appointment:', error);
      toast.error('Error updating appointment');
    }
  };

  const handleDeleteAppointment = async (appointmentId) => {
    if (window.confirm('Are you sure you want to delete this appointment?')) {
      try {
        await api.delete(`/practitioner/appointments/${appointmentId}`);
        toast.success('Appointment deleted successfully');
        fetchAppointments();
      } catch (error) {
        console.error('Error deleting appointment:', error);
        toast.error('Error deleting appointment');
      }
    }
  };

  const handleStatusUpdate = async (appointmentId, status) => {
    try {
      await api.patch(`/practitioner/appointments/${appointmentId}/status`, { status });
      toast.success(`Appointment ${status} successfully`);
      fetchAppointments();
    } catch (error) {
      console.error('Error updating appointment status:', error);
      toast.error('Error updating appointment status');
    }
  };

  const openModal = (type, appointment = null) => {
    setModalType(type);
    setSelectedAppointment(appointment);
    if (appointment && type === 'edit') {
      setFormData({
        patientId: appointment.patientId?._id || '',
        appointmentDate: appointment.appointmentDate.split('T')[0],
        startTime: appointment.startTime,
        endTime: appointment.endTime,
        duration: appointment.duration,
        type: appointment.type,
        notes: appointment.notes || '',
        fee: appointment.fee
      });
    }
    setShowModal(true);
  };

  const resetForm = () => {
    setFormData({
      patientId: '',
      appointmentDate: '',
      startTime: '',
      endTime: '',
      duration: 60,
      type: 'consultation',
      notes: '',
      fee: 0
    });
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'scheduled': return 'bg-blue-100 text-blue-700';
      case 'confirmed': return 'bg-green-100 text-green-700';
      case 'in-progress': return 'bg-yellow-100 text-yellow-700';
      case 'completed': return 'bg-green-100 text-green-700';
      case 'cancelled': return 'bg-red-100 text-red-700';
      case 'no-show': return 'bg-gray-100 text-gray-700';
      default: return 'bg-gray-100 text-gray-700';
    }
  };

  const formatTime = (time) => {
    return new Date(`2000-01-01T${time}`).toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const filteredAppointments = appointments.filter(appointment => {
    const matchesSearch = 
      appointment.patientId?.firstName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      appointment.patientId?.lastName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      appointment.type?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter === 'all' || appointment.status === statusFilter;
    
    return matchesSearch && matchesStatus;
  });

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
          <h1 className="text-3xl font-bold text-gray-900">Appointment Scheduling</h1>
          <p className="text-gray-600">Manage your appointments and schedule</p>
        </div>
        <div className="flex items-center space-x-3">
          <button
            onClick={() => openModal('create')}
            className="flex items-center px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700"
          >
            <Plus className="h-4 w-4 mr-2" />
            New Appointment
          </button>
          <button
            onClick={fetchAppointments}
            className="flex items-center px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700"
          >
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </button>
        </div>
      </div>

      {/* Calendar Controls */}
      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-4">
            <input
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
            />
            <div className="flex items-center space-x-2">
              <button
                onClick={() => setViewMode('day')}
                className={`px-3 py-2 rounded-md ${viewMode === 'day' ? 'bg-green-600 text-white' : 'bg-gray-100 text-gray-700'}`}
              >
                Day
              </button>
              <button
                onClick={() => setViewMode('week')}
                className={`px-3 py-2 rounded-md ${viewMode === 'week' ? 'bg-green-600 text-white' : 'bg-gray-100 text-gray-700'}`}
              >
                Week
              </button>
              <button
                onClick={() => setViewMode('month')}
                className={`px-3 py-2 rounded-md ${viewMode === 'month' ? 'bg-green-600 text-white' : 'bg-gray-100 text-gray-700'}`}
              >
                Month
              </button>
            </div>
          </div>
          <div className="flex items-center space-x-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <input
                type="text"
                placeholder="Search appointments..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
              />
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
            </select>
          </div>
        </div>
      </div>

      {/* Appointment Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="p-2 bg-blue-100 rounded-lg">
              <Calendar className="h-6 w-6 text-blue-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Today's Appointments</p>
              <p className="text-2xl font-bold text-gray-900">
                {appointments.filter(a => 
                  new Date(a.appointmentDate).toDateString() === new Date().toDateString()
                ).length}
              </p>
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="p-2 bg-green-100 rounded-lg">
              <CheckCircle className="h-6 w-6 text-green-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Confirmed</p>
              <p className="text-2xl font-bold text-gray-900">
                {appointments.filter(a => a.status === 'confirmed').length}
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
              <p className="text-sm font-medium text-gray-600">Pending</p>
              <p className="text-2xl font-bold text-gray-900">
                {appointments.filter(a => a.status === 'scheduled').length}
              </p>
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="p-2 bg-purple-100 rounded-lg">
              <User className="h-6 w-6 text-purple-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Completed</p>
              <p className="text-2xl font-bold text-gray-900">
                {appointments.filter(a => a.status === 'completed').length}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Appointments List */}
      <div className="bg-white rounded-lg shadow">
        <div className="px-6 py-4 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold text-gray-900">
              Appointments for {new Date(selectedDate).toLocaleDateString()}
            </h3>
            <button className="flex items-center px-3 py-2 text-sm bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200">
              <Download className="h-4 w-4 mr-2" />
              Export
            </button>
          </div>
        </div>
        
        <div className="divide-y divide-gray-200">
          {filteredAppointments.length > 0 ? (
            filteredAppointments.map((appointment) => (
              <div key={appointment._id} className="p-6 hover:bg-gray-50">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <div className="w-12 h-12 bg-gradient-to-r from-green-400 to-blue-500 rounded-full flex items-center justify-center text-white font-semibold">
                      {appointment.patientId?.firstName?.charAt(0)}{appointment.patientId?.lastName?.charAt(0)}
                    </div>
                    <div>
                      <h4 className="text-lg font-medium text-gray-900">
                        {appointment.patientId?.firstName} {appointment.patientId?.lastName}
                      </h4>
                      <div className="flex items-center space-x-4 text-sm text-gray-600">
                        <span className="flex items-center">
                          <Clock className="h-4 w-4 mr-1" />
                          {formatTime(appointment.startTime)} - {formatTime(appointment.endTime)}
                        </span>
                        <span className="capitalize">{appointment.type}</span>
                        <span>₹{appointment.fee}</span>
                      </div>
                      {appointment.notes && (
                        <p className="text-sm text-gray-500 mt-1">{appointment.notes}</p>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center space-x-3">
                    <span className={`px-3 py-1 text-sm font-semibold rounded-full ${getStatusColor(appointment.status)}`}>
                      {appointment.status}
                    </span>
                    <div className="flex items-center space-x-2">
                      {appointment.status === 'scheduled' && (
                        <button
                          onClick={() => handleStatusUpdate(appointment._id, 'confirmed')}
                          className="p-2 text-green-600 hover:text-green-800"
                          title="Confirm Appointment"
                        >
                          <CheckCircle className="h-4 w-4" />
                        </button>
                      )}
                      <button
                        onClick={() => openModal('view', appointment)}
                        className="p-2 text-blue-600 hover:text-blue-800"
                        title="View Details"
                      >
                        <Eye className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => openModal('edit', appointment)}
                        className="p-2 text-yellow-600 hover:text-yellow-800"
                        title="Edit Appointment"
                      >
                        <Edit className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => handleDeleteAppointment(appointment._id)}
                        className="p-2 text-red-600 hover:text-red-800"
                        title="Delete Appointment"
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
              <Calendar className="h-16 w-16 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500 text-lg">No appointments found</p>
              <p className="text-gray-400">Try adjusting your filters or create a new appointment</p>
            </div>
          )}
        </div>
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-2xl max-h-screen overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-semibold">
                {modalType === 'create' ? 'Schedule New Appointment' : 
                 modalType === 'edit' ? 'Edit Appointment' : 'Appointment Details'}
              </h3>
              <button
                onClick={() => setShowModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="h-6 w-6" />
              </button>
            </div>
            
            {modalType !== 'view' ? (
              <form className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Patient</label>
                    <select
                      value={formData.patientId}
                      onChange={(e) => setFormData({...formData, patientId: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                      required
                    >
                      <option value="">Select Patient</option>
                      {patients.map(patient => (
                        <option key={patient._id} value={patient._id}>
                          {patient.firstName} {patient.lastName}
                        </option>
                      ))}
                    </select>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Appointment Type</label>
                    <select
                      value={formData.type}
                      onChange={(e) => setFormData({...formData, type: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                    >
                      <option value="consultation">Consultation</option>
                      <option value="therapy">Therapy</option>
                      <option value="follow-up">Follow-up</option>
                    </select>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Date</label>
                    <input
                      type="date"
                      value={formData.appointmentDate}
                      onChange={(e) => setFormData({...formData, appointmentDate: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                      required
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Duration (minutes)</label>
                    <input
                      type="number"
                      value={formData.duration}
                      onChange={(e) => setFormData({...formData, duration: parseInt(e.target.value)})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                      min="15"
                      step="15"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Start Time</label>
                    <input
                      type="time"
                      value={formData.startTime}
                      onChange={(e) => setFormData({...formData, startTime: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                      required
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Fee (₹)</label>
                    <input
                      type="number"
                      value={formData.fee}
                      onChange={(e) => setFormData({...formData, fee: parseFloat(e.target.value)})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                      min="0"
                      step="100"
                    />
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Notes</label>
                  <textarea
                    value={formData.notes}
                    onChange={(e) => setFormData({...formData, notes: e.target.value})}
                    rows="3"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                    placeholder="Additional notes or instructions..."
                  />
                </div>
                
                <div className="flex items-center justify-end space-x-3 pt-4">
                  <button
                    type="button"
                    onClick={() => setShowModal(false)}
                    className="px-4 py-2 text-gray-700 bg-gray-200 rounded-md hover:bg-gray-300"
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    onClick={modalType === 'create' ? handleCreateAppointment : handleUpdateAppointment}
                    className="flex items-center px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700"
                  >
                    <Save className="h-4 w-4 mr-2" />
                    {modalType === 'create' ? 'Schedule' : 'Update'}
                  </button>
                </div>
              </form>
            ) : (
              <div className="space-y-4">
                <div className="text-center py-8">
                  <p className="text-gray-500">Appointment details view</p>
                  <p className="text-sm text-gray-400 mt-2">Detailed view implementation needed</p>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default AdvancedAppointmentScheduling;

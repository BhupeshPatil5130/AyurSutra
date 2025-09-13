import React, { useState, useEffect } from 'react';
import { 
  Calendar, 
  Search, 
  Filter, 
  Eye,
  CheckCircle,
  XCircle,
  Clock,
  AlertTriangle,
  User,
  UserCheck,
  DollarSign,
  MapPin,
  Phone,
  FileText,
  Download,
  RefreshCw,
  Edit
} from 'lucide-react';
import api from '../../utils/api';
import toast from 'react-hot-toast';

const AppointmentManagement = () => {
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [dateFilter, setDateFilter] = useState('all');
  const [selectedAppointment, setSelectedAppointment] = useState(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [appointmentsPerPage] = useState(10);
  const [totalAppointments, setTotalAppointments] = useState(0);
  const [stats, setStats] = useState({});

  const appointmentStatuses = [
    { value: 'scheduled', label: 'Scheduled', color: 'bg-blue-100 text-blue-700', icon: Clock },
    { value: 'confirmed', label: 'Confirmed', color: 'bg-green-100 text-green-700', icon: CheckCircle },
    { value: 'in-progress', label: 'In Progress', color: 'bg-yellow-100 text-yellow-700', icon: AlertTriangle },
    { value: 'completed', label: 'Completed', color: 'bg-green-100 text-green-700', icon: CheckCircle },
    { value: 'cancelled', label: 'Cancelled', color: 'bg-red-100 text-red-700', icon: XCircle },
    { value: 'no-show', label: 'No Show', color: 'bg-gray-100 text-gray-700', icon: XCircle }
  ];

  useEffect(() => {
    fetchAppointments();
    fetchStats();
  }, [currentPage, statusFilter, dateFilter, searchTerm]);

  const fetchAppointments = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams({
        page: currentPage,
        limit: appointmentsPerPage,
        search: searchTerm,
        status: statusFilter !== 'all' ? statusFilter : '',
        date: dateFilter !== 'all' ? dateFilter : ''
      });

      const response = await api.get(`/admin/appointments?${params}`);
      setAppointments(response.data.appointments);
      setTotalAppointments(response.data.total);
    } catch (error) {
      console.error('Error fetching appointments:', error);
      toast.error('Error fetching appointments');
    } finally {
      setLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      const response = await api.get('/admin/appointments/stats');
      setStats(response.data);
    } catch (error) {
      console.error('Error fetching appointment stats:', error);
    }
  };

  const updateAppointmentStatus = async (appointmentId, newStatus) => {
    try {
      await api.patch(`/admin/appointments/${appointmentId}/status`, {
        status: newStatus
      });
      
      toast.success(`Appointment ${newStatus} successfully`);
      fetchAppointments();
      fetchStats();
    } catch (error) {
      console.error('Error updating appointment status:', error);
      toast.error('Error updating appointment status');
    }
  };

  const viewAppointmentDetails = async (appointment) => {
    try {
      const response = await api.get(`/admin/appointments/${appointment._id}/details`);
      setSelectedAppointment(response.data);
      setShowDetailsModal(true);
    } catch (error) {
      console.error('Error fetching appointment details:', error);
      toast.error('Error fetching appointment details');
    }
  };

  const getStatusConfig = (status) => {
    return appointmentStatuses.find(s => s.value === status) || appointmentStatuses[0];
  };

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const formatTime = (time) => {
    return new Date(`2000-01-01T${time}`).toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const totalPages = Math.ceil(totalAppointments / appointmentsPerPage);

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
          <h1 className="text-2xl font-bold text-gray-900">Appointment Management</h1>
          <p className="text-gray-600">Monitor and manage all system appointments</p>
        </div>
        <div className="flex items-center space-x-3">
          <button className="flex items-center px-3 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50">
            <Download className="h-4 w-4 mr-2" />
            Export
          </button>
          <button
            onClick={fetchAppointments}
            className="flex items-center px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700"
          >
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-6">
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="p-3 bg-blue-100 rounded-full">
              <Calendar className="h-6 w-6 text-blue-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Total</p>
              <p className="text-xl font-bold text-gray-900">{stats.total || 0}</p>
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="p-3 bg-yellow-100 rounded-full">
              <Clock className="h-6 w-6 text-yellow-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Scheduled</p>
              <p className="text-xl font-bold text-gray-900">{stats.scheduled || 0}</p>
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="p-3 bg-green-100 rounded-full">
              <CheckCircle className="h-6 w-6 text-green-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Completed</p>
              <p className="text-xl font-bold text-gray-900">{stats.completed || 0}</p>
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="p-3 bg-red-100 rounded-full">
              <XCircle className="h-6 w-6 text-red-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Cancelled</p>
              <p className="text-xl font-bold text-gray-900">{stats.cancelled || 0}</p>
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="p-3 bg-purple-100 rounded-full">
              <DollarSign className="h-6 w-6 text-purple-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Revenue</p>
              <p className="text-xl font-bold text-gray-900">₹{(stats.revenue || 0).toLocaleString()}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg shadow p-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search appointments..."
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
            {appointmentStatuses.map(status => (
              <option key={status.value} value={status.value}>{status.label}</option>
            ))}
          </select>
          
          <select
            value={dateFilter}
            onChange={(e) => setDateFilter(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
          >
            <option value="all">All Dates</option>
            <option value="today">Today</option>
            <option value="tomorrow">Tomorrow</option>
            <option value="this-week">This Week</option>
            <option value="this-month">This Month</option>
          </select>

          <div className="text-sm text-gray-600 flex items-center">
            <Calendar className="h-4 w-4 mr-1" />
            Showing: {appointments.length} of {totalAppointments}
          </div>
        </div>
      </div>

      {/* Appointments Table */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Appointment
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Patient
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Practitioner
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Date & Time
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Fee
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {appointments.map((appointment) => {
                const statusConfig = getStatusConfig(appointment.status);
                const Icon = statusConfig.icon;
                
                return (
                  <tr key={appointment._id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="w-10 h-10 bg-gradient-to-r from-blue-400 to-purple-500 rounded-full flex items-center justify-center text-white font-semibold text-sm">
                          {appointment.type?.charAt(0).toUpperCase()}
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900 capitalize">
                            {appointment.type} Session
                          </div>
                          <div className="text-sm text-gray-500">
                            {appointment.duration} minutes
                          </div>
                        </div>
                      </div>
                    </td>
                    
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="w-8 h-8 bg-gradient-to-r from-green-400 to-blue-500 rounded-full flex items-center justify-center text-white font-semibold text-xs">
                          {appointment.patient?.firstName?.charAt(0)}{appointment.patient?.lastName?.charAt(0)}
                        </div>
                        <div className="ml-3">
                          <div className="text-sm font-medium text-gray-900">
                            {appointment.patient?.firstName} {appointment.patient?.lastName}
                          </div>
                          <div className="text-sm text-gray-500">
                            {appointment.patient?.email}
                          </div>
                        </div>
                      </div>
                    </td>
                    
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="w-8 h-8 bg-gradient-to-r from-purple-400 to-pink-500 rounded-full flex items-center justify-center text-white font-semibold text-xs">
                          {appointment.practitioner?.firstName?.charAt(0)}{appointment.practitioner?.lastName?.charAt(0)}
                        </div>
                        <div className="ml-3">
                          <div className="text-sm font-medium text-gray-900">
                            Dr. {appointment.practitioner?.firstName} {appointment.practitioner?.lastName}
                          </div>
                          <div className="text-sm text-gray-500">
                            {appointment.practitioner?.specialization}
                          </div>
                        </div>
                      </div>
                    </td>
                    
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">
                        {formatDate(appointment.appointmentDate)}
                      </div>
                      <div className="text-sm text-gray-500">
                        {formatTime(appointment.startTime)} - {formatTime(appointment.endTime)}
                      </div>
                    </td>
                    
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${statusConfig.color}`}>
                        <Icon className="h-3 w-3 mr-1" />
                        {statusConfig.label}
                      </span>
                    </td>
                    
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">₹{appointment.fee}</div>
                      <div className={`text-xs ${
                        appointment.paymentStatus === 'paid' ? 'text-green-600' :
                        appointment.paymentStatus === 'pending' ? 'text-yellow-600' :
                        'text-red-600'
                      }`}>
                        {appointment.paymentStatus}
                      </div>
                    </td>
                    
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex items-center justify-end space-x-2">
                        <button
                          onClick={() => viewAppointmentDetails(appointment)}
                          className="text-blue-600 hover:text-blue-900"
                          title="View Details"
                        >
                          <Eye className="h-4 w-4" />
                        </button>
                        
                        {appointment.status === 'scheduled' && (
                          <button
                            onClick={() => updateAppointmentStatus(appointment._id, 'confirmed')}
                            className="text-green-600 hover:text-green-900"
                            title="Confirm"
                          >
                            <CheckCircle className="h-4 w-4" />
                          </button>
                        )}
                        
                        {['scheduled', 'confirmed'].includes(appointment.status) && (
                          <button
                            onClick={() => updateAppointmentStatus(appointment._id, 'cancelled')}
                            className="text-red-600 hover:text-red-900"
                            title="Cancel"
                          >
                            <XCircle className="h-4 w-4" />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="bg-white px-4 py-3 flex items-center justify-between border-t border-gray-200 sm:px-6">
          <div className="flex-1 flex justify-between sm:hidden">
            <button
              onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
              disabled={currentPage === 1}
              className="relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50"
            >
              Previous
            </button>
            <button
              onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
              disabled={currentPage === totalPages}
              className="ml-3 relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50"
            >
              Next
            </button>
          </div>
          <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
            <div>
              <p className="text-sm text-gray-700">
                Showing <span className="font-medium">{(currentPage - 1) * appointmentsPerPage + 1}</span> to{' '}
                <span className="font-medium">{Math.min(currentPage * appointmentsPerPage, totalAppointments)}</span> of{' '}
                <span className="font-medium">{totalAppointments}</span> results
              </p>
            </div>
            <div>
              <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px">
                <button
                  onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                  disabled={currentPage === 1}
                  className="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50"
                >
                  Previous
                </button>
                {[...Array(Math.min(5, totalPages))].map((_, i) => {
                  const page = i + 1;
                  return (
                    <button
                      key={page}
                      onClick={() => setCurrentPage(page)}
                      className={`relative inline-flex items-center px-4 py-2 border text-sm font-medium ${
                        currentPage === page
                          ? 'z-10 bg-green-50 border-green-500 text-green-600'
                          : 'bg-white border-gray-300 text-gray-500 hover:bg-gray-50'
                      }`}
                    >
                      {page}
                    </button>
                  );
                })}
                <button
                  onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                  disabled={currentPage === totalPages}
                  className="relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50"
                >
                  Next
                </button>
              </nav>
            </div>
          </div>
        </div>
      </div>

      {/* Appointment Details Modal */}
      {showDetailsModal && selectedAppointment && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg w-full max-w-4xl max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-semibold text-gray-900">
                  Appointment Details
                </h3>
                <button
                  onClick={() => {
                    setShowDetailsModal(false);
                    setSelectedAppointment(null);
                  }}
                  className="text-gray-400 hover:text-gray-600"
                >
                  ×
                </button>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Appointment Information */}
                <div className="space-y-4">
                  <h4 className="font-semibold text-gray-900">Appointment Information</h4>
                  <div className="bg-gray-50 rounded-lg p-4 space-y-3">
                    <div>
                      <label className="text-sm font-medium text-gray-600">Type</label>
                      <p className="text-gray-900 capitalize">{selectedAppointment.type}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-600">Date & Time</label>
                      <p className="text-gray-900">
                        {formatDate(selectedAppointment.appointmentDate)} at {formatTime(selectedAppointment.startTime)}
                      </p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-600">Duration</label>
                      <p className="text-gray-900">{selectedAppointment.duration} minutes</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-600">Status</label>
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusConfig(selectedAppointment.status).color}`}>
                        {getStatusConfig(selectedAppointment.status).label}
                      </span>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-600">Fee</label>
                      <p className="text-gray-900">₹{selectedAppointment.fee}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-600">Payment Status</label>
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        selectedAppointment.paymentStatus === 'paid' ? 'bg-green-100 text-green-700' :
                        selectedAppointment.paymentStatus === 'pending' ? 'bg-yellow-100 text-yellow-700' :
                        'bg-red-100 text-red-700'
                      }`}>
                        {selectedAppointment.paymentStatus}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Patient & Practitioner Info */}
                <div className="space-y-4">
                  <h4 className="font-semibold text-gray-900">Participants</h4>
                  <div className="bg-gray-50 rounded-lg p-4 space-y-4">
                    <div>
                      <label className="text-sm font-medium text-gray-600">Patient</label>
                      <div className="flex items-center mt-1">
                        <div className="w-8 h-8 bg-gradient-to-r from-green-400 to-blue-500 rounded-full flex items-center justify-center text-white font-semibold text-xs">
                          {selectedAppointment.patient?.firstName?.charAt(0)}{selectedAppointment.patient?.lastName?.charAt(0)}
                        </div>
                        <div className="ml-3">
                          <p className="text-gray-900">{selectedAppointment.patient?.firstName} {selectedAppointment.patient?.lastName}</p>
                          <p className="text-sm text-gray-500">{selectedAppointment.patient?.email}</p>
                        </div>
                      </div>
                    </div>
                    
                    <div>
                      <label className="text-sm font-medium text-gray-600">Practitioner</label>
                      <div className="flex items-center mt-1">
                        <div className="w-8 h-8 bg-gradient-to-r from-purple-400 to-pink-500 rounded-full flex items-center justify-center text-white font-semibold text-xs">
                          {selectedAppointment.practitioner?.firstName?.charAt(0)}{selectedAppointment.practitioner?.lastName?.charAt(0)}
                        </div>
                        <div className="ml-3">
                          <p className="text-gray-900">Dr. {selectedAppointment.practitioner?.firstName} {selectedAppointment.practitioner?.lastName}</p>
                          <p className="text-sm text-gray-500">{selectedAppointment.practitioner?.specialization}</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Notes and Additional Info */}
              {(selectedAppointment.notes || selectedAppointment.symptoms || selectedAppointment.diagnosis) && (
                <div className="mt-6">
                  <h4 className="font-semibold text-gray-900 mb-3">Clinical Information</h4>
                  <div className="bg-gray-50 rounded-lg p-4 space-y-3">
                    {selectedAppointment.symptoms && (
                      <div>
                        <label className="text-sm font-medium text-gray-600">Symptoms</label>
                        <p className="text-gray-900">{selectedAppointment.symptoms.join(', ')}</p>
                      </div>
                    )}
                    {selectedAppointment.diagnosis && (
                      <div>
                        <label className="text-sm font-medium text-gray-600">Diagnosis</label>
                        <p className="text-gray-900">{selectedAppointment.diagnosis}</p>
                      </div>
                    )}
                    {selectedAppointment.notes && (
                      <div>
                        <label className="text-sm font-medium text-gray-600">Notes</label>
                        <p className="text-gray-900">{selectedAppointment.notes}</p>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Actions */}
              <div className="flex justify-end space-x-3 mt-6 pt-6 border-t border-gray-200">
                <button
                  onClick={() => {
                    setShowDetailsModal(false);
                    setSelectedAppointment(null);
                  }}
                  className="px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50"
                >
                  Close
                </button>
                
                {selectedAppointment.status === 'scheduled' && (
                  <button
                    onClick={() => {
                      updateAppointmentStatus(selectedAppointment._id, 'confirmed');
                      setShowDetailsModal(false);
                    }}
                    className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700"
                  >
                    Confirm Appointment
                  </button>
                )}
                
                {['scheduled', 'confirmed'].includes(selectedAppointment.status) && (
                  <button
                    onClick={() => {
                      updateAppointmentStatus(selectedAppointment._id, 'cancelled');
                      setShowDetailsModal(false);
                    }}
                    className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700"
                  >
                    Cancel Appointment
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AppointmentManagement;

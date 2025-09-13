import React, { useState, useEffect } from 'react';
import { 
  Users, 
  Search, 
  Filter, 
  Eye,
  Edit,
  Trash2,
  Heart,
  Calendar,
  MapPin,
  Phone,
  Mail,
  AlertCircle,
  Activity,
  FileText,
  Download,
  RefreshCw,
  User
} from 'lucide-react';
import api from '../../utils/api';
import toast from 'react-hot-toast';

const PatientManagement = () => {
  const [patients, setPatients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [selectedPatient, setSelectedPatient] = useState(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [patientsPerPage] = useState(12);
  const [totalPatients, setTotalPatients] = useState(0);
  const [stats, setStats] = useState({});

  useEffect(() => {
    fetchPatients();
    fetchStats();
  }, [currentPage, statusFilter, searchTerm]);

  const fetchPatients = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams({
        page: currentPage,
        limit: patientsPerPage,
        search: searchTerm,
        status: statusFilter !== 'all' ? statusFilter : ''
      });

      const response = await api.get(`/admin/patients?${params}`);
      setPatients(response.data.patients);
      setTotalPatients(response.data.total);
    } catch (error) {
      console.error('Error fetching patients:', error);
      toast.error('Error fetching patients');
    } finally {
      setLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      const response = await api.get('/admin/patients/stats');
      setStats(response.data);
    } catch (error) {
      console.error('Error fetching patient stats:', error);
    }
  };

  const togglePatientStatus = async (patientId, currentStatus) => {
    try {
      await api.patch(`/admin/patients/${patientId}/status`, {
        isActive: !currentStatus
      });
      
      toast.success(`Patient ${!currentStatus ? 'activated' : 'deactivated'} successfully`);
      fetchPatients();
    } catch (error) {
      console.error('Error updating patient status:', error);
      toast.error('Error updating patient status');
    }
  };

  const deletePatient = async (patientId) => {
    if (window.confirm('Are you sure you want to delete this patient? This action cannot be undone.')) {
      try {
        await api.delete(`/admin/patients/${patientId}`);
        toast.success('Patient deleted successfully');
        fetchPatients();
      } catch (error) {
        console.error('Error deleting patient:', error);
        toast.error('Error deleting patient');
      }
    }
  };

  const viewPatientDetails = async (patient) => {
    try {
      const response = await api.get(`/admin/patients/${patient._id}/details`);
      setSelectedPatient(response.data);
      setShowDetailsModal(true);
    } catch (error) {
      console.error('Error fetching patient details:', error);
      toast.error('Error fetching patient details');
    }
  };

  const calculateAge = (birthDate) => {
    if (!birthDate) return 'N/A';
    const today = new Date();
    const birth = new Date(birthDate);
    let age = today.getFullYear() - birth.getFullYear();
    const monthDiff = today.getMonth() - birth.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
      age--;
    }
    return age;
  };

  const getHealthRiskLevel = (conditions) => {
    if (!conditions || conditions.length === 0) return { level: 'Low', color: 'text-green-600 bg-green-100' };
    if (conditions.length <= 2) return { level: 'Medium', color: 'text-yellow-600 bg-yellow-100' };
    return { level: 'High', color: 'text-red-600 bg-red-100' };
  };

  const totalPages = Math.ceil(totalPatients / patientsPerPage);

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
          <h1 className="text-2xl font-bold text-gray-900">Patient Management</h1>
          <p className="text-gray-600">Monitor and manage patient profiles and health data</p>
        </div>
        <div className="flex items-center space-x-3">
          <button className="flex items-center px-3 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50">
            <Download className="h-4 w-4 mr-2" />
            Export
          </button>
          <button
            onClick={fetchPatients}
            className="flex items-center px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700"
          >
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="p-3 bg-blue-100 rounded-full">
              <Users className="h-8 w-8 text-blue-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Total Patients</p>
              <p className="text-2xl font-bold text-gray-900">{stats.totalPatients || 0}</p>
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="p-3 bg-green-100 rounded-full">
              <Activity className="h-8 w-8 text-green-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Active Patients</p>
              <p className="text-2xl font-bold text-gray-900">{stats.activePatients || 0}</p>
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="p-3 bg-yellow-100 rounded-full">
              <Calendar className="h-8 w-8 text-yellow-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Recent Appointments</p>
              <p className="text-2xl font-bold text-gray-900">{stats.recentAppointments || 0}</p>
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="p-3 bg-red-100 rounded-full">
              <AlertCircle className="h-8 w-8 text-red-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">High Risk</p>
              <p className="text-2xl font-bold text-gray-900">{stats.highRiskPatients || 0}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg shadow p-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search patients..."
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
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
          </select>

          <div className="text-sm text-gray-600 flex items-center">
            <User className="h-4 w-4 mr-1" />
            Showing: {patients.length} of {totalPatients}
          </div>
        </div>
      </div>

      {/* Patients Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {patients.map((patient) => {
          const age = calculateAge(patient.dateOfBirth);
          const riskLevel = getHealthRiskLevel(patient.medicalHistory?.conditions);
          
          return (
            <div key={patient._id} className="bg-white rounded-lg shadow hover:shadow-md transition-shadow">
              <div className="p-6">
                {/* Header */}
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center space-x-3">
                    <div className="w-12 h-12 bg-gradient-to-r from-purple-400 to-pink-500 rounded-full flex items-center justify-center text-white font-semibold text-lg">
                      {patient.firstName?.charAt(0)}{patient.lastName?.charAt(0)}
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900">
                        {patient.firstName} {patient.lastName}
                      </h3>
                      <p className="text-sm text-gray-600">{age} years old</p>
                    </div>
                  </div>
                  <span className={`inline-flex items-center px-2 py-1 text-xs font-semibold rounded-full ${
                    patient.isActive 
                      ? 'bg-green-100 text-green-700' 
                      : 'bg-red-100 text-red-700'
                  }`}>
                    {patient.isActive ? 'Active' : 'Inactive'}
                  </span>
                </div>

                {/* Contact Info */}
                <div className="space-y-2 mb-4">
                  <div className="flex items-center text-sm text-gray-600">
                    <Mail className="h-4 w-4 mr-2" />
                    <span className="truncate">{patient.email}</span>
                  </div>
                  <div className="flex items-center text-sm text-gray-600">
                    <Phone className="h-4 w-4 mr-2" />
                    {patient.phone || 'Not provided'}
                  </div>
                  <div className="flex items-center text-sm text-gray-600">
                    <MapPin className="h-4 w-4 mr-2" />
                    {patient.address?.city || 'Not specified'}
                  </div>
                </div>

                {/* Health Info */}
                <div className="mb-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium text-gray-700">Health Risk</span>
                    <span className={`px-2 py-1 text-xs font-semibold rounded-full ${riskLevel.color}`}>
                      {riskLevel.level}
                    </span>
                  </div>
                  
                  <div className="flex items-center justify-between text-sm text-gray-600">
                    <span>Appointments</span>
                    <span className="font-medium">{patient.appointmentCount || 0}</span>
                  </div>
                  
                  <div className="flex items-center justify-between text-sm text-gray-600">
                    <span>Last Visit</span>
                    <span className="font-medium">
                      {patient.lastAppointment 
                        ? new Date(patient.lastAppointment).toLocaleDateString()
                        : 'Never'
                      }
                    </span>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex space-x-2">
                  <button
                    onClick={() => viewPatientDetails(patient)}
                    className="flex-1 flex items-center justify-center px-3 py-2 text-sm bg-blue-600 text-white rounded-md hover:bg-blue-700"
                  >
                    <Eye className="h-4 w-4 mr-1" />
                    View
                  </button>
                  
                  <button
                    onClick={() => togglePatientStatus(patient._id, patient.isActive)}
                    className={`flex items-center px-3 py-2 text-sm rounded-md ${
                      patient.isActive 
                        ? 'bg-yellow-600 text-white hover:bg-yellow-700' 
                        : 'bg-green-600 text-white hover:bg-green-700'
                    }`}
                  >
                    {patient.isActive ? 'Deactivate' : 'Activate'}
                  </button>
                  
                  <button
                    onClick={() => deletePatient(patient._id)}
                    className="flex items-center px-3 py-2 text-sm bg-red-600 text-white rounded-md hover:bg-red-700"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Pagination */}
      <div className="bg-white px-4 py-3 flex items-center justify-between border-t border-gray-200 sm:px-6 rounded-lg shadow">
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
              Showing <span className="font-medium">{(currentPage - 1) * patientsPerPage + 1}</span> to{' '}
              <span className="font-medium">{Math.min(currentPage * patientsPerPage, totalPatients)}</span> of{' '}
              <span className="font-medium">{totalPatients}</span> results
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

      {/* Patient Details Modal */}
      {showDetailsModal && selectedPatient && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg w-full max-w-4xl max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-semibold text-gray-900">
                  Patient Details - {selectedPatient.firstName} {selectedPatient.lastName}
                </h3>
                <button
                  onClick={() => {
                    setShowDetailsModal(false);
                    setSelectedPatient(null);
                  }}
                  className="text-gray-400 hover:text-gray-600"
                >
                  ×
                </button>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Personal Information */}
                <div className="space-y-4">
                  <h4 className="font-semibold text-gray-900">Personal Information</h4>
                  <div className="bg-gray-50 rounded-lg p-4 space-y-3">
                    <div>
                      <label className="text-sm font-medium text-gray-600">Full Name</label>
                      <p className="text-gray-900">{selectedPatient.firstName} {selectedPatient.lastName}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-600">Email</label>
                      <p className="text-gray-900">{selectedPatient.email}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-600">Phone</label>
                      <p className="text-gray-900">{selectedPatient.phone || 'Not provided'}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-600">Date of Birth</label>
                      <p className="text-gray-900">
                        {selectedPatient.dateOfBirth 
                          ? new Date(selectedPatient.dateOfBirth).toLocaleDateString()
                          : 'Not provided'
                        }
                      </p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-600">Gender</label>
                      <p className="text-gray-900 capitalize">{selectedPatient.gender || 'Not specified'}</p>
                    </div>
                  </div>
                </div>

                {/* Medical Information */}
                <div className="space-y-4">
                  <h4 className="font-semibold text-gray-900">Medical Information</h4>
                  <div className="bg-gray-50 rounded-lg p-4 space-y-3">
                    <div>
                      <label className="text-sm font-medium text-gray-600">Blood Group</label>
                      <p className="text-gray-900">{selectedPatient.medicalHistory?.bloodGroup || 'Not provided'}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-600">Allergies</label>
                      <div className="space-y-1">
                        {selectedPatient.medicalHistory?.allergies?.length > 0 ? (
                          selectedPatient.medicalHistory.allergies.map((allergy, index) => (
                            <span key={index} className="inline-block bg-red-100 text-red-700 text-xs px-2 py-1 rounded-full mr-1">
                              {allergy}
                            </span>
                          ))
                        ) : (
                          <p className="text-gray-500">None reported</p>
                        )}
                      </div>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-600">Current Medications</label>
                      <div className="space-y-1">
                        {selectedPatient.medicalHistory?.currentMedications?.length > 0 ? (
                          selectedPatient.medicalHistory.currentMedications.map((med, index) => (
                            <p key={index} className="text-gray-900 text-sm">{med}</p>
                          ))
                        ) : (
                          <p className="text-gray-500">None</p>
                        )}
                      </div>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-600">Medical Conditions</label>
                      <div className="space-y-1">
                        {selectedPatient.medicalHistory?.conditions?.length > 0 ? (
                          selectedPatient.medicalHistory.conditions.map((condition, index) => (
                            <span key={index} className="inline-block bg-yellow-100 text-yellow-700 text-xs px-2 py-1 rounded-full mr-1">
                              {condition}
                            </span>
                          ))
                        ) : (
                          <p className="text-gray-500">None reported</p>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Recent Activity */}
              <div className="mt-6">
                <h4 className="font-semibold text-gray-900 mb-3">Recent Activity</h4>
                <div className="bg-gray-50 rounded-lg p-4">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-center">
                    <div>
                      <p className="text-2xl font-bold text-blue-600">{selectedPatient.appointmentCount || 0}</p>
                      <p className="text-sm text-gray-600">Total Appointments</p>
                    </div>
                    <div>
                      <p className="text-2xl font-bold text-green-600">{selectedPatient.completedSessions || 0}</p>
                      <p className="text-sm text-gray-600">Completed Sessions</p>
                    </div>
                    <div>
                      <p className="text-2xl font-bold text-purple-600">{selectedPatient.therapyPlans || 0}</p>
                      <p className="text-sm text-gray-600">Therapy Plans</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Emergency Contact */}
              {selectedPatient.emergencyContact && (
                <div className="mt-6">
                  <h4 className="font-semibold text-gray-900 mb-3">Emergency Contact</h4>
                  <div className="bg-gray-50 rounded-lg p-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="text-sm font-medium text-gray-600">Name</label>
                        <p className="text-gray-900">{selectedPatient.emergencyContact.name}</p>
                      </div>
                      <div>
                        <label className="text-sm font-medium text-gray-600">Relationship</label>
                        <p className="text-gray-900">{selectedPatient.emergencyContact.relationship}</p>
                      </div>
                      <div>
                        <label className="text-sm font-medium text-gray-600">Phone</label>
                        <p className="text-gray-900">{selectedPatient.emergencyContact.phone}</p>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Actions */}
              <div className="flex justify-end space-x-3 mt-6 pt-6 border-t border-gray-200">
                <button
                  onClick={() => {
                    setShowDetailsModal(false);
                    setSelectedPatient(null);
                  }}
                  className="px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50"
                >
                  Close
                </button>
                <button
                  onClick={() => togglePatientStatus(selectedPatient._id, selectedPatient.isActive)}
                  className={`px-4 py-2 rounded-md ${
                    selectedPatient.isActive 
                      ? 'bg-yellow-600 text-white hover:bg-yellow-700' 
                      : 'bg-green-600 text-white hover:bg-green-700'
                  }`}
                >
                  {selectedPatient.isActive ? 'Deactivate' : 'Activate'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PatientManagement;

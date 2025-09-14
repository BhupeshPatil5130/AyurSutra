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

import { mockPatients, mockAdminStats, simulateApiDelay, generatePaginatedResponse, filterData } from '../../services/mockAdminData';

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
      
      // Simulate API delay
      await simulateApiDelay(500);
      
      const params = new URLSearchParams({
        page: currentPage,
        limit: patientsPerPage,
        search: searchTerm,
        status: statusFilter !== 'all' ? statusFilter : ''
      });

      try {
        const response = await api.get(`/admin/patients?${params}`);
        setPatients(response.data.patients);
        setTotalPatients(response.data.total);
      } catch (apiError) {
        console.log('API not available, using mock data:', apiError.message);
        
        // Filter mock data based on current filters
        const filters = {
          search: searchTerm,
          isActive: statusFilter === 'active' ? true : statusFilter === 'inactive' ? false : null
        };
        
        const filteredData = filterData(mockPatients, filters);
        const paginatedResponse = generatePaginatedResponse(filteredData, currentPage, patientsPerPage);
        
        setPatients(paginatedResponse.data);
        setTotalPatients(paginatedResponse.total);
      }
    } catch (error) {
      console.error('Error fetching patients:', error);
      
      
      // Use mock data as final fallback
      const paginatedResponse = generatePaginatedResponse(mockPatients, currentPage, patientsPerPage);
      setPatients(paginatedResponse.data);
      setTotalPatients(paginatedResponse.total);
    } finally {
      setLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      await simulateApiDelay(300);
      
      try {
        const response = await api.get('/admin/patients/stats');
        setStats(response.data);
      } catch (apiError) {
        console.log('API not available, using mock stats:', apiError.message);
        setStats({
          totalPatients: mockAdminStats.totalPatients,
          activePatients: Math.floor(mockAdminStats.totalPatients * 0.85),
          newThisMonth: mockAdminStats.newRegistrations,
          averageAge: 35
        });
      }
    } catch (error) {
      console.error('Error fetching stats:', error);
      setStats({
        totalPatients: mockPatients.length,
        activePatients: mockPatients.filter(p => p.isActive).length,
        newThisMonth: 15,
        averageAge: 35
      });
    }
  };

  const viewPatientDetails = (patient) => {
    setSelectedPatient(patient);
    setShowDetailsModal(true);
  };

  const calculateAge = (dateOfBirth) => {
    const today = new Date();
    const birthDate = new Date(dateOfBirth);
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }
    
    return age;
  };

  const formatLastVisit = (lastVisit) => {
    if (!lastVisit) return 'Never';
    const date = new Date(lastVisit);
    const now = new Date();
    const diffTime = Math.abs(now - date);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays === 1) return 'Yesterday';
    if (diffDays < 7) return `${diffDays} days ago`;
    if (diffDays < 30) return `${Math.ceil(diffDays / 7)} weeks ago`;
    return `${Math.ceil(diffDays / 30)} months ago`;
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
          <p className="text-gray-600">Manage patient profiles and medical records</p>
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
            <div className="p-3 rounded-full bg-blue-100">
              <Users className="h-6 w-6 text-blue-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Total Patients</p>
              <p className="text-2xl font-semibold text-gray-900">{stats.totalPatients || 0}</p>
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="p-3 rounded-full bg-green-100">
              <Activity className="h-6 w-6 text-green-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Active Patients</p>
              <p className="text-2xl font-semibold text-gray-900">{stats.activePatients || 0}</p>
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="p-3 rounded-full bg-purple-100">
              <Heart className="h-6 w-6 text-purple-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">New This Month</p>
              <p className="text-2xl font-semibold text-gray-900">{stats.newThisMonth || 0}</p>
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="p-3 rounded-full bg-amber-100">
              <Calendar className="h-6 w-6 text-amber-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Average Age</p>
              <p className="text-2xl font-semibold text-gray-900">{stats.averageAge || 0}</p>
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
            <Users className="h-4 w-4 mr-1" />
            Total: {totalPatients}
          </div>
        </div>
      </div>

      {/* Patients Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
        {patients.map((patient) => (
          <div key={patient._id} className="bg-white rounded-lg shadow hover:shadow-md transition-shadow">
            <div className="p-6">
              {/* Header */}
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center space-x-3">
                  <div className="w-12 h-12 bg-gradient-to-r from-purple-400 to-pink-500 rounded-full flex items-center justify-center text-white font-semibold text-lg">
                    {patient.firstName?.charAt(0)}{patient.lastName?.charAt(0)}
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900">
                      {patient.firstName} {patient.lastName}
                    </h3>
                    <p className="text-sm text-gray-600">{patient.gender}, {calculateAge(patient.dateOfBirth)} years</p>
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

              {/* Details */}
              <div className="space-y-2 mb-4">
                <div className="flex items-center text-sm text-gray-600">
                  <Mail className="h-4 w-4 mr-2" />
                  {patient.email}
                </div>
                <div className="flex items-center text-sm text-gray-600">
                  <Phone className="h-4 w-4 mr-2" />
                  {patient.phone || 'Not provided'}
                </div>
                <div className="flex items-center text-sm text-gray-600">
                  <MapPin className="h-4 w-4 mr-2" />
                  {patient.location || 'Not specified'}
                </div>
                <div className="flex items-center text-sm text-gray-600">
                  <Calendar className="h-4 w-4 mr-2" />
                  Last visit: {formatLastVisit(patient.lastVisit)}
                </div>
                <div className="flex items-center text-sm text-gray-600">
                  <Activity className="h-4 w-4 mr-2" />
                  {patient.totalAppointments || 0} appointments
                </div>
              </div>

              {/* Medical Conditions */}
              {patient.medicalConditions && patient.medicalConditions.length > 0 && (
                <div className="mb-4">
                  <p className="text-xs font-medium text-gray-600 mb-2">Medical Conditions:</p>
                  <div className="flex flex-wrap gap-1">
                    {patient.medicalConditions.slice(0, 3).map((condition, index) => (
                      <span key={index} className="inline-flex items-center px-2 py-1 text-xs bg-amber-100 text-amber-700 rounded-full">
                        {condition}
                      </span>
                    ))}
                    {patient.medicalConditions.length > 3 && (
                      <span className="inline-flex items-center px-2 py-1 text-xs bg-gray-100 text-gray-600 rounded-full">
                        +{patient.medicalConditions.length - 3} more
                      </span>
                    )}
                  </div>
                </div>
              )}

              {/* Registration Date */}
              <div className="flex items-center justify-between mb-4">
                <div className="text-xs text-gray-500">
                  Registered {new Date(patient.registrationDate).toLocaleDateString()}
                </div>
              </div>

              {/* Actions */}
              <div className="flex space-x-2">
                <button
                  onClick={() => viewPatientDetails(patient)}
                  className="flex-1 flex items-center justify-center px-3 py-2 text-sm bg-blue-600 text-white rounded-md hover:bg-blue-700"
                >
                  <Eye className="h-4 w-4 mr-1" />
                  View Details
                </button>
                
                <button className="flex items-center px-3 py-2 text-sm bg-green-600 text-white rounded-md hover:bg-green-700">
                  <FileText className="h-4 w-4" />
                </button>
              </div>
            </div>
          </div>
        ))}
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
                  <User className="h-6 w-6" />
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
                      <p className="text-gray-900">{new Date(selectedPatient.dateOfBirth).toLocaleDateString()}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-600">Gender</label>
                      <p className="text-gray-900">{selectedPatient.gender}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-600">Location</label>
                      <p className="text-gray-900">{selectedPatient.location || 'Not specified'}</p>
                    </div>
                  </div>
                </div>

                {/* Medical Information */}
                <div className="space-y-4">
                  <h4 className="font-semibold text-gray-900">Medical Information</h4>
                  <div className="bg-gray-50 rounded-lg p-4 space-y-3">
                    <div>
                      <label className="text-sm font-medium text-gray-600">Medical Conditions</label>
                      <div className="space-y-1">
                        {selectedPatient.medicalConditions?.map((condition, index) => (
                          <p key={index} className="text-gray-900 text-sm">• {condition}</p>
                        )) || <p className="text-gray-500">None reported</p>}
                      </div>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-600">Total Appointments</label>
                      <p className="text-gray-900">{selectedPatient.totalAppointments || 0}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-600">Last Visit</label>
                      <p className="text-gray-900">{formatLastVisit(selectedPatient.lastVisit)}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-600">Registration Date</label>
                      <p className="text-gray-900">{new Date(selectedPatient.registrationDate).toLocaleDateString()}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-600">Preferred Practitioner</label>
                      <p className="text-gray-900">{selectedPatient.preferredPractitioner || 'None selected'}</p>
                    </div>
                  </div>
                </div>
              </div>

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
                <button className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700">
                  View Medical Records
                </button>
                <button className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700">
                  Schedule Appointment
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

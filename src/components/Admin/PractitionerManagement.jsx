import React, { useState, useEffect } from 'react';
import { 
  UserCheck, 
  Search, 
  Filter, 
  Eye,
  CheckCircle,
  XCircle,
  Clock,
  AlertTriangle,
  Star,
  MapPin,
  Phone,
  Mail,
  Calendar,
  Award,
  FileText,
  Download,
  RefreshCw
} from 'lucide-react';
import api from '../../utils/api';

import { mockPractitioners, simulateApiDelay, generatePaginatedResponse, filterData } from '../../services/mockAdminData';

const PractitionerManagement = () => {
  const [practitioners, setPractitioners] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [verificationFilter, setVerificationFilter] = useState('all');
  const [selectedPractitioner, setSelectedPractitioner] = useState(null);
  const [showVerificationModal, setShowVerificationModal] = useState(false);
  const [verificationNotes, setVerificationNotes] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [practitionersPerPage] = useState(10);
  const [totalPractitioners, setTotalPractitioners] = useState(0);

  const verificationStatuses = [
    { value: 'pending', label: 'Pending', color: 'bg-yellow-100 text-yellow-700', icon: Clock },
    { value: 'verified', label: 'Verified', color: 'bg-green-100 text-green-700', icon: CheckCircle },
    { value: 'rejected', label: 'Rejected', color: 'bg-red-100 text-red-700', icon: XCircle },
    { value: 'under_review', label: 'Under Review', color: 'bg-blue-100 text-blue-700', icon: Eye }
  ];

  useEffect(() => {
    fetchPractitioners();
  }, [currentPage, statusFilter, verificationFilter, searchTerm]);

  const fetchPractitioners = async () => {
    try {
      setLoading(true);
      
      // Simulate API delay
      await simulateApiDelay(600);
      
      const params = new URLSearchParams({
        page: currentPage,
        limit: practitionersPerPage,
        search: searchTerm,
        status: statusFilter !== 'all' ? statusFilter : '',
        verification: verificationFilter !== 'all' ? verificationFilter : ''
      });

      try {
        const response = await api.get(`/admin/practitioners?${params}`);
        setPractitioners(response.data.practitioners);
        setTotalPractitioners(response.data.total);
      } catch (apiError) {
        console.log('API not available, using mock data:', apiError.message);
        
        // Filter mock data based on current filters
        const filters = {
          search: searchTerm,
          verificationStatus: verificationFilter !== 'all' ? verificationFilter : null,
          isActive: statusFilter === 'active' ? true : statusFilter === 'inactive' ? false : null
        };
        
        const filteredData = filterData(mockPractitioners, filters);
        const paginatedResponse = generatePaginatedResponse(filteredData, currentPage, practitionersPerPage);
        
        setPractitioners(paginatedResponse.data);
        setTotalPractitioners(paginatedResponse.total);
      }
    } catch (error) {
      console.error('Error fetching practitioners:', error);
      
      
      // Use mock data as final fallback
      const paginatedResponse = generatePaginatedResponse(mockPractitioners, currentPage, practitionersPerPage);
      setPractitioners(paginatedResponse.data);
      setTotalPractitioners(paginatedResponse.total);
    } finally {
      setLoading(false);
    }
  };

  const updateVerificationStatus = async (practitionerId, status, notes = '') => {
    try {
      await simulateApiDelay(400);
      
      try {
        await api.patch(`/admin/practitioners/${practitionerId}/verification`, {
          verificationStatus: status,
          verificationNotes: notes
        });
      } catch (apiError) {
        console.log('API not available, simulating verification update:', apiError.message);
        // Simulate successful update for demo purposes
      }
      
      
      setShowVerificationModal(false);
      setSelectedPractitioner(null);
      setVerificationNotes('');
      fetchPractitioners();
    } catch (error) {
      console.error('Error updating verification status:', error);
      
    }
  };

  const togglePractitionerStatus = async (practitionerId, currentStatus) => {
    try {
      await simulateApiDelay(300);
      
      try {
        await api.patch(`/admin/practitioners/${practitionerId}/status`, {
          isActive: !currentStatus
        });
      } catch (apiError) {
        console.log('API not available, simulating status update:', apiError.message);
        // Simulate successful update for demo purposes
      }
      
      
      fetchPractitioners();
    } catch (error) {
      console.error('Error updating practitioner status:', error);
      
    }
  };

  const viewPractitionerDetails = (practitioner) => {
    setSelectedPractitioner(practitioner);
    setShowVerificationModal(true);
  };

  const getVerificationConfig = (status) => {
    return verificationStatuses.find(s => s.value === status) || verificationStatuses[0];
  };

  const calculateExperience = (startDate) => {
    const years = new Date().getFullYear() - new Date(startDate).getFullYear();
    return years > 0 ? `${years} years` : 'Less than 1 year';
  };

  const totalPages = Math.ceil(totalPractitioners / practitionersPerPage);

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
          <h1 className="text-2xl font-bold text-gray-900">Practitioner Management</h1>
          <p className="text-gray-600">Manage practitioner verification and profiles</p>
        </div>
        <div className="flex items-center space-x-3">
          <button className="flex items-center px-3 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50">
            <Download className="h-4 w-4 mr-2" />
            Export
          </button>
          <button
            onClick={fetchPractitioners}
            className="flex items-center px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700"
          >
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg shadow p-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search practitioners..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
            />
          </div>
          
          <select
            value={verificationFilter}
            onChange={(e) => setVerificationFilter(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
          >
            <option value="all">All Verification Status</option>
            {verificationStatuses.map(status => (
              <option key={status.value} value={status.value}>{status.label}</option>
            ))}
          </select>
          
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
            <UserCheck className="h-4 w-4 mr-1" />
            Total: {totalPractitioners}
          </div>
        </div>
      </div>

      {/* Practitioners Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
        {practitioners.map((practitioner) => {
          const verificationConfig = getVerificationConfig(practitioner.verificationStatus);
          const Icon = verificationConfig.icon;
          
          return (
            <div key={practitioner._id} className="bg-white rounded-lg shadow hover:shadow-md transition-shadow">
              <div className="p-6">
                {/* Header */}
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center space-x-3">
                    <div className="w-12 h-12 bg-gradient-to-r from-green-400 to-blue-500 rounded-full flex items-center justify-center text-white font-semibold text-lg">
                      {practitioner.firstName?.charAt(0)}{practitioner.lastName?.charAt(0)}
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900">
                        Dr. {practitioner.firstName} {practitioner.lastName}
                      </h3>
                      <p className="text-sm text-gray-600">{practitioner.specialization}</p>
                    </div>
                  </div>
                  <span className={`inline-flex items-center px-2 py-1 text-xs font-semibold rounded-full ${verificationConfig.color}`}>
                    <Icon className="h-3 w-3 mr-1" />
                    {verificationConfig.label}
                  </span>
                </div>

                {/* Details */}
                <div className="space-y-2 mb-4">
                  <div className="flex items-center text-sm text-gray-600">
                    <Mail className="h-4 w-4 mr-2" />
                    {practitioner.email}
                  </div>
                  <div className="flex items-center text-sm text-gray-600">
                    <Phone className="h-4 w-4 mr-2" />
                    {practitioner.phone || 'Not provided'}
                  </div>
                  <div className="flex items-center text-sm text-gray-600">
                    <MapPin className="h-4 w-4 mr-2" />
                    {practitioner.location || 'Not specified'}
                  </div>
                  <div className="flex items-center text-sm text-gray-600">
                    <Award className="h-4 w-4 mr-2" />
                    {calculateExperience(practitioner.experienceStartDate)}
                  </div>
                  {practitioner.rating && (
                    <div className="flex items-center text-sm text-gray-600">
                      <Star className="h-4 w-4 mr-2 text-yellow-400" />
                      {practitioner.rating.toFixed(1)} ({practitioner.reviewCount} reviews)
                    </div>
                  )}
                </div>

                {/* Status */}
                <div className="flex items-center justify-between mb-4">
                  <span className={`inline-flex items-center px-2 py-1 text-xs font-semibold rounded-full ${
                    practitioner.isActive 
                      ? 'bg-green-100 text-green-700' 
                      : 'bg-red-100 text-red-700'
                  }`}>
                    {practitioner.isActive ? 'Active' : 'Inactive'}
                  </span>
                  <div className="text-xs text-gray-500">
                    Joined {new Date(practitioner.createdAt).toLocaleDateString()}
                  </div>
                </div>

                {/* Actions */}
                <div className="flex space-x-2">
                  <button
                    onClick={() => viewPractitionerDetails(practitioner)}
                    className="flex-1 flex items-center justify-center px-3 py-2 text-sm bg-blue-600 text-white rounded-md hover:bg-blue-700"
                  >
                    <Eye className="h-4 w-4 mr-1" />
                    Review
                  </button>
                  
                  {practitioner.verificationStatus === 'pending' && (
                    <>
                      <button
                        onClick={() => updateVerificationStatus(practitioner._id, 'verified')}
                        className="flex items-center px-3 py-2 text-sm bg-green-600 text-white rounded-md hover:bg-green-700"
                      >
                        <CheckCircle className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => {
                          setSelectedPractitioner(practitioner);
                          setShowVerificationModal(true);
                        }}
                        className="flex items-center px-3 py-2 text-sm bg-red-600 text-white rounded-md hover:bg-red-700"
                      >
                        <XCircle className="h-4 w-4" />
                      </button>
                    </>
                  )}
                  
                  <button
                    onClick={() => togglePractitionerStatus(practitioner._id, practitioner.isActive)}
                    className={`flex items-center px-3 py-2 text-sm rounded-md ${
                      practitioner.isActive 
                        ? 'bg-yellow-600 text-white hover:bg-yellow-700' 
                        : 'bg-green-600 text-white hover:bg-green-700'
                    }`}
                  >
                    {practitioner.isActive ? 'Deactivate' : 'Activate'}
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
              Showing <span className="font-medium">{(currentPage - 1) * practitionersPerPage + 1}</span> to{' '}
              <span className="font-medium">{Math.min(currentPage * practitionersPerPage, totalPractitioners)}</span> of{' '}
              <span className="font-medium">{totalPractitioners}</span> results
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

      {/* Verification Modal */}
      {showVerificationModal && selectedPractitioner && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg w-full max-w-4xl max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-semibold text-gray-900">
                  Practitioner Verification - Dr. {selectedPractitioner.firstName} {selectedPractitioner.lastName}
                </h3>
                <button
                  onClick={() => {
                    setShowVerificationModal(false);
                    setSelectedPractitioner(null);
                    setVerificationNotes('');
                  }}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <XCircle className="h-6 w-6" />
                </button>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Personal Information */}
                <div className="space-y-4">
                  <h4 className="font-semibold text-gray-900">Personal Information</h4>
                  <div className="bg-gray-50 rounded-lg p-4 space-y-3">
                    <div>
                      <label className="text-sm font-medium text-gray-600">Full Name</label>
                      <p className="text-gray-900">Dr. {selectedPractitioner.firstName} {selectedPractitioner.lastName}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-600">Email</label>
                      <p className="text-gray-900">{selectedPractitioner.email}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-600">Phone</label>
                      <p className="text-gray-900">{selectedPractitioner.phone || 'Not provided'}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-600">Specialization</label>
                      <p className="text-gray-900">{selectedPractitioner.specialization}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-600">Experience</label>
                      <p className="text-gray-900">{calculateExperience(selectedPractitioner.experienceStartDate)}</p>
                    </div>
                  </div>
                </div>

                {/* Professional Information */}
                <div className="space-y-4">
                  <h4 className="font-semibold text-gray-900">Professional Information</h4>
                  <div className="bg-gray-50 rounded-lg p-4 space-y-3">
                    <div>
                      <label className="text-sm font-medium text-gray-600">License Number</label>
                      <p className="text-gray-900">{selectedPractitioner.licenseNumber || 'Not provided'}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-600">Education</label>
                      <div className="space-y-1">
                        {selectedPractitioner.education?.map((edu, index) => (
                          <p key={index} className="text-gray-900 text-sm">
                            {edu.degree} - {edu.institution} ({edu.year})
                          </p>
                        )) || <p className="text-gray-500">Not provided</p>}
                      </div>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-600">Certifications</label>
                      <div className="space-y-1">
                        {selectedPractitioner.certifications?.map((cert, index) => (
                          <p key={index} className="text-gray-900 text-sm">
                            {cert.name} - {cert.issuedBy} ({cert.year})
                          </p>
                        )) || <p className="text-gray-500">Not provided</p>}
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Documents */}
              {selectedPractitioner.documents && selectedPractitioner.documents.length > 0 && (
                <div className="mt-6">
                  <h4 className="font-semibold text-gray-900 mb-3">Uploaded Documents</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                    {selectedPractitioner.documents.map((doc, index) => (
                      <div key={index} className="flex items-center p-3 border border-gray-200 rounded-lg">
                        <FileText className="h-5 w-5 text-blue-500 mr-3" />
                        <div className="flex-1">
                          <p className="text-sm font-medium text-gray-900">{doc.type}</p>
                          <p className="text-xs text-gray-500">{doc.filename}</p>
                        </div>
                        <button className="text-blue-600 hover:text-blue-800">
                          <Download className="h-4 w-4" />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Verification Notes */}
              <div className="mt-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Verification Notes
                </label>
                <textarea
                  value={verificationNotes}
                  onChange={(e) => setVerificationNotes(e.target.value)}
                  placeholder="Add notes about the verification decision..."
                  rows={4}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                />
              </div>

              {/* Actions */}
              <div className="flex justify-end space-x-3 mt-6 pt-6 border-t border-gray-200">
                <button
                  onClick={() => {
                    setShowVerificationModal(false);
                    setSelectedPractitioner(null);
                    setVerificationNotes('');
                  }}
                  className="px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50"
                >
                  Cancel
                </button>
                
                {selectedPractitioner.verificationStatus === 'pending' && (
                  <>
                    <button
                      onClick={() => updateVerificationStatus(selectedPractitioner._id, 'under_review', verificationNotes)}
                      className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                    >
                      Mark Under Review
                    </button>
                    <button
                      onClick={() => updateVerificationStatus(selectedPractitioner._id, 'rejected', verificationNotes)}
                      className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700"
                    >
                      Reject
                    </button>
                    <button
                      onClick={() => updateVerificationStatus(selectedPractitioner._id, 'verified', verificationNotes)}
                      className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700"
                    >
                      Approve
                    </button>
                  </>
                )}
                
                {selectedPractitioner.verificationStatus !== 'pending' && (
                  <button
                    onClick={() => updateVerificationStatus(selectedPractitioner._id, 'pending', verificationNotes)}
                    className="px-4 py-2 bg-yellow-600 text-white rounded-md hover:bg-yellow-700"
                  >
                    Reset to Pending
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

export default PractitionerManagement;

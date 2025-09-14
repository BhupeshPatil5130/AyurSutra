import React, { useState, useEffect } from 'react';
import { 
  FileText, Search, Filter, Calendar, User, Eye, Edit, Plus,
  Download, RefreshCw, Clock, Heart, Activity, AlertTriangle,
  ChevronLeft, ChevronRight, X, Save, Trash2
} from 'lucide-react';
import api from '../../utils/api';


const TreatmentHistoryMedicalRecords = () => {
  const [records, setRecords] = useState([]);
  const [patients, setPatients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [patientFilter, setPatientFilter] = useState('all');
  const [dateFilter, setDateFilter] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [modalType, setModalType] = useState('view');
  const [selectedRecord, setSelectedRecord] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [recordsPerPage] = useState(10);

  useEffect(() => {
    fetchRecords();
    fetchPatients();
  }, [patientFilter, dateFilter]);

  const fetchRecords = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (patientFilter !== 'all') params.append('patientId', patientFilter);
      if (dateFilter) params.append('date', dateFilter);

      const response = await api.get(`/practitioner/medical-records?${params}`);
      setRecords(Array.isArray(response.data) ? response.data : []);
    } catch (error) {
      console.error('Error fetching records:', error);
      setRecords([]);
      
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

  const openModal = (type, record = null) => {
    setModalType(type);
    setSelectedRecord(record);
    setShowModal(true);
  };

  const filteredRecords = records.filter(record =>
    record.patientId?.firstName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    record.patientId?.lastName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    record.diagnosis?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    record.treatment?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const indexOfLastRecord = currentPage * recordsPerPage;
  const indexOfFirstRecord = indexOfLastRecord - recordsPerPage;
  const currentRecords = filteredRecords.slice(indexOfFirstRecord, indexOfLastRecord);
  const totalPages = Math.ceil(filteredRecords.length / recordsPerPage);

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
          <h1 className="text-3xl font-bold text-gray-900">Treatment History & Medical Records</h1>
          <p className="text-gray-600">Comprehensive patient treatment history and medical documentation</p>
        </div>
        <div className="flex items-center space-x-3">
          <button
            onClick={() => openModal('create')}
            className="flex items-center px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700"
          >
            <Plus className="h-4 w-4 mr-2" />
            New Record
          </button>
          <button
            onClick={fetchRecords}
            className="flex items-center px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700"
          >
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </button>
        </div>
      </div>

      {/* Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="p-2 bg-blue-100 rounded-lg">
              <FileText className="h-6 w-6 text-blue-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Total Records</p>
              <p className="text-2xl font-bold text-gray-900">{records.length}</p>
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="p-2 bg-green-100 rounded-lg">
              <User className="h-6 w-6 text-green-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Active Patients</p>
              <p className="text-2xl font-bold text-gray-900">
                {new Set(records.map(r => r.patientId?._id)).size}
              </p>
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="p-2 bg-purple-100 rounded-lg">
              <Activity className="h-6 w-6 text-purple-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">This Month</p>
              <p className="text-2xl font-bold text-gray-900">
                {records.filter(r => {
                  const recordDate = new Date(r.createdAt);
                  const now = new Date();
                  return recordDate.getMonth() === now.getMonth() && 
                         recordDate.getFullYear() === now.getFullYear();
                }).length}
              </p>
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="p-2 bg-yellow-100 rounded-lg">
              <AlertTriangle className="h-6 w-6 text-yellow-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Follow-ups Due</p>
              <p className="text-2xl font-bold text-gray-900">
                {records.filter(r => r.followUpDate && new Date(r.followUpDate) <= new Date()).length}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Search and Filter */}
      <div className="bg-white rounded-lg shadow p-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search records..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
            />
          </div>
          
          <select
            value={patientFilter}
            onChange={(e) => setPatientFilter(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
          >
            <option value="all">All Patients</option>
            {patients.map(patient => (
              <option key={patient._id} value={patient._id}>
                {patient.firstName} {patient.lastName}
              </option>
            ))}
          </select>
          
          <input
            type="date"
            value={dateFilter}
            onChange={(e) => setDateFilter(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
          />
          
          <div className="flex space-x-2">
            <button
              onClick={() => {
                setSearchTerm('');
                setPatientFilter('all');
                setDateFilter('');
              }}
              className="flex-1 px-4 py-2 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200"
            >
              Clear
            </button>
            <button className="flex items-center px-3 py-2 bg-blue-100 text-blue-700 rounded-md hover:bg-blue-200">
              <Download className="h-4 w-4 mr-1" />
              Export
            </button>
          </div>
        </div>
      </div>

      {/* Records List */}
      <div className="bg-white rounded-lg shadow">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900">Medical Records</h3>
        </div>
        
        <div className="divide-y divide-gray-200">
          {currentRecords.length > 0 ? (
            currentRecords.map((record) => (
              <div key={record._id} className="p-6 hover:bg-gray-50">
                <div className="flex items-start justify-between">
                  <div className="flex items-start space-x-4">
                    <div className="w-12 h-12 bg-gradient-to-r from-green-400 to-blue-500 rounded-full flex items-center justify-center text-white font-semibold">
                      {record.patientId?.firstName?.charAt(0)}{record.patientId?.lastName?.charAt(0)}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center space-x-3 mb-2">
                        <h4 className="text-lg font-medium text-gray-900">
                          {record.patientId?.firstName} {record.patientId?.lastName}
                        </h4>
                        <span className="px-2 py-1 text-xs font-semibold rounded-full bg-blue-100 text-blue-700">
                          {record.recordType || 'General'}
                        </span>
                      </div>
                      
                      <div className="space-y-2">
                        <div className="flex items-center text-sm text-gray-600 space-x-4">
                          <span className="flex items-center">
                            <Calendar className="h-4 w-4 mr-1" />
                            {new Date(record.visitDate || record.createdAt).toLocaleDateString()}
                          </span>
                          <span className="flex items-center">
                            <Clock className="h-4 w-4 mr-1" />
                            {record.duration || 60} min
                          </span>
                        </div>
                        
                        {record.chiefComplaint && (
                          <p className="text-sm text-gray-700">
                            <span className="font-medium">Chief Complaint:</span> {record.chiefComplaint}
                          </p>
                        )}
                        
                        {record.diagnosis && (
                          <p className="text-sm text-gray-700">
                            <span className="font-medium">Diagnosis:</span> {record.diagnosis}
                          </p>
                        )}
                        
                        {record.treatment && (
                          <p className="text-sm text-gray-700">
                            <span className="font-medium">Treatment:</span> {record.treatment}
                          </p>
                        )}
                        
                        {record.prescription && record.prescription.length > 0 && (
                          <div className="text-sm text-gray-700">
                            <span className="font-medium">Prescriptions:</span>
                            <ul className="ml-4 mt-1 space-y-1">
                              {record.prescription.slice(0, 2).map((med, index) => (
                                <li key={index} className="text-xs">
                                  • {med.medicine} - {med.dosage} ({med.frequency})
                                </li>
                              ))}
                              {record.prescription.length > 2 && (
                                <li className="text-xs text-gray-500">
                                  +{record.prescription.length - 2} more medicines
                                </li>
                              )}
                            </ul>
                          </div>
                        )}
                        
                        {record.followUpDate && (
                          <p className="text-sm text-orange-600">
                            <span className="font-medium">Follow-up:</span> {new Date(record.followUpDate).toLocaleDateString()}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => openModal('view', record)}
                      className="p-2 text-blue-600 hover:text-blue-800"
                      title="View Details"
                    >
                      <Eye className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => openModal('edit', record)}
                      className="p-2 text-green-600 hover:text-green-800"
                      title="Edit Record"
                    >
                      <Edit className="h-4 w-4" />
                    </button>
                    <button className="p-2 text-purple-600 hover:text-purple-800" title="Download">
                      <Download className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="p-12 text-center">
              <FileText className="h-16 w-16 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500 text-lg">No medical records found</p>
              <p className="text-gray-400">Create your first medical record to get started</p>
            </div>
          )}
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="px-6 py-4 border-t border-gray-200">
            <div className="flex items-center justify-between">
              <div className="text-sm text-gray-700">
                Showing {indexOfFirstRecord + 1} to {Math.min(indexOfLastRecord, filteredRecords.length)} of {filteredRecords.length} results
              </div>
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                  disabled={currentPage === 1}
                  className="p-2 border border-gray-300 rounded-md disabled:opacity-50"
                >
                  <ChevronLeft className="h-4 w-4" />
                </button>
                <span className="px-3 py-2 text-sm">
                  Page {currentPage} of {totalPages}
                </span>
                <button
                  onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                  disabled={currentPage === totalPages}
                  className="p-2 border border-gray-300 rounded-md disabled:opacity-50"
                >
                  <ChevronRight className="h-4 w-4" />
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-4xl max-h-screen overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold">
                {modalType === 'create' ? 'Create Medical Record' : 
                 modalType === 'edit' ? 'Edit Medical Record' : 'Medical Record Details'}
              </h3>
              <button
                onClick={() => setShowModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="h-6 w-6" />
              </button>
            </div>
            <div className="text-center py-8">
              <p className="text-gray-500">Modal content for {modalType} operation</p>
              <p className="text-sm text-gray-400 mt-2">Full form implementation needed</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TreatmentHistoryMedicalRecords;

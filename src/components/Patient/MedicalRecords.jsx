import React, { useState, useEffect } from 'react';
import { 
  FileText, 
  Download, 
  Eye, 
  Calendar, 
  User, 
  Heart,
  Activity,
  Thermometer,
  Droplets,
  Weight,
  Search,
  Filter,
  Plus,
  Upload,
  X
} from 'lucide-react';

const MedicalRecords = () => {
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedRecord, setSelectedRecord] = useState(null);
  const [showRecordModal, setShowRecordModal] = useState(false);
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [filters, setFilters] = useState({
    type: 'all',
    dateRange: 'all',
    practitioner: 'all'
  });
  const [searchTerm, setSearchTerm] = useState('');

  const [uploadForm, setUploadForm] = useState({
    title: '',
    type: 'lab_report',
    description: '',
    file: null
  });

  useEffect(() => {
    fetchMedicalRecords();
  }, [filters, searchTerm]);

  const fetchMedicalRecords = async () => {
    try {
      const token = localStorage.getItem('token');
      const queryParams = new URLSearchParams();
      
      if (filters.type !== 'all') queryParams.append('type', filters.type);
      if (filters.practitioner !== 'all') queryParams.append('practitionerId', filters.practitioner);
      if (searchTerm) queryParams.append('search', searchTerm);
      
      const response = await fetch(`/api/patient/medical-records?${queryParams}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await response.json();
      setRecords(data.records || []);
    } catch (error) {
      console.error('Error fetching medical records:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleUploadRecord = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('token');
      const formData = new FormData();
      formData.append('title', uploadForm.title);
      formData.append('type', uploadForm.type);
      formData.append('description', uploadForm.description);
      if (uploadForm.file) {
        formData.append('document', uploadForm.file);
      }

      const response = await fetch('/api/patient/medical-records', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        },
        body: formData
      });

      if (response.ok) {
        setShowUploadModal(false);
        setUploadForm({
          title: '',
          type: 'lab_report',
          description: '',
          file: null
        });
        fetchMedicalRecords();
      }
    } catch (error) {
      console.error('Error uploading record:', error);
    }
  };

  const getRecordTypeIcon = (type) => {
    switch (type) {
      case 'consultation':
        return <User className="h-5 w-5 text-blue-500" />;
      case 'lab_report':
        return <FileText className="h-5 w-5 text-green-500" />;
      case 'prescription':
        return <Heart className="h-5 w-5 text-red-500" />;
      case 'therapy_notes':
        return <Activity className="h-5 w-5 text-purple-500" />;
      case 'vital_signs':
        return <Thermometer className="h-5 w-5 text-orange-500" />;
      default:
        return <FileText className="h-5 w-5 text-gray-500" />;
    }
  };

  const getRecordTypeColor = (type) => {
    switch (type) {
      case 'consultation':
        return 'bg-blue-100 text-blue-800';
      case 'lab_report':
        return 'bg-green-100 text-green-800';
      case 'prescription':
        return 'bg-red-100 text-red-800';
      case 'therapy_notes':
        return 'bg-purple-100 text-purple-800';
      case 'vital_signs':
        return 'bg-orange-100 text-orange-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const RecordCard = ({ record }) => (
    <div className="bg-white rounded-lg border border-gray-200 p-6 hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center space-x-3">
          {getRecordTypeIcon(record.type)}
          <div>
            <h3 className="font-semibold text-gray-900">{record.title}</h3>
            <p className="text-sm text-gray-600">
              Dr. {record.practitionerId?.firstName} {record.practitionerId?.lastName}
            </p>
          </div>
        </div>
        <span className={`px-2 py-1 text-xs font-medium rounded-full ${getRecordTypeColor(record.type)}`}>
          {record.type.replace('_', ' ')}
        </span>
      </div>

      <div className="space-y-2 mb-4">
        <div className="flex items-center text-sm text-gray-600">
          <Calendar className="h-4 w-4 mr-2" />
          {new Date(record.date).toLocaleDateString()}
        </div>
        {record.description && (
          <p className="text-sm text-gray-700 line-clamp-2">{record.description}</p>
        )}
      </div>

      {/* Vital Signs Preview */}
      {record.vitalSigns && (
        <div className="grid grid-cols-2 gap-3 mb-4 p-3 bg-gray-50 rounded-lg">
          {record.vitalSigns.bloodPressure && (
            <div className="flex items-center text-sm">
              <Heart className="h-4 w-4 text-red-500 mr-1" />
              <span className="text-gray-600">BP:</span>
              <span className="ml-1 font-medium">{record.vitalSigns.bloodPressure}</span>
            </div>
          )}
          {record.vitalSigns.heartRate && (
            <div className="flex items-center text-sm">
              <Activity className="h-4 w-4 text-blue-500 mr-1" />
              <span className="text-gray-600">HR:</span>
              <span className="ml-1 font-medium">{record.vitalSigns.heartRate} bpm</span>
            </div>
          )}
          {record.vitalSigns.temperature && (
            <div className="flex items-center text-sm">
              <Thermometer className="h-4 w-4 text-orange-500 mr-1" />
              <span className="text-gray-600">Temp:</span>
              <span className="ml-1 font-medium">{record.vitalSigns.temperature}°F</span>
            </div>
          )}
          {record.vitalSigns.weight && (
            <div className="flex items-center text-sm">
              <Weight className="h-4 w-4 text-green-500 mr-1" />
              <span className="text-gray-600">Weight:</span>
              <span className="ml-1 font-medium">{record.vitalSigns.weight} kg</span>
            </div>
          )}
        </div>
      )}

      <div className="flex items-center justify-between pt-4 border-t border-gray-100">
        <div className="flex items-center space-x-2">
          {record.documents && record.documents.length > 0 && (
            <span className="text-xs text-gray-500">
              {record.documents.length} attachment(s)
            </span>
          )}
        </div>
        <div className="flex items-center space-x-2">
          <button
            onClick={() => {
              setSelectedRecord(record);
              setShowRecordModal(true);
            }}
            className="flex items-center text-blue-600 hover:text-blue-700 text-sm font-medium"
          >
            <Eye className="h-4 w-4 mr-1" />
            View
          </button>
          {record.documents && record.documents.length > 0 && (
            <button className="flex items-center text-green-600 hover:text-green-700 text-sm font-medium">
              <Download className="h-4 w-4 mr-1" />
              Download
            </button>
          )}
        </div>
      </div>
    </div>
  );

  const RecordModal = () => (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 overflow-y-auto">
      <div className="bg-white rounded-lg p-6 w-full max-w-4xl max-h-screen overflow-y-auto m-4">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-semibold text-gray-900">Medical Record Details</h2>
          <button
            onClick={() => setShowRecordModal(false)}
            className="text-gray-400 hover:text-gray-600"
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        {selectedRecord && (
          <div className="space-y-6">
            {/* Header Info */}
            <div className="bg-gray-50 rounded-lg p-4">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center space-x-3">
                  {getRecordTypeIcon(selectedRecord.type)}
                  <div>
                    <h3 className="text-lg font-semibold">{selectedRecord.title}</h3>
                    <p className="text-gray-600">
                      Dr. {selectedRecord.practitionerId?.firstName} {selectedRecord.practitionerId?.lastName}
                    </p>
                  </div>
                </div>
                <span className={`px-3 py-1 text-sm font-medium rounded-full ${getRecordTypeColor(selectedRecord.type)}`}>
                  {selectedRecord.type.replace('_', ' ')}
                </span>
              </div>
              <div className="flex items-center text-sm text-gray-600">
                <Calendar className="h-4 w-4 mr-2" />
                {new Date(selectedRecord.date).toLocaleDateString()}
              </div>
            </div>

            {/* Description */}
            {selectedRecord.description && (
              <div>
                <h4 className="font-medium text-gray-900 mb-2">Description</h4>
                <p className="text-gray-700 bg-gray-50 p-4 rounded-lg">{selectedRecord.description}</p>
              </div>
            )}

            {/* Vital Signs */}
            {selectedRecord.vitalSigns && (
              <div>
                <h4 className="font-medium text-gray-900 mb-4">Vital Signs</h4>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {selectedRecord.vitalSigns.bloodPressure && (
                    <div className="bg-red-50 p-4 rounded-lg text-center">
                      <Heart className="h-8 w-8 text-red-500 mx-auto mb-2" />
                      <p className="text-sm text-gray-600">Blood Pressure</p>
                      <p className="text-lg font-semibold text-red-700">{selectedRecord.vitalSigns.bloodPressure}</p>
                    </div>
                  )}
                  {selectedRecord.vitalSigns.heartRate && (
                    <div className="bg-blue-50 p-4 rounded-lg text-center">
                      <Activity className="h-8 w-8 text-blue-500 mx-auto mb-2" />
                      <p className="text-sm text-gray-600">Heart Rate</p>
                      <p className="text-lg font-semibold text-blue-700">{selectedRecord.vitalSigns.heartRate} bpm</p>
                    </div>
                  )}
                  {selectedRecord.vitalSigns.temperature && (
                    <div className="bg-orange-50 p-4 rounded-lg text-center">
                      <Thermometer className="h-8 w-8 text-orange-500 mx-auto mb-2" />
                      <p className="text-sm text-gray-600">Temperature</p>
                      <p className="text-lg font-semibold text-orange-700">{selectedRecord.vitalSigns.temperature}°F</p>
                    </div>
                  )}
                  {selectedRecord.vitalSigns.weight && (
                    <div className="bg-green-50 p-4 rounded-lg text-center">
                      <Weight className="h-8 w-8 text-green-500 mx-auto mb-2" />
                      <p className="text-sm text-gray-600">Weight</p>
                      <p className="text-lg font-semibold text-green-700">{selectedRecord.vitalSigns.weight} kg</p>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Diagnosis */}
            {selectedRecord.diagnosis && (
              <div>
                <h4 className="font-medium text-gray-900 mb-2">Diagnosis</h4>
                <p className="text-gray-700 bg-yellow-50 p-4 rounded-lg border-l-4 border-yellow-400">
                  {selectedRecord.diagnosis}
                </p>
              </div>
            )}

            {/* Treatment */}
            {selectedRecord.treatment && (
              <div>
                <h4 className="font-medium text-gray-900 mb-2">Treatment</h4>
                <p className="text-gray-700 bg-green-50 p-4 rounded-lg border-l-4 border-green-400">
                  {selectedRecord.treatment}
                </p>
              </div>
            )}

            {/* Medications */}
            {selectedRecord.medications && selectedRecord.medications.length > 0 && (
              <div>
                <h4 className="font-medium text-gray-900 mb-3">Medications</h4>
                <div className="space-y-2">
                  {selectedRecord.medications.map((medication, index) => (
                    <div key={index} className="bg-blue-50 p-3 rounded-lg border-l-4 border-blue-400">
                      <div className="flex justify-between items-start">
                        <div>
                          <p className="font-medium text-blue-900">{medication.name}</p>
                          <p className="text-sm text-blue-700">{medication.dosage}</p>
                        </div>
                        <span className="text-xs bg-blue-200 text-blue-800 px-2 py-1 rounded">
                          {medication.frequency}
                        </span>
                      </div>
                      {medication.instructions && (
                        <p className="text-sm text-blue-600 mt-2">{medication.instructions}</p>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Documents */}
            {selectedRecord.documents && selectedRecord.documents.length > 0 && (
              <div>
                <h4 className="font-medium text-gray-900 mb-3">Attachments</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {selectedRecord.documents.map((doc, index) => (
                    <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div className="flex items-center space-x-2">
                        <FileText className="h-5 w-5 text-gray-500" />
                        <span className="text-sm text-gray-700">{doc.name || `Document ${index + 1}`}</span>
                      </div>
                      <button className="text-blue-600 hover:text-blue-700 text-sm font-medium">
                        <Download className="h-4 w-4" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Notes */}
            {selectedRecord.notes && (
              <div>
                <h4 className="font-medium text-gray-900 mb-2">Additional Notes</h4>
                <p className="text-gray-700 bg-gray-50 p-4 rounded-lg">{selectedRecord.notes}</p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );

  const UploadModal = () => (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4">
        <h2 className="text-xl font-semibold mb-4">Upload Medical Record</h2>
        
        <form onSubmit={handleUploadRecord} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Title
            </label>
            <input
              type="text"
              value={uploadForm.title}
              onChange={(e) => setUploadForm({...uploadForm, title: e.target.value})}
              className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-500"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Type
            </label>
            <select
              value={uploadForm.type}
              onChange={(e) => setUploadForm({...uploadForm, type: e.target.value})}
              className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-500"
            >
              <option value="lab_report">Lab Report</option>
              <option value="prescription">Prescription</option>
              <option value="consultation">Consultation Notes</option>
              <option value="therapy_notes">Therapy Notes</option>
              <option value="vital_signs">Vital Signs</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Description
            </label>
            <textarea
              value={uploadForm.description}
              onChange={(e) => setUploadForm({...uploadForm, description: e.target.value})}
              className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-500"
              rows="3"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              File (Optional)
            </label>
            <input
              type="file"
              onChange={(e) => setUploadForm({...uploadForm, file: e.target.files[0]})}
              className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-500"
              accept=".pdf,.jpg,.jpeg,.png,.doc,.docx"
            />
          </div>

          <div className="flex space-x-3 pt-4">
            <button
              type="button"
              onClick={() => setShowUploadModal(false)}
              className="flex-1 px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex-1 px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700"
            >
              Upload
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
          <h1 className="text-2xl font-bold text-gray-900">Medical Records</h1>
          <p className="text-gray-600">View and manage your medical history</p>
        </div>
        <button
          onClick={() => setShowUploadModal(true)}
          className="flex items-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
        >
          <Upload className="h-5 w-5 mr-2" />
          Upload Record
        </button>
      </div>

      {/* Search and Filters */}
      <div className="bg-white rounded-lg border border-gray-200 p-4">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1">
            <div className="relative">
              <Search className="h-5 w-5 text-gray-400 absolute left-3 top-1/2 transform -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search records..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
              />
            </div>
          </div>
          
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <Filter className="h-5 w-5 text-gray-400" />
              <span className="text-sm font-medium text-gray-700">Filters:</span>
            </div>
            
            <select
              value={filters.type}
              onChange={(e) => setFilters({...filters, type: e.target.value})}
              className="border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
            >
              <option value="all">All Types</option>
              <option value="consultation">Consultation</option>
              <option value="lab_report">Lab Report</option>
              <option value="prescription">Prescription</option>
              <option value="therapy_notes">Therapy Notes</option>
              <option value="vital_signs">Vital Signs</option>
            </select>

            <select
              value={filters.dateRange}
              onChange={(e) => setFilters({...filters, dateRange: e.target.value})}
              className="border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
            >
              <option value="all">All Dates</option>
              <option value="last_week">Last Week</option>
              <option value="last_month">Last Month</option>
              <option value="last_3_months">Last 3 Months</option>
              <option value="last_year">Last Year</option>
            </select>
          </div>
        </div>
      </div>

      {/* Records List */}
      <div className="space-y-4">
        {records.length > 0 ? (
          records.map(record => (
            <RecordCard key={record._id} record={record} />
          ))
        ) : (
          <div className="bg-white rounded-lg border border-gray-200 p-12 text-center">
            <FileText className="h-16 w-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No medical records found</h3>
            <p className="text-gray-600 mb-6">Your medical records will appear here as they are added by your practitioners</p>
            <button
              onClick={() => setShowUploadModal(true)}
              className="inline-flex items-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
            >
              <Upload className="h-5 w-5 mr-2" />
              Upload Your First Record
            </button>
          </div>
        )}
      </div>

      {/* Modals */}
      {showRecordModal && <RecordModal />}
      {showUploadModal && <UploadModal />}
    </div>
  );
};

export default MedicalRecords;

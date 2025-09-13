import React, { useState, useEffect } from 'react';
import { 
  FileText, Calendar, User, Heart, Activity, Download,
  Eye, Plus, Search, Filter, RefreshCw, Upload, Share2,
  AlertCircle, CheckCircle, Clock, Thermometer, Weight,
  Droplets, Zap, TrendingUp, BarChart3, Edit, Trash2
} from 'lucide-react';
import api from '../../utils/api';
import toast from 'react-hot-toast';

const PatientMedicalRecords = () => {
  const [records, setRecords] = useState([]);
  const [vitals, setVitals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedRecord, setSelectedRecord] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('all');
  const [showAddVital, setShowAddVital] = useState(false);
  const [newVital, setNewVital] = useState({
    type: 'blood_pressure',
    value: '',
    unit: '',
    notes: '',
    recordedAt: new Date().toISOString().split('T')[0]
  });

  const vitalTypes = [
    { value: 'blood_pressure', label: 'Blood Pressure', unit: 'mmHg', icon: Heart },
    { value: 'temperature', label: 'Body Temperature', unit: '°F', icon: Thermometer },
    { value: 'weight', label: 'Weight', unit: 'kg', icon: Weight },
    { value: 'pulse', label: 'Pulse Rate', unit: 'bpm', icon: Activity },
    { value: 'oxygen_saturation', label: 'Oxygen Saturation', unit: '%', icon: Droplets },
    { value: 'blood_sugar', label: 'Blood Sugar', unit: 'mg/dL', icon: Zap }
  ];

  const recordTypes = [
    { value: 'all', label: 'All Records' },
    { value: 'consultation', label: 'Consultations' },
    { value: 'lab_report', label: 'Lab Reports' },
    { value: 'prescription', label: 'Prescriptions' },
    { value: 'diagnosis', label: 'Diagnoses' },
    { value: 'treatment', label: 'Treatments' },
    { value: 'vitals', label: 'Vital Signs' }
  ];

  useEffect(() => {
    fetchMedicalRecords();
    fetchVitals();
  }, [filterType]);

  const fetchMedicalRecords = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (filterType !== 'all') params.append('type', filterType);

      const response = await api.get(`/patient/medical-records?${params}`);
      setRecords(Array.isArray(response.data) ? response.data : []);
    } catch (error) {
      console.error('Error fetching medical records:', error);
      toast.error('Error loading medical records');
      setRecords([]);
    } finally {
      setLoading(false);
    }
  };

  const fetchVitals = async () => {
    try {
      const response = await api.get('/patient/vitals');
      setVitals(Array.isArray(response.data) ? response.data : []);
    } catch (error) {
      console.error('Error fetching vitals:', error);
      setVitals([]);
    }
  };

  const addVitalSign = async () => {
    try {
      const response = await api.post('/patient/vitals', newVital);
      setVitals(prev => [response.data, ...prev]);
      setShowAddVital(false);
      setNewVital({
        type: 'blood_pressure',
        value: '',
        unit: '',
        notes: '',
        recordedAt: new Date().toISOString().split('T')[0]
      });
      toast.success('Vital sign recorded');
    } catch (error) {
      console.error('Error adding vital sign:', error);
      toast.error('Error recording vital sign');
    }
  };

  const uploadDocument = async (event) => {
    const file = event.target.files[0];
    if (file) {
      const formData = new FormData();
      formData.append('document', file);
      
      try {
        const response = await api.post('/patient/medical-records/upload', formData);
        setRecords(prev => [response.data, ...prev]);
        toast.success('Document uploaded successfully');
      } catch (error) {
        console.error('Error uploading document:', error);
        toast.error('Error uploading document');
      }
    }
  };

  const downloadRecord = async (recordId, filename) => {
    try {
      const response = await api.get(`/patient/medical-records/${recordId}/download`, {
        responseType: 'blob'
      });
      
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', filename);
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (error) {
      console.error('Error downloading record:', error);
      toast.error('Error downloading record');
    }
  };

  const getRecordIcon = (type) => {
    switch (type) {
      case 'consultation':
        return <User className="h-5 w-5 text-blue-600" />;
      case 'lab_report':
        return <BarChart3 className="h-5 w-5 text-green-600" />;
      case 'prescription':
        return <FileText className="h-5 w-5 text-purple-600" />;
      case 'diagnosis':
        return <AlertCircle className="h-5 w-5 text-red-600" />;
      case 'treatment':
        return <Heart className="h-5 w-5 text-pink-600" />;
      case 'vitals':
        return <Activity className="h-5 w-5 text-orange-600" />;
      default:
        return <FileText className="h-5 w-5 text-gray-600" />;
    }
  };

  const getVitalIcon = (type) => {
    const vitalType = vitalTypes.find(v => v.value === type);
    return vitalType ? <vitalType.icon className="h-5 w-5" /> : <Activity className="h-5 w-5" />;
  };

  const filteredRecords = records.filter(record =>
    record.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    record.practitioner?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    record.diagnosis?.toLowerCase().includes(searchTerm.toLowerCase())
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
          <h1 className="text-3xl font-bold text-gray-900">Medical Records</h1>
          <p className="text-gray-600">View and manage your health records and vital signs</p>
        </div>
        <div className="flex items-center space-x-3">
          <label className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 cursor-pointer">
            <Upload className="h-4 w-4 mr-2" />
            Upload Document
            <input
              type="file"
              accept=".pdf,.jpg,.jpeg,.png,.doc,.docx"
              onChange={uploadDocument}
              className="hidden"
            />
          </label>
          <button
            onClick={() => setShowAddVital(true)}
            className="flex items-center px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700"
          >
            <Plus className="h-4 w-4 mr-2" />
            Add Vital
          </button>
          <button
            onClick={fetchMedicalRecords}
            className="flex items-center px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700"
          >
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </button>
        </div>
      </div>

      {/* Vital Signs Overview */}
      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900">Recent Vital Signs</h3>
          <button
            onClick={() => setShowAddVital(true)}
            className="text-blue-600 hover:text-blue-800 text-sm font-medium"
          >
            Record New Vital
          </button>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-4">
          {vitalTypes.map((vitalType) => {
            const latestVital = vitals
              .filter(v => v.type === vitalType.value)
              .sort((a, b) => new Date(b.recordedAt) - new Date(a.recordedAt))[0];
            
            return (
              <div key={vitalType.value} className="bg-gray-50 p-4 rounded-lg">
                <div className="flex items-center mb-2">
                  <vitalType.icon className="h-5 w-5 text-gray-600 mr-2" />
                  <span className="text-sm font-medium text-gray-900">{vitalType.label}</span>
                </div>
                {latestVital ? (
                  <div>
                    <p className="text-lg font-bold text-gray-900">
                      {latestVital.value} {latestVital.unit}
                    </p>
                    <p className="text-xs text-gray-500">
                      {new Date(latestVital.recordedAt).toLocaleDateString()}
                    </p>
                  </div>
                ) : (
                  <p className="text-sm text-gray-500">No data</p>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Search and Filters */}
      <div className="bg-white rounded-lg shadow p-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search records..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
            />
          </div>
          
          <select
            value={filterType}
            onChange={(e) => setFilterType(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
          >
            {recordTypes.map((type) => (
              <option key={type.value} value={type.value}>{type.label}</option>
            ))}
          </select>
          
          <button className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700">
            <Download className="h-4 w-4 mr-2" />
            Export All
          </button>
        </div>
      </div>

      {/* Medical Records List */}
      <div className="bg-white rounded-lg shadow">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900">
            Medical Records ({filteredRecords.length})
          </h3>
        </div>
        
        <div className="divide-y divide-gray-200">
          {filteredRecords.length > 0 ? (
            filteredRecords.map((record) => (
              <div key={record._id} className="p-6 hover:bg-gray-50">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <div className="flex-shrink-0">
                      {getRecordIcon(record.type)}
                    </div>
                    
                    <div className="flex-1">
                      <div className="flex items-center space-x-3">
                        <h4 className="text-lg font-medium text-gray-900">
                          {record.title || `${record.type.replace('_', ' ').toUpperCase()}`}
                        </h4>
                        <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                          record.status === 'normal' ? 'bg-green-100 text-green-800' :
                          record.status === 'abnormal' ? 'bg-red-100 text-red-800' :
                          'bg-gray-100 text-gray-800'
                        }`}>
                          {record.status || 'Reviewed'}
                        </span>
                      </div>
                      
                      <div className="mt-1 flex items-center space-x-4 text-sm text-gray-600">
                        <div className="flex items-center">
                          <Calendar className="h-4 w-4 mr-1" />
                          {new Date(record.date).toLocaleDateString()}
                        </div>
                        {record.practitioner && (
                          <div className="flex items-center">
                            <User className="h-4 w-4 mr-1" />
                            Dr. {record.practitioner.name}
                          </div>
                        )}
                        {record.facility && (
                          <div className="flex items-center">
                            <FileText className="h-4 w-4 mr-1" />
                            {record.facility}
                          </div>
                        )}
                      </div>
                      
                      {record.diagnosis && (
                        <div className="mt-2 text-sm text-gray-700">
                          <span className="font-medium">Diagnosis:</span> {record.diagnosis}
                        </div>
                      )}
                      
                      {record.summary && (
                        <div className="mt-2 text-sm text-gray-600">
                          {record.summary}
                        </div>
                      )}
                      
                      {record.medications && record.medications.length > 0 && (
                        <div className="mt-2">
                          <span className="text-sm font-medium text-gray-700">Medications: </span>
                          <div className="flex flex-wrap gap-1 mt-1">
                            {record.medications.slice(0, 3).map((med, index) => (
                              <span
                                key={index}
                                className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800"
                              >
                                {med.name}
                              </span>
                            ))}
                            {record.medications.length > 3 && (
                              <span className="text-xs text-gray-500">
                                +{record.medications.length - 3} more
                              </span>
                            )}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => setSelectedRecord(record)}
                      className="p-2 text-gray-600 hover:bg-gray-100 rounded-full"
                      title="View Details"
                    >
                      <Eye className="h-5 w-5" />
                    </button>
                    
                    {record.fileUrl && (
                      <button
                        onClick={() => downloadRecord(record._id, record.filename)}
                        className="p-2 text-blue-600 hover:bg-blue-100 rounded-full"
                        title="Download"
                      >
                        <Download className="h-5 w-5" />
                      </button>
                    )}
                    
                    <button
                      className="p-2 text-green-600 hover:bg-green-100 rounded-full"
                      title="Share"
                    >
                      <Share2 className="h-5 w-5" />
                    </button>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="p-12 text-center">
              <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No medical records found</h3>
              <p className="text-gray-500 mb-4">
                {searchTerm ? 'Try adjusting your search terms.' : 'Your medical records will appear here.'}
              </p>
              <label className="inline-flex items-center px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 cursor-pointer">
                <Upload className="h-4 w-4 mr-2" />
                Upload Your First Record
                <input
                  type="file"
                  accept=".pdf,.jpg,.jpeg,.png,.doc,.docx"
                  onChange={uploadDocument}
                  className="hidden"
                />
              </label>
            </div>
          )}
        </div>
      </div>

      {/* Record Detail Modal */}
      {selectedRecord && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-2xl max-h-screen overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-semibold text-gray-900">Record Details</h3>
              <button
                onClick={() => setSelectedRecord(null)}
                className="text-gray-400 hover:text-gray-600"
              >
                ×
              </button>
            </div>
            
            <div className="space-y-6">
              <div className="flex items-center space-x-4">
                {getRecordIcon(selectedRecord.type)}
                <div>
                  <h4 className="text-lg font-bold text-gray-900">{selectedRecord.title}</h4>
                  <p className="text-gray-600">{selectedRecord.type.replace('_', ' ').toUpperCase()}</p>
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h5 className="font-medium text-gray-900 mb-2">Record Information</h5>
                  <div className="space-y-2 text-sm">
                    <p><span className="font-medium">Date:</span> {new Date(selectedRecord.date).toLocaleDateString()}</p>
                    <p><span className="font-medium">Type:</span> {selectedRecord.type.replace('_', ' ')}</p>
                    <p><span className="font-medium">Status:</span> {selectedRecord.status || 'Reviewed'}</p>
                    {selectedRecord.practitioner && (
                      <p><span className="font-medium">Practitioner:</span> Dr. {selectedRecord.practitioner.name}</p>
                    )}
                    {selectedRecord.facility && (
                      <p><span className="font-medium">Facility:</span> {selectedRecord.facility}</p>
                    )}
                  </div>
                </div>
                
                {selectedRecord.vitals && (
                  <div>
                    <h5 className="font-medium text-gray-900 mb-2">Vital Signs</h5>
                    <div className="space-y-2 text-sm">
                      {Object.entries(selectedRecord.vitals).map(([key, value]) => (
                        <p key={key}>
                          <span className="font-medium capitalize">{key.replace('_', ' ')}:</span> {value}
                        </p>
                      ))}
                    </div>
                  </div>
                )}
              </div>
              
              {selectedRecord.diagnosis && (
                <div>
                  <h5 className="font-medium text-gray-900 mb-2">Diagnosis</h5>
                  <p className="text-sm text-gray-700">{selectedRecord.diagnosis}</p>
                </div>
              )}
              
              {selectedRecord.treatment && (
                <div>
                  <h5 className="font-medium text-gray-900 mb-2">Treatment</h5>
                  <p className="text-sm text-gray-700">{selectedRecord.treatment}</p>
                </div>
              )}
              
              {selectedRecord.medications && selectedRecord.medications.length > 0 && (
                <div>
                  <h5 className="font-medium text-gray-900 mb-2">Medications</h5>
                  <div className="space-y-2">
                    {selectedRecord.medications.map((med, index) => (
                      <div key={index} className="bg-gray-50 p-3 rounded-lg">
                        <div className="flex justify-between items-start">
                          <div>
                            <p className="font-medium text-gray-900">{med.name}</p>
                            <p className="text-sm text-gray-600">{med.dosage}</p>
                          </div>
                          <div className="text-right text-sm text-gray-500">
                            <p>{med.frequency}</p>
                            <p>{med.duration}</p>
                          </div>
                        </div>
                        {med.instructions && (
                          <p className="text-sm text-gray-600 mt-2">{med.instructions}</p>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}
              
              {selectedRecord.notes && (
                <div>
                  <h5 className="font-medium text-gray-900 mb-2">Notes</h5>
                  <p className="text-sm text-gray-700">{selectedRecord.notes}</p>
                </div>
              )}
              
              <div className="flex space-x-3">
                {selectedRecord.fileUrl && (
                  <button
                    onClick={() => downloadRecord(selectedRecord._id, selectedRecord.filename)}
                    className="flex-1 flex items-center justify-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                  >
                    <Download className="h-4 w-4 mr-2" />
                    Download File
                  </button>
                )}
                <button className="flex-1 flex items-center justify-center px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700">
                  <Share2 className="h-4 w-4 mr-2" />
                  Share Record
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Add Vital Modal */}
      {showAddVital && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-semibold text-gray-900">Record Vital Sign</h3>
              <button
                onClick={() => setShowAddVital(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                ×
              </button>
            </div>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Vital Type</label>
                <select
                  value={newVital.type}
                  onChange={(e) => {
                    const selectedType = vitalTypes.find(v => v.value === e.target.value);
                    setNewVital(prev => ({ 
                      ...prev, 
                      type: e.target.value,
                      unit: selectedType?.unit || ''
                    }));
                  }}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                >
                  {vitalTypes.map((type) => (
                    <option key={type.value} value={type.value}>{type.label}</option>
                  ))}
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Value</label>
                <div className="flex space-x-2">
                  <input
                    type="text"
                    value={newVital.value}
                    onChange={(e) => setNewVital(prev => ({ ...prev, value: e.target.value }))}
                    placeholder="Enter value"
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                  />
                  <span className="px-3 py-2 bg-gray-100 border border-gray-300 rounded-md text-gray-600">
                    {vitalTypes.find(v => v.value === newVital.type)?.unit}
                  </span>
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Date Recorded</label>
                <input
                  type="date"
                  value={newVital.recordedAt}
                  onChange={(e) => setNewVital(prev => ({ ...prev, recordedAt: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Notes (Optional)</label>
                <textarea
                  value={newVital.notes}
                  onChange={(e) => setNewVital(prev => ({ ...prev, notes: e.target.value }))}
                  rows={3}
                  placeholder="Any additional notes..."
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                />
              </div>
            </div>
            
            <div className="flex items-center justify-end space-x-3 mt-6">
              <button
                onClick={() => setShowAddVital(false)}
                className="px-4 py-2 bg-gray-300 text-gray-700 rounded-md hover:bg-gray-400"
              >
                Cancel
              </button>
              <button
                onClick={addVitalSign}
                disabled={!newVital.value}
                className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Record Vital
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PatientMedicalRecords;

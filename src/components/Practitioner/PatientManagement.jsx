import React, { useState, useEffect } from 'react';
import { 
  Users, 
  Search, 
  Filter, 
  Eye, 
  Calendar, 
  Heart, 
  Phone, 
  Mail, 
  MapPin,
  Clock,
  Star,
  Plus,
  FileText,
  Activity
} from 'lucide-react';
import api from '../../utils/api';
import toast from 'react-hot-toast';

const PatientManagement = () => {
  const [patients, setPatients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedPatient, setSelectedPatient] = useState(null);
  const [showPatientDetails, setShowPatientDetails] = useState(false);
  const [patientStats, setPatientStats] = useState({});
  const [filterStatus, setFilterStatus] = useState('all');

  useEffect(() => {
    fetchPatients();
  }, []);

  const fetchPatients = async () => {
    try {
      const response = await api.get('/practitioner/patients');
      setPatients(response.data);
      
      // Fetch stats for each patient
      const statsPromises = response.data.map(async (patient) => {
        try {
          const statsResponse = await api.get(`/practitioner/patients/${patient._id}/stats`);
          return { patientId: patient._id, stats: statsResponse.data };
        } catch (error) {
          return { patientId: patient._id, stats: {} };
        }
      });
      
      const statsResults = await Promise.all(statsPromises);
      const statsMap = {};
      statsResults.forEach(result => {
        statsMap[result.patientId] = result.stats;
      });
      setPatientStats(statsMap);
      
    } catch (error) {
      console.error('Error fetching patients:', error);
      toast.error('Error fetching patients');
    } finally {
      setLoading(false);
    }
  };

  const fetchPatientDetails = async (patientId) => {
    try {
      const response = await api.get(`/practitioner/patients/${patientId}`);
      setSelectedPatient(response.data);
      setShowPatientDetails(true);
    } catch (error) {
      console.error('Error fetching patient details:', error);
      toast.error('Error fetching patient details');
    }
  };

  const getConstitutionColor = (constitution) => {
    switch (constitution?.toLowerCase()) {
      case 'vata': return 'text-blue-700 bg-blue-100';
      case 'pitta': return 'text-red-700 bg-red-100';
      case 'kapha': return 'text-green-700 bg-green-100';
      default: return 'text-gray-700 bg-gray-100';
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'active': return 'text-green-700 bg-green-100';
      case 'inactive': return 'text-gray-700 bg-gray-100';
      case 'completed': return 'text-blue-700 bg-blue-100';
      default: return 'text-gray-700 bg-gray-100';
    }
  };

  const filteredPatients = patients.filter(patient => {
    const matchesSearch = 
      patient.userId?.firstName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      patient.userId?.lastName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      patient.userId?.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      patient.constitution?.toLowerCase().includes(searchTerm.toLowerCase());
    
    if (filterStatus === 'all') return matchesSearch;
    
    const stats = patientStats[patient._id];
    if (filterStatus === 'active') {
      return matchesSearch && stats?.activeTherapyPlans > 0;
    }
    if (filterStatus === 'completed') {
      return matchesSearch && stats?.completedTherapyPlans > 0;
    }
    
    return matchesSearch;
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
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Patient Management</h1>
          <p className="text-gray-600">Manage your patients and their treatment progress</p>
        </div>
        <div className="flex items-center space-x-3">
          <span className="text-sm text-gray-500">Total Patients: {patients.length}</span>
        </div>
      </div>

      {/* Search and Filter */}
      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search patients by name, email, or constitution..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
              />
            </div>
          </div>
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
          >
            <option value="all">All Patients</option>
            <option value="active">Active Treatment</option>
            <option value="completed">Completed Treatment</option>
          </select>
        </div>
      </div>

      {/* Patients Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredPatients.map((patient) => {
          const stats = patientStats[patient._id] || {};
          return (
            <div key={patient._id} className="bg-white rounded-lg shadow hover:shadow-md transition-shadow p-6">
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center">
                  <div className="w-12 h-12 bg-gradient-to-r from-green-400 to-blue-500 rounded-full flex items-center justify-center text-white font-semibold text-lg">
                    {patient.userId?.firstName?.charAt(0)}{patient.userId?.lastName?.charAt(0)}
                  </div>
                  <div className="ml-3">
                    <h3 className="text-lg font-semibold text-gray-900">
                      {patient.userId?.firstName} {patient.userId?.lastName}
                    </h3>
                    <p className="text-sm text-gray-600">{patient.userId?.email}</p>
                  </div>
                </div>
                {patient.constitution && (
                  <span className={`px-2 py-1 text-xs font-semibold rounded-full ${getConstitutionColor(patient.constitution)}`}>
                    {patient.constitution}
                  </span>
                )}
              </div>

              <div className="space-y-3">
                <div className="flex items-center text-sm text-gray-600">
                  <Phone className="h-4 w-4 mr-2" />
                  {patient.phone || 'Not provided'}
                </div>
                
                <div className="flex items-center text-sm text-gray-600">
                  <Calendar className="h-4 w-4 mr-2" />
                  Age: {patient.age || 'Not specified'}
                </div>
                
                {patient.medicalHistory?.length > 0 && (
                  <div className="flex items-center text-sm text-gray-600">
                    <FileText className="h-4 w-4 mr-2" />
                    Medical History: {patient.medicalHistory.slice(0, 2).join(', ')}
                    {patient.medicalHistory.length > 2 && '...'}
                  </div>
                )}

                {/* Patient Stats */}
                <div className="grid grid-cols-2 gap-3 pt-3 border-t border-gray-100">
                  <div className="text-center">
                    <div className="text-lg font-semibold text-green-600">
                      {stats.activeTherapyPlans || 0}
                    </div>
                    <div className="text-xs text-gray-500">Active Plans</div>
                  </div>
                  <div className="text-center">
                    <div className="text-lg font-semibold text-blue-600">
                      {stats.totalAppointments || 0}
                    </div>
                    <div className="text-xs text-gray-500">Appointments</div>
                  </div>
                </div>

                {stats.nextAppointment && (
                  <div className="bg-green-50 border border-green-200 rounded-md p-2">
                    <div className="flex items-center text-sm text-green-700">
                      <Clock className="h-4 w-4 mr-2" />
                      Next: {new Date(stats.nextAppointment).toLocaleDateString()}
                    </div>
                  </div>
                )}
              </div>

              <div className="flex justify-end space-x-2 mt-4 pt-4 border-t border-gray-100">
                <button
                  onClick={() => fetchPatientDetails(patient._id)}
                  className="flex items-center px-3 py-1 text-sm bg-blue-100 text-blue-700 rounded-md hover:bg-blue-200"
                >
                  <Eye className="h-4 w-4 mr-1" />
                  View Details
                </button>
                <button className="flex items-center px-3 py-1 text-sm bg-green-100 text-green-700 rounded-md hover:bg-green-200">
                  <Calendar className="h-4 w-4 mr-1" />
                  Schedule
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {filteredPatients.length === 0 && (
        <div className="text-center py-8">
          <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-500">No patients found</p>
        </div>
      )}

      {/* Patient Details Modal */}
      {showPatientDetails && selectedPatient && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 overflow-y-auto">
          <div className="bg-white rounded-lg p-6 w-full max-w-4xl max-h-screen overflow-y-auto m-4">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-semibold text-gray-900">Patient Details</h3>
              <button
                onClick={() => setShowPatientDetails(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                ×
              </button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Patient Information */}
              <div className="lg:col-span-1">
                <div className="bg-gray-50 rounded-lg p-4">
                  <div className="text-center mb-4">
                    <div className="w-20 h-20 bg-gradient-to-r from-green-400 to-blue-500 rounded-full flex items-center justify-center text-white font-semibold text-2xl mx-auto mb-3">
                      {selectedPatient.userId?.firstName?.charAt(0)}{selectedPatient.userId?.lastName?.charAt(0)}
                    </div>
                    <h4 className="text-lg font-semibold text-gray-900">
                      {selectedPatient.userId?.firstName} {selectedPatient.userId?.lastName}
                    </h4>
                    <p className="text-sm text-gray-600">{selectedPatient.userId?.email}</p>
                  </div>

                  <div className="space-y-3">
                    <div className="flex items-center">
                      <Phone className="h-4 w-4 text-gray-400 mr-2" />
                      <span className="text-sm">{selectedPatient.phone || 'Not provided'}</span>
                    </div>
                    
                    <div className="flex items-center">
                      <Calendar className="h-4 w-4 text-gray-400 mr-2" />
                      <span className="text-sm">Age: {selectedPatient.age || 'Not specified'}</span>
                    </div>
                    
                    <div className="flex items-center">
                      <MapPin className="h-4 w-4 text-gray-400 mr-2" />
                      <span className="text-sm">{selectedPatient.address || 'Address not provided'}</span>
                    </div>

                    {selectedPatient.constitution && (
                      <div className="flex items-center">
                        <Activity className="h-4 w-4 text-gray-400 mr-2" />
                        <span className={`px-2 py-1 text-xs font-semibold rounded-full ${getConstitutionColor(selectedPatient.constitution)}`}>
                          {selectedPatient.constitution} Constitution
                        </span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Medical History */}
                {selectedPatient.medicalHistory?.length > 0 && (
                  <div className="bg-gray-50 rounded-lg p-4 mt-4">
                    <h5 className="font-medium text-gray-900 mb-2">Medical History</h5>
                    <div className="space-y-1">
                      {selectedPatient.medicalHistory.map((condition, index) => (
                        <div key={index} className="text-sm text-gray-600 bg-white px-2 py-1 rounded">
                          {condition}
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Current Medications */}
                {selectedPatient.currentMedications?.length > 0 && (
                  <div className="bg-gray-50 rounded-lg p-4 mt-4">
                    <h5 className="font-medium text-gray-900 mb-2">Current Medications</h5>
                    <div className="space-y-1">
                      {selectedPatient.currentMedications.map((medication, index) => (
                        <div key={index} className="text-sm text-gray-600 bg-white px-2 py-1 rounded">
                          {medication}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Therapy Plans and Appointments */}
              <div className="lg:col-span-2">
                <div className="space-y-6">
                  {/* Active Therapy Plans */}
                  <div>
                    <h5 className="font-medium text-gray-900 mb-3">Active Therapy Plans</h5>
                    {selectedPatient.therapyPlans?.filter(plan => plan.status === 'active').length > 0 ? (
                      <div className="space-y-3">
                        {selectedPatient.therapyPlans.filter(plan => plan.status === 'active').map((plan) => (
                          <div key={plan._id} className="bg-green-50 border border-green-200 rounded-lg p-4">
                            <div className="flex items-start justify-between">
                              <div>
                                <h6 className="font-medium text-gray-900">{plan.title}</h6>
                                <p className="text-sm text-gray-600 mt-1">{plan.description}</p>
                                <div className="flex items-center mt-2 space-x-4">
                                  <span className="text-xs text-gray-500">
                                    Type: {plan.therapyType}
                                  </span>
                                  <span className="text-xs text-gray-500">
                                    Duration: {plan.duration} days
                                  </span>
                                  <span className="text-xs text-gray-500">
                                    Sessions: {plan.sessions?.length || 0}
                                  </span>
                                </div>
                              </div>
                              <span className="px-2 py-1 text-xs font-semibold rounded-full bg-green-100 text-green-700">
                                Active
                              </span>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-sm text-gray-500">No active therapy plans</p>
                    )}
                  </div>

                  {/* Recent Appointments */}
                  <div>
                    <h5 className="font-medium text-gray-900 mb-3">Recent Appointments</h5>
                    {selectedPatient.appointments?.length > 0 ? (
                      <div className="space-y-3">
                        {selectedPatient.appointments.slice(0, 5).map((appointment) => (
                          <div key={appointment._id} className="bg-white border border-gray-200 rounded-lg p-4">
                            <div className="flex items-start justify-between">
                              <div>
                                <div className="flex items-center">
                                  <Calendar className="h-4 w-4 text-gray-400 mr-2" />
                                  <span className="text-sm font-medium">
                                    {new Date(appointment.appointmentDate).toLocaleDateString()}
                                  </span>
                                  <span className="text-sm text-gray-500 ml-2">
                                    {appointment.startTime} - {appointment.endTime}
                                  </span>
                                </div>
                                <p className="text-sm text-gray-600 mt-1">
                                  Type: {appointment.type} • Duration: {appointment.duration} min
                                </p>
                                {appointment.notes && (
                                  <p className="text-sm text-gray-600 mt-1">
                                    Notes: {appointment.notes}
                                  </p>
                                )}
                              </div>
                              <span className={`px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(appointment.status)}`}>
                                {appointment.status}
                              </span>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-sm text-gray-500">No appointments found</p>
                    )}
                  </div>

                  {/* Patient Reviews */}
                  {selectedPatient.reviews?.length > 0 && (
                    <div>
                      <h5 className="font-medium text-gray-900 mb-3">Patient Reviews</h5>
                      <div className="space-y-3">
                        {selectedPatient.reviews.slice(0, 3).map((review) => (
                          <div key={review._id} className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                            <div className="flex items-start justify-between">
                              <div>
                                <div className="flex items-center mb-2">
                                  <div className="flex items-center">
                                    {[...Array(5)].map((_, i) => (
                                      <Star
                                        key={i}
                                        className={`h-4 w-4 ${
                                          i < review.rating ? 'text-yellow-400 fill-current' : 'text-gray-300'
                                        }`}
                                      />
                                    ))}
                                  </div>
                                  <span className="text-sm text-gray-500 ml-2">
                                    {new Date(review.createdAt).toLocaleDateString()}
                                  </span>
                                </div>
                                <p className="text-sm text-gray-700">{review.comment}</p>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>

            <div className="flex justify-end space-x-3 mt-6">
              <button
                onClick={() => setShowPatientDetails(false)}
                className="px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50"
              >
                Close
              </button>
              <button className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700">
                Schedule Appointment
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PatientManagement;

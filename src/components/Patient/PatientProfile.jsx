import React, { useState, useEffect } from 'react';
import { 
  User, 
  Edit, 
  Save, 
  X, 
  Phone, 
  Mail, 
  MapPin,
  Calendar,
  Heart,
  FileText,
  Activity
} from 'lucide-react';
import api from '../../utils/api';
import toast from 'react-hot-toast';

const PatientProfile = () => {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    age: '',
    gender: '',
    address: '',
    emergencyContact: {
      name: '',
      relationship: '',
      phone: ''
    },
    medicalHistory: [],
    currentMedications: [],
    allergies: [],
    constitution: '',
    preferredPractitioner: ''
  });

  const constitutionTypes = ['Vata', 'Pitta', 'Kapha', 'Vata-Pitta', 'Pitta-Kapha', 'Vata-Kapha'];
  const genderOptions = ['Male', 'Female', 'Other', 'Prefer not to say'];

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      const response = await api.get('/patient/profile');
      setProfile(response.data);
      setFormData({
        firstName: response.data.userId?.firstName || '',
        lastName: response.data.userId?.lastName || '',
        email: response.data.userId?.email || '',
        phone: response.data.phone || '',
        age: response.data.age || '',
        gender: response.data.gender || '',
        address: response.data.address || '',
        emergencyContact: response.data.emergencyContact || {
          name: '',
          relationship: '',
          phone: ''
        },
        medicalHistory: response.data.medicalHistory || [],
        currentMedications: response.data.currentMedications || [],
        allergies: response.data.allergies || [],
        constitution: response.data.constitution || '',
        preferredPractitioner: response.data.preferredPractitioner || ''
      });
    } catch (error) {
      console.error('Error fetching profile:', error);
      toast.error('Error fetching profile');
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    try {
      await api.put('/patient/profile', formData);
      toast.success('Profile updated successfully');
      setEditing(false);
      fetchProfile();
    } catch (error) {
      console.error('Error updating profile:', error);
      toast.error('Error updating profile');
    }
  };

  const handleCancel = () => {
    setEditing(false);
    if (profile) {
      setFormData({
        firstName: profile.userId?.firstName || '',
        lastName: profile.userId?.lastName || '',
        email: profile.userId?.email || '',
        phone: profile.phone || '',
        age: profile.age || '',
        gender: profile.gender || '',
        address: profile.address || '',
        emergencyContact: profile.emergencyContact || {
          name: '',
          relationship: '',
          phone: ''
        },
        medicalHistory: profile.medicalHistory || [],
        currentMedications: profile.currentMedications || [],
        allergies: profile.allergies || [],
        constitution: profile.constitution || '',
        preferredPractitioner: profile.preferredPractitioner || ''
      });
    }
  };

  const addArrayItem = (field) => {
    const item = prompt(`Add ${field.replace(/([A-Z])/g, ' $1').toLowerCase()}:`);
    if (item) {
      setFormData(prev => ({
        ...prev,
        [field]: [...prev[field], item]
      }));
    }
  };

  const removeArrayItem = (field, index) => {
    setFormData(prev => ({
      ...prev,
      [field]: prev[field].filter((_, i) => i !== index)
    }));
  };

  const getConstitutionColor = (constitution) => {
    switch (constitution?.toLowerCase()) {
      case 'vata': return 'text-blue-700 bg-blue-100';
      case 'pitta': return 'text-red-700 bg-red-100';
      case 'kapha': return 'text-green-700 bg-green-100';
      default: return 'text-purple-700 bg-purple-100';
    }
  };

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
          <h1 className="text-2xl font-bold text-gray-900">My Profile</h1>
          <p className="text-gray-600">Manage your personal information and medical details</p>
        </div>
        {!editing ? (
          <button
            onClick={() => setEditing(true)}
            className="flex items-center px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700"
          >
            <Edit className="h-4 w-4 mr-2" />
            Edit Profile
          </button>
        ) : (
          <div className="flex space-x-2">
            <button
              onClick={handleSave}
              className="flex items-center px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700"
            >
              <Save className="h-4 w-4 mr-2" />
              Save
            </button>
            <button
              onClick={handleCancel}
              className="flex items-center px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50"
            >
              <X className="h-4 w-4 mr-2" />
              Cancel
            </button>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Profile Overview */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-lg shadow p-6">
            <div className="text-center mb-6">
              <div className="w-24 h-24 bg-gradient-to-r from-green-400 to-blue-500 rounded-full flex items-center justify-center text-white font-semibold text-3xl mx-auto mb-4">
                {formData.firstName?.charAt(0)}{formData.lastName?.charAt(0)}
              </div>
              <h3 className="text-xl font-semibold text-gray-900">
                {formData.firstName} {formData.lastName}
              </h3>
              <p className="text-gray-600">{formData.email}</p>
              {formData.constitution && (
                <span className={`inline-flex items-center px-3 py-1 text-sm font-semibold rounded-full mt-2 ${getConstitutionColor(formData.constitution)}`}>
                  <Activity className="h-4 w-4 mr-1" />
                  {formData.constitution} Constitution
                </span>
              )}
            </div>

            <div className="space-y-3">
              <div className="flex items-center text-sm text-gray-600">
                <Phone className="h-4 w-4 mr-3" />
                {formData.phone || 'Not provided'}
              </div>
              <div className="flex items-center text-sm text-gray-600">
                <Calendar className="h-4 w-4 mr-3" />
                Age: {formData.age || 'Not specified'}
              </div>
              <div className="flex items-center text-sm text-gray-600">
                <User className="h-4 w-4 mr-3" />
                {formData.gender || 'Not specified'}
              </div>
              <div className="flex items-start text-sm text-gray-600">
                <MapPin className="h-4 w-4 mr-3 mt-0.5" />
                <span>{formData.address || 'Address not provided'}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Profile Details */}
        <div className="lg:col-span-2 space-y-6">
          {/* Basic Information */}
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Basic Information</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">First Name</label>
                {editing ? (
                  <input
                    type="text"
                    value={formData.firstName}
                    onChange={(e) => setFormData(prev => ({ ...prev, firstName: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                  />
                ) : (
                  <p className="text-gray-900">{formData.firstName || 'Not provided'}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Last Name</label>
                {editing ? (
                  <input
                    type="text"
                    value={formData.lastName}
                    onChange={(e) => setFormData(prev => ({ ...prev, lastName: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                  />
                ) : (
                  <p className="text-gray-900">{formData.lastName || 'Not provided'}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                {editing ? (
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                  />
                ) : (
                  <p className="text-gray-900">{formData.email || 'Not provided'}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
                {editing ? (
                  <input
                    type="tel"
                    value={formData.phone}
                    onChange={(e) => setFormData(prev => ({ ...prev, phone: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                  />
                ) : (
                  <p className="text-gray-900">{formData.phone || 'Not provided'}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Age</label>
                {editing ? (
                  <input
                    type="number"
                    value={formData.age}
                    onChange={(e) => setFormData(prev => ({ ...prev, age: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                  />
                ) : (
                  <p className="text-gray-900">{formData.age || 'Not specified'}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Gender</label>
                {editing ? (
                  <select
                    value={formData.gender}
                    onChange={(e) => setFormData(prev => ({ ...prev, gender: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                  >
                    <option value="">Select Gender</option>
                    {genderOptions.map(option => (
                      <option key={option} value={option}>{option}</option>
                    ))}
                  </select>
                ) : (
                  <p className="text-gray-900">{formData.gender || 'Not specified'}</p>
                )}
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">Address</label>
                {editing ? (
                  <textarea
                    value={formData.address}
                    onChange={(e) => setFormData(prev => ({ ...prev, address: e.target.value }))}
                    rows={2}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                  />
                ) : (
                  <p className="text-gray-900">{formData.address || 'Not provided'}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Constitution</label>
                {editing ? (
                  <select
                    value={formData.constitution}
                    onChange={(e) => setFormData(prev => ({ ...prev, constitution: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                  >
                    <option value="">Select Constitution</option>
                    {constitutionTypes.map(type => (
                      <option key={type} value={type}>{type}</option>
                    ))}
                  </select>
                ) : (
                  <p className="text-gray-900">{formData.constitution || 'Not determined'}</p>
                )}
              </div>
            </div>
          </div>

          {/* Emergency Contact */}
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Emergency Contact</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
                {editing ? (
                  <input
                    type="text"
                    value={formData.emergencyContact.name}
                    onChange={(e) => setFormData(prev => ({
                      ...prev,
                      emergencyContact: { ...prev.emergencyContact, name: e.target.value }
                    }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                  />
                ) : (
                  <p className="text-gray-900">{formData.emergencyContact.name || 'Not provided'}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Relationship</label>
                {editing ? (
                  <input
                    type="text"
                    value={formData.emergencyContact.relationship}
                    onChange={(e) => setFormData(prev => ({
                      ...prev,
                      emergencyContact: { ...prev.emergencyContact, relationship: e.target.value }
                    }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                  />
                ) : (
                  <p className="text-gray-900">{formData.emergencyContact.relationship || 'Not provided'}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
                {editing ? (
                  <input
                    type="tel"
                    value={formData.emergencyContact.phone}
                    onChange={(e) => setFormData(prev => ({
                      ...prev,
                      emergencyContact: { ...prev.emergencyContact, phone: e.target.value }
                    }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                  />
                ) : (
                  <p className="text-gray-900">{formData.emergencyContact.phone || 'Not provided'}</p>
                )}
              </div>
            </div>
          </div>

          {/* Medical Information */}
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Medical Information</h3>
            
            {/* Medical History */}
            <div className="mb-6">
              <div className="flex items-center justify-between mb-3">
                <h4 className="font-medium text-gray-900">Medical History</h4>
                {editing && (
                  <button
                    type="button"
                    onClick={() => addArrayItem('medicalHistory')}
                    className="text-sm text-green-600 hover:text-green-800"
                  >
                    + Add Condition
                  </button>
                )}
              </div>
              {formData.medicalHistory.length > 0 ? (
                <div className="space-y-2">
                  {formData.medicalHistory.map((condition, index) => (
                    <div key={index} className="flex items-center justify-between bg-gray-50 px-3 py-2 rounded">
                      <span className="text-sm">{condition}</span>
                      {editing && (
                        <button
                          type="button"
                          onClick={() => removeArrayItem('medicalHistory', index)}
                          className="text-red-600 hover:text-red-800"
                        >
                          <X className="h-4 w-4" />
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-500 text-sm">No medical history recorded</p>
              )}
            </div>

            {/* Current Medications */}
            <div className="mb-6">
              <div className="flex items-center justify-between mb-3">
                <h4 className="font-medium text-gray-900">Current Medications</h4>
                {editing && (
                  <button
                    type="button"
                    onClick={() => addArrayItem('currentMedications')}
                    className="text-sm text-green-600 hover:text-green-800"
                  >
                    + Add Medication
                  </button>
                )}
              </div>
              {formData.currentMedications.length > 0 ? (
                <div className="space-y-2">
                  {formData.currentMedications.map((medication, index) => (
                    <div key={index} className="flex items-center justify-between bg-gray-50 px-3 py-2 rounded">
                      <span className="text-sm">{medication}</span>
                      {editing && (
                        <button
                          type="button"
                          onClick={() => removeArrayItem('currentMedications', index)}
                          className="text-red-600 hover:text-red-800"
                        >
                          <X className="h-4 w-4" />
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-500 text-sm">No current medications</p>
              )}
            </div>

            {/* Allergies */}
            <div>
              <div className="flex items-center justify-between mb-3">
                <h4 className="font-medium text-gray-900">Allergies</h4>
                {editing && (
                  <button
                    type="button"
                    onClick={() => addArrayItem('allergies')}
                    className="text-sm text-green-600 hover:text-green-800"
                  >
                    + Add Allergy
                  </button>
                )}
              </div>
              {formData.allergies.length > 0 ? (
                <div className="space-y-2">
                  {formData.allergies.map((allergy, index) => (
                    <div key={index} className="flex items-center justify-between bg-red-50 px-3 py-2 rounded">
                      <span className="text-sm text-red-700">{allergy}</span>
                      {editing && (
                        <button
                          type="button"
                          onClick={() => removeArrayItem('allergies', index)}
                          className="text-red-600 hover:text-red-800"
                        >
                          <X className="h-4 w-4" />
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-500 text-sm">No known allergies</p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PatientProfile;

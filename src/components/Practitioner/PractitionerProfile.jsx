import React, { useState, useEffect } from 'react';
import { 
  User, 
  Mail, 
  Phone, 
  MapPin, 
  Award, 
  Star, 
  Clock, 
  Save,
  Plus,
  Trash2,
  FileText,
  Calendar
} from 'lucide-react';
import api from '../../utils/api';


const PractitionerProfile = () => {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [formData, setFormData] = useState({
    licenseNumber: '',
    specializations: [],
    experience: 0,
    education: [],
    certificates: [],
    clinicAddress: {
      street: '',
      city: '',
      state: '',
      zipCode: '',
      country: ''
    },
    bio: '',
    availability: [],
    consultationFee: 0
  });

  const specializationOptions = [
    'Vamana', 'Virechana', 'Basti', 'Nasya', 'Raktamokshana', 
    'Abhyanga', 'Shirodhara', 'Panchakarma'
  ];

  const dayOptions = [
    'Monday', 'Tuesday', 'Wednesday', 'Thursday', 
    'Friday', 'Saturday', 'Sunday'
  ];

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      const response = await api.get('/practitioner/profile');
      setProfile(response.data);
      setFormData({
        licenseNumber: response.data.licenseNumber || '',
        specializations: response.data.specializations || [],
        experience: response.data.experience || 0,
        education: response.data.education || [],
        certificates: response.data.certificates || [],
        clinicAddress: response.data.clinicAddress || {
          street: '', city: '', state: '', zipCode: '', country: ''
        },
        bio: response.data.bio || '',
        availability: response.data.availability || [],
        consultationFee: response.data.consultationFee || 0
      });
    } catch (error) {
      
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      await api.put('/practitioner/profile', formData);
      
      setEditMode(false);
      fetchProfile();
    } catch (error) {
      
      console.error('Error:', error);
    } finally {
      setSaving(false);
    }
  };

  const addEducation = () => {
    setFormData(prev => ({
      ...prev,
      education: [...prev.education, { degree: '', institution: '', year: new Date().getFullYear() }]
    }));
  };

  const removeEducation = (index) => {
    setFormData(prev => ({
      ...prev,
      education: prev.education.filter((_, i) => i !== index)
    }));
  };

  const updateEducation = (index, field, value) => {
    setFormData(prev => ({
      ...prev,
      education: prev.education.map((edu, i) => 
        i === index ? { ...edu, [field]: value } : edu
      )
    }));
  };

  const addCertificate = () => {
    setFormData(prev => ({
      ...prev,
      certificates: [...prev.certificates, { name: '', issuedBy: '', year: new Date().getFullYear() }]
    }));
  };

  const removeCertificate = (index) => {
    setFormData(prev => ({
      ...prev,
      certificates: prev.certificates.filter((_, i) => i !== index)
    }));
  };

  const updateCertificate = (index, field, value) => {
    setFormData(prev => ({
      ...prev,
      certificates: prev.certificates.map((cert, i) => 
        i === index ? { ...cert, [field]: value } : cert
      )
    }));
  };

  const addAvailability = () => {
    setFormData(prev => ({
      ...prev,
      availability: [...prev.availability, { 
        day: 'Monday', 
        startTime: '09:00', 
        endTime: '17:00', 
        isAvailable: true 
      }]
    }));
  };

  const removeAvailability = (index) => {
    setFormData(prev => ({
      ...prev,
      availability: prev.availability.filter((_, i) => i !== index)
    }));
  };

  const updateAvailability = (index, field, value) => {
    setFormData(prev => ({
      ...prev,
      availability: prev.availability.map((slot, i) => 
        i === index ? { ...slot, [field]: value } : slot
      )
    }));
  };

  const toggleSpecialization = (spec) => {
    setFormData(prev => ({
      ...prev,
      specializations: prev.specializations.includes(spec)
        ? prev.specializations.filter(s => s !== spec)
        : [...prev.specializations, spec]
    }));
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-500"></div>
      </div>
    );
  }

  const getVerificationStatusColor = (status) => {
    switch (status) {
      case 'approved': return 'text-green-700 bg-green-100';
      case 'rejected': return 'text-red-700 bg-red-100';
      default: return 'text-yellow-700 bg-yellow-100';
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">My Profile</h1>
          <p className="text-gray-600">Manage your professional information</p>
        </div>
        <div className="flex items-center space-x-3">
          {profile && (
            <span className={`px-3 py-1 rounded-full text-sm font-medium ${getVerificationStatusColor(profile.verificationStatus)}`}>
              {profile.verificationStatus.charAt(0).toUpperCase() + profile.verificationStatus.slice(1)}
            </span>
          )}
          {!editMode ? (
            <button
              onClick={() => setEditMode(true)}
              className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700"
            >
              Edit Profile
            </button>
          ) : (
            <div className="flex space-x-2">
              <button
                onClick={() => setEditMode(false)}
                className="px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={handleSave}
                disabled={saving}
                className="flex items-center px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:opacity-50"
              >
                <Save className="h-4 w-4 mr-2" />
                {saving ? 'Saving...' : 'Save Changes'}
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Personal Information */}
      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex items-center mb-4">
          <User className="h-6 w-6 text-blue-500 mr-2" />
          <h2 className="text-lg font-semibold">Personal Information</h2>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">Full Name</label>
            <p className="mt-1 text-sm text-gray-900">
              {profile?.userId.firstName} {profile?.userId.lastName}
            </p>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Email</label>
            <div className="mt-1 flex items-center">
              <Mail className="h-4 w-4 text-gray-400 mr-2" />
              <p className="text-sm text-gray-900">{profile?.userId.email}</p>
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Phone</label>
            <div className="mt-1 flex items-center">
              <Phone className="h-4 w-4 text-gray-400 mr-2" />
              <p className="text-sm text-gray-900">{profile?.userId.phone}</p>
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">License Number</label>
            {editMode ? (
              <input
                type="text"
                value={formData.licenseNumber}
                onChange={(e) => setFormData(prev => ({ ...prev, licenseNumber: e.target.value }))}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
              />
            ) : (
              <p className="mt-1 text-sm text-gray-900">{profile?.licenseNumber}</p>
            )}
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Experience (Years)</label>
            {editMode ? (
              <input
                type="number"
                value={formData.experience}
                onChange={(e) => setFormData(prev => ({ ...prev, experience: parseInt(e.target.value) || 0 }))}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
              />
            ) : (
              <p className="mt-1 text-sm text-gray-900">{profile?.experience} years</p>
            )}
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Consultation Fee (₹)</label>
            {editMode ? (
              <input
                type="number"
                value={formData.consultationFee}
                onChange={(e) => setFormData(prev => ({ ...prev, consultationFee: parseInt(e.target.value) || 0 }))}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
              />
            ) : (
              <p className="mt-1 text-sm text-gray-900">₹{profile?.consultationFee}</p>
            )}
          </div>
        </div>

        <div className="mt-4">
          <label className="block text-sm font-medium text-gray-700">Bio</label>
          {editMode ? (
            <textarea
              value={formData.bio}
              onChange={(e) => setFormData(prev => ({ ...prev, bio: e.target.value }))}
              rows={3}
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
              placeholder="Tell patients about yourself..."
            />
          ) : (
            <p className="mt-1 text-sm text-gray-900">{profile?.bio || 'No bio added yet'}</p>
          )}
        </div>
      </div>

      {/* Specializations */}
      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex items-center mb-4">
          <Star className="h-6 w-6 text-yellow-500 mr-2" />
          <h2 className="text-lg font-semibold">Specializations</h2>
        </div>
        
        {editMode ? (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {specializationOptions.map((spec) => (
              <label key={spec} className="flex items-center">
                <input
                  type="checkbox"
                  checked={formData.specializations.includes(spec)}
                  onChange={() => toggleSpecialization(spec)}
                  className="mr-2 h-4 w-4 text-green-600 focus:ring-green-500 border-gray-300 rounded"
                />
                <span className="text-sm text-gray-700">{spec}</span>
              </label>
            ))}
          </div>
        ) : (
          <div className="flex flex-wrap gap-2">
            {profile?.specializations?.map((spec, index) => (
              <span key={index} className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm">
                {spec}
              </span>
            ))}
          </div>
        )}
      </div>

      {/* Education */}
      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center">
            <Award className="h-6 w-6 text-green-500 mr-2" />
            <h2 className="text-lg font-semibold">Education</h2>
          </div>
          {editMode && (
            <button
              onClick={addEducation}
              className="flex items-center px-3 py-1 text-sm bg-green-100 text-green-700 rounded-md hover:bg-green-200"
            >
              <Plus className="h-4 w-4 mr-1" />
              Add Education
            </button>
          )}
        </div>
        
        <div className="space-y-4">
          {(editMode ? formData.education : profile?.education || []).map((edu, index) => (
            <div key={index} className="border-l-4 border-green-500 pl-4 relative">
              {editMode ? (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  <input
                    type="text"
                    placeholder="Degree"
                    value={edu.degree}
                    onChange={(e) => updateEducation(index, 'degree', e.target.value)}
                    className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                  />
                  <input
                    type="text"
                    placeholder="Institution"
                    value={edu.institution}
                    onChange={(e) => updateEducation(index, 'institution', e.target.value)}
                    className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                  />
                  <div className="flex items-center space-x-2">
                    <input
                      type="number"
                      placeholder="Year"
                      value={edu.year}
                      onChange={(e) => updateEducation(index, 'year', parseInt(e.target.value))}
                      className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                    />
                    <button
                      onClick={() => removeEducation(index)}
                      className="p-2 text-red-600 hover:bg-red-100 rounded-md"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              ) : (
                <div>
                  <h3 className="font-medium text-gray-900">{edu.degree}</h3>
                  <p className="text-sm text-gray-600">{edu.institution}</p>
                  <p className="text-sm text-gray-500">{edu.year}</p>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Certificates */}
      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center">
            <FileText className="h-6 w-6 text-purple-500 mr-2" />
            <h2 className="text-lg font-semibold">Certificates</h2>
          </div>
          {editMode && (
            <button
              onClick={addCertificate}
              className="flex items-center px-3 py-1 text-sm bg-purple-100 text-purple-700 rounded-md hover:bg-purple-200"
            >
              <Plus className="h-4 w-4 mr-1" />
              Add Certificate
            </button>
          )}
        </div>
        
        <div className="space-y-4">
          {(editMode ? formData.certificates : profile?.certificates || []).map((cert, index) => (
            <div key={index} className="border-l-4 border-purple-500 pl-4 relative">
              {editMode ? (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  <input
                    type="text"
                    placeholder="Certificate Name"
                    value={cert.name}
                    onChange={(e) => updateCertificate(index, 'name', e.target.value)}
                    className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                  />
                  <input
                    type="text"
                    placeholder="Issued By"
                    value={cert.issuedBy}
                    onChange={(e) => updateCertificate(index, 'issuedBy', e.target.value)}
                    className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                  />
                  <div className="flex items-center space-x-2">
                    <input
                      type="number"
                      placeholder="Year"
                      value={cert.year}
                      onChange={(e) => updateCertificate(index, 'year', parseInt(e.target.value))}
                      className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                    />
                    <button
                      onClick={() => removeCertificate(index)}
                      className="p-2 text-red-600 hover:bg-red-100 rounded-md"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              ) : (
                <div>
                  <h3 className="font-medium text-gray-900">{cert.name}</h3>
                  <p className="text-sm text-gray-600">{cert.issuedBy}</p>
                  <p className="text-sm text-gray-500">{cert.year}</p>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Clinic Address */}
      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex items-center mb-4">
          <MapPin className="h-6 w-6 text-red-500 mr-2" />
          <h2 className="text-lg font-semibold">Clinic Address</h2>
        </div>
        
        {editMode ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="md:col-span-2">
              <input
                type="text"
                placeholder="Street Address"
                value={formData.clinicAddress.street}
                onChange={(e) => setFormData(prev => ({
                  ...prev,
                  clinicAddress: { ...prev.clinicAddress, street: e.target.value }
                }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
              />
            </div>
            <input
              type="text"
              placeholder="City"
              value={formData.clinicAddress.city}
              onChange={(e) => setFormData(prev => ({
                ...prev,
                clinicAddress: { ...prev.clinicAddress, city: e.target.value }
              }))}
              className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
            />
            <input
              type="text"
              placeholder="State"
              value={formData.clinicAddress.state}
              onChange={(e) => setFormData(prev => ({
                ...prev,
                clinicAddress: { ...prev.clinicAddress, state: e.target.value }
              }))}
              className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
            />
            <input
              type="text"
              placeholder="Zip Code"
              value={formData.clinicAddress.zipCode}
              onChange={(e) => setFormData(prev => ({
                ...prev,
                clinicAddress: { ...prev.clinicAddress, zipCode: e.target.value }
              }))}
              className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
            />
            <input
              type="text"
              placeholder="Country"
              value={formData.clinicAddress.country}
              onChange={(e) => setFormData(prev => ({
                ...prev,
                clinicAddress: { ...prev.clinicAddress, country: e.target.value }
              }))}
              className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
            />
          </div>
        ) : (
          <div className="text-sm text-gray-900">
            {profile?.clinicAddress ? (
              <>
                <p>{profile.clinicAddress.street}</p>
                <p>{profile.clinicAddress.city}, {profile.clinicAddress.state}</p>
                <p>{profile.clinicAddress.zipCode}, {profile.clinicAddress.country}</p>
              </>
            ) : (
              <p className="text-gray-500">No address added yet</p>
            )}
          </div>
        )}
      </div>

      {/* Availability */}
      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center">
            <Clock className="h-6 w-6 text-indigo-500 mr-2" />
            <h2 className="text-lg font-semibold">Availability</h2>
          </div>
          {editMode && (
            <button
              onClick={addAvailability}
              className="flex items-center px-3 py-1 text-sm bg-indigo-100 text-indigo-700 rounded-md hover:bg-indigo-200"
            >
              <Plus className="h-4 w-4 mr-1" />
              Add Slot
            </button>
          )}
        </div>
        
        <div className="space-y-3">
          {(editMode ? formData.availability : profile?.availability || []).map((slot, index) => (
            <div key={index} className="flex items-center justify-between p-3 border border-gray-200 rounded-md">
              {editMode ? (
                <div className="flex items-center space-x-3 flex-1">
                  <select
                    value={slot.day}
                    onChange={(e) => updateAvailability(index, 'day', e.target.value)}
                    className="px-3 py-1 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                  >
                    {dayOptions.map(day => (
                      <option key={day} value={day}>{day}</option>
                    ))}
                  </select>
                  <input
                    type="time"
                    value={slot.startTime}
                    onChange={(e) => updateAvailability(index, 'startTime', e.target.value)}
                    className="px-3 py-1 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                  />
                  <span className="text-gray-500">to</span>
                  <input
                    type="time"
                    value={slot.endTime}
                    onChange={(e) => updateAvailability(index, 'endTime', e.target.value)}
                    className="px-3 py-1 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                  />
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      checked={slot.isAvailable}
                      onChange={(e) => updateAvailability(index, 'isAvailable', e.target.checked)}
                      className="mr-2 h-4 w-4 text-green-600 focus:ring-green-500 border-gray-300 rounded"
                    />
                    <span className="text-sm text-gray-700">Available</span>
                  </label>
                  <button
                    onClick={() => removeAvailability(index)}
                    className="p-1 text-red-600 hover:bg-red-100 rounded-md"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              ) : (
                <div className="flex justify-between items-center w-full">
                  <span className="font-medium text-gray-900">{slot.day}</span>
                  <span className="text-gray-600">
                    {slot.isAvailable ? `${slot.startTime} - ${slot.endTime}` : 'Not Available'}
                  </span>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default PractitionerProfile;

import React, { useState, useEffect } from 'react';
import { 
  User, Edit, Save, X, Upload, Download, Award, MapPin, Phone, Mail,
  Calendar, Clock, Star, FileText, Camera, Shield, CheckCircle,
  AlertCircle, Plus, Trash2, Eye, RefreshCw, Settings
} from 'lucide-react';
import api from '../../utils/api';


const PractitionerProfileManagement = () => {
  const [profile, setProfile] = useState({});
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [activeTab, setActiveTab] = useState('personal');
  const [formData, setFormData] = useState({
    personalInfo: {
      firstName: '',
      lastName: '',
      email: '',
      phone: '',
      dateOfBirth: '',
      gender: '',
      address: '',
      city: '',
      state: '',
      pincode: ''
    },
    professionalInfo: {
      specialization: [],
      experience: 0,
      education: [],
      certifications: [],
      languages: [],
      consultationFee: 0,
      bio: ''
    },
    availability: {
      workingDays: [],
      workingHours: {
        start: '09:00',
        end: '18:00'
      },
      breakTime: {
        start: '13:00',
        end: '14:00'
      }
    },
    settings: {
      emailNotifications: true,
      smsNotifications: true,
      appointmentReminders: true,
      profileVisibility: 'public'
    }
  });

  const specializations = [
    'Panchakarma', 'Ayurvedic Medicine', 'Herbal Medicine', 'Yoga Therapy',
    'Meditation', 'Pulse Diagnosis', 'Abhyanga', 'Shirodhara', 'Nasya',
    'Vamana', 'Virechana', 'Basti', 'Raktamokshana'
  ];

  const languages = [
    'English', 'Hindi', 'Sanskrit', 'Tamil', 'Telugu', 'Kannada',
    'Malayalam', 'Bengali', 'Marathi', 'Gujarati'
  ];

  const workingDays = [
    'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'
  ];

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      setLoading(true);
      const response = await api.get('/practitioner/profile');
      setProfile(response.data || {});
      setFormData({
        personalInfo: {
          firstName: response.data.firstName || '',
          lastName: response.data.lastName || '',
          email: response.data.email || '',
          phone: response.data.phone || '',
          dateOfBirth: response.data.dateOfBirth?.split('T')[0] || '',
          gender: response.data.gender || '',
          address: response.data.address || '',
          city: response.data.city || '',
          state: response.data.state || '',
          pincode: response.data.pincode || ''
        },
        professionalInfo: {
          specialization: response.data.specialization || [],
          experience: response.data.experience || 0,
          education: response.data.education || [],
          certifications: response.data.certifications || [],
          languages: response.data.languages || [],
          consultationFee: response.data.consultationFee || 0,
          bio: response.data.bio || ''
        },
        availability: {
          workingDays: response.data.workingDays || [],
          workingHours: response.data.workingHours || { start: '09:00', end: '18:00' },
          breakTime: response.data.breakTime || { start: '13:00', end: '14:00' }
        },
        settings: {
          emailNotifications: response.data.emailNotifications ?? true,
          smsNotifications: response.data.smsNotifications ?? true,
          appointmentReminders: response.data.appointmentReminders ?? true,
          profileVisibility: response.data.profileVisibility || 'public'
        }
      });
    } catch (error) {
      console.error('Error fetching profile:', error);
      setProfile({});
      setFormData({
        personalInfo: {
          firstName: '',
          lastName: '',
          email: '',
          phone: '',
          dateOfBirth: '',
          gender: '',
          address: '',
          city: '',
          state: '',
          pincode: ''
        },
        professionalInfo: {
          specialization: [],
          experience: 0,
          education: [],
          certifications: [],
          languages: [],
          consultationFee: 0,
          bio: ''
        },
        availability: {
          workingDays: [],
          workingHours: {
            start: '09:00',
            end: '18:00'
          },
          breakTime: {
            start: '13:00',
            end: '14:00'
          }
        },
        settings: {
          emailNotifications: true,
          smsNotifications: true,
          appointmentReminders: true,
          profileVisibility: 'public'
        }
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    try {
      const updateData = {
        ...formData.personalInfo,
        ...formData.professionalInfo,
        ...formData.availability,
        ...formData.settings
      };
      
      await api.put('/practitioner/profile', updateData);
      
      setEditing(false);
      fetchProfile();
    } catch (error) {
      console.error('Error updating profile:', error);
      
    }
  };

  const addEducation = () => {
    setFormData(prev => ({
      ...prev,
      professionalInfo: {
        ...prev.professionalInfo,
        education: [...prev.professionalInfo.education, {
          degree: '',
          institution: '',
          year: '',
          description: ''
        }]
      }
    }));
  };

  const removeEducation = (index) => {
    setFormData(prev => ({
      ...prev,
      professionalInfo: {
        ...prev.professionalInfo,
        education: prev.professionalInfo.education.filter((_, i) => i !== index)
      }
    }));
  };

  const addCertification = () => {
    setFormData(prev => ({
      ...prev,
      professionalInfo: {
        ...prev.professionalInfo,
        certifications: [...prev.professionalInfo.certifications, {
          name: '',
          issuer: '',
          year: '',
          certificateUrl: ''
        }]
      }
    }));
  };

  const removeCertification = (index) => {
    setFormData(prev => ({
      ...prev,
      professionalInfo: {
        ...prev.professionalInfo,
        certifications: prev.professionalInfo.certifications.filter((_, i) => i !== index)
      }
    }));
  };

  const handleSpecializationChange = (specialization) => {
    setFormData(prev => ({
      ...prev,
      professionalInfo: {
        ...prev.professionalInfo,
        specialization: prev.professionalInfo.specialization.includes(specialization)
          ? prev.professionalInfo.specialization.filter(s => s !== specialization)
          : [...prev.professionalInfo.specialization, specialization]
      }
    }));
  };

  const handleLanguageChange = (language) => {
    setFormData(prev => ({
      ...prev,
      professionalInfo: {
        ...prev.professionalInfo,
        languages: prev.professionalInfo.languages.includes(language)
          ? prev.professionalInfo.languages.filter(l => l !== language)
          : [...prev.professionalInfo.languages, language]
      }
    }));
  };

  const handleWorkingDayChange = (day) => {
    setFormData(prev => ({
      ...prev,
      availability: {
        ...prev.availability,
        workingDays: prev.availability.workingDays.includes(day)
          ? prev.availability.workingDays.filter(d => d !== day)
          : [...prev.availability.workingDays, day]
      }
    }));
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
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Profile Management</h1>
          <p className="text-gray-600">Manage your professional profile and settings</p>
        </div>
        <div className="flex items-center space-x-3">
          {editing ? (
            <>
              <button
                onClick={() => setEditing(false)}
                className="flex items-center px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700"
              >
                <X className="h-4 w-4 mr-2" />
                Cancel
              </button>
              <button
                onClick={handleSave}
                className="flex items-center px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700"
              >
                <Save className="h-4 w-4 mr-2" />
                Save Changes
              </button>
            </>
          ) : (
            <>
              <button
                onClick={fetchProfile}
                className="flex items-center px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700"
              >
                <RefreshCw className="h-4 w-4 mr-2" />
                Refresh
              </button>
              <button
                onClick={() => setEditing(true)}
                className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
              >
                <Edit className="h-4 w-4 mr-2" />
                Edit Profile
              </button>
            </>
          )}
        </div>
      </div>

      {/* Profile Summary */}
      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex items-center space-x-6">
          <div className="relative">
            <div className="w-24 h-24 bg-gradient-to-r from-green-400 to-blue-500 rounded-full flex items-center justify-center text-white text-2xl font-bold">
              {profile.firstName?.charAt(0)}{profile.lastName?.charAt(0)}
            </div>
            {editing && (
              <button className="absolute bottom-0 right-0 p-2 bg-white rounded-full shadow-md border border-gray-200 hover:bg-gray-50">
                <Camera className="h-4 w-4 text-gray-600" />
              </button>
            )}
          </div>
          <div className="flex-1">
            <h2 className="text-2xl font-bold text-gray-900">
              Dr. {profile.firstName} {profile.lastName}
            </h2>
            <p className="text-gray-600">{profile.specialization?.join(', ')}</p>
            <div className="flex items-center space-x-4 mt-2 text-sm text-gray-500">
              <span className="flex items-center">
                <Award className="h-4 w-4 mr-1" />
                {profile.experience} years experience
              </span>
              <span className="flex items-center">
                <Star className="h-4 w-4 mr-1 text-yellow-400" />
                {(profile.averageRating || 0).toFixed(1)} ({profile.totalReviews || 0} reviews)
              </span>
              <span className="flex items-center">
                <Shield className="h-4 w-4 mr-1 text-green-500" />
                Verified
              </span>
            </div>
          </div>
          <div className="text-right">
            <p className="text-2xl font-bold text-green-600">₹{profile.consultationFee}</p>
            <p className="text-sm text-gray-500">Consultation Fee</p>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-white rounded-lg shadow">
        <div className="border-b border-gray-200">
          <nav className="flex space-x-8 px-6">
            {[
              { id: 'personal', label: 'Personal Info', icon: User },
              { id: 'professional', label: 'Professional', icon: Award },
              { id: 'availability', label: 'Availability', icon: Calendar },
              { id: 'settings', label: 'Settings', icon: Settings }
            ].map(tab => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center py-4 px-1 border-b-2 font-medium text-sm ${
                    activeTab === tab.id
                      ? 'border-green-500 text-green-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  <Icon className="h-4 w-4 mr-2" />
                  {tab.label}
                </button>
              );
            })}
          </nav>
        </div>

        <div className="p-6">
          {/* Personal Info Tab */}
          {activeTab === 'personal' && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">First Name</label>
                  <input
                    type="text"
                    value={editing ? formData.personalInfo.firstName : profile.firstName || ''}
                    onChange={(e) => editing && setFormData(prev => ({
                      ...prev,
                      personalInfo: { ...prev.personalInfo, firstName: e.target.value }
                    }))}
                    disabled={!editing}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 disabled:bg-gray-50"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Last Name</label>
                  <input
                    type="text"
                    value={editing ? formData.personalInfo.lastName : profile.lastName || ''}
                    onChange={(e) => editing && setFormData(prev => ({
                      ...prev,
                      personalInfo: { ...prev.personalInfo, lastName: e.target.value }
                    }))}
                    disabled={!editing}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 disabled:bg-gray-50"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
                  <input
                    type="email"
                    value={editing ? formData.personalInfo.email : profile.email || ''}
                    onChange={(e) => editing && setFormData(prev => ({
                      ...prev,
                      personalInfo: { ...prev.personalInfo, email: e.target.value }
                    }))}
                    disabled={!editing}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 disabled:bg-gray-50"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Phone</label>
                  <input
                    type="tel"
                    value={editing ? formData.personalInfo.phone : profile.phone || ''}
                    onChange={(e) => editing && setFormData(prev => ({
                      ...prev,
                      personalInfo: { ...prev.personalInfo, phone: e.target.value }
                    }))}
                    disabled={!editing}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 disabled:bg-gray-50"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Date of Birth</label>
                  <input
                    type="date"
                    value={editing ? formData.personalInfo.dateOfBirth : profile.dateOfBirth?.split('T')[0] || ''}
                    onChange={(e) => editing && setFormData(prev => ({
                      ...prev,
                      personalInfo: { ...prev.personalInfo, dateOfBirth: e.target.value }
                    }))}
                    disabled={!editing}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 disabled:bg-gray-50"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Gender</label>
                  <select
                    value={editing ? formData.personalInfo.gender : profile.gender || ''}
                    onChange={(e) => editing && setFormData(prev => ({
                      ...prev,
                      personalInfo: { ...prev.personalInfo, gender: e.target.value }
                    }))}
                    disabled={!editing}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 disabled:bg-gray-50"
                  >
                    <option value="">Select Gender</option>
                    <option value="male">Male</option>
                    <option value="female">Female</option>
                    <option value="other">Other</option>
                  </select>
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Address</label>
                <textarea
                  value={editing ? formData.personalInfo.address : profile.address || ''}
                  onChange={(e) => editing && setFormData(prev => ({
                    ...prev,
                    personalInfo: { ...prev.personalInfo, address: e.target.value }
                  }))}
                  disabled={!editing}
                  rows="3"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 disabled:bg-gray-50"
                />
              </div>
            </div>
          )}

          {/* Professional Info Tab */}
          {activeTab === 'professional' && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Experience (Years)</label>
                  <input
                    type="number"
                    value={editing ? formData.professionalInfo.experience : profile.experience || 0}
                    onChange={(e) => editing && setFormData(prev => ({
                      ...prev,
                      professionalInfo: { ...prev.professionalInfo, experience: parseInt(e.target.value) }
                    }))}
                    disabled={!editing}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 disabled:bg-gray-50"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Consultation Fee (₹)</label>
                  <input
                    type="number"
                    value={editing ? formData.professionalInfo.consultationFee : profile.consultationFee || 0}
                    onChange={(e) => editing && setFormData(prev => ({
                      ...prev,
                      professionalInfo: { ...prev.professionalInfo, consultationFee: parseInt(e.target.value) }
                    }))}
                    disabled={!editing}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 disabled:bg-gray-50"
                  />
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Bio</label>
                <textarea
                  value={editing ? formData.professionalInfo.bio : profile.bio || ''}
                  onChange={(e) => editing && setFormData(prev => ({
                    ...prev,
                    professionalInfo: { ...prev.professionalInfo, bio: e.target.value }
                  }))}
                  disabled={!editing}
                  rows="4"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 disabled:bg-gray-50"
                  placeholder="Tell patients about yourself, your approach to treatment, and your expertise..."
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Specializations</label>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                  {specializations.map(spec => (
                    <label key={spec} className="flex items-center">
                      <input
                        type="checkbox"
                        checked={(editing ? formData.professionalInfo.specialization : profile.specialization || []).includes(spec)}
                        onChange={() => editing && handleSpecializationChange(spec)}
                        disabled={!editing}
                        className="rounded border-gray-300 text-green-600 focus:ring-green-500"
                      />
                      <span className="ml-2 text-sm text-gray-700">{spec}</span>
                    </label>
                  ))}
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Languages</label>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                  {languages.map(lang => (
                    <label key={lang} className="flex items-center">
                      <input
                        type="checkbox"
                        checked={(editing ? formData.professionalInfo.languages : profile.languages || []).includes(lang)}
                        onChange={() => editing && handleLanguageChange(lang)}
                        disabled={!editing}
                        className="rounded border-gray-300 text-green-600 focus:ring-green-500"
                      />
                      <span className="ml-2 text-sm text-gray-700">{lang}</span>
                    </label>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Availability Tab */}
          {activeTab === 'availability' && (
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Working Days</label>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                  {workingDays.map(day => (
                    <label key={day} className="flex items-center">
                      <input
                        type="checkbox"
                        checked={(editing ? formData.availability.workingDays : profile.workingDays || []).includes(day)}
                        onChange={() => editing && handleWorkingDayChange(day)}
                        disabled={!editing}
                        className="rounded border-gray-300 text-green-600 focus:ring-green-500"
                      />
                      <span className="ml-2 text-sm text-gray-700">{day}</span>
                    </label>
                  ))}
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Working Hours Start</label>
                  <input
                    type="time"
                    value={editing ? formData.availability.workingHours.start : profile.workingHours?.start || '09:00'}
                    onChange={(e) => editing && setFormData(prev => ({
                      ...prev,
                      availability: {
                        ...prev.availability,
                        workingHours: { ...prev.availability.workingHours, start: e.target.value }
                      }
                    }))}
                    disabled={!editing}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 disabled:bg-gray-50"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Working Hours End</label>
                  <input
                    type="time"
                    value={editing ? formData.availability.workingHours.end : profile.workingHours?.end || '18:00'}
                    onChange={(e) => editing && setFormData(prev => ({
                      ...prev,
                      availability: {
                        ...prev.availability,
                        workingHours: { ...prev.availability.workingHours, end: e.target.value }
                      }
                    }))}
                    disabled={!editing}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 disabled:bg-gray-50"
                  />
                </div>
              </div>
            </div>
          )}

          {/* Settings Tab */}
          {activeTab === 'settings' && (
            <div className="space-y-6">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="text-sm font-medium text-gray-900">Email Notifications</h4>
                    <p className="text-sm text-gray-500">Receive notifications via email</p>
                  </div>
                  <input
                    type="checkbox"
                    checked={editing ? formData.settings.emailNotifications : profile.emailNotifications ?? true}
                    onChange={(e) => editing && setFormData(prev => ({
                      ...prev,
                      settings: { ...prev.settings, emailNotifications: e.target.checked }
                    }))}
                    disabled={!editing}
                    className="rounded border-gray-300 text-green-600 focus:ring-green-500"
                  />
                </div>
                
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="text-sm font-medium text-gray-900">SMS Notifications</h4>
                    <p className="text-sm text-gray-500">Receive notifications via SMS</p>
                  </div>
                  <input
                    type="checkbox"
                    checked={editing ? formData.settings.smsNotifications : profile.smsNotifications ?? true}
                    onChange={(e) => editing && setFormData(prev => ({
                      ...prev,
                      settings: { ...prev.settings, smsNotifications: e.target.checked }
                    }))}
                    disabled={!editing}
                    className="rounded border-gray-300 text-green-600 focus:ring-green-500"
                  />
                </div>
                
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="text-sm font-medium text-gray-900">Appointment Reminders</h4>
                    <p className="text-sm text-gray-500">Send reminders to patients</p>
                  </div>
                  <input
                    type="checkbox"
                    checked={editing ? formData.settings.appointmentReminders : profile.appointmentReminders ?? true}
                    onChange={(e) => editing && setFormData(prev => ({
                      ...prev,
                      settings: { ...prev.settings, appointmentReminders: e.target.checked }
                    }))}
                    disabled={!editing}
                    className="rounded border-gray-300 text-green-600 focus:ring-green-500"
                  />
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Profile Visibility</label>
                <select
                  value={editing ? formData.settings.profileVisibility : profile.profileVisibility || 'public'}
                  onChange={(e) => editing && setFormData(prev => ({
                    ...prev,
                    settings: { ...prev.settings, profileVisibility: e.target.value }
                  }))}
                  disabled={!editing}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 disabled:bg-gray-50"
                >
                  <option value="public">Public</option>
                  <option value="private">Private</option>
                  <option value="verified-only">Verified Patients Only</option>
                </select>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default PractitionerProfileManagement;

import React, { useState, useEffect } from 'react';
import { 
  User, Edit, Save, X, Camera, Phone, Mail, MapPin, Calendar,
  Heart, Activity, AlertCircle, Shield, FileText, Upload,
  Eye, EyeOff, Lock, Bell, Settings, Download, Share2
} from 'lucide-react';
import api from '../../utils/api';


const EnhancedPatientProfile = () => {
  const [profile, setProfile] = useState({});
  const [editing, setEditing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('personal');
  const [profileImage, setProfileImage] = useState(null);

  const tabs = [
    { id: 'personal', name: 'Personal Info', icon: User },
    { id: 'medical', name: 'Medical History', icon: Heart },
    { id: 'emergency', name: 'Emergency Contact', icon: Phone },
    { id: 'preferences', name: 'Preferences', icon: Settings },
    // { id: 'privacy', name: 'Privacy & Security', icon: Shield }
  ];

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      setLoading(true);
      const response = await api.get('/patient/profile');
      setProfile(response.data);
    } catch (error) {
      console.error('Error fetching profile:', error);
      
    } finally {
      setLoading(false);
    }
  };

  const saveProfile = async () => {
    try {
      await api.put('/patient/profile', profile);
      
      setEditing(false);
    } catch (error) {
      console.error('Error saving profile:', error);
      
    }
  };

  const handleImageUpload = async (event) => {
    const file = event.target.files[0];
    if (file) {
      const formData = new FormData();
      formData.append('profileImage', file);
      
      try {
        const response = await api.post('/patient/profile/image', formData);
        setProfile(prev => ({ ...prev, profileImage: response.data.imageUrl }));
        
      } catch (error) {
        console.error('Error uploading image:', error);
        
      }
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
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">My Profile</h1>
          <p className="text-gray-600">Manage your personal information and preferences</p>
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
                onClick={saveProfile}
                className="flex items-center px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700"
              >
                <Save className="h-4 w-4 mr-2" />
                Save Changes
              </button>
            </>
          ) : (
            <button
              onClick={() => setEditing(true)}
              className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
            >
              <Edit className="h-4 w-4 mr-2" />
              Edit Profile
            </button>
          )}
        </div>
      </div>

      {/* Profile Header */}
      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex items-center space-x-6">
          <div className="relative">
            <div className="w-24 h-24 bg-gradient-to-r from-blue-400 to-purple-500 rounded-full flex items-center justify-center text-white text-2xl font-bold">
              {profile.profileImage ? (
                <img src={profile.profileImage} alt="Profile" className="w-24 h-24 rounded-full object-cover" />
              ) : (
                `${profile.firstName?.charAt(0) || ''}${profile.lastName?.charAt(0) || ''}`
              )}
            </div>
            {editing && (
              <label className="absolute bottom-0 right-0 bg-blue-600 text-white p-2 rounded-full cursor-pointer hover:bg-blue-700">
                <Camera className="h-4 w-4" />
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageUpload}
                  className="hidden"
                />
              </label>
            )}
          </div>
          
          <div className="flex-1">
            <h2 className="text-2xl font-bold text-gray-900">
              {profile.firstName} {profile.lastName}
            </h2>
            <p className="text-gray-600">{profile.email}</p>
            <div className="flex items-center mt-2 space-x-4">
              <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                <Activity className="h-3 w-3 mr-1" />
                Active Patient
              </span>
              <span className="text-sm text-gray-500">
                Member since {new Date(profile.createdAt).toLocaleDateString()}
              </span>
            </div>
          </div>
          
          <div className="text-right">
            <div className="flex items-center space-x-2">
              <button className="p-2 text-gray-600 hover:bg-gray-100 rounded-full" title="Download Profile">
                <Download className="h-5 w-5" />
              </button>
              <button className="p-2 text-gray-600 hover:bg-gray-100 rounded-full" title="Share Profile">
                <Share2 className="h-5 w-5" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="bg-white rounded-lg shadow">
        <div className="border-b border-gray-200">
          <nav className="flex space-x-8 px-6">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center py-4 px-1 border-b-2 font-medium text-sm ${
                  activeTab === tab.id
                    ? 'border-green-500 text-green-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <tab.icon className="h-5 w-5 mr-2" />
                {tab.name}
              </button>
            ))}
          </nav>
        </div>

        <div className="p-6">
          {/* Personal Info Tab */}
          {activeTab === 'personal' && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">First Name</label>
                  {editing ? (
                    <input
                      type="text"
                      value={profile.firstName || ''}
                      onChange={(e) => setProfile(prev => ({ ...prev, firstName: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                    />
                  ) : (
                    <p className="text-gray-900">{profile.firstName || 'Not provided'}</p>
                  )}
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Last Name</label>
                  {editing ? (
                    <input
                      type="text"
                      value={profile.lastName || ''}
                      onChange={(e) => setProfile(prev => ({ ...prev, lastName: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                    />
                  ) : (
                    <p className="text-gray-900">{profile.lastName || 'Not provided'}</p>
                  )}
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Date of Birth</label>
                  {editing ? (
                    <input
                      type="date"
                      value={profile.dateOfBirth ? new Date(profile.dateOfBirth).toISOString().split('T')[0] : ''}
                      onChange={(e) => setProfile(prev => ({ ...prev, dateOfBirth: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                    />
                  ) : (
                    <p className="text-gray-900">
                      {profile.dateOfBirth ? new Date(profile.dateOfBirth).toLocaleDateString() : 'Not provided'}
                    </p>
                  )}
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Gender</label>
                  {editing ? (
                    <select
                      value={profile.gender || ''}
                      onChange={(e) => setProfile(prev => ({ ...prev, gender: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                    >
                      <option value="">Select Gender</option>
                      <option value="male">Male</option>
                      <option value="female">Female</option>
                      <option value="other">Other</option>
                    </select>
                  ) : (
                    <p className="text-gray-900 capitalize">{profile.gender || 'Not provided'}</p>
                  )}
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Phone Number</label>
                  {editing ? (
                    <input
                      type="tel"
                      value={profile.phoneNumber || ''}
                      onChange={(e) => setProfile(prev => ({ ...prev, phoneNumber: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                    />
                  ) : (
                    <p className="text-gray-900">{profile.phoneNumber || 'Not provided'}</p>
                  )}
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
                  <p className="text-gray-900">{profile.email}</p>
                  <p className="text-xs text-gray-500 mt-1">Email cannot be changed</p>
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Address</label>
                {editing ? (
                  <textarea
                    value={profile.address || ''}
                    onChange={(e) => setProfile(prev => ({ ...prev, address: e.target.value }))}
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                  />
                ) : (
                  <p className="text-gray-900">{profile.address || 'Not provided'}</p>
                )}
              </div>
            </div>
          )}

          {/* Medical History Tab */}
          {activeTab === 'medical' && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Blood Type</label>
                  {editing ? (
                    <select
                      value={profile.bloodType || ''}
                      onChange={(e) => setProfile(prev => ({ ...prev, bloodType: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                    >
                      <option value="">Select Blood Type</option>
                      <option value="A+">A+</option>
                      <option value="A-">A-</option>
                      <option value="B+">B+</option>
                      <option value="B-">B-</option>
                      <option value="AB+">AB+</option>
                      <option value="AB-">AB-</option>
                      <option value="O+">O+</option>
                      <option value="O-">O-</option>
                    </select>
                  ) : (
                    <p className="text-gray-900">{profile.bloodType || 'Not provided'}</p>
                  )}
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Height (cm)</label>
                  {editing ? (
                    <input
                      type="number"
                      value={profile.height || ''}
                      onChange={(e) => setProfile(prev => ({ ...prev, height: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                    />
                  ) : (
                    <p className="text-gray-900">{profile.height ? `${profile.height} cm` : 'Not provided'}</p>
                  )}
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Weight (kg)</label>
                  {editing ? (
                    <input
                      type="number"
                      value={profile.weight || ''}
                      onChange={(e) => setProfile(prev => ({ ...prev, weight: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                    />
                  ) : (
                    <p className="text-gray-900">{profile.weight ? `${profile.weight} kg` : 'Not provided'}</p>
                  )}
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Allergies</label>
                {editing ? (
                  <textarea
                    value={profile.allergies || ''}
                    onChange={(e) => setProfile(prev => ({ ...prev, allergies: e.target.value }))}
                    rows={3}
                    placeholder="List any known allergies..."
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                  />
                ) : (
                  <p className="text-gray-900">{profile.allergies || 'No known allergies'}</p>
                )}
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Current Medications</label>
                {editing ? (
                  <textarea
                    value={profile.medications || ''}
                    onChange={(e) => setProfile(prev => ({ ...prev, medications: e.target.value }))}
                    rows={3}
                    placeholder="List current medications..."
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                  />
                ) : (
                  <p className="text-gray-900">{profile.medications || 'No current medications'}</p>
                )}
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Medical History</label>
                {editing ? (
                  <textarea
                    value={profile.medicalHistory || ''}
                    onChange={(e) => setProfile(prev => ({ ...prev, medicalHistory: e.target.value }))}
                    rows={4}
                    placeholder="Describe any relevant medical history..."
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                  />
                ) : (
                  <p className="text-gray-900">{profile.medicalHistory || 'No medical history provided'}</p>
                )}
              </div>
            </div>
          )}

          {/* Emergency Contact Tab */}
          {activeTab === 'emergency' && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Contact Name</label>
                  {editing ? (
                    <input
                      type="text"
                      value={profile.emergencyContact?.name || ''}
                      onChange={(e) => setProfile(prev => ({ 
                        ...prev, 
                        emergencyContact: { ...prev.emergencyContact, name: e.target.value }
                      }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                    />
                  ) : (
                    <p className="text-gray-900">{profile.emergencyContact?.name || 'Not provided'}</p>
                  )}
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Relationship</label>
                  {editing ? (
                    <input
                      type="text"
                      value={profile.emergencyContact?.relationship || ''}
                      onChange={(e) => setProfile(prev => ({ 
                        ...prev, 
                        emergencyContact: { ...prev.emergencyContact, relationship: e.target.value }
                      }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                    />
                  ) : (
                    <p className="text-gray-900">{profile.emergencyContact?.relationship || 'Not provided'}</p>
                  )}
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Phone Number</label>
                  {editing ? (
                    <input
                      type="tel"
                      value={profile.emergencyContact?.phone || ''}
                      onChange={(e) => setProfile(prev => ({ 
                        ...prev, 
                        emergencyContact: { ...prev.emergencyContact, phone: e.target.value }
                      }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                    />
                  ) : (
                    <p className="text-gray-900">{profile.emergencyContact?.phone || 'Not provided'}</p>
                  )}
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
                  {editing ? (
                    <input
                      type="email"
                      value={profile.emergencyContact?.email || ''}
                      onChange={(e) => setProfile(prev => ({ 
                        ...prev, 
                        emergencyContact: { ...prev.emergencyContact, email: e.target.value }
                      }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                    />
                  ) : (
                    <p className="text-gray-900">{profile.emergencyContact?.email || 'Not provided'}</p>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Preferences Tab */}
          {activeTab === 'preferences' && (
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-medium text-gray-900 mb-4">Notification Preferences</h3>
                <div className="space-y-4">
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      checked={profile.preferences?.emailNotifications || false}
                      onChange={(e) => setProfile(prev => ({
                        ...prev,
                        preferences: { ...prev.preferences, emailNotifications: e.target.checked }
                      }))}
                      disabled={!editing}
                      className="rounded border-gray-300 text-green-600 focus:ring-green-500"
                    />
                    <span className="ml-2 text-sm text-gray-700">Email notifications</span>
                  </label>
                  
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      checked={profile.preferences?.smsNotifications || false}
                      onChange={(e) => setProfile(prev => ({
                        ...prev,
                        preferences: { ...prev.preferences, smsNotifications: e.target.checked }
                      }))}
                      disabled={!editing}
                      className="rounded border-gray-300 text-green-600 focus:ring-green-500"
                    />
                    <span className="ml-2 text-sm text-gray-700">SMS notifications</span>
                  </label>
                  
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      checked={profile.preferences?.appointmentReminders || false}
                      onChange={(e) => setProfile(prev => ({
                        ...prev,
                        preferences: { ...prev.preferences, appointmentReminders: e.target.checked }
                      }))}
                      disabled={!editing}
                      className="rounded border-gray-300 text-green-600 focus:ring-green-500"
                    />
                    <span className="ml-2 text-sm text-gray-700">Appointment reminders</span>
                  </label>
                </div>
              </div>
              
              <div>
                <h3 className="text-lg font-medium text-gray-900 mb-4">Language & Region</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Preferred Language</label>
                    {editing ? (
                      <select
                        value={profile.preferences?.language || 'en'}
                        onChange={(e) => setProfile(prev => ({
                          ...prev,
                          preferences: { ...prev.preferences, language: e.target.value }
                        }))}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                      >
                        <option value="en">English</option>
                        <option value="hi">Hindi</option>
                        <option value="mr">Marathi</option>
                        <option value="gu">Gujarati</option>
                      </select>
                    ) : (
                      <p className="text-gray-900">
                        {profile.preferences?.language === 'hi' ? 'Hindi' :
                         profile.preferences?.language === 'mr' ? 'Marathi' :
                         profile.preferences?.language === 'gu' ? 'Gujarati' : 'English'}
                      </p>
                    )}
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Time Zone</label>
                    {editing ? (
                      <select
                        value={profile.preferences?.timezone || 'Asia/Kolkata'}
                        onChange={(e) => setProfile(prev => ({
                          ...prev,
                          preferences: { ...prev.preferences, timezone: e.target.value }
                        }))}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                      >
                        <option value="Asia/Kolkata">India Standard Time</option>
                        <option value="America/New_York">Eastern Time</option>
                        <option value="Europe/London">Greenwich Mean Time</option>
                      </select>
                    ) : (
                      <p className="text-gray-900">
                        {profile.preferences?.timezone || 'India Standard Time'}
                      </p>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Privacy & Security Tab */}
          {activeTab === 'privacy' && (
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-medium text-gray-900 mb-4">Privacy Settings</h3>
                <div className="space-y-4">
                  <label className="flex items-center justify-between">
                    <span className="text-sm text-gray-700">Make profile visible to practitioners</span>
                    <input
                      type="checkbox"
                      checked={profile.privacy?.profileVisible || true}
                      onChange={(e) => setProfile(prev => ({
                        ...prev,
                        privacy: { ...prev.privacy, profileVisible: e.target.checked }
                      }))}
                      disabled={!editing}
                      className="rounded border-gray-300 text-green-600 focus:ring-green-500"
                    />
                  </label>
                  
                  <label className="flex items-center justify-between">
                    <span className="text-sm text-gray-700">Allow data sharing for research</span>
                    <input
                      type="checkbox"
                      checked={profile.privacy?.dataSharing || false}
                      onChange={(e) => setProfile(prev => ({
                        ...prev,
                        privacy: { ...prev.privacy, dataSharing: e.target.checked }
                      }))}
                      disabled={!editing}
                      className="rounded border-gray-300 text-green-600 focus:ring-green-500"
                    />
                  </label>
                </div>
              </div>
              
              <div>
                <h3 className="text-lg font-medium text-gray-900 mb-4">Security</h3>
                <div className="space-y-4">
                  <button className="flex items-center justify-between w-full p-4 bg-gray-50 rounded-lg hover:bg-gray-100">
                    <div className="flex items-center">
                      <Lock className="h-5 w-5 text-gray-600 mr-3" />
                      <span className="text-sm font-medium text-gray-900">Change Password</span>
                    </div>
                    <ArrowRight className="h-4 w-4 text-gray-400" />
                  </button>
                  
                  <button className="flex items-center justify-between w-full p-4 bg-gray-50 rounded-lg hover:bg-gray-100">
                    <div className="flex items-center">
                      <Shield className="h-5 w-5 text-gray-600 mr-3" />
                      <span className="text-sm font-medium text-gray-900">Two-Factor Authentication</span>
                    </div>
                    <span className="text-xs text-gray-500">Not enabled</span>
                  </button>
                  
                  <button className="flex items-center justify-between w-full p-4 bg-gray-50 rounded-lg hover:bg-gray-100">
                    <div className="flex items-center">
                      <FileText className="h-5 w-5 text-gray-600 mr-3" />
                      <span className="text-sm font-medium text-gray-900">Download My Data</span>
                    </div>
                    <Download className="h-4 w-4 text-gray-400" />
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default EnhancedPatientProfile;

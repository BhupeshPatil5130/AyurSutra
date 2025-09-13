import React, { useState, useEffect } from 'react';
import { 
  User, 
  Mail, 
  Phone, 
  Calendar, 
  MapPin, 
  Edit,
  Save,
  Camera,
  Shield,
  Bell,
  Heart,
  Activity,
  FileText,
  Settings,
  Eye,
  EyeOff
} from 'lucide-react';

const Profile = () => {
  const [profile, setProfile] = useState({});
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [activeTab, setActiveTab] = useState('personal');
  const [showPasswordModal, setShowPasswordModal] = useState(false);

  const [profileForm, setProfileForm] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    dateOfBirth: '',
    gender: '',
    address: '',
    emergencyContact: {
      name: '',
      phone: '',
      relationship: ''
    },
    medicalInfo: {
      bloodType: '',
      allergies: [],
      medications: [],
      conditions: []
    },
    preferences: {
      notifications: {
        email: true,
        sms: true,
        push: true
      },
      privacy: {
        shareData: false,
        publicProfile: false
      }
    }
  });

  const [passwordForm, setPasswordForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('/api/patient/profile', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await response.json();
      setProfile(data);
      setProfileForm({
        ...data,
        dateOfBirth: data.dateOfBirth ? data.dateOfBirth.split('T')[0] : ''
      });
    } catch (error) {
      console.error('Error fetching profile:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSaveProfile = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('/api/patient/profile', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(profileForm)
      });

      if (response.ok) {
        setEditing(false);
        fetchProfile();
      }
    } catch (error) {
      console.error('Error updating profile:', error);
    }
  };

  const handleChangePassword = async (e) => {
    e.preventDefault();
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      alert('Passwords do not match');
      return;
    }

    try {
      const token = localStorage.getItem('token');
      const response = await fetch('/api/patient/change-password', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          currentPassword: passwordForm.currentPassword,
          newPassword: passwordForm.newPassword
        })
      });

      if (response.ok) {
        setShowPasswordModal(false);
        setPasswordForm({
          currentPassword: '',
          newPassword: '',
          confirmPassword: ''
        });
        alert('Password changed successfully');
      }
    } catch (error) {
      console.error('Error changing password:', error);
    }
  };

  const PersonalInfoTab = () => (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">First Name</label>
          <input
            type="text"
            value={profileForm.firstName}
            onChange={(e) => setProfileForm({...profileForm, firstName: e.target.value})}
            disabled={!editing}
            className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-500 disabled:bg-gray-50"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Last Name</label>
          <input
            type="text"
            value={profileForm.lastName}
            onChange={(e) => setProfileForm({...profileForm, lastName: e.target.value})}
            disabled={!editing}
            className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-500 disabled:bg-gray-50"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
          <input
            type="email"
            value={profileForm.email}
            onChange={(e) => setProfileForm({...profileForm, email: e.target.value})}
            disabled={!editing}
            className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-500 disabled:bg-gray-50"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
          <input
            type="tel"
            value={profileForm.phone}
            onChange={(e) => setProfileForm({...profileForm, phone: e.target.value})}
            disabled={!editing}
            className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-500 disabled:bg-gray-50"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Date of Birth</label>
          <input
            type="date"
            value={profileForm.dateOfBirth}
            onChange={(e) => setProfileForm({...profileForm, dateOfBirth: e.target.value})}
            disabled={!editing}
            className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-500 disabled:bg-gray-50"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Gender</label>
          <select
            value={profileForm.gender}
            onChange={(e) => setProfileForm({...profileForm, gender: e.target.value})}
            disabled={!editing}
            className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-500 disabled:bg-gray-50"
          >
            <option value="">Select Gender</option>
            <option value="male">Male</option>
            <option value="female">Female</option>
            <option value="other">Other</option>
          </select>
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Address</label>
        <textarea
          value={profileForm.address}
          onChange={(e) => setProfileForm({...profileForm, address: e.target.value})}
          disabled={!editing}
          className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-500 disabled:bg-gray-50"
          rows="3"
        />
      </div>
    </div>
  );

  const MedicalInfoTab = () => (
    <div className="space-y-6">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Blood Type</label>
        <select
          value={profileForm.medicalInfo?.bloodType || ''}
          onChange={(e) => setProfileForm({
            ...profileForm, 
            medicalInfo: {...profileForm.medicalInfo, bloodType: e.target.value}
          })}
          disabled={!editing}
          className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-500 disabled:bg-gray-50"
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
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Allergies</label>
        <textarea
          value={profileForm.medicalInfo?.allergies?.join(', ') || ''}
          onChange={(e) => setProfileForm({
            ...profileForm,
            medicalInfo: {
              ...profileForm.medicalInfo,
              allergies: e.target.value.split(',').map(item => item.trim()).filter(item => item)
            }
          })}
          disabled={!editing}
          className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-500 disabled:bg-gray-50"
          rows="3"
          placeholder="Enter allergies separated by commas"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Current Medications</label>
        <textarea
          value={profileForm.medicalInfo?.medications?.join(', ') || ''}
          onChange={(e) => setProfileForm({
            ...profileForm,
            medicalInfo: {
              ...profileForm.medicalInfo,
              medications: e.target.value.split(',').map(item => item.trim()).filter(item => item)
            }
          })}
          disabled={!editing}
          className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-500 disabled:bg-gray-50"
          rows="3"
          placeholder="Enter medications separated by commas"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Medical Conditions</label>
        <textarea
          value={profileForm.medicalInfo?.conditions?.join(', ') || ''}
          onChange={(e) => setProfileForm({
            ...profileForm,
            medicalInfo: {
              ...profileForm.medicalInfo,
              conditions: e.target.value.split(',').map(item => item.trim()).filter(item => item)
            }
          })}
          disabled={!editing}
          className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-500 disabled:bg-gray-50"
          rows="3"
          placeholder="Enter conditions separated by commas"
        />
      </div>
    </div>
  );

  const EmergencyContactTab = () => (
    <div className="space-y-6">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Contact Name</label>
        <input
          type="text"
          value={profileForm.emergencyContact?.name || ''}
          onChange={(e) => setProfileForm({
            ...profileForm,
            emergencyContact: {...profileForm.emergencyContact, name: e.target.value}
          })}
          disabled={!editing}
          className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-500 disabled:bg-gray-50"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Phone Number</label>
        <input
          type="tel"
          value={profileForm.emergencyContact?.phone || ''}
          onChange={(e) => setProfileForm({
            ...profileForm,
            emergencyContact: {...profileForm.emergencyContact, phone: e.target.value}
          })}
          disabled={!editing}
          className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-500 disabled:bg-gray-50"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Relationship</label>
        <input
          type="text"
          value={profileForm.emergencyContact?.relationship || ''}
          onChange={(e) => setProfileForm({
            ...profileForm,
            emergencyContact: {...profileForm.emergencyContact, relationship: e.target.value}
          })}
          disabled={!editing}
          className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-500 disabled:bg-gray-50"
          placeholder="e.g., Spouse, Parent, Sibling"
        />
      </div>
    </div>
  );

  const PreferencesTab = () => (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-medium text-gray-900 mb-4">Notification Preferences</h3>
        <div className="space-y-3">
          <label className="flex items-center">
            <input
              type="checkbox"
              checked={profileForm.preferences?.notifications?.email || false}
              onChange={(e) => setProfileForm({
                ...profileForm,
                preferences: {
                  ...profileForm.preferences,
                  notifications: {
                    ...profileForm.preferences?.notifications,
                    email: e.target.checked
                  }
                }
              })}
              disabled={!editing}
              className="rounded border-gray-300 text-green-600 focus:ring-green-500"
            />
            <span className="ml-2 text-sm text-gray-700">Email notifications</span>
          </label>
          <label className="flex items-center">
            <input
              type="checkbox"
              checked={profileForm.preferences?.notifications?.sms || false}
              onChange={(e) => setProfileForm({
                ...profileForm,
                preferences: {
                  ...profileForm.preferences,
                  notifications: {
                    ...profileForm.preferences?.notifications,
                    sms: e.target.checked
                  }
                }
              })}
              disabled={!editing}
              className="rounded border-gray-300 text-green-600 focus:ring-green-500"
            />
            <span className="ml-2 text-sm text-gray-700">SMS notifications</span>
          </label>
          <label className="flex items-center">
            <input
              type="checkbox"
              checked={profileForm.preferences?.notifications?.push || false}
              onChange={(e) => setProfileForm({
                ...profileForm,
                preferences: {
                  ...profileForm.preferences,
                  notifications: {
                    ...profileForm.preferences?.notifications,
                    push: e.target.checked
                  }
                }
              })}
              disabled={!editing}
              className="rounded border-gray-300 text-green-600 focus:ring-green-500"
            />
            <span className="ml-2 text-sm text-gray-700">Push notifications</span>
          </label>
        </div>
      </div>

      <div>
        <h3 className="text-lg font-medium text-gray-900 mb-4">Privacy Settings</h3>
        <div className="space-y-3">
          <label className="flex items-center">
            <input
              type="checkbox"
              checked={profileForm.preferences?.privacy?.shareData || false}
              onChange={(e) => setProfileForm({
                ...profileForm,
                preferences: {
                  ...profileForm.preferences,
                  privacy: {
                    ...profileForm.preferences?.privacy,
                    shareData: e.target.checked
                  }
                }
              })}
              disabled={!editing}
              className="rounded border-gray-300 text-green-600 focus:ring-green-500"
            />
            <span className="ml-2 text-sm text-gray-700">Share data for research</span>
          </label>
          <label className="flex items-center">
            <input
              type="checkbox"
              checked={profileForm.preferences?.privacy?.publicProfile || false}
              onChange={(e) => setProfileForm({
                ...profileForm,
                preferences: {
                  ...profileForm.preferences,
                  privacy: {
                    ...profileForm.preferences?.privacy,
                    publicProfile: e.target.checked
                  }
                }
              })}
              disabled={!editing}
              className="rounded border-gray-300 text-green-600 focus:ring-green-500"
            />
            <span className="ml-2 text-sm text-gray-700">Public profile</span>
          </label>
        </div>
      </div>

      <div>
        <h3 className="text-lg font-medium text-gray-900 mb-4">Security</h3>
        <button
          onClick={() => setShowPasswordModal(true)}
          className="flex items-center px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
        >
          <Shield className="h-4 w-4 mr-2" />
          Change Password
        </button>
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
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className="w-20 h-20 bg-gradient-to-r from-green-400 to-blue-500 rounded-full flex items-center justify-center text-white font-bold text-2xl">
              {profile.firstName?.charAt(0)}{profile.lastName?.charAt(0)}
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                {profile.firstName} {profile.lastName}
              </h1>
              <p className="text-gray-600">{profile.email}</p>
              <div className="flex items-center mt-2 text-sm text-gray-500">
                <Calendar className="h-4 w-4 mr-1" />
                Member since {new Date(profile.createdAt).toLocaleDateString()}
              </div>
            </div>
          </div>
          
          <div className="flex items-center space-x-3">
            {editing ? (
              <>
                <button
                  onClick={() => setEditing(false)}
                  className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSaveProfile}
                  className="flex items-center px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700"
                >
                  <Save className="h-4 w-4 mr-2" />
                  Save Changes
                </button>
              </>
            ) : (
              <button
                onClick={() => setEditing(true)}
                className="flex items-center px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700"
              >
                <Edit className="h-4 w-4 mr-2" />
                Edit Profile
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-white rounded-lg border border-gray-200">
        <div className="border-b border-gray-200">
          <nav className="flex space-x-8 px-6">
            {[
              { id: 'personal', label: 'Personal Info', icon: User },
              { id: 'medical', label: 'Medical Info', icon: Heart },
              { id: 'emergency', label: 'Emergency Contact', icon: Phone },
              { id: 'preferences', label: 'Preferences', icon: Settings }
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
          {activeTab === 'personal' && <PersonalInfoTab />}
          {activeTab === 'medical' && <MedicalInfoTab />}
          {activeTab === 'emergency' && <EmergencyContactTab />}
          {activeTab === 'preferences' && <PreferencesTab />}
        </div>
      </div>

      {/* Password Change Modal */}
      {showPasswordModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4">
            <h2 className="text-xl font-semibold mb-4">Change Password</h2>
            
            <form onSubmit={handleChangePassword} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Current Password
                </label>
                <input
                  type="password"
                  value={passwordForm.currentPassword}
                  onChange={(e) => setPasswordForm({...passwordForm, currentPassword: e.target.value})}
                  className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-500"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  New Password
                </label>
                <input
                  type="password"
                  value={passwordForm.newPassword}
                  onChange={(e) => setPasswordForm({...passwordForm, newPassword: e.target.value})}
                  className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-500"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Confirm New Password
                </label>
                <input
                  type="password"
                  value={passwordForm.confirmPassword}
                  onChange={(e) => setPasswordForm({...passwordForm, confirmPassword: e.target.value})}
                  className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-500"
                  required
                />
              </div>

              <div className="flex space-x-3 pt-4">
                <button
                  type="button"
                  onClick={() => setShowPasswordModal(false)}
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700"
                >
                  Change Password
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Profile;

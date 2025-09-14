import React, { useState, useEffect } from 'react';
import { 
  Settings, 
  Save, 
  RefreshCw,
  Globe,
  Shield,
  Bell,
  Mail,
  Database,
  Server,
  Key,
  Upload,
  Download,
  AlertTriangle,
  CheckCircle,
  Edit,
  Trash2
} from 'lucide-react';
import api from '../../utils/api';


const SystemSettings = () => {
  const [settings, setSettings] = useState({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [activeSection, setActiveSection] = useState('general');

  const sections = [
    { id: 'general', label: 'General', icon: Settings },
    { id: 'security', label: 'Security', icon: Shield },
    { id: 'notifications', label: 'Notifications', icon: Bell },
    { id: 'email', label: 'Email', icon: Mail },
    { id: 'database', label: 'Database', icon: Database },
    { id: 'api', label: 'API Settings', icon: Server }
  ];

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      setLoading(true);
      const response = await api.get('/admin/settings');
      setSettings(response.data);
    } catch (error) {
      console.error('Error fetching settings:', error);
      
    } finally {
      setLoading(false);
    }
  };

  const saveSettings = async () => {
    try {
      setSaving(true);
      await api.put('/admin/settings', settings);
      
    } catch (error) {
      console.error('Error saving settings:', error);
      
    } finally {
      setSaving(false);
    }
  };

  const updateSetting = (section, key, value) => {
    setSettings(prev => ({
      ...prev,
      [section]: {
        ...prev[section],
        [key]: value
      }
    }));
  };

  const testConnection = async (type) => {
    try {
      const response = await api.post(`/admin/settings/test-${type}`);} catch (error) {
      console.error(`Error testing ${type} connection:`, error);
      
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
          <h1 className="text-2xl font-bold text-gray-900">System Settings</h1>
          <p className="text-gray-600">Configure system-wide settings and preferences</p>
        </div>
        <div className="flex items-center space-x-3">
          <button
            onClick={fetchSettings}
            className="flex items-center px-3 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50"
          >
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </button>
          <button
            onClick={saveSettings}
            disabled={saving}
            className="flex items-center px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:opacity-50"
          >
            <Save className="h-4 w-4 mr-2" />
            {saving ? 'Saving...' : 'Save Changes'}
          </button>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="flex">
          {/* Sidebar */}
          <div className="w-64 bg-gray-50 border-r border-gray-200">
            <nav className="p-4 space-y-2">
              {sections.map((section) => {
                const Icon = section.icon;
                return (
                  <button
                    key={section.id}
                    onClick={() => setActiveSection(section.id)}
                    className={`w-full flex items-center px-3 py-2 text-left rounded-md transition-colors ${
                      activeSection === section.id
                        ? 'bg-green-100 text-green-700 border-green-200'
                        : 'text-gray-600 hover:bg-gray-100'
                    }`}
                  >
                    <Icon className="h-5 w-5 mr-3" />
                    {section.label}
                  </button>
                );
              })}
            </nav>
          </div>

          {/* Content */}
          <div className="flex-1 p-6">
            {/* General Settings */}
            {activeSection === 'general' && (
              <div className="space-y-6">
                <h3 className="text-lg font-semibold text-gray-900">General Settings</h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Application Name
                    </label>
                    <input
                      type="text"
                      value={settings.general?.appName || ''}
                      onChange={(e) => updateSetting('general', 'appName', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Application URL
                    </label>
                    <input
                      type="url"
                      value={settings.general?.appUrl || ''}
                      onChange={(e) => updateSetting('general', 'appUrl', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Default Language
                    </label>
                    <select
                      value={settings.general?.defaultLanguage || 'en'}
                      onChange={(e) => updateSetting('general', 'defaultLanguage', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                    >
                      <option value="en">English</option>
                      <option value="hi">Hindi</option>
                      <option value="es">Spanish</option>
                    </select>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Timezone
                    </label>
                    <select
                      value={settings.general?.timezone || 'Asia/Kolkata'}
                      onChange={(e) => updateSetting('general', 'timezone', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                    >
                      <option value="Asia/Kolkata">Asia/Kolkata</option>
                      <option value="UTC">UTC</option>
                      <option value="America/New_York">America/New_York</option>
                    </select>
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      id="maintenanceMode"
                      checked={settings.general?.maintenanceMode || false}
                      onChange={(e) => updateSetting('general', 'maintenanceMode', e.target.checked)}
                      className="h-4 w-4 text-green-600 focus:ring-green-500 border-gray-300 rounded"
                    />
                    <label htmlFor="maintenanceMode" className="ml-2 text-sm text-gray-700">
                      Enable Maintenance Mode
                    </label>
                  </div>
                  
                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      id="userRegistration"
                      checked={settings.general?.allowUserRegistration || true}
                      onChange={(e) => updateSetting('general', 'allowUserRegistration', e.target.checked)}
                      className="h-4 w-4 text-green-600 focus:ring-green-500 border-gray-300 rounded"
                    />
                    <label htmlFor="userRegistration" className="ml-2 text-sm text-gray-700">
                      Allow User Registration
                    </label>
                  </div>
                </div>
              </div>
            )}

            {/* Security Settings */}
            {activeSection === 'security' && (
              <div className="space-y-6">
                <h3 className="text-lg font-semibold text-gray-900">Security Settings</h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      JWT Secret Key
                    </label>
                    <div className="flex">
                      <input
                        type="password"
                        value={settings.security?.jwtSecret || ''}
                        onChange={(e) => updateSetting('security', 'jwtSecret', e.target.value)}
                        className="flex-1 px-3 py-2 border border-gray-300 rounded-l-md focus:outline-none focus:ring-2 focus:ring-green-500"
                      />
                      <button
                        onClick={() => updateSetting('security', 'jwtSecret', Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15))}
                        className="px-3 py-2 bg-gray-100 border border-l-0 border-gray-300 rounded-r-md hover:bg-gray-200"
                      >
                        <Key className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Session Timeout (minutes)
                    </label>
                    <input
                      type="number"
                      value={settings.security?.sessionTimeout || 60}
                      onChange={(e) => updateSetting('security', 'sessionTimeout', parseInt(e.target.value))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Max Login Attempts
                    </label>
                    <input
                      type="number"
                      value={settings.security?.maxLoginAttempts || 5}
                      onChange={(e) => updateSetting('security', 'maxLoginAttempts', parseInt(e.target.value))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Password Min Length
                    </label>
                    <input
                      type="number"
                      value={settings.security?.passwordMinLength || 8}
                      onChange={(e) => updateSetting('security', 'passwordMinLength', parseInt(e.target.value))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                    />
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      id="twoFactorAuth"
                      checked={settings.security?.enableTwoFactorAuth || false}
                      onChange={(e) => updateSetting('security', 'enableTwoFactorAuth', e.target.checked)}
                      className="h-4 w-4 text-green-600 focus:ring-green-500 border-gray-300 rounded"
                    />
                    <label htmlFor="twoFactorAuth" className="ml-2 text-sm text-gray-700">
                      Enable Two-Factor Authentication
                    </label>
                  </div>
                  
                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      id="requirePasswordChange"
                      checked={settings.security?.requirePasswordChange || false}
                      onChange={(e) => updateSetting('security', 'requirePasswordChange', e.target.checked)}
                      className="h-4 w-4 text-green-600 focus:ring-green-500 border-gray-300 rounded"
                    />
                    <label htmlFor="requirePasswordChange" className="ml-2 text-sm text-gray-700">
                      Require Password Change Every 90 Days
                    </label>
                  </div>
                </div>
              </div>
            )}

            {/* Notification Settings */}
            {activeSection === 'notifications' && (
              <div className="space-y-6">
                <h3 className="text-lg font-semibold text-gray-900">Notification Settings</h3>
                
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                    <div>
                      <h4 className="font-medium text-gray-900">Email Notifications</h4>
                      <p className="text-sm text-gray-600">Send notifications via email</p>
                    </div>
                    <input
                      type="checkbox"
                      checked={settings.notifications?.email || true}
                      onChange={(e) => updateSetting('notifications', 'email', e.target.checked)}
                      className="h-4 w-4 text-green-600 focus:ring-green-500 border-gray-300 rounded"
                    />
                  </div>
                  
                  <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                    <div>
                      <h4 className="font-medium text-gray-900">SMS Notifications</h4>
                      <p className="text-sm text-gray-600">Send notifications via SMS</p>
                    </div>
                    <input
                      type="checkbox"
                      checked={settings.notifications?.sms || false}
                      onChange={(e) => updateSetting('notifications', 'sms', e.target.checked)}
                      className="h-4 w-4 text-green-600 focus:ring-green-500 border-gray-300 rounded"
                    />
                  </div>
                  
                  <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                    <div>
                      <h4 className="font-medium text-gray-900">Push Notifications</h4>
                      <p className="text-sm text-gray-600">Send push notifications to mobile apps</p>
                    </div>
                    <input
                      type="checkbox"
                      checked={settings.notifications?.push || false}
                      onChange={(e) => updateSetting('notifications', 'push', e.target.checked)}
                      className="h-4 w-4 text-green-600 focus:ring-green-500 border-gray-300 rounded"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* Email Settings */}
            {activeSection === 'email' && (
              <div className="space-y-6">
                <h3 className="text-lg font-semibold text-gray-900">Email Configuration</h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      SMTP Host
                    </label>
                    <input
                      type="text"
                      value={settings.email?.smtpHost || ''}
                      onChange={(e) => updateSetting('email', 'smtpHost', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      SMTP Port
                    </label>
                    <input
                      type="number"
                      value={settings.email?.smtpPort || 587}
                      onChange={(e) => updateSetting('email', 'smtpPort', parseInt(e.target.value))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Username
                    </label>
                    <input
                      type="text"
                      value={settings.email?.username || ''}
                      onChange={(e) => updateSetting('email', 'username', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Password
                    </label>
                    <input
                      type="password"
                      value={settings.email?.password || ''}
                      onChange={(e) => updateSetting('email', 'password', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      From Email
                    </label>
                    <input
                      type="email"
                      value={settings.email?.fromEmail || ''}
                      onChange={(e) => updateSetting('email', 'fromEmail', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      From Name
                    </label>
                    <input
                      type="text"
                      value={settings.email?.fromName || ''}
                      onChange={(e) => updateSetting('email', 'fromName', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                    />
                  </div>
                </div>

                <div className="flex items-center space-x-3">
                  <input
                    type="checkbox"
                    id="emailSSL"
                    checked={settings.email?.useSSL || true}
                    onChange={(e) => updateSetting('email', 'useSSL', e.target.checked)}
                    className="h-4 w-4 text-green-600 focus:ring-green-500 border-gray-300 rounded"
                  />
                  <label htmlFor="emailSSL" className="text-sm text-gray-700">
                    Use SSL/TLS
                  </label>
                </div>

                <button
                  onClick={() => testConnection('email')}
                  className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                >
                  <Mail className="h-4 w-4 mr-2" />
                  Test Email Connection
                </button>
              </div>
            )}

            {/* Database Settings */}
            {activeSection === 'database' && (
              <div className="space-y-6">
                <h3 className="text-lg font-semibold text-gray-900">Database Configuration</h3>
                
                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                  <div className="flex">
                    <AlertTriangle className="h-5 w-5 text-yellow-400 mr-2" />
                    <div>
                      <h4 className="text-sm font-medium text-yellow-800">Warning</h4>
                      <p className="text-sm text-yellow-700">
                        Changing database settings requires application restart and may cause data loss if not configured properly.
                      </p>
                    </div>
                  </div>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Database URL
                    </label>
                    <input
                      type="text"
                      value={settings.database?.url || ''}
                      onChange={(e) => updateSetting('database', 'url', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                      placeholder="mongodb://localhost:27017/panchakarma"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Connection Pool Size
                    </label>
                    <input
                      type="number"
                      value={settings.database?.poolSize || 10}
                      onChange={(e) => updateSetting('database', 'poolSize', parseInt(e.target.value))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                    />
                  </div>
                </div>

                <button
                  onClick={() => testConnection('database')}
                  className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                >
                  <Database className="h-4 w-4 mr-2" />
                  Test Database Connection
                </button>
              </div>
            )}

            {/* API Settings */}
            {activeSection === 'api' && (
              <div className="space-y-6">
                <h3 className="text-lg font-semibold text-gray-900">API Configuration</h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      API Rate Limit (requests/minute)
                    </label>
                    <input
                      type="number"
                      value={settings.api?.rateLimit || 100}
                      onChange={(e) => updateSetting('api', 'rateLimit', parseInt(e.target.value))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Request Timeout (seconds)
                    </label>
                    <input
                      type="number"
                      value={settings.api?.timeout || 30}
                      onChange={(e) => updateSetting('api', 'timeout', parseInt(e.target.value))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                    />
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      id="apiLogging"
                      checked={settings.api?.enableLogging || true}
                      onChange={(e) => updateSetting('api', 'enableLogging', e.target.checked)}
                      className="h-4 w-4 text-green-600 focus:ring-green-500 border-gray-300 rounded"
                    />
                    <label htmlFor="apiLogging" className="ml-2 text-sm text-gray-700">
                      Enable API Request Logging
                    </label>
                  </div>
                  
                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      id="corsEnabled"
                      checked={settings.api?.corsEnabled || true}
                      onChange={(e) => updateSetting('api', 'corsEnabled', e.target.checked)}
                      className="h-4 w-4 text-green-600 focus:ring-green-500 border-gray-300 rounded"
                    />
                    <label htmlFor="corsEnabled" className="ml-2 text-sm text-gray-700">
                      Enable CORS
                    </label>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default SystemSettings;

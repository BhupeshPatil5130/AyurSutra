import React, { useState, useEffect } from 'react';
import { 
  Bell, BellOff, Settings, Check, X, Clock,
  Mail, MessageSquare, Calendar, AlertCircle,
  Filter, Search, RefreshCw, Trash2, Archive
} from 'lucide-react';
import api from '../../utils/api';


const PatientNotificationManagement = () => {
  const [notifications, setNotifications] = useState([]);
  const [settings, setSettings] = useState({
    email: true,
    sms: true,
    push: true,
    appointments: true,
    reminders: true,
    messages: true,
    updates: false
  });
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    fetchNotifications();
    fetchSettings();
  }, [filter]);

  const fetchNotifications = async () => {
    try {
      setLoading(true);
      const response = await api.get('/patient/notifications', {
        params: { filter }
      });
      setNotifications(Array.isArray(response.data) ? response.data : []);
    } catch (error) {
      console.error('Error fetching notifications:', error);
      
      setNotifications([]);
    } finally {
      setLoading(false);
    }
  };

  const fetchSettings = async () => {
    try {
      const response = await api.get('/patient/notification-settings');
      setSettings(response.data || {
        email: true,
        sms: true,
        push: true,
        appointments: true,
        reminders: true,
        messages: true,
        updates: false
      });
    } catch (error) {
      console.error('Error fetching settings:', error);
    }
  };

  const updateSettings = async (newSettings) => {
    try {
      await api.patch('/patient/notification-settings', newSettings);
      setSettings(newSettings);
      
    } catch (error) {
      console.error('Error updating settings:', error);
      
    }
  };

  const markAsRead = async (notificationId) => {
    try {
      await api.patch(`/patient/notifications/${notificationId}/read`);
      setNotifications(prev => prev.map(notif => 
        notif._id === notificationId ? { ...notif, read: true } : notif
      ));
    } catch (error) {
      console.error('Error marking as read:', error);
    }
  };

  const deleteNotification = async (notificationId) => {
    try {
      await api.delete(`/patient/notifications/${notificationId}`);
      setNotifications(prev => prev.filter(notif => notif._id !== notificationId));
      
    } catch (error) {
      console.error('Error deleting notification:', error);
      
    }
  };

  const markAllAsRead = async () => {
    try {
      await api.patch('/patient/notifications/mark-all-read');
      setNotifications(prev => prev.map(notif => ({ ...notif, read: true })));
      
    } catch (error) {
      console.error('Error marking all as read:', error);
      
    }
  };

  const getNotificationIcon = (type) => {
    switch (type) {
      case 'appointment':
        return <Calendar className="h-5 w-5 text-blue-600" />;
      case 'message':
        return <MessageSquare className="h-5 w-5 text-green-600" />;
      case 'reminder':
        return <Clock className="h-5 w-5 text-orange-600" />;
      case 'alert':
        return <AlertCircle className="h-5 w-5 text-red-600" />;
      default:
        return <Bell className="h-5 w-5 text-gray-600" />;
    }
  };

  const filteredNotifications = notifications.filter(notif =>
    notif.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    notif.message?.toLowerCase().includes(searchTerm.toLowerCase())
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
          <h1 className="text-3xl font-bold text-gray-900">Notifications</h1>
          <p className="text-gray-600">Manage your notifications and preferences</p>
        </div>
        <div className="flex items-center space-x-3">
          <button
            onClick={markAllAsRead}
            className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
          >
            <Check className="h-4 w-4 mr-2" />
            Mark All Read
          </button>
          <button
            onClick={fetchNotifications}
            className="flex items-center px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700"
          >
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </button>
        </div>
      </div>

      {/* Notification Settings */}
      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex items-center mb-6">
          <Settings className="h-6 w-6 text-gray-600 mr-3" />
          <h3 className="text-lg font-semibold text-gray-900">Notification Preferences</h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h4 className="text-md font-medium text-gray-900 mb-4">Delivery Methods</h4>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <Mail className="h-5 w-5 text-gray-600 mr-3" />
                  <span className="text-gray-900">Email Notifications</span>
                </div>
                <button
                  onClick={() => updateSettings({ ...settings, email: !settings.email })}
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                    settings.email ? 'bg-green-600' : 'bg-gray-200'
                  }`}
                >
                  <span
                    className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                      settings.email ? 'translate-x-6' : 'translate-x-1'
                    }`}
                  />
                </button>
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <MessageSquare className="h-5 w-5 text-gray-600 mr-3" />
                  <span className="text-gray-900">SMS Notifications</span>
                </div>
                <button
                  onClick={() => updateSettings({ ...settings, sms: !settings.sms })}
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                    settings.sms ? 'bg-green-600' : 'bg-gray-200'
                  }`}
                >
                  <span
                    className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                      settings.sms ? 'translate-x-6' : 'translate-x-1'
                    }`}
                  />
                </button>
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <Bell className="h-5 w-5 text-gray-600 mr-3" />
                  <span className="text-gray-900">Push Notifications</span>
                </div>
                <button
                  onClick={() => updateSettings({ ...settings, push: !settings.push })}
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                    settings.push ? 'bg-green-600' : 'bg-gray-200'
                  }`}
                >
                  <span
                    className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                      settings.push ? 'translate-x-6' : 'translate-x-1'
                    }`}
                  />
                </button>
              </div>
            </div>
          </div>

          <div>
            <h4 className="text-md font-medium text-gray-900 mb-4">Notification Types</h4>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <Calendar className="h-5 w-5 text-gray-600 mr-3" />
                  <span className="text-gray-900">Appointment Reminders</span>
                </div>
                <button
                  onClick={() => updateSettings({ ...settings, appointments: !settings.appointments })}
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                    settings.appointments ? 'bg-green-600' : 'bg-gray-200'
                  }`}
                >
                  <span
                    className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                      settings.appointments ? 'translate-x-6' : 'translate-x-1'
                    }`}
                  />
                </button>
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <Clock className="h-5 w-5 text-gray-600 mr-3" />
                  <span className="text-gray-900">General Reminders</span>
                </div>
                <button
                  onClick={() => updateSettings({ ...settings, reminders: !settings.reminders })}
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                    settings.reminders ? 'bg-green-600' : 'bg-gray-200'
                  }`}
                >
                  <span
                    className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                      settings.reminders ? 'translate-x-6' : 'translate-x-1'
                    }`}
                  />
                </button>
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <MessageSquare className="h-5 w-5 text-gray-600 mr-3" />
                  <span className="text-gray-900">New Messages</span>
                </div>
                <button
                  onClick={() => updateSettings({ ...settings, messages: !settings.messages })}
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                    settings.messages ? 'bg-green-600' : 'bg-gray-200'
                  }`}
                >
                  <span
                    className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                      settings.messages ? 'translate-x-6' : 'translate-x-1'
                    }`}
                  />
                </button>
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <AlertCircle className="h-5 w-5 text-gray-600 mr-3" />
                  <span className="text-gray-900">System Updates</span>
                </div>
                <button
                  onClick={() => updateSettings({ ...settings, updates: !settings.updates })}
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                    settings.updates ? 'bg-green-600' : 'bg-gray-200'
                  }`}
                >
                  <span
                    className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                      settings.updates ? 'translate-x-6' : 'translate-x-1'
                    }`}
                  />
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="bg-white rounded-lg shadow p-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search notifications..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
            />
          </div>
          
          <select
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
          >
            <option value="all">All Notifications</option>
            <option value="unread">Unread</option>
            <option value="read">Read</option>
            <option value="appointment">Appointments</option>
            <option value="message">Messages</option>
            <option value="reminder">Reminders</option>
          </select>
          
          <div className="flex items-center justify-end">
            <span className="text-sm text-gray-600">
              {filteredNotifications.filter(n => !n.read).length} unread
            </span>
          </div>
        </div>
      </div>

      {/* Notifications List */}
      <div className="bg-white rounded-lg shadow">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900">
            Recent Notifications ({filteredNotifications.length})
          </h3>
        </div>
        
        <div className="divide-y divide-gray-200">
          {filteredNotifications.length > 0 ? (
            filteredNotifications.map((notification) => (
              <div
                key={notification._id}
                className={`p-6 hover:bg-gray-50 ${!notification.read ? 'bg-blue-50' : ''}`}
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-start space-x-4 flex-1">
                    <div className="flex-shrink-0 mt-1">
                      {getNotificationIcon(notification.type)}
                    </div>
                    
                    <div className="flex-1">
                      <div className="flex items-center space-x-2 mb-1">
                        <h4 className={`text-lg font-medium ${!notification.read ? 'text-gray-900' : 'text-gray-700'}`}>
                          {notification.title}
                        </h4>
                        {!notification.read && (
                          <span className="w-2 h-2 bg-blue-500 rounded-full"></span>
                        )}
                      </div>
                      
                      <p className={`text-sm mb-2 ${!notification.read ? 'text-gray-700' : 'text-gray-600'}`}>
                        {notification.message}
                      </p>
                      
                      <div className="flex items-center space-x-4 text-xs text-gray-500">
                        <span>{new Date(notification.createdAt).toLocaleString()}</span>
                        <span className="capitalize">{notification.type}</span>
                        {notification.priority === 'high' && (
                          <span className="px-2 py-1 bg-red-100 text-red-800 rounded-full">
                            High Priority
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-2 ml-4">
                    {!notification.read && (
                      <button
                        onClick={() => markAsRead(notification._id)}
                        className="p-2 text-blue-600 hover:bg-blue-100 rounded-full"
                        title="Mark as Read"
                      >
                        <Check className="h-4 w-4" />
                      </button>
                    )}
                    
                    <button
                      onClick={() => deleteNotification(notification._id)}
                      className="p-2 text-red-600 hover:bg-red-100 rounded-full"
                      title="Delete"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="p-12 text-center">
              <Bell className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No notifications found</h3>
              <p className="text-gray-500">
                {searchTerm ? 'Try adjusting your search terms.' : 'You\'re all caught up! No new notifications.'}
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default PatientNotificationManagement;

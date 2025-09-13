import React, { useState, useEffect } from 'react';
import { 
  Bell, 
  Check, 
  Trash2, 
  Filter,
  Calendar,
  User,
  MessageCircle,
  FileText,
  AlertCircle,
  Info,
  CheckCircle,
  X,
  Settings
} from 'lucide-react';

const Notifications = () => {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    type: 'all',
    status: 'all',
    priority: 'all'
  });
  const [showSettings, setShowSettings] = useState(false);
  const [notificationSettings, setNotificationSettings] = useState({
    email: true,
    sms: true,
    push: true,
    appointmentReminders: true,
    therapyUpdates: true,
    invoiceAlerts: true,
    systemUpdates: true
  });

  useEffect(() => {
    fetchNotifications();
    fetchNotificationSettings();
  }, [filters]);

  const fetchNotifications = async () => {
    try {
      const token = localStorage.getItem('token');
      const queryParams = new URLSearchParams();
      
      if (filters.type !== 'all') queryParams.append('type', filters.type);
      if (filters.status !== 'all') queryParams.append('read', filters.status === 'read');
      if (filters.priority !== 'all') queryParams.append('priority', filters.priority);
      
      const response = await fetch(`/api/notifications?${queryParams}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await response.json();
      setNotifications(data.notifications || []);
    } catch (error) {
      console.error('Error fetching notifications:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchNotificationSettings = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('/api/notifications/preferences', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await response.json();
      setNotificationSettings(data.preferences || notificationSettings);
    } catch (error) {
      console.error('Error fetching notification settings:', error);
    }
  };

  const markAsRead = async (notificationId) => {
    try {
      const token = localStorage.getItem('token');
      await fetch(`/api/notifications/${notificationId}/read`, {
        method: 'PUT',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      fetchNotifications();
    } catch (error) {
      console.error('Error marking notification as read:', error);
    }
  };

  const markAllAsRead = async () => {
    try {
      const token = localStorage.getItem('token');
      await fetch('/api/notifications/mark-all-read', {
        method: 'PUT',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      fetchNotifications();
    } catch (error) {
      console.error('Error marking all notifications as read:', error);
    }
  };

  const deleteNotification = async (notificationId) => {
    try {
      const token = localStorage.getItem('token');
      await fetch(`/api/notifications/${notificationId}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      fetchNotifications();
    } catch (error) {
      console.error('Error deleting notification:', error);
    }
  };

  const updateNotificationSettings = async () => {
    try {
      const token = localStorage.getItem('token');
      await fetch('/api/notifications/preferences', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(notificationSettings)
      });
      setShowSettings(false);
    } catch (error) {
      console.error('Error updating notification settings:', error);
    }
  };

  const getNotificationIcon = (type) => {
    switch (type) {
      case 'appointment':
        return <Calendar className="h-5 w-5 text-blue-500" />;
      case 'message':
        return <MessageCircle className="h-5 w-5 text-green-500" />;
      case 'invoice':
        return <FileText className="h-5 w-5 text-orange-500" />;
      case 'therapy':
        return <User className="h-5 w-5 text-purple-500" />;
      case 'system':
        return <Info className="h-5 w-5 text-gray-500" />;
      default:
        return <Bell className="h-5 w-5 text-gray-500" />;
    }
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'high':
        return 'border-l-red-500 bg-red-50';
      case 'medium':
        return 'border-l-yellow-500 bg-yellow-50';
      case 'low':
        return 'border-l-green-500 bg-green-50';
      default:
        return 'border-l-gray-500 bg-gray-50';
    }
  };

  const formatTime = (timestamp) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffInHours = (now - date) / (1000 * 60 * 60);

    if (diffInHours < 1) {
      return 'Just now';
    } else if (diffInHours < 24) {
      return `${Math.floor(diffInHours)} hours ago`;
    } else if (diffInHours < 48) {
      return 'Yesterday';
    } else {
      return date.toLocaleDateString();
    }
  };

  const NotificationCard = ({ notification }) => (
    <div className={`bg-white rounded-lg border-l-4 p-4 hover:shadow-md transition-shadow ${
      notification.read ? 'border-l-gray-300' : getPriorityColor(notification.priority)
    } ${!notification.read ? 'bg-opacity-50' : ''}`}>
      <div className="flex items-start justify-between">
        <div className="flex items-start space-x-3 flex-1">
          {getNotificationIcon(notification.type)}
          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between mb-1">
              <h3 className={`text-sm font-medium ${
                notification.read ? 'text-gray-700' : 'text-gray-900'
              }`}>
                {notification.title}
              </h3>
              <span className="text-xs text-gray-500">
                {formatTime(notification.createdAt)}
              </span>
            </div>
            <p className={`text-sm ${
              notification.read ? 'text-gray-500' : 'text-gray-700'
            }`}>
              {notification.message}
            </p>
            {notification.actionUrl && (
              <button className="text-xs text-blue-600 hover:text-blue-700 mt-2">
                View Details
              </button>
            )}
          </div>
        </div>
        
        <div className="flex items-center space-x-2 ml-4">
          {!notification.read && (
            <button
              onClick={() => markAsRead(notification._id)}
              className="text-blue-600 hover:text-blue-700"
              title="Mark as read"
            >
              <Check className="h-4 w-4" />
            </button>
          )}
          <button
            onClick={() => deleteNotification(notification._id)}
            className="text-red-600 hover:text-red-700"
            title="Delete"
          >
            <Trash2 className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  );

  const SettingsModal = () => (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4">
        <h2 className="text-xl font-semibold mb-4">Notification Settings</h2>
        
        <div className="space-y-4">
          <div>
            <h3 className="text-sm font-medium text-gray-900 mb-3">Delivery Methods</h3>
            <div className="space-y-2">
              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={notificationSettings.email}
                  onChange={(e) => setNotificationSettings({
                    ...notificationSettings,
                    email: e.target.checked
                  })}
                  className="rounded border-gray-300 text-green-600 focus:ring-green-500"
                />
                <span className="ml-2 text-sm text-gray-700">Email notifications</span>
              </label>
              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={notificationSettings.sms}
                  onChange={(e) => setNotificationSettings({
                    ...notificationSettings,
                    sms: e.target.checked
                  })}
                  className="rounded border-gray-300 text-green-600 focus:ring-green-500"
                />
                <span className="ml-2 text-sm text-gray-700">SMS notifications</span>
              </label>
              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={notificationSettings.push}
                  onChange={(e) => setNotificationSettings({
                    ...notificationSettings,
                    push: e.target.checked
                  })}
                  className="rounded border-gray-300 text-green-600 focus:ring-green-500"
                />
                <span className="ml-2 text-sm text-gray-700">Push notifications</span>
              </label>
            </div>
          </div>

          <div>
            <h3 className="text-sm font-medium text-gray-900 mb-3">Notification Types</h3>
            <div className="space-y-2">
              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={notificationSettings.appointmentReminders}
                  onChange={(e) => setNotificationSettings({
                    ...notificationSettings,
                    appointmentReminders: e.target.checked
                  })}
                  className="rounded border-gray-300 text-green-600 focus:ring-green-500"
                />
                <span className="ml-2 text-sm text-gray-700">Appointment reminders</span>
              </label>
              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={notificationSettings.therapyUpdates}
                  onChange={(e) => setNotificationSettings({
                    ...notificationSettings,
                    therapyUpdates: e.target.checked
                  })}
                  className="rounded border-gray-300 text-green-600 focus:ring-green-500"
                />
                <span className="ml-2 text-sm text-gray-700">Therapy plan updates</span>
              </label>
              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={notificationSettings.invoiceAlerts}
                  onChange={(e) => setNotificationSettings({
                    ...notificationSettings,
                    invoiceAlerts: e.target.checked
                  })}
                  className="rounded border-gray-300 text-green-600 focus:ring-green-500"
                />
                <span className="ml-2 text-sm text-gray-700">Invoice alerts</span>
              </label>
              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={notificationSettings.systemUpdates}
                  onChange={(e) => setNotificationSettings({
                    ...notificationSettings,
                    systemUpdates: e.target.checked
                  })}
                  className="rounded border-gray-300 text-green-600 focus:ring-green-500"
                />
                <span className="ml-2 text-sm text-gray-700">System updates</span>
              </label>
            </div>
          </div>
        </div>

        <div className="flex space-x-3 pt-6">
          <button
            onClick={() => setShowSettings(false)}
            className="flex-1 px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
          >
            Cancel
          </button>
          <button
            onClick={updateNotificationSettings}
            className="flex-1 px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700"
          >
            Save Settings
          </button>
        </div>
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

  const unreadCount = notifications.filter(n => !n.read).length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Notifications</h1>
          <p className="text-gray-600">
            Stay updated with your appointments, messages, and health journey
            {unreadCount > 0 && (
              <span className="ml-2 inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800">
                {unreadCount} unread
              </span>
            )}
          </p>
        </div>
        <div className="flex items-center space-x-3">
          {unreadCount > 0 && (
            <button
              onClick={markAllAsRead}
              className="flex items-center px-3 py-2 text-sm text-blue-600 hover:text-blue-700 font-medium"
            >
              <CheckCircle className="h-4 w-4 mr-1" />
              Mark all as read
            </button>
          )}
          <button
            onClick={() => setShowSettings(true)}
            className="flex items-center px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
          >
            <Settings className="h-4 w-4 mr-2" />
            Settings
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg border border-gray-200 p-4">
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
            <option value="appointment">Appointments</option>
            <option value="message">Messages</option>
            <option value="invoice">Invoices</option>
            <option value="therapy">Therapy</option>
            <option value="system">System</option>
          </select>

          <select
            value={filters.status}
            onChange={(e) => setFilters({...filters, status: e.target.value})}
            className="border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
          >
            <option value="all">All Status</option>
            <option value="unread">Unread</option>
            <option value="read">Read</option>
          </select>

          <select
            value={filters.priority}
            onChange={(e) => setFilters({...filters, priority: e.target.value})}
            className="border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
          >
            <option value="all">All Priority</option>
            <option value="high">High</option>
            <option value="medium">Medium</option>
            <option value="low">Low</option>
          </select>
        </div>
      </div>

      {/* Notifications List */}
      <div className="space-y-3">
        {notifications.length > 0 ? (
          notifications.map(notification => (
            <NotificationCard key={notification._id} notification={notification} />
          ))
        ) : (
          <div className="bg-white rounded-lg border border-gray-200 p-12 text-center">
            <Bell className="h-16 w-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No notifications</h3>
            <p className="text-gray-600">You're all caught up! New notifications will appear here.</p>
          </div>
        )}
      </div>

      {/* Settings Modal */}
      {showSettings && <SettingsModal />}
    </div>
  );
};

export default Notifications;

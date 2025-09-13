import React, { useState, useEffect } from 'react';
import { 
  Bell, BellOff, Check, X, Eye, EyeOff, Filter, Search,
  Calendar, Clock, User, AlertCircle, CheckCircle, Info,
  Settings, Trash2, Archive, Star, RefreshCw, MoreVertical
} from 'lucide-react';
import api from '../../utils/api';
import toast from 'react-hot-toast';

const NotificationManagement = () => {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('all');
  const [filterStatus, setFilterStatus] = useState('all');
  const [selectedNotifications, setSelectedNotifications] = useState([]);
  const [notificationSettings, setNotificationSettings] = useState({
    appointments: true,
    payments: true,
    reviews: true,
    messages: true,
    systemUpdates: false,
    marketing: false
  });

  const notificationTypes = [
    { value: 'all', label: 'All Notifications' },
    { value: 'appointment', label: 'Appointments' },
    { value: 'payment', label: 'Payments' },
    { value: 'review', label: 'Reviews' },
    { value: 'message', label: 'Messages' },
    { value: 'system', label: 'System' },
    { value: 'reminder', label: 'Reminders' }
  ];

  const statusFilters = [
    { value: 'all', label: 'All Status' },
    { value: 'unread', label: 'Unread' },
    { value: 'read', label: 'Read' },
    { value: 'archived', label: 'Archived' }
  ];

  useEffect(() => {
    fetchNotifications();
    fetchNotificationSettings();
  }, [filterType, filterStatus]);

  const fetchNotifications = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (filterType !== 'all') params.append('type', filterType);
      if (filterStatus !== 'all') params.append('status', filterStatus);

      const response = await api.get(`/practitioner/notifications?${params}`);
      setNotifications(Array.isArray(response.data) ? response.data : []);
    } catch (error) {
      console.error('Error fetching notifications:', error);
      setNotifications([]);
      toast.error('Error loading notifications');
    } finally {
      setLoading(false);
    }
  };

  const fetchNotificationSettings = async () => {
    try {
      const response = await api.get('/practitioner/notification-settings');
      setNotificationSettings(response.data);
    } catch (error) {
      console.error('Error fetching notification settings:', error);
    }
  };

  const markAsRead = async (notificationId) => {
    try {
      await api.patch(`/practitioner/notifications/${notificationId}/read`);
      setNotifications(prev => 
        prev.map(notif => 
          notif._id === notificationId 
            ? { ...notif, isRead: true }
            : notif
        )
      );
    } catch (error) {
      console.error('Error marking notification as read:', error);
      toast.error('Error updating notification');
    }
  };

  const markAsUnread = async (notificationId) => {
    try {
      await api.patch(`/practitioner/notifications/${notificationId}/unread`);
      setNotifications(prev => 
        prev.map(notif => 
          notif._id === notificationId 
            ? { ...notif, isRead: false }
            : notif
        )
      );
    } catch (error) {
      console.error('Error marking notification as unread:', error);
      toast.error('Error updating notification');
    }
  };

  const archiveNotification = async (notificationId) => {
    try {
      await api.patch(`/practitioner/notifications/${notificationId}/archive`);
      setNotifications(prev => 
        prev.map(notif => 
          notif._id === notificationId 
            ? { ...notif, isArchived: true }
            : notif
        )
      );
      toast.success('Notification archived');
    } catch (error) {
      console.error('Error archiving notification:', error);
      toast.error('Error archiving notification');
    }
  };

  const deleteNotification = async (notificationId) => {
    try {
      await api.delete(`/practitioner/notifications/${notificationId}`);
      setNotifications(prev => prev.filter(notif => notif._id !== notificationId));
      toast.success('Notification deleted');
    } catch (error) {
      console.error('Error deleting notification:', error);
      toast.error('Error deleting notification');
    }
  };

  const bulkMarkAsRead = async () => {
    try {
      await api.patch('/practitioner/notifications/bulk-read', {
        notificationIds: selectedNotifications
      });
      setNotifications(prev => 
        prev.map(notif => 
          selectedNotifications.includes(notif._id)
            ? { ...notif, isRead: true }
            : notif
        )
      );
      setSelectedNotifications([]);
      toast.success('Notifications marked as read');
    } catch (error) {
      console.error('Error bulk updating notifications:', error);
      toast.error('Error updating notifications');
    }
  };

  const bulkArchive = async () => {
    try {
      await api.patch('/practitioner/notifications/bulk-archive', {
        notificationIds: selectedNotifications
      });
      setNotifications(prev => 
        prev.map(notif => 
          selectedNotifications.includes(notif._id)
            ? { ...notif, isArchived: true }
            : notif
        )
      );
      setSelectedNotifications([]);
      toast.success('Notifications archived');
    } catch (error) {
      console.error('Error bulk archiving notifications:', error);
      toast.error('Error archiving notifications');
    }
  };

  const updateNotificationSettings = async (settings) => {
    try {
      await api.put('/practitioner/notification-settings', settings);
      setNotificationSettings(settings);
      toast.success('Notification settings updated');
    } catch (error) {
      console.error('Error updating notification settings:', error);
      toast.error('Error updating settings');
    }
  };

  const getNotificationIcon = (type) => {
    switch (type) {
      case 'appointment':
        return <Calendar className="h-5 w-5 text-blue-600" />;
      case 'payment':
        return <CheckCircle className="h-5 w-5 text-green-600" />;
      case 'review':
        return <Star className="h-5 w-5 text-yellow-600" />;
      case 'message':
        return <User className="h-5 w-5 text-purple-600" />;
      case 'system':
        return <Info className="h-5 w-5 text-gray-600" />;
      case 'reminder':
        return <Clock className="h-5 w-5 text-orange-600" />;
      default:
        return <Bell className="h-5 w-5 text-gray-600" />;
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

  const getTimeAgo = (timestamp) => {
    const now = new Date();
    const notificationTime = new Date(timestamp);
    const diffInHours = (now - notificationTime) / (1000 * 60 * 60);
    
    if (diffInHours < 1) {
      return 'Just now';
    } else if (diffInHours < 24) {
      return `${Math.floor(diffInHours)}h ago`;
    } else {
      return `${Math.floor(diffInHours / 24)}d ago`;
    }
  };

  const filteredNotifications = notifications.filter(notification =>
    notification.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    notification.message?.toLowerCase().includes(searchTerm.toLowerCase())
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
          <h1 className="text-3xl font-bold text-gray-900">Notification Management</h1>
          <p className="text-gray-600">Manage your notifications and preferences</p>
        </div>
        <div className="flex items-center space-x-3">
          <button
            onClick={fetchNotifications}
            className="flex items-center px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700"
          >
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </button>
          <button className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700">
            <Settings className="h-4 w-4 mr-2" />
            Settings
          </button>
        </div>
      </div>

      {/* Filters and Search */}
      <div className="bg-white rounded-lg shadow p-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
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
            value={filterType}
            onChange={(e) => setFilterType(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
          >
            {notificationTypes.map((type) => (
              <option key={type.value} value={type.value}>{type.label}</option>
            ))}
          </select>
          
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
          >
            {statusFilters.map((status) => (
              <option key={status.value} value={status.value}>{status.label}</option>
            ))}
          </select>
          
          {selectedNotifications.length > 0 && (
            <div className="flex items-center space-x-2">
              <button
                onClick={bulkMarkAsRead}
                className="flex items-center px-3 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 text-sm"
              >
                <Check className="h-4 w-4 mr-1" />
                Mark Read
              </button>
              <button
                onClick={bulkArchive}
                className="flex items-center px-3 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700 text-sm"
              >
                <Archive className="h-4 w-4 mr-1" />
                Archive
              </button>
            </div>
          )}
        </div>

        {/* Notification Settings */}
        <div className="border-t pt-4">
          <h3 className="text-sm font-medium text-gray-900 mb-3">Notification Preferences</h3>
          <div className="grid grid-cols-2 md:grid-cols-6 gap-4">
            {Object.entries(notificationSettings).map(([key, value]) => (
              <label key={key} className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  checked={value}
                  onChange={(e) => updateNotificationSettings({
                    ...notificationSettings,
                    [key]: e.target.checked
                  })}
                  className="rounded border-gray-300 text-green-600 focus:ring-green-500"
                />
                <span className="text-sm text-gray-700 capitalize">
                  {key.replace(/([A-Z])/g, ' $1').trim()}
                </span>
              </label>
            ))}
          </div>
        </div>
      </div>

      {/* Notifications List */}
      <div className="bg-white rounded-lg shadow">
        <div className="px-6 py-4 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold text-gray-900">
              Notifications ({filteredNotifications.length})
            </h3>
            <div className="flex items-center space-x-2">
              <span className="text-sm text-gray-500">
                {filteredNotifications.filter(n => !n.isRead).length} unread
              </span>
            </div>
          </div>
        </div>
        
        <div className="divide-y divide-gray-200">
          {filteredNotifications.length > 0 ? (
            filteredNotifications.map((notification) => (
              <div
                key={notification._id}
                className={`p-6 hover:bg-gray-50 ${
                  !notification.isRead ? 'bg-blue-50' : ''
                } ${notification.isArchived ? 'opacity-60' : ''}`}
              >
                <div className="flex items-start space-x-4">
                  <input
                    type="checkbox"
                    checked={selectedNotifications.includes(notification._id)}
                    onChange={(e) => {
                      if (e.target.checked) {
                        setSelectedNotifications(prev => [...prev, notification._id]);
                      } else {
                        setSelectedNotifications(prev => prev.filter(id => id !== notification._id));
                      }
                    }}
                    className="mt-1 rounded border-gray-300 text-green-600 focus:ring-green-500"
                  />
                  
                  <div className="flex-shrink-0">
                    {getNotificationIcon(notification.type)}
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center space-x-2">
                          <h4 className={`text-sm font-medium ${
                            !notification.isRead ? 'text-gray-900' : 'text-gray-700'
                          }`}>
                            {notification.title}
                          </h4>
                          {notification.priority === 'high' && (
                            <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800">
                              High Priority
                            </span>
                          )}
                          {!notification.isRead && (
                            <div className="w-2 h-2 bg-blue-600 rounded-full"></div>
                          )}
                        </div>
                        
                        <p className="mt-1 text-sm text-gray-600">
                          {notification.message}
                        </p>
                        
                        <div className="mt-2 flex items-center space-x-4 text-xs text-gray-500">
                          <span>{getTimeAgo(notification.createdAt)}</span>
                          <span className="capitalize">{notification.type}</span>
                          {notification.actionUrl && (
                            <button className="text-blue-600 hover:text-blue-800">
                              View Details
                            </button>
                          )}
                        </div>
                      </div>
                      
                      <div className="flex items-center space-x-2 ml-4">
                        {!notification.isRead ? (
                          <button
                            onClick={() => markAsRead(notification._id)}
                            className="p-1 text-gray-400 hover:text-blue-600"
                            title="Mark as read"
                          >
                            <Eye className="h-4 w-4" />
                          </button>
                        ) : (
                          <button
                            onClick={() => markAsUnread(notification._id)}
                            className="p-1 text-gray-400 hover:text-blue-600"
                            title="Mark as unread"
                          >
                            <EyeOff className="h-4 w-4" />
                          </button>
                        )}
                        
                        <button
                          onClick={() => archiveNotification(notification._id)}
                          className="p-1 text-gray-400 hover:text-yellow-600"
                          title="Archive"
                        >
                          <Archive className="h-4 w-4" />
                        </button>
                        
                        <button
                          onClick={() => deleteNotification(notification._id)}
                          className="p-1 text-gray-400 hover:text-red-600"
                          title="Delete"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                        
                        <button className="p-1 text-gray-400 hover:text-gray-600">
                          <MoreVertical className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="p-12 text-center">
              <Bell className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No notifications</h3>
              <p className="text-gray-500">You're all caught up! No new notifications to display.</p>
            </div>
          )}
        </div>
      </div>

      {/* Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="p-2 bg-blue-100 rounded-lg">
              <Bell className="h-6 w-6 text-blue-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Total Notifications</p>
              <p className="text-2xl font-bold text-gray-900">{notifications.length}</p>
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="p-2 bg-yellow-100 rounded-lg">
              <AlertCircle className="h-6 w-6 text-yellow-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Unread</p>
              <p className="text-2xl font-bold text-gray-900">
                {notifications.filter(n => !n.isRead).length}
              </p>
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="p-2 bg-green-100 rounded-lg">
              <CheckCircle className="h-6 w-6 text-green-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Read</p>
              <p className="text-2xl font-bold text-gray-900">
                {notifications.filter(n => n.isRead).length}
              </p>
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="p-2 bg-gray-100 rounded-lg">
              <Archive className="h-6 w-6 text-gray-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Archived</p>
              <p className="text-2xl font-bold text-gray-900">
                {notifications.filter(n => n.isArchived).length}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default NotificationManagement;

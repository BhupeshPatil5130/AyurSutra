import React, { useState, useEffect } from 'react';
import { 
  Bell, 
  Send, 
  Users, 
  Calendar, 
  AlertCircle, 
  CheckCircle,
  X,
  Plus,
  MessageSquare
} from 'lucide-react';
import api from '../utils/api';
import toast from 'react-hot-toast';

const NotificationSystem = () => {
  const [notifications, setNotifications] = useState([]);
  const [patients, setPatients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showSendModal, setShowSendModal] = useState(false);
  const [notificationData, setNotificationData] = useState({
    recipients: [],
    title: '',
    message: '',
    type: 'info',
    priority: 'medium',
    scheduledFor: ''
  });

  const notificationTypes = [
    { value: 'appointment', label: 'Appointment Reminder', icon: Calendar },
    { value: 'therapy', label: 'Therapy Update', icon: MessageSquare },
    { value: 'info', label: 'General Information', icon: Bell },
    { value: 'urgent', label: 'Urgent Alert', icon: AlertCircle }
  ];

  const priorityLevels = [
    { value: 'low', label: 'Low Priority', color: 'text-gray-600' },
    { value: 'medium', label: 'Medium Priority', color: 'text-yellow-600' },
    { value: 'high', label: 'High Priority', color: 'text-red-600' }
  ];

  useEffect(() => {
    fetchNotifications();
    fetchPatients();
  }, []);

  const fetchNotifications = async () => {
    try {
      const response = await api.get('/notifications/sent');
      setNotifications(response.data);
    } catch (error) {
      console.error('Error fetching notifications:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchPatients = async () => {
    try {
      const response = await api.get('/practitioner/patients');
      setPatients(response.data);
    } catch (error) {
      console.error('Error fetching patients:', error);
    }
  };

  const sendNotification = async () => {
    try {
      await api.post('/notifications/send', notificationData);
      toast.success('Notification sent successfully');
      setShowSendModal(false);
      setNotificationData({
        recipients: [],
        title: '',
        message: '',
        type: 'info',
        priority: 'medium',
        scheduledFor: ''
      });
      fetchNotifications();
    } catch (error) {
      console.error('Error sending notification:', error);
      toast.error('Error sending notification');
    }
  };

  const toggleRecipient = (patientId) => {
    setNotificationData(prev => ({
      ...prev,
      recipients: prev.recipients.includes(patientId)
        ? prev.recipients.filter(id => id !== patientId)
        : [...prev.recipients, patientId]
    }));
  };

  const selectAllPatients = () => {
    setNotificationData(prev => ({
      ...prev,
      recipients: prev.recipients.length === patients.length ? [] : patients.map(p => p._id)
    }));
  };

  const getTypeIcon = (type) => {
    const typeConfig = notificationTypes.find(t => t.value === type);
    const Icon = typeConfig?.icon || Bell;
    return <Icon className="h-4 w-4" />;
  };

  const getTypeColor = (type) => {
    switch (type) {
      case 'appointment': return 'text-blue-600 bg-blue-100';
      case 'therapy': return 'text-green-600 bg-green-100';
      case 'urgent': return 'text-red-600 bg-red-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'high': return 'text-red-600';
      case 'medium': return 'text-yellow-600';
      case 'low': return 'text-gray-600';
      default: return 'text-gray-600';
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
          <h1 className="text-2xl font-bold text-gray-900">Notification System</h1>
          <p className="text-gray-600">Send notifications and alerts to your patients</p>
        </div>
        <button
          onClick={() => setShowSendModal(true)}
          className="flex items-center px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700"
        >
          <Plus className="h-5 w-5 mr-2" />
          Send Notification
        </button>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {notificationTypes.map((type) => {
          const Icon = type.icon;
          return (
            <button
              key={type.value}
              onClick={() => {
                setNotificationData(prev => ({ ...prev, type: type.value }));
                setShowSendModal(true);
              }}
              className="flex items-center p-4 bg-white rounded-lg shadow hover:shadow-md transition-shadow border border-gray-200"
            >
              <Icon className="h-8 w-8 text-green-600 mr-3" />
              <div className="text-left">
                <h3 className="font-medium text-gray-900">{type.label}</h3>
                <p className="text-sm text-gray-600">Quick send</p>
              </div>
            </button>
          );
        })}
      </div>

      {/* Recent Notifications */}
      <div className="bg-white rounded-lg shadow">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-medium text-gray-900">Recent Notifications</h3>
        </div>
        <div className="divide-y divide-gray-200">
          {notifications.length > 0 ? (
            notifications.map((notification) => (
              <div key={notification._id} className="p-6">
                <div className="flex items-start justify-between">
                  <div className="flex items-start space-x-3">
                    <div className={`p-2 rounded-full ${getTypeColor(notification.type)}`}>
                      {getTypeIcon(notification.type)}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center space-x-2">
                        <h4 className="text-lg font-medium text-gray-900">{notification.title}</h4>
                        <span className={`px-2 py-1 text-xs font-semibold rounded-full ${getTypeColor(notification.type)}`}>
                          {notification.type}
                        </span>
                        <span className={`text-sm font-medium ${getPriorityColor(notification.priority)}`}>
                          {notification.priority} priority
                        </span>
                      </div>
                      <p className="text-gray-700 mt-1">{notification.message}</p>
                      <div className="flex items-center space-x-4 mt-2 text-sm text-gray-600">
                        <div className="flex items-center">
                          <Users className="h-4 w-4 mr-1" />
                          {notification.recipients?.length || 0} recipients
                        </div>
                        <div className="flex items-center">
                          <Calendar className="h-4 w-4 mr-1" />
                          {new Date(notification.createdAt).toLocaleDateString()}
                        </div>
                        {notification.scheduledFor && (
                          <div className="flex items-center">
                            <Bell className="h-4 w-4 mr-1" />
                            Scheduled: {new Date(notification.scheduledFor).toLocaleString()}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    {notification.status === 'sent' && (
                      <CheckCircle className="h-5 w-5 text-green-500" title="Sent" />
                    )}
                    {notification.status === 'scheduled' && (
                      <Bell className="h-5 w-5 text-yellow-500" title="Scheduled" />
                    )}
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="p-6 text-center">
              <Bell className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500">No notifications sent yet</p>
            </div>
          )}
        </div>
      </div>

      {/* Send Notification Modal */}
      {showSendModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 overflow-y-auto">
          <div className="bg-white rounded-lg p-6 w-full max-w-2xl max-h-screen overflow-y-auto m-4">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-semibold text-gray-900">Send Notification</h3>
              <button
                onClick={() => setShowSendModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="h-6 w-6" />
              </button>
            </div>

            <div className="space-y-6">
              {/* Notification Type */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Notification Type</label>
                <div className="grid grid-cols-2 gap-3">
                  {notificationTypes.map((type) => {
                    const Icon = type.icon;
                    return (
                      <button
                        key={type.value}
                        onClick={() => setNotificationData(prev => ({ ...prev, type: type.value }))}
                        className={`flex items-center p-3 border rounded-md ${
                          notificationData.type === type.value
                            ? 'border-green-500 bg-green-50 text-green-700'
                            : 'border-gray-300 hover:border-gray-400'
                        }`}
                      >
                        <Icon className="h-5 w-5 mr-2" />
                        {type.label}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Priority */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Priority</label>
                <select
                  value={notificationData.priority}
                  onChange={(e) => setNotificationData(prev => ({ ...prev, priority: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                >
                  {priorityLevels.map(level => (
                    <option key={level.value} value={level.value}>{level.label}</option>
                  ))}
                </select>
              </div>

              {/* Title */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Title</label>
                <input
                  type="text"
                  value={notificationData.title}
                  onChange={(e) => setNotificationData(prev => ({ ...prev, title: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                  placeholder="Enter notification title..."
                  required
                />
              </div>

              {/* Message */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Message</label>
                <textarea
                  value={notificationData.message}
                  onChange={(e) => setNotificationData(prev => ({ ...prev, message: e.target.value }))}
                  rows={4}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                  placeholder="Enter your message..."
                  required
                />
              </div>

              {/* Recipients */}
              <div>
                <div className="flex items-center justify-between mb-3">
                  <label className="block text-sm font-medium text-gray-700">Recipients</label>
                  <button
                    type="button"
                    onClick={selectAllPatients}
                    className="text-sm text-green-600 hover:text-green-800"
                  >
                    {notificationData.recipients.length === patients.length ? 'Deselect All' : 'Select All'}
                  </button>
                </div>
                <div className="max-h-48 overflow-y-auto border border-gray-300 rounded-md">
                  {patients.map((patient) => (
                    <label key={patient._id} className="flex items-center p-3 hover:bg-gray-50 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={notificationData.recipients.includes(patient._id)}
                        onChange={() => toggleRecipient(patient._id)}
                        className="h-4 w-4 text-green-600 focus:ring-green-500 border-gray-300 rounded"
                      />
                      <div className="ml-3 flex items-center">
                        <div className="w-8 h-8 bg-gradient-to-r from-green-400 to-blue-500 rounded-full flex items-center justify-center text-white font-semibold text-sm">
                          {patient.userId?.firstName?.charAt(0)}{patient.userId?.lastName?.charAt(0)}
                        </div>
                        <div className="ml-3">
                          <p className="text-sm font-medium text-gray-900">
                            {patient.userId?.firstName} {patient.userId?.lastName}
                          </p>
                          <p className="text-xs text-gray-600">{patient.userId?.email}</p>
                        </div>
                      </div>
                    </label>
                  ))}
                </div>
                <p className="text-sm text-gray-600 mt-2">
                  {notificationData.recipients.length} of {patients.length} patients selected
                </p>
              </div>

              {/* Schedule For Later */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Schedule for Later (Optional)
                </label>
                <input
                  type="datetime-local"
                  value={notificationData.scheduledFor}
                  onChange={(e) => setNotificationData(prev => ({ ...prev, scheduledFor: e.target.value }))}
                  min={new Date().toISOString().slice(0, 16)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                />
                <p className="text-xs text-gray-600 mt-1">
                  Leave empty to send immediately
                </p>
              </div>
            </div>

            <div className="flex justify-end space-x-3 mt-6">
              <button
                onClick={() => setShowSendModal(false)}
                className="px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={sendNotification}
                className="flex items-center px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700"
                disabled={!notificationData.title || !notificationData.message || notificationData.recipients.length === 0}
              >
                <Send className="h-4 w-4 mr-2" />
                {notificationData.scheduledFor ? 'Schedule' : 'Send'} Notification
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default NotificationSystem;

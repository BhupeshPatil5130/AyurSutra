import React, { useState, useEffect } from 'react';
import { 
  Bell, 
  Plus, 
  Send, 
  Users, 
  UserCheck, 
  Heart,
  Search,
  Filter,
  Eye,
  Trash2,
  AlertTriangle,
  CheckCircle,
  Info,
  MessageSquare
} from 'lucide-react';
import api from '../../utils/api';
import toast from 'react-hot-toast';

const NotificationCenter = () => {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [typeFilter, setTypeFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    message: '',
    type: 'info',
    recipients: 'all',
    priority: 'medium',
    scheduledFor: ''
  });

  const notificationTypes = [
    { value: 'info', label: 'Information', icon: Info, color: 'bg-blue-100 text-blue-700' },
    { value: 'warning', label: 'Warning', icon: AlertTriangle, color: 'bg-yellow-100 text-yellow-700' },
    { value: 'success', label: 'Success', icon: CheckCircle, color: 'bg-green-100 text-green-700' },
    { value: 'error', label: 'Error', icon: AlertTriangle, color: 'bg-red-100 text-red-700' }
  ];

  const recipientOptions = [
    { value: 'all', label: 'All Users', icon: Users },
    { value: 'practitioners', label: 'All Practitioners', icon: UserCheck },
    { value: 'patients', label: 'All Patients', icon: Heart },
    { value: 'admins', label: 'All Admins', icon: Users }
  ];

  useEffect(() => {
    fetchNotifications();
  }, [searchTerm, typeFilter, statusFilter]);

  const fetchNotifications = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams({
        search: searchTerm,
        type: typeFilter !== 'all' ? typeFilter : '',
        status: statusFilter !== 'all' ? statusFilter : ''
      });

      const response = await api.get(`/admin/notifications?${params}`);
      setNotifications(response.data.notifications || []);
    } catch (error) {
      console.error('Error fetching notifications:', error);
      toast.error('Error fetching notifications');
    } finally {
      setLoading(false);
    }
  };

  const sendNotification = async () => {
    try {
      await api.post('/admin/notifications/broadcast', formData);
      toast.success('Notification sent successfully');
      setShowCreateModal(false);
      resetForm();
      fetchNotifications();
    } catch (error) {
      console.error('Error sending notification:', error);
      toast.error('Error sending notification');
    }
  };

  const deleteNotification = async (notificationId) => {
    if (window.confirm('Are you sure you want to delete this notification?')) {
      try {
        await api.delete(`/admin/notifications/${notificationId}`);
        toast.success('Notification deleted successfully');
        fetchNotifications();
      } catch (error) {
        console.error('Error deleting notification:', error);
        toast.error('Error deleting notification');
      }
    }
  };

  const resetForm = () => {
    setFormData({
      title: '',
      message: '',
      type: 'info',
      recipients: 'all',
      priority: 'medium',
      scheduledFor: ''
    });
  };

  const getTypeConfig = (type) => {
    return notificationTypes.find(t => t.value === type) || notificationTypes[0];
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
          <h1 className="text-2xl font-bold text-gray-900">Notification Center</h1>
          <p className="text-gray-600">Send and manage system notifications</p>
        </div>
        <button
          onClick={() => setShowCreateModal(true)}
          className="flex items-center px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700"
        >
          <Plus className="h-4 w-4 mr-2" />
          Send Notification
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="p-3 bg-blue-100 rounded-full">
              <Bell className="h-6 w-6 text-blue-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Total Sent</p>
              <p className="text-2xl font-bold text-gray-900">{notifications.length}</p>
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="p-3 bg-green-100 rounded-full">
              <CheckCircle className="h-6 w-6 text-green-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Delivered</p>
              <p className="text-2xl font-bold text-gray-900">
                {notifications.filter(n => n.status === 'delivered').length}
              </p>
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="p-3 bg-yellow-100 rounded-full">
              <AlertTriangle className="h-6 w-6 text-yellow-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Pending</p>
              <p className="text-2xl font-bold text-gray-900">
                {notifications.filter(n => n.status === 'pending').length}
              </p>
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="p-3 bg-purple-100 rounded-full">
              <Eye className="h-6 w-6 text-purple-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Read Rate</p>
              <p className="text-2xl font-bold text-gray-900">
                {notifications.length > 0 ? Math.round((notifications.filter(n => n.readCount > 0).length / notifications.length) * 100) : 0}%
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg shadow p-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search notifications..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
            />
          </div>
          
          <select
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
          >
            <option value="all">All Types</option>
            {notificationTypes.map(type => (
              <option key={type.value} value={type.value}>{type.label}</option>
            ))}
          </select>
          
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
          >
            <option value="all">All Status</option>
            <option value="pending">Pending</option>
            <option value="delivered">Delivered</option>
            <option value="failed">Failed</option>
          </select>
        </div>
      </div>

      {/* Notifications List */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="divide-y divide-gray-200">
          {notifications.map((notification) => {
            const typeConfig = getTypeConfig(notification.type);
            const TypeIcon = typeConfig.icon;
            
            return (
              <div key={notification._id} className="p-6 hover:bg-gray-50">
                <div className="flex items-start justify-between">
                  <div className="flex items-start space-x-4 flex-1">
                    <div className={`p-2 rounded-full ${typeConfig.color}`}>
                      <TypeIcon className="h-5 w-5" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center space-x-2 mb-2">
                        <h3 className="text-lg font-semibold text-gray-900">{notification.title}</h3>
                        <span className={`px-2 py-1 text-xs font-semibold rounded-full ${typeConfig.color}`}>
                          {notification.type}
                        </span>
                        <span className={`px-2 py-1 text-xs font-semibold rounded-full ${
                          notification.priority === 'high' ? 'bg-red-100 text-red-700' :
                          notification.priority === 'medium' ? 'bg-yellow-100 text-yellow-700' :
                          'bg-gray-100 text-gray-700'
                        }`}>
                          {notification.priority} priority
                        </span>
                      </div>
                      <p className="text-gray-600 mb-3">{notification.message}</p>
                      <div className="flex items-center space-x-4 text-sm text-gray-500">
                        <span>Recipients: {notification.recipients}</span>
                        <span>Sent: {new Date(notification.createdAt).toLocaleString()}</span>
                        {notification.readCount && (
                          <span>Read by: {notification.readCount} users</span>
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className={`px-2 py-1 text-xs font-semibold rounded-full ${
                      notification.status === 'delivered' ? 'bg-green-100 text-green-700' :
                      notification.status === 'pending' ? 'bg-yellow-100 text-yellow-700' :
                      'bg-red-100 text-red-700'
                    }`}>
                      {notification.status}
                    </span>
                    <button
                      onClick={() => deleteNotification(notification._id)}
                      className="p-2 text-red-600 hover:bg-red-50 rounded-md"
                      title="Delete"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {notifications.length === 0 && (
        <div className="text-center py-12">
          <Bell className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-500">No notifications found</p>
        </div>
      )}

      {/* Create Notification Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-2xl">
            <h3 className="text-lg font-semibold mb-4">Send New Notification</h3>
            <div className="space-y-4">
              <input
                type="text"
                placeholder="Notification Title"
                value={formData.title}
                onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
              />
              
              <textarea
                placeholder="Notification Message"
                value={formData.message}
                onChange={(e) => setFormData(prev => ({ ...prev, message: e.target.value }))}
                rows={4}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
              />
              
              <div className="grid grid-cols-2 gap-4">
                <select
                  value={formData.type}
                  onChange={(e) => setFormData(prev => ({ ...prev, type: e.target.value }))}
                  className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                >
                  {notificationTypes.map(type => (
                    <option key={type.value} value={type.value}>{type.label}</option>
                  ))}
                </select>
                
                <select
                  value={formData.priority}
                  onChange={(e) => setFormData(prev => ({ ...prev, priority: e.target.value }))}
                  className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                >
                  <option value="low">Low Priority</option>
                  <option value="medium">Medium Priority</option>
                  <option value="high">High Priority</option>
                </select>
              </div>
              
              <select
                value={formData.recipients}
                onChange={(e) => setFormData(prev => ({ ...prev, recipients: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
              >
                {recipientOptions.map(option => (
                  <option key={option.value} value={option.value}>{option.label}</option>
                ))}
              </select>
              
              <input
                type="datetime-local"
                value={formData.scheduledFor}
                onChange={(e) => setFormData(prev => ({ ...prev, scheduledFor: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                placeholder="Schedule for later (optional)"
              />
            </div>
            
            <div className="flex justify-end space-x-3 mt-6">
              <button
                onClick={() => setShowCreateModal(false)}
                className="px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={sendNotification}
                className="flex items-center px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700"
              >
                <Send className="h-4 w-4 mr-2" />
                Send Notification
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default NotificationCenter;

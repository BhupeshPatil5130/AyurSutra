import React, { useState, useEffect } from 'react';
import { 
  Activity, 
  Search, 
  Filter, 
  Eye,
  Download,
  RefreshCw,
  Calendar,
  User,
  Shield,
  AlertTriangle,
  CheckCircle,
  XCircle,
  Clock,
  FileText
} from 'lucide-react';
import api from '../../utils/api';
import toast from 'react-hot-toast';

const AuditLogs = () => {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [actionFilter, setActionFilter] = useState('all');
  const [userFilter, setUserFilter] = useState('all');
  const [dateFilter, setDateFilter] = useState('all');
  const [selectedLog, setSelectedLog] = useState(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [logsPerPage] = useState(20);
  const [totalLogs, setTotalLogs] = useState(0);

  const actionTypes = [
    { value: 'login', label: 'Login', color: 'bg-blue-100 text-blue-700', icon: User },
    { value: 'logout', label: 'Logout', color: 'bg-gray-100 text-gray-700', icon: User },
    { value: 'create', label: 'Create', color: 'bg-green-100 text-green-700', icon: CheckCircle },
    { value: 'update', label: 'Update', color: 'bg-yellow-100 text-yellow-700', icon: Clock },
    { value: 'delete', label: 'Delete', color: 'bg-red-100 text-red-700', icon: XCircle },
    { value: 'admin', label: 'Admin Action', color: 'bg-purple-100 text-purple-700', icon: Shield },
    { value: 'error', label: 'Error', color: 'bg-red-100 text-red-700', icon: AlertTriangle }
  ];

  useEffect(() => {
    fetchLogs();
  }, [currentPage, actionFilter, userFilter, dateFilter, searchTerm]);

  const fetchLogs = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams({
        page: currentPage,
        limit: logsPerPage,
        search: searchTerm,
        action: actionFilter !== 'all' ? actionFilter : '',
        user: userFilter !== 'all' ? userFilter : '',
        date: dateFilter !== 'all' ? dateFilter : ''
      });

      const response = await api.get(`/admin/audit-logs?${params}`);
      setLogs(response.data.logs);
      setTotalLogs(response.data.total);
    } catch (error) {
      console.error('Error fetching audit logs:', error);
      toast.error('Error fetching audit logs');
    } finally {
      setLoading(false);
    }
  };

  const exportLogs = async () => {
    try {
      const params = new URLSearchParams({
        action: actionFilter !== 'all' ? actionFilter : '',
        user: userFilter !== 'all' ? userFilter : '',
        date: dateFilter !== 'all' ? dateFilter : '',
        search: searchTerm
      });

      const response = await api.get(`/admin/audit-logs/export?${params}`, {
        responseType: 'blob'
      });
      
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `audit-logs-${new Date().toISOString().split('T')[0]}.csv`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      
      toast.success('Audit logs exported successfully');
    } catch (error) {
      console.error('Error exporting audit logs:', error);
      toast.error('Error exporting audit logs');
    }
  };

  const viewLogDetails = (log) => {
    setSelectedLog(log);
    setShowDetailsModal(true);
  };

  const getActionConfig = (action) => {
    return actionTypes.find(a => a.value === action) || actionTypes[0];
  };

  const formatDate = (date) => {
    return new Date(date).toLocaleString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    });
  };

  const getSeverityColor = (severity) => {
    switch (severity) {
      case 'high': return 'text-red-600 bg-red-100';
      case 'medium': return 'text-yellow-600 bg-yellow-100';
      case 'low': return 'text-green-600 bg-green-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const totalPages = Math.ceil(totalLogs / logsPerPage);

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
          <h1 className="text-2xl font-bold text-gray-900">Audit Logs</h1>
          <p className="text-gray-600">Track all system activities and user actions</p>
        </div>
        <div className="flex items-center space-x-3">
          <button
            onClick={exportLogs}
            className="flex items-center px-3 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50"
          >
            <Download className="h-4 w-4 mr-2" />
            Export
          </button>
          <button
            onClick={fetchLogs}
            className="flex items-center px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700"
          >
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg shadow p-6">
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search logs..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
            />
          </div>
          
          <select
            value={actionFilter}
            onChange={(e) => setActionFilter(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
          >
            <option value="all">All Actions</option>
            {actionTypes.map(action => (
              <option key={action.value} value={action.value}>{action.label}</option>
            ))}
          </select>
          
          <select
            value={userFilter}
            onChange={(e) => setUserFilter(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
          >
            <option value="all">All Users</option>
            <option value="admin">Admins</option>
            <option value="practitioner">Practitioners</option>
            <option value="patient">Patients</option>
          </select>
          
          <select
            value={dateFilter}
            onChange={(e) => setDateFilter(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
          >
            <option value="all">All Time</option>
            <option value="today">Today</option>
            <option value="yesterday">Yesterday</option>
            <option value="this-week">This Week</option>
            <option value="this-month">This Month</option>
          </select>

          <div className="text-sm text-gray-600 flex items-center">
            <Activity className="h-4 w-4 mr-1" />
            Total: {totalLogs}
          </div>
        </div>
      </div>

      {/* Logs Table */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Timestamp
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  User
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Action
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Resource
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  IP Address
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Severity
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {logs.map((log) => {
                const actionConfig = getActionConfig(log.action);
                const Icon = actionConfig.icon;
                
                return (
                  <tr key={log._id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      <div className="flex items-center">
                        <Calendar className="h-4 w-4 text-gray-400 mr-2" />
                        {formatDate(log.timestamp)}
                      </div>
                    </td>
                    
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="w-8 h-8 bg-gradient-to-r from-blue-400 to-purple-500 rounded-full flex items-center justify-center text-white font-semibold text-xs">
                          {log.user?.firstName?.charAt(0) || 'S'}{log.user?.lastName?.charAt(0) || 'Y'}
                        </div>
                        <div className="ml-3">
                          <div className="text-sm font-medium text-gray-900">
                            {log.user ? `${log.user.firstName} ${log.user.lastName}` : 'System'}
                          </div>
                          <div className="text-sm text-gray-500">
                            {log.user?.role || 'system'}
                          </div>
                        </div>
                      </div>
                    </td>
                    
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${actionConfig.color}`}>
                        <Icon className="h-3 w-3 mr-1" />
                        {actionConfig.label}
                      </span>
                    </td>
                    
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{log.resource}</div>
                      <div className="text-sm text-gray-500">{log.resourceId}</div>
                    </td>
                    
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {log.ipAddress}
                    </td>
                    
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getSeverityColor(log.severity)}`}>
                        {log.severity || 'low'}
                      </span>
                    </td>
                    
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <button
                        onClick={() => viewLogDetails(log)}
                        className="text-blue-600 hover:text-blue-900"
                        title="View Details"
                      >
                        <Eye className="h-4 w-4" />
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="bg-white px-4 py-3 flex items-center justify-between border-t border-gray-200 sm:px-6">
          <div className="flex-1 flex justify-between sm:hidden">
            <button
              onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
              disabled={currentPage === 1}
              className="relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50"
            >
              Previous
            </button>
            <button
              onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
              disabled={currentPage === totalPages}
              className="ml-3 relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50"
            >
              Next
            </button>
          </div>
          <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
            <div>
              <p className="text-sm text-gray-700">
                Showing <span className="font-medium">{(currentPage - 1) * logsPerPage + 1}</span> to{' '}
                <span className="font-medium">{Math.min(currentPage * logsPerPage, totalLogs)}</span> of{' '}
                <span className="font-medium">{totalLogs}</span> results
              </p>
            </div>
            <div>
              <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px">
                <button
                  onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                  disabled={currentPage === 1}
                  className="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50"
                >
                  Previous
                </button>
                {[...Array(Math.min(5, totalPages))].map((_, i) => {
                  const page = i + 1;
                  return (
                    <button
                      key={page}
                      onClick={() => setCurrentPage(page)}
                      className={`relative inline-flex items-center px-4 py-2 border text-sm font-medium ${
                        currentPage === page
                          ? 'z-10 bg-green-50 border-green-500 text-green-600'
                          : 'bg-white border-gray-300 text-gray-500 hover:bg-gray-50'
                      }`}
                    >
                      {page}
                    </button>
                  );
                })}
                <button
                  onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                  disabled={currentPage === totalPages}
                  className="relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50"
                >
                  Next
                </button>
              </nav>
            </div>
          </div>
        </div>
      </div>

      {/* Log Details Modal */}
      {showDetailsModal && selectedLog && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg w-full max-w-3xl max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-semibold text-gray-900">
                  Audit Log Details
                </h3>
                <button
                  onClick={() => {
                    setShowDetailsModal(false);
                    setSelectedLog(null);
                  }}
                  className="text-gray-400 hover:text-gray-600"
                >
                  ×
                </button>
              </div>

              <div className="space-y-6">
                {/* Basic Information */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="bg-gray-50 rounded-lg p-4">
                    <h4 className="font-semibold text-gray-900 mb-3">Basic Information</h4>
                    <div className="space-y-2">
                      <div>
                        <label className="text-sm font-medium text-gray-600">Timestamp</label>
                        <p className="text-gray-900">{formatDate(selectedLog.timestamp)}</p>
                      </div>
                      <div>
                        <label className="text-sm font-medium text-gray-600">Action</label>
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getActionConfig(selectedLog.action).color}`}>
                          {getActionConfig(selectedLog.action).label}
                        </span>
                      </div>
                      <div>
                        <label className="text-sm font-medium text-gray-600">Severity</label>
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getSeverityColor(selectedLog.severity)}`}>
                          {selectedLog.severity || 'low'}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="bg-gray-50 rounded-lg p-4">
                    <h4 className="font-semibold text-gray-900 mb-3">User Information</h4>
                    <div className="space-y-2">
                      <div>
                        <label className="text-sm font-medium text-gray-600">User</label>
                        <p className="text-gray-900">
                          {selectedLog.user ? `${selectedLog.user.firstName} ${selectedLog.user.lastName}` : 'System'}
                        </p>
                      </div>
                      <div>
                        <label className="text-sm font-medium text-gray-600">Role</label>
                        <p className="text-gray-900 capitalize">{selectedLog.user?.role || 'system'}</p>
                      </div>
                      <div>
                        <label className="text-sm font-medium text-gray-600">IP Address</label>
                        <p className="text-gray-900">{selectedLog.ipAddress}</p>
                      </div>
                      <div>
                        <label className="text-sm font-medium text-gray-600">User Agent</label>
                        <p className="text-gray-900 text-sm">{selectedLog.userAgent || 'Not available'}</p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Resource Information */}
                <div className="bg-gray-50 rounded-lg p-4">
                  <h4 className="font-semibold text-gray-900 mb-3">Resource Information</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="text-sm font-medium text-gray-600">Resource Type</label>
                      <p className="text-gray-900">{selectedLog.resource}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-600">Resource ID</label>
                      <p className="text-gray-900 font-mono text-sm">{selectedLog.resourceId}</p>
                    </div>
                  </div>
                </div>

                {/* Description */}
                <div className="bg-gray-50 rounded-lg p-4">
                  <h4 className="font-semibold text-gray-900 mb-3">Description</h4>
                  <p className="text-gray-900">{selectedLog.description}</p>
                </div>

                {/* Additional Data */}
                {selectedLog.metadata && Object.keys(selectedLog.metadata).length > 0 && (
                  <div className="bg-gray-50 rounded-lg p-4">
                    <h4 className="font-semibold text-gray-900 mb-3">Additional Data</h4>
                    <pre className="text-sm text-gray-900 bg-white p-3 rounded border overflow-x-auto">
                      {JSON.stringify(selectedLog.metadata, null, 2)}
                    </pre>
                  </div>
                )}

                {/* Changes */}
                {selectedLog.changes && (
                  <div className="bg-gray-50 rounded-lg p-4">
                    <h4 className="font-semibold text-gray-900 mb-3">Changes Made</h4>
                    <div className="space-y-2">
                      {Object.entries(selectedLog.changes).map(([field, change]) => (
                        <div key={field} className="flex items-center justify-between p-2 bg-white rounded">
                          <span className="font-medium text-gray-700">{field}</span>
                          <div className="flex items-center space-x-2">
                            <span className="text-red-600 line-through">{change.from}</span>
                            <span className="text-gray-400">→</span>
                            <span className="text-green-600">{change.to}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Actions */}
              <div className="flex justify-end space-x-3 mt-6 pt-6 border-t border-gray-200">
                <button
                  onClick={() => {
                    setShowDetailsModal(false);
                    setSelectedLog(null);
                  }}
                  className="px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AuditLogs;

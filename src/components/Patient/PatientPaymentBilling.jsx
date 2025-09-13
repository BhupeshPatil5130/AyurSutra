import React, { useState, useEffect } from 'react';
import { 
  CreditCard, DollarSign, Calendar, Download, Receipt,
  Plus, Search, Filter, RefreshCw, AlertCircle, CheckCircle,
  Clock, FileText, Eye, Wallet, TrendingUp, PieChart,
  ArrowUpRight, ArrowDownRight, History, Settings
} from 'lucide-react';
import api from '../../utils/api';
import toast from 'react-hot-toast';

const PatientPaymentBilling = () => {
  const [payments, setPayments] = useState([]);
  const [invoices, setInvoices] = useState([]);
  const [paymentMethods, setPaymentMethods] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedInvoice, setSelectedInvoice] = useState(null);
  const [showAddPaymentMethod, setShowAddPaymentMethod] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [dateRange, setDateRange] = useState('all');
  const [stats, setStats] = useState({
    totalPaid: 0,
    totalPending: 0,
    totalOverdue: 0,
    thisMonth: 0
  });

  const [newPaymentMethod, setNewPaymentMethod] = useState({
    type: 'card',
    cardNumber: '',
    expiryMonth: '',
    expiryYear: '',
    cvv: '',
    holderName: '',
    isDefault: false
  });

  useEffect(() => {
    fetchPaymentData();
  }, [filterStatus, dateRange]);

  const fetchPaymentData = async () => {
    try {
      setLoading(true);
      const [paymentsRes, invoicesRes, methodsRes, statsRes] = await Promise.all([
        api.get('/patient/payments', { params: { status: filterStatus, dateRange } }),
        api.get('/patient/invoices', { params: { status: filterStatus, dateRange } }),
        api.get('/patient/payment-methods'),
        api.get('/patient/payment-stats')
      ]);

      setPayments(paymentsRes.data);
      setInvoices(invoicesRes.data);
      setPaymentMethods(methodsRes.data);
      setStats(statsRes.data);
    } catch (error) {
      console.error('Error fetching payment data:', error);
      toast.error('Error loading payment information');
    } finally {
      setLoading(false);
    }
  };

  const addPaymentMethod = async () => {
    try {
      const response = await api.post('/patient/payment-methods', newPaymentMethod);
      setPaymentMethods(prev => [...prev, response.data]);
      setShowAddPaymentMethod(false);
      setNewPaymentMethod({
        type: 'card',
        cardNumber: '',
        expiryMonth: '',
        expiryYear: '',
        cvv: '',
        holderName: '',
        isDefault: false
      });
      toast.success('Payment method added successfully');
    } catch (error) {
      console.error('Error adding payment method:', error);
      toast.error('Error adding payment method');
    }
  };

  const payInvoice = async (invoiceId, paymentMethodId) => {
    try {
      await api.post(`/patient/invoices/${invoiceId}/pay`, { paymentMethodId });
      fetchPaymentData();
      toast.success('Payment processed successfully');
    } catch (error) {
      console.error('Error processing payment:', error);
      toast.error('Error processing payment');
    }
  };

  const downloadInvoice = async (invoiceId, invoiceNumber) => {
    try {
      const response = await api.get(`/patient/invoices/${invoiceId}/download`, {
        responseType: 'blob'
      });
      
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `invoice-${invoiceNumber}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (error) {
      console.error('Error downloading invoice:', error);
      toast.error('Error downloading invoice');
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'paid':
        return <CheckCircle className="h-5 w-5 text-green-600" />;
      case 'pending':
        return <Clock className="h-5 w-5 text-yellow-600" />;
      case 'overdue':
        return <AlertCircle className="h-5 w-5 text-red-600" />;
      default:
        return <FileText className="h-5 w-5 text-gray-600" />;
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'paid':
        return 'bg-green-100 text-green-800';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'overdue':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const filteredInvoices = invoices.filter(invoice =>
    invoice.invoiceNumber?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    invoice.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    invoice.practitioner?.name?.toLowerCase().includes(searchTerm.toLowerCase())
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
          <h1 className="text-3xl font-bold text-gray-900">Payment & Billing</h1>
          <p className="text-gray-600">Manage your payments, invoices, and billing information</p>
        </div>
        <div className="flex items-center space-x-3">
          <button
            onClick={() => setShowAddPaymentMethod(true)}
            className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
          >
            <Plus className="h-4 w-4 mr-2" />
            Add Payment Method
          </button>
          <button
            onClick={fetchPaymentData}
            className="flex items-center px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700"
          >
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white p-6 rounded-lg shadow">
          <div className="flex items-center">
            <div className="p-2 bg-green-100 rounded-lg">
              <CheckCircle className="h-6 w-6 text-green-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Total Paid</p>
              <p className="text-2xl font-bold text-gray-900">${stats.totalPaid}</p>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow">
          <div className="flex items-center">
            <div className="p-2 bg-yellow-100 rounded-lg">
              <Clock className="h-6 w-6 text-yellow-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Pending</p>
              <p className="text-2xl font-bold text-gray-900">${stats.totalPending}</p>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow">
          <div className="flex items-center">
            <div className="p-2 bg-red-100 rounded-lg">
              <AlertCircle className="h-6 w-6 text-red-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Overdue</p>
              <p className="text-2xl font-bold text-gray-900">${stats.totalOverdue}</p>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow">
          <div className="flex items-center">
            <div className="p-2 bg-blue-100 rounded-lg">
              <TrendingUp className="h-6 w-6 text-blue-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">This Month</p>
              <p className="text-2xl font-bold text-gray-900">${stats.thisMonth}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Payment Methods */}
      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900">Payment Methods</h3>
          <button
            onClick={() => setShowAddPaymentMethod(true)}
            className="text-blue-600 hover:text-blue-800 text-sm font-medium"
          >
            Add New Method
          </button>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {paymentMethods.map((method) => (
            <div key={method._id} className="border border-gray-200 rounded-lg p-4">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center">
                  <CreditCard className="h-5 w-5 text-gray-600 mr-2" />
                  <span className="font-medium text-gray-900">
                    **** **** **** {method.last4}
                  </span>
                </div>
                {method.isDefault && (
                  <span className="px-2 py-1 bg-green-100 text-green-800 text-xs font-medium rounded-full">
                    Default
                  </span>
                )}
              </div>
              <p className="text-sm text-gray-600">{method.brand} • Expires {method.expiryMonth}/{method.expiryYear}</p>
              <p className="text-sm text-gray-600">{method.holderName}</p>
            </div>
          ))}
          
          {paymentMethods.length === 0 && (
            <div className="col-span-full text-center py-8">
              <CreditCard className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500">No payment methods added yet</p>
              <button
                onClick={() => setShowAddPaymentMethod(true)}
                className="mt-2 text-blue-600 hover:text-blue-800 font-medium"
              >
                Add your first payment method
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Search and Filters */}
      <div className="bg-white rounded-lg shadow p-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search invoices..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
            />
          </div>
          
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
          >
            <option value="all">All Status</option>
            <option value="paid">Paid</option>
            <option value="pending">Pending</option>
            <option value="overdue">Overdue</option>
          </select>
          
          <select
            value={dateRange}
            onChange={(e) => setDateRange(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
          >
            <option value="all">All Time</option>
            <option value="this_month">This Month</option>
            <option value="last_month">Last Month</option>
            <option value="last_3_months">Last 3 Months</option>
            <option value="this_year">This Year</option>
          </select>
          
          <button className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700">
            <Download className="h-4 w-4 mr-2" />
            Export
          </button>
        </div>
      </div>

      {/* Invoices List */}
      <div className="bg-white rounded-lg shadow">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900">
            Invoices & Bills ({filteredInvoices.length})
          </h3>
        </div>
        
        <div className="divide-y divide-gray-200">
          {filteredInvoices.length > 0 ? (
            filteredInvoices.map((invoice) => (
              <div key={invoice._id} className="p-6 hover:bg-gray-50">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <div className="flex-shrink-0">
                      {getStatusIcon(invoice.status)}
                    </div>
                    
                    <div className="flex-1">
                      <div className="flex items-center space-x-3">
                        <h4 className="text-lg font-medium text-gray-900">
                          Invoice #{invoice.invoiceNumber}
                        </h4>
                        <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(invoice.status)}`}>
                          {invoice.status.charAt(0).toUpperCase() + invoice.status.slice(1)}
                        </span>
                      </div>
                      
                      <div className="mt-1 flex items-center space-x-4 text-sm text-gray-600">
                        <div className="flex items-center">
                          <Calendar className="h-4 w-4 mr-1" />
                          {new Date(invoice.date).toLocaleDateString()}
                        </div>
                        <div className="flex items-center">
                          <DollarSign className="h-4 w-4 mr-1" />
                          ${invoice.amount}
                        </div>
                        {invoice.practitioner && (
                          <div className="flex items-center">
                            <Receipt className="h-4 w-4 mr-1" />
                            Dr. {invoice.practitioner.name}
                          </div>
                        )}
                        {invoice.dueDate && (
                          <div className="flex items-center">
                            <Clock className="h-4 w-4 mr-1" />
                            Due: {new Date(invoice.dueDate).toLocaleDateString()}
                          </div>
                        )}
                      </div>
                      
                      <div className="mt-2 text-sm text-gray-700">
                        {invoice.description}
                      </div>
                      
                      {invoice.services && invoice.services.length > 0 && (
                        <div className="mt-2">
                          <div className="flex flex-wrap gap-1">
                            {invoice.services.slice(0, 3).map((service, index) => (
                              <span
                                key={index}
                                className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800"
                              >
                                {service.name} - ${service.amount}
                              </span>
                            ))}
                            {invoice.services.length > 3 && (
                              <span className="text-xs text-gray-500">
                                +{invoice.services.length - 3} more services
                              </span>
                            )}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => setSelectedInvoice(invoice)}
                      className="p-2 text-gray-600 hover:bg-gray-100 rounded-full"
                      title="View Details"
                    >
                      <Eye className="h-5 w-5" />
                    </button>
                    
                    <button
                      onClick={() => downloadInvoice(invoice._id, invoice.invoiceNumber)}
                      className="p-2 text-blue-600 hover:bg-blue-100 rounded-full"
                      title="Download"
                    >
                      <Download className="h-5 w-5" />
                    </button>
                    
                    {invoice.status === 'pending' && (
                      <button
                        onClick={() => payInvoice(invoice._id, paymentMethods[0]?._id)}
                        className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700"
                        disabled={paymentMethods.length === 0}
                      >
                        Pay Now
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="p-12 text-center">
              <Receipt className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No invoices found</h3>
              <p className="text-gray-500">
                {searchTerm ? 'Try adjusting your search terms.' : 'Your invoices and bills will appear here.'}
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Invoice Detail Modal */}
      {selectedInvoice && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-2xl max-h-screen overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-semibold text-gray-900">Invoice Details</h3>
              <button
                onClick={() => setSelectedInvoice(null)}
                className="text-gray-400 hover:text-gray-600"
              >
                ×
              </button>
            </div>
            
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="text-lg font-bold text-gray-900">
                    Invoice #{selectedInvoice.invoiceNumber}
                  </h4>
                  <p className="text-gray-600">{selectedInvoice.description}</p>
                </div>
                <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(selectedInvoice.status)}`}>
                  {selectedInvoice.status.charAt(0).toUpperCase() + selectedInvoice.status.slice(1)}
                </span>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h5 className="font-medium text-gray-900 mb-2">Invoice Information</h5>
                  <div className="space-y-2 text-sm">
                    <p><span className="font-medium">Date:</span> {new Date(selectedInvoice.date).toLocaleDateString()}</p>
                    <p><span className="font-medium">Due Date:</span> {new Date(selectedInvoice.dueDate).toLocaleDateString()}</p>
                    <p><span className="font-medium">Amount:</span> ${selectedInvoice.amount}</p>
                    {selectedInvoice.practitioner && (
                      <p><span className="font-medium">Provider:</span> Dr. {selectedInvoice.practitioner.name}</p>
                    )}
                  </div>
                </div>
                
                <div>
                  <h5 className="font-medium text-gray-900 mb-2">Payment Information</h5>
                  <div className="space-y-2 text-sm">
                    <p><span className="font-medium">Status:</span> {selectedInvoice.status}</p>
                    {selectedInvoice.paidDate && (
                      <p><span className="font-medium">Paid Date:</span> {new Date(selectedInvoice.paidDate).toLocaleDateString()}</p>
                    )}
                    {selectedInvoice.paymentMethod && (
                      <p><span className="font-medium">Payment Method:</span> **** {selectedInvoice.paymentMethod.last4}</p>
                    )}
                  </div>
                </div>
              </div>
              
              {selectedInvoice.services && selectedInvoice.services.length > 0 && (
                <div>
                  <h5 className="font-medium text-gray-900 mb-2">Services</h5>
                  <div className="space-y-2">
                    {selectedInvoice.services.map((service, index) => (
                      <div key={index} className="flex justify-between items-center bg-gray-50 p-3 rounded-lg">
                        <div>
                          <p className="font-medium text-gray-900">{service.name}</p>
                          <p className="text-sm text-gray-600">{service.description}</p>
                        </div>
                        <div className="text-right">
                          <p className="font-medium text-gray-900">${service.amount}</p>
                          {service.quantity > 1 && (
                            <p className="text-sm text-gray-500">Qty: {service.quantity}</p>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
              
              <div className="flex space-x-3">
                <button
                  onClick={() => downloadInvoice(selectedInvoice._id, selectedInvoice.invoiceNumber)}
                  className="flex-1 flex items-center justify-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                >
                  <Download className="h-4 w-4 mr-2" />
                  Download Invoice
                </button>
                {selectedInvoice.status === 'pending' && (
                  <button
                    onClick={() => payInvoice(selectedInvoice._id, paymentMethods[0]?._id)}
                    className="flex-1 flex items-center justify-center px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700"
                    disabled={paymentMethods.length === 0}
                  >
                    <CreditCard className="h-4 w-4 mr-2" />
                    Pay Now
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Add Payment Method Modal */}
      {showAddPaymentMethod && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-semibold text-gray-900">Add Payment Method</h3>
              <button
                onClick={() => setShowAddPaymentMethod(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                ×
              </button>
            </div>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Card Number</label>
                <input
                  type="text"
                  value={newPaymentMethod.cardNumber}
                  onChange={(e) => setNewPaymentMethod(prev => ({ ...prev, cardNumber: e.target.value }))}
                  placeholder="1234 5678 9012 3456"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Cardholder Name</label>
                <input
                  type="text"
                  value={newPaymentMethod.holderName}
                  onChange={(e) => setNewPaymentMethod(prev => ({ ...prev, holderName: e.target.value }))}
                  placeholder="John Doe"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                />
              </div>
              
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Month</label>
                  <select
                    value={newPaymentMethod.expiryMonth}
                    onChange={(e) => setNewPaymentMethod(prev => ({ ...prev, expiryMonth: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                  >
                    <option value="">MM</option>
                    {Array.from({ length: 12 }, (_, i) => (
                      <option key={i + 1} value={String(i + 1).padStart(2, '0')}>
                        {String(i + 1).padStart(2, '0')}
                      </option>
                    ))}
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Year</label>
                  <select
                    value={newPaymentMethod.expiryYear}
                    onChange={(e) => setNewPaymentMethod(prev => ({ ...prev, expiryYear: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                  >
                    <option value="">YY</option>
                    {Array.from({ length: 10 }, (_, i) => (
                      <option key={i} value={String(new Date().getFullYear() + i).slice(-2)}>
                        {String(new Date().getFullYear() + i).slice(-2)}
                      </option>
                    ))}
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">CVV</label>
                  <input
                    type="text"
                    value={newPaymentMethod.cvv}
                    onChange={(e) => setNewPaymentMethod(prev => ({ ...prev, cvv: e.target.value }))}
                    placeholder="123"
                    maxLength={4}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                  />
                </div>
              </div>
              
              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="isDefault"
                  checked={newPaymentMethod.isDefault}
                  onChange={(e) => setNewPaymentMethod(prev => ({ ...prev, isDefault: e.target.checked }))}
                  className="h-4 w-4 text-green-600 focus:ring-green-500 border-gray-300 rounded"
                />
                <label htmlFor="isDefault" className="ml-2 block text-sm text-gray-900">
                  Set as default payment method
                </label>
              </div>
            </div>
            
            <div className="flex items-center justify-end space-x-3 mt-6">
              <button
                onClick={() => setShowAddPaymentMethod(false)}
                className="px-4 py-2 bg-gray-300 text-gray-700 rounded-md hover:bg-gray-400"
              >
                Cancel
              </button>
              <button
                onClick={addPaymentMethod}
                disabled={!newPaymentMethod.cardNumber || !newPaymentMethod.holderName}
                className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Add Payment Method
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PatientPaymentBilling;

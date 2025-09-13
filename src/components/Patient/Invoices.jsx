import React, { useState, useEffect } from 'react';
import { 
  FileText, 
  Download, 
  Eye, 
  Calendar, 
  User, 
  CreditCard,
  AlertCircle,
  CheckCircle,
  Clock,
  Search,
  Filter,
  DollarSign,
  Receipt,
  X
} from 'lucide-react';

const Invoices = () => {
  const [invoices, setInvoices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedInvoice, setSelectedInvoice] = useState(null);
  const [showInvoiceModal, setShowInvoiceModal] = useState(false);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [filters, setFilters] = useState({
    status: 'all',
    dateRange: 'all',
    practitioner: 'all'
  });
  const [searchTerm, setSearchTerm] = useState('');

  const [paymentForm, setPaymentForm] = useState({
    paymentMethod: 'card',
    cardNumber: '',
    expiryDate: '',
    cvv: '',
    cardholderName: ''
  });

  useEffect(() => {
    fetchInvoices();
  }, [filters, searchTerm]);

  const fetchInvoices = async () => {
    try {
      const token = localStorage.getItem('token');
      const queryParams = new URLSearchParams();
      
      if (filters.status !== 'all') queryParams.append('status', filters.status);
      if (filters.practitioner !== 'all') queryParams.append('practitionerId', filters.practitioner);
      if (searchTerm) queryParams.append('search', searchTerm);
      
      const response = await fetch(`/api/patient/invoices?${queryParams}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await response.json();
      setInvoices(data.invoices || []);
    } catch (error) {
      console.error('Error fetching invoices:', error);
    } finally {
      setLoading(false);
    }
  };

  const handlePayment = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`/api/patient/invoices/${selectedInvoice._id}/pay`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          paymentMethod: paymentForm.paymentMethod,
          paymentDetails: paymentForm
        })
      });

      if (response.ok) {
        setShowPaymentModal(false);
        setPaymentForm({
          paymentMethod: 'card',
          cardNumber: '',
          expiryDate: '',
          cvv: '',
          cardholderName: ''
        });
        fetchInvoices();
        alert('Payment successful!');
      }
    } catch (error) {
      console.error('Error processing payment:', error);
      alert('Payment failed. Please try again.');
    }
  };

  const downloadInvoice = async (invoiceId) => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`/api/patient/invoices/${invoiceId}/download`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      
      if (response.ok) {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `invoice-${invoiceId}.pdf`;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
      }
    } catch (error) {
      console.error('Error downloading invoice:', error);
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'paid':
        return <CheckCircle className="h-5 w-5 text-green-500" />;
      case 'pending':
        return <Clock className="h-5 w-5 text-yellow-500" />;
      case 'overdue':
        return <AlertCircle className="h-5 w-5 text-red-500" />;
      case 'cancelled':
        return <X className="h-5 w-5 text-gray-500" />;
      default:
        return <FileText className="h-5 w-5 text-gray-500" />;
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
      case 'cancelled':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const InvoiceCard = ({ invoice }) => (
    <div className="bg-white rounded-lg border border-gray-200 p-6 hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center space-x-3">
          <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
            <Receipt className="h-6 w-6 text-blue-600" />
          </div>
          <div>
            <h3 className="font-semibold text-gray-900">Invoice #{invoice.invoiceNumber}</h3>
            <p className="text-sm text-gray-600">
              Dr. {invoice.practitionerId?.firstName} {invoice.practitionerId?.lastName}
            </p>
          </div>
        </div>
        <div className="flex items-center space-x-2">
          {getStatusIcon(invoice.status)}
          <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(invoice.status)}`}>
            {invoice.status}
          </span>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4 mb-4">
        <div className="flex items-center text-sm text-gray-600">
          <Calendar className="h-4 w-4 mr-2" />
          {new Date(invoice.issueDate).toLocaleDateString()}
        </div>
        <div className="flex items-center text-sm text-gray-600">
          <Clock className="h-4 w-4 mr-2" />
          Due: {new Date(invoice.dueDate).toLocaleDateString()}
        </div>
        <div className="flex items-center text-sm text-gray-600">
          <DollarSign className="h-4 w-4 mr-2" />
          ₹{invoice.totalAmount}
        </div>
        <div className="flex items-center text-sm text-gray-600">
          <FileText className="h-4 w-4 mr-2" />
          {invoice.items?.length || 0} items
        </div>
      </div>

      {invoice.description && (
        <p className="text-sm text-gray-700 mb-4 line-clamp-2">{invoice.description}</p>
      )}

      <div className="flex items-center justify-between pt-4 border-t border-gray-100">
        <div className="text-sm text-gray-500">
          {invoice.status === 'overdue' && (
            <span className="text-red-600 font-medium">
              Overdue by {Math.ceil((new Date() - new Date(invoice.dueDate)) / (1000 * 60 * 60 * 24))} days
            </span>
          )}
        </div>
        <div className="flex items-center space-x-2">
          <button
            onClick={() => {
              setSelectedInvoice(invoice);
              setShowInvoiceModal(true);
            }}
            className="flex items-center text-blue-600 hover:text-blue-700 text-sm font-medium"
          >
            <Eye className="h-4 w-4 mr-1" />
            View
          </button>
          <button
            onClick={() => downloadInvoice(invoice._id)}
            className="flex items-center text-green-600 hover:text-green-700 text-sm font-medium"
          >
            <Download className="h-4 w-4 mr-1" />
            Download
          </button>
          {invoice.status === 'pending' && (
            <button
              onClick={() => {
                setSelectedInvoice(invoice);
                setShowPaymentModal(true);
              }}
              className="flex items-center px-3 py-1 bg-green-600 text-white rounded-md hover:bg-green-700 text-sm"
            >
              <CreditCard className="h-4 w-4 mr-1" />
              Pay Now
            </button>
          )}
        </div>
      </div>
    </div>
  );

  const InvoiceModal = () => (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 overflow-y-auto">
      <div className="bg-white rounded-lg p-6 w-full max-w-4xl max-h-screen overflow-y-auto m-4">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-semibold text-gray-900">Invoice Details</h2>
          <button
            onClick={() => setShowInvoiceModal(false)}
            className="text-gray-400 hover:text-gray-600"
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        {selectedInvoice && (
          <div className="space-y-6">
            {/* Invoice Header */}
            <div className="bg-gray-50 rounded-lg p-6">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h3 className="text-2xl font-bold text-gray-900">Invoice #{selectedInvoice.invoiceNumber}</h3>
                  <p className="text-gray-600">
                    Dr. {selectedInvoice.practitionerId?.firstName} {selectedInvoice.practitionerId?.lastName}
                  </p>
                </div>
                <div className="text-right">
                  <div className="flex items-center space-x-2 mb-2">
                    {getStatusIcon(selectedInvoice.status)}
                    <span className={`px-3 py-1 text-sm font-medium rounded-full ${getStatusColor(selectedInvoice.status)}`}>
                      {selectedInvoice.status}
                    </span>
                  </div>
                  <p className="text-2xl font-bold text-gray-900">₹{selectedInvoice.totalAmount}</p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-6">
                <div>
                  <h4 className="font-medium text-gray-900 mb-2">Issue Date</h4>
                  <p className="text-gray-700">{new Date(selectedInvoice.issueDate).toLocaleDateString()}</p>
                </div>
                <div>
                  <h4 className="font-medium text-gray-900 mb-2">Due Date</h4>
                  <p className="text-gray-700">{new Date(selectedInvoice.dueDate).toLocaleDateString()}</p>
                </div>
              </div>
            </div>

            {/* Invoice Items */}
            <div>
              <h4 className="font-medium text-gray-900 mb-4">Invoice Items</h4>
              <div className="overflow-x-auto">
                <table className="w-full border border-gray-200 rounded-lg">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">Description</th>
                      <th className="px-4 py-3 text-center text-sm font-medium text-gray-700">Quantity</th>
                      <th className="px-4 py-3 text-right text-sm font-medium text-gray-700">Unit Price</th>
                      <th className="px-4 py-3 text-right text-sm font-medium text-gray-700">Total</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {selectedInvoice.items?.map((item, index) => (
                      <tr key={index}>
                        <td className="px-4 py-3 text-sm text-gray-900">{item.description}</td>
                        <td className="px-4 py-3 text-sm text-gray-700 text-center">{item.quantity}</td>
                        <td className="px-4 py-3 text-sm text-gray-700 text-right">₹{item.unitPrice}</td>
                        <td className="px-4 py-3 text-sm font-medium text-gray-900 text-right">
                          ₹{item.quantity * item.unitPrice}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Invoice Summary */}
            <div className="bg-gray-50 rounded-lg p-4">
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Subtotal:</span>
                  <span className="text-gray-900">₹{selectedInvoice.subtotal || selectedInvoice.totalAmount}</span>
                </div>
                {selectedInvoice.tax && (
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Tax:</span>
                    <span className="text-gray-900">₹{selectedInvoice.tax}</span>
                  </div>
                )}
                {selectedInvoice.discount && (
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Discount:</span>
                    <span className="text-green-600">-₹{selectedInvoice.discount}</span>
                  </div>
                )}
                <div className="border-t border-gray-200 pt-2">
                  <div className="flex justify-between text-lg font-semibold">
                    <span className="text-gray-900">Total:</span>
                    <span className="text-gray-900">₹{selectedInvoice.totalAmount}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Payment Information */}
            {selectedInvoice.paymentDetails && (
              <div className="bg-green-50 rounded-lg p-4 border-l-4 border-green-400">
                <h4 className="font-medium text-green-900 mb-2">Payment Information</h4>
                <div className="text-sm text-green-800">
                  <p>Paid on: {new Date(selectedInvoice.paymentDetails.paidAt).toLocaleDateString()}</p>
                  <p>Payment Method: {selectedInvoice.paymentDetails.method}</p>
                  {selectedInvoice.paymentDetails.transactionId && (
                    <p>Transaction ID: {selectedInvoice.paymentDetails.transactionId}</p>
                  )}
                </div>
              </div>
            )}

            {/* Notes */}
            {selectedInvoice.notes && (
              <div>
                <h4 className="font-medium text-gray-900 mb-2">Notes</h4>
                <p className="text-gray-700 bg-gray-50 p-4 rounded-lg">{selectedInvoice.notes}</p>
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex justify-end space-x-3 pt-4 border-t border-gray-200">
              <button
                onClick={() => downloadInvoice(selectedInvoice._id)}
                className="flex items-center px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50"
              >
                <Download className="h-4 w-4 mr-2" />
                Download PDF
              </button>
              {selectedInvoice.status === 'pending' && (
                <button
                  onClick={() => {
                    setShowInvoiceModal(false);
                    setShowPaymentModal(true);
                  }}
                  className="flex items-center px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700"
                >
                  <CreditCard className="h-4 w-4 mr-2" />
                  Pay Now
                </button>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );

  const PaymentModal = () => (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4">
        <h2 className="text-xl font-semibold mb-4">Payment Details</h2>
        
        {selectedInvoice && (
          <div className="mb-4 p-3 bg-gray-50 rounded-lg">
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">Invoice #{selectedInvoice.invoiceNumber}</span>
              <span className="text-lg font-bold text-gray-900">₹{selectedInvoice.totalAmount}</span>
            </div>
          </div>
        )}
        
        <form onSubmit={handlePayment} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Payment Method
            </label>
            <select
              value={paymentForm.paymentMethod}
              onChange={(e) => setPaymentForm({...paymentForm, paymentMethod: e.target.value})}
              className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-500"
            >
              <option value="card">Credit/Debit Card</option>
              <option value="upi">UPI</option>
              <option value="netbanking">Net Banking</option>
            </select>
          </div>

          {paymentForm.paymentMethod === 'card' && (
            <>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Cardholder Name
                </label>
                <input
                  type="text"
                  value={paymentForm.cardholderName}
                  onChange={(e) => setPaymentForm({...paymentForm, cardholderName: e.target.value})}
                  className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-500"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Card Number
                </label>
                <input
                  type="text"
                  value={paymentForm.cardNumber}
                  onChange={(e) => setPaymentForm({...paymentForm, cardNumber: e.target.value})}
                  className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-500"
                  placeholder="1234 5678 9012 3456"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Expiry Date
                  </label>
                  <input
                    type="text"
                    value={paymentForm.expiryDate}
                    onChange={(e) => setPaymentForm({...paymentForm, expiryDate: e.target.value})}
                    className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-500"
                    placeholder="MM/YY"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    CVV
                  </label>
                  <input
                    type="text"
                    value={paymentForm.cvv}
                    onChange={(e) => setPaymentForm({...paymentForm, cvv: e.target.value})}
                    className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-500"
                    placeholder="123"
                    required
                  />
                </div>
              </div>
            </>
          )}

          <div className="flex space-x-3 pt-4">
            <button
              type="button"
              onClick={() => setShowPaymentModal(false)}
              className="flex-1 px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex-1 px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700"
            >
              Pay ₹{selectedInvoice?.totalAmount}
            </button>
          </div>
        </form>
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
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Invoices & Billing</h1>
        <p className="text-gray-600">Manage your payments and billing history</p>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Outstanding</p>
              <p className="text-2xl font-bold text-red-600">
                ₹{invoices.filter(inv => inv.status === 'pending' || inv.status === 'overdue')
                  .reduce((sum, inv) => sum + inv.totalAmount, 0)}
              </p>
            </div>
            <AlertCircle className="h-8 w-8 text-red-500" />
          </div>
        </div>

        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Paid This Month</p>
              <p className="text-2xl font-bold text-green-600">
                ₹{invoices.filter(inv => inv.status === 'paid' && 
                  new Date(inv.paymentDetails?.paidAt).getMonth() === new Date().getMonth())
                  .reduce((sum, inv) => sum + inv.totalAmount, 0)}
              </p>
            </div>
            <CheckCircle className="h-8 w-8 text-green-500" />
          </div>
        </div>

        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Pending Invoices</p>
              <p className="text-2xl font-bold text-yellow-600">
                {invoices.filter(inv => inv.status === 'pending').length}
              </p>
            </div>
            <Clock className="h-8 w-8 text-yellow-500" />
          </div>
        </div>

        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Overdue</p>
              <p className="text-2xl font-bold text-red-600">
                {invoices.filter(inv => inv.status === 'overdue').length}
              </p>
            </div>
            <AlertCircle className="h-8 w-8 text-red-500" />
          </div>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="bg-white rounded-lg border border-gray-200 p-4">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1">
            <div className="relative">
              <Search className="h-5 w-5 text-gray-400 absolute left-3 top-1/2 transform -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search invoices..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
              />
            </div>
          </div>
          
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <Filter className="h-5 w-5 text-gray-400" />
              <span className="text-sm font-medium text-gray-700">Filters:</span>
            </div>
            
            <select
              value={filters.status}
              onChange={(e) => setFilters({...filters, status: e.target.value})}
              className="border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
            >
              <option value="all">All Status</option>
              <option value="pending">Pending</option>
              <option value="paid">Paid</option>
              <option value="overdue">Overdue</option>
              <option value="cancelled">Cancelled</option>
            </select>

            <select
              value={filters.dateRange}
              onChange={(e) => setFilters({...filters, dateRange: e.target.value})}
              className="border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
            >
              <option value="all">All Dates</option>
              <option value="this_month">This Month</option>
              <option value="last_month">Last Month</option>
              <option value="last_3_months">Last 3 Months</option>
              <option value="this_year">This Year</option>
            </select>
          </div>
        </div>
      </div>

      {/* Invoices List */}
      <div className="space-y-4">
        {invoices.length > 0 ? (
          invoices.map(invoice => (
            <InvoiceCard key={invoice._id} invoice={invoice} />
          ))
        ) : (
          <div className="bg-white rounded-lg border border-gray-200 p-12 text-center">
            <Receipt className="h-16 w-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No invoices found</h3>
            <p className="text-gray-600">Your invoices will appear here as they are generated</p>
          </div>
        )}
      </div>

      {/* Modals */}
      {showInvoiceModal && <InvoiceModal />}
      {showPaymentModal && <PaymentModal />}
    </div>
  );
};

export default Invoices;

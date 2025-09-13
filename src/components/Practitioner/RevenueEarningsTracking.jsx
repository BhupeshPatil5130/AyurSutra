import React, { useState, useEffect } from 'react';
import { 
  DollarSign, TrendingUp, Calendar, BarChart3, PieChart, Download,
  RefreshCw, Filter, Eye, CreditCard, Wallet, ArrowUpRight,
  ArrowDownRight, Users, Clock, CheckCircle, AlertCircle
} from 'lucide-react';
import api from '../../utils/api';
import toast from 'react-hot-toast';

const RevenueEarningsTracking = () => {
  const [revenueData, setRevenueData] = useState({});
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [timeRange, setTimeRange] = useState('30d');
  const [paymentFilter, setPaymentFilter] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [transactionsPerPage] = useState(10);

  useEffect(() => {
    fetchRevenueData();
    fetchTransactions();
  }, [timeRange, paymentFilter]);

  const fetchRevenueData = async () => {
    try {
      setLoading(true);
      const response = await api.get(`/practitioner/revenue/stats?timeRange=${timeRange}`);
      setRevenueData(response.data);
    } catch (error) {
      console.error('Error fetching revenue data:', error);
      toast.error('Error loading revenue data');
    } finally {
      setLoading(false);
    }
  };

  const fetchTransactions = async () => {
    try {
      const params = new URLSearchParams();
      params.append('timeRange', timeRange);
      if (paymentFilter !== 'all') params.append('status', paymentFilter);

      const response = await api.get(`/practitioner/revenue/transactions?${params}`);
      setTransactions(response.data);
    } catch (error) {
      console.error('Error fetching transactions:', error);
      toast.error('Error loading transactions');
    }
  };

  const getPercentageChange = (current, previous) => {
    if (!previous || previous === 0) return 0;
    return ((current - previous) / previous * 100).toFixed(1);
  };

  const getChangeIcon = (change) => {
    if (change > 0) return <ArrowUpRight className="h-4 w-4 text-green-500" />;
    if (change < 0) return <ArrowDownRight className="h-4 w-4 text-red-500" />;
    return null;
  };

  const getPaymentStatusColor = (status) => {
    switch (status) {
      case 'paid': return 'bg-green-100 text-green-700';
      case 'pending': return 'bg-yellow-100 text-yellow-700';
      case 'failed': return 'bg-red-100 text-red-700';
      case 'refunded': return 'bg-gray-100 text-gray-700';
      default: return 'bg-gray-100 text-gray-700';
    }
  };

  const indexOfLastTransaction = currentPage * transactionsPerPage;
  const indexOfFirstTransaction = indexOfLastTransaction - transactionsPerPage;
  const currentTransactions = transactions.slice(indexOfFirstTransaction, indexOfLastTransaction);
  const totalPages = Math.ceil(transactions.length / transactionsPerPage);

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
          <h1 className="text-3xl font-bold text-gray-900">Revenue & Earnings</h1>
          <p className="text-gray-600">Track your financial performance and earnings</p>
        </div>
        <div className="flex items-center space-x-3">
          <select
            value={timeRange}
            onChange={(e) => setTimeRange(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
          >
            <option value="7d">Last 7 Days</option>
            <option value="30d">Last 30 Days</option>
            <option value="90d">Last 90 Days</option>
            <option value="1y">Last Year</option>
          </select>
          <button
            onClick={fetchRevenueData}
            className="flex items-center px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700"
          >
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </button>
          <button className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700">
            <Download className="h-4 w-4 mr-2" />
            Export
          </button>
        </div>
      </div>

      {/* Revenue Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-gradient-to-r from-green-500 to-green-600 rounded-lg p-6 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-green-100">Total Revenue</p>
              <p className="text-3xl font-bold">₹{(revenueData.totalRevenue?.current || 0).toLocaleString()}</p>
              <div className="flex items-center mt-2">
                {getChangeIcon(getPercentageChange(revenueData.totalRevenue?.current, revenueData.totalRevenue?.previous))}
                <span className="text-sm ml-1">
                  {Math.abs(getPercentageChange(revenueData.totalRevenue?.current, revenueData.totalRevenue?.previous))}%
                </span>
              </div>
            </div>
            <DollarSign className="h-12 w-12 text-green-200" />
          </div>
        </div>

        <div className="bg-gradient-to-r from-blue-500 to-blue-600 rounded-lg p-6 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-blue-100">Avg per Session</p>
              <p className="text-3xl font-bold">₹{(revenueData.averagePerSession?.current || 0).toLocaleString()}</p>
              <div className="flex items-center mt-2">
                {getChangeIcon(getPercentageChange(revenueData.averagePerSession?.current, revenueData.averagePerSession?.previous))}
                <span className="text-sm ml-1">
                  {Math.abs(getPercentageChange(revenueData.averagePerSession?.current, revenueData.averagePerSession?.previous))}%
                </span>
              </div>
            </div>
            <Wallet className="h-12 w-12 text-blue-200" />
          </div>
        </div>

        <div className="bg-gradient-to-r from-purple-500 to-purple-600 rounded-lg p-6 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-purple-100">Total Sessions</p>
              <p className="text-3xl font-bold">{revenueData.totalSessions?.current || 0}</p>
              <div className="flex items-center mt-2">
                {getChangeIcon(getPercentageChange(revenueData.totalSessions?.current, revenueData.totalSessions?.previous))}
                <span className="text-sm ml-1">
                  {Math.abs(getPercentageChange(revenueData.totalSessions?.current, revenueData.totalSessions?.previous))}%
                </span>
              </div>
            </div>
            <Users className="h-12 w-12 text-purple-200" />
          </div>
        </div>

        <div className="bg-gradient-to-r from-yellow-500 to-yellow-600 rounded-lg p-6 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-yellow-100">Payment Success</p>
              <p className="text-3xl font-bold">{(revenueData.paymentSuccessRate || 0).toFixed(1)}%</p>
              <div className="flex items-center mt-2">
                <CheckCircle className="h-4 w-4 text-yellow-200 mr-1" />
                <span className="text-sm">
                  {revenueData.successfulPayments || 0} of {revenueData.totalPayments || 0}
                </span>
              </div>
            </div>
            <CreditCard className="h-12 w-12 text-yellow-200" />
          </div>
        </div>
      </div>

      {/* Revenue Breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Revenue by Service Type</h3>
          <div className="space-y-4">
            {revenueData.revenueByService?.map((service, index) => {
              const percentage = revenueData.totalRevenue?.current 
                ? (service.revenue / revenueData.totalRevenue.current * 100).toFixed(1)
                : 0;
              
              return (
                <div key={index} className="flex items-center justify-between">
                  <div className="flex items-center">
                    <div className={`w-3 h-3 rounded-full mr-3 ${
                      index === 0 ? 'bg-green-500' :
                      index === 1 ? 'bg-blue-500' :
                      index === 2 ? 'bg-purple-500' :
                      index === 3 ? 'bg-yellow-500' : 'bg-gray-500'
                    }`}></div>
                    <span className="text-sm font-medium text-gray-900">{service.type}</span>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-medium text-gray-900">₹{service.revenue.toLocaleString()}</p>
                    <p className="text-xs text-gray-500">{percentage}%</p>
                  </div>
                </div>
              );
            }) || (
              <p className="text-gray-500 text-center py-4">No service data available</p>
            )}
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Monthly Revenue Trend</h3>
          <div className="h-64 flex items-center justify-center bg-gray-50 rounded-md">
            <div className="text-center">
              <BarChart3 className="h-16 w-16 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500">Chart visualization</p>
              <p className="text-sm text-gray-400">Integration with charting library needed</p>
            </div>
          </div>
        </div>
      </div>

      {/* Payment Methods */}
      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Payment Methods Distribution</h3>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {revenueData.paymentMethods?.map((method, index) => (
            <div key={index} className="text-center p-4 bg-gray-50 rounded-lg">
              <div className="text-2xl font-bold text-gray-900">₹{method.amount.toLocaleString()}</div>
              <div className="text-sm text-gray-600">{method.method}</div>
              <div className="text-xs text-gray-500 mt-1">
                {method.count} transactions ({((method.amount / revenueData.totalRevenue?.current) * 100 || 0).toFixed(1)}%)
              </div>
            </div>
          )) || (
            <div className="col-span-4 text-center py-8">
              <p className="text-gray-500">No payment method data available</p>
            </div>
          )}
        </div>
      </div>

      {/* Recent Transactions */}
      <div className="bg-white rounded-lg shadow">
        <div className="px-6 py-4 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold text-gray-900">Recent Transactions</h3>
            <div className="flex items-center space-x-3">
              <select
                value={paymentFilter}
                onChange={(e) => setPaymentFilter(e.target.value)}
                className="px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
              >
                <option value="all">All Status</option>
                <option value="paid">Paid</option>
                <option value="pending">Pending</option>
                <option value="failed">Failed</option>
                <option value="refunded">Refunded</option>
              </select>
            </div>
          </div>
        </div>
        
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Patient
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Service
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Amount
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Payment Method
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Date
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {currentTransactions.length > 0 ? (
                currentTransactions.map((transaction) => (
                  <tr key={transaction._id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="w-8 h-8 bg-gradient-to-r from-blue-400 to-purple-500 rounded-full flex items-center justify-center text-white text-sm font-semibold">
                          {transaction.patientId?.firstName?.charAt(0)}{transaction.patientId?.lastName?.charAt(0)}
                        </div>
                        <div className="ml-3">
                          <div className="text-sm font-medium text-gray-900">
                            {transaction.patientId?.firstName} {transaction.patientId?.lastName}
                          </div>
                          <div className="text-sm text-gray-500">{transaction.patientId?.email}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{transaction.serviceType}</div>
                      <div className="text-sm text-gray-500">{transaction.sessionType}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">₹{transaction.amount}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{transaction.paymentMethod}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 py-1 text-xs font-semibold rounded-full ${getPaymentStatusColor(transaction.status)}`}>
                        {transaction.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {new Date(transaction.createdAt).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <button
                        className="text-blue-600 hover:text-blue-900"
                        title="View Details"
                      >
                        <Eye className="h-4 w-4" />
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="7" className="px-6 py-12 text-center">
                    <DollarSign className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-500">No transactions found</p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="px-6 py-4 border-t border-gray-200">
            <div className="flex items-center justify-between">
              <div className="text-sm text-gray-700">
                Showing {indexOfFirstTransaction + 1} to {Math.min(indexOfLastTransaction, transactions.length)} of {transactions.length} results
              </div>
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                  disabled={currentPage === 1}
                  className="px-3 py-2 text-sm border border-gray-300 rounded-md disabled:opacity-50 hover:bg-gray-50"
                >
                  Previous
                </button>
                <span className="px-3 py-2 text-sm">
                  Page {currentPage} of {totalPages}
                </span>
                <button
                  onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                  disabled={currentPage === totalPages}
                  className="px-3 py-2 text-sm border border-gray-300 rounded-md disabled:opacity-50 hover:bg-gray-50"
                >
                  Next
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default RevenueEarningsTracking;

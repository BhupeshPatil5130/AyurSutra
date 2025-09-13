import React, { useState, useEffect } from 'react';
import { 
  BarChart3, TrendingUp, Download, Filter, Calendar, Users,
  DollarSign, Clock, Star, Activity, FileText, RefreshCw,
  ChevronDown, Eye, Settings, Share2, Printer
} from 'lucide-react';
import api from '../../utils/api';
import toast from 'react-hot-toast';

const ReportsAnalytics = () => {
  const [reports, setReports] = useState([]);
  const [analytics, setAnalytics] = useState({});
  const [loading, setLoading] = useState(true);
  const [selectedPeriod, setSelectedPeriod] = useState('month');
  const [selectedReport, setSelectedReport] = useState('overview');
  const [dateRange, setDateRange] = useState({
    start: new Date(new Date().setMonth(new Date().getMonth() - 1)).toISOString().split('T')[0],
    end: new Date().toISOString().split('T')[0]
  });

  const reportTypes = [
    { id: 'overview', name: 'Practice Overview', icon: BarChart3 },
    { id: 'patients', name: 'Patient Analytics', icon: Users },
    { id: 'revenue', name: 'Revenue Report', icon: DollarSign },
    { id: 'appointments', name: 'Appointment Analytics', icon: Clock },
    { id: 'treatments', name: 'Treatment Report', icon: Activity },
    { id: 'feedback', name: 'Feedback Analysis', icon: Star }
  ];

  const periods = [
    { value: 'week', label: 'Last 7 Days' },
    { value: 'month', label: 'Last 30 Days' },
    { value: 'quarter', label: 'Last 3 Months' },
    { value: 'year', label: 'Last 12 Months' },
    { value: 'custom', label: 'Custom Range' }
  ];

  useEffect(() => {
    fetchReports();
    fetchAnalytics();
  }, [selectedPeriod, selectedReport, dateRange]);

  const fetchReports = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams({
        type: selectedReport,
        period: selectedPeriod,
        startDate: dateRange.start,
        endDate: dateRange.end
      });

      const response = await api.get(`/practitioner/reports?${params}`);
      setReports(response.data);
    } catch (error) {
      console.error('Error fetching reports:', error);
      toast.error('Error loading reports');
    } finally {
      setLoading(false);
    }
  };

  const fetchAnalytics = async () => {
    try {
      const params = new URLSearchParams({
        period: selectedPeriod,
        startDate: dateRange.start,
        endDate: dateRange.end
      });

      const response = await api.get(`/practitioner/analytics?${params}`);
      setAnalytics(response.data);
    } catch (error) {
      console.error('Error fetching analytics:', error);
    }
  };

  const generateReport = async (reportType) => {
    try {
      const response = await api.post('/practitioner/reports/generate', {
        type: reportType,
        period: selectedPeriod,
        dateRange,
        format: 'pdf'
      });
      
      // Create download link
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `${reportType}-report-${new Date().toISOString().split('T')[0]}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      
      toast.success('Report generated successfully');
    } catch (error) {
      console.error('Error generating report:', error);
      toast.error('Error generating report');
    }
  };

  const exportData = async (format) => {
    try {
      const response = await api.get(`/practitioner/reports/export?format=${format}&type=${selectedReport}&period=${selectedPeriod}`);
      
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `analytics-${selectedReport}-${new Date().toISOString().split('T')[0]}.${format}`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      
      toast.success(`Data exported as ${format.toUpperCase()}`);
    } catch (error) {
      console.error('Error exporting data:', error);
      toast.error('Error exporting data');
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
          <h1 className="text-3xl font-bold text-gray-900">Reports & Analytics</h1>
          <p className="text-gray-600">Comprehensive insights into your practice performance</p>
        </div>
        <div className="flex items-center space-x-3">
          <button
            onClick={fetchReports}
            className="flex items-center px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700"
          >
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </button>
          <button
            onClick={() => generateReport(selectedReport)}
            className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
          >
            <FileText className="h-4 w-4 mr-2" />
            Generate Report
          </button>
          <div className="relative">
            <select
              onChange={(e) => exportData(e.target.value)}
              className="appearance-none bg-green-600 text-white px-4 py-2 pr-8 rounded-md hover:bg-green-700 focus:outline-none"
              defaultValue=""
            >
              <option value="" disabled>Export</option>
              <option value="csv">Export CSV</option>
              <option value="xlsx">Export Excel</option>
              <option value="pdf">Export PDF</option>
            </select>
            <Download className="absolute right-2 top-1/2 transform -translate-y-1/2 h-4 w-4 text-white pointer-events-none" />
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg shadow p-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Report Type</label>
            <select
              value={selectedReport}
              onChange={(e) => setSelectedReport(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
            >
              {reportTypes.map((type) => (
                <option key={type.id} value={type.id}>{type.name}</option>
              ))}
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Time Period</label>
            <select
              value={selectedPeriod}
              onChange={(e) => setSelectedPeriod(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
            >
              {periods.map((period) => (
                <option key={period.value} value={period.value}>{period.label}</option>
              ))}
            </select>
          </div>
          
          {selectedPeriod === 'custom' && (
            <>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Start Date</label>
                <input
                  type="date"
                  value={dateRange.start}
                  onChange={(e) => setDateRange(prev => ({ ...prev, start: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">End Date</label>
                <input
                  type="date"
                  value={dateRange.end}
                  onChange={(e) => setDateRange(prev => ({ ...prev, end: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                />
              </div>
            </>
          )}
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="p-2 bg-blue-100 rounded-lg">
              <Users className="h-6 w-6 text-blue-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Total Patients</p>
              <p className="text-2xl font-bold text-gray-900">{analytics.totalPatients || 0}</p>
              <p className="text-sm text-green-600">+{analytics.newPatients || 0} new</p>
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="p-2 bg-green-100 rounded-lg">
              <DollarSign className="h-6 w-6 text-green-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Total Revenue</p>
              <p className="text-2xl font-bold text-gray-900">₹{analytics.totalRevenue?.toLocaleString() || 0}</p>
              <p className="text-sm text-green-600">+{analytics.revenueGrowth || 0}%</p>
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="p-2 bg-purple-100 rounded-lg">
              <Clock className="h-6 w-6 text-purple-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Appointments</p>
              <p className="text-2xl font-bold text-gray-900">{analytics.totalAppointments || 0}</p>
              <p className="text-sm text-blue-600">{analytics.completionRate || 0}% completed</p>
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="p-2 bg-yellow-100 rounded-lg">
              <Star className="h-6 w-6 text-yellow-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Avg Rating</p>
              <p className="text-2xl font-bold text-gray-900">{analytics.averageRating || 0}</p>
              <p className="text-sm text-gray-600">{analytics.totalReviews || 0} reviews</p>
            </div>
          </div>
        </div>
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Revenue Trend Chart */}
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">Revenue Trend</h3>
            <TrendingUp className="h-5 w-5 text-green-600" />
          </div>
          <div className="h-64 flex items-center justify-center border-2 border-dashed border-gray-300 rounded-lg">
            <div className="text-center">
              <BarChart3 className="h-12 w-12 text-gray-400 mx-auto mb-2" />
              <p className="text-gray-500">Revenue trend chart placeholder</p>
              <p className="text-sm text-gray-400">Integration with charting library needed</p>
            </div>
          </div>
        </div>

        {/* Patient Growth Chart */}
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">Patient Growth</h3>
            <Users className="h-5 w-5 text-blue-600" />
          </div>
          <div className="h-64 flex items-center justify-center border-2 border-dashed border-gray-300 rounded-lg">
            <div className="text-center">
              <TrendingUp className="h-12 w-12 text-gray-400 mx-auto mb-2" />
              <p className="text-gray-500">Patient growth chart placeholder</p>
              <p className="text-sm text-gray-400">Integration with charting library needed</p>
            </div>
          </div>
        </div>
      </div>

      {/* Detailed Reports */}
      <div className="bg-white rounded-lg shadow">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900">Detailed Analytics</h3>
        </div>
        
        <div className="p-6">
          {selectedReport === 'overview' && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h4 className="font-medium text-gray-900 mb-3">Practice Performance</h4>
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Patient Satisfaction</span>
                      <span className="font-medium">{analytics.patientSatisfaction || 0}%</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Treatment Success Rate</span>
                      <span className="font-medium">{analytics.treatmentSuccessRate || 0}%</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Appointment Show Rate</span>
                      <span className="font-medium">{analytics.showRate || 0}%</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Average Session Duration</span>
                      <span className="font-medium">{analytics.avgSessionDuration || 0} min</span>
                    </div>
                  </div>
                </div>
                
                <div>
                  <h4 className="font-medium text-gray-900 mb-3">Financial Summary</h4>
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Revenue per Patient</span>
                      <span className="font-medium">₹{analytics.revenuePerPatient?.toLocaleString() || 0}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Average Session Fee</span>
                      <span className="font-medium">₹{analytics.avgSessionFee?.toLocaleString() || 0}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Monthly Recurring Revenue</span>
                      <span className="font-medium">₹{analytics.monthlyRecurringRevenue?.toLocaleString() || 0}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Payment Success Rate</span>
                      <span className="font-medium">{analytics.paymentSuccessRate || 0}%</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {selectedReport === 'patients' && (
            <div className="space-y-4">
              <h4 className="font-medium text-gray-900">Patient Demographics & Behavior</h4>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-gray-50 p-4 rounded-lg">
                  <h5 className="font-medium text-gray-700 mb-2">Age Distribution</h5>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span>18-30 years</span>
                      <span>{analytics.ageDistribution?.young || 0}%</span>
                    </div>
                    <div className="flex justify-between">
                      <span>31-50 years</span>
                      <span>{analytics.ageDistribution?.middle || 0}%</span>
                    </div>
                    <div className="flex justify-between">
                      <span>50+ years</span>
                      <span>{analytics.ageDistribution?.senior || 0}%</span>
                    </div>
                  </div>
                </div>
                
                <div className="bg-gray-50 p-4 rounded-lg">
                  <h5 className="font-medium text-gray-700 mb-2">Treatment Types</h5>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span>Panchakarma</span>
                      <span>{analytics.treatmentTypes?.panchakarma || 0}%</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Consultation</span>
                      <span>{analytics.treatmentTypes?.consultation || 0}%</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Follow-up</span>
                      <span>{analytics.treatmentTypes?.followup || 0}%</span>
                    </div>
                  </div>
                </div>
                
                <div className="bg-gray-50 p-4 rounded-lg">
                  <h5 className="font-medium text-gray-700 mb-2">Patient Status</h5>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span>Active</span>
                      <span>{analytics.patientStatus?.active || 0}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Completed</span>
                      <span>{analytics.patientStatus?.completed || 0}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Inactive</span>
                      <span>{analytics.patientStatus?.inactive || 0}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {selectedReport === 'revenue' && (
            <div className="space-y-4">
              <h4 className="font-medium text-gray-900">Revenue Breakdown</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <h5 className="font-medium text-gray-700">Revenue by Service</h5>
                  {analytics.revenueByService?.map((service, index) => (
                    <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <span className="text-gray-700">{service.name}</span>
                      <div className="text-right">
                        <span className="font-medium">₹{service.amount?.toLocaleString()}</span>
                        <div className="text-sm text-gray-500">{service.percentage}%</div>
                      </div>
                    </div>
                  )) || <p className="text-gray-500">No revenue data available</p>}
                </div>
                
                <div className="space-y-4">
                  <h5 className="font-medium text-gray-700">Monthly Trends</h5>
                  {analytics.monthlyRevenue?.map((month, index) => (
                    <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <span className="text-gray-700">{month.month}</span>
                      <div className="text-right">
                        <span className="font-medium">₹{month.amount?.toLocaleString()}</span>
                        <div className="text-sm text-green-600">+{month.growth}%</div>
                      </div>
                    </div>
                  )) || <p className="text-gray-500">No monthly data available</p>}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Quick Actions */}
      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h3>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <button
            onClick={() => generateReport('monthly')}
            className="flex items-center justify-center p-4 border border-gray-200 rounded-lg hover:bg-gray-50"
          >
            <Calendar className="h-6 w-6 text-gray-600 mr-3" />
            <div className="text-left">
              <p className="font-medium text-gray-900">Monthly Report</p>
              <p className="text-sm text-gray-500">Generate monthly summary</p>
            </div>
          </button>
          
          <button
            onClick={() => exportData('csv')}
            className="flex items-center justify-center p-4 border border-gray-200 rounded-lg hover:bg-gray-50"
          >
            <Download className="h-6 w-6 text-gray-600 mr-3" />
            <div className="text-left">
              <p className="font-medium text-gray-900">Export Data</p>
              <p className="text-sm text-gray-500">Download as CSV</p>
            </div>
          </button>
          
          <button className="flex items-center justify-center p-4 border border-gray-200 rounded-lg hover:bg-gray-50">
            <Share2 className="h-6 w-6 text-gray-600 mr-3" />
            <div className="text-left">
              <p className="font-medium text-gray-900">Share Report</p>
              <p className="text-sm text-gray-500">Send via email</p>
            </div>
          </button>
          
          <button className="flex items-center justify-center p-4 border border-gray-200 rounded-lg hover:bg-gray-50">
            <Settings className="h-6 w-6 text-gray-600 mr-3" />
            <div className="text-left">
              <p className="font-medium text-gray-900">Report Settings</p>
              <p className="text-sm text-gray-500">Configure reports</p>
            </div>
          </button>
        </div>
      </div>
    </div>
  );
};

export default ReportsAnalytics;

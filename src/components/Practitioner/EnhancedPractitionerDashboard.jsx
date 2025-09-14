import React, { useState, useEffect } from 'react';
import { 
  Calendar, 
  Users, 
  TrendingUp, 
  DollarSign,
  Clock,
  Star,
  Activity,
  AlertTriangle,
  CheckCircle,
  Eye,
  Plus,
  RefreshCw,
  Download,
  Filter,
  Bell,
  MessageSquare,
  FileText,
  BarChart3,
  PieChart,
  ArrowUpRight,
  ArrowDownRight,
  User,
  Heart,
  Zap,
  Stethoscope,
  ClipboardList,
  UserCheck,
  BookOpen,
  TrendingDown
} from 'lucide-react';
import { Link } from 'react-router-dom';
import api from '../../utils/api';


const EnhancedPractitionerDashboard = () => {
  const [dashboardData, setDashboardData] = useState({});
  const [todayAppointments, setTodayAppointments] = useState([]);
  const [recentPatients, setRecentPatients] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [practiceData, setPracticeData] = useState({
    // Appointments
    totalAppointments: 0,
    todayAppointments: 0,
    upcomingAppointments: 0,
    pendingAppointments: 0,
    completedAppointments: 0,
    cancelledAppointments: 0,
    onlineConsultations: 0,
    inPersonConsultations: 0,
    
    // Patients
    totalPatients: 0,
    newPatients: 0,
    followUpPatients: 0,
    activePatients: 0,
    inactivePatients: 0,
    vataPatients: 0,
    pittaPatients: 0,
    kaphaPatients: 0,
    criticalPatients: 0,
    
    // Therapy Plans
    activeTreatmentPlans: 0,
    completedTreatmentPlans: 0,
    panchakarmaPlans: 0,
    herbalTreatmentPlans: 0,
    lifestylePlans: 0,
    successfulTreatments: 0,
    
    // Medical Records
    medicalRecords: 0,
    recentRecords: 0,
    updatedToday: 0,
    prescriptions: 0,
    labReports: 0,
    
    // Financial
    todayEarnings: 0,
    monthlyEarnings: 0,
    pendingPayments: 0,
    totalRevenue: 0,
    
    // Notifications & Alerts
    unreadNotifications: 0,
    urgentAlerts: 0,
    appointmentReminders: 0,
    
    // Performance
    patientSatisfaction: 0,
    averageRating: 0,
    totalReviews: 0,
    successRate: 0
  });
  const [loading, setLoading] = useState(true);
  const [timeRange, setTimeRange] = useState('7d');

  useEffect(() => {
    fetchDashboardData();
  }, [timeRange]);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const [dashboardRes, appointmentsRes, patientsRes, notificationsRes, practiceRes] = await Promise.all([
        api.get(`/practitioner/dashboard?timeRange=${timeRange}`),
        api.get('/practitioner/appointments?date=today'),
        api.get('/practitioner/patients?recent=true'),
        api.get('/practitioner/notifications?status=unread'),
        api.get('/practitioner/practice-summary')
      ]);

      setDashboardData(dashboardRes.data);
      setTodayAppointments(Array.isArray(appointmentsRes.data) ? appointmentsRes.data : appointmentsRes.data?.appointments || []);
      setRecentPatients(Array.isArray(patientsRes.data) ? patientsRes.data : []);
      setNotifications(Array.isArray(notificationsRes.data) ? notificationsRes.data : notificationsRes.data?.notifications || []);
      
      // Set practice data with mock data if API fails
      if (practiceRes.data) {
        setPracticeData(practiceRes.data);
      } else {
        // Comprehensive mock data for demonstration
        setPracticeData({
          // Appointments
          totalAppointments: 156,
          todayAppointments: 8,
          upcomingAppointments: 23,
          pendingAppointments: 12,
          completedAppointments: 144,
          cancelledAppointments: 7,
          onlineConsultations: 89,
          inPersonConsultations: 67,
          
          // Patients
          totalPatients: 89,
          newPatients: 15,
          followUpPatients: 74,
          activePatients: 82,
          inactivePatients: 7,
          vataPatients: 28,
          pittaPatients: 31,
          kaphaPatients: 22,
          criticalPatients: 3,
          
          // Therapy Plans
          activeTreatmentPlans: 34,
          completedTreatmentPlans: 67,
          panchakarmaPlans: 18,
          herbalTreatmentPlans: 25,
          lifestylePlans: 12,
          successfulTreatments: 58,
          
          // Medical Records
          medicalRecords: 89,
          recentRecords: 15,
          updatedToday: 8,
          prescriptions: 156,
          labReports: 43,
          
          // Financial
          todayEarnings: 18500,
          monthlyEarnings: 125000,
          pendingPayments: 12500,
          totalRevenue: 1250000,
          
          // Notifications & Alerts
          unreadNotifications: 7,
          urgentAlerts: 2,
          appointmentReminders: 5,
          
          // Performance
          patientSatisfaction: 92,
          averageRating: 4.7,
          totalReviews: 156,
          successRate: 87
        });
      }
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      // Set comprehensive mock practice data on error
      setPracticeData({
        // Appointments
        totalAppointments: 156,
        todayAppointments: 8,
        upcomingAppointments: 23,
        pendingAppointments: 12,
        completedAppointments: 144,
        cancelledAppointments: 7,
        onlineConsultations: 89,
        inPersonConsultations: 67,
        
        // Patients
        totalPatients: 89,
        newPatients: 15,
        followUpPatients: 74,
        activePatients: 82,
        inactivePatients: 7,
        vataPatients: 28,
        pittaPatients: 31,
        kaphaPatients: 22,
        criticalPatients: 3,
        
        // Therapy Plans
        activeTreatmentPlans: 34,
        completedTreatmentPlans: 67,
        panchakarmaPlans: 18,
        herbalTreatmentPlans: 25,
        lifestylePlans: 12,
        successfulTreatments: 58,
        
        // Medical Records
        medicalRecords: 89,
        recentRecords: 15,
        updatedToday: 8,
        prescriptions: 156,
        labReports: 43,
        
        // Financial
        todayEarnings: 18500,
        monthlyEarnings: 125000,
        pendingPayments: 12500,
        totalRevenue: 1250000,
        
        // Notifications & Alerts
        unreadNotifications: 7,
        urgentAlerts: 2,
        appointmentReminders: 5,
        
        // Performance
        patientSatisfaction: 92,
        averageRating: 4.7,
        totalReviews: 156,
        successRate: 87
      });
    } finally {
      setLoading(false);
    }
  };

  const markAppointmentComplete = async (appointmentId) => {
    try {
      await api.patch(`/practitioner/appointments/${appointmentId}/status`, {
        status: 'completed'
      });
      
      fetchDashboardData();
    } catch (error) {
      console.error('Error updating appointment:', error);
      
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

  const getAppointmentStatusColor = (status) => {
    switch (status) {
      case 'scheduled': return 'bg-blue-100 text-blue-700';
      case 'confirmed': return 'bg-green-100 text-green-700';
      case 'in-progress': return 'bg-yellow-100 text-yellow-700';
      case 'completed': return 'bg-green-100 text-green-700';
      case 'cancelled': return 'bg-red-100 text-red-700';
      default: return 'bg-gray-100 text-gray-700';
    }
  };

  const formatTime = (time) => {
    return new Date(`2000-01-01T${time}`).toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-500"></div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-gray-50">
      {/* Comprehensive Sidebar */}
      <div className="w-96 bg-white shadow-lg border-r border-gray-200 overflow-y-auto max-h-screen">
        <div className="p-6 border-b border-gray-200">
          <h2 className="text-xl font-bold text-gray-900">Practice Overview</h2>
          <p className="text-sm text-gray-600">Complete practice data & analytics</p>
        </div>
        
        <div className="p-4 space-y-4">
          {/* Appointments Section */}
          <div className="bg-gradient-to-r from-blue-50 to-blue-100 rounded-lg p-4">
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-semibold text-blue-900">📅 Appointments</h3>
              <Calendar className="h-5 w-5 text-blue-600" />
            </div>
            
            {/* Summary Stats */}
            <div className="grid grid-cols-2 gap-2 text-xs mb-4">
              <div className="bg-white/50 p-2 rounded">
                <div className="text-blue-600 font-medium">Total</div>
                <div className="text-blue-900 font-bold text-lg">{practiceData.totalAppointments}</div>
              </div>
              <div className="bg-white/50 p-2 rounded">
                <div className="text-blue-600 font-medium">Today</div>
                <div className="text-blue-900 font-bold text-lg">{practiceData.todayAppointments}</div>
              </div>
              <div className="bg-white/50 p-2 rounded">
                <div className="text-blue-600 font-medium">Upcoming</div>
                <div className="text-blue-900 font-bold text-lg">{practiceData.upcomingAppointments}</div>
              </div>
              <div className="bg-white/50 p-2 rounded">
                <div className="text-blue-600 font-medium">Pending</div>
                <div className="text-blue-900 font-bold text-lg">{practiceData.pendingAppointments}</div>
              </div>
            </div>

            {/* Today's Appointments List */}
            <div className="border-t border-blue-200 pt-3">
              <h4 className="text-blue-800 font-semibold text-xs mb-2">Today's Schedule</h4>
              <div className="space-y-2 max-h-40 overflow-y-auto">
                <div className="bg-white/70 p-2 rounded text-xs">
                  <div className="flex justify-between items-center">
                    <span className="font-medium text-blue-900">Arjun Sharma</span>
                    <span className="text-blue-600">10:00 AM</span>
                  </div>
                  <div className="text-blue-700 text-xs">Stress Management • Follow-up</div>
                </div>
                <div className="bg-white/70 p-2 rounded text-xs">
                  <div className="flex justify-between items-center">
                    <span className="font-medium text-blue-900">Meera Patel</span>
                    <span className="text-blue-600">11:30 AM</span>
                  </div>
                  <div className="text-blue-700 text-xs">PCOD Treatment • New Patient</div>
                </div>
                <div className="bg-white/70 p-2 rounded text-xs">
                  <div className="flex justify-between items-center">
                    <span className="font-medium text-blue-900">Vikram Singh</span>
                    <span className="text-blue-600">2:00 PM</span>
                  </div>
                  <div className="text-blue-700 text-xs">Joint Pain • Panchakarma</div>
                </div>
                <div className="bg-white/70 p-2 rounded text-xs">
                  <div className="flex justify-between items-center">
                    <span className="font-medium text-blue-900">Priya Nair</span>
                    <span className="text-blue-600">3:30 PM</span>
                  </div>
                  <div className="text-blue-700 text-xs">Digestive Issues • Online</div>
                </div>
                <div className="bg-white/70 p-2 rounded text-xs">
                  <div className="flex justify-between items-center">
                    <span className="font-medium text-blue-900">Rajesh Kumar</span>
                    <span className="text-blue-600">4:30 PM</span>
                  </div>
                  <div className="text-blue-700 text-xs">Hypertension • Follow-up</div>
                </div>
              </div>
            </div>

            {/* Upcoming This Week */}
            <div className="border-t border-blue-200 pt-3 mt-3">
              <h4 className="text-blue-800 font-semibold text-xs mb-2">This Week</h4>
              <div className="space-y-1 text-xs">
                <div className="flex justify-between bg-white/50 p-1 rounded">
                  <span className="text-blue-700">Tomorrow</span>
                  <span className="text-blue-900 font-medium">6 appointments</span>
                </div>
                <div className="flex justify-between bg-white/50 p-1 rounded">
                  <span className="text-blue-700">Wednesday</span>
                  <span className="text-blue-900 font-medium">4 appointments</span>
                </div>
                <div className="flex justify-between bg-white/50 p-1 rounded">
                  <span className="text-blue-700">Thursday</span>
                  <span className="text-blue-900 font-medium">7 appointments</span>
                </div>
                <div className="flex justify-between bg-white/50 p-1 rounded">
                  <span className="text-blue-700">Friday</span>
                  <span className="text-blue-900 font-medium">5 appointments</span>
                </div>
              </div>
            </div>

            {/* Status Summary */}
            <div className="mt-3 pt-3 border-t border-blue-200">
              <div className="grid grid-cols-2 gap-1 text-xs">
                <div className="text-center bg-green-100 p-1 rounded">
                  <div className="text-green-700">Completed</div>
                  <div className="text-green-900 font-bold">{practiceData.completedAppointments}</div>
                </div>
                <div className="text-center bg-red-100 p-1 rounded">
                  <div className="text-red-700">Cancelled</div>
                  <div className="text-red-900 font-bold">{practiceData.cancelledAppointments}</div>
                </div>
              </div>
              <div className="flex justify-between text-xs mt-2">
                <span className="text-blue-700">💻 Online: {practiceData.onlineConsultations}</span>
                <span className="text-blue-700">🏥 In-Person: {practiceData.inPersonConsultations}</span>
              </div>
            </div>
          </div>

          {/* Patients Section */}
          <div className="bg-gradient-to-r from-green-50 to-green-100 rounded-lg p-4">
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-semibold text-green-900">👥 Patients</h3>
              <Users className="h-5 w-5 text-green-600" />
            </div>
            
            {/* Summary Stats */}
            <div className="grid grid-cols-2 gap-2 text-xs mb-4">
              <div className="bg-white/50 p-2 rounded">
                <div className="text-green-600 font-medium">Total</div>
                <div className="text-green-900 font-bold text-lg">{practiceData.totalPatients}</div>
              </div>
              <div className="bg-white/50 p-2 rounded">
                <div className="text-green-600 font-medium">Active</div>
                <div className="text-green-900 font-bold text-lg">{practiceData.activePatients}</div>
              </div>
              <div className="bg-white/50 p-2 rounded">
                <div className="text-green-600 font-medium">New</div>
                <div className="text-green-900 font-bold text-lg">{practiceData.newPatients}</div>
              </div>
              <div className="bg-red-100 p-2 rounded">
                <div className="text-red-600 font-medium">Critical</div>
                <div className="text-red-900 font-bold text-lg">{practiceData.criticalPatients}</div>
              </div>
            </div>

            {/* Recent Patients List */}
            <div className="border-t border-green-200 pt-3">
              <h4 className="text-green-800 font-semibold text-xs mb-2">Recent Patients</h4>
              <div className="space-y-2 max-h-40 overflow-y-auto">
                <div className="bg-white/70 p-2 rounded text-xs">
                  <div className="flex justify-between items-center">
                    <span className="font-medium text-green-900">Arjun Sharma</span>
                    <span className="text-green-600">🌪️ Vata</span>
                  </div>
                  <div className="text-green-700 text-xs">Stress, Anxiety • Last visit: Today</div>
                </div>
                <div className="bg-white/70 p-2 rounded text-xs">
                  <div className="flex justify-between items-center">
                    <span className="font-medium text-green-900">Meera Patel</span>
                    <span className="text-green-600">🔥 Pitta</span>
                  </div>
                  <div className="text-green-700 text-xs">PCOD, Irregular Periods • Last visit: 2 days ago</div>
                </div>
                <div className="bg-white/70 p-2 rounded text-xs">
                  <div className="flex justify-between items-center">
                    <span className="font-medium text-green-900">Vikram Singh</span>
                    <span className="text-green-600">🌍 Kapha</span>
                  </div>
                  <div className="text-green-700 text-xs">Joint Pain, Arthritis • Last visit: 1 week ago</div>
                </div>
                <div className="bg-white/70 p-2 rounded text-xs">
                  <div className="flex justify-between items-center">
                    <span className="font-medium text-green-900">Priya Nair</span>
                    <span className="text-green-600">🔥 Pitta</span>
                  </div>
                  <div className="text-green-700 text-xs">Digestive Issues • Last visit: 3 days ago</div>
                </div>
                <div className="bg-red-100 p-2 rounded text-xs">
                  <div className="flex justify-between items-center">
                    <span className="font-medium text-red-900">Rajesh Kumar</span>
                    <span className="text-red-600">⚠️ Critical</span>
                  </div>
                  <div className="text-red-700 text-xs">Hypertension, Diabetes • Needs attention</div>
                </div>
              </div>
            </div>

            {/* Patient Categories */}
            <div className="border-t border-green-200 pt-3 mt-3">
              <h4 className="text-green-800 font-semibold text-xs mb-2">By Constitution</h4>
              <div className="grid grid-cols-3 gap-1 text-xs">
                <div className="text-center bg-white/50 p-1 rounded">
                  <div className="text-green-700">🌪️ Vata</div>
                  <div className="text-green-900 font-bold">{practiceData.vataPatients}</div>
                </div>
                <div className="text-center bg-white/50 p-1 rounded">
                  <div className="text-green-700">🔥 Pitta</div>
                  <div className="text-green-900 font-bold">{practiceData.pittaPatients}</div>
                </div>
                <div className="text-center bg-white/50 p-1 rounded">
                  <div className="text-green-700">🌍 Kapha</div>
                  <div className="text-green-900 font-bold">{practiceData.kaphaPatients}</div>
                </div>
              </div>
            </div>

            {/* Patient Status */}
            <div className="mt-3 pt-3 border-t border-green-200">
              <div className="grid grid-cols-2 gap-1 text-xs">
                <div className="text-center bg-blue-100 p-1 rounded">
                  <div className="text-blue-700">Follow-up</div>
                  <div className="text-blue-900 font-bold">{practiceData.followUpPatients}</div>
                </div>
                <div className="text-center bg-gray-100 p-1 rounded">
                  <div className="text-gray-700">Inactive</div>
                  <div className="text-gray-900 font-bold">{practiceData.inactivePatients}</div>
                </div>
              </div>
            </div>
          </div>

          {/* Therapy Plans Section */}
          <div className="bg-gradient-to-r from-purple-50 to-purple-100 rounded-lg p-4">
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-semibold text-purple-900">🧘 Therapy Plans</h3>
              <ClipboardList className="h-5 w-5 text-purple-600" />
            </div>
            
            {/* Summary Stats */}
            <div className="grid grid-cols-2 gap-2 text-xs mb-4">
              <div className="bg-white/50 p-2 rounded">
                <div className="text-purple-600 font-medium">Active</div>
                <div className="text-purple-900 font-bold text-lg">{practiceData.activeTreatmentPlans}</div>
              </div>
              <div className="bg-white/50 p-2 rounded">
                <div className="text-purple-600 font-medium">Completed</div>
                <div className="text-purple-900 font-bold text-lg">{practiceData.completedTreatmentPlans}</div>
              </div>
              <div className="bg-green-100 p-2 rounded">
                <div className="text-green-600 font-medium">Successful</div>
                <div className="text-green-900 font-bold text-lg">{practiceData.successfulTreatments}</div>
              </div>
              <div className="bg-white/50 p-2 rounded">
                <div className="text-purple-600 font-medium">Success Rate</div>
                <div className="text-purple-900 font-bold text-lg">{practiceData.successRate}%</div>
              </div>
            </div>

            {/* Active Treatment Plans */}
            <div className="border-t border-purple-200 pt-3">
              <h4 className="text-purple-800 font-semibold text-xs mb-2">Active Plans</h4>
              <div className="space-y-2 max-h-40 overflow-y-auto">
                <div className="bg-white/70 p-2 rounded text-xs">
                  <div className="flex justify-between items-center">
                    <span className="font-medium text-purple-900">Arjun Sharma</span>
                    <span className="text-purple-600">Panchakarma</span>
                  </div>
                  <div className="text-purple-700 text-xs">Stress Relief • Day 15/21 • 71% complete</div>
                </div>
                <div className="bg-white/70 p-2 rounded text-xs">
                  <div className="flex justify-between items-center">
                    <span className="font-medium text-purple-900">Meera Patel</span>
                    <span className="text-purple-600">Herbal</span>
                  </div>
                  <div className="text-purple-700 text-xs">PCOD Treatment • Week 4/12 • 33% complete</div>
                </div>
                <div className="bg-white/70 p-2 rounded text-xs">
                  <div className="flex justify-between items-center">
                    <span className="font-medium text-purple-900">Vikram Singh</span>
                    <span className="text-purple-600">Panchakarma</span>
                  </div>
                  <div className="text-purple-700 text-xs">Joint Pain Relief • Day 8/28 • 29% complete</div>
                </div>
                <div className="bg-white/70 p-2 rounded text-xs">
                  <div className="flex justify-between items-center">
                    <span className="font-medium text-purple-900">Priya Nair</span>
                    <span className="text-purple-600">Lifestyle</span>
                  </div>
                  <div className="text-purple-700 text-xs">Digestive Health • Week 2/8 • 25% complete</div>
                </div>
                <div className="bg-white/70 p-2 rounded text-xs">
                  <div className="flex justify-between items-center">
                    <span className="font-medium text-purple-900">Rajesh Kumar</span>
                    <span className="text-purple-600">Herbal</span>
                  </div>
                  <div className="text-purple-700 text-xs">Hypertension Control • Week 6/16 • 38% complete</div>
                </div>
              </div>
            </div>

            {/* Treatment Types */}
            <div className="border-t border-purple-200 pt-3 mt-3">
              <h4 className="text-purple-800 font-semibold text-xs mb-2">By Treatment Type</h4>
              <div className="grid grid-cols-3 gap-1 text-xs">
                <div className="text-center bg-white/50 p-1 rounded">
                  <div className="text-purple-700">Panchakarma</div>
                  <div className="text-purple-900 font-bold">{practiceData.panchakarmaPlans}</div>
                </div>
                <div className="text-center bg-white/50 p-1 rounded">
                  <div className="text-purple-700">Herbal</div>
                  <div className="text-purple-900 font-bold">{practiceData.herbalTreatmentPlans}</div>
                </div>
                <div className="text-center bg-white/50 p-1 rounded">
                  <div className="text-purple-700">Lifestyle</div>
                  <div className="text-purple-900 font-bold">{practiceData.lifestylePlans}</div>
                </div>
              </div>
            </div>

            {/* Progress Summary */}
            <div className="mt-3 pt-3 border-t border-purple-200">
              <div className="text-xs space-y-1">
                <div className="flex justify-between bg-white/50 p-1 rounded">
                  <span className="text-purple-700">Plans starting this week</span>
                  <span className="text-purple-900 font-medium">3</span>
                </div>
                <div className="flex justify-between bg-white/50 p-1 rounded">
                  <span className="text-purple-700">Plans completing soon</span>
                  <span className="text-purple-900 font-medium">2</span>
                </div>
              </div>
            </div>
          </div>

          {/* Medical Records Section */}
          <div className="bg-gradient-to-r from-orange-50 to-orange-100 rounded-lg p-4">
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-semibold text-orange-900">📋 Medical Records</h3>
              <FileText className="h-5 w-5 text-orange-600" />
            </div>
            
            {/* Summary Stats */}
            <div className="grid grid-cols-2 gap-2 text-xs mb-4">
              <div className="bg-white/50 p-2 rounded">
                <div className="text-orange-600 font-medium">Total Records</div>
                <div className="text-orange-900 font-bold text-lg">{practiceData.medicalRecords}</div>
              </div>
              <div className="bg-white/50 p-2 rounded">
                <div className="text-orange-600 font-medium">Updated Today</div>
                <div className="text-orange-900 font-bold text-lg">{practiceData.updatedToday}</div>
              </div>
              <div className="bg-white/50 p-2 rounded">
                <div className="text-orange-600 font-medium">Prescriptions</div>
                <div className="text-orange-900 font-bold text-lg">{practiceData.prescriptions}</div>
              </div>
              <div className="bg-white/50 p-2 rounded">
                <div className="text-orange-600 font-medium">Lab Reports</div>
                <div className="text-orange-900 font-bold text-lg">{practiceData.labReports}</div>
              </div>
            </div>

            {/* Recent Records */}
            <div className="border-t border-orange-200 pt-3">
              <h4 className="text-orange-800 font-semibold text-xs mb-2">Recent Updates</h4>
              <div className="space-y-2 max-h-40 overflow-y-auto">
                <div className="bg-white/70 p-2 rounded text-xs">
                  <div className="flex justify-between items-center">
                    <span className="font-medium text-orange-900">Arjun Sharma</span>
                    <span className="text-orange-600">Today</span>
                  </div>
                  <div className="text-orange-700 text-xs">Prescription: Brahmi Ghrita, Ashwagandha</div>
                </div>
                <div className="bg-white/70 p-2 rounded text-xs">
                  <div className="flex justify-between items-center">
                    <span className="font-medium text-orange-900">Meera Patel</span>
                    <span className="text-orange-600">Today</span>
                  </div>
                  <div className="text-orange-700 text-xs">Lab Report: Hormone levels updated</div>
                </div>
                <div className="bg-white/70 p-2 rounded text-xs">
                  <div className="flex justify-between items-center">
                    <span className="font-medium text-orange-900">Vikram Singh</span>
                    <span className="text-orange-600">Yesterday</span>
                  </div>
                  <div className="text-orange-700 text-xs">Progress Note: Joint mobility improved</div>
                </div>
                <div className="bg-white/70 p-2 rounded text-xs">
                  <div className="flex justify-between items-center">
                    <span className="font-medium text-orange-900">Priya Nair</span>
                    <span className="text-orange-600">2 days ago</span>
                  </div>
                  <div className="text-orange-700 text-xs">Prescription: Triphala, Hingwashtak</div>
                </div>
                <div className="bg-white/70 p-2 rounded text-xs">
                  <div className="flex justify-between items-center">
                    <span className="font-medium text-orange-900">Rajesh Kumar</span>
                    <span className="text-orange-600">3 days ago</span>
                  </div>
                  <div className="text-orange-700 text-xs">Lab Report: BP monitoring results</div>
                </div>
              </div>
            </div>

            {/* Record Types */}
            <div className="border-t border-orange-200 pt-3 mt-3">
              <h4 className="text-orange-800 font-semibold text-xs mb-2">By Record Type</h4>
              <div className="space-y-1 text-xs">
                <div className="flex justify-between bg-white/50 p-1 rounded">
                  <span className="text-orange-700">💊 Prescriptions</span>
                  <span className="text-orange-900 font-medium">156</span>
                </div>
                <div className="flex justify-between bg-white/50 p-1 rounded">
                  <span className="text-orange-700">🔬 Lab Reports</span>
                  <span className="text-orange-900 font-medium">43</span>
                </div>
                <div className="flex justify-between bg-white/50 p-1 rounded">
                  <span className="text-orange-700">📝 Progress Notes</span>
                  <span className="text-orange-900 font-medium">89</span>
                </div>
                <div className="flex justify-between bg-white/50 p-1 rounded">
                  <span className="text-orange-700">📊 Assessments</span>
                  <span className="text-orange-900 font-medium">67</span>
                </div>
              </div>
            </div>

            {/* Pending Actions */}
            <div className="mt-3 pt-3 border-t border-orange-200">
              <div className="text-xs space-y-1">
                <div className="flex justify-between bg-yellow-100 p-1 rounded">
                  <span className="text-yellow-700">Pending Reviews</span>
                  <span className="text-yellow-900 font-medium">5</span>
                </div>
                <div className="flex justify-between bg-red-100 p-1 rounded">
                  <span className="text-red-700">Urgent Follow-ups</span>
                  <span className="text-red-900 font-medium">2</span>
                </div>
              </div>
            </div>
          </div>

          {/* Financial Section */}
          <div className="bg-gradient-to-r from-emerald-50 to-emerald-100 rounded-lg p-4">
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-semibold text-emerald-900">💰 Financial</h3>
              <DollarSign className="h-5 w-5 text-emerald-600" />
            </div>
            
            {/* Summary Stats */}
            <div className="grid grid-cols-2 gap-2 text-xs mb-4">
              <div className="bg-white/50 p-2 rounded">
                <div className="text-emerald-600 font-medium">Today</div>
                <div className="text-emerald-900 font-bold text-lg">₹{practiceData.todayEarnings.toLocaleString()}</div>
              </div>
              <div className="bg-white/50 p-2 rounded">
                <div className="text-emerald-600 font-medium">This Month</div>
                <div className="text-emerald-900 font-bold text-lg">₹{practiceData.monthlyEarnings.toLocaleString()}</div>
              </div>
              <div className="bg-yellow-100 p-2 rounded">
                <div className="text-yellow-600 font-medium">Pending</div>
                <div className="text-yellow-900 font-bold text-lg">₹{practiceData.pendingPayments.toLocaleString()}</div>
              </div>
              <div className="bg-white/50 p-2 rounded">
                <div className="text-emerald-600 font-medium">Total Revenue</div>
                <div className="text-emerald-900 font-bold text-lg">₹{(practiceData.totalRevenue/100000).toFixed(1)}L</div>
              </div>
            </div>

            {/* Recent Transactions */}
            <div className="border-t border-emerald-200 pt-3">
              <h4 className="text-emerald-800 font-semibold text-xs mb-2">Recent Payments</h4>
              <div className="space-y-2 max-h-40 overflow-y-auto">
                <div className="bg-white/70 p-2 rounded text-xs">
                  <div className="flex justify-between items-center">
                    <span className="font-medium text-emerald-900">Arjun Sharma</span>
                    <span className="text-emerald-600">₹1,500</span>
                  </div>
                  <div className="text-emerald-700 text-xs">UPI Payment • Today 10:30 AM</div>
                </div>
                <div className="bg-white/70 p-2 rounded text-xs">
                  <div className="flex justify-between items-center">
                    <span className="font-medium text-emerald-900">Meera Patel</span>
                    <span className="text-emerald-600">₹1,200</span>
                  </div>
                  <div className="text-emerald-700 text-xs">Cash Payment • Today 11:45 AM</div>
                </div>
                <div className="bg-white/70 p-2 rounded text-xs">
                  <div className="flex justify-between items-center">
                    <span className="font-medium text-emerald-900">Vikram Singh</span>
                    <span className="text-emerald-600">₹2,000</span>
                  </div>
                  <div className="text-emerald-700 text-xs">Card Payment • Yesterday</div>
                </div>
                <div className="bg-yellow-100 p-2 rounded text-xs">
                  <div className="flex justify-between items-center">
                    <span className="font-medium text-yellow-900">Priya Nair</span>
                    <span className="text-yellow-600">₹1,500</span>
                  </div>
                  <div className="text-yellow-700 text-xs">Pending • Due today</div>
                </div>
                <div className="bg-red-100 p-2 rounded text-xs">
                  <div className="flex justify-between items-center">
                    <span className="font-medium text-red-900">Rajesh Kumar</span>
                    <span className="text-red-600">₹3,000</span>
                  </div>
                  <div className="text-red-700 text-xs">Overdue • 3 days</div>
                </div>
              </div>
            </div>

            {/* Payment Methods */}
            <div className="border-t border-emerald-200 pt-3 mt-3">
              <h4 className="text-emerald-800 font-semibold text-xs mb-2">Payment Methods</h4>
              <div className="space-y-1 text-xs">
                <div className="flex justify-between bg-white/50 p-1 rounded">
                  <span className="text-emerald-700">📱 UPI</span>
                  <span className="text-emerald-900 font-medium">₹8,500 (45%)</span>
                </div>
                <div className="flex justify-between bg-white/50 p-1 rounded">
                  <span className="text-emerald-700">💳 Card</span>
                  <span className="text-emerald-900 font-medium">₹6,000 (32%)</span>
                </div>
                <div className="flex justify-between bg-white/50 p-1 rounded">
                  <span className="text-emerald-700">💵 Cash</span>
                  <span className="text-emerald-900 font-medium">₹4,000 (23%)</span>
                </div>
              </div>
            </div>

            {/* Financial Summary */}
            <div className="mt-3 pt-3 border-t border-emerald-200">
              <div className="text-xs space-y-1">
                <div className="flex justify-between bg-green-100 p-1 rounded">
                  <span className="text-green-700">Collected Today</span>
                  <span className="text-green-900 font-medium">₹18,500</span>
                </div>
                <div className="flex justify-between bg-blue-100 p-1 rounded">
                  <span className="text-blue-700">Average per consultation</span>
                  <span className="text-blue-900 font-medium">₹1,470</span>
                </div>
              </div>
            </div>
          </div>

          {/* Notifications & Alerts */}
          <div className="bg-gradient-to-r from-red-50 to-red-100 rounded-lg p-4">
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-semibold text-red-900">🔔 Alerts & Notifications</h3>
              <Bell className="h-5 w-5 text-red-600" />
            </div>
            
            {/* Summary Stats */}
            <div className="grid grid-cols-2 gap-2 text-xs mb-4">
              <div className="bg-white/50 p-2 rounded">
                <div className="text-red-600 font-medium">Unread</div>
                <div className="text-red-900 font-bold text-lg">{practiceData.unreadNotifications}</div>
              </div>
              <div className="bg-red-200 p-2 rounded">
                <div className="text-red-700 font-medium">Urgent</div>
                <div className="text-red-900 font-bold text-lg">{practiceData.urgentAlerts}</div>
              </div>
              <div className="bg-white/50 p-2 rounded">
                <div className="text-red-600 font-medium">Reminders</div>
                <div className="text-red-900 font-bold text-lg">{practiceData.appointmentReminders}</div>
              </div>
              <div className="bg-yellow-100 p-2 rounded">
                <div className="text-yellow-600 font-medium">Follow-ups</div>
                <div className="text-yellow-900 font-bold text-lg">3</div>
              </div>
            </div>

            {/* Recent Notifications */}
            <div className="border-t border-red-200 pt-3">
              <h4 className="text-red-800 font-semibold text-xs mb-2">Recent Alerts</h4>
              <div className="space-y-2 max-h-40 overflow-y-auto">
                <div className="bg-red-200 p-2 rounded text-xs">
                  <div className="flex justify-between items-center">
                    <span className="font-medium text-red-900">⚠️ Critical Patient</span>
                    <span className="text-red-600">5 min ago</span>
                  </div>
                  <div className="text-red-700 text-xs">Rajesh Kumar - BP spike detected</div>
                </div>
                <div className="bg-yellow-100 p-2 rounded text-xs">
                  <div className="flex justify-between items-center">
                    <span className="font-medium text-yellow-900">📅 Appointment Reminder</span>
                    <span className="text-yellow-600">15 min ago</span>
                  </div>
                  <div className="text-yellow-700 text-xs">Meera Patel - appointment in 30 minutes</div>
                </div>
                <div className="bg-blue-100 p-2 rounded text-xs">
                  <div className="flex justify-between items-center">
                    <span className="font-medium text-blue-900">💊 Prescription Alert</span>
                    <span className="text-blue-600">1 hour ago</span>
                  </div>
                  <div className="text-blue-700 text-xs">Arjun Sharma - medication refill needed</div>
                </div>
                <div className="bg-green-100 p-2 rounded text-xs">
                  <div className="flex justify-between items-center">
                    <span className="font-medium text-green-900">✅ Treatment Complete</span>
                    <span className="text-green-600">2 hours ago</span>
                  </div>
                  <div className="text-green-700 text-xs">Vikram Singh - Panchakarma session completed</div>
                </div>
                <div className="bg-purple-100 p-2 rounded text-xs">
                  <div className="flex justify-between items-center">
                    <span className="font-medium text-purple-900">📋 Lab Report</span>
                    <span className="text-purple-600">3 hours ago</span>
                  </div>
                  <div className="text-purple-700 text-xs">Priya Nair - new lab results available</div>
                </div>
              </div>
            </div>

            {/* Alert Categories */}
            <div className="border-t border-red-200 pt-3 mt-3">
              <h4 className="text-red-800 font-semibold text-xs mb-2">Alert Types</h4>
              <div className="space-y-1 text-xs">
                <div className="flex justify-between bg-red-200 p-1 rounded">
                  <span className="text-red-700">🚨 Critical Alerts</span>
                  <span className="text-red-900 font-medium">2</span>
                </div>
                <div className="flex justify-between bg-yellow-100 p-1 rounded">
                  <span className="text-yellow-700">⏰ Appointment Reminders</span>
                  <span className="text-yellow-900 font-medium">5</span>
                </div>
                <div className="flex justify-between bg-blue-100 p-1 rounded">
                  <span className="text-blue-700">💊 Medication Alerts</span>
                  <span className="text-blue-900 font-medium">3</span>
                </div>
                <div className="flex justify-between bg-green-100 p-1 rounded">
                  <span className="text-green-700">📊 Progress Updates</span>
                  <span className="text-green-900 font-medium">4</span>
                </div>
              </div>
            </div>

            {/* Action Required */}
            <div className="mt-3 pt-3 border-t border-red-200">
              <div className="text-xs space-y-1">
                <div className="flex justify-between bg-red-100 p-1 rounded">
                  <span className="text-red-700">Immediate Action Required</span>
                  <span className="text-red-900 font-medium">2</span>
                </div>
                <div className="flex justify-between bg-orange-100 p-1 rounded">
                  <span className="text-orange-700">Review Within 24hrs</span>
                  <span className="text-orange-900 font-medium">5</span>
                </div>
              </div>
            </div>
          </div>

          {/* Performance Metrics */}
          <div className="bg-gradient-to-r from-indigo-50 to-indigo-100 rounded-lg p-4">
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-semibold text-indigo-900">📊 Performance</h3>
              <TrendingUp className="h-5 w-5 text-indigo-600" />
            </div>
            <div className="grid grid-cols-2 gap-2 text-xs">
              <div className="bg-white/50 p-2 rounded">
                <div className="text-indigo-600 font-medium">Satisfaction</div>
                <div className="text-indigo-900 font-bold text-lg">{practiceData.patientSatisfaction}%</div>
              </div>
              <div className="bg-white/50 p-2 rounded">
                <div className="text-indigo-600 font-medium">Avg Rating</div>
                <div className="text-indigo-900 font-bold text-lg">{practiceData.averageRating}/5</div>
              </div>
              <div className="bg-white/50 p-2 rounded col-span-2">
                <div className="text-indigo-600 font-medium">Total Reviews</div>
                <div className="text-indigo-900 font-bold text-lg">{practiceData.totalReviews}</div>
              </div>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="bg-gray-50 rounded-lg p-4">
            <h3 className="font-semibold text-gray-900 mb-3">⚡ Quick Actions</h3>
            <div className="space-y-2">
              <Link
                to="/practitioner/appointments/schedule"
                className="flex items-center p-2 text-sm text-gray-700 hover:bg-white hover:shadow-sm rounded-md transition-all"
              >
                <Plus className="h-4 w-4 mr-2 text-green-600" />
                New Appointment
              </Link>
              <Link
                to="/practitioner/patients/add"
                className="flex items-center p-2 text-sm text-gray-700 hover:bg-white hover:shadow-sm rounded-md transition-all"
              >
                <UserCheck className="h-4 w-4 mr-2 text-blue-600" />
                Add Patient
              </Link>
              <Link
                to="/practitioner/therapy-plans/create"
                className="flex items-center p-2 text-sm text-gray-700 hover:bg-white hover:shadow-sm rounded-md transition-all"
              >
                <BookOpen className="h-4 w-4 mr-2 text-purple-600" />
                Create Plan
              </Link>
              <Link
                to="/practitioner/data-management"
                className="flex items-center p-2 text-sm text-gray-700 hover:bg-white hover:shadow-sm rounded-md transition-all"
              >
                <Stethoscope className="h-4 w-4 mr-2 text-orange-600" />
                Manage Data
              </Link>
              <Link
                to="/practitioner/reports"
                className="flex items-center p-2 text-sm text-gray-700 hover:bg-white hover:shadow-sm rounded-md transition-all"
              >
                <BarChart3 className="h-4 w-4 mr-2 text-indigo-600" />
                View Reports
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 p-6 space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Practitioner Dashboard</h1>
            <p className="text-gray-600">Welcome back! Here's your practice overview</p>
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
            </select>
            <button
              onClick={fetchDashboardData}
              className="flex items-center px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700"
            >
              <RefreshCw className="h-4 w-4 mr-2" />
              Refresh
            </button>
          </div>
        </div>

        {/* Key Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-gradient-to-r from-blue-500 to-blue-600 rounded-lg p-6 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-blue-100">Total Patients</p>
              <p className="text-3xl font-bold">{dashboardData.totalPatients?.current || 0}</p>
              <div className="flex items-center mt-2">
                {getChangeIcon(getPercentageChange(dashboardData.totalPatients?.current, dashboardData.totalPatients?.previous))}
                <span className="text-sm ml-1">
                  {Math.abs(getPercentageChange(dashboardData.totalPatients?.current, dashboardData.totalPatients?.previous))}%
                </span>
              </div>
            </div>
            <Users className="h-12 w-12 text-blue-200" />
          </div>
        </div>

        <div className="bg-gradient-to-r from-green-500 to-green-600 rounded-lg p-6 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-green-100">Appointments</p>
              <p className="text-3xl font-bold">{dashboardData.totalAppointments?.current || 0}</p>
              <div className="flex items-center mt-2">
                {getChangeIcon(getPercentageChange(dashboardData.totalAppointments?.current, dashboardData.totalAppointments?.previous))}
                <span className="text-sm ml-1">
                  {Math.abs(getPercentageChange(dashboardData.totalAppointments?.current, dashboardData.totalAppointments?.previous))}%
                </span>
              </div>
            </div>
            <Calendar className="h-12 w-12 text-green-200" />
          </div>
        </div>

        <div className="bg-gradient-to-r from-purple-500 to-purple-600 rounded-lg p-6 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-purple-100">Revenue</p>
              <p className="text-3xl font-bold">₹{(dashboardData.totalRevenue?.current || 0).toLocaleString()}</p>
              <div className="flex items-center mt-2">
                {getChangeIcon(getPercentageChange(dashboardData.totalRevenue?.current, dashboardData.totalRevenue?.previous))}
                <span className="text-sm ml-1">
                  {Math.abs(getPercentageChange(dashboardData.totalRevenue?.current, dashboardData.totalRevenue?.previous))}%
                </span>
              </div>
            </div>
            <DollarSign className="h-12 w-12 text-purple-200" />
          </div>
        </div>

        <div className="bg-gradient-to-r from-yellow-500 to-yellow-600 rounded-lg p-6 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-yellow-100">Avg Rating</p>
              <p className="text-3xl font-bold">{(dashboardData.avgRating?.current || 0).toFixed(1)}</p>
              <div className="flex items-center mt-2">
                <Star className="h-4 w-4 text-yellow-200 mr-1" />
                <span className="text-sm">
                  {dashboardData.totalReviews || 0} reviews
                </span>
              </div>
            </div>
            <Star className="h-12 w-12 text-yellow-200" />
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      {/* <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
          <Link
            to="/practitioner/appointments/schedule"
            className="flex flex-col items-center p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
          >
            <Plus className="h-8 w-8 text-green-600 mb-2" />
            <span className="text-sm font-medium text-gray-900">New Appointment</span>
          </Link>
          
          <Link
            to="/practitioner/patients/add"
            className="flex flex-col items-center p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
          >
            <User className="h-8 w-8 text-blue-600 mb-2" />
            <span className="text-sm font-medium text-gray-900">Add Patient</span>
          </Link>
          
          <Link
            to="/practitioner/therapy-plans/create"
            className="flex flex-col items-center p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
          >
            <FileText className="h-8 w-8 text-purple-600 mb-2" />
            <span className="text-sm font-medium text-gray-900">Create Plan</span>
          </Link>
          
          <Link
            to="/practitioner/sessions"
            className="flex flex-col items-center p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
          >
            <Activity className="h-8 w-8 text-orange-600 mb-2" />
            <span className="text-sm font-medium text-gray-900">View Sessions</span>
          </Link>
          
          <Link
            to="/practitioner/feedback"
            className="flex flex-col items-center p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
          >
            <MessageSquare className="h-8 w-8 text-pink-600 mb-2" />
            <span className="text-sm font-medium text-gray-900">Reviews</span>
          </Link>
          
          <Link
            to="/practitioner/reports"
            className="flex flex-col items-center p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
          >
            <BarChart3 className="h-8 w-8 text-indigo-600 mb-2" />
            <span className="text-sm font-medium text-gray-900">Reports</span>
          </Link>
        </div>
      </div> */}

      {/* Today's Schedule & Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Today's Appointments */}
        <div className="bg-white rounded-lg shadow">
          <div className="px-6 py-4 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold text-gray-900">Today's Schedule</h3>
              <Link
                to="/practitioner/appointments"
                className="text-sm text-green-600 hover:text-green-800"
              >
                View All
              </Link>
            </div>
          </div>
          <div className="divide-y divide-gray-200 max-h-96 overflow-y-auto">
            {(Array.isArray(todayAppointments) && todayAppointments.length > 0) ? (
              todayAppointments.map((appointment) => (
                <div key={appointment._id} className="p-4 hover:bg-gray-50">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 bg-gradient-to-r from-green-400 to-blue-500 rounded-full flex items-center justify-center text-white font-semibold">
                        {appointment.patient?.firstName?.charAt(0)}{appointment.patient?.lastName?.charAt(0)}
                      </div>
                      <div>
                        <p className="font-medium text-gray-900">
                          {appointment.patient?.firstName} {appointment.patient?.lastName}
                        </p>
                        <p className="text-sm text-gray-600">
                          {formatTime(appointment.startTime)} - {formatTime(appointment.endTime)}
                        </p>
                        <p className="text-xs text-gray-500 capitalize">{appointment.type}</p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <span className={`px-2 py-1 text-xs font-semibold rounded-full ${getAppointmentStatusColor(appointment.status)}`}>
                        {appointment.status}
                      </span>
                      {appointment.status === 'confirmed' && (
                        <button
                          onClick={() => markAppointmentComplete(appointment._id)}
                          className="p-1 text-green-600 hover:text-green-800"
                          title="Mark Complete"
                        >
                          <CheckCircle className="h-4 w-4" />
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="p-8 text-center">
                <Calendar className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-500">No appointments scheduled for today</p>
              </div>
            )}
          </div>
        </div>

        {/* Recent Patients */}
        <div className="bg-white rounded-lg shadow">
          <div className="px-6 py-4 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold text-gray-900">Recent Patients</h3>
              <Link
                to="/practitioner/patients"
                className="text-sm text-green-600 hover:text-green-800"
              >
                View All
              </Link>
            </div>
          </div>
          <div className="divide-y divide-gray-200 max-h-96 overflow-y-auto">
            {(Array.isArray(recentPatients) && recentPatients.length > 0) ? (
              recentPatients.map((patient) => (
                <div key={patient._id} className="p-4 hover:bg-gray-50">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 bg-gradient-to-r from-purple-400 to-pink-500 rounded-full flex items-center justify-center text-white font-semibold">
                        {patient.firstName?.charAt(0)}{patient.lastName?.charAt(0)}
                      </div>
                      <div>
                        <p className="font-medium text-gray-900">
                          {patient.firstName} {patient.lastName}
                        </p>
                        <p className="text-sm text-gray-600">{patient.email}</p>
                        <p className="text-xs text-gray-500">
                          Last visit: {patient.lastAppointment 
                            ? new Date(patient.lastAppointment).toLocaleDateString()
                            : 'Never'
                          }
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <span className={`px-2 py-1 text-xs font-semibold rounded-full ${
                        patient.riskLevel === 'high' ? 'bg-red-100 text-red-700' :
                        patient.riskLevel === 'medium' ? 'bg-yellow-100 text-yellow-700' :
                        'bg-green-100 text-green-700'
                      }`}>
                        {patient.riskLevel || 'low'} risk
                      </span>
                      <Link
                        to={`/practitioner/patients/${patient._id}`}
                        className="p-1 text-blue-600 hover:text-blue-800"
                        title="View Details"
                      >
                        <Eye className="h-4 w-4" />
                      </Link>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="p-8 text-center">
                <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-500">No recent patients</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Performance Analytics */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Performance Metrics */}
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Performance Metrics</h3>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-gray-600">Patient Satisfaction</span>
              <div className="flex items-center">
                <div className="w-24 bg-gray-200 rounded-full h-2 mr-3">
                  <div className="bg-green-500 h-2 rounded-full" style={{width: `${(dashboardData.patientSatisfaction || 0)}%`}}></div>
                </div>
                <span className="text-sm font-medium">{(dashboardData.patientSatisfaction || 0)}%</span>
              </div>
            </div>
            
            <div className="flex items-center justify-between">
              <span className="text-gray-600">Treatment Success Rate</span>
              <div className="flex items-center">
                <div className="w-24 bg-gray-200 rounded-full h-2 mr-3">
                  <div className="bg-blue-500 h-2 rounded-full" style={{width: `${(dashboardData.successRate || 0)}%`}}></div>
                </div>
                <span className="text-sm font-medium">{(dashboardData.successRate || 0)}%</span>
              </div>
            </div>
            
            <div className="flex items-center justify-between">
              <span className="text-gray-600">Appointment Completion</span>
              <div className="flex items-center">
                <div className="w-24 bg-gray-200 rounded-full h-2 mr-3">
                  <div className="bg-purple-500 h-2 rounded-full" style={{width: `${(dashboardData.completionRate || 0)}%`}}></div>
                </div>
                <span className="text-sm font-medium">{(dashboardData.completionRate || 0)}%</span>
              </div>
            </div>
          </div>
        </div>

        {/* Recent Reviews */}
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Reviews</h3>
          <div className="space-y-3">
            {Array.isArray(dashboardData.recentReviews) && dashboardData.recentReviews.length > 0 ? (
              dashboardData.recentReviews.slice(0, 3).map((review, index) => (
                <div key={index} className="border-l-4 border-yellow-400 pl-3">
                  <div className="flex items-center mb-1">
                    <div className="flex text-yellow-400">
                      {[...Array(5)].map((_, i) => (
                        <Star key={i} className={`h-3 w-3 ${i < review.rating ? 'fill-current' : ''}`} />
                      ))}
                    </div>
                    <span className="text-xs text-gray-500 ml-2">{review.rating}/5</span>
                  </div>
                  <p className="text-sm text-gray-700 line-clamp-2">{review.comment}</p>
                  <p className="text-xs text-gray-500 mt-1">- {review.patientName}</p>
                </div>
              ))
            ) : (
              <p className="text-gray-500 text-center py-4">No reviews yet</p>
            )}
          </div>
        </div>

        {/* Notifications */}
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Notifications</h3>
          <div className="space-y-3">
            {(Array.isArray(notifications) ? notifications : []).slice(0, 4).map((notification, index) => (
              <div key={index} className="flex items-start space-x-3 p-2 bg-gray-50 rounded">
                <div className={`p-1 rounded-full ${
                  notification.type === 'appointment' ? 'bg-blue-100' :
                  notification.type === 'review' ? 'bg-yellow-100' :
                  notification.type === 'payment' ? 'bg-green-100' :
                  'bg-gray-100'
                }`}>
                  {notification.type === 'appointment' ? <Calendar className="h-3 w-3 text-blue-600" /> :
                   notification.type === 'review' ? <Star className="h-3 w-3 text-yellow-600" /> :
                   notification.type === 'payment' ? <DollarSign className="h-3 w-3 text-green-600" /> :
                   <Bell className="h-3 w-3 text-gray-600" />}
                </div>
                <div className="flex-1">
                  <p className="text-sm text-gray-900">{notification.title}</p>
                  <p className="text-xs text-gray-500">{notification.message}</p>
                  <p className="text-xs text-gray-400 mt-1">
                    {new Date(notification.createdAt).toLocaleString()}
                  </p>
                </div>
              </div>
            ))}
            {(!Array.isArray(notifications) || notifications.length === 0) && (
              <p className="text-gray-500 text-center py-4">No new notifications</p>
            )}
          </div>
        </div>
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Appointment Trends</h3>
          <div className="h-64 flex items-center justify-center bg-gray-50 rounded-md">
            <div className="text-center">
              <BarChart3 className="h-16 w-16 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500">Chart visualization</p>
              <p className="text-sm text-gray-400">Integration with charting library needed</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Revenue Distribution</h3>
          <div className="h-64 flex items-center justify-center bg-gray-50 rounded-md">
            <div className="text-center">
              <PieChart className="h-16 w-16 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500">Chart visualization</p>
              <p className="text-sm text-gray-400">Integration with charting library needed</p>
            </div>
          </div>
        </div>
      </div>
      </div>
    </div>
  );
};

export default EnhancedPractitionerDashboard;

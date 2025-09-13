import React, { useState, useEffect } from 'react';
import { 
  FileText, Calendar, Clock, User, CheckCircle, XCircle,
  Play, Pause, RotateCcw, Target, Award, TrendingUp,
  Heart, Activity, Utensils, Moon, Droplets, Thermometer,
  Eye, Download, Share2, MessageSquare, AlertCircle,
  ChevronRight, Plus, RefreshCw, Filter, Search
} from 'lucide-react';
import api from '../../utils/api';
import toast from 'react-hot-toast';

const PatientTherapyPlans = () => {
  const [therapyPlans, setTherapyPlans] = useState([]);
  const [selectedPlan, setSelectedPlan] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');
  const [progressData, setProgressData] = useState({});
  const [filterStatus, setFilterStatus] = useState('all');

  const tabs = [
    { id: 'overview', name: 'Overview', icon: FileText },
    { id: 'sessions', name: 'Sessions', icon: Calendar },
    { id: 'diet', name: 'Diet Plan', icon: Utensils },
    { id: 'lifestyle', name: 'Lifestyle', icon: Heart },
    { id: 'progress', name: 'Progress', icon: TrendingUp }
  ];

  useEffect(() => {
    fetchTherapyPlans();
  }, [filterStatus]);

  useEffect(() => {
    if (selectedPlan) {
      fetchProgressData(selectedPlan._id);
    }
  }, [selectedPlan]);

  const fetchTherapyPlans = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (filterStatus !== 'all') params.append('status', filterStatus);

      const response = await api.get(`/patient/therapy-plans?${params}`);
      const plans = Array.isArray(response.data) ? response.data : [];
      setTherapyPlans(plans);
      if (plans.length > 0 && !selectedPlan) {
        setSelectedPlan(plans[0]);
      }
    } catch (error) {
      console.error('Error fetching therapy plans:', error);
      setTherapyPlans([]);
      toast.error('Error loading therapy plans');
    } finally {
      setLoading(false);
    }
  };

  const fetchProgressData = async (planId) => {
    try {
      const response = await api.get(`/patient/therapy-plans/${planId}/progress`);
      setProgressData(response.data);
    } catch (error) {
      console.error('Error fetching progress data:', error);
    }
  };

  const markSessionComplete = async (sessionId) => {
    try {
      await api.patch(`/patient/therapy-sessions/${sessionId}/complete`);
      fetchTherapyPlans();
      if (selectedPlan) {
        fetchProgressData(selectedPlan._id);
      }
      toast.success('Session marked as complete');
    } catch (error) {
      console.error('Error marking session complete:', error);
      toast.error('Error updating session');
    }
  };

  const updateDietCompliance = async (itemId, completed) => {
    try {
      await api.patch(`/patient/diet-items/${itemId}`, { completed });
      fetchProgressData(selectedPlan._id);
      toast.success('Diet compliance updated');
    } catch (error) {
      console.error('Error updating diet compliance:', error);
      toast.error('Error updating diet');
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'active':
        return 'bg-green-100 text-green-800';
      case 'completed':
        return 'bg-blue-100 text-blue-800';
      case 'paused':
        return 'bg-yellow-100 text-yellow-800';
      case 'cancelled':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getPlanProgress = (plan) => {
    if (!plan.sessions || plan.sessions.length === 0) return 0;
    const completedSessions = plan.sessions.filter(session => session.status === 'completed').length;
    return Math.round((completedSessions / plan.sessions.length) * 100);
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
          <h1 className="text-3xl font-bold text-gray-900">My Therapy Plans</h1>
          <p className="text-gray-600">Track your treatment progress and follow your personalized plan</p>
        </div>
        <div className="flex items-center space-x-3">
          <button
            onClick={fetchTherapyPlans}
            className="flex items-center px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700"
          >
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </button>
          <button className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700">
            <Download className="h-4 w-4 mr-2" />
            Export Plan
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Plans Sidebar */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-lg shadow">
            <div className="p-4 border-b border-gray-200">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-lg font-semibold text-gray-900">Therapy Plans</h3>
                <Filter className="h-5 w-5 text-gray-400" />
              </div>
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 text-sm"
              >
                <option value="all">All Plans</option>
                <option value="active">Active</option>
                <option value="completed">Completed</option>
                <option value="paused">Paused</option>
              </select>
            </div>
            
            <div className="divide-y divide-gray-200">
              {therapyPlans.length > 0 ? (
                therapyPlans.map((plan) => (
                  <button
                    key={plan._id}
                    onClick={() => setSelectedPlan(plan)}
                    className={`w-full p-4 text-left hover:bg-gray-50 ${
                      selectedPlan?._id === plan._id ? 'bg-green-50 border-r-4 border-r-green-500' : ''
                    }`}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="font-medium text-gray-900 text-sm">{plan.name}</h4>
                      <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(plan.status)}`}>
                        {plan.status}
                      </span>
                    </div>
                    
                    <p className="text-xs text-gray-600 mb-2">
                      Dr. {plan.practitioner?.name}
                    </p>
                    
                    <div className="flex items-center justify-between text-xs text-gray-500">
                      <span>{plan.sessions?.length || 0} sessions</span>
                      <span>{getPlanProgress(plan)}% complete</span>
                    </div>
                    
                    <div className="w-full bg-gray-200 rounded-full h-1 mt-2">
                      <div
                        className="bg-green-600 h-1 rounded-full"
                        style={{ width: `${getPlanProgress(plan)}%` }}
                      ></div>
                    </div>
                  </button>
                ))
              ) : (
                <div className="p-8 text-center">
                  <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-500">No therapy plans found</p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Plan Details */}
        <div className="lg:col-span-3">
          {selectedPlan ? (
            <div className="bg-white rounded-lg shadow">
              {/* Plan Header */}
              <div className="p-6 border-b border-gray-200">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h2 className="text-2xl font-bold text-gray-900">{selectedPlan.name}</h2>
                    <p className="text-gray-600">Created by Dr. {selectedPlan.practitioner?.name}</p>
                  </div>
                  <div className="flex items-center space-x-2">
                    <button className="p-2 text-gray-600 hover:bg-gray-100 rounded-full" title="Share Plan">
                      <Share2 className="h-5 w-5" />
                    </button>
                    <button className="p-2 text-gray-600 hover:bg-gray-100 rounded-full" title="Message Practitioner">
                      <MessageSquare className="h-5 w-5" />
                    </button>
                  </div>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  <div className="bg-blue-50 p-4 rounded-lg">
                    <div className="flex items-center">
                      <Calendar className="h-6 w-6 text-blue-600 mr-3" />
                      <div>
                        <p className="text-sm font-medium text-blue-900">Duration</p>
                        <p className="text-lg font-bold text-blue-600">{selectedPlan.duration} days</p>
                      </div>
                    </div>
                  </div>
                  
                  <div className="bg-green-50 p-4 rounded-lg">
                    <div className="flex items-center">
                      <Target className="h-6 w-6 text-green-600 mr-3" />
                      <div>
                        <p className="text-sm font-medium text-green-900">Progress</p>
                        <p className="text-lg font-bold text-green-600">{getPlanProgress(selectedPlan)}%</p>
                      </div>
                    </div>
                  </div>
                  
                  <div className="bg-purple-50 p-4 rounded-lg">
                    <div className="flex items-center">
                      <Clock className="h-6 w-6 text-purple-600 mr-3" />
                      <div>
                        <p className="text-sm font-medium text-purple-900">Sessions</p>
                        <p className="text-lg font-bold text-purple-600">{selectedPlan.sessions?.length || 0}</p>
                      </div>
                    </div>
                  </div>
                  
                  <div className="bg-orange-50 p-4 rounded-lg">
                    <div className="flex items-center">
                      <Award className="h-6 w-6 text-orange-600 mr-3" />
                      <div>
                        <p className="text-sm font-medium text-orange-900">Status</p>
                        <p className="text-lg font-bold text-orange-600 capitalize">{selectedPlan.status}</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Tab Navigation */}
              <div className="border-b border-gray-200">
                <nav className="flex space-x-8 px-6">
                  {tabs.map((tab) => (
                    <button
                      key={tab.id}
                      onClick={() => setActiveTab(tab.id)}
                      className={`flex items-center py-4 px-1 border-b-2 font-medium text-sm ${
                        activeTab === tab.id
                          ? 'border-green-500 text-green-600'
                          : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                      }`}
                    >
                      <tab.icon className="h-5 w-5 mr-2" />
                      {tab.name}
                    </button>
                  ))}
                </nav>
              </div>

              {/* Tab Content */}
              <div className="p-6">
                {/* Overview Tab */}
                {activeTab === 'overview' && (
                  <div className="space-y-6">
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 mb-3">Plan Description</h3>
                      <p className="text-gray-700">{selectedPlan.description || 'No description available'}</p>
                    </div>
                    
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 mb-3">Treatment Goals</h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {selectedPlan.goals?.map((goal, index) => (
                          <div key={index} className="flex items-center p-3 bg-gray-50 rounded-lg">
                            <Target className="h-5 w-5 text-green-600 mr-3" />
                            <span className="text-gray-700">{goal}</span>
                          </div>
                        )) || <p className="text-gray-500">No goals specified</p>}
                      </div>
                    </div>
                    
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 mb-3">Key Recommendations</h3>
                      <div className="space-y-2">
                        {selectedPlan.recommendations?.map((rec, index) => (
                          <div key={index} className="flex items-start p-3 bg-blue-50 rounded-lg">
                            <CheckCircle className="h-5 w-5 text-blue-600 mr-3 mt-0.5" />
                            <span className="text-gray-700">{rec}</span>
                          </div>
                        )) || <p className="text-gray-500">No recommendations available</p>}
                      </div>
                    </div>
                  </div>
                )}

                {/* Sessions Tab */}
                {activeTab === 'sessions' && (
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <h3 className="text-lg font-semibold text-gray-900">Therapy Sessions</h3>
                      <span className="text-sm text-gray-600">
                        {selectedPlan.sessions?.filter(s => s.status === 'completed').length || 0} of {selectedPlan.sessions?.length || 0} completed
                      </span>
                    </div>
                    
                    <div className="space-y-3">
                      {selectedPlan.sessions?.map((session, index) => (
                        <div key={session._id} className="border border-gray-200 rounded-lg p-4">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-4">
                              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                                session.status === 'completed' ? 'bg-green-100 text-green-800' :
                                session.status === 'in-progress' ? 'bg-blue-100 text-blue-800' :
                                'bg-gray-100 text-gray-800'
                              }`}>
                                {index + 1}
                              </div>
                              
                              <div>
                                <h4 className="font-medium text-gray-900">{session.name}</h4>
                                <div className="flex items-center space-x-4 text-sm text-gray-600">
                                  <span className="flex items-center">
                                    <Calendar className="h-4 w-4 mr-1" />
                                    {new Date(session.scheduledDate).toLocaleDateString()}
                                  </span>
                                  <span className="flex items-center">
                                    <Clock className="h-4 w-4 mr-1" />
                                    {session.duration} min
                                  </span>
                                  <span className="flex items-center">
                                    <Activity className="h-4 w-4 mr-1" />
                                    {session.type}
                                  </span>
                                </div>
                              </div>
                            </div>
                            
                            <div className="flex items-center space-x-2">
                              <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                                session.status === 'completed' ? 'bg-green-100 text-green-800' :
                                session.status === 'in-progress' ? 'bg-blue-100 text-blue-800' :
                                session.status === 'scheduled' ? 'bg-yellow-100 text-yellow-800' :
                                'bg-gray-100 text-gray-800'
                              }`}>
                                {session.status}
                              </span>
                              
                              {session.status === 'scheduled' && (
                                <button
                                  onClick={() => markSessionComplete(session._id)}
                                  className="p-1 text-green-600 hover:bg-green-100 rounded"
                                  title="Mark as Complete"
                                >
                                  <CheckCircle className="h-4 w-4" />
                                </button>
                              )}
                            </div>
                          </div>
                          
                          {session.description && (
                            <p className="mt-2 text-sm text-gray-600 ml-12">{session.description}</p>
                          )}
                          
                          {session.notes && session.status === 'completed' && (
                            <div className="mt-2 ml-12 p-2 bg-gray-50 rounded text-sm text-gray-600">
                              <strong>Session Notes:</strong> {session.notes}
                            </div>
                          )}
                        </div>
                      )) || (
                        <p className="text-gray-500 text-center py-8">No sessions scheduled</p>
                      )}
                    </div>
                  </div>
                )}

                {/* Diet Plan Tab */}
                {activeTab === 'diet' && (
                  <div className="space-y-6">
                    <div className="flex items-center justify-between">
                      <h3 className="text-lg font-semibold text-gray-900">Dietary Recommendations</h3>
                      <span className="text-sm text-gray-600">
                        Track your daily nutrition compliance
                      </span>
                    </div>
                    
                    {selectedPlan.dietPlan?.map((category, index) => (
                      <div key={index} className="border border-gray-200 rounded-lg p-4">
                        <h4 className="font-medium text-gray-900 mb-3 flex items-center">
                          <Utensils className="h-5 w-5 mr-2 text-orange-600" />
                          {category.category}
                        </h4>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                          {category.items?.map((item, itemIndex) => (
                            <div key={itemIndex} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                              <div className="flex items-center">
                                <input
                                  type="checkbox"
                                  checked={progressData.dietCompliance?.[item._id] || false}
                                  onChange={(e) => updateDietCompliance(item._id, e.target.checked)}
                                  className="rounded border-gray-300 text-green-600 focus:ring-green-500 mr-3"
                                />
                                <div>
                                  <span className="text-gray-900">{item.name}</span>
                                  {item.quantity && (
                                    <span className="text-sm text-gray-600 ml-2">({item.quantity})</span>
                                  )}
                                </div>
                              </div>
                              
                              {item.timing && (
                                <span className="text-xs text-gray-500 bg-white px-2 py-1 rounded">
                                  {item.timing}
                                </span>
                              )}
                            </div>
                          )) || <p className="text-gray-500">No items specified</p>}
                        </div>
                        
                        {category.instructions && (
                          <div className="mt-3 p-3 bg-blue-50 rounded-lg">
                            <p className="text-sm text-blue-800">
                              <strong>Instructions:</strong> {category.instructions}
                            </p>
                          </div>
                        )}
                      </div>
                    )) || (
                      <div className="text-center py-8">
                        <Utensils className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                        <p className="text-gray-500">No diet plan specified</p>
                      </div>
                    )}
                  </div>
                )}

                {/* Lifestyle Tab */}
                {activeTab === 'lifestyle' && (
                  <div className="space-y-6">
                    <h3 className="text-lg font-semibold text-gray-900">Lifestyle Recommendations</h3>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      {selectedPlan.lifestyleRecommendations?.map((rec, index) => (
                        <div key={index} className="border border-gray-200 rounded-lg p-4">
                          <div className="flex items-center mb-3">
                            {rec.category === 'exercise' && <Activity className="h-6 w-6 text-red-600 mr-3" />}
                            {rec.category === 'sleep' && <Moon className="h-6 w-6 text-indigo-600 mr-3" />}
                            {rec.category === 'stress' && <Heart className="h-6 w-6 text-pink-600 mr-3" />}
                            {rec.category === 'hydration' && <Droplets className="h-6 w-6 text-blue-600 mr-3" />}
                            <h4 className="font-medium text-gray-900 capitalize">{rec.category}</h4>
                          </div>
                          
                          <p className="text-gray-700 mb-3">{rec.description}</p>
                          
                          {rec.frequency && (
                            <div className="text-sm text-gray-600 bg-gray-50 p-2 rounded">
                              <strong>Frequency:</strong> {rec.frequency}
                            </div>
                          )}
                          
                          <div className="mt-3 flex items-center justify-between">
                            <label className="flex items-center">
                              <input
                                type="checkbox"
                                checked={progressData.lifestyleCompliance?.[rec._id] || false}
                                onChange={(e) => updateLifestyleCompliance(rec._id, e.target.checked)}
                                className="rounded border-gray-300 text-green-600 focus:ring-green-500 mr-2"
                              />
                              <span className="text-sm text-gray-700">Completed today</span>
                            </label>
                          </div>
                        </div>
                      )) || (
                        <div className="col-span-2 text-center py-8">
                          <Heart className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                          <p className="text-gray-500">No lifestyle recommendations specified</p>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* Progress Tab */}
                {activeTab === 'progress' && (
                  <div className="space-y-6">
                    <h3 className="text-lg font-semibold text-gray-900">Treatment Progress</h3>
                    
                    {/* Progress Overview */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                      <div className="bg-green-50 p-6 rounded-lg">
                        <div className="flex items-center">
                          <CheckCircle className="h-8 w-8 text-green-600 mr-4" />
                          <div>
                            <p className="text-sm font-medium text-green-900">Sessions Completed</p>
                            <p className="text-2xl font-bold text-green-600">
                              {selectedPlan.sessions?.filter(s => s.status === 'completed').length || 0}
                            </p>
                          </div>
                        </div>
                      </div>
                      
                      <div className="bg-blue-50 p-6 rounded-lg">
                        <div className="flex items-center">
                          <TrendingUp className="h-8 w-8 text-blue-600 mr-4" />
                          <div>
                            <p className="text-sm font-medium text-blue-900">Overall Progress</p>
                            <p className="text-2xl font-bold text-blue-600">{getPlanProgress(selectedPlan)}%</p>
                          </div>
                        </div>
                      </div>
                      
                      <div className="bg-purple-50 p-6 rounded-lg">
                        <div className="flex items-center">
                          <Award className="h-8 w-8 text-purple-600 mr-4" />
                          <div>
                            <p className="text-sm font-medium text-purple-900">Compliance Score</p>
                            <p className="text-2xl font-bold text-purple-600">{progressData.complianceScore || 0}%</p>
                          </div>
                        </div>
                      </div>
                    </div>
                    
                    {/* Progress Chart Placeholder */}
                    <div className="border border-gray-200 rounded-lg p-6">
                      <h4 className="font-medium text-gray-900 mb-4">Progress Over Time</h4>
                      <div className="h-64 flex items-center justify-center border-2 border-dashed border-gray-300 rounded-lg">
                        <div className="text-center">
                          <TrendingUp className="h-12 w-12 text-gray-400 mx-auto mb-2" />
                          <p className="text-gray-500">Progress chart placeholder</p>
                          <p className="text-sm text-gray-400">Integration with charting library needed</p>
                        </div>
                      </div>
                    </div>
                    
                    {/* Health Metrics */}
                    <div className="border border-gray-200 rounded-lg p-6">
                      <h4 className="font-medium text-gray-900 mb-4">Health Metrics Tracking</h4>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {progressData.healthMetrics?.map((metric, index) => (
                          <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                            <div className="flex items-center">
                              {metric.type === 'weight' && <Thermometer className="h-5 w-5 text-blue-600 mr-3" />}
                              {metric.type === 'bp' && <Heart className="h-5 w-5 text-red-600 mr-3" />}
                              {metric.type === 'energy' && <Activity className="h-5 w-5 text-green-600 mr-3" />}
                              <span className="font-medium text-gray-900">{metric.name}</span>
                            </div>
                            <div className="text-right">
                              <span className="text-lg font-bold text-gray-900">{metric.value}</span>
                              <p className="text-xs text-gray-500">{metric.unit}</p>
                            </div>
                          </div>
                        )) || (
                          <div className="col-span-2 text-center py-8">
                            <Activity className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                            <p className="text-gray-500">No health metrics tracked yet</p>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div className="bg-white rounded-lg shadow p-12 text-center">
              <FileText className="h-16 w-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No Therapy Plan Selected</h3>
              <p className="text-gray-500">Select a therapy plan from the sidebar to view details</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default PatientTherapyPlans;

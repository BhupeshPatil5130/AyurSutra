import React, { useState, useEffect } from 'react';
import { 
  Heart, 
  Calendar, 
  Clock, 
  User, 
  CheckCircle, 
  AlertCircle,
  FileText,
  Utensils,
  Activity,
  Star,
  Eye
} from 'lucide-react';
import api from '../../utils/api';
import toast from 'react-hot-toast';

const TherapyPlans = () => {
  const [therapyPlans, setTherapyPlans] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedPlan, setSelectedPlan] = useState(null);
  const [showPlanDetails, setShowPlanDetails] = useState(false);

  useEffect(() => {
    fetchTherapyPlans();
  }, []);

  const fetchTherapyPlans = async () => {
    try {
      const response = await api.get('/patient/therapy-plans');
      setTherapyPlans(response.data);
    } catch (error) {
      console.error('Error fetching therapy plans:', error);
      toast.error('Error fetching therapy plans');
    } finally {
      setLoading(false);
    }
  };

  const fetchPlanDetails = async (planId) => {
    try {
      const response = await api.get(`/patient/therapy-plans/${planId}`);
      setSelectedPlan(response.data);
      setShowPlanDetails(true);
    } catch (error) {
      console.error('Error fetching plan details:', error);
      toast.error('Error fetching plan details');
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'active': return 'text-green-700 bg-green-100';
      case 'completed': return 'text-blue-700 bg-blue-100';
      case 'paused': return 'text-yellow-700 bg-yellow-100';
      case 'cancelled': return 'text-red-700 bg-red-100';
      default: return 'text-gray-700 bg-gray-100';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'active': return <Activity className="h-4 w-4" />;
      case 'completed': return <CheckCircle className="h-4 w-4" />;
      case 'paused': return <AlertCircle className="h-4 w-4" />;
      case 'cancelled': return <AlertCircle className="h-4 w-4" />;
      default: return <Clock className="h-4 w-4" />;
    }
  };

  const calculateProgress = (plan) => {
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
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">My Therapy Plans</h1>
          <p className="text-gray-600">View your personalized Panchakarma treatment plans</p>
        </div>
      </div>

      {/* Therapy Plans Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {therapyPlans.map((plan) => {
          const progress = calculateProgress(plan);
          return (
            <div key={plan._id} className="bg-white rounded-lg shadow hover:shadow-md transition-shadow p-6">
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center">
                  <Heart className="h-6 w-6 text-purple-500 mr-2" />
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">{plan.title}</h3>
                    <p className="text-sm text-gray-600">{plan.therapyType}</p>
                  </div>
                </div>
                <span className={`inline-flex items-center px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(plan.status)}`}>
                  {getStatusIcon(plan.status)}
                  <span className="ml-1">{plan.status}</span>
                </span>
              </div>

              <div className="space-y-3">
                <div className="flex items-center text-sm text-gray-600">
                  <User className="h-4 w-4 mr-2" />
                  Dr. {plan.practitionerId?.userId?.firstName} {plan.practitionerId?.userId?.lastName}
                </div>
                
                <div className="flex items-center text-sm text-gray-600">
                  <Calendar className="h-4 w-4 mr-2" />
                  {new Date(plan.startDate).toLocaleDateString()} ({plan.duration} days)
                </div>
                
                <div className="flex items-center text-sm text-gray-600">
                  <Clock className="h-4 w-4 mr-2" />
                  {plan.sessions?.length || 0} sessions planned
                </div>

                <p className="text-sm text-gray-700 line-clamp-2">{plan.description}</p>
                
                {/* Progress Bar */}
                <div className="mt-4">
                  <div className="flex justify-between items-center mb-1">
                    <span className="text-sm font-medium text-gray-700">Progress</span>
                    <span className="text-sm text-gray-500">{progress}%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-green-500 h-2 rounded-full transition-all duration-300"
                      style={{ width: `${progress}%` }}
                    />
                  </div>
                </div>

                <div className="text-sm font-medium text-gray-900 mt-3">
                  Total Cost: ₹{plan.totalCost}
                </div>
              </div>

              <div className="flex justify-end mt-4">
                <button
                  onClick={() => fetchPlanDetails(plan._id)}
                  className="flex items-center px-3 py-1 text-sm bg-blue-100 text-blue-700 rounded-md hover:bg-blue-200"
                >
                  <Eye className="h-4 w-4 mr-1" />
                  View Details
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {therapyPlans.length === 0 && (
        <div className="text-center py-8">
          <Heart className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-500">No therapy plans assigned yet</p>
          <p className="text-sm text-gray-400 mt-2">Contact your practitioner to create a personalized treatment plan</p>
        </div>
      )}

      {/* Plan Details Modal */}
      {showPlanDetails && selectedPlan && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 overflow-y-auto">
          <div className="bg-white rounded-lg p-6 w-full max-w-4xl max-h-screen overflow-y-auto m-4">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-semibold text-gray-900">Therapy Plan Details</h3>
              <button
                onClick={() => setShowPlanDetails(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                ×
              </button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Plan Overview */}
              <div className="lg:col-span-1">
                <div className="bg-gray-50 rounded-lg p-4">
                  <h4 className="font-medium text-gray-900 mb-3">Plan Overview</h4>
                  <div className="space-y-3">
                    <div>
                      <span className="text-sm text-gray-600">Title:</span>
                      <p className="font-medium">{selectedPlan.title}</p>
                    </div>
                    <div>
                      <span className="text-sm text-gray-600">Therapy Type:</span>
                      <p className="font-medium">{selectedPlan.therapyType}</p>
                    </div>
                    <div>
                      <span className="text-sm text-gray-600">Duration:</span>
                      <p className="font-medium">{selectedPlan.duration} days</p>
                    </div>
                    <div>
                      <span className="text-sm text-gray-600">Start Date:</span>
                      <p className="font-medium">{new Date(selectedPlan.startDate).toLocaleDateString()}</p>
                    </div>
                    <div>
                      <span className="text-sm text-gray-600">Status:</span>
                      <span className={`inline-flex items-center px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(selectedPlan.status)}`}>
                        {getStatusIcon(selectedPlan.status)}
                        <span className="ml-1">{selectedPlan.status}</span>
                      </span>
                    </div>
                    <div>
                      <span className="text-sm text-gray-600">Total Cost:</span>
                      <p className="font-medium">₹{selectedPlan.totalCost}</p>
                    </div>
                  </div>
                </div>

                {/* Practitioner Info */}
                <div className="bg-gray-50 rounded-lg p-4 mt-4">
                  <h4 className="font-medium text-gray-900 mb-3">Your Practitioner</h4>
                  <div className="flex items-center">
                    <div className="w-10 h-10 bg-gradient-to-r from-green-400 to-blue-500 rounded-full flex items-center justify-center text-white font-semibold">
                      {selectedPlan.practitionerId?.userId?.firstName?.charAt(0)}
                      {selectedPlan.practitionerId?.userId?.lastName?.charAt(0)}
                    </div>
                    <div className="ml-3">
                      <p className="font-medium text-gray-900">
                        Dr. {selectedPlan.practitionerId?.userId?.firstName} {selectedPlan.practitionerId?.userId?.lastName}
                      </p>
                      <p className="text-sm text-gray-600">{selectedPlan.practitionerId?.specializations?.[0]}</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Plan Details */}
              <div className="lg:col-span-2 space-y-6">
                {/* Description */}
                <div className="bg-gray-50 rounded-lg p-4">
                  <h4 className="font-medium text-gray-900 mb-3">Description</h4>
                  <p className="text-gray-700">{selectedPlan.description}</p>
                </div>

                {/* Sessions */}
                <div className="bg-gray-50 rounded-lg p-4">
                  <h4 className="font-medium text-gray-900 mb-3">
                    Sessions ({selectedPlan.sessions?.length || 0})
                  </h4>
                  {selectedPlan.sessions?.length > 0 ? (
                    <div className="space-y-3 max-h-60 overflow-y-auto">
                      {selectedPlan.sessions.map((session, index) => (
                        <div key={index} className="bg-white border border-gray-200 rounded-md p-3">
                          <div className="flex items-center justify-between mb-2">
                            <span className="font-medium">Session {session.sessionNumber}</span>
                            <span className={`px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(session.status)}`}>
                              {session.status}
                            </span>
                          </div>
                          <div className="grid grid-cols-2 gap-2 text-sm text-gray-600">
                            {session.date && (
                              <div>Date: {new Date(session.date).toLocaleDateString()}</div>
                            )}
                            <div>Duration: {session.duration} min</div>
                          </div>
                          {session.therapyDetails && (
                            <p className="text-sm text-gray-700 mt-2">{session.therapyDetails}</p>
                          )}
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-gray-500 text-sm">No sessions scheduled yet</p>
                  )}
                </div>

                {/* Diet Plan */}
                {selectedPlan.dietPlan && (
                  <div className="bg-gray-50 rounded-lg p-4">
                    <h4 className="font-medium text-gray-900 mb-3 flex items-center">
                      <Utensils className="h-5 w-5 mr-2" />
                      Diet Plan
                    </h4>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      {['breakfast', 'lunch', 'dinner'].map(mealType => (
                        <div key={mealType}>
                          <h5 className="font-medium text-gray-800 capitalize mb-2">{mealType}</h5>
                          {selectedPlan.dietPlan[mealType]?.length > 0 ? (
                            <div className="space-y-1">
                              {selectedPlan.dietPlan[mealType].map((item, index) => (
                                <div key={index} className="text-sm text-gray-700 bg-white px-2 py-1 rounded">
                                  {item}
                                </div>
                              ))}
                            </div>
                          ) : (
                            <p className="text-sm text-gray-500">No items specified</p>
                          )}
                        </div>
                      ))}
                    </div>
                    
                    {selectedPlan.dietPlan.restrictions?.length > 0 && (
                      <div className="mt-4">
                        <h5 className="font-medium text-gray-800 mb-2">Dietary Restrictions</h5>
                        <div className="flex flex-wrap gap-2">
                          {selectedPlan.dietPlan.restrictions.map((restriction, index) => (
                            <span key={index} className="px-2 py-1 text-xs bg-red-100 text-red-700 rounded-full">
                              {restriction}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                    
                    {selectedPlan.dietPlan.supplements?.length > 0 && (
                      <div className="mt-4">
                        <h5 className="font-medium text-gray-800 mb-2">Supplements</h5>
                        <div className="flex flex-wrap gap-2">
                          {selectedPlan.dietPlan.supplements.map((supplement, index) => (
                            <span key={index} className="px-2 py-1 text-xs bg-green-100 text-green-700 rounded-full">
                              {supplement}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {/* Lifestyle Recommendations */}
                {selectedPlan.lifestyleRecommendations?.length > 0 && (
                  <div className="bg-gray-50 rounded-lg p-4">
                    <h4 className="font-medium text-gray-900 mb-3 flex items-center">
                      <Activity className="h-5 w-5 mr-2" />
                      Lifestyle Recommendations
                    </h4>
                    <div className="space-y-2">
                      {selectedPlan.lifestyleRecommendations.map((recommendation, index) => (
                        <div key={index} className="flex items-start">
                          <CheckCircle className="h-4 w-4 text-green-500 mr-2 mt-0.5 flex-shrink-0" />
                          <span className="text-sm text-gray-700">{recommendation}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>

            <div className="flex justify-end mt-6">
              <button
                onClick={() => setShowPlanDetails(false)}
                className="px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TherapyPlans;

import React, { useState, useEffect } from 'react';
import { 
  Heart, 
  Plus, 
  Search, 
  Edit, 
  Eye, 
  Trash2,
  Calendar,
  User,
  Clock,
  CheckCircle,
  AlertCircle
} from 'lucide-react';
import api from '../../utils/api';


const TherapyPlanManagement = () => {
  const [therapyPlans, setTherapyPlans] = useState([]);
  const [patients, setPatients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [editingPlan, setEditingPlan] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  const [formData, setFormData] = useState({
    patientId: '',
    title: '',
    description: '',
    therapyType: 'Panchakarma',
    duration: 21,
    startDate: new Date().toISOString().split('T')[0],
    sessions: [],
    dietPlan: {
      breakfast: [],
      lunch: [],
      dinner: [],
      restrictions: [],
      supplements: []
    },
    lifestyleRecommendations: [],
    totalCost: 0
  });

  const therapyTypes = [
    'Vamana', 'Virechana', 'Basti', 'Nasya', 'Raktamokshana', 
    'Abhyanga', 'Shirodhara', 'Panchakarma'
  ];

  useEffect(() => {
    fetchTherapyPlans();
    fetchPatients();
  }, [statusFilter]);

  const fetchTherapyPlans = async () => {
    try {
      const params = new URLSearchParams();
      if (statusFilter !== 'all') {
        params.append('status', statusFilter);
      }

      const response = await api.get(`/practitioner/therapy-plans?${params}`);
      setTherapyPlans(Array.isArray(response.data.therapyPlans) ? response.data.therapyPlans : []);
    } catch (error) {
      console.error('Error fetching therapy plans:', error);
      setTherapyPlans([]);
    } finally {
      setLoading(false);
    }
  };

  const fetchPatients = async () => {
    try {
      const response = await api.get('/practitioner/patients');
      setPatients(Array.isArray(response.data) ? response.data : []);
    } catch (error) {
      console.error('Error fetching patients:', error);
      setPatients([]);
    }
  };

  const handleCreatePlan = async () => {
    try {
      await api.post('/practitioner/therapy-plans', formData);
      
      setShowCreateModal(false);
      resetForm();
      fetchTherapyPlans();
    } catch (error) {
      
      console.error('Error:', error);
    }
  };

  const handleUpdatePlan = async () => {
    try {
      await api.put(`/practitioner/therapy-plans/${editingPlan._id}`, formData);
      
      setEditingPlan(null);
      resetForm();
      fetchTherapyPlans();
    } catch (error) {
      
      console.error('Error:', error);
    }
  };

  const resetForm = () => {
    setFormData({
      patientId: '',
      title: '',
      description: '',
      therapyType: 'Panchakarma',
      duration: 21,
      startDate: new Date().toISOString().split('T')[0],
      sessions: [],
      dietPlan: {
        breakfast: [],
        lunch: [],
        dinner: [],
        restrictions: [],
        supplements: []
      },
      lifestyleRecommendations: [],
      totalCost: 0
    });
  };

  const addSession = () => {
    setFormData(prev => ({
      ...prev,
      sessions: [...prev.sessions, {
        sessionNumber: prev.sessions.length + 1,
        date: '',
        duration: 60,
        therapyDetails: '',
        medicines: [],
        instructions: '',
        status: 'scheduled'
      }]
    }));
  };

  const updateSession = (index, field, value) => {
    setFormData(prev => ({
      ...prev,
      sessions: prev.sessions.map((session, i) => 
        i === index ? { ...session, [field]: value } : session
      )
    }));
  };

  const removeSession = (index) => {
    setFormData(prev => ({
      ...prev,
      sessions: prev.sessions.filter((_, i) => i !== index)
    }));
  };

  const addDietItem = (mealType) => {
    const item = prompt(`Add ${mealType} item:`);
    if (item) {
      setFormData(prev => ({
        ...prev,
        dietPlan: {
          ...prev.dietPlan,
          [mealType]: [...prev.dietPlan[mealType], item]
        }
      }));
    }
  };

  const removeDietItem = (mealType, index) => {
    setFormData(prev => ({
      ...prev,
      dietPlan: {
        ...prev.dietPlan,
        [mealType]: prev.dietPlan[mealType].filter((_, i) => i !== index)
      }
    }));
  };

  const addLifestyleRecommendation = () => {
    const recommendation = prompt('Add lifestyle recommendation:');
    if (recommendation) {
      setFormData(prev => ({
        ...prev,
        lifestyleRecommendations: [...prev.lifestyleRecommendations, recommendation]
      }));
    }
  };

  const removeLifestyleRecommendation = (index) => {
    setFormData(prev => ({
      ...prev,
      lifestyleRecommendations: prev.lifestyleRecommendations.filter((_, i) => i !== index)
    }));
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

  const filteredPlans = therapyPlans.filter(plan =>
    plan.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    plan.patientId?.userId?.firstName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    plan.patientId?.userId?.lastName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    plan.therapyType.toLowerCase().includes(searchTerm.toLowerCase())
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
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Therapy Plan Management</h1>
          <p className="text-gray-600">Create and manage personalized treatment plans</p>
        </div>
        <button
          onClick={() => setShowCreateModal(true)}
          className="flex items-center px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700"
        >
          <Plus className="h-5 w-5 mr-2" />
          Create Plan
        </button>
      </div>

      {/* Search and Filter */}
      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search therapy plans..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
              />
            </div>
          </div>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
          >
            <option value="all">All Status</option>
            <option value="active">Active</option>
            <option value="completed">Completed</option>
            <option value="paused">Paused</option>
            <option value="cancelled">Cancelled</option>
          </select>
        </div>
      </div>

      {/* Therapy Plans Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredPlans.map((plan) => (
          <div key={plan._id} className="bg-white rounded-lg shadow p-6">
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center">
                <Heart className="h-6 w-6 text-purple-500 mr-2" />
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">{plan.title}</h3>
                  <p className="text-sm text-gray-600">{plan.therapyType}</p>
                </div>
              </div>
              <span className={`px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(plan.status)}`}>
                {plan.status}
              </span>
            </div>

            <div className="space-y-3">
              <div className="flex items-center text-sm text-gray-600">
                <User className="h-4 w-4 mr-2" />
                {plan.patientId?.userId?.firstName} {plan.patientId?.userId?.lastName}
              </div>
              
              <div className="flex items-center text-sm text-gray-600">
                <Calendar className="h-4 w-4 mr-2" />
                {new Date(plan.startDate).toLocaleDateString()} ({plan.duration} days)
              </div>
              
              <div className="flex items-center text-sm text-gray-600">
                <Clock className="h-4 w-4 mr-2" />
                {plan.sessions?.length || 0} sessions
              </div>

              <p className="text-sm text-gray-700 line-clamp-2">{plan.description}</p>
              
              <div className="text-sm font-medium text-gray-900">
                Total Cost: ₹{plan.totalCost}
              </div>
            </div>

            <div className="flex justify-end space-x-2 mt-4">
              <button
                onClick={() => {
                  setEditingPlan(plan);
                  setFormData({
                    patientId: plan.patientId._id,
                    title: plan.title,
                    description: plan.description,
                    therapyType: plan.therapyType,
                    duration: plan.duration,
                    startDate: plan.startDate.split('T')[0],
                    sessions: plan.sessions || [],
                    dietPlan: plan.dietPlan || {
                      breakfast: [], lunch: [], dinner: [], restrictions: [], supplements: []
                    },
                    lifestyleRecommendations: plan.lifestyleRecommendations || [],
                    totalCost: plan.totalCost
                  });
                  setShowCreateModal(true);
                }}
                className="p-2 text-blue-600 hover:bg-blue-100 rounded-md"
              >
                <Edit className="h-4 w-4" />
              </button>
              <button className="p-2 text-green-600 hover:bg-green-100 rounded-md">
                <Eye className="h-4 w-4" />
              </button>
            </div>
          </div>
        ))}
      </div>

      {filteredPlans.length === 0 && (
        <div className="text-center py-8">
          <Heart className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-500">No therapy plans found</p>
        </div>
      )}

      {/* Create/Edit Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 overflow-y-auto">
          <div className="bg-white rounded-lg p-6 w-full max-w-4xl max-h-screen overflow-y-auto m-4">
            <h3 className="text-lg font-semibold mb-4">
              {editingPlan ? 'Edit Therapy Plan' : 'Create New Therapy Plan'}
            </h3>
            
            <div className="space-y-6">
              {/* Basic Information */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Patient</label>
                  <select
                    value={formData.patientId}
                    onChange={(e) => setFormData(prev => ({ ...prev, patientId: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                    required
                  >
                    <option value="">Select Patient</option>
                    {patients.map(patient => (
                      <option key={patient._id} value={patient._id}>
                        {patient.userId.firstName} {patient.userId.lastName}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Therapy Type</label>
                  <select
                    value={formData.therapyType}
                    onChange={(e) => setFormData(prev => ({ ...prev, therapyType: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                  >
                    {therapyTypes.map(type => (
                      <option key={type} value={type}>{type}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Title</label>
                  <input
                    type="text"
                    value={formData.title}
                    onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Duration (Days)</label>
                  <input
                    type="number"
                    value={formData.duration}
                    onChange={(e) => setFormData(prev => ({ ...prev, duration: parseInt(e.target.value) }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Start Date</label>
                  <input
                    type="date"
                    value={formData.startDate}
                    onChange={(e) => setFormData(prev => ({ ...prev, startDate: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Total Cost (₹)</label>
                  <input
                    type="number"
                    value={formData.totalCost}
                    onChange={(e) => setFormData(prev => ({ ...prev, totalCost: parseInt(e.target.value) }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                  required
                />
              </div>

              {/* Sessions */}
              <div>
                <div className="flex items-center justify-between mb-3">
                  <h4 className="text-md font-medium text-gray-900">Sessions</h4>
                  <button
                    type="button"
                    onClick={addSession}
                    className="flex items-center px-3 py-1 text-sm bg-blue-100 text-blue-700 rounded-md hover:bg-blue-200"
                  >
                    <Plus className="h-4 w-4 mr-1" />
                    Add Session
                  </button>
                </div>
                
                <div className="space-y-3 max-h-60 overflow-y-auto">
                  {formData.sessions.map((session, index) => (
                    <div key={index} className="border border-gray-200 rounded-md p-3">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-medium">Session {session.sessionNumber}</span>
                        <button
                          type="button"
                          onClick={() => removeSession(index)}
                          className="text-red-600 hover:bg-red-100 p-1 rounded"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
                        <input
                          type="date"
                          placeholder="Date"
                          value={session.date}
                          onChange={(e) => updateSession(index, 'date', e.target.value)}
                          className="px-2 py-1 border border-gray-300 rounded text-sm focus:outline-none focus:ring-1 focus:ring-green-500"
                        />
                        <input
                          type="number"
                          placeholder="Duration (min)"
                          value={session.duration}
                          onChange={(e) => updateSession(index, 'duration', parseInt(e.target.value))}
                          className="px-2 py-1 border border-gray-300 rounded text-sm focus:outline-none focus:ring-1 focus:ring-green-500"
                        />
                        <input
                          type="text"
                          placeholder="Therapy Details"
                          value={session.therapyDetails}
                          onChange={(e) => updateSession(index, 'therapyDetails', e.target.value)}
                          className="px-2 py-1 border border-gray-300 rounded text-sm focus:outline-none focus:ring-1 focus:ring-green-500"
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Diet Plan */}
              <div>
                <h4 className="text-md font-medium text-gray-900 mb-3">Diet Plan</h4>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {['breakfast', 'lunch', 'dinner'].map(mealType => (
                    <div key={mealType}>
                      <div className="flex items-center justify-between mb-2">
                        <label className="text-sm font-medium text-gray-700 capitalize">{mealType}</label>
                        <button
                          type="button"
                          onClick={() => addDietItem(mealType)}
                          className="text-xs text-blue-600 hover:text-blue-800"
                        >
                          + Add
                        </button>
                      </div>
                      <div className="space-y-1">
                        {formData.dietPlan[mealType].map((item, index) => (
                          <div key={index} className="flex items-center justify-between bg-gray-50 px-2 py-1 rounded text-sm">
                            <span>{item}</span>
                            <button
                              type="button"
                              onClick={() => removeDietItem(mealType, index)}
                              className="text-red-600 hover:text-red-800"
                            >
                              ×
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Lifestyle Recommendations */}
              <div>
                <div className="flex items-center justify-between mb-3">
                  <h4 className="text-md font-medium text-gray-900">Lifestyle Recommendations</h4>
                  <button
                    type="button"
                    onClick={addLifestyleRecommendation}
                    className="text-sm text-blue-600 hover:text-blue-800"
                  >
                    + Add Recommendation
                  </button>
                </div>
                
                <div className="space-y-2">
                  {formData.lifestyleRecommendations.map((rec, index) => (
                    <div key={index} className="flex items-center justify-between bg-gray-50 px-3 py-2 rounded">
                      <span className="text-sm">{rec}</span>
                      <button
                        type="button"
                        onClick={() => removeLifestyleRecommendation(index)}
                        className="text-red-600 hover:text-red-800"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="flex justify-end space-x-3 mt-6">
              <button
                onClick={() => {
                  setShowCreateModal(false);
                  setEditingPlan(null);
                  resetForm();
                }}
                className="px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={editingPlan ? handleUpdatePlan : handleCreatePlan}
                className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700"
              >
                {editingPlan ? 'Update Plan' : 'Create Plan'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TherapyPlanManagement;

import React, { useState, useEffect } from 'react';
import { 
  Activity, Heart, TrendingUp, Calendar, Target,
  Plus, Edit, Trash2, RefreshCw, Download, Share2,
  Weight, Thermometer, Droplets, Zap, Clock, Award
} from 'lucide-react';
import api from '../../utils/api';


const PatientHealthTracking = () => {
  const [healthData, setHealthData] = useState([]);
  const [goals, setGoals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAddGoal, setShowAddGoal] = useState(false);
  const [selectedMetric, setSelectedMetric] = useState('weight');
  const [timeRange, setTimeRange] = useState('30');

  const [newGoal, setNewGoal] = useState({
    type: 'weight_loss',
    title: '',
    targetValue: '',
    currentValue: '',
    unit: 'kg',
    deadline: '',
    description: ''
  });

  const healthMetrics = [
    { value: 'weight', label: 'Weight', icon: Weight, unit: 'kg', color: 'blue' },
    { value: 'blood_pressure', label: 'Blood Pressure', icon: Heart, unit: 'mmHg', color: 'red' },
    { value: 'temperature', label: 'Temperature', icon: Thermometer, unit: '°F', color: 'orange' },
    { value: 'pulse', label: 'Pulse Rate', icon: Activity, unit: 'bpm', color: 'green' },
    { value: 'oxygen_saturation', label: 'Oxygen Saturation', icon: Droplets, unit: '%', color: 'cyan' },
    { value: 'blood_sugar', label: 'Blood Sugar', icon: Zap, unit: 'mg/dL', color: 'purple' }
  ];

  const goalTypes = [
    { value: 'weight_loss', label: 'Weight Loss', unit: 'kg' },
    { value: 'weight_gain', label: 'Weight Gain', unit: 'kg' },
    { value: 'blood_pressure', label: 'Blood Pressure Control', unit: 'mmHg' },
    { value: 'exercise', label: 'Exercise Goal', unit: 'minutes/day' },
    { value: 'meditation', label: 'Meditation Goal', unit: 'minutes/day' },
    { value: 'sleep', label: 'Sleep Goal', unit: 'hours/night' },
    { value: 'water_intake', label: 'Water Intake', unit: 'liters/day' }
  ];

  useEffect(() => {
    fetchHealthData();
    fetchGoals();
  }, [selectedMetric, timeRange]);

  const fetchHealthData = async () => {
    try {
      setLoading(true);
      const response = await api.get('/patient/health-tracking', {
        params: { metric: selectedMetric, days: timeRange }
      });
      setHealthData(response.data);
    } catch (error) {
      console.error('Error fetching health data:', error);
      
    } finally {
      setLoading(false);
    }
  };

  const fetchGoals = async () => {
    try {
      const response = await api.get('/patient/health-goals');
      setGoals(response.data);
    } catch (error) {
      console.error('Error fetching goals:', error);
    }
  };

  const addGoal = async () => {
    try {
      const response = await api.post('/patient/health-goals', newGoal);
      setGoals(prev => [response.data, ...prev]);
      setShowAddGoal(false);
      setNewGoal({
        type: 'weight_loss',
        title: '',
        targetValue: '',
        currentValue: '',
        unit: 'kg',
        deadline: '',
        description: ''
      });
      
    } catch (error) {
      console.error('Error adding goal:', error);
      
    }
  };

  const updateGoalProgress = async (goalId, progress) => {
    try {
      await api.patch(`/patient/health-goals/${goalId}`, { currentValue: progress });
      setGoals(prev => prev.map(goal => 
        goal._id === goalId ? { ...goal, currentValue: progress } : goal
      ));
      
    } catch (error) {
      console.error('Error updating progress:', error);
      
    }
  };

  const deleteGoal = async (goalId) => {
    if (!window.confirm('Are you sure you want to delete this goal?')) return;

    try {
      await api.delete(`/patient/health-goals/${goalId}`);
      setGoals(prev => prev.filter(goal => goal._id !== goalId));
      
    } catch (error) {
      console.error('Error deleting goal:', error);
      
    }
  };

  const getProgressPercentage = (goal) => {
    if (!goal.targetValue || !goal.currentValue) return 0;
    return Math.min((goal.currentValue / goal.targetValue) * 100, 100);
  };

  const getMetricIcon = (metric) => {
    const metricData = healthMetrics.find(m => m.value === metric);
    return metricData ? <metricData.icon className="h-5 w-5" /> : <Activity className="h-5 w-5" />;
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
          <h1 className="text-3xl font-bold text-gray-900">Health Tracking</h1>
          <p className="text-gray-600">Monitor your health progress and achieve your wellness goals</p>
        </div>
        <div className="flex items-center space-x-3">
          <button
            onClick={() => setShowAddGoal(true)}
            className="flex items-center px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700"
          >
            <Plus className="h-4 w-4 mr-2" />
            Add Goal
          </button>
          <button
            onClick={fetchHealthData}
            className="flex items-center px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700"
          >
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </button>
        </div>
      </div>

      {/* Health Goals Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {goals.map((goal) => (
          <div key={goal._id} className="bg-white p-6 rounded-lg shadow">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center">
                <div className="p-2 bg-green-100 rounded-lg">
                  <Target className="h-6 w-6 text-green-600" />
                </div>
                <div className="ml-3">
                  <h3 className="text-lg font-semibold text-gray-900">{goal.title}</h3>
                  <p className="text-sm text-gray-600">{goal.type.replace('_', ' ').toUpperCase()}</p>
                </div>
              </div>
              <div className="flex items-center space-x-1">
                <button
                  onClick={() => deleteGoal(goal._id)}
                  className="p-1 text-red-600 hover:bg-red-100 rounded"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            </div>

            <div className="mb-4">
              <div className="flex justify-between text-sm text-gray-600 mb-2">
                <span>Progress</span>
                <span>{getProgressPercentage(goal).toFixed(0)}%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div
                  className="bg-green-500 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${getProgressPercentage(goal)}%` }}
                ></div>
              </div>
            </div>

            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-600">Current:</span>
                <span className="font-medium">{goal.currentValue} {goal.unit}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Target:</span>
                <span className="font-medium">{goal.targetValue} {goal.unit}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Deadline:</span>
                <span className="font-medium">{new Date(goal.deadline).toLocaleDateString()}</span>
              </div>
            </div>

            <div className="mt-4">
              <input
                type="number"
                placeholder="Update progress..."
                className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
                onKeyPress={(e) => {
                  if (e.key === 'Enter') {
                    updateGoalProgress(goal._id, e.target.value);
                    e.target.value = '';
                  }
                }}
              />
            </div>
          </div>
        ))}

        {goals.length === 0 && (
          <div className="col-span-full bg-white p-12 rounded-lg shadow text-center">
            <Target className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No health goals set</h3>
            <p className="text-gray-500 mb-4">Set your first health goal to start tracking your progress</p>
            <button
              onClick={() => setShowAddGoal(true)}
              className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700"
            >
              Set Your First Goal
            </button>
          </div>
        )}
      </div>

      {/* Health Metrics */}
      <div className="bg-white rounded-lg shadow">
        <div className="px-6 py-4 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold text-gray-900">Health Metrics</h3>
            <div className="flex items-center space-x-4">
              <select
                value={selectedMetric}
                onChange={(e) => setSelectedMetric(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
              >
                {healthMetrics.map((metric) => (
                  <option key={metric.value} value={metric.value}>{metric.label}</option>
                ))}
              </select>
              
              <select
                value={timeRange}
                onChange={(e) => setTimeRange(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
              >
                <option value="7">Last 7 days</option>
                <option value="30">Last 30 days</option>
                <option value="90">Last 3 months</option>
                <option value="365">Last year</option>
              </select>
            </div>
          </div>
        </div>

        <div className="p-6">
          {healthData.length > 0 ? (
            <div className="space-y-6">
              {/* Chart Placeholder */}
              <div className="h-64 bg-gray-50 rounded-lg flex items-center justify-center">
                <div className="text-center">
                  <TrendingUp className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-500">Chart visualization will be implemented with a charting library</p>
                  <p className="text-sm text-gray-400">Showing {selectedMetric} data for last {timeRange} days</p>
                </div>
              </div>

              {/* Recent Readings */}
              <div>
                <h4 className="text-lg font-medium text-gray-900 mb-4">Recent Readings</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  {healthData.slice(0, 8).map((reading, index) => (
                    <div key={index} className="bg-gray-50 p-4 rounded-lg">
                      <div className="flex items-center mb-2">
                        {getMetricIcon(selectedMetric)}
                        <span className="ml-2 text-sm font-medium text-gray-900">
                          {healthMetrics.find(m => m.value === selectedMetric)?.label}
                        </span>
                      </div>
                      <p className="text-lg font-bold text-gray-900">
                        {reading.value} {healthMetrics.find(m => m.value === selectedMetric)?.unit}
                      </p>
                      <p className="text-xs text-gray-500">
                        {new Date(reading.recordedAt).toLocaleDateString()}
                      </p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Statistics */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="bg-blue-50 p-4 rounded-lg">
                  <div className="flex items-center">
                    <TrendingUp className="h-5 w-5 text-blue-600 mr-2" />
                    <span className="text-sm font-medium text-blue-900">Average</span>
                  </div>
                  <p className="text-lg font-bold text-blue-900">
                    {(healthData.reduce((sum, d) => sum + d.value, 0) / healthData.length).toFixed(1)}
                  </p>
                </div>

                <div className="bg-green-50 p-4 rounded-lg">
                  <div className="flex items-center">
                    <Award className="h-5 w-5 text-green-600 mr-2" />
                    <span className="text-sm font-medium text-green-900">Best</span>
                  </div>
                  <p className="text-lg font-bold text-green-900">
                    {Math.max(...healthData.map(d => d.value))}
                  </p>
                </div>

                <div className="bg-red-50 p-4 rounded-lg">
                  <div className="flex items-center">
                    <Activity className="h-5 w-5 text-red-600 mr-2" />
                    <span className="text-sm font-medium text-red-900">Latest</span>
                  </div>
                  <p className="text-lg font-bold text-red-900">
                    {healthData[0]?.value || 'N/A'}
                  </p>
                </div>

                <div className="bg-purple-50 p-4 rounded-lg">
                  <div className="flex items-center">
                    <Clock className="h-5 w-5 text-purple-600 mr-2" />
                    <span className="text-sm font-medium text-purple-900">Readings</span>
                  </div>
                  <p className="text-lg font-bold text-purple-900">
                    {healthData.length}
                  </p>
                </div>
              </div>
            </div>
          ) : (
            <div className="text-center py-12">
              <Activity className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No health data found</h3>
              <p className="text-gray-500">Start recording your health metrics to see trends and progress</p>
            </div>
          )}
        </div>
      </div>

      {/* Add Goal Modal */}
      {showAddGoal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-semibold text-gray-900">Add Health Goal</h3>
              <button
                onClick={() => setShowAddGoal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                ×
              </button>
            </div>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Goal Type</label>
                <select
                  value={newGoal.type}
                  onChange={(e) => {
                    const selectedType = goalTypes.find(t => t.value === e.target.value);
                    setNewGoal(prev => ({ 
                      ...prev, 
                      type: e.target.value,
                      unit: selectedType?.unit || 'kg'
                    }));
                  }}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                >
                  {goalTypes.map((type) => (
                    <option key={type.value} value={type.value}>{type.label}</option>
                  ))}
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Goal Title</label>
                <input
                  type="text"
                  value={newGoal.title}
                  onChange={(e) => setNewGoal(prev => ({ ...prev, title: e.target.value }))}
                  placeholder="e.g., Lose 10kg in 3 months"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                />
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Current Value</label>
                  <input
                    type="number"
                    value={newGoal.currentValue}
                    onChange={(e) => setNewGoal(prev => ({ ...prev, currentValue: e.target.value }))}
                    placeholder="Current"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Target Value</label>
                  <input
                    type="number"
                    value={newGoal.targetValue}
                    onChange={(e) => setNewGoal(prev => ({ ...prev, targetValue: e.target.value }))}
                    placeholder="Target"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                  />
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Deadline</label>
                <input
                  type="date"
                  value={newGoal.deadline}
                  onChange={(e) => setNewGoal(prev => ({ ...prev, deadline: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Description (Optional)</label>
                <textarea
                  value={newGoal.description}
                  onChange={(e) => setNewGoal(prev => ({ ...prev, description: e.target.value }))}
                  rows={3}
                  placeholder="Additional notes about your goal..."
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                />
              </div>
            </div>
            
            <div className="flex items-center justify-end space-x-3 mt-6">
              <button
                onClick={() => setShowAddGoal(false)}
                className="px-4 py-2 bg-gray-300 text-gray-700 rounded-md hover:bg-gray-400"
              >
                Cancel
              </button>
              <button
                onClick={addGoal}
                disabled={!newGoal.title || !newGoal.targetValue}
                className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Add Goal
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PatientHealthTracking;

import React, { useState, useEffect } from 'react';
import { 
  Target, 
  Plus, 
  TrendingUp, 
  Calendar, 
  CheckCircle,
  Clock,
  Edit,
  Trash2,
  Activity,
  Heart,
  Weight,
  Droplets,
  Moon,
  Utensils,
  X,
  Save
} from 'lucide-react';

const HealthGoals = () => {
  const [goals, setGoals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedGoal, setSelectedGoal] = useState(null);
  const [showProgressModal, setShowProgressModal] = useState(false);

  const [goalForm, setGoalForm] = useState({
    title: '',
    description: '',
    category: 'fitness',
    targetValue: '',
    currentValue: '',
    unit: '',
    targetDate: '',
    priority: 'medium'
  });

  const [progressForm, setProgressForm] = useState({
    value: '',
    notes: ''
  });

  useEffect(() => {
    fetchHealthGoals();
  }, []);

  const fetchHealthGoals = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('/api/patient/health-goals', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await response.json();
      setGoals(data.goals || []);
    } catch (error) {
      console.error('Error fetching health goals:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddGoal = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('/api/patient/health-goals', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(goalForm)
      });

      if (response.ok) {
        setShowAddModal(false);
        setGoalForm({
          title: '',
          description: '',
          category: 'fitness',
          targetValue: '',
          currentValue: '',
          unit: '',
          targetDate: '',
          priority: 'medium'
        });
        fetchHealthGoals();
      }
    } catch (error) {
      console.error('Error adding goal:', error);
    }
  };

  const handleUpdateGoal = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`/api/patient/health-goals/${selectedGoal._id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(goalForm)
      });

      if (response.ok) {
        setShowEditModal(false);
        setSelectedGoal(null);
        fetchHealthGoals();
      }
    } catch (error) {
      console.error('Error updating goal:', error);
    }
  };

  const handleAddProgress = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`/api/patient/health-goals/${selectedGoal._id}/progress`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(progressForm)
      });

      if (response.ok) {
        setShowProgressModal(false);
        setProgressForm({ value: '', notes: '' });
        setSelectedGoal(null);
        fetchHealthGoals();
      }
    } catch (error) {
      console.error('Error adding progress:', error);
    }
  };

  const handleDeleteGoal = async (goalId) => {
    if (!window.confirm('Are you sure you want to delete this goal?')) return;
    
    try {
      const token = localStorage.getItem('token');
      await fetch(`/api/patient/health-goals/${goalId}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      fetchHealthGoals();
    } catch (error) {
      console.error('Error deleting goal:', error);
    }
  };

  const getCategoryIcon = (category) => {
    switch (category) {
      case 'fitness':
        return <Activity className="h-5 w-5" />;
      case 'weight':
        return <Weight className="h-5 w-5" />;
      case 'nutrition':
        return <Utensils className="h-5 w-5" />;
      case 'sleep':
        return <Moon className="h-5 w-5" />;
      case 'hydration':
        return <Droplets className="h-5 w-5" />;
      case 'wellness':
        return <Heart className="h-5 w-5" />;
      default:
        return <Target className="h-5 w-5" />;
    }
  };

  const getCategoryColor = (category) => {
    switch (category) {
      case 'fitness':
        return 'bg-blue-100 text-blue-800';
      case 'weight':
        return 'bg-green-100 text-green-800';
      case 'nutrition':
        return 'bg-orange-100 text-orange-800';
      case 'sleep':
        return 'bg-purple-100 text-purple-800';
      case 'hydration':
        return 'bg-cyan-100 text-cyan-800';
      case 'wellness':
        return 'bg-pink-100 text-pink-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'high':
        return 'bg-red-100 text-red-800';
      case 'medium':
        return 'bg-yellow-100 text-yellow-800';
      case 'low':
        return 'bg-green-100 text-green-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const calculateProgress = (goal) => {
    if (!goal.targetValue || !goal.currentValue) return 0;
    return Math.min(Math.round((goal.currentValue / goal.targetValue) * 100), 100);
  };

  const getDaysRemaining = (targetDate) => {
    const today = new Date();
    const target = new Date(targetDate);
    const diffTime = target - today;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  const GoalCard = ({ goal }) => {
    const progress = calculateProgress(goal);
    const daysRemaining = getDaysRemaining(goal.targetDate);
    
    return (
      <div className="bg-white rounded-lg border border-gray-200 p-6 hover:shadow-md transition-shadow">
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center space-x-3">
            <div className={`p-2 rounded-lg ${getCategoryColor(goal.category)}`}>
              {getCategoryIcon(goal.category)}
            </div>
            <div>
              <h3 className="font-semibold text-gray-900">{goal.title}</h3>
              <p className="text-sm text-gray-600">{goal.description}</p>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <span className={`px-2 py-1 text-xs font-medium rounded-full ${getPriorityColor(goal.priority)}`}>
              {goal.priority}
            </span>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="mb-4">
          <div className="flex justify-between items-center mb-2">
            <span className="text-sm font-medium text-gray-700">Progress</span>
            <span className="text-sm text-gray-500">{progress}%</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div
              className={`h-2 rounded-full transition-all duration-300 ${
                progress >= 100 ? 'bg-green-500' : progress >= 75 ? 'bg-blue-500' : progress >= 50 ? 'bg-yellow-500' : 'bg-red-500'
              }`}
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>

        {/* Goal Details */}
        <div className="grid grid-cols-2 gap-4 mb-4">
          <div className="text-sm">
            <span className="text-gray-600">Current:</span>
            <span className="ml-1 font-medium text-gray-900">
              {goal.currentValue} {goal.unit}
            </span>
          </div>
          <div className="text-sm">
            <span className="text-gray-600">Target:</span>
            <span className="ml-1 font-medium text-gray-900">
              {goal.targetValue} {goal.unit}
            </span>
          </div>
          <div className="text-sm">
            <span className="text-gray-600">Target Date:</span>
            <span className="ml-1 font-medium text-gray-900">
              {new Date(goal.targetDate).toLocaleDateString()}
            </span>
          </div>
          <div className="text-sm">
            <span className="text-gray-600">Days Left:</span>
            <span className={`ml-1 font-medium ${
              daysRemaining < 0 ? 'text-red-600' : daysRemaining < 7 ? 'text-yellow-600' : 'text-green-600'
            }`}>
              {daysRemaining < 0 ? 'Overdue' : `${daysRemaining} days`}
            </span>
          </div>
        </div>

        {/* Recent Progress */}
        {goal.progress && goal.progress.length > 0 && (
          <div className="mb-4">
            <h4 className="text-sm font-medium text-gray-700 mb-2">Recent Progress</h4>
            <div className="space-y-2 max-h-20 overflow-y-auto">
              {goal.progress.slice(-3).map((entry, index) => (
                <div key={index} className="text-xs text-gray-600 bg-gray-50 p-2 rounded">
                  <div className="flex justify-between">
                    <span>{entry.value} {goal.unit}</span>
                    <span>{new Date(entry.date).toLocaleDateString()}</span>
                  </div>
                  {entry.notes && <p className="mt-1">{entry.notes}</p>}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex items-center justify-between pt-4 border-t border-gray-100">
          <div className="flex items-center space-x-2">
            {progress >= 100 && (
              <CheckCircle className="h-5 w-5 text-green-500" />
            )}
          </div>
          <div className="flex items-center space-x-2">
            <button
              onClick={() => {
                setSelectedGoal(goal);
                setProgressForm({ value: '', notes: '' });
                setShowProgressModal(true);
              }}
              className="text-blue-600 hover:text-blue-700 text-sm font-medium"
            >
              Update Progress
            </button>
            <button
              onClick={() => {
                setSelectedGoal(goal);
                setGoalForm({
                  title: goal.title,
                  description: goal.description,
                  category: goal.category,
                  targetValue: goal.targetValue,
                  currentValue: goal.currentValue,
                  unit: goal.unit,
                  targetDate: goal.targetDate.split('T')[0],
                  priority: goal.priority
                });
                setShowEditModal(true);
              }}
              className="text-gray-600 hover:text-gray-700 text-sm"
            >
              <Edit className="h-4 w-4" />
            </button>
            <button
              onClick={() => handleDeleteGoal(goal._id)}
              className="text-red-600 hover:text-red-700 text-sm"
            >
              <Trash2 className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>
    );
  };

  const GoalModal = ({ isEdit = false }) => (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4">
        <h2 className="text-xl font-semibold mb-4">
          {isEdit ? 'Edit Health Goal' : 'Add New Health Goal'}
        </h2>
        
        <form onSubmit={isEdit ? handleUpdateGoal : handleAddGoal} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Goal Title
            </label>
            <input
              type="text"
              value={goalForm.title}
              onChange={(e) => setGoalForm({...goalForm, title: e.target.value})}
              className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-500"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Description
            </label>
            <textarea
              value={goalForm.description}
              onChange={(e) => setGoalForm({...goalForm, description: e.target.value})}
              className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-500"
              rows="3"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Category
              </label>
              <select
                value={goalForm.category}
                onChange={(e) => setGoalForm({...goalForm, category: e.target.value})}
                className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-500"
              >
                <option value="fitness">Fitness</option>
                <option value="weight">Weight</option>
                <option value="nutrition">Nutrition</option>
                <option value="sleep">Sleep</option>
                <option value="hydration">Hydration</option>
                <option value="wellness">Wellness</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Priority
              </label>
              <select
                value={goalForm.priority}
                onChange={(e) => setGoalForm({...goalForm, priority: e.target.value})}
                className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-500"
              >
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Current Value
              </label>
              <input
                type="number"
                value={goalForm.currentValue}
                onChange={(e) => setGoalForm({...goalForm, currentValue: e.target.value})}
                className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-500"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Target Value
              </label>
              <input
                type="number"
                value={goalForm.targetValue}
                onChange={(e) => setGoalForm({...goalForm, targetValue: e.target.value})}
                className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-500"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Unit
              </label>
              <input
                type="text"
                value={goalForm.unit}
                onChange={(e) => setGoalForm({...goalForm, unit: e.target.value})}
                className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-500"
                placeholder="kg, hrs, etc."
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Target Date
            </label>
            <input
              type="date"
              value={goalForm.targetDate}
              onChange={(e) => setGoalForm({...goalForm, targetDate: e.target.value})}
              className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-500"
              min={new Date().toISOString().split('T')[0]}
              required
            />
          </div>

          <div className="flex space-x-3 pt-4">
            <button
              type="button"
              onClick={() => {
                if (isEdit) {
                  setShowEditModal(false);
                  setSelectedGoal(null);
                } else {
                  setShowAddModal(false);
                }
                setGoalForm({
                  title: '',
                  description: '',
                  category: 'fitness',
                  targetValue: '',
                  currentValue: '',
                  unit: '',
                  targetDate: '',
                  priority: 'medium'
                });
              }}
              className="flex-1 px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex-1 px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700"
            >
              {isEdit ? 'Update Goal' : 'Add Goal'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );

  const ProgressModal = () => (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4">
        <h2 className="text-xl font-semibold mb-4">Update Progress</h2>
        
        {selectedGoal && (
          <div className="mb-4 p-3 bg-gray-50 rounded-lg">
            <h3 className="font-medium text-gray-900">{selectedGoal.title}</h3>
            <p className="text-sm text-gray-600">
              Current: {selectedGoal.currentValue} {selectedGoal.unit} / Target: {selectedGoal.targetValue} {selectedGoal.unit}
            </p>
          </div>
        )}
        
        <form onSubmit={handleAddProgress} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              New Value ({selectedGoal?.unit})
            </label>
            <input
              type="number"
              value={progressForm.value}
              onChange={(e) => setProgressForm({...progressForm, value: e.target.value})}
              className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-500"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Notes (Optional)
            </label>
            <textarea
              value={progressForm.notes}
              onChange={(e) => setProgressForm({...progressForm, notes: e.target.value})}
              className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-500"
              rows="3"
              placeholder="How are you feeling? Any challenges or achievements?"
            />
          </div>

          <div className="flex space-x-3 pt-4">
            <button
              type="button"
              onClick={() => {
                setShowProgressModal(false);
                setSelectedGoal(null);
                setProgressForm({ value: '', notes: '' });
              }}
              className="flex-1 px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex-1 px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700"
            >
              Update Progress
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
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Health Goals</h1>
          <p className="text-gray-600">Track your wellness journey and achieve your health objectives</p>
        </div>
        <button
          onClick={() => setShowAddModal(true)}
          className="flex items-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
        >
          <Plus className="h-5 w-5 mr-2" />
          Add Goal
        </button>
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Goals</p>
              <p className="text-2xl font-bold text-gray-900">{goals.length}</p>
            </div>
            <Target className="h-8 w-8 text-blue-500" />
          </div>
        </div>

        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Completed</p>
              <p className="text-2xl font-bold text-green-600">
                {goals.filter(goal => calculateProgress(goal) >= 100).length}
              </p>
            </div>
            <CheckCircle className="h-8 w-8 text-green-500" />
          </div>
        </div>

        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">In Progress</p>
              <p className="text-2xl font-bold text-blue-600">
                {goals.filter(goal => {
                  const progress = calculateProgress(goal);
                  return progress > 0 && progress < 100;
                }).length}
              </p>
            </div>
            <TrendingUp className="h-8 w-8 text-blue-500" />
          </div>
        </div>

        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Avg Progress</p>
              <p className="text-2xl font-bold text-purple-600">
                {goals.length > 0 
                  ? Math.round(goals.reduce((sum, goal) => sum + calculateProgress(goal), 0) / goals.length)
                  : 0}%
              </p>
            </div>
            <Activity className="h-8 w-8 text-purple-500" />
          </div>
        </div>
      </div>

      {/* Goals List */}
      <div className="space-y-4">
        {goals.length > 0 ? (
          goals.map(goal => (
            <GoalCard key={goal._id} goal={goal} />
          ))
        ) : (
          <div className="bg-white rounded-lg border border-gray-200 p-12 text-center">
            <Target className="h-16 w-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No health goals yet</h3>
            <p className="text-gray-600 mb-6">Start your wellness journey by setting your first health goal</p>
            <button
              onClick={() => setShowAddModal(true)}
              className="inline-flex items-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
            >
              <Plus className="h-5 w-5 mr-2" />
              Add Your First Goal
            </button>
          </div>
        )}
      </div>

      {/* Modals */}
      {showAddModal && <GoalModal />}
      {showEditModal && <GoalModal isEdit={true} />}
      {showProgressModal && <ProgressModal />}
    </div>
  );
};

export default HealthGoals;

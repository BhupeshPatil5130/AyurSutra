import React, { useState, useEffect } from 'react';
import { 
  Star, MessageSquare, ThumbsUp, ThumbsDown, Send,
  Search, Filter, Calendar, User, Award, TrendingUp,
  Plus, Edit, Trash2, Eye, RefreshCw, Download
} from 'lucide-react';
import api from '../../utils/api';
import toast from 'react-hot-toast';

const PatientFeedbackReviews = () => {
  const [reviews, setReviews] = useState([]);
  const [practitioners, setPractitioners] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAddReview, setShowAddReview] = useState(false);
  const [selectedReview, setSelectedReview] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterRating, setFilterRating] = useState('all');
  const [filterStatus, setFilterStatus] = useState('all');
  const [stats, setStats] = useState({
    totalReviews: 0,
    averageRating: 0,
    pendingReviews: 0,
    publishedReviews: 0
  });

  const [newReview, setNewReview] = useState({
    practitionerId: '',
    appointmentId: '',
    rating: 5,
    title: '',
    comment: '',
    categories: {
      communication: 5,
      professionalism: 5,
      effectiveness: 5,
      punctuality: 5,
      facilities: 5
    },
    wouldRecommend: true,
    isAnonymous: false
  });

  useEffect(() => {
    fetchReviews();
    fetchPractitioners();
    fetchStats();
  }, [filterRating, filterStatus]);

  const fetchReviews = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (filterRating !== 'all') params.append('rating', filterRating);
      if (filterStatus !== 'all') params.append('status', filterStatus);

      const response = await api.get(`/patient/reviews?${params}`);
      setReviews(response.data);
    } catch (error) {
      console.error('Error fetching reviews:', error);
      toast.error('Error loading reviews');
    } finally {
      setLoading(false);
    }
  };

  const fetchPractitioners = async () => {
    try {
      const response = await api.get('/patient/practitioners');
      setPractitioners(response.data);
    } catch (error) {
      console.error('Error fetching practitioners:', error);
    }
  };

  const fetchStats = async () => {
    try {
      const response = await api.get('/patient/review-stats');
      setStats(response.data);
    } catch (error) {
      console.error('Error fetching stats:', error);
    }
  };

  const submitReview = async () => {
    try {
      const response = await api.post('/patient/reviews', newReview);
      setReviews(prev => [response.data, ...prev]);
      setShowAddReview(false);
      setNewReview({
        practitionerId: '',
        appointmentId: '',
        rating: 5,
        title: '',
        comment: '',
        categories: {
          communication: 5,
          professionalism: 5,
          effectiveness: 5,
          punctuality: 5,
          facilities: 5
        },
        wouldRecommend: true,
        isAnonymous: false
      });
      toast.success('Review submitted successfully');
      fetchStats();
    } catch (error) {
      console.error('Error submitting review:', error);
      toast.error('Error submitting review');
    }
  };

  const updateReview = async (reviewId, updates) => {
    try {
      const response = await api.patch(`/patient/reviews/${reviewId}`, updates);
      setReviews(prev => prev.map(review => 
        review._id === reviewId ? response.data : review
      ));
      toast.success('Review updated successfully');
    } catch (error) {
      console.error('Error updating review:', error);
      toast.error('Error updating review');
    }
  };

  const deleteReview = async (reviewId) => {
    if (!window.confirm('Are you sure you want to delete this review?')) return;

    try {
      await api.delete(`/patient/reviews/${reviewId}`);
      setReviews(prev => prev.filter(review => review._id !== reviewId));
      toast.success('Review deleted successfully');
      fetchStats();
    } catch (error) {
      console.error('Error deleting review:', error);
      toast.error('Error deleting review');
    }
  };

  const renderStars = (rating, interactive = false, onRatingChange = null) => {
    return (
      <div className="flex items-center space-x-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            className={`h-5 w-5 ${
              star <= rating
                ? 'text-yellow-400 fill-current'
                : 'text-gray-300'
            } ${interactive ? 'cursor-pointer hover:text-yellow-400' : ''}`}
            onClick={() => interactive && onRatingChange && onRatingChange(star)}
          />
        ))}
      </div>
    );
  };

  const filteredReviews = reviews.filter(review =>
    review.practitioner?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    review.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    review.comment?.toLowerCase().includes(searchTerm.toLowerCase())
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
          <h1 className="text-3xl font-bold text-gray-900">Reviews & Feedback</h1>
          <p className="text-gray-600">Share your experience and help others make informed decisions</p>
        </div>
        <div className="flex items-center space-x-3">
          <button
            onClick={() => setShowAddReview(true)}
            className="flex items-center px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700"
          >
            <Plus className="h-4 w-4 mr-2" />
            Write Review
          </button>
          <button
            onClick={fetchReviews}
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
            <div className="p-2 bg-blue-100 rounded-lg">
              <MessageSquare className="h-6 w-6 text-blue-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Total Reviews</p>
              <p className="text-2xl font-bold text-gray-900">{stats.totalReviews}</p>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow">
          <div className="flex items-center">
            <div className="p-2 bg-yellow-100 rounded-lg">
              <Star className="h-6 w-6 text-yellow-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Average Rating</p>
              <div className="flex items-center space-x-2">
                <p className="text-2xl font-bold text-gray-900">{stats.averageRating}</p>
                {renderStars(Math.round(stats.averageRating))}
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow">
          <div className="flex items-center">
            <div className="p-2 bg-orange-100 rounded-lg">
              <Calendar className="h-6 w-6 text-orange-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Pending</p>
              <p className="text-2xl font-bold text-gray-900">{stats.pendingReviews}</p>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow">
          <div className="flex items-center">
            <div className="p-2 bg-green-100 rounded-lg">
              <Award className="h-6 w-6 text-green-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Published</p>
              <p className="text-2xl font-bold text-gray-900">{stats.publishedReviews}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="bg-white rounded-lg shadow p-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search reviews..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
            />
          </div>
          
          <select
            value={filterRating}
            onChange={(e) => setFilterRating(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
          >
            <option value="all">All Ratings</option>
            <option value="5">5 Stars</option>
            <option value="4">4 Stars</option>
            <option value="3">3 Stars</option>
            <option value="2">2 Stars</option>
            <option value="1">1 Star</option>
          </select>
          
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
          >
            <option value="all">All Status</option>
            <option value="published">Published</option>
            <option value="pending">Pending</option>
            <option value="draft">Draft</option>
          </select>
          
          <button className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700">
            <Download className="h-4 w-4 mr-2" />
            Export
          </button>
        </div>
      </div>

      {/* Reviews List */}
      <div className="bg-white rounded-lg shadow">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900">
            Your Reviews ({filteredReviews.length})
          </h3>
        </div>
        
        <div className="divide-y divide-gray-200">
          {filteredReviews.length > 0 ? (
            filteredReviews.map((review) => (
              <div key={review._id} className="p-6 hover:bg-gray-50">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center space-x-4 mb-3">
                      <div className="w-12 h-12 bg-gray-300 rounded-full flex items-center justify-center">
                        <User className="h-6 w-6 text-gray-600" />
                      </div>
                      
                      <div className="flex-1">
                        <div className="flex items-center space-x-3">
                          <h4 className="text-lg font-medium text-gray-900">
                            Dr. {review.practitioner?.name}
                          </h4>
                          <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                            review.status === 'published' ? 'bg-green-100 text-green-800' :
                            review.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                            'bg-gray-100 text-gray-800'
                          }`}>
                            {review.status.charAt(0).toUpperCase() + review.status.slice(1)}
                          </span>
                        </div>
                        
                        <div className="flex items-center space-x-4 mt-1">
                          {renderStars(review.rating)}
                          <span className="text-sm text-gray-600">
                            {new Date(review.createdAt).toLocaleDateString()}
                          </span>
                          <span className="text-sm text-gray-600">
                            {review.practitioner?.specialization}
                          </span>
                        </div>
                      </div>
                    </div>
                    
                    {review.title && (
                      <h5 className="text-lg font-medium text-gray-900 mb-2">
                        {review.title}
                      </h5>
                    )}
                    
                    <p className="text-gray-700 mb-4">{review.comment}</p>
                    
                    {/* Category Ratings */}
                    <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-4">
                      {Object.entries(review.categories || {}).map(([category, rating]) => (
                        <div key={category} className="text-center">
                          <p className="text-xs font-medium text-gray-600 capitalize mb-1">
                            {category.replace(/([A-Z])/g, ' $1').trim()}
                          </p>
                          {renderStars(rating)}
                        </div>
                      ))}
                    </div>
                    
                    <div className="flex items-center space-x-4 text-sm text-gray-600">
                      <div className="flex items-center">
                        {review.wouldRecommend ? (
                          <ThumbsUp className="h-4 w-4 text-green-600 mr-1" />
                        ) : (
                          <ThumbsDown className="h-4 w-4 text-red-600 mr-1" />
                        )}
                        {review.wouldRecommend ? 'Would recommend' : 'Would not recommend'}
                      </div>
                      
                      {review.isAnonymous && (
                        <span className="text-gray-500">Anonymous review</span>
                      )}
                      
                      {review.appointment && (
                        <span>Appointment: {new Date(review.appointment.date).toLocaleDateString()}</span>
                      )}
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-2 ml-4">
                    <button
                      onClick={() => setSelectedReview(review)}
                      className="p-2 text-gray-600 hover:bg-gray-100 rounded-full"
                      title="View Details"
                    >
                      <Eye className="h-5 w-5" />
                    </button>
                    
                    {review.status === 'draft' && (
                      <button
                        className="p-2 text-blue-600 hover:bg-blue-100 rounded-full"
                        title="Edit Review"
                      >
                        <Edit className="h-5 w-5" />
                      </button>
                    )}
                    
                    <button
                      onClick={() => deleteReview(review._id)}
                      className="p-2 text-red-600 hover:bg-red-100 rounded-full"
                      title="Delete Review"
                    >
                      <Trash2 className="h-5 w-5" />
                    </button>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="p-12 text-center">
              <MessageSquare className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No reviews found</h3>
              <p className="text-gray-500 mb-4">
                {searchTerm ? 'Try adjusting your search terms.' : 'Share your experience by writing your first review.'}
              </p>
              <button
                onClick={() => setShowAddReview(true)}
                className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700"
              >
                Write Your First Review
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Add Review Modal */}
      {showAddReview && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-2xl max-h-screen overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-semibold text-gray-900">Write a Review</h3>
              <button
                onClick={() => setShowAddReview(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                ×
              </button>
            </div>
            
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Select Practitioner
                </label>
                <select
                  value={newReview.practitionerId}
                  onChange={(e) => setNewReview(prev => ({ ...prev, practitionerId: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                >
                  <option value="">Choose a practitioner...</option>
                  {practitioners.map((practitioner) => (
                    <option key={practitioner._id} value={practitioner._id}>
                      Dr. {practitioner.name} - {practitioner.specialization}
                    </option>
                  ))}
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Overall Rating
                </label>
                {renderStars(newReview.rating, true, (rating) => 
                  setNewReview(prev => ({ ...prev, rating }))
                )}
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Review Title
                </label>
                <input
                  type="text"
                  value={newReview.title}
                  onChange={(e) => setNewReview(prev => ({ ...prev, title: e.target.value }))}
                  placeholder="Summarize your experience..."
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Detailed Review
                </label>
                <textarea
                  value={newReview.comment}
                  onChange={(e) => setNewReview(prev => ({ ...prev, comment: e.target.value }))}
                  rows={4}
                  placeholder="Share your detailed experience..."
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-4">
                  Category Ratings
                </label>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {Object.entries(newReview.categories).map(([category, rating]) => (
                    <div key={category} className="flex items-center justify-between">
                      <span className="text-sm font-medium text-gray-700 capitalize">
                        {category.replace(/([A-Z])/g, ' $1').trim()}
                      </span>
                      {renderStars(rating, true, (newRating) => 
                        setNewReview(prev => ({
                          ...prev,
                          categories: { ...prev.categories, [category]: newRating }
                        }))
                      )}
                    </div>
                  ))}
                </div>
              </div>
              
              <div className="space-y-3">
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="wouldRecommend"
                    checked={newReview.wouldRecommend}
                    onChange={(e) => setNewReview(prev => ({ ...prev, wouldRecommend: e.target.checked }))}
                    className="h-4 w-4 text-green-600 focus:ring-green-500 border-gray-300 rounded"
                  />
                  <label htmlFor="wouldRecommend" className="ml-2 block text-sm text-gray-900">
                    I would recommend this practitioner to others
                  </label>
                </div>
                
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="isAnonymous"
                    checked={newReview.isAnonymous}
                    onChange={(e) => setNewReview(prev => ({ ...prev, isAnonymous: e.target.checked }))}
                    className="h-4 w-4 text-green-600 focus:ring-green-500 border-gray-300 rounded"
                  />
                  <label htmlFor="isAnonymous" className="ml-2 block text-sm text-gray-900">
                    Submit this review anonymously
                  </label>
                </div>
              </div>
            </div>
            
            <div className="flex items-center justify-end space-x-3 mt-6">
              <button
                onClick={() => setShowAddReview(false)}
                className="px-4 py-2 bg-gray-300 text-gray-700 rounded-md hover:bg-gray-400"
              >
                Cancel
              </button>
              <button
                onClick={submitReview}
                disabled={!newReview.practitionerId || !newReview.comment.trim()}
                className="flex items-center px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Send className="h-4 w-4 mr-2" />
                Submit Review
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Review Detail Modal */}
      {selectedReview && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-2xl max-h-screen overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-semibold text-gray-900">Review Details</h3>
              <button
                onClick={() => setSelectedReview(null)}
                className="text-gray-400 hover:text-gray-600"
              >
                ×
              </button>
            </div>
            
            <div className="space-y-6">
              <div className="flex items-center space-x-4">
                <div className="w-16 h-16 bg-gray-300 rounded-full flex items-center justify-center">
                  <User className="h-8 w-8 text-gray-600" />
                </div>
                <div>
                  <h4 className="text-xl font-bold text-gray-900">
                    Dr. {selectedReview.practitioner?.name}
                  </h4>
                  <p className="text-gray-600">{selectedReview.practitioner?.specialization}</p>
                  <div className="flex items-center space-x-2 mt-1">
                    {renderStars(selectedReview.rating)}
                    <span className="text-sm text-gray-600">
                      {new Date(selectedReview.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                </div>
              </div>
              
              {selectedReview.title && (
                <div>
                  <h5 className="font-medium text-gray-900 mb-2">Review Title</h5>
                  <p className="text-gray-700">{selectedReview.title}</p>
                </div>
              )}
              
              <div>
                <h5 className="font-medium text-gray-900 mb-2">Review</h5>
                <p className="text-gray-700">{selectedReview.comment}</p>
              </div>
              
              <div>
                <h5 className="font-medium text-gray-900 mb-4">Category Ratings</h5>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {Object.entries(selectedReview.categories || {}).map(([category, rating]) => (
                    <div key={category} className="flex items-center justify-between">
                      <span className="text-sm font-medium text-gray-700 capitalize">
                        {category.replace(/([A-Z])/g, ' $1').trim()}
                      </span>
                      {renderStars(rating)}
                    </div>
                  ))}
                </div>
              </div>
              
              <div className="flex items-center space-x-6 text-sm text-gray-600">
                <div className="flex items-center">
                  {selectedReview.wouldRecommend ? (
                    <ThumbsUp className="h-4 w-4 text-green-600 mr-2" />
                  ) : (
                    <ThumbsDown className="h-4 w-4 text-red-600 mr-2" />
                  )}
                  {selectedReview.wouldRecommend ? 'Would recommend' : 'Would not recommend'}
                </div>
                
                <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                  selectedReview.status === 'published' ? 'bg-green-100 text-green-800' :
                  selectedReview.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                  'bg-gray-100 text-gray-800'
                }`}>
                  {selectedReview.status.charAt(0).toUpperCase() + selectedReview.status.slice(1)}
                </span>
                
                {selectedReview.isAnonymous && (
                  <span className="text-gray-500">Anonymous review</span>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PatientFeedbackReviews;

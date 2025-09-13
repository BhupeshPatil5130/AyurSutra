import React, { useState, useEffect } from 'react';
import { 
  Star, MessageSquare, User, Calendar, Search, Filter, Eye, 
  Reply, ThumbsUp, ThumbsDown, TrendingUp, Award, Heart,
  RefreshCw, Download, ChevronLeft, ChevronRight, X
} from 'lucide-react';
import api from '../../utils/api';
import toast from 'react-hot-toast';

const FeedbackReviewManagement = () => {
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [ratingFilter, setRatingFilter] = useState('all');
  const [showModal, setShowModal] = useState(false);
  const [selectedReview, setSelectedReview] = useState(null);
  const [replyText, setReplyText] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [reviewsPerPage] = useState(10);
  const [stats, setStats] = useState({});

  useEffect(() => {
    fetchReviews();
    fetchStats();
  }, [ratingFilter]);

  const fetchReviews = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (ratingFilter !== 'all') params.append('rating', ratingFilter);

      const response = await api.get(`/practitioner/reviews?${params}`);
      setReviews(response.data);
    } catch (error) {
      console.error('Error fetching reviews:', error);
      toast.error('Error loading reviews');
    } finally {
      setLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      const response = await api.get('/practitioner/reviews/stats');
      setStats(response.data);
    } catch (error) {
      console.error('Error fetching stats:', error);
    }
  };

  const handleReply = async (reviewId) => {
    if (!replyText.trim()) {
      toast.error('Please enter a reply');
      return;
    }

    try {
      await api.post(`/practitioner/reviews/${reviewId}/reply`, {
        reply: replyText
      });
      toast.success('Reply sent successfully');
      setShowModal(false);
      setReplyText('');
      fetchReviews();
    } catch (error) {
      console.error('Error sending reply:', error);
      toast.error('Error sending reply');
    }
  };

  const openReplyModal = (review) => {
    setSelectedReview(review);
    setReplyText('');
    setShowModal(true);
  };

  const renderStars = (rating) => {
    return [...Array(5)].map((_, index) => (
      <Star
        key={index}
        className={`h-4 w-4 ${
          index < rating ? 'text-yellow-400 fill-current' : 'text-gray-300'
        }`}
      />
    ));
  };

  const getReviewColor = (rating) => {
    if (rating >= 4) return 'border-l-green-500';
    if (rating >= 3) return 'border-l-yellow-500';
    return 'border-l-red-500';
  };

  const filteredReviews = reviews.filter(review =>
    review.patientId?.firstName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    review.patientId?.lastName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    review.comment?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const indexOfLastReview = currentPage * reviewsPerPage;
  const indexOfFirstReview = indexOfLastReview - reviewsPerPage;
  const currentReviews = filteredReviews.slice(indexOfFirstReview, indexOfLastReview);
  const totalPages = Math.ceil(filteredReviews.length / reviewsPerPage);

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
          <h1 className="text-3xl font-bold text-gray-900">Feedback & Reviews</h1>
          <p className="text-gray-600">Manage patient feedback and respond to reviews</p>
        </div>
        <div className="flex items-center space-x-3">
          <button
            onClick={fetchReviews}
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

      {/* Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="p-2 bg-yellow-100 rounded-lg">
              <Star className="h-6 w-6 text-yellow-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Average Rating</p>
              <div className="flex items-center">
                <p className="text-2xl font-bold text-gray-900">{(stats.averageRating || 0).toFixed(1)}</p>
                <div className="flex ml-2">
                  {renderStars(Math.round(stats.averageRating || 0))}
                </div>
              </div>
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="p-2 bg-blue-100 rounded-lg">
              <MessageSquare className="h-6 w-6 text-blue-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Total Reviews</p>
              <p className="text-2xl font-bold text-gray-900">{stats.totalReviews || 0}</p>
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="p-2 bg-green-100 rounded-lg">
              <ThumbsUp className="h-6 w-6 text-green-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Positive Reviews</p>
              <p className="text-2xl font-bold text-gray-900">
                {stats.positiveReviews || 0}
                <span className="text-sm text-green-600 ml-1">
                  ({((stats.positiveReviews / stats.totalReviews) * 100 || 0).toFixed(1)}%)
                </span>
              </p>
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="p-2 bg-purple-100 rounded-lg">
              <TrendingUp className="h-6 w-6 text-purple-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">This Month</p>
              <p className="text-2xl font-bold text-gray-900">{stats.monthlyReviews || 0}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Rating Distribution */}
      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Rating Distribution</h3>
        <div className="space-y-3">
          {[5, 4, 3, 2, 1].map(rating => {
            const count = stats.ratingDistribution?.[rating] || 0;
            const percentage = stats.totalReviews ? (count / stats.totalReviews) * 100 : 0;
            
            return (
              <div key={rating} className="flex items-center">
                <div className="flex items-center w-20">
                  <span className="text-sm font-medium mr-2">{rating}</span>
                  <Star className="h-4 w-4 text-yellow-400 fill-current" />
                </div>
                <div className="flex-1 mx-4">
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-yellow-400 h-2 rounded-full"
                      style={{ width: `${percentage}%` }}
                    ></div>
                  </div>
                </div>
                <div className="w-16 text-right">
                  <span className="text-sm text-gray-600">{count} ({percentage.toFixed(1)}%)</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Search and Filter */}
      <div className="bg-white rounded-lg shadow p-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search reviews..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
            />
          </div>
          
          <select
            value={ratingFilter}
            onChange={(e) => setRatingFilter(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
          >
            <option value="all">All Ratings</option>
            <option value="5">5 Stars</option>
            <option value="4">4 Stars</option>
            <option value="3">3 Stars</option>
            <option value="2">2 Stars</option>
            <option value="1">1 Star</option>
          </select>
          
          <button
            onClick={() => {
              setSearchTerm('');
              setRatingFilter('all');
            }}
            className="px-4 py-2 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200"
          >
            Clear Filters
          </button>
        </div>
      </div>

      {/* Reviews List */}
      <div className="bg-white rounded-lg shadow">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900">Patient Reviews</h3>
        </div>
        
        <div className="divide-y divide-gray-200">
          {currentReviews.length > 0 ? (
            currentReviews.map((review) => (
              <div key={review._id} className={`p-6 border-l-4 ${getReviewColor(review.rating)}`}>
                <div className="flex items-start justify-between">
                  <div className="flex items-start space-x-4">
                    <div className="w-12 h-12 bg-gradient-to-r from-blue-400 to-purple-500 rounded-full flex items-center justify-center text-white font-semibold">
                      {review.patientId?.firstName?.charAt(0)}{review.patientId?.lastName?.charAt(0)}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center space-x-3 mb-2">
                        <h4 className="text-lg font-medium text-gray-900">
                          {review.patientId?.firstName} {review.patientId?.lastName}
                        </h4>
                        <div className="flex items-center">
                          {renderStars(review.rating)}
                          <span className="ml-2 text-sm text-gray-600">({review.rating}/5)</span>
                        </div>
                      </div>
                      
                      <p className="text-gray-700 mb-3">{review.comment}</p>
                      
                      <div className="flex items-center text-sm text-gray-500 space-x-4">
                        <span className="flex items-center">
                          <Calendar className="h-4 w-4 mr-1" />
                          {new Date(review.createdAt).toLocaleDateString()}
                        </span>
                        {review.appointmentId && (
                          <span>Appointment: {new Date(review.appointmentId.appointmentDate).toLocaleDateString()}</span>
                        )}
                      </div>
                      
                      {review.practitionerReply && (
                        <div className="mt-4 p-3 bg-gray-50 rounded-md border-l-4 border-green-500">
                          <div className="flex items-center mb-2">
                            <Award className="h-4 w-4 text-green-600 mr-2" />
                            <span className="text-sm font-medium text-green-800">Your Reply</span>
                          </div>
                          <p className="text-sm text-gray-700">{review.practitionerReply}</p>
                          <p className="text-xs text-gray-500 mt-1">
                            Replied on {new Date(review.replyDate).toLocaleDateString()}
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    {!review.practitionerReply && (
                      <button
                        onClick={() => openReplyModal(review)}
                        className="flex items-center px-3 py-2 text-sm bg-green-100 text-green-700 rounded-md hover:bg-green-200"
                      >
                        <Reply className="h-4 w-4 mr-1" />
                        Reply
                      </button>
                    )}
                    <button className="p-2 text-blue-600 hover:text-blue-800" title="View Details">
                      <Eye className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="p-12 text-center">
              <MessageSquare className="h-16 w-16 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500 text-lg">No reviews found</p>
              <p className="text-gray-400">Reviews from patients will appear here</p>
            </div>
          )}
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="px-6 py-4 border-t border-gray-200">
            <div className="flex items-center justify-between">
              <div className="text-sm text-gray-700">
                Showing {indexOfFirstReview + 1} to {Math.min(indexOfLastReview, filteredReviews.length)} of {filteredReviews.length} results
              </div>
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                  disabled={currentPage === 1}
                  className="p-2 border border-gray-300 rounded-md disabled:opacity-50"
                >
                  <ChevronLeft className="h-4 w-4" />
                </button>
                <span className="px-3 py-2 text-sm">
                  Page {currentPage} of {totalPages}
                </span>
                <button
                  onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                  disabled={currentPage === totalPages}
                  className="p-2 border border-gray-300 rounded-md disabled:opacity-50"
                >
                  <ChevronRight className="h-4 w-4" />
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Reply Modal */}
      {showModal && selectedReview && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-2xl">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold">Reply to Review</h3>
              <button
                onClick={() => setShowModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="h-6 w-6" />
              </button>
            </div>
            
            <div className="mb-4 p-4 bg-gray-50 rounded-md">
              <div className="flex items-center mb-2">
                <div className="flex">
                  {renderStars(selectedReview.rating)}
                </div>
                <span className="ml-2 text-sm text-gray-600">
                  by {selectedReview.patientId?.firstName} {selectedReview.patientId?.lastName}
                </span>
              </div>
              <p className="text-gray-700">{selectedReview.comment}</p>
            </div>
            
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">Your Reply</label>
              <textarea
                value={replyText}
                onChange={(e) => setReplyText(e.target.value)}
                rows="4"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                placeholder="Thank you for your feedback..."
              />
            </div>
            
            <div className="flex items-center justify-end space-x-3">
              <button
                onClick={() => setShowModal(false)}
                className="px-4 py-2 text-gray-700 bg-gray-200 rounded-md hover:bg-gray-300"
              >
                Cancel
              </button>
              <button
                onClick={() => handleReply(selectedReview._id)}
                className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700"
              >
                Send Reply
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default FeedbackReviewManagement;

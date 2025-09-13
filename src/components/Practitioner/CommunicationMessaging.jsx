import React, { useState, useEffect } from 'react';
import { 
  MessageSquare, Send, Search, Filter, User, Phone, Video,
  Paperclip, Smile, MoreVertical, Bell, Archive, Star,
  Clock, CheckCircle, AlertCircle, X, Plus, RefreshCw
} from 'lucide-react';
import api from '../../utils/api';
import toast from 'react-hot-toast';

const CommunicationMessaging = () => {
  const [conversations, setConversations] = useState([]);
  const [selectedConversation, setSelectedConversation] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [showNewChat, setShowNewChat] = useState(false);
  const [patients, setPatients] = useState([]);

  useEffect(() => {
    fetchConversations();
    fetchPatients();
  }, [filterStatus]);

  useEffect(() => {
    if (selectedConversation) {
      fetchMessages(selectedConversation._id);
    }
  }, [selectedConversation]);

  const fetchConversations = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (filterStatus !== 'all') params.append('status', filterStatus);

      const response = await api.get(`/practitioner/conversations?${params}`);
      setConversations(Array.isArray(response.data) ? response.data : []);
    } catch (error) {
      console.error('Error fetching conversations:', error);
      setConversations([]);
      toast.error('Error loading conversations');
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

  const fetchMessages = async (conversationId) => {
    try {
      const response = await api.get(`/practitioner/conversations/${conversationId}/messages`);
      setMessages(Array.isArray(response.data) ? response.data : []);
    } catch (error) {
      console.error('Error fetching messages:', error);
      setMessages([]);
      toast.error('Error loading messages');
    }
  };

  const sendMessage = async () => {
    if (!newMessage.trim() || !selectedConversation) return;

    try {
      const response = await api.post(`/practitioner/conversations/${selectedConversation._id}/messages`, {
        content: newMessage,
        type: 'text'
      });
      
      setMessages(prev => [...prev, response.data]);
      setNewMessage('');
      
      // Update conversation list
      fetchConversations();
    } catch (error) {
      console.error('Error sending message:', error);
      toast.error('Error sending message');
    }
  };

  const startNewConversation = async (patientId) => {
    try {
      const response = await api.post('/practitioner/conversations', {
        patientId,
        type: 'direct'
      });
      
      setSelectedConversation(response.data);
      setShowNewChat(false);
      fetchConversations();
    } catch (error) {
      console.error('Error starting conversation:', error);
      toast.error('Error starting conversation');
    }
  };

  const markAsRead = async (conversationId) => {
    try {
      await api.patch(`/practitioner/conversations/${conversationId}/read`);
      fetchConversations();
    } catch (error) {
      console.error('Error marking as read:', error);
    }
  };

  const filteredConversations = conversations.filter(conv =>
    conv.patientId?.firstName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    conv.patientId?.lastName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    conv.lastMessage?.content?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getMessageTime = (timestamp) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffInHours = (now - date) / (1000 * 60 * 60);
    
    if (diffInHours < 24) {
      return date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
    } else {
      return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
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
    <div className="h-screen flex bg-gray-50">
      {/* Sidebar - Conversations List */}
      <div className="w-1/3 bg-white border-r border-gray-200 flex flex-col">
        {/* Header */}
        <div className="p-4 border-b border-gray-200">
          <div className="flex items-center justify-between mb-4">
            <h1 className="text-xl font-bold text-gray-900">Messages</h1>
            <div className="flex items-center space-x-2">
              <button
                onClick={() => setShowNewChat(true)}
                className="p-2 bg-green-600 text-white rounded-full hover:bg-green-700"
                title="New Chat"
              >
                <Plus className="h-4 w-4" />
              </button>
              <button
                onClick={fetchConversations}
                className="p-2 bg-gray-100 text-gray-600 rounded-full hover:bg-gray-200"
                title="Refresh"
              >
                <RefreshCw className="h-4 w-4" />
              </button>
            </div>
          </div>
          
          {/* Search */}
          <div className="relative mb-3">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search conversations..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
            />
          </div>
          
          {/* Filter */}
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
          >
            <option value="all">All Conversations</option>
            <option value="unread">Unread</option>
            <option value="archived">Archived</option>
            <option value="starred">Starred</option>
          </select>
        </div>

        {/* Conversations List */}
        <div className="flex-1 overflow-y-auto">
          {filteredConversations.length > 0 ? (
            filteredConversations.map((conversation) => (
              <div
                key={conversation._id}
                onClick={() => {
                  setSelectedConversation(conversation);
                  if (conversation.unreadCount > 0) {
                    markAsRead(conversation._id);
                  }
                }}
                className={`p-4 border-b border-gray-100 cursor-pointer hover:bg-gray-50 ${
                  selectedConversation?._id === conversation._id ? 'bg-green-50 border-l-4 border-l-green-500' : ''
                }`}
              >
                <div className="flex items-center space-x-3">
                  <div className="relative">
                    <div className="w-12 h-12 bg-gradient-to-r from-blue-400 to-purple-500 rounded-full flex items-center justify-center text-white font-semibold">
                      {conversation.patientId?.firstName?.charAt(0)}{conversation.patientId?.lastName?.charAt(0)}
                    </div>
                    {conversation.patientId?.isOnline && (
                      <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full border-2 border-white"></div>
                    )}
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <h3 className="text-sm font-medium text-gray-900 truncate">
                        {conversation.patientId?.firstName} {conversation.patientId?.lastName}
                      </h3>
                      <div className="flex items-center space-x-1">
                        {conversation.unreadCount > 0 && (
                          <span className="bg-green-500 text-white text-xs rounded-full px-2 py-1">
                            {conversation.unreadCount}
                          </span>
                        )}
                        <span className="text-xs text-gray-500">
                          {getMessageTime(conversation.lastMessage?.createdAt)}
                        </span>
                      </div>
                    </div>
                    
                    <p className="text-sm text-gray-600 truncate mt-1">
                      {conversation.lastMessage?.content || 'No messages yet'}
                    </p>
                    
                    <div className="flex items-center mt-2 space-x-2">
                      {conversation.lastMessage?.status === 'delivered' && (
                        <CheckCircle className="h-3 w-3 text-green-500" />
                      )}
                      {conversation.lastMessage?.status === 'read' && (
                        <CheckCircle className="h-3 w-3 text-blue-500" />
                      )}
                      {conversation.isStarred && (
                        <Star className="h-3 w-3 text-yellow-500 fill-current" />
                      )}
                      {conversation.priority === 'urgent' && (
                        <AlertCircle className="h-3 w-3 text-red-500" />
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="p-8 text-center">
              <MessageSquare className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500">No conversations found</p>
            </div>
          )}
        </div>
      </div>

      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col">
        {selectedConversation ? (
          <>
            {/* Chat Header */}
            <div className="bg-white border-b border-gray-200 p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-gradient-to-r from-blue-400 to-purple-500 rounded-full flex items-center justify-center text-white font-semibold">
                    {selectedConversation.patientId?.firstName?.charAt(0)}{selectedConversation.patientId?.lastName?.charAt(0)}
                  </div>
                  <div>
                    <h2 className="text-lg font-semibold text-gray-900">
                      {selectedConversation.patientId?.firstName} {selectedConversation.patientId?.lastName}
                    </h2>
                    <p className="text-sm text-gray-500">
                      {selectedConversation.patientId?.isOnline ? 'Online' : 'Last seen recently'}
                    </p>
                  </div>
                </div>
                
                <div className="flex items-center space-x-2">
                  <button className="p-2 text-gray-600 hover:bg-gray-100 rounded-full" title="Voice Call">
                    <Phone className="h-5 w-5" />
                  </button>
                  <button className="p-2 text-gray-600 hover:bg-gray-100 rounded-full" title="Video Call">
                    <Video className="h-5 w-5" />
                  </button>
                  <button className="p-2 text-gray-600 hover:bg-gray-100 rounded-full" title="More Options">
                    <MoreVertical className="h-5 w-5" />
                  </button>
                </div>
              </div>
            </div>

            {/* Messages Area */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {messages.map((message) => (
                <div
                  key={message._id}
                  className={`flex ${message.senderId === 'practitioner' ? 'justify-end' : 'justify-start'}`}
                >
                  <div
                    className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
                      message.senderId === 'practitioner'
                        ? 'bg-green-500 text-white'
                        : 'bg-white border border-gray-200 text-gray-900'
                    }`}
                  >
                    <p className="text-sm">{message.content}</p>
                    <div className="flex items-center justify-between mt-1">
                      <span className={`text-xs ${
                        message.senderId === 'practitioner' ? 'text-green-100' : 'text-gray-500'
                      }`}>
                        {getMessageTime(message.createdAt)}
                      </span>
                      {message.senderId === 'practitioner' && (
                        <div className="ml-2">
                          {message.status === 'sent' && <Clock className="h-3 w-3 text-green-200" />}
                          {message.status === 'delivered' && <CheckCircle className="h-3 w-3 text-green-200" />}
                          {message.status === 'read' && <CheckCircle className="h-3 w-3 text-green-100" />}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Message Input */}
            <div className="bg-white border-t border-gray-200 p-4">
              <div className="flex items-center space-x-3">
                <button className="p-2 text-gray-600 hover:bg-gray-100 rounded-full">
                  <Paperclip className="h-5 w-5" />
                </button>
                <div className="flex-1 relative">
                  <input
                    type="text"
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
                    placeholder="Type a message..."
                    className="w-full px-4 py-2 border border-gray-300 rounded-full focus:outline-none focus:ring-2 focus:ring-green-500"
                  />
                  <button className="absolute right-2 top-1/2 transform -translate-y-1/2 p-1 text-gray-600 hover:bg-gray-100 rounded-full">
                    <Smile className="h-4 w-4" />
                  </button>
                </div>
                <button
                  onClick={sendMessage}
                  disabled={!newMessage.trim()}
                  className="p-2 bg-green-500 text-white rounded-full hover:bg-green-600 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <Send className="h-5 w-5" />
                </button>
              </div>
            </div>
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center bg-gray-50">
            <div className="text-center">
              <MessageSquare className="h-16 w-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">Select a conversation</h3>
              <p className="text-gray-500">Choose a patient to start messaging</p>
            </div>
          </div>
        )}
      </div>

      {/* New Chat Modal */}
      {showNewChat && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold">Start New Conversation</h3>
              <button
                onClick={() => setShowNewChat(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="h-6 w-6" />
              </button>
            </div>
            
            <div className="space-y-2 max-h-64 overflow-y-auto">
              {patients.map((patient) => (
                <button
                  key={patient._id}
                  onClick={() => startNewConversation(patient._id)}
                  className="w-full flex items-center space-x-3 p-3 hover:bg-gray-50 rounded-lg text-left"
                >
                  <div className="w-10 h-10 bg-gradient-to-r from-blue-400 to-purple-500 rounded-full flex items-center justify-center text-white font-semibold">
                    {patient.firstName?.charAt(0)}{patient.lastName?.charAt(0)}
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">
                      {patient.firstName} {patient.lastName}
                    </p>
                    <p className="text-sm text-gray-500">{patient.email}</p>
                  </div>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CommunicationMessaging;

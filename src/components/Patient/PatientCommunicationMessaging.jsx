import React, { useState, useEffect, useRef } from 'react';
import { 
  MessageCircle, Send, Search, Plus, Phone, Video,
  Paperclip, Smile, MoreVertical, Star, Archive,
  Clock, CheckCircle, AlertCircle, User, Calendar,
  Filter, RefreshCw, Settings, Bell, BellOff
} from 'lucide-react';
import api from '../../utils/api';


const PatientCommunicationMessaging = () => {
  const [conversations, setConversations] = useState([]);
  const [selectedConversation, setSelectedConversation] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [showNewConversation, setShowNewConversation] = useState(false);
  const [practitioners, setPractitioners] = useState([]);
  const [selectedPractitioner, setSelectedPractitioner] = useState('');
  const [messageSubject, setMessageSubject] = useState('');
  const [filterType, setFilterType] = useState('all');
  const messagesEndRef = useRef(null);

  useEffect(() => {
    fetchConversations();
    fetchPractitioners();
  }, [filterType]);

  useEffect(() => {
    if (selectedConversation) {
      fetchMessages(selectedConversation._id);
      markAsRead(selectedConversation._id);
    }
  }, [selectedConversation]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const fetchConversations = async () => {
    try {
      setLoading(true);
      const response = await api.get('/patient/conversations', {
        params: { filter: filterType }
      });
      setConversations(Array.isArray(response.data) ? response.data : []);
    } catch (error) {
      console.error('Error fetching conversations:', error);
      
      setConversations([]);
    } finally {
      setLoading(false);
    }
  };

  const fetchPractitioners = async () => {
    try {
      const response = await api.get('/patient/practitioners');
      setPractitioners(Array.isArray(response.data) ? response.data : []);
    } catch (error) {
      console.error('Error fetching practitioners:', error);
      setPractitioners([]);
    }
  };

  const fetchMessages = async (conversationId) => {
    try {
      const response = await api.get(`/patient/conversations/${conversationId}/messages`);
      setMessages(Array.isArray(response.data) ? response.data : []);
    } catch (error) {
      console.error('Error fetching messages:', error);
      
      setMessages([]);
    }
  };

  const sendMessage = async () => {
    if (!newMessage.trim() || !selectedConversation) return;

    try {
      const response = await api.post(`/patient/conversations/${selectedConversation._id}/messages`, {
        content: newMessage,
        type: 'text'
      });

      setMessages(prev => [...prev, response.data]);
      setNewMessage('');
      
      // Update conversation list with latest message
      setConversations(prev => prev.map(conv => 
        conv._id === selectedConversation._id 
          ? { ...conv, lastMessage: response.data, updatedAt: new Date() }
          : conv
      ));
    } catch (error) {
      console.error('Error sending message:', error);
      
    }
  };

  const startNewConversation = async () => {
    if (!selectedPractitioner || !messageSubject.trim() || !newMessage.trim()) {
      
      return;
    }

    try {
      const response = await api.post('/patient/conversations', {
        practitionerId: selectedPractitioner,
        subject: messageSubject,
        initialMessage: newMessage
      });

      setConversations(prev => [response.data, ...prev]);
      setSelectedConversation(response.data);
      setShowNewConversation(false);
      setSelectedPractitioner('');
      setMessageSubject('');
      setNewMessage('');
      
    } catch (error) {
      console.error('Error starting conversation:', error);
      
    }
  };

  const markAsRead = async (conversationId) => {
    try {
      await api.patch(`/patient/conversations/${conversationId}/read`);
      setConversations(prev => prev.map(conv => 
        conv._id === conversationId ? { ...conv, unreadCount: 0 } : conv
      ));
    } catch (error) {
      console.error('Error marking as read:', error);
    }
  };

  const archiveConversation = async (conversationId) => {
    try {
      await api.patch(`/patient/conversations/${conversationId}/archive`);
      setConversations(prev => prev.filter(conv => conv._id !== conversationId));
      if (selectedConversation?._id === conversationId) {
        setSelectedConversation(null);
        setMessages([]);
      }
      
    } catch (error) {
      console.error('Error archiving conversation:', error);
      
    }
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const formatTime = (date) => {
    return new Date(date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const formatDate = (date) => {
    const messageDate = new Date(date);
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    if (messageDate.toDateString() === today.toDateString()) {
      return 'Today';
    } else if (messageDate.toDateString() === yesterday.toDateString()) {
      return 'Yesterday';
    } else {
      return messageDate.toLocaleDateString();
    }
  };

  const filteredConversations = conversations.filter(conv =>
    conv.practitioner?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    conv.subject?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    conv.lastMessage?.content?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getMessageStatus = (message) => {
    if (message.status === 'sent') return <Clock className="h-3 w-3 text-gray-400" />;
    if (message.status === 'delivered') return <CheckCircle className="h-3 w-3 text-blue-400" />;
    if (message.status === 'read') return <CheckCircle className="h-3 w-3 text-green-400" />;
    return null;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-500"></div>
      </div>
    );
  }

  return (
    <div className="h-screen flex bg-white">
      {/* Sidebar - Conversations List */}
      <div className="w-1/3 border-r border-gray-200 flex flex-col">
        {/* Header */}
        <div className="p-4 border-b border-gray-200">
          <div className="flex items-center justify-between mb-4">
            <h1 className="text-xl font-bold text-gray-900">Messages</h1>
            <div className="flex items-center space-x-2">
              <button
                onClick={() => setShowNewConversation(true)}
                className="p-2 bg-green-600 text-white rounded-full hover:bg-green-700"
                title="New Message"
              >
                <Plus className="h-4 w-4" />
              </button>
              <button
                onClick={fetchConversations}
                className="p-2 text-gray-600 hover:bg-gray-100 rounded-full"
                title="Refresh"
              >
                <RefreshCw className="h-4 w-4" />
              </button>
            </div>
          </div>

          {/* Search */}
          <div className="relative mb-4">
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
            value={filterType}
            onChange={(e) => setFilterType(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
          >
            <option value="all">All Conversations</option>
            <option value="unread">Unread</option>
            <option value="starred">Starred</option>
            <option value="archived">Archived</option>
          </select>
        </div>

        {/* Conversations List */}
        <div className="flex-1 overflow-y-auto">
          {filteredConversations.length > 0 ? (
            filteredConversations.map((conversation) => (
              <div
                key={conversation._id}
                onClick={() => setSelectedConversation(conversation)}
                className={`p-4 border-b border-gray-100 cursor-pointer hover:bg-gray-50 ${
                  selectedConversation?._id === conversation._id ? 'bg-green-50 border-l-4 border-l-green-500' : ''
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-gray-300 rounded-full flex items-center justify-center">
                      <User className="h-5 w-5 text-gray-600" />
                    </div>
                    <div>
                      <h3 className="font-medium text-gray-900">
                        Dr. {conversation.practitioner?.name}
                      </h3>
                      <p className="text-sm text-gray-600">{conversation.practitioner?.specialization}</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    {conversation.unreadCount > 0 && (
                      <span className="bg-green-500 text-white text-xs rounded-full px-2 py-1">
                        {conversation.unreadCount}
                      </span>
                    )}
                    <span className="text-xs text-gray-500">
                      {formatTime(conversation.updatedAt)}
                    </span>
                  </div>
                </div>
                
                <div className="mb-2">
                  <h4 className="text-sm font-medium text-gray-900 mb-1">
                    {conversation.subject}
                  </h4>
                  {conversation.lastMessage && (
                    <p className="text-sm text-gray-600 truncate">
                      {conversation.lastMessage.sender === 'patient' ? 'You: ' : ''}
                      {conversation.lastMessage.content}
                    </p>
                  )}
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-xs text-gray-500">
                    {formatDate(conversation.updatedAt)}
                  </span>
                  <div className="flex items-center space-x-1">
                    {conversation.isStarred && (
                      <Star className="h-3 w-3 text-yellow-500 fill-current" />
                    )}
                    {conversation.priority === 'urgent' && (
                      <AlertCircle className="h-3 w-3 text-red-500" />
                    )}
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="p-8 text-center">
              <MessageCircle className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No conversations</h3>
              <p className="text-gray-500 mb-4">Start a conversation with your practitioner</p>
              <button
                onClick={() => setShowNewConversation(true)}
                className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700"
              >
                Start New Conversation
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col">
        {selectedConversation ? (
          <>
            {/* Chat Header */}
            <div className="p-4 border-b border-gray-200 bg-white">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-gray-300 rounded-full flex items-center justify-center">
                    <User className="h-5 w-5 text-gray-600" />
                  </div>
                  <div>
                    <h2 className="font-semibold text-gray-900">
                      Dr. {selectedConversation.practitioner?.name}
                    </h2>
                    <p className="text-sm text-gray-600">
                      {selectedConversation.practitioner?.specialization}
                    </p>
                  </div>
                </div>
                
                <div className="flex items-center space-x-2">
                  <button className="p-2 text-gray-600 hover:bg-gray-100 rounded-full">
                    <Phone className="h-5 w-5" />
                  </button>
                  <button className="p-2 text-gray-600 hover:bg-gray-100 rounded-full">
                    <Video className="h-5 w-5" />
                  </button>
                  <button className="p-2 text-gray-600 hover:bg-gray-100 rounded-full">
                    <MoreVertical className="h-5 w-5" />
                  </button>
                </div>
              </div>
              
              <div className="mt-2">
                <h3 className="text-sm font-medium text-gray-900">
                  {selectedConversation.subject}
                </h3>
              </div>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {messages.map((message) => (
                <div
                  key={message._id}
                  className={`flex ${message.sender === 'patient' ? 'justify-end' : 'justify-start'}`}
                >
                  <div
                    className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
                      message.sender === 'patient'
                        ? 'bg-green-500 text-white'
                        : 'bg-gray-200 text-gray-900'
                    }`}
                  >
                    <p className="text-sm">{message.content}</p>
                    <div className={`flex items-center justify-between mt-1 ${
                      message.sender === 'patient' ? 'text-green-100' : 'text-gray-500'
                    }`}>
                      <span className="text-xs">{formatTime(message.createdAt)}</span>
                      {message.sender === 'patient' && (
                        <div className="ml-2">
                          {getMessageStatus(message)}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
              <div ref={messagesEndRef} />
            </div>

            {/* Message Input */}
            <div className="p-4 border-t border-gray-200 bg-white">
              <div className="flex items-center space-x-2">
                <button className="p-2 text-gray-600 hover:bg-gray-100 rounded-full">
                  <Paperclip className="h-5 w-5" />
                </button>
                <div className="flex-1 relative">
                  <input
                    type="text"
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
                    placeholder="Type your message..."
                    className="w-full px-4 py-2 border border-gray-300 rounded-full focus:outline-none focus:ring-2 focus:ring-green-500"
                  />
                </div>
                <button className="p-2 text-gray-600 hover:bg-gray-100 rounded-full">
                  <Smile className="h-5 w-5" />
                </button>
                <button
                  onClick={sendMessage}
                  disabled={!newMessage.trim()}
                  className="p-2 bg-green-600 text-white rounded-full hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <Send className="h-5 w-5" />
                </button>
              </div>
            </div>
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center">
            <div className="text-center">
              <MessageCircle className="h-16 w-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-xl font-medium text-gray-900 mb-2">Select a conversation</h3>
              <p className="text-gray-500">Choose a conversation from the sidebar to start messaging</p>
            </div>
          </div>
        )}
      </div>

      {/* New Conversation Modal */}
      {showNewConversation && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-semibold text-gray-900">New Conversation</h3>
              <button
                onClick={() => setShowNewConversation(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                ×
              </button>
            </div>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Select Practitioner
                </label>
                <select
                  value={selectedPractitioner}
                  onChange={(e) => setSelectedPractitioner(e.target.value)}
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
                  Subject
                </label>
                <input
                  type="text"
                  value={messageSubject}
                  onChange={(e) => setMessageSubject(e.target.value)}
                  placeholder="Enter message subject..."
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Message
                </label>
                <textarea
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  rows={4}
                  placeholder="Type your message..."
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                />
              </div>
            </div>
            
            <div className="flex items-center justify-end space-x-3 mt-6">
              <button
                onClick={() => setShowNewConversation(false)}
                className="px-4 py-2 bg-gray-300 text-gray-700 rounded-md hover:bg-gray-400"
              >
                Cancel
              </button>
              <button
                onClick={startNewConversation}
                disabled={!selectedPractitioner || !messageSubject.trim() || !newMessage.trim()}
                className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Start Conversation
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PatientCommunicationMessaging;

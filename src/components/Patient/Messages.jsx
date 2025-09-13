import React, { useState, useEffect, useRef } from 'react';
import { 
  MessageCircle, 
  Send, 
  Search, 
  User, 
  Phone, 
  Video,
  Paperclip,
  Smile,
  MoreVertical,
  Clock,
  Check,
  CheckCheck,
  X
} from 'lucide-react';

const Messages = () => {
  const [conversations, setConversations] = useState([]);
  const [selectedConversation, setSelectedConversation] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const messagesEndRef = useRef(null);

  useEffect(() => {
    fetchConversations();
  }, []);

  useEffect(() => {
    if (selectedConversation) {
      fetchMessages(selectedConversation._id);
    }
  }, [selectedConversation]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const fetchConversations = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('/api/patient/conversations', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await response.json();
      setConversations(data.conversations || []);
      if (data.conversations && data.conversations.length > 0) {
        setSelectedConversation(data.conversations[0]);
      }
    } catch (error) {
      console.error('Error fetching conversations:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchMessages = async (conversationId) => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`/api/patient/conversations/${conversationId}/messages`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await response.json();
      setMessages(data.messages || []);
    } catch (error) {
      console.error('Error fetching messages:', error);
    }
  };

  const sendMessage = async (e) => {
    e.preventDefault();
    if (!newMessage.trim() || !selectedConversation) return;

    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`/api/patient/conversations/${selectedConversation._id}/messages`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          content: newMessage,
          type: 'text'
        })
      });

      if (response.ok) {
        const data = await response.json();
        setMessages(prev => [...prev, data.message]);
        setNewMessage('');
        // Update conversation list with latest message
        fetchConversations();
      }
    } catch (error) {
      console.error('Error sending message:', error);
    }
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const formatTime = (timestamp) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffInHours = (now - date) / (1000 * 60 * 60);

    if (diffInHours < 24) {
      return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    } else if (diffInHours < 48) {
      return 'Yesterday';
    } else {
      return date.toLocaleDateString();
    }
  };

  const getMessageStatus = (message) => {
    if (message.readBy && message.readBy.length > 1) {
      return <CheckCheck className="h-4 w-4 text-blue-500" />;
    } else if (message.deliveredAt) {
      return <CheckCheck className="h-4 w-4 text-gray-400" />;
    } else {
      return <Check className="h-4 w-4 text-gray-400" />;
    }
  };

  const ConversationItem = ({ conversation }) => {
    const isSelected = selectedConversation?._id === conversation._id;
    const practitioner = conversation.participants.find(p => p.role === 'practitioner');
    
    return (
      <div
        onClick={() => setSelectedConversation(conversation)}
        className={`p-4 border-b border-gray-100 cursor-pointer hover:bg-gray-50 transition-colors ${
          isSelected ? 'bg-green-50 border-r-4 border-r-green-500' : ''
        }`}
      >
        <div className="flex items-start space-x-3">
          <div className="w-12 h-12 bg-gradient-to-r from-green-400 to-blue-500 rounded-full flex items-center justify-center text-white font-semibold">
            {practitioner?.firstName?.charAt(0)}{practitioner?.lastName?.charAt(0)}
          </div>
          
          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between mb-1">
              <h3 className="text-sm font-semibold text-gray-900 truncate">
                Dr. {practitioner?.firstName} {practitioner?.lastName}
              </h3>
              <span className="text-xs text-gray-500">
                {formatTime(conversation.lastMessage?.createdAt)}
              </span>
            </div>
            
            <p className="text-sm text-gray-600 truncate">
              {conversation.lastMessage?.content || 'No messages yet'}
            </p>
            
            <div className="flex items-center justify-between mt-2">
              <span className="text-xs text-gray-500">
                {practitioner?.specializations?.[0]}
              </span>
              {conversation.unreadCount > 0 && (
                <span className="bg-green-500 text-white text-xs rounded-full px-2 py-1 min-w-[20px] text-center">
                  {conversation.unreadCount}
                </span>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  };

  const MessageBubble = ({ message, isOwn }) => (
    <div className={`flex ${isOwn ? 'justify-end' : 'justify-start'} mb-4`}>
      <div className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
        isOwn 
          ? 'bg-green-500 text-white' 
          : 'bg-gray-100 text-gray-900'
      }`}>
        <p className="text-sm">{message.content}</p>
        <div className={`flex items-center justify-end mt-1 space-x-1 ${
          isOwn ? 'text-green-100' : 'text-gray-500'
        }`}>
          <span className="text-xs">{formatTime(message.createdAt)}</span>
          {isOwn && getMessageStatus(message)}
        </div>
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
    <div className="h-[calc(100vh-200px)] bg-white rounded-lg border border-gray-200 flex">
      {/* Conversations Sidebar */}
      <div className="w-1/3 border-r border-gray-200 flex flex-col">
        {/* Header */}
        <div className="p-4 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900 mb-3">Messages</h2>
          <div className="relative">
            <Search className="h-4 w-4 text-gray-400 absolute left-3 top-1/2 transform -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search conversations..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-4 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
            />
          </div>
        </div>

        {/* Conversations List */}
        <div className="flex-1 overflow-y-auto">
          {conversations.length > 0 ? (
            conversations
              .filter(conv => {
                const practitioner = conv.participants.find(p => p.role === 'practitioner');
                return practitioner && 
                  `${practitioner.firstName} ${practitioner.lastName}`
                    .toLowerCase()
                    .includes(searchTerm.toLowerCase());
              })
              .map(conversation => (
                <ConversationItem key={conversation._id} conversation={conversation} />
              ))
          ) : (
            <div className="p-8 text-center">
              <MessageCircle className="h-12 w-12 text-gray-300 mx-auto mb-3" />
              <p className="text-gray-500">No conversations yet</p>
              <p className="text-sm text-gray-400 mt-1">Start by booking an appointment</p>
            </div>
          )}
        </div>
      </div>

      {/* Chat Area */}
      <div className="flex-1 flex flex-col">
        {selectedConversation ? (
          <>
            {/* Chat Header */}
            <div className="p-4 border-b border-gray-200 bg-gray-50">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-gradient-to-r from-green-400 to-blue-500 rounded-full flex items-center justify-center text-white font-semibold">
                    {selectedConversation.participants.find(p => p.role === 'practitioner')?.firstName?.charAt(0)}
                    {selectedConversation.participants.find(p => p.role === 'practitioner')?.lastName?.charAt(0)}
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900">
                      Dr. {selectedConversation.participants.find(p => p.role === 'practitioner')?.firstName} {selectedConversation.participants.find(p => p.role === 'practitioner')?.lastName}
                    </h3>
                    <p className="text-sm text-gray-600">
                      {selectedConversation.participants.find(p => p.role === 'practitioner')?.specializations?.[0]}
                    </p>
                  </div>
                </div>
                
                <div className="flex items-center space-x-2">
                  <button className="p-2 text-gray-400 hover:text-gray-600 rounded-full hover:bg-gray-100">
                    <Phone className="h-5 w-5" />
                  </button>
                  <button className="p-2 text-gray-400 hover:text-gray-600 rounded-full hover:bg-gray-100">
                    <Video className="h-5 w-5" />
                  </button>
                  <button className="p-2 text-gray-400 hover:text-gray-600 rounded-full hover:bg-gray-100">
                    <MoreVertical className="h-5 w-5" />
                  </button>
                </div>
              </div>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {messages.length > 0 ? (
                messages.map((message) => (
                  <MessageBubble
                    key={message._id}
                    message={message}
                    isOwn={message.sender.role === 'patient'}
                  />
                ))
              ) : (
                <div className="flex items-center justify-center h-full">
                  <div className="text-center">
                    <MessageCircle className="h-12 w-12 text-gray-300 mx-auto mb-3" />
                    <p className="text-gray-500">No messages yet</p>
                    <p className="text-sm text-gray-400">Send your first message below</p>
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Message Input */}
            <div className="p-4 border-t border-gray-200 bg-gray-50">
              <form onSubmit={sendMessage} className="flex items-center space-x-3">
                <button
                  type="button"
                  className="p-2 text-gray-400 hover:text-gray-600 rounded-full hover:bg-gray-100"
                >
                  <Paperclip className="h-5 w-5" />
                </button>
                
                <div className="flex-1 relative">
                  <input
                    type="text"
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    placeholder="Type your message..."
                    className="w-full px-4 py-2 border border-gray-300 rounded-full focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  />
                  <button
                    type="button"
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    <Smile className="h-5 w-5" />
                  </button>
                </div>
                
                <button
                  type="submit"
                  disabled={!newMessage.trim()}
                  className="p-2 bg-green-500 text-white rounded-full hover:bg-green-600 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <Send className="h-5 w-5" />
                </button>
              </form>
            </div>
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center">
            <div className="text-center">
              <MessageCircle className="h-16 w-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">Select a conversation</h3>
              <p className="text-gray-600">Choose a conversation from the sidebar to start messaging</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Messages;

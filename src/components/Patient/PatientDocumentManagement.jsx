import React, { useState, useEffect } from 'react';
import { 
  FileText, Upload, Download, Eye, Trash2, Share2,
  Folder, Search, Filter, Calendar, User, Tag,
  Plus, RefreshCw, Archive, Star, Lock
} from 'lucide-react';
import api from '../../utils/api';


const PatientDocumentManagement = () => {
  const [documents, setDocuments] = useState([]);
  const [folders, setFolders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedDocument, setSelectedDocument] = useState(null);
  const [showUpload, setShowUpload] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('all');
  const [selectedFolder, setSelectedFolder] = useState('all');

  const [uploadData, setUploadData] = useState({
    file: null,
    title: '',
    description: '',
    category: 'medical',
    folderId: '',
    tags: [],
    isPrivate: false
  });

  const documentTypes = [
    { value: 'all', label: 'All Documents' },
    { value: 'medical', label: 'Medical Records' },
    { value: 'prescription', label: 'Prescriptions' },
    { value: 'lab_report', label: 'Lab Reports' },
    { value: 'insurance', label: 'Insurance' },
    { value: 'personal', label: 'Personal' },
    { value: 'other', label: 'Other' }
  ];

  useEffect(() => {
    fetchDocuments();
    fetchFolders();
  }, [filterType, selectedFolder]);

  const fetchDocuments = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (filterType !== 'all') params.append('type', filterType);
      if (selectedFolder !== 'all') params.append('folderId', selectedFolder);

      const response = await api.get(`/patient/documents?${params}`);
      setDocuments(response.data);
    } catch (error) {
      console.error('Error fetching documents:', error);
      
    } finally {
      setLoading(false);
    }
  };

  const fetchFolders = async () => {
    try {
      const response = await api.get('/patient/document-folders');
      setFolders(response.data);
    } catch (error) {
      console.error('Error fetching folders:', error);
    }
  };

  const uploadDocument = async () => {
    if (!uploadData.file || !uploadData.title) {
      
      return;
    }

    try {
      const formData = new FormData();
      formData.append('file', uploadData.file);
      formData.append('title', uploadData.title);
      formData.append('description', uploadData.description);
      formData.append('category', uploadData.category);
      formData.append('folderId', uploadData.folderId);
      formData.append('tags', JSON.stringify(uploadData.tags));
      formData.append('isPrivate', uploadData.isPrivate);

      const response = await api.post('/patient/documents', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });

      setDocuments(prev => [response.data, ...prev]);
      setShowUpload(false);
      setUploadData({
        file: null,
        title: '',
        description: '',
        category: 'medical',
        folderId: '',
        tags: [],
        isPrivate: false
      });
      
    } catch (error) {
      console.error('Error uploading document:', error);
      
    }
  };

  const downloadDocument = async (documentId, filename) => {
    try {
      const response = await api.get(`/patient/documents/${documentId}/download`, {
        responseType: 'blob'
      });
      
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', filename);
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (error) {
      console.error('Error downloading document:', error);
      
    }
  };

  const deleteDocument = async (documentId) => {
    if (!window.confirm('Are you sure you want to delete this document?')) return;

    try {
      await api.delete(`/patient/documents/${documentId}`);
      setDocuments(prev => prev.filter(doc => doc._id !== documentId));
      
    } catch (error) {
      console.error('Error deleting document:', error);
      
    }
  };

  const shareDocument = async (documentId) => {
    try {
      const response = await api.post(`/patient/documents/${documentId}/share`);
      navigator.clipboard.writeText(response.data.shareUrl);
      
    } catch (error) {
      console.error('Error sharing document:', error);
      
    }
  };

  const getFileIcon = (fileType) => {
    if (fileType?.includes('pdf')) return '📄';
    if (fileType?.includes('image')) return '🖼️';
    if (fileType?.includes('word') || fileType?.includes('doc')) return '📝';
    if (fileType?.includes('excel') || fileType?.includes('sheet')) return '📊';
    return '📄';
  };

  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const filteredDocuments = documents.filter(doc =>
    doc.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    doc.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    doc.tags?.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()))
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
          <h1 className="text-3xl font-bold text-gray-900">Document Management</h1>
          <p className="text-gray-600">Store, organize, and manage your health documents</p>
        </div>
        <div className="flex items-center space-x-3">
          <button
            onClick={() => setShowUpload(true)}
            className="flex items-center px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700"
          >
            <Upload className="h-4 w-4 mr-2" />
            Upload Document
          </button>
          <button
            onClick={fetchDocuments}
            className="flex items-center px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700"
          >
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </button>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="bg-white rounded-lg shadow p-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search documents..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
            />
          </div>
          
          <select
            value={filterType}
            onChange={(e) => setFilterType(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
          >
            {documentTypes.map((type) => (
              <option key={type.value} value={type.value}>{type.label}</option>
            ))}
          </select>
          
          <select
            value={selectedFolder}
            onChange={(e) => setSelectedFolder(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
          >
            <option value="all">All Folders</option>
            {folders.map((folder) => (
              <option key={folder._id} value={folder._id}>{folder.name}</option>
            ))}
          </select>
          
          <div className="flex items-center justify-end">
            <span className="text-sm text-gray-600">
              {filteredDocuments.length} documents
            </span>
          </div>
        </div>
      </div>

      {/* Documents Grid */}
      <div className="bg-white rounded-lg shadow">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900">Your Documents</h3>
        </div>
        
        {filteredDocuments.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 p-6">
            {filteredDocuments.map((document) => (
              <div key={document._id} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center space-x-3">
                    <div className="text-2xl">
                      {getFileIcon(document.fileType)}
                    </div>
                    <div className="flex-1">
                      <h4 className="text-lg font-medium text-gray-900 truncate">
                        {document.title}
                      </h4>
                      <p className="text-sm text-gray-600 capitalize">
                        {document.category}
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-1">
                    {document.isPrivate && (
                      <Lock className="h-4 w-4 text-gray-500" />
                    )}
                    {document.isStarred && (
                      <Star className="h-4 w-4 text-yellow-500 fill-current" />
                    )}
                  </div>
                </div>
                
                {document.description && (
                  <p className="text-sm text-gray-600 mb-3 line-clamp-2">
                    {document.description}
                  </p>
                )}
                
                <div className="flex items-center justify-between text-xs text-gray-500 mb-3">
                  <span>{formatFileSize(document.fileSize)}</span>
                  <span>{new Date(document.createdAt).toLocaleDateString()}</span>
                </div>
                
                {document.tags && document.tags.length > 0 && (
                  <div className="flex flex-wrap gap-1 mb-3">
                    {document.tags.slice(0, 3).map((tag, index) => (
                      <span
                        key={index}
                        className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800"
                      >
                        {tag}
                      </span>
                    ))}
                    {document.tags.length > 3 && (
                      <span className="text-xs text-gray-500">
                        +{document.tags.length - 3} more
                      </span>
                    )}
                  </div>
                )}
                
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => setSelectedDocument(document)}
                      className="p-2 text-gray-600 hover:bg-gray-100 rounded-full"
                      title="View Details"
                    >
                      <Eye className="h-4 w-4" />
                    </button>
                    
                    <button
                      onClick={() => downloadDocument(document._id, document.filename)}
                      className="p-2 text-blue-600 hover:bg-blue-100 rounded-full"
                      title="Download"
                    >
                      <Download className="h-4 w-4" />
                    </button>
                    
                    <button
                      onClick={() => shareDocument(document._id)}
                      className="p-2 text-green-600 hover:bg-green-100 rounded-full"
                      title="Share"
                    >
                      <Share2 className="h-4 w-4" />
                    </button>
                  </div>
                  
                  <button
                    onClick={() => deleteDocument(document._id)}
                    className="p-2 text-red-600 hover:bg-red-100 rounded-full"
                    title="Delete"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="p-12 text-center">
            <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No documents found</h3>
            <p className="text-gray-500 mb-4">
              {searchTerm ? 'Try adjusting your search terms.' : 'Upload your first document to get started.'}
            </p>
            <button
              onClick={() => setShowUpload(true)}
              className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700"
            >
              Upload Document
            </button>
          </div>
        )}
      </div>

      {/* Upload Modal */}
      {showUpload && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-semibold text-gray-900">Upload Document</h3>
              <button
                onClick={() => setShowUpload(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                ×
              </button>
            </div>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Select File
                </label>
                <input
                  type="file"
                  onChange={(e) => setUploadData(prev => ({ ...prev, file: e.target.files[0] }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Document Title
                </label>
                <input
                  type="text"
                  value={uploadData.title}
                  onChange={(e) => setUploadData(prev => ({ ...prev, title: e.target.value }))}
                  placeholder="Enter document title..."
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Description (Optional)
                </label>
                <textarea
                  value={uploadData.description}
                  onChange={(e) => setUploadData(prev => ({ ...prev, description: e.target.value }))}
                  rows={3}
                  placeholder="Brief description..."
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Category
                </label>
                <select
                  value={uploadData.category}
                  onChange={(e) => setUploadData(prev => ({ ...prev, category: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                >
                  {documentTypes.slice(1).map((type) => (
                    <option key={type.value} value={type.value}>{type.label}</option>
                  ))}
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Folder (Optional)
                </label>
                <select
                  value={uploadData.folderId}
                  onChange={(e) => setUploadData(prev => ({ ...prev, folderId: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                >
                  <option value="">No folder</option>
                  {folders.map((folder) => (
                    <option key={folder._id} value={folder._id}>{folder.name}</option>
                  ))}
                </select>
              </div>
              
              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="isPrivate"
                  checked={uploadData.isPrivate}
                  onChange={(e) => setUploadData(prev => ({ ...prev, isPrivate: e.target.checked }))}
                  className="h-4 w-4 text-green-600 focus:ring-green-500 border-gray-300 rounded"
                />
                <label htmlFor="isPrivate" className="ml-2 block text-sm text-gray-900">
                  Mark as private
                </label>
              </div>
            </div>
            
            <div className="flex items-center justify-end space-x-3 mt-6">
              <button
                onClick={() => setShowUpload(false)}
                className="px-4 py-2 bg-gray-300 text-gray-700 rounded-md hover:bg-gray-400"
              >
                Cancel
              </button>
              <button
                onClick={uploadDocument}
                disabled={!uploadData.file || !uploadData.title}
                className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Upload
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Document Detail Modal */}
      {selectedDocument && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-2xl max-h-screen overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-semibold text-gray-900">Document Details</h3>
              <button
                onClick={() => setSelectedDocument(null)}
                className="text-gray-400 hover:text-gray-600"
              >
                ×
              </button>
            </div>
            
            <div className="space-y-6">
              <div className="flex items-center space-x-4">
                <div className="text-4xl">
                  {getFileIcon(selectedDocument.fileType)}
                </div>
                <div>
                  <h4 className="text-xl font-bold text-gray-900">{selectedDocument.title}</h4>
                  <p className="text-gray-600 capitalize">{selectedDocument.category}</p>
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h5 className="font-medium text-gray-900 mb-2">File Information</h5>
                  <div className="space-y-2 text-sm">
                    <p><span className="font-medium">Size:</span> {formatFileSize(selectedDocument.fileSize)}</p>
                    <p><span className="font-medium">Type:</span> {selectedDocument.fileType}</p>
                    <p><span className="font-medium">Uploaded:</span> {new Date(selectedDocument.createdAt).toLocaleDateString()}</p>
                    <p><span className="font-medium">Privacy:</span> {selectedDocument.isPrivate ? 'Private' : 'Shared'}</p>
                  </div>
                </div>
                
                <div>
                  <h5 className="font-medium text-gray-900 mb-2">Organization</h5>
                  <div className="space-y-2 text-sm">
                    <p><span className="font-medium">Category:</span> {selectedDocument.category}</p>
                    {selectedDocument.folder && (
                      <p><span className="font-medium">Folder:</span> {selectedDocument.folder.name}</p>
                    )}
                    {selectedDocument.tags && selectedDocument.tags.length > 0 && (
                      <div>
                        <span className="font-medium">Tags:</span>
                        <div className="flex flex-wrap gap-1 mt-1">
                          {selectedDocument.tags.map((tag, index) => (
                            <span
                              key={index}
                              className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800"
                            >
                              {tag}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
              
              {selectedDocument.description && (
                <div>
                  <h5 className="font-medium text-gray-900 mb-2">Description</h5>
                  <p className="text-sm text-gray-700">{selectedDocument.description}</p>
                </div>
              )}
              
              <div className="flex space-x-3">
                <button
                  onClick={() => downloadDocument(selectedDocument._id, selectedDocument.filename)}
                  className="flex-1 flex items-center justify-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                >
                  <Download className="h-4 w-4 mr-2" />
                  Download
                </button>
                <button
                  onClick={() => shareDocument(selectedDocument._id)}
                  className="flex-1 flex items-center justify-center px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700"
                >
                  <Share2 className="h-4 w-4 mr-2" />
                  Share
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PatientDocumentManagement;

import { api } from './api.js';

// Unified Data Management Utility
export class DataManager {
  constructor(endpoint) {
    this.endpoint = endpoint;
  }

  // Generic CRUD Operations
  async create(data) {
    try {
      const response = await api.post(`/${this.endpoint}`, data);
      return { success: true, data: response.data };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  async getAll(params = {}) {
    try {
      const response = await api.get(`/${this.endpoint}`, { params });
      return { success: true, data: response.data };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  async getById(id) {
    try {
      const response = await api.get(`/${this.endpoint}/${id}`);
      return { success: true, data: response.data };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  async update(id, data) {
    try {
      const response = await api.put(`/${this.endpoint}/${id}`, data);
      return { success: true, data: response.data };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  async delete(id) {
    try {
      const response = await api.delete(`/${this.endpoint}/${id}`);
      return { success: true, data: response.data };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  async search(query, filters = {}) {
    try {
      const response = await api.get(`/${this.endpoint}/search`, {
        params: { query, ...filters }
      });
      return { success: true, data: response.data };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  async bulkOperation(operation, items) {
    try {
      const response = await api.post(`/${this.endpoint}/bulk`, {
        operation,
        items
      });
      return { success: true, data: response.data };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }
}

// Specialized Data Managers
export const appointmentManager = new DataManager('appointments');
export const patientManager = new DataManager('patients');
export const practitionerManager = new DataManager('practitioners');
export const medicalRecordManager = new DataManager('medical-records');
export const therapyPlanManager = new DataManager('therapy-plans');
export const invoiceManager = new DataManager('invoices');
export const reviewManager = new DataManager('reviews');
export const notificationManager = new DataManager('notifications');
export const userManager = new DataManager('users');

// Ayurvedic-specific data managers
export const doshaManager = new DataManager('dosha-assessments');
export const treatmentManager = new DataManager('treatments');
export const herbalMedicineManager = new DataManager('herbal-medicines');
export const panchakarmaManager = new DataManager('panchakarma-sessions');

// Data validation utilities
export const validators = {
  email: (email) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email),
  phone: (phone) => /^[+]?[\d\s-()]+$/.test(phone),
  indianPhone: (phone) => /^[+]?91?[6-9]\d{9}$/.test(phone.replace(/\s|-/g, '')),
  required: (value) => value !== null && value !== undefined && value !== '',
  minLength: (value, min) => value && value.length >= min,
  maxLength: (value, max) => value && value.length <= max,
  dateRange: (startDate, endDate) => new Date(startDate) <= new Date(endDate),
  doshaType: (dosha) => ['Vata', 'Pitta', 'Kapha', 'Vata-Pitta', 'Pitta-Kapha', 'Vata-Kapha', 'Tridosha'].includes(dosha)
};

// Form validation helper
export const validateForm = (data, rules) => {
  const errors = {};
  
  Object.keys(rules).forEach(field => {
    const value = data[field];
    const fieldRules = rules[field];
    
    fieldRules.forEach(rule => {
      if (typeof rule === 'function') {
        if (!rule(value)) {
          errors[field] = errors[field] || [];
          errors[field].push(`Invalid ${field}`);
        }
      } else if (typeof rule === 'object') {
        const { validator, message } = rule;
        if (!validator(value)) {
          errors[field] = errors[field] || [];
          errors[field].push(message);
        }
      }
    });
  });
  
  return {
    isValid: Object.keys(errors).length === 0,
    errors
  };
};

// Data export utilities
export const exportData = {
  toCSV: (data, filename) => {
    const csv = convertToCSV(data);
    downloadFile(csv, `${filename}.csv`, 'text/csv');
  },
  
  toJSON: (data, filename) => {
    const json = JSON.stringify(data, null, 2);
    downloadFile(json, `${filename}.json`, 'application/json');
  },
  
  toPDF: async (data, filename, template) => {
    // PDF generation logic would go here
    console.log('PDF export functionality to be implemented');
  }
};

// Helper functions
const convertToCSV = (data) => {
  if (!data || data.length === 0) return '';
  
  const headers = Object.keys(data[0]);
  const csvContent = [
    headers.join(','),
    ...data.map(row => headers.map(header => `"${row[header] || ''}"`).join(','))
  ].join('\n');
  
  return csvContent;
};

const downloadFile = (content, filename, contentType) => {
  const blob = new Blob([content], { type: contentType });
  const url = window.URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  window.URL.revokeObjectURL(url);
};

// Real-time data synchronization
export class DataSync {
  constructor() {
    this.subscribers = new Map();
    this.wsConnection = null;
  }

  subscribe(dataType, callback) {
    if (!this.subscribers.has(dataType)) {
      this.subscribers.set(dataType, new Set());
    }
    this.subscribers.get(dataType).add(callback);
  }

  unsubscribe(dataType, callback) {
    if (this.subscribers.has(dataType)) {
      this.subscribers.get(dataType).delete(callback);
    }
  }

  notify(dataType, data) {
    if (this.subscribers.has(dataType)) {
      this.subscribers.get(dataType).forEach(callback => callback(data));
    }
  }

  initWebSocket() {
    // WebSocket connection logic for real-time updates
    // This would connect to your backend WebSocket server
  }
}

export const dataSync = new DataSync();

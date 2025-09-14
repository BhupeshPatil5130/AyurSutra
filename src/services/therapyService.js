import api from '../utils/api';

// Therapy scheduling service
export const therapyService = {
  // Schedule a new therapy session
  async scheduleTherapy(therapyData) {
    try {
      const response = await api.post('/therapies/schedule', therapyData);
      return response.data;
    } catch (error) {
      console.error('Error scheduling therapy:', error);
      throw error;
    }
  },

  // Get ready queue (scheduled therapies)
  async getReadyTherapies() {
    try {
      const response = await api.get('/therapies/ready');
      return response.data;
    } catch (error) {
      console.error('Error fetching ready therapies:', error);
      throw error;
    }
  },

  // Get waiting queue
  async getWaitingTherapies() {
    try {
      const response = await api.get('/therapies/waiting');
      return response.data;
    } catch (error) {
      console.error('Error fetching waiting therapies:', error);
      throw error;
    }
  },

  // Move therapy to waiting queue
  async moveToWaitingQueue(therapyId, reason) {
    try {
      const response = await api.patch(`/therapies/cancel/${therapyId}`, { reason });
      return response.data;
    } catch (error) {
      console.error('Error moving therapy to waiting queue:', error);
      throw error;
    }
  },

  // Reschedule waiting therapies
  async rescheduleTherapies() {
    try {
      const response = await api.post('/therapies/reschedule');
      return response.data;
    } catch (error) {
      console.error('Error rescheduling therapies:', error);
      throw error;
    }
  }
};

export default therapyService;

import React, { useState, useEffect } from 'react';
import { 
  Calendar, Clock, Plus, Edit, Trash2, Save, X, RefreshCw,
  CheckCircle, AlertCircle, Settings, Copy, Download, Upload
} from 'lucide-react';
import api from '../../utils/api';
import toast from 'react-hot-toast';

const AvailabilityScheduleManagement = () => {
  const [availability, setAvailability] = useState({});
  const [timeSlots, setTimeSlots] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [selectedWeek, setSelectedWeek] = useState(new Date());
  const [showModal, setShowModal] = useState(false);
  const [modalType, setModalType] = useState('add');
  const [selectedSlot, setSelectedSlot] = useState(null);

  const daysOfWeek = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
  
  const [scheduleData, setScheduleData] = useState({
    Monday: { isWorking: true, slots: [{ start: '09:00', end: '17:00', breakStart: '13:00', breakEnd: '14:00' }] },
    Tuesday: { isWorking: true, slots: [{ start: '09:00', end: '17:00', breakStart: '13:00', breakEnd: '14:00' }] },
    Wednesday: { isWorking: true, slots: [{ start: '09:00', end: '17:00', breakStart: '13:00', breakEnd: '14:00' }] },
    Thursday: { isWorking: true, slots: [{ start: '09:00', end: '17:00', breakStart: '13:00', breakEnd: '14:00' }] },
    Friday: { isWorking: true, slots: [{ start: '09:00', end: '17:00', breakStart: '13:00', breakEnd: '14:00' }] },
    Saturday: { isWorking: false, slots: [] },
    Sunday: { isWorking: false, slots: [] }
  });

  useEffect(() => {
    fetchAvailability();
    fetchTimeSlots();
  }, [selectedWeek]);

  const fetchAvailability = async () => {
    try {
      setLoading(true);
      const response = await api.get('/practitioner/availability');
      setAvailability(response.data || {});
      if (response.data?.schedule) {
        setScheduleData(response.data.schedule);
      }
    } catch (error) {
      console.error('Error fetching availability:', error);
      setAvailability({});
      toast.error('Error loading availability');
    } finally {
      setLoading(false);
    }
  };

  const fetchTimeSlots = async () => {
    try {
      const weekStart = getWeekStart(selectedWeek);
      const weekEnd = getWeekEnd(selectedWeek);
      
      const response = await api.get(`/practitioner/time-slots?start=${weekStart}&end=${weekEnd}`);
      setTimeSlots(Array.isArray(response.data) ? response.data : []);
    } catch (error) {
      console.error('Error fetching time slots:', error);
      setTimeSlots([]);
    }
  };

  const saveAvailability = async () => {
    try {
      await api.put('/practitioner/availability', {
        schedule: scheduleData,
        timezone: Intl.DateTimeFormat().resolvedOptions().timeZone
      });
      toast.success('Availability updated successfully');
      setEditing(false);
      fetchAvailability();
    } catch (error) {
      console.error('Error saving availability:', error);
      toast.error('Error saving availability');
    }
  };

  const addTimeSlot = (day, slotData) => {
    setScheduleData(prev => ({
      ...prev,
      [day]: {
        ...prev[day],
        slots: [...prev[day].slots, slotData]
      }
    }));
  };

  const removeTimeSlot = (day, index) => {
    setScheduleData(prev => ({
      ...prev,
      [day]: {
        ...prev[day],
        slots: prev[day].slots.filter((_, i) => i !== index)
      }
    }));
  };

  const updateTimeSlot = (day, index, field, value) => {
    setScheduleData(prev => ({
      ...prev,
      [day]: {
        ...prev[day],
        slots: prev[day].slots.map((slot, i) => 
          i === index ? { ...slot, [field]: value } : slot
        )
      }
    }));
  };

  const toggleWorkingDay = (day) => {
    setScheduleData(prev => ({
      ...prev,
      [day]: {
        ...prev[day],
        isWorking: !prev[day].isWorking,
        slots: !prev[day].isWorking ? [{ start: '09:00', end: '17:00', breakStart: '13:00', breakEnd: '14:00' }] : []
      }
    }));
  };

  const copySchedule = (fromDay, toDay) => {
    setScheduleData(prev => ({
      ...prev,
      [toDay]: {
        ...prev[fromDay]
      }
    }));
  };

  const getWeekStart = (date) => {
    const d = new Date(date);
    const day = d.getDay();
    const diff = d.getDate() - day + (day === 0 ? -6 : 1);
    return new Date(d.setDate(diff)).toISOString().split('T')[0];
  };

  const getWeekEnd = (date) => {
    const d = new Date(date);
    const day = d.getDay();
    const diff = d.getDate() - day + (day === 0 ? 0 : 7);
    return new Date(d.setDate(diff)).toISOString().split('T')[0];
  };

  const navigateWeek = (direction) => {
    const newWeek = new Date(selectedWeek);
    newWeek.setDate(newWeek.getDate() + (direction * 7));
    setSelectedWeek(newWeek);
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
          <h1 className="text-3xl font-bold text-gray-900">Availability & Schedule Management</h1>
          <p className="text-gray-600">Manage your working hours and availability</p>
        </div>
        <div className="flex items-center space-x-3">
          {editing ? (
            <>
              <button
                onClick={() => setEditing(false)}
                className="flex items-center px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700"
              >
                <X className="h-4 w-4 mr-2" />
                Cancel
              </button>
              <button
                onClick={saveAvailability}
                className="flex items-center px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700"
              >
                <Save className="h-4 w-4 mr-2" />
                Save Changes
              </button>
            </>
          ) : (
            <>
              <button
                onClick={fetchAvailability}
                className="flex items-center px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700"
              >
                <RefreshCw className="h-4 w-4 mr-2" />
                Refresh
              </button>
              <button
                onClick={() => setEditing(true)}
                className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
              >
                <Edit className="h-4 w-4 mr-2" />
                Edit Schedule
              </button>
            </>
          )}
        </div>
      </div>

      {/* Week Navigation */}
      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900">Weekly Schedule</h3>
          <div className="flex items-center space-x-4">
            <button
              onClick={() => navigateWeek(-1)}
              className="p-2 text-gray-600 hover:bg-gray-100 rounded-md"
            >
              ←
            </button>
            <span className="text-sm font-medium text-gray-900">
              Week of {getWeekStart(selectedWeek)}
            </span>
            <button
              onClick={() => navigateWeek(1)}
              className="p-2 text-gray-600 hover:bg-gray-100 rounded-md"
            >
              →
            </button>
          </div>
        </div>

        {/* Schedule Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-7 gap-4">
          {daysOfWeek.map((day) => (
            <div key={day} className="border border-gray-200 rounded-lg p-4">
              <div className="flex items-center justify-between mb-3">
                <h4 className="font-medium text-gray-900">{day}</h4>
                {editing && (
                  <div className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      checked={scheduleData[day]?.isWorking || false}
                      onChange={() => toggleWorkingDay(day)}
                      className="rounded border-gray-300 text-green-600 focus:ring-green-500"
                    />
                    <span className="text-xs text-gray-500">Working</span>
                  </div>
                )}
              </div>

              {scheduleData[day]?.isWorking ? (
                <div className="space-y-3">
                  {scheduleData[day]?.slots?.map((slot, index) => (
                    <div key={index} className="bg-gray-50 p-3 rounded-md">
                      {editing ? (
                        <div className="space-y-2">
                          <div className="grid grid-cols-2 gap-2">
                            <input
                              type="time"
                              value={slot.start}
                              onChange={(e) => updateTimeSlot(day, index, 'start', e.target.value)}
                              className="text-xs px-2 py-1 border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-green-500"
                            />
                            <input
                              type="time"
                              value={slot.end}
                              onChange={(e) => updateTimeSlot(day, index, 'end', e.target.value)}
                              className="text-xs px-2 py-1 border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-green-500"
                            />
                          </div>
                          <div className="grid grid-cols-2 gap-2">
                            <input
                              type="time"
                              value={slot.breakStart}
                              onChange={(e) => updateTimeSlot(day, index, 'breakStart', e.target.value)}
                              placeholder="Break start"
                              className="text-xs px-2 py-1 border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-green-500"
                            />
                            <input
                              type="time"
                              value={slot.breakEnd}
                              onChange={(e) => updateTimeSlot(day, index, 'breakEnd', e.target.value)}
                              placeholder="Break end"
                              className="text-xs px-2 py-1 border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-green-500"
                            />
                          </div>
                          <div className="flex justify-between">
                            <button
                              onClick={() => removeTimeSlot(day, index)}
                              className="text-xs text-red-600 hover:text-red-800"
                            >
                              <Trash2 className="h-3 w-3" />
                            </button>
                            <button
                              onClick={() => copySchedule(day, 'Tuesday')}
                              className="text-xs text-blue-600 hover:text-blue-800"
                              title="Copy to other days"
                            >
                              <Copy className="h-3 w-3" />
                            </button>
                          </div>
                        </div>
                      ) : (
                        <div className="text-sm">
                          <div className="flex items-center justify-between">
                            <span className="text-gray-900">{slot.start} - {slot.end}</span>
                            <CheckCircle className="h-4 w-4 text-green-500" />
                          </div>
                          {slot.breakStart && slot.breakEnd && (
                            <div className="text-xs text-gray-500 mt-1">
                              Break: {slot.breakStart} - {slot.breakEnd}
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  ))}
                  
                  {editing && (
                    <button
                      onClick={() => addTimeSlot(day, { start: '09:00', end: '17:00', breakStart: '13:00', breakEnd: '14:00' })}
                      className="w-full p-2 border-2 border-dashed border-gray-300 rounded-md text-gray-500 hover:border-green-500 hover:text-green-500"
                    >
                      <Plus className="h-4 w-4 mx-auto" />
                    </button>
                  )}
                </div>
              ) : (
                <div className="text-center py-4">
                  <AlertCircle className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                  <p className="text-sm text-gray-500">Not working</p>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Quick Actions */}
      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <button className="flex items-center justify-center p-4 border border-gray-200 rounded-lg hover:bg-gray-50">
            <Settings className="h-6 w-6 text-gray-600 mr-3" />
            <div className="text-left">
              <p className="font-medium text-gray-900">Set Default Hours</p>
              <p className="text-sm text-gray-500">Apply standard working hours</p>
            </div>
          </button>
          
          <button className="flex items-center justify-center p-4 border border-gray-200 rounded-lg hover:bg-gray-50">
            <Copy className="h-6 w-6 text-gray-600 mr-3" />
            <div className="text-left">
              <p className="font-medium text-gray-900">Copy Week</p>
              <p className="text-sm text-gray-500">Duplicate to next week</p>
            </div>
          </button>
          
          <button className="flex items-center justify-center p-4 border border-gray-200 rounded-lg hover:bg-gray-50">
            <Download className="h-6 w-6 text-gray-600 mr-3" />
            <div className="text-left">
              <p className="font-medium text-gray-900">Export Schedule</p>
              <p className="text-sm text-gray-500">Download as CSV</p>
            </div>
          </button>
        </div>
      </div>

      {/* Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="p-2 bg-blue-100 rounded-lg">
              <Clock className="h-6 w-6 text-blue-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Weekly Hours</p>
              <p className="text-2xl font-bold text-gray-900">
                {Object.values(scheduleData).reduce((total, day) => {
                  if (!day.isWorking) return total;
                  return total + day.slots.reduce((dayTotal, slot) => {
                    const start = new Date(`2000-01-01T${slot.start}`);
                    const end = new Date(`2000-01-01T${slot.end}`);
                    const breakStart = slot.breakStart ? new Date(`2000-01-01T${slot.breakStart}`) : null;
                    const breakEnd = slot.breakEnd ? new Date(`2000-01-01T${slot.breakEnd}`) : null;
                    
                    let hours = (end - start) / (1000 * 60 * 60);
                    if (breakStart && breakEnd) {
                      hours -= (breakEnd - breakStart) / (1000 * 60 * 60);
                    }
                    return dayTotal + hours;
                  }, 0);
                }, 0)}h
              </p>
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="p-2 bg-green-100 rounded-lg">
              <Calendar className="h-6 w-6 text-green-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Working Days</p>
              <p className="text-2xl font-bold text-gray-900">
                {Object.values(scheduleData).filter(day => day.isWorking).length}
              </p>
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="p-2 bg-purple-100 rounded-lg">
              <CheckCircle className="h-6 w-6 text-purple-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Available Slots</p>
              <p className="text-2xl font-bold text-gray-900">{timeSlots.filter(slot => slot.isAvailable).length}</p>
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="p-2 bg-yellow-100 rounded-lg">
              <AlertCircle className="h-6 w-6 text-yellow-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Booked Slots</p>
              <p className="text-2xl font-bold text-gray-900">{timeSlots.filter(slot => !slot.isAvailable).length}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AvailabilityScheduleManagement;

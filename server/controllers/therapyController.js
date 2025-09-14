import Therapy from '../models/Therapy.js';
import { v4 as uuidv4 } from 'uuid';

// Schedule therapy
export const scheduleTherapy = async (req, res) => {
  try {
    const { practitionerId, patientId, timeSlot, priority } = req.body;
    const newTherapy = new Therapy({
      sessionId: uuidv4(),
      practitionerId,
      patientId,
      timeSlot,
      priority,
      status: 'scheduled'   
    });
    await newTherapy.save();
    console.log(newTherapy);
    res.json({ message: 'Therapy scheduled successfully', therapy: newTherapy });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Get ready queue
export const getReadyTherapies = async (req, res) => {
  try {
    const therapies = await Therapy.find({ status: 'scheduled' }).sort({ priority: -1, timeSlot: 1 });
    console.log(therapies);
    res.json(therapies);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Get waiting queue
export const getWaitingTherapies = async (req, res) => {
  try {
    const therapies = await Therapy.find({ status: 'waiting' }).sort({ priority: -1 });
    res.json(therapies);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Move therapy to waiting
export const moveToWaitingQueue = async (req, res) => {
  try {
    const therapy = await Therapy.findById(req.params.id);
    if (!therapy) return res.status(404).json({ message: 'Therapy not found' });

    therapy.status = 'waiting';
    therapy.reason = req.body.reason || 'Unforeseen event';
    await therapy.save();

    res.json({ message: 'Therapy moved to waiting queue', therapy });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Reschedule waiting therapies
export const rescheduleTherapies = async (req, res) => {
  try {
    const waitingTherapies = await Therapy.find({ status: 'waiting' }).sort({ priority: -1 });
    const readySlots = await Therapy.find({ status: 'scheduled' });

    let rescheduled = [];

    for (let therapy of waitingTherapies) {
      for (let slot of readySlots) {
        if (new Date(therapy.timeSlot).getTime() !== new Date(slot.timeSlot).getTime()) {
          therapy.timeSlot = slot.timeSlot;
          therapy.status = 'scheduled';
          therapy.reason = '';
          await therapy.save();
          rescheduled.push(therapy);
          break;  // move to next therapy
        }
      }
    }

    if (rescheduled.length === 0) {
      return res.json({ message: 'No suitable slot available to reschedule' });
    }

    res.json({ message: 'Therapies rescheduled', therapies: rescheduled });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

import express from 'express';
import { authenticate } from '../middleware/auth.js';
import { validateCommonParams } from '../middleware/validation.js';
import Notification from '../models/Notification.js';
import emailService from '../services/emailService.js';
import User from '../models/User.js';

const router = express.Router();

// Apply authentication to all routes
router.use(authenticate);

// Get user notifications
router.get('/', validateCommonParams, async (req, res) => {
  try {
    const { page = 1, limit = 20, isRead, type, priority } = req.query;
    
    let query = { userId: req.user._id };
    if (isRead !== undefined) {
      query.isRead = isRead === 'true';
    }
    if (type) {
      query.type = type;
    }
    if (priority) {
      query.priority = priority;
    }

    const notifications = await Notification.find(query)
      .populate('relatedId')
      .populate('createdBy', 'firstName lastName role')
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await Notification.countDocuments(query);
    const unreadCount = await Notification.countDocuments({ 
      userId: req.user._id, 
      isRead: false 
    });

    // Get notification counts by type
    const notificationStats = await Notification.aggregate([
      { $match: { userId: req.user._id } },
      {
        $group: {
          _id: '$type',
          count: { $sum: 1 },
          unreadCount: {
            $sum: { $cond: [{ $eq: ['$isRead', false] }, 1, 0] }
          }
        }
      }
    ]);

    res.json({
      notifications,
      totalPages: Math.ceil(total / limit),
      currentPage: parseInt(page),
      total,
      unreadCount,
      stats: notificationStats
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Mark notification as read
router.put('/:id/read', async (req, res) => {
  try {
    const notification = await Notification.findOne({
      _id: req.params.id,
      userId: req.user._id
    });

    if (!notification) {
      return res.status(404).json({ message: 'Notification not found' });
    }

    notification.isRead = true;
    await notification.save();

    res.json({ message: 'Notification marked as read' });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Mark all notifications as read
router.put('/mark-all-read', async (req, res) => {
  try {
    await Notification.updateMany(
      { userId: req.user._id, isRead: false },
      { isRead: true }
    );

    res.json({ message: 'All notifications marked as read' });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Delete notification
router.delete('/:id', async (req, res) => {
  try {
    const notification = await Notification.findOneAndDelete({
      _id: req.params.id,
      userId: req.user._id
    });

    if (!notification) {
      return res.status(404).json({ message: 'Notification not found' });
    }

    res.json({ message: 'Notification deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Delete all read notifications
router.delete('/read/all', async (req, res) => {
  try {
    const result = await Notification.deleteMany({
      userId: req.user._id,
      isRead: true
    });

    res.json({ 
      message: 'All read notifications deleted successfully',
      deletedCount: result.deletedCount
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Get notification preferences
router.get('/preferences', async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select('notificationPreferences');
    
    res.json({
      preferences: user.notificationPreferences || {
        email: true,
        push: true,
        sms: false,
        types: {
          appointment: true,
          reminder: true,
          billing: true,
          system: true,
          marketing: false
        }
      }
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Update notification preferences
router.put('/preferences', async (req, res) => {
  try {
    const { email, push, sms, types } = req.body;
    
    const user = await User.findById(req.user._id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    user.notificationPreferences = {
      email: email !== undefined ? email : user.notificationPreferences?.email || true,
      push: push !== undefined ? push : user.notificationPreferences?.push || true,
      sms: sms !== undefined ? sms : user.notificationPreferences?.sms || false,
      types: {
        ...user.notificationPreferences?.types,
        ...types
      }
    };

    await user.save();

    res.json({ 
      message: 'Notification preferences updated successfully',
      preferences: user.notificationPreferences
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Send test notification
router.post('/test', async (req, res) => {
  try {
    const { title, message, type = 'system', priority = 'low' } = req.body;

    if (!title || !message) {
      return res.status(400).json({ message: 'Title and message are required' });
    }

    const notification = new Notification({
      userId: req.user._id,
      title,
      message,
      type,
      priority
    });

    await notification.save();

    // Send real-time notification
    req.io.to(req.user._id.toString()).emit('notification', notification);

    // Send email if preferences allow
    const user = await User.findById(req.user._id);
    if (user.notificationPreferences?.email && user.notificationPreferences?.types?.[type]) {
      await emailService.sendSystemNotificationEmail(user, notification);
    }

    res.json({ 
      message: 'Test notification sent successfully',
      notification
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Get notification summary
router.get('/summary', async (req, res) => {
  try {
    const today = new Date();
    const startOfDay = new Date(today.setHours(0, 0, 0, 0));
    const startOfWeek = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000);

    const [todayCount, weekCount, unreadCount, totalCount] = await Promise.all([
      Notification.countDocuments({
        userId: req.user._id,
        createdAt: { $gte: startOfDay }
      }),
      Notification.countDocuments({
        userId: req.user._id,
        createdAt: { $gte: startOfWeek }
      }),
      Notification.countDocuments({
        userId: req.user._id,
        isRead: false
      }),
      Notification.countDocuments({
        userId: req.user._id
      })
    ]);

    // Get recent high priority notifications
    const urgentNotifications = await Notification.find({
      userId: req.user._id,
      priority: 'high',
      isRead: false
    })
    .sort({ createdAt: -1 })
    .limit(5);

    res.json({
      summary: {
        today: todayCount,
        thisWeek: weekCount,
        unread: unreadCount,
        total: totalCount
      },
      urgentNotifications
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

export default router;

const { getDB } = require('../config/db');

const getNextNotificationId = async (db) => {
  const [last] = await db.collection('notifications').find({ id: { $type: 'number' } }).sort({ id: -1 }).limit(1).toArray();
  return (last?.id || 0) + 1;
};

exports.listAllNotifications = async (req, res, next) => {
  try {
    const db = getDB();
    const records = await db.collection('notifications').find().sort({ id: -1 }).toArray();
    return res.json({ success: true, count: records.length, data: records });
  } catch (error) {
    return next(error);
  }
};

exports.getNotifications = async (req, res, next) => {
  try {
    const db = getDB();
    const userId = Number(req.params.userId);
    const { read } = req.query;
    const filter = { userId };

    if (read !== undefined) {
      filter.read = read === 'true';
    }

    const userNotifications = await db.collection('notifications').find(filter).sort({ id: -1 }).toArray();
    return res.json({ success: true, data: userNotifications });
  } catch (error) {
    return next(error);
  }
};

exports.getMyNotifications = async (req, res, next) => {
  try {
    const db = getDB();
    const userId = Number(req.user.id);
    const records = await db.collection('notifications').find({ userId }).sort({ id: -1 }).toArray();
    return res.json({ success: true, data: records, count: records.length });
  } catch (error) {
    return next(error);
  }
};

exports.sendNotification = async (req, res, next) => {
  try {
    const db = getDB();
    const { userId, message, type, title } = req.body;

    if (!userId || !message) {
      return res.status(400).json({ error: 'userId and message are required' });
    }

    const newNotification = {
      id: await getNextNotificationId(db),
      userId: Number(userId),
      title,
      message,
      type: type || 'general',
      read: false,
      createdAt: new Date().toISOString()
    };

    await db.collection('notifications').insertOne(newNotification);
    return res.status(201).json({ success: true, data: newNotification });
  } catch (error) {
    return next(error);
  }
};

exports.markAsRead = async (req, res, next) => {
  try {
    const db = getDB();
    const id = Number(req.params.id);
    const result = await db.collection('notifications').updateOne(
      { id },
      {
        $set: {
          read: true,
          readAt: new Date().toISOString()
        }
      }
    );

    if (result.matchedCount === 0) {
      return res.status(404).json({ error: 'Notification not found' });
    }

    const notification = await db.collection('notifications').findOne({ id });
    return res.json({ success: true, data: notification });
  } catch (error) {
    return next(error);
  }
};

exports.markAllAsRead = async (req, res, next) => {
  try {
    const db = getDB();
    const userId = Number(req.user.id);

    await db.collection('notifications').updateMany(
      { userId, read: false },
      {
        $set: {
          read: true,
          readAt: new Date().toISOString()
        }
      }
    );

    const records = await db.collection('notifications').find({ userId }).sort({ id: -1 }).toArray();
    return res.json({ success: true, message: 'All notifications marked as read', data: records });
  } catch (error) {
    return next(error);
  }
};

exports.deleteNotification = async (req, res, next) => {
  try {
    const db = getDB();
    const id = Number(req.params.id);
    const notification = await db.collection('notifications').findOne({ id });

    if (!notification) {
      return res.status(404).json({ success: false, message: 'Notification not found' });
    }

    await db.collection('notifications').deleteOne({ id });
    return res.json({ success: true, message: 'Notification deleted', data: notification });
  } catch (error) {
    return next(error);
  }
};

exports.sendEmailNotification = async (req, res, next) => {
  try {
    const db = getDB();
    const { email, subject, message, userId } = req.body;

    if (!email || !subject || !message) {
      return res.status(400).json({ error: 'email, subject, and message are required' });
    }

    const emailNotification = {
      id: `EMAIL-${Date.now()}`,
      email,
      subject,
      message,
      userId,
      status: 'sent',
      sentAt: new Date().toISOString()
    };

    await db.collection('notification_logs').insertOne({ channel: 'email', ...emailNotification });
    return res.status(201).json({ message: 'Email notification sent', notification: emailNotification });
  } catch (error) {
    return next(error);
  }
};

exports.sendSmsNotification = async (req, res, next) => {
  try {
    const db = getDB();
    const { phoneNumber, message, userId } = req.body;

    if (!phoneNumber || !message) {
      return res.status(400).json({ error: 'phoneNumber and message are required' });
    }

    const smsNotification = {
      id: `SMS-${Date.now()}`,
      phoneNumber,
      message,
      userId,
      status: 'sent',
      sentAt: new Date().toISOString()
    };

    await db.collection('notification_logs').insertOne({ channel: 'sms', ...smsNotification });
    return res.status(201).json({ message: 'SMS notification sent', notification: smsNotification });
  } catch (error) {
    return next(error);
  }
};

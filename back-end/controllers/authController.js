const jwt = require('jsonwebtoken');
const { getDB } = require('../config/db');

const createToken = (user) => {
  const payload = { id: user.userId, email: user.email, name: user.name };
  return jwt.sign(payload, process.env.JWT_SECRET || 'dev-secret', { expiresIn: '1h' });
};

const getNextUserId = async (db) => {
  const [lastUser] = await db
    .collection('users')
    .find({ userId: { $type: 'number' } })
    .sort({ userId: -1 })
    .limit(1)
    .toArray();

  return (lastUser?.userId || 0) + 1;
};

const register = async (req, res, next) => {
  try {
    const { name, email, password } = req.body;
    const db = getDB();
    const emailLower = String(email).toLowerCase();

    const exists = await db.collection('users').findOne({ email: emailLower });
    if (exists) {
      return res.status(409).json({
        success: false,
        message: 'Email already registered'
      });
    }

    const user = {
      userId: await getNextUserId(db),
      name,
      email: emailLower,
      password,
      createdAt: new Date().toISOString()
    };

    await db.collection('users').insertOne(user);

    const token = createToken(user);
    return res.status(201).json({
      success: true,
      message: 'Account created',
      token,
      data: {
        id: user.userId,
        name: user.name,
        email: user.email
      }
    });
  } catch (error) {
    return next(error);
  }
};

const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;
    const db = getDB();
    const emailLower = String(email).toLowerCase();

    const user = await db.collection('users').findOne({ email: emailLower });
    if (!user || user.password !== password) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials'
      });
    }

    const token = createToken(user);
    return res.status(200).json({
      success: true,
      message: 'Login successful',
      token,
      data: {
        id: user.userId,
        name: user.name,
        email: user.email
      }
    });
  } catch (error) {
    return next(error);
  }
};

const me = async (req, res, next) => {
  try {
    const db = getDB();
    const user = await db.collection('users').findOne({ userId: Number(req.user.id) });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    return res.status(200).json({
      success: true,
      data: {
        id: user.userId,
        name: user.name,
        email: user.email
      }
    });
  } catch (error) {
    return next(error);
  }
};

const updateProfile = async (req, res, next) => {
  try {
    const { name, email, password } = req.body;
    const userId = Number(req.user.id);
    const db = getDB();

    const user = await db.collection('users').findOne({ userId });
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    const updates = {};

    if (email) {
      const emailLower = String(email).toLowerCase();
      const existing = await db.collection('users').findOne({ email: emailLower, userId: { $ne: userId } });
      if (existing) {
        return res.status(409).json({
          success: false,
          message: 'Email already in use'
        });
      }
      updates.email = emailLower;
    }

    if (name) updates.name = name;
    if (password) updates.password = password;

    if (Object.keys(updates).length > 0) {
      updates.updatedAt = new Date().toISOString();
      await db.collection('users').updateOne({ userId }, { $set: updates });
    }

    const updatedUser = await db.collection('users').findOne({ userId });
    const token = createToken(updatedUser);

    return res.status(200).json({
      success: true,
      message: 'Profile updated',
      token,
      data: {
        id: updatedUser.userId,
        name: updatedUser.name,
        email: updatedUser.email
      }
    });
  } catch (error) {
    return next(error);
  }
};

const deleteAccount = async (req, res, next) => {
  try {
    const userId = Number(req.user.id);
    const db = getDB();

    const result = await db.collection('users').deleteOne({ userId });
    if (result.deletedCount === 0) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    return res.status(200).json({
      success: true,
      message: 'Account deleted'
    });
  } catch (error) {
    return next(error);
  }
};

module.exports = {
  register,
  login,
  me,
  updateProfile,
  deleteAccount
};

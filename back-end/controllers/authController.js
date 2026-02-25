const jwt = require('jsonwebtoken');
const { getDB } = require('../config/db');

const createToken = (user) => {
  const payload = {
    id: user.userId,
    email: user.email,
    name: user.name,
    role: user.role || 'user'
  };
  return jwt.sign(payload, process.env.JWT_SECRET || 'dev-secret', { expiresIn: '1h' });
};

const generateOtp = () => String(Math.floor(100000 + Math.random() * 900000));

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
    const { name, email, password, role } = req.body;
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
      role: role === 'admin' ? 'admin' : 'user',
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
        email: user.email,
        role: user.role
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
        email: user.email,
        role: user.role || 'user'
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
        email: user.email,
        role: user.role || 'user'
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
        email: updatedUser.email,
        role: updatedUser.role || 'user'
      }
    });
  } catch (error) {
    return next(error);
  }
};

const sendLoginOtp = async (req, res, next) => {
  try {
    const { email } = req.body;
    const db = getDB();
    const emailLower = String(email).toLowerCase();
    const user = await db.collection('users').findOne({ email: emailLower });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    const otp = generateOtp();
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000).toISOString();

    await db.collection('otp_codes').insertOne({
      email: emailLower,
      otp,
      purpose: 'login',
      used: false,
      createdAt: new Date().toISOString(),
      expiresAt
    });

    return res.status(200).json({
      success: true,
      message: 'OTP sent',
      data: {
        email: emailLower,
        expiresAt,
        otp
      }
    });
  } catch (error) {
    return next(error);
  }
};

const verifyLoginOtp = async (req, res, next) => {
  try {
    const { email, otp } = req.body;
    const db = getDB();
    const emailLower = String(email).toLowerCase();

    const record = await db.collection('otp_codes').findOne({
      email: emailLower,
      otp: String(otp),
      purpose: 'login',
      used: false
    });

    if (!record || new Date(record.expiresAt) < new Date()) {
      return res.status(400).json({
        success: false,
        message: 'Invalid or expired OTP'
      });
    }

    const user = await db.collection('users').findOne({ email: emailLower });
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    await db.collection('otp_codes').updateOne(
      { _id: record._id },
      { $set: { used: true, verifiedAt: new Date().toISOString() } }
    );

    const token = createToken(user);
    return res.status(200).json({
      success: true,
      message: 'OTP verified',
      token,
      data: {
        id: user.userId,
        name: user.name,
        email: user.email,
        role: user.role || 'user'
      }
    });
  } catch (error) {
    return next(error);
  }
};

const forgotPassword = async (req, res, next) => {
  try {
    const { email } = req.body;
    const db = getDB();
    const emailLower = String(email).toLowerCase();
    const user = await db.collection('users').findOne({ email: emailLower });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    const resetToken = `RST-${Date.now()}-${Math.random().toString(36).slice(2, 8).toUpperCase()}`;
    const expiresAt = new Date(Date.now() + 30 * 60 * 1000).toISOString();

    await db.collection('password_resets').insertOne({
      email: emailLower,
      resetToken,
      used: false,
      createdAt: new Date().toISOString(),
      expiresAt
    });

    return res.status(200).json({
      success: true,
      message: 'Password reset token generated',
      data: {
        email: emailLower,
        resetToken,
        expiresAt
      }
    });
  } catch (error) {
    return next(error);
  }
};

const resetPassword = async (req, res, next) => {
  try {
    const { email, resetToken, newPassword } = req.body;
    const db = getDB();
    const emailLower = String(email).toLowerCase();

    const resetRecord = await db.collection('password_resets').findOne({
      email: emailLower,
      resetToken: String(resetToken),
      used: false
    });

    if (!resetRecord || new Date(resetRecord.expiresAt) < new Date()) {
      return res.status(400).json({
        success: false,
        message: 'Invalid or expired reset token'
      });
    }

    const result = await db.collection('users').updateOne(
      { email: emailLower },
      { $set: { password: newPassword, updatedAt: new Date().toISOString() } }
    );

    if (result.matchedCount === 0) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    await db.collection('password_resets').updateOne(
      { _id: resetRecord._id },
      { $set: { used: true, usedAt: new Date().toISOString() } }
    );

    return res.status(200).json({
      success: true,
      message: 'Password reset successful'
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
  deleteAccount,
  sendLoginOtp,
  verifyLoginOtp,
  forgotPassword,
  resetPassword
};

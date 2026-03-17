const bcrypt = require("bcryptjs");
const { getDB } = require('../config/db');
const { generateAccessToken, generateRefreshToken } = require("../utils/jwt");
const jwt = require('jsonwebtoken');
const { ObjectId } = require('mongodb');

const sanitizeUser = (user) => {
  if (!user) return null;
  return {
    id: user._id,
    name: user.name,
    username: user.username,
    email: user.email,
    role: user.role,
    phone: user.phone || '',
    gender: user.gender || null,
    address: user.address || '',
    pincode: user.pincode || ''
  };
};

const buildAuthResponse = (user) => {
  const accessToken = generateAccessToken(user);
  return {
    success: true,
    token: accessToken,
    accessToken,
    data: sanitizeUser(user),
    user: sanitizeUser(user)
  };
};

const createUniqueUsername = async (db, email, fallbackName = 'user') => {
  const base = String(email || fallbackName || 'user')
    .split('@')[0]
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9_]/g, '') || 'user';

  const baseCandidate = base.length >= 3 ? base : `${base}user`;
  const exists = await db.collection('users').findOne({ username: baseCandidate });
  if (!exists) {
    return baseCandidate;
  }

  return `${baseCandidate}${Date.now().toString().slice(-5)}`;
};

const findUserForLogin = async (db, identifier) => {
  if (!identifier) return null;
  const trimmed = String(identifier).trim();

  let user = await db.collection('users').findOne({ email: trimmed.toLowerCase() });
  if (user) return user;

  user = await db.collection('users').findOne({ username: trimmed });
  if (user) return user;

  if (trimmed.includes('@')) {
    const usernameGuess = trimmed.split('@')[0];
    user = await db.collection('users').findOne({ username: usernameGuess });
    if (user) return user;
  }

  return null;
};

const loginUser = async (req, res, next) => {
  try {
    const db = getDB();
    const { username, email, password } = req.body;

    const identifier = username || email;
    const user = await findUserForLogin(db, identifier);

    if (!user) {
      return res.status(400).json({
        success: false,
        message: "Invalid username or password"
      });
    }

    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      return res.status(400).json({
        success: false,
        message: "Invalid username or password"
      });
    }

    const refreshToken = generateRefreshToken(user);

    await db.collection("users").updateOne(
      { _id: user._id },
      { $set: { refreshToken } }
    );

    res.json({
      ...buildAuthResponse(user),
      refreshToken
    });
  } catch (error) {
    next(error);
  }
};

const createRegister = async (req, res, next) => {
  try {
    const db = getDB();

    const {
      name,
      username,
      email,
      password,
      phone,
      gender,
      emailOtp,
      address,
      pincode,
      role
    } = req.body;

    const normalizedEmail = String(email || '').trim().toLowerCase();
    if (!normalizedEmail) {
      return res.status(400).json({
        success: false,
        message: 'Email is required'
      });
    }

    const requestedUsername = String(username || '').trim();
    if (requestedUsername) {
      const existingUsername = await db.collection("users").findOne({ username: requestedUsername });
      if (existingUsername) {
        return res.status(400).json({
          success: false,
          message: "Username already exists"
        });
      }
    }

    const existingEmail = await db.collection("users").findOne({ email: normalizedEmail });

    if (existingEmail) {
      return res.status(409).json({
        success: false,
        message: "Email already registered"
      });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const finalUsername = requestedUsername || await createUniqueUsername(db, normalizedEmail, name);

    const newRegister = {
      name,
      username: finalUsername,
      email: normalizedEmail,
      password: hashedPassword,
      role: role || "user",
      phone,
      gender,
      emailOtp: emailOtp || null,
      address,
      pincode,
      status: "Active",
      createdAt: new Date(),
      updatedAt: new Date()
    };

    const insertResult = await db.collection("users").insertOne(newRegister);
    const savedUser = {
      ...newRegister,
      _id: insertResult.insertedId
    };

    const refreshToken = generateRefreshToken(savedUser);
    await db.collection('users').updateOne(
      { _id: insertResult.insertedId },
      { $set: { refreshToken } }
    );

    res.status(201).json({
      ...buildAuthResponse(savedUser),
      refreshToken,
      message: "User registered successfully"
    });
  } catch (error) {
    next(error);
  }
};

const register = async (req, res, next) => {
  return createRegister(req, res, next);
};

const login = async (req, res, next) => {
  const { email, password } = req.body;
  req.body = { username: email, email, password };
  return loginUser(req, res, next);
};

const sendLoginOtp = async (req, res, next) => {
  try {
    const db = getDB();
    const email = String(req.body?.email || '').trim().toLowerCase();

    if (!email) {
      return res.status(400).json({ success: false, message: 'Email is required' });
    }

    const user = await db.collection('users').findOne({ email });
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    const otp = String(Math.floor(100000 + Math.random() * 900000));
    const expiresAt = new Date(Date.now() + 5 * 60 * 1000);

    await db.collection('loginOtps').updateOne(
      { email },
      {
        $set: {
          email,
          otp,
          expiresAt,
          updatedAt: new Date()
        },
        $setOnInsert: { createdAt: new Date() }
      },
      { upsert: true }
    );

    return res.json({
      success: true,
      data: {
        email,
        expiresAt,
        otp
      }
    });
  } catch (error) {
    next(error);
  }
};

const verifyLoginOtp = async (req, res, next) => {
  try {
    const db = getDB();
    const email = String(req.body?.email || '').trim().toLowerCase();
    const otp = String(req.body?.otp || '').trim();

    if (!email || !otp) {
      return res.status(400).json({ success: false, message: 'Email and OTP are required' });
    }

    const otpDoc = await db.collection('loginOtps').findOne({ email, otp });
    if (!otpDoc || !otpDoc.expiresAt || new Date(otpDoc.expiresAt) < new Date()) {
      return res.status(400).json({ success: false, message: 'Invalid or expired OTP' });
    }

    const user = await db.collection('users').findOne({ email });
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    await db.collection('loginOtps').deleteOne({ _id: otpDoc._id });

    const refreshToken = generateRefreshToken(user);
    await db.collection('users').updateOne({ _id: user._id }, { $set: { refreshToken } });

    return res.json({
      ...buildAuthResponse(user),
      refreshToken
    });
  } catch (error) {
    next(error);
  }
};

const forgotPassword = async (req, res, next) => {
  try {
    const db = getDB();
    const email = String(req.body?.email || '').trim().toLowerCase();
    if (!email) {
      return res.status(400).json({ success: false, message: 'Email is required' });
    }

    const user = await db.collection('users').findOne({ email });
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    return res.json({
      success: true,
      message: 'Password reset request accepted',
      data: {
        email,
        support: 'Contact support to reset password'
      }
    });
  } catch (error) {
    next(error);
  }
};

const me = async (req, res) => {
  return res.json({
    success: true,
    data: sanitizeUser(req.user)
  });
};

const updateMe = async (req, res, next) => {
  try {
    const db = getDB();
    const updates = {};
    const { name, phone, address, pincode } = req.body;

    if (name !== undefined) updates.name = name;
    if (phone !== undefined) updates.phone = phone;
    if (address !== undefined) updates.address = address;
    if (pincode !== undefined) updates.pincode = pincode;

    if (Object.keys(updates).length === 0) {
      return res.status(400).json({ success: false, message: 'No fields to update' });
    }

    updates.updatedAt = new Date();

    await db.collection('users').updateOne(
      { _id: new ObjectId(req.user._id) },
      { $set: updates }
    );

    const updatedUser = await db.collection('users').findOne({ _id: new ObjectId(req.user._id) });

    return res.json({
      success: true,
      message: 'Profile updated',
      data: sanitizeUser(updatedUser)
    });
  } catch (error) {
    next(error);
  }
};

const refreshToken = async (req, res) => {
  try {
    const db = getDB();
    const { refreshToken } = req.body;

    if (!refreshToken) {
      return res.status(401).json({
        success: false,
        message: "Refresh token required"
      });
    }
    const decoded = jwt.verify(refreshToken, "qweuansdasdg123123");

    const user = await db.collection("users").findOne({
      _id: new ObjectId(decoded.id),
      refreshToken
    });

    if (!user) {
      return res.status(401).json({
        success: false,
        message: "Invalid refresh token"
      });
    }

    const accessToken = generateAccessToken(user);

    res.json({
      success: true,
      token: accessToken,
      accessToken
    });
  } catch (error) {
    res.status(401).json({
      success: false,
      message: "Invalid refresh token"
    });
  }
};

module.exports = {
  register,
  login,
  sendLoginOtp,
  verifyLoginOtp,
  forgotPassword,
  me,
  updateMe,
  createRegister,
  loginUser,
  refreshToken
};
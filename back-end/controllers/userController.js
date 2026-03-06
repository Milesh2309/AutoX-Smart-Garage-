const { getDB } = require('../config/db');
const { ObjectId } = require('mongodb');

// Helper: strip sensitive fields from user object
const sanitizeUser = (user) => {
  if (!user) return user;
  const { password, passwordHash, ...safe } = user;
  return safe;
};

// ✅ GET ALL USERS
const getUsers = async (req, res, next) => {
  try {
    const db = getDB();
    const users = await db.collection("users").find().toArray();

    res.json({ success: true, data: users.map(sanitizeUser) });

  } catch (error) {
    next(error);
  }
};

// Helper: find user by ObjectId or numeric userId
const findUserFilter = (id) => {
  if (ObjectId.isValid(id) && String(new ObjectId(id)) === id) {
    return { _id: new ObjectId(id) };
  }
  const numId = Number(id);
  if (Number.isFinite(numId)) {
    return { userId: numId };
  }
  return { _id: new ObjectId(id) };
};

// ✅ GET USER BY ID
const getUserById = async (req, res, next) => {
  try {
    const db = getDB();
    const user = await db.collection("users").findOne(findUserFilter(req.params.id));

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found"
      });
    }

    res.json({ success: true, data: sanitizeUser(user) });

  } catch (error) {
    next(error);
  }
};

// ✅ CREATE USER
const createUser = async (req, res, next) => {
  try {
    const db = getDB();
    const { name, email, password, role, phone } = req.body;

    // Generate numeric userId for consistency with authController
    const [lastUser] = await db
      .collection('users')
      .find({ userId: { $type: 'number' } })
      .sort({ userId: -1 })
      .limit(1)
      .toArray();
    const nextUserId = (lastUser?.userId || 0) + 1;

    const user = {
      userId: nextUserId,
      name,
      email: String(email).toLowerCase(),
      password,
      phone: phone || '',
      role: role || 'user',
      createdAt: new Date().toISOString()
    };

    await db.collection('users').insertOne(user);

    res.status(201).json({
      success: true,
      message: 'User created',
      data: { id: user.userId, name: user.name, email: user.email, role: user.role }
    });

  } catch (error) {
    next(error);
  }
};

// ✅ UPDATE USER
const updateUser = async (req, res, next) => {
  try {
    const db = getDB();
    const { password, _id, userId, ...safeUpdates } = req.body;
    safeUpdates.updatedAt = new Date().toISOString();

    const result = await db.collection("users").updateOne(
      findUserFilter(req.params.id),
      { $set: safeUpdates }
    );

    if (result.matchedCount === 0) {
      return res.status(404).json({
        success: false,
        message: "User not found"
      });
    }

    res.json({ success: true, message: "User updated" });

  } catch (error) {
    next(error);
  }
};

// ✅ DELETE USER
const deleteUser = async (req, res, next) => {
  try {
    const db = getDB();
    const result = await db.collection("users").deleteOne(findUserFilter(req.params.id));

    if (result.deletedCount === 0) {
      return res.status(404).json({
        success: false,
        message: "User not found"
      });
    }

    res.json({ success: true, message: "User deleted" });

  } catch (error) {
    next(error);
  }
};

module.exports = {
  getUsers,
  getUserById,
  createUser,
  updateUser,
  deleteUser
};
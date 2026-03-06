const { getDB } = require('../config/db');

const getNextBreakdownId = async (db) => {
  const [last] = await db.collection('breakdown_calls').find({ id: { $type: 'number' } }).sort({ id: -1 }).limit(1).toArray();
  return (last?.id || 0) + 1;
};

exports.createBreakdownCall = async (req, res, next) => {
  try {
    const { userId, location, description, vehicleId, latitude, longitude } = req.body;
    const db = getDB();

    if (!userId || !location) {
      return res.status(400).json({ error: 'userId and location are required' });
    }

    const newCall = {
      id: await getNextBreakdownId(db),
      userId: Number(userId),
      vehicleId,
      location,
      description,
      latitude,
      longitude,
      status: 'pending',
      createdAt: new Date().toISOString()
    };

    await db.collection('breakdown_calls').insertOne(newCall);
    return res.status(201).json({ success: true, data: newCall });
  } catch (error) {
    return next(error);
  }
};

exports.listBreakdownCalls = async (req, res, next) => {
  try {
    const db = getDB();
    const calls = await db.collection('breakdown_calls').find().sort({ id: -1 }).toArray();
    return res.json({ success: true, data: calls });
  } catch (error) {
    return next(error);
  }
};

exports.getBreakdownCall = async (req, res, next) => {
  try {
    const db = getDB();
    const call = await db.collection('breakdown_calls').findOne({ id: Number(req.params.id) });

    if (!call) {
      return res.status(404).json({ success: false, message: 'Breakdown call not found' });
    }

    return res.json({ success: true, data: call });
  } catch (error) {
    return next(error);
  }
};

exports.updateBreakdownStatus = async (req, res, next) => {
  try {
    const db = getDB();
    const id = Number(req.params.id);
    const { status, assignedMechanicId, eta } = req.body;

    const updates = { updatedAt: new Date().toISOString() };
    if (status) updates.status = status;
    if (assignedMechanicId !== undefined) updates.assignedMechanicId = assignedMechanicId;
    if (eta !== undefined) updates.eta = eta;

    const result = await db.collection('breakdown_calls').updateOne({ id }, { $set: updates });
    if (result.matchedCount === 0) {
      return res.status(404).json({ success: false, message: 'Breakdown call not found' });
    }

    const call = await db.collection('breakdown_calls').findOne({ id });
    return res.json({ success: true, data: call });
  } catch (error) {
    return next(error);
  }
};

exports.findNearestMechanic = async (req, res, next) => {
  try {
    const { latitude, longitude } = req.query;

    if (!latitude || !longitude) {
      return res.status(400).json({ error: 'latitude and longitude are required' });
    }

    const db = getDB();
    const mechanics = await db
      .collection('mechanics')
      .find({ availability: true })
      .project({ _id: 0, mechanicId: 1, name: 1, rating: 1, availability: 1, distance: 1, eta: 1 })
      .sort({ distance: 1 })
      .limit(5)
      .toArray();

    return res.json({ success: true, data: mechanics });
  } catch (error) {
    return next(error);
  }
};

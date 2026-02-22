const { getDB } = require('../config/db');

const getNextVehicleId = async (db) => {
  const [lastVehicle] = await db
    .collection('vehicles')
    .find({ id: { $type: 'number' } })
    .sort({ id: -1 })
    .limit(1)
    .toArray();

  return (lastVehicle?.id || 0) + 1;
};

const getVehicles = async (req, res, next) => {
  try {
    const db = getDB();
    const userId = Number(req.user.id);
    const records = await db.collection('vehicles').find({ userId }).sort({ id: -1 }).toArray();

    return res.status(200).json({
      success: true,
      data: records
    });
  } catch (error) {
    return next(error);
  }
};

const createVehicle = async (req, res, next) => {
  try {
    const db = getDB();
    const { make, model, year, plate } = req.body;
    const vehicle = {
      id: await getNextVehicleId(db),
      userId: Number(req.user.id),
      make,
      model,
      year: Number(year),
      plate,
      createdAt: new Date().toISOString()
    };

    await db.collection('vehicles').insertOne(vehicle);

    return res.status(201).json({
      success: true,
      message: 'Vehicle added',
      data: vehicle
    });
  } catch (error) {
    return next(error);
  }
};

const getVehicleById = async (req, res, next) => {
  try {
    const db = getDB();
    const id = Number(req.params.id);
    const userId = Number(req.user.id);
    const vehicle = await db.collection('vehicles').findOne({ id, userId });

    if (!vehicle) {
      return res.status(404).json({
        success: false,
        message: 'Vehicle not found'
      });
    }

    return res.status(200).json({
      success: true,
      data: vehicle
    });
  } catch (error) {
    return next(error);
  }
};

const updateVehicle = async (req, res, next) => {
  try {
    const db = getDB();
    const id = Number(req.params.id);
    const userId = Number(req.user.id);
    const { make, model, year, plate } = req.body;

    const updates = {};
    if (make !== undefined) updates.make = make;
    if (model !== undefined) updates.model = model;
    if (year !== undefined) updates.year = Number(year);
    if (plate !== undefined) updates.plate = plate;
    updates.updatedAt = new Date().toISOString();

    const result = await db.collection('vehicles').updateOne({ id, userId }, { $set: updates });
    if (result.matchedCount === 0) {
      return res.status(404).json({
        success: false,
        message: 'Vehicle not found'
      });
    }

    const vehicle = await db.collection('vehicles').findOne({ id, userId });
    return res.status(200).json({
      success: true,
      message: 'Vehicle updated',
      data: vehicle
    });
  } catch (error) {
    return next(error);
  }
};

const deleteVehicle = async (req, res, next) => {
  try {
    const db = getDB();
    const id = Number(req.params.id);
    const userId = Number(req.user.id);
    const result = await db.collection('vehicles').deleteOne({ id, userId });

    if (result.deletedCount === 0) {
      return res.status(404).json({
        success: false,
        message: 'Vehicle not found'
      });
    }

    return res.status(200).json({
      success: true,
      message: 'Vehicle removed'
    });
  } catch (error) {
    return next(error);
  }
};

module.exports = {
  getVehicles,
  createVehicle,
  getVehicleById,
  updateVehicle,
  deleteVehicle
};

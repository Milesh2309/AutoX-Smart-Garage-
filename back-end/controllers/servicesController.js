const { getDB } = require('../config/db');

const getNextServiceId = async (db) => {
  const [lastService] = await db
    .collection('services')
    .find({ id: { $type: 'number' } })
    .sort({ id: -1 })
    .limit(1)
    .toArray();

  return (lastService?.id || 0) + 1;
};

const getServices = async (req, res, next) => {
  try {
    const db = getDB();
    const services = await db.collection('services').find().sort({ id: 1 }).toArray();

    return res.status(200).json({
      success: true,
      data: services
    });
  } catch (error) {
    return next(error);
  }
};

const getServiceById = async (req, res, next) => {
  try {
    const db = getDB();
    const id = Number(req.params.id);
    const service = await db.collection('services').findOne({ id });

    if (!service) {
      return res.status(404).json({
        success: false,
        message: 'Service not found'
      });
    }

    return res.status(200).json({
      success: true,
      data: service
    });
  } catch (error) {
    return next(error);
  }
};

const createService = async (req, res, next) => {
  try {
    const db = getDB();
    const { name, price, description, category } = req.body;

    const service = {
      id: await getNextServiceId(db),
      name,
      price: Number(price),
      description,
      category: category || 'general',
      createdAt: new Date().toISOString()
    };

    await db.collection('services').insertOne(service);

    return res.status(201).json({
      success: true,
      message: 'Service created',
      data: service
    });
  } catch (error) {
    return next(error);
  }
};

const updateService = async (req, res, next) => {
  try {
    const db = getDB();
    const id = Number(req.params.id);
    const { name, price, description, category } = req.body;

    const updates = {};
    if (name !== undefined) updates.name = name;
    if (price !== undefined) updates.price = Number(price);
    if (description !== undefined) updates.description = description;
    if (category !== undefined) updates.category = category;
    updates.updatedAt = new Date().toISOString();

    const result = await db.collection('services').updateOne({ id }, { $set: updates });

    if (result.matchedCount === 0) {
      return res.status(404).json({
        success: false,
        message: 'Service not found'
      });
    }

    const service = await db.collection('services').findOne({ id });
    return res.status(200).json({
      success: true,
      message: 'Service updated',
      data: service
    });
  } catch (error) {
    return next(error);
  }
};

const deleteService = async (req, res, next) => {
  try {
    const db = getDB();
    const id = Number(req.params.id);
    const result = await db.collection('services').deleteOne({ id });

    if (result.deletedCount === 0) {
      return res.status(404).json({
        success: false,
        message: 'Service not found'
      });
    }

    return res.status(200).json({
      success: true,
      message: 'Service deleted'
    });
  } catch (error) {
    return next(error);
  }
};

const searchServices = async (req, res, next) => {
  try {
    const { query } = req.query;
    if (!query) {
      return res.status(400).json({
        success: false,
        message: 'Search query is required'
      });
    }

    const db = getDB();
    const regex = new RegExp(String(query), 'i');
    const results = await db
      .collection('services')
      .find({ $or: [{ name: regex }, { description: regex }] })
      .toArray();

    return res.status(200).json({
      success: true,
      data: results,
      count: results.length
    });
  } catch (error) {
    return next(error);
  }
};

const getServicesByCategory = async (req, res, next) => {
  try {
    const db = getDB();
    const { category } = req.params;
    const results = await db.collection('services').find({ category }).toArray();

    if (results.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'No services found in this category'
      });
    }

    return res.status(200).json({
      success: true,
      data: results,
      count: results.length,
      category
    });
  } catch (error) {
    return next(error);
  }
};

module.exports = {
  getServices,
  getServiceById,
  createService,
  updateService,
  deleteService,
  searchServices,
  getServicesByCategory
};

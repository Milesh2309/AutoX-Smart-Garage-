const { getDB } = require('../config/db');

const getNextId = async (db, collectionName) => {
  const [last] = await db.collection(collectionName).find({ id: { $type: 'number' } }).sort({ id: -1 }).limit(1).toArray();
  return (last?.id || 0) + 1;
};

exports.listInventory = async (req, res, next) => {
  try {
    const db = getDB();
    const inventory = await db.collection('inventory').find().sort({ id: -1 }).toArray();
    return res.json(inventory);
  } catch (error) {
    return next(error);
  }
};

exports.addPart = async (req, res, next) => {
  try {
    const db = getDB();
    const { name, category, price, stock, minStock } = req.body;

    if (!name || !price || stock === undefined) {
      return res.status(400).json({ error: 'name, price, and stock are required' });
    }

    const newPart = {
      id: await getNextId(db, 'inventory'),
      name,
      category,
      price: Number(price),
      stock: Number(stock),
      minStock: Number(minStock || 10),
      createdAt: new Date().toISOString()
    };

    await db.collection('inventory').insertOne(newPart);
    return res.status(201).json(newPart);
  } catch (error) {
    return next(error);
  }
};

exports.updateStock = async (req, res, next) => {
  try {
    const db = getDB();
    const id = Number(req.params.id);
    const { stock, price, name } = req.body;
    const updates = { updatedAt: new Date().toISOString() };
    if (stock !== undefined) updates.stock = Number(stock);
    if (price !== undefined) updates.price = Number(price);
    if (name !== undefined) updates.name = name;

    const result = await db.collection('inventory').updateOne({ id }, { $set: updates });
    if (result.matchedCount === 0) {
      return res.status(404).json({ error: 'Part not found' });
    }

    const part = await db.collection('inventory').findOne({ id });
    return res.json(part);
  } catch (error) {
    return next(error);
  }
};

exports.deletePart = async (req, res, next) => {
  try {
    const db = getDB();
    const id = Number(req.params.id);
    const part = await db.collection('inventory').findOne({ id });
    if (!part) {
      return res.status(404).json({ error: 'Part not found' });
    }

    await db.collection('inventory').deleteOne({ id });
    return res.json({ message: 'Part deleted', deleted: part });
  } catch (error) {
    return next(error);
  }
};

exports.getLowStockAlerts = async (req, res, next) => {
  try {
    const db = getDB();
    const allItems = await db.collection('inventory').find().toArray();
    const lowStockItems = allItems.filter((item) => Number(item.stock) < Number(item.minStock || 0));

    if (lowStockItems.length === 0) {
      return res.json({ message: 'No low stock items', items: [] });
    }

    return res.json({
      message: `${lowStockItems.length} items running low on stock`,
      items: lowStockItems
    });
  } catch (error) {
    return next(error);
  }
};

exports.createPartOrder = async (req, res, next) => {
  try {
    const db = getDB();
    const { partId, quantity, supplier } = req.body;

    if (!partId || !quantity || !supplier) {
      return res.status(400).json({ error: 'partId, quantity, and supplier are required' });
    }

    const part = await db.collection('inventory').findOne({ id: Number(partId) });
    if (!part) {
      return res.status(404).json({ error: 'Part not found' });
    }

    const newOrder = {
      id: await getNextId(db, 'part_orders'),
      partId: Number(partId),
      partName: part.name,
      quantity: Number(quantity),
      supplier,
      status: 'ordered',
      createdAt: new Date().toISOString(),
      expectedDelivery: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toISOString()
    };

    await db.collection('part_orders').insertOne(newOrder);
    return res.status(201).json(newOrder);
  } catch (error) {
    return next(error);
  }
};

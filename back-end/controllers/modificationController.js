const { getDB } = require('../config/db');

const getNextId = async (db, collectionName) => {
  const [last] = await db.collection(collectionName).find({ id: { $type: 'number' } }).sort({ id: -1 }).limit(1).toArray();
  return (last?.id || 0) + 1;
};

exports.listModifications = async (req, res, next) => {
  try {
    const db = getDB();
    const modifications = await db.collection('modifications').find().sort({ id: -1 }).toArray();
    return res.json(modifications);
  } catch (error) {
    return next(error);
  }
};

exports.getModificationById = async (req, res, next) => {
  try {
    const db = getDB();
    const mod = await db.collection('modifications').findOne({ id: Number(req.params.id) });

    if (!mod) {
      return res.status(404).json({ error: 'Modification not found' });
    }

    return res.json(mod);
  } catch (error) {
    return next(error);
  }
};

exports.createModQuote = async (req, res, next) => {
  try {
    const db = getDB();
    const { userId, modId, vehicleId, additionalNotes } = req.body;

    if (!userId || !modId) {
      return res.status(400).json({ error: 'userId and modId are required' });
    }

    const mod = await db.collection('modifications').findOne({ id: Number(modId) });
    if (!mod) {
      return res.status(404).json({ error: 'Modification not found' });
    }

    const newQuote = {
      id: await getNextId(db, 'mod_quotes'),
      userId: Number(userId),
      modId: Number(modId),
      modName: mod.name,
      vehicleId,
      additionalNotes,
      status: 'pending',
      quotePrice: Number(mod.price) * 1.1,
      createdAt: new Date().toISOString()
    };

    await db.collection('mod_quotes').insertOne(newQuote);
    return res.status(201).json(newQuote);
  } catch (error) {
    return next(error);
  }
};

exports.listModQuotes = async (req, res, next) => {
  try {
    const db = getDB();
    const { userId, status } = req.query;
    const filter = {};
    if (userId) filter.userId = Number(userId);
    if (status) filter.status = status;

    const quotes = await db.collection('mod_quotes').find(filter).sort({ id: -1 }).toArray();
    return res.json(quotes);
  } catch (error) {
    return next(error);
  }
};

exports.updateModQuoteStatus = async (req, res, next) => {
  try {
    const db = getDB();
    const id = Number(req.params.id);
    const { status, quotePrice } = req.body;
    const updates = { updatedAt: new Date().toISOString() };
    if (status) updates.status = status;
    if (quotePrice !== undefined) updates.quotePrice = Number(quotePrice);

    const result = await db.collection('mod_quotes').updateOne({ id }, { $set: updates });
    if (result.matchedCount === 0) {
      return res.status(404).json({ error: 'Quote not found' });
    }

    const quote = await db.collection('mod_quotes').findOne({ id });
    return res.json(quote);
  } catch (error) {
    return next(error);
  }
};

exports.createModOrder = async (req, res, next) => {
  try {
    const db = getDB();
    const { modQuoteId, scheduleDate } = req.body;

    if (!modQuoteId) {
      return res.status(400).json({ error: 'modQuoteId is required' });
    }

    const quote = await db.collection('mod_quotes').findOne({ id: Number(modQuoteId) });
    if (!quote) {
      return res.status(404).json({ error: 'Quote not found' });
    }

    const newOrder = {
      id: await getNextId(db, 'mod_orders'),
      modQuoteId: Number(modQuoteId),
      userId: quote.userId,
      modName: quote.modName,
      quotePrice: quote.quotePrice,
      scheduleDate,
      status: 'scheduled',
      createdAt: new Date().toISOString()
    };

    await db.collection('mod_orders').insertOne(newOrder);
    await db.collection('mod_quotes').updateOne({ id: Number(modQuoteId) }, { $set: { status: 'approved' } });

    return res.status(201).json(newOrder);
  } catch (error) {
    return next(error);
  }
};

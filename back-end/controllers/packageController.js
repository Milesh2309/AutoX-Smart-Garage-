const { getDB } = require('../config/db');

const getMyPackages = async (req, res, next) => {
  try {
    const db = getDB();
    const userId = Number(req.user.id);
    const records = await db.collection('packages').find({ userId }).sort({ createdAt: -1 }).toArray();

    return res.status(200).json({
      success: true,
      data: records,
      count: records.length
    });
  } catch (error) {
    return next(error);
  }
};

const renewPackage = async (req, res, next) => {
  try {
    const db = getDB();
    const userId = Number(req.user.id);
    const packageId = String(req.params.id);
    const { amount, paymentMethod } = req.body;

    const renewal = {
      renewalId: `REN-${Date.now()}`,
      packageId,
      userId,
      amount: Number(amount || 0),
      paymentMethod: paymentMethod || 'unknown',
      status: 'active',
      renewedAt: new Date().toISOString()
    };

    await db.collection('package_renewals').insertOne(renewal);

    await db.collection('packages').updateOne(
      { packageId, userId },
      {
        $set: {
          status: 'active',
          lastRenewedAt: renewal.renewedAt,
          updatedAt: renewal.renewedAt
        }
      },
      { upsert: true }
    );

    return res.status(200).json({
      success: true,
      message: 'Package renewed successfully',
      data: renewal
    });
  } catch (error) {
    return next(error);
  }
};

const subscribePackage = async (req, res, next) => {
  try {
    const db = getDB();
    const userId = Number(req.user.id);
    const { packageId, name, icon, price, originalPrice, description, features, validity, duration, totalServices } = req.body;

    const existing = await db.collection('packages').findOne({ userId, packageId });
    if (existing && existing.status === 'active') {
      return res.status(409).json({ success: false, message: 'You already have this package active' });
    }

    const pkg = {
      packageId: packageId || `PKG-${Date.now()}`,
      userId,
      name,
      icon: icon || '📦',
      price: typeof price === 'number' ? `₹${price.toLocaleString('en-IN')}` : price,
      originalPrice: originalPrice || price,
      description: description || '',
      features: features || [],
      services: features || [],
      validity: validity || duration || 'per service',
      totalServices: totalServices || features?.length || 5,
      servicesUsed: 0,
      nextDue: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }),
      status: 'Active',
      subscribedAt: new Date().toISOString(),
      createdAt: new Date().toISOString(),
    };

    await db.collection('packages').insertOne(pkg);

    return res.status(201).json({
      success: true,
      message: 'Package subscribed successfully',
      data: pkg
    });
  } catch (error) {
    return next(error);
  }
};

module.exports = {
  getMyPackages,
  renewPackage,
  subscribePackage
};

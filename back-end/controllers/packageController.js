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

module.exports = {
  getMyPackages,
  renewPackage
};

const { getDB } = require('../config/db');

const buildInvoiceNumber = async (db) => {
  const [lastInvoice] = await db
    .collection('billing_records')
    .find({ invoiceNumber: /^INV-\d+$/ })
    .sort({ createdAt: -1 })
    .limit(1)
    .toArray();

  const lastNumber = Number(lastInvoice?.invoiceNumber?.split('-')[1] || 1000);
  return `INV-${lastNumber + 1}`;
};

const buildPaymentId = async (db) => {
  const [lastPayment] = await db
    .collection('payments')
    .find({ paymentId: /^PAY-\d+$/ })
    .sort({ createdAt: -1 })
    .limit(1)
    .toArray();

  const lastNumber = Number(lastPayment?.paymentId?.split('-')[1] || 1);
  return `PAY-${lastNumber + 1}`;
};

const createBilling = async (req, res, next) => {
  try {
    const db = getDB();
    const { userId, amount, currency } = req.body;
    const record = {
      invoiceNumber: await buildInvoiceNumber(db),
      userId: String(userId),
      amount: Number(amount),
      currency: String(currency).toUpperCase(),
      status: 'pending',
      verified: false,
      createdAt: new Date().toISOString()
    };

    await db.collection('billing_records').insertOne(record);
    return res.status(201).json({
      success: true,
      message: 'Billing record created',
      data: record
    });
  } catch (error) {
    return next(error);
  }
};

const getBillingByUser = async (req, res, next) => {
  try {
    const db = getDB();
    const { userId } = req.params;
    const records = await db.collection('billing_records').find({ userId: String(userId) }).toArray();

    return res.status(200).json({ success: true, data: records });
  } catch (error) {
    return next(error);
  }
};

const getAllBilling = async (req, res, next) => {
  try {
    const db = getDB();
    const { userId, status, verified, invoiceNumber } = req.query;
    const filter = {};

    if (userId) filter.userId = String(userId);
    if (status) filter.status = String(status);
    if (verified !== undefined) filter.verified = String(verified).toLowerCase() === 'true';
    if (invoiceNumber) filter.invoiceNumber = String(invoiceNumber);

    const records = await db.collection('billing_records').find(filter).toArray();
    return res.status(200).json({ success: true, data: records });
  } catch (error) {
    return next(error);
  }
};

const refundBilling = async (req, res, next) => {
  try {
    const db = getDB();
    const { invoiceNumber, reason } = req.body;
    const record = await db.collection('billing_records').findOne({ invoiceNumber: String(invoiceNumber) });

    if (!record) {
      return res.status(404).json({ success: false, message: 'Invoice not found' });
    }

    if (record.status === 'refunded') {
      return res.status(409).json({ success: false, message: 'Invoice already refunded' });
    }

    await db.collection('billing_records').updateOne(
      { invoiceNumber: String(invoiceNumber) },
      {
        $set: {
          status: 'refunded',
          refundReason: reason,
          refundedAt: new Date().toISOString()
        }
      }
    );

    const updated = await db.collection('billing_records').findOne({ invoiceNumber: String(invoiceNumber) });
    return res.status(200).json({ success: true, message: 'Refund processed', data: updated });
  } catch (error) {
    return next(error);
  }
};

const verifyBilling = async (req, res, next) => {
  try {
    const db = getDB();
    const { invoiceNumber } = req.params;
    const result = await db.collection('billing_records').updateOne(
      { invoiceNumber: String(invoiceNumber) },
      {
        $set: {
          verified: true,
          status: 'verified',
          verifiedAt: new Date().toISOString()
        }
      }
    );

    if (result.matchedCount === 0) {
      return res.status(404).json({ success: false, message: 'Invoice not found' });
    }

    const updated = await db.collection('billing_records').findOne({ invoiceNumber: String(invoiceNumber) });
    return res.status(200).json({ success: true, message: 'Invoice verified', data: updated });
  } catch (error) {
    return next(error);
  }
};

const createPayment = async (req, res, next) => {
  try {
    const db = getDB();
    const { userId, amount, bookingId, method } = req.body;

    if (!userId || !amount || !method) {
      return res.status(400).json({
        success: false,
        message: 'userId, amount, and method are required'
      });
    }

    const payment = {
      paymentId: await buildPaymentId(db),
      userId: String(userId),
      bookingId,
      amount: Number(amount),
      method,
      status: 'initiated',
      createdAt: new Date().toISOString()
    };

    await db.collection('payments').insertOne(payment);

    return res.status(201).json({
      success: true,
      message: 'Payment initiated',
      data: payment
    });
  } catch (error) {
    return next(error);
  }
};

const getPaymentById = async (req, res, next) => {
  try {
    const db = getDB();
    const { paymentId } = req.params;
    const payment = await db.collection('payments').findOne({ paymentId: String(paymentId) });

    if (!payment) {
      return res.status(404).json({ success: false, message: 'Payment not found' });
    }

    return res.json({ success: true, data: payment });
  } catch (error) {
    return next(error);
  }
};

const getUserPayments = async (req, res, next) => {
  try {
    const db = getDB();
    const { userId } = req.params;
    const userPayments = await db.collection('payments').find({ userId: String(userId) }).toArray();

    return res.json({ success: true, data: userPayments, count: userPayments.length });
  } catch (error) {
    return next(error);
  }
};

const verifyPayment = async (req, res, next) => {
  try {
    const db = getDB();
    const { paymentId, razorpayPaymentId, razorpayOrderId, signature } = req.body;

    if (!paymentId || !razorpayPaymentId) {
      return res.status(400).json({
        success: false,
        message: 'paymentId and razorpayPaymentId are required'
      });
    }

    const result = await db.collection('payments').updateOne(
      { paymentId: String(paymentId) },
      {
        $set: {
          status: 'completed',
          razorpayPaymentId,
          razorpayOrderId,
          signature,
          verifiedAt: new Date().toISOString()
        }
      }
    );

    if (result.matchedCount === 0) {
      return res.status(404).json({ success: false, message: 'Payment not found' });
    }

    const updated = await db.collection('payments').findOne({ paymentId: String(paymentId) });
    return res.json({ success: true, message: 'Payment verified', data: updated });
  } catch (error) {
    return next(error);
  }
};

const processRefund = async (req, res, next) => {
  try {
    const db = getDB();
    const { paymentId, reason } = req.body;

    if (!paymentId) {
      return res.status(400).json({ success: false, message: 'paymentId is required' });
    }

    const payment = await db.collection('payments').findOne({ paymentId: String(paymentId) });
    if (!payment) {
      return res.status(404).json({ success: false, message: 'Payment not found' });
    }

    if (payment.status !== 'completed') {
      return res.status(400).json({
        success: false,
        message: 'Only completed payments can be refunded'
      });
    }

    await db.collection('payments').updateOne(
      { paymentId: String(paymentId) },
      {
        $set: {
          status: 'refunded',
          refundReason: reason,
          refundedAt: new Date().toISOString()
        }
      }
    );

    const updated = await db.collection('payments').findOne({ paymentId: String(paymentId) });
    return res.json({ success: true, message: 'Refund processed', data: updated });
  } catch (error) {
    return next(error);
  }
};

const getInvoices = async (req, res, next) => {
  try {
    const db = getDB();
    const { userId, status } = req.query;
    const filter = {};
    if (userId) filter.userId = String(userId);
    if (status) filter.status = status;

    const invoices = await db.collection('billing_records').find(filter).toArray();

    return res.json({ success: true, data: invoices, count: invoices.length });
  } catch (error) {
    return next(error);
  }
};

const downloadInvoice = async (req, res, next) => {
  try {
    const db = getDB();
    const { invoiceId } = req.params;
    const invoice = await db.collection('billing_records').findOne({ invoiceNumber: String(invoiceId) });

    if (!invoice) {
      return res.status(404).json({ success: false, message: 'Invoice not found' });
    }

    return res.json({
      success: true,
      message: 'Invoice download link generated',
      downloadUrl: `/invoices/${invoiceId}.pdf`,
      invoice
    });
  } catch (error) {
    return next(error);
  }
};

module.exports = {
  createBilling,
  getBillingByUser,
  getAllBilling,
  refundBilling,
  verifyBilling,
  createPayment,
  getPaymentById,
  getUserPayments,
  verifyPayment,
  processRefund,
  getInvoices,
  downloadInvoice
};

const crypto = require('crypto');
const Razorpay = require('razorpay');
const { getDB } = require('../config/db');

const toSafeString = (value, fallback = '') => {
  if (value === null || value === undefined) return fallback;
  return String(value).trim();
};

const toAmountInPaise = (value) => {
  const parsed = Number(value);
  if (!Number.isFinite(parsed) || parsed <= 0) return null;
  return Math.round(parsed * 100);
};

const getRazorpayClient = () => {
  const keyId = process.env.RAZORPAY_KEY_ID;
  const keySecret = process.env.RAZORPAY_KEY_SECRET;

  if (!keyId || !keySecret) {
    const error = new Error('Razorpay keys are not configured');
    error.statusCode = 500;
    throw error;
  }

  return new Razorpay({
    key_id: keyId,
    key_secret: keySecret,
  });
};

const createPayment = async (req, res, next) => {
  try {
    const db = getDB();
    const serviceName = toSafeString(req.body?.service_name);
    const amountInPaise = toAmountInPaise(req.body?.amount);

    if (!serviceName || !amountInPaise) {
      return res.status(400).json({
        success: false,
        message: 'service_name and valid amount are required',
      });
    }

    const razorpay = getRazorpayClient();
    const receipt = `svc_${Date.now()}`;

    const razorpayOrder = await razorpay.orders.create({
      amount: amountInPaise,
      currency: 'INR',
      receipt,
      notes: {
        service_name: serviceName,
      },
    });

    const paymentRecord = {
      service_name: serviceName,
      amount: amountInPaise / 100,
      amount_paise: amountInPaise,
      currency: 'INR',
      receipt,
      status: 'created',
      razorpay_order_id: razorpayOrder.id,
      razorpay_payment_id: null,
      razorpay_signature: null,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    await db.collection('service_payments').insertOne(paymentRecord);

    return res.status(201).json({
      success: true,
      message: 'Payment order created',
      data: {
        key: process.env.RAZORPAY_KEY_ID,
        order_id: razorpayOrder.id,
        amount: razorpayOrder.amount,
        currency: razorpayOrder.currency,
        service_name: serviceName,
      },
    });
  } catch (error) {
    return next(error);
  }
};

const verifyPayment = async (req, res, next) => {
  try {
    const db = getDB();
    const {
      service_name,
      amount,
      razorpay_order_id: razorpayOrderId,
      razorpay_payment_id: razorpayPaymentId,
      razorpay_signature: razorpaySignature,
    } = req.body || {};

    if (!service_name || !amount || !razorpayOrderId || !razorpayPaymentId || !razorpaySignature) {
      return res.status(400).json({
        success: false,
        message:
          'service_name, amount, razorpay_order_id, razorpay_payment_id and razorpay_signature are required',
      });
    }

    const keySecret = process.env.RAZORPAY_KEY_SECRET;
    if (!keySecret) {
      return res.status(500).json({
        success: false,
        message: 'Razorpay secret is not configured',
      });
    }

    const existingPayment = await db
      .collection('service_payments')
      .findOne({ razorpay_order_id: String(razorpayOrderId) });

    if (!existingPayment) {
      return res.status(404).json({
        success: false,
        message: 'Payment order not found',
      });
    }

    if (Number(existingPayment.amount) !== Number(amount)) {
      return res.status(400).json({
        success: false,
        message: 'Amount mismatch for this payment order',
      });
    }

    const payload = `${razorpayOrderId}|${razorpayPaymentId}`;
    const expectedSignature = crypto
      .createHmac('sha256', keySecret)
      .update(payload)
      .digest('hex');

    if (expectedSignature !== razorpaySignature) {
      return res.status(400).json({
        success: false,
        message: 'Invalid payment signature',
      });
    }

    const updateResult = await db.collection('service_payments').updateOne(
      { razorpay_order_id: String(razorpayOrderId) },
      {
        $set: {
          service_name: toSafeString(service_name),
          amount: Number(amount),
          currency: 'INR',
          status: 'paid',
          razorpay_payment_id: String(razorpayPaymentId),
          razorpay_signature: String(razorpaySignature),
          verifiedAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        },
      }
    );

    const savedPayment = await db
      .collection('service_payments')
      .findOne({ razorpay_order_id: String(razorpayOrderId) });

    return res.status(200).json({
      success: true,
      message: 'Payment verified successfully',
      data: savedPayment,
    });
  } catch (error) {
    return next(error);
  }
};

module.exports = {
  createPayment,
  verifyPayment,
};
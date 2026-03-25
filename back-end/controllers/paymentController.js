const crypto = require('crypto');
const Razorpay = require('razorpay');
const { getDB } = require('../config/db');

const toSafeString = (value, fallback = '') => {
  if (value === null || value === undefined) return fallback;
  return String(value).trim();
};

const normalizePaymentStatus = (value) => {
  const raw = toSafeString(value).toLowerCase();
  if (['success', 'paid', 'captured'].includes(raw)) return 'success';
  if (['failed', 'failure'].includes(raw)) return 'failed';
  if (['created', 'pending'].includes(raw)) return 'pending';
  return raw || 'pending';
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
    const email = toSafeString(req.body?.email);
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
      email,
      amount: amountInPaise / 100,
      amount_paise: amountInPaise,
      currency: 'INR',
      receipt,
      status: 'created',
      razorpay_order_id: razorpayOrder.id,
      razorpay_payment_id: null,
      razorpay_signature: null,
      gateway_raw_response: {
        order: {
          id: toSafeString(razorpayOrder?.id),
          amount: Number(razorpayOrder?.amount || 0),
          currency: toSafeString(razorpayOrder?.currency, 'INR'),
          receipt,
        },
      },
      created_at: new Date().toISOString(),
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
      email,
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
    const verificationPayload = {
      razorpay_order_id: toSafeString(razorpayOrderId),
      razorpay_payment_id: toSafeString(razorpayPaymentId),
      razorpay_signature: toSafeString(razorpaySignature),
      email: toSafeString(email, toSafeString(existingPayment?.email)),
      amount: Number(amount),
      service_name: toSafeString(service_name),
    };
    const expectedSignature = crypto
      .createHmac('sha256', keySecret)
      .update(payload)
      .digest('hex');

    if (expectedSignature !== razorpaySignature) {
      await db.collection('service_payments').updateOne(
        { razorpay_order_id: String(razorpayOrderId) },
        {
          $set: {
            status: 'failed',
            gateway_raw_response: verificationPayload,
            updated_at: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
          },
        }
      );

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
          email: toSafeString(email, toSafeString(existingPayment?.email)),
          amount: Number(amount),
          currency: 'INR',
          status: 'success',
          razorpay_payment_id: String(razorpayPaymentId),
          razorpay_signature: String(razorpaySignature),
          gateway_raw_response: verificationPayload,
          created_at: existingPayment?.created_at || existingPayment?.createdAt || new Date().toISOString(),
          verifiedAt: new Date().toISOString(),
          updated_at: new Date().toISOString(),
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

const getPayments = async (req, res, next) => {
  try {
    const db = getDB();
    const search = toSafeString(req.query?.search).toLowerCase();
    const statusFilter = normalizePaymentStatus(req.query?.status || 'all');
    const page = Math.max(1, Number(req.query?.page || 1));
    const limit = Math.max(1, Math.min(200, Number(req.query?.limit || 20)));

    const [servicePaymentRecords, bookingRecords] = await Promise.all([
      db.collection('service_payments').find({}).toArray(),
      db
        .collection('bookings')
        .find({
          $or: [
            { paymentMethod: { $exists: true, $ne: '' } },
            { razorpayPaymentId: { $exists: true, $ne: '' } },
            { razorpay_payment_id: { $exists: true, $ne: '' } },
          ],
        })
        .toArray(),
    ]);

    const mappedServicePayments = servicePaymentRecords.map((record) => ({
      id: String(record?._id || ''),
      razorpay_payment_id: toSafeString(record?.razorpay_payment_id),
      razorpay_order_id: toSafeString(record?.razorpay_order_id),
      service_name: toSafeString(record?.service_name),
      email: toSafeString(record?.email),
      amount: Number(record?.amount || 0),
      status: normalizePaymentStatus(record?.status),
      created_at: record?.created_at || record?.verifiedAt || record?.updatedAt || record?.createdAt || null,
      currency: toSafeString(record?.currency, 'INR'),
      razorpay_signature: toSafeString(record?.razorpay_signature),
      raw_response: record?.gateway_raw_response || null,
      source: 'service_payments',
    }));

    const mappedBookingPayments = bookingRecords.map((record) => ({
      id: `booking-${toSafeString(record?.id || record?._id)}`,
      razorpay_payment_id: toSafeString(record?.razorpayPaymentId || record?.razorpay_payment_id || record?.transactionId),
      razorpay_order_id: toSafeString(record?.razorpayOrderId || record?.razorpay_order_id),
      service_name: toSafeString(record?.serviceName || record?.service_name),
      email: toSafeString(record?.email),
      amount: Number(record?.amount || 0),
      status: normalizePaymentStatus(record?.paymentStatus || record?.status),
      created_at: record?.paymentDate || record?.created_at || record?.updatedAt || record?.createdAt || null,
      currency: toSafeString(record?.currency, 'INR'),
      razorpay_signature: toSafeString(record?.razorpaySignature || record?.razorpay_signature),
      raw_response: record?.raw_response || null,
      source: 'bookings',
    }));

    const dedupeMap = new Map();
    [...mappedServicePayments, ...mappedBookingPayments].forEach((payment) => {
      const key =
        toSafeString(payment.razorpay_payment_id) ||
        toSafeString(payment.razorpay_order_id) ||
        toSafeString(payment.id);

      if (!dedupeMap.has(key)) {
        dedupeMap.set(key, payment);
        return;
      }

      const existing = dedupeMap.get(key);
      if (existing?.source === 'bookings' && payment?.source === 'service_payments') {
        dedupeMap.set(key, { ...existing, ...payment, source: 'service_payments' });
      }
    });

    const mergedPayments = Array.from(dedupeMap.values());

    const filtered = mergedPayments.filter((item) => {
      const matchesStatus = statusFilter === 'all' || item.status === statusFilter;
      const matchesSearch =
        !search ||
        toSafeString(item.email).toLowerCase().includes(search) ||
        toSafeString(item.razorpay_payment_id).toLowerCase().includes(search);
      return matchesStatus && matchesSearch;
    });

    filtered.sort((a, b) => {
      const aTime = new Date(a.created_at || 0).getTime() || 0;
      const bTime = new Date(b.created_at || 0).getTime() || 0;
      return bTime - aTime;
    });

    const total = filtered.length;
    const startIndex = (page - 1) * limit;
    const paginated = filtered.slice(startIndex, startIndex + limit);

    const counts = {
      total: mergedPayments.length,
      success: mergedPayments.filter((item) => item.status === 'success').length,
      failed: mergedPayments.filter((item) => item.status === 'failed').length,
      pending: mergedPayments.filter((item) => item.status === 'pending').length,
    };

    return res.status(200).json({
      success: true,
      data: paginated,
      count: paginated.length,
      total,
      page,
      limit,
      totalPages: Math.max(1, Math.ceil(total / limit)),
      counts,
    });
  } catch (error) {
    return next(error);
  }
};

module.exports = {
  createPayment,
  verifyPayment,
  getPayments,
};
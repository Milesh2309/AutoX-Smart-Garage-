const { getDB } = require('../config/db');
const { ObjectId } = require('mongodb');

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

const toNumber = (value, fallback = 0) => {
  const n = Number(value);
  return Number.isFinite(n) ? n : fallback;
};

const toSafeString = (value, fallback = '') => {
  if (value === null || value === undefined) return fallback;
  return String(value).trim();
};

const normalizeCustomerType = (value) => {
  const normalized = toSafeString(value).toLowerCase();
  if (['registered', 'registered_user', 'registered-user', 'registereduser'].includes(normalized)) {
    return 'registered';
  }
  if (['offline', 'offline_customer', 'offline-customer', 'walk-in', 'walkin'].includes(normalized)) {
    return 'offline';
  }
  return '';
};

const parseDateFilter = (dateValue) => {
  if (!dateValue) return null;
  const date = new Date(dateValue);
  if (Number.isNaN(date.getTime())) return null;
  return date;
};

const buildUserFilters = (rawUserId) => {
  const idText = toSafeString(rawUserId);
  const num = Number(idText);
  const filters = [];

  if (idText) {
    if (ObjectId.isValid(idText) && String(new ObjectId(idText)) === idText) {
      filters.push({ _id: new ObjectId(idText) });
      filters.push({ userObjectId: idText });
      filters.push({ userId: idText });
    }

    if (Number.isFinite(num)) {
      filters.push({ userId: num });
      filters.push({ userId: String(num) });
    }

    filters.push({ userId: idText });
  }

  return filters;
};

const getRegisteredCustomerSnapshot = async (db, rawUserId) => {
  const userFilters = buildUserFilters(rawUserId);
  if (!userFilters.length) return null;

  const user = await db.collection('users').findOne({ $or: userFilters });
  if (!user) return null;

  const numericUserId = Number(user.userId);
  const vehicleFilter = Number.isFinite(numericUserId)
    ? { userId: numericUserId }
    : { userId: toSafeString(user._id) };

  const vehicles = await db
    .collection('vehicles')
    .find(vehicleFilter)
    .sort({ createdAt: -1 })
    .toArray();

  const displayName = toSafeString(user.fullName) || toSafeString(user.name) || toSafeString(user.email) || 'Registered Customer';

  return {
    user,
    vehicles,
    customerDetails: {
      name: displayName,
      phone: toSafeString(user.phone) || 'N/A',
      email: toSafeString(user.email),
    },
  };
};

const normalizeLineItems = (lineItems = []) => {
  if (!Array.isArray(lineItems)) return [];

  return lineItems
    .map((item) => {
      const quantity = Math.max(1, toNumber(item?.quantity, 1));
      const price = Math.max(0, toNumber(item?.price, 0));
      const total = quantity * price;

      return {
        name: toSafeString(item?.name),
        itemType: toSafeString(item?.itemType) || 'service',
        quantity,
        price,
        total,
      };
    })
    .filter((item) => item.name);
};

const resolveBillingPayload = async (db, payload = {}, existingRecord = null) => {
  const customerType = normalizeCustomerType(payload.customerType || existingRecord?.customerType);
  if (!customerType) {
    throw new Error('customerType must be registered or offline');
  }

  const currency = toSafeString(payload.currency || existingRecord?.currency || 'INR').toUpperCase();
  const lineItems = normalizeLineItems(payload.lineItems || existingRecord?.lineItems || []);
  const serviceCharge = Math.max(0, toNumber(payload.serviceCharge, existingRecord?.serviceCharge || 0));
  const discount = Math.max(0, toNumber(payload.discount, existingRecord?.discount || 0));
  const gst = Math.max(0, toNumber(payload.gst, existingRecord?.gst || 0));
  const status = toSafeString(payload.status || existingRecord?.status || 'issued') || 'issued';

  const lineItemsSubtotal = lineItems.reduce((sum, item) => sum + toNumber(item.total), 0);
  const baseSubtotal = lineItemsSubtotal + serviceCharge;
  const subtotal = Math.max(0, baseSubtotal - discount);
  const finalTotal = Math.max(0, subtotal + gst);

  const billingData = {
    customerType,
    currency,
    lineItems,
    serviceCharge,
    discount,
    gst,
    subtotal,
    finalTotal,
    amount: finalTotal,
    totalAmount: finalTotal,
    status,
    paymentStatus: toSafeString(payload.paymentStatus || existingRecord?.paymentStatus || status || 'pending'),
    notes: toSafeString(payload.notes || existingRecord?.notes),
    updatedAt: new Date().toISOString(),
  };

  if (customerType === 'registered') {
    const rawUserId = payload.userId || existingRecord?.userId || existingRecord?.userObjectId;
    const customerSnapshot = await getRegisteredCustomerSnapshot(db, rawUserId);

    if (!customerSnapshot) {
      throw new Error('Registered customer not found');
    }

    const chosenVehicleNumber = toSafeString(payload.vehicleDetails?.number || payload.vehicleNumber);
    const selectedVehicle =
      customerSnapshot.vehicles.find((v) => toSafeString(v.plate).toUpperCase() === chosenVehicleNumber.toUpperCase()) ||
      customerSnapshot.vehicles[0] ||
      null;

    billingData.userId = String(customerSnapshot.user.userId || rawUserId || customerSnapshot.user._id);
    billingData.userObjectId = toSafeString(customerSnapshot.user._id);
    billingData.customerDetails = {
      ...customerSnapshot.customerDetails,
      name: toSafeString(payload.customerDetails?.name) || customerSnapshot.customerDetails.name,
      phone: toSafeString(payload.customerDetails?.phone) || customerSnapshot.customerDetails.phone,
      email: toSafeString(payload.customerDetails?.email) || customerSnapshot.customerDetails.email,
    };
    billingData.vehicleDetails = {
      number: toSafeString(payload.vehicleDetails?.number) || toSafeString(selectedVehicle?.plate),
      model: toSafeString(payload.vehicleDetails?.model) || toSafeString(selectedVehicle?.model),
      company: toSafeString(payload.vehicleDetails?.company) || toSafeString(selectedVehicle?.make),
    };
  } else {
    const customerDetails = payload.customerDetails || {};
    const vehicleDetails = payload.vehicleDetails || {};

    if (!toSafeString(customerDetails.name) || !toSafeString(customerDetails.phone)) {
      throw new Error('Offline customer name and phone are required');
    }

    if (!toSafeString(vehicleDetails.number)) {
      throw new Error('Offline customer vehicle number is required');
    }

    billingData.userId = null;
    billingData.userObjectId = null;
    billingData.customerDetails = {
      name: toSafeString(customerDetails.name),
      phone: toSafeString(customerDetails.phone),
      email: toSafeString(customerDetails.email),
    };
    billingData.vehicleDetails = {
      number: toSafeString(vehicleDetails.number).toUpperCase(),
      model: toSafeString(vehicleDetails.model),
      company: toSafeString(vehicleDetails.company),
    };
  }

  return billingData;
};

const createBilling = async (req, res, next) => {
  try {
    const db = getDB();
    const payload = req.body || {};
    const normalized = await resolveBillingPayload(db, payload);

    const record = {
      invoiceNumber: await buildInvoiceNumber(db),
      ...normalized,
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
    const userFilters = buildUserFilters(userId);
    const query = userFilters.length ? { $or: userFilters } : { userId: String(userId) };
    const records = await db.collection('billing_records').find(query).sort({ createdAt: -1 }).toArray();

    return res.status(200).json({ success: true, data: records });
  } catch (error) {
    return next(error);
  }
};

const getAllBilling = async (req, res, next) => {
  try {
    const db = getDB();
    const { userId, status, verified, invoiceNumber, customerType, customerName, vehicleNumber, date, q } = req.query;
    const filter = {};

    if (userId) {
      const userFilters = buildUserFilters(userId);
      filter.$or = userFilters.length ? userFilters : [{ userId: String(userId) }];
    }
    if (status) filter.status = String(status);
    if (verified !== undefined) filter.verified = String(verified).toLowerCase() === 'true';
    if (invoiceNumber) filter.invoiceNumber = String(invoiceNumber);
    if (customerType) filter.customerType = normalizeCustomerType(customerType) || String(customerType);
    if (customerName) filter['customerDetails.name'] = { $regex: String(customerName), $options: 'i' };
    if (vehicleNumber) filter['vehicleDetails.number'] = { $regex: String(vehicleNumber), $options: 'i' };

    if (q) {
      const textRegex = { $regex: String(q), $options: 'i' };
      filter.$and = filter.$and || [];
      filter.$and.push({
        $or: [
          { invoiceNumber: textRegex },
          { 'customerDetails.name': textRegex },
          { 'vehicleDetails.number': textRegex },
        ],
      });
    }

    if (date) {
      const parsed = parseDateFilter(date);
      if (parsed) {
        const start = new Date(parsed);
        start.setHours(0, 0, 0, 0);
        const end = new Date(parsed);
        end.setHours(23, 59, 59, 999);
        filter.createdAt = {
          $gte: start.toISOString(),
          $lte: end.toISOString(),
        };
      }
    }

    const records = await db.collection('billing_records').find(filter).sort({ createdAt: -1 }).toArray();
    return res.status(200).json({ success: true, data: records });
  } catch (error) {
    return next(error);
  }
};

const getBillingByInvoiceNumber = async (req, res, next) => {
  try {
    const db = getDB();
    const { invoiceNumber } = req.params;
    const record = await db.collection('billing_records').findOne({ invoiceNumber: String(invoiceNumber) });

    if (!record) {
      return res.status(404).json({ success: false, message: 'Invoice not found' });
    }

    return res.status(200).json({ success: true, data: record });
  } catch (error) {
    return next(error);
  }
};

const updateBilling = async (req, res, next) => {
  try {
    const db = getDB();
    const { invoiceNumber } = req.params;
    const existingRecord = await db.collection('billing_records').findOne({ invoiceNumber: String(invoiceNumber) });

    if (!existingRecord) {
      return res.status(404).json({ success: false, message: 'Invoice not found' });
    }

    const normalized = await resolveBillingPayload(db, req.body || {}, existingRecord);
    await db.collection('billing_records').updateOne(
      { invoiceNumber: String(invoiceNumber) },
      {
        $set: {
          ...normalized,
          verified: existingRecord.verified || false,
        }
      }
    );

    const updated = await db.collection('billing_records').findOne({ invoiceNumber: String(invoiceNumber) });
    return res.status(200).json({ success: true, message: 'Billing record updated', data: updated });
  } catch (error) {
    return next(error);
  }
};

const getRegisteredCustomers = async (_req, res, next) => {
  try {
    const db = getDB();
    const users = await db
      .collection('users')
      .find({ role: { $ne: 'admin' } })
      .project({ password: 0, passwordHash: 0 })
      .sort({ createdAt: -1 })
      .toArray();

    const normalized = users.map((u) => ({
      id: String(u.userId || u._id),
      userId: String(u.userId || ''),
      objectId: toSafeString(u._id),
      name: toSafeString(u.fullName) || toSafeString(u.name) || toSafeString(u.email),
      phone: toSafeString(u.phone),
      email: toSafeString(u.email),
    }));

    return res.status(200).json({ success: true, data: normalized });
  } catch (error) {
    return next(error);
  }
};

const getRegisteredCustomerProfile = async (req, res, next) => {
  try {
    const db = getDB();
    const { userId } = req.params;
    const snapshot = await getRegisteredCustomerSnapshot(db, userId);

    if (!snapshot) {
      return res.status(404).json({ success: false, message: 'Registered customer not found' });
    }

    const vehicles = (snapshot.vehicles || []).map((v) => ({
      id: v.id || v._id,
      number: toSafeString(v.plate),
      model: toSafeString(v.model),
      company: toSafeString(v.make),
      year: v.year,
    }));

    return res.status(200).json({
      success: true,
      data: {
        userId: String(snapshot.user.userId || userId || snapshot.user._id),
        userObjectId: toSafeString(snapshot.user._id),
        customerDetails: snapshot.customerDetails,
        vehicleDetails: vehicles[0] || { number: '', model: '', company: '' },
        vehicles,
      },
    });
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

    const invoices = await db.collection('billing_records').find(filter).sort({ createdAt: -1 }).toArray();

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
  getBillingByInvoiceNumber,
  updateBilling,
  getRegisteredCustomers,
  getRegisteredCustomerProfile,
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

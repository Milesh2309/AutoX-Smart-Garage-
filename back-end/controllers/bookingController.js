const { getDB } = require('../config/db');
const { upsertVehicleRecord } = require('./vehicleController');

const resolveAuthUserFilter = (authUser = {}) => {
  const numericId = Number(authUser?.userId ?? authUser?.id);
  const objectIdText = String(authUser?._id || '').trim();

  const candidates = [];
  if (Number.isFinite(numericId)) {
    candidates.push({ userId: numericId }, { userId: String(numericId) });
  }
  if (objectIdText) {
    candidates.push({ userObjectId: objectIdText }, { userId: objectIdText });
  }

  if (!candidates.length) return {};
  return { $or: candidates };
};

const normalizeBookingStatus = (status) => {
  const raw = String(status || '').trim().toLowerCase();
  if (['pending'].includes(raw)) return 'pending';
  if (['in progress', 'in-progress', 'in_progress'].includes(raw)) return 'in-progress';
  if (['completed', 'complete'].includes(raw)) return 'completed';
  if (['cancelled', 'canceled'].includes(raw)) return 'canceled';
  return raw || 'pending';
};

const enrichBookings = async (db, records = []) => {
  if (!Array.isArray(records) || !records.length) return [];

  const numericUserIds = Array.from(
    new Set(
      records
        .map((item) => Number(item?.userId ?? item?.user_id))
        .filter((value) => Number.isFinite(value))
    )
  );

  const vehicleIds = Array.from(
    new Set(
      records
        .map((item) => Number(item?.vehicleId ?? item?.vehicle_id))
        .filter((value) => Number.isFinite(value))
    )
  );

  const [users, vehicles] = await Promise.all([
    numericUserIds.length
      ? db.collection('users').find({ userId: { $in: numericUserIds } }).toArray()
      : Promise.resolve([]),
    vehicleIds.length
      ? db.collection('vehicles').find({ id: { $in: vehicleIds } }).toArray()
      : Promise.resolve([]),
  ]);

  const userMap = new Map(users.map((user) => [Number(user.userId), user]));
  const vehicleMap = new Map(vehicles.map((vehicle) => [Number(vehicle.id), vehicle]));

  return records.map((record) => {
    const user = userMap.get(Number(record.userId ?? record.user_id));
    const vehicle = vehicleMap.get(Number(record.vehicleId ?? record.vehicle_id));

    return {
      ...record,
      user_id: record.userId ?? record.user_id ?? null,
      vehicle_id: record.vehicleId ?? record.vehicle_id ?? vehicle?.id ?? null,
      customerName:
        record.customerName ||
        record.customer_name ||
        user?.fullName ||
        user?.name ||
        user?.email ||
        'N/A',
      mobile: record.phone || record.mobile || user?.phone || 'N/A',
      vehicleNumber:
        record.vehicleNumber || record.vehicle_number || vehicle?.vehicle_number || vehicle?.plate || 'N/A',
      vehicleModel:
        record.vehicleModel || record.vehicle_model || vehicle?.vehicle_model || vehicle?.model || 'N/A',
      vehicleCompany:
        record.vehicleCompany || record.vehicle_company || vehicle?.vehicle_company || vehicle?.make || 'N/A',
      serviceType: record.serviceName || record.serviceType || record.serviceId || 'N/A',
      bookingDate: record.date || record.bookingDate || record.scheduledAt || record.createdAt,
      bookingStatus: normalizeBookingStatus(record.status),
      mechanicName: record.mechanicName || 'Unassigned',
    };
  });
};

const getNextBookingId = async (db) => {
  const [lastBooking] = await db
    .collection('bookings')
    .find({ id: { $type: 'number' } })
    .sort({ id: -1 })
    .limit(1)
    .toArray();

  return (lastBooking?.id || 0) + 1;
};

const getBookings = async (req, res, next) => {
  try {
    const db = getDB();
    const filter = resolveAuthUserFilter(req.user);
    const records = await db.collection('bookings').find(filter).sort({ id: -1 }).toArray();

    return res.status(200).json({
      success: true,
      data: records
    });
  } catch (error) {
    return next(error);
  }
};

const getMyServiceHistory = async (req, res, next) => {
  try {
    const db = getDB();
    const filter = resolveAuthUserFilter(req.user);

    const records = await db
      .collection('bookings')
      .find({
        ...filter,
        status: { $in: ['completed', 'Completed'] },
      })
      .sort({ id: -1 })
      .toArray();

    return res.status(200).json({ success: true, data: records, count: records.length });
  } catch (error) {
    return next(error);
  }
};

const getAllBookings = async (req, res, next) => {
  try {
    const db = getDB();
    const { vehicleNumber, customerName, status } = req.query;
    const filter = {};

    if (status) {
      filter.status = normalizeBookingStatus(status);
    }

    let records = await db.collection('bookings').find(filter).sort({ id: -1 }).toArray();
    records = await enrichBookings(db, records);

    if (vehicleNumber) {
      const search = String(vehicleNumber).toLowerCase();
      records = records.filter((item) => String(item?.vehicleNumber || '').toLowerCase().includes(search));
    }

    if (customerName) {
      const search = String(customerName).toLowerCase();
      records = records.filter((item) => String(item?.customerName || '').toLowerCase().includes(search));
    }

    return res.status(200).json({ success: true, data: records, count: records.length });
  } catch (error) {
    return next(error);
  }
};

const createBooking = async (req, res, next) => {
  try {
    const {
      serviceId,
      serviceName,
      scheduledAt,
      notes,
      amount,
      paymentMethod,
      paymentStatus,
      paymentDate,
      invoiceNumber,
      transactionId,
      razorpayOrderId,
      razorpayPaymentId,
      razorpaySignature,
      vehicleNumber,
      vehicleCompany,
      vehicleModel,
      vehicleType,
    } = req.body;
    const db = getDB();
    
    // Extract user IDs from authenticated user
    const currentUserId = Number(req.user.userId) || null;  // Numeric ID (may be null for older users)
    const currentUserObjectId = String(req.user._id || '').trim();  // MongoDB ObjectId
    
    const booking = {
      id: await getNextBookingId(db),
      userId: currentUserId,
      user_id: currentUserId,
      userObjectId: currentUserObjectId,
      serviceId: Number(serviceId),
      serviceName: serviceName || '',
      scheduledAt,
      notes,
      customerName: req.user.name || req.user.fullName || req.user.email || 'Customer',
      phone: req.user.phone || '',
      email: req.user.email || '',
      amount: amount ? Number(amount) : 0,
      paymentMethod: paymentMethod || '',
      paymentStatus: paymentStatus || '',
      paymentDate: paymentDate || null,
      invoiceNumber: invoiceNumber || '',
      transactionId: transactionId || '',
      razorpayOrderId: razorpayOrderId || '',
      razorpayPaymentId: razorpayPaymentId || '',
      razorpaySignature: razorpaySignature || '',
      vehicleNumber,
      vehicleCompany,
      vehicleModel,
      vehicleType,
      status: 'scheduled',
      createdAt: new Date().toISOString()
    };

    await db.collection('bookings').insertOne(booking);

    if (vehicleNumber) {
      const vehicleRecord = await upsertVehicleRecord(
        db,
        {
          user_id: currentUserId,
          customer_name: req.user.name || req.user.fullName || req.user.email || 'Customer',
          mobile: req.user.phone || '',
          vehicle_number: vehicleNumber,
          vehicle_company: vehicleCompany || '',
          vehicle_model: vehicleModel || '',
          vehicle_type: vehicleType || 'Car',
          added_by: 'user',
        },
        { forcedAddedBy: 'user', fallbackUser: req.user }
      );

      if (vehicleRecord?.id) {
        booking.vehicleId = Number(vehicleRecord.id);
        booking.vehicle_id = Number(vehicleRecord.id);
        await db.collection('bookings').updateOne(
          { id: booking.id },
          { $set: { vehicleId: booking.vehicleId, vehicle_id: booking.vehicle_id } }
        );
      }
    }

    return res.status(201).json({
      success: true,
      message: 'Booking created',
      data: booking
    });
  } catch (error) {
    return next(error);
  }
};

const createBookingPublic = async (req, res, next) => {
  try {
    const {
      userId,
      serviceId,
      serviceName,
      customerName,
      email,
      phone,
      vehicleNumber,
      vehicleCompany,
      vehicleModel,
      vehicleType,
      date,
      timeSlot,
      notes,
      amount
    } = req.body;

    const db = getDB();
    const booking = {
      id: await getNextBookingId(db),
      userId: userId ? Number(userId) : null,
      user_id: userId ? Number(userId) : null,
      serviceId: serviceId ? Number(serviceId) : null,
      serviceName,
      customerName,
      email,
      phone,
      vehicleNumber,
      vehicleCompany,
      vehicleModel,
      vehicleType,
      date,
      timeSlot,
      notes,
      amount: amount ? Number(amount) : 0,
      status: 'pending',
      createdAt: new Date().toISOString()
    };

    await db.collection('bookings').insertOne(booking);

    if (vehicleNumber) {
      const vehicleRecord = await upsertVehicleRecord(
        db,
        {
          user_id: userId ? Number(userId) : null,
          customer_name: customerName || email || 'Customer',
          mobile: phone || '',
          vehicle_number: vehicleNumber,
          vehicle_company: vehicleCompany || '',
          vehicle_model: vehicleModel || '',
          vehicle_type: vehicleType || 'Car',
          added_by: 'user',
        },
        { forcedAddedBy: 'user' }
      );

      if (vehicleRecord?.id) {
        booking.vehicleId = Number(vehicleRecord.id);
        booking.vehicle_id = Number(vehicleRecord.id);
        await db.collection('bookings').updateOne(
          { id: booking.id },
          { $set: { vehicleId: booking.vehicleId, vehicle_id: booking.vehicle_id } }
        );
      }
    }

    return res.status(201).json({ success: true, message: 'Booking created', data: booking });
  } catch (error) {
    return next(error);
  }
};

const getMyBookings = async (req, res, next) => getBookings(req, res, next);

const getBookingById = async (req, res, next) => {
  try {
    const db = getDB();
    const id = Number(req.params.id);
    const userId = Number(req.user.id);
    const booking = await db.collection('bookings').findOne({ id, userId });

    if (!booking) {
      return res.status(404).json({
        success: false,
        message: 'Booking not found'
      });
    }

    return res.status(200).json({
      success: true,
      data: booking
    });
  } catch (error) {
    return next(error);
  }
};

const cancelBooking = async (req, res, next) => {
  try {
    const db = getDB();
    const id = Number(req.params.id);
    const userId = Number(req.user.id);

    const updateResult = await db.collection('bookings').updateOne(
      { id, userId },
      {
        $set: {
          status: 'canceled',
          canceledAt: new Date().toISOString()
        }
      }
    );

    if (updateResult.matchedCount === 0) {
      return res.status(404).json({
        success: false,
        message: 'Booking not found'
      });
    }

    const updated = await db.collection('bookings').findOne({ id, userId });

    return res.status(200).json({
      success: true,
      message: 'Booking canceled',
      data: updated
    });
  } catch (error) {
    return next(error);
  }
};

const deleteBooking = async (req, res, next) => {
  try {
    const db = getDB();
    const id = Number(req.params.id);
    const userId = Number(req.user.id);
    const result = await db.collection('bookings').deleteOne({ id, userId });

    if (result.deletedCount === 0) {
      return res.status(404).json({
        success: false,
        message: 'Booking not found'
      });
    }

    return res.status(200).json({
      success: true,
      message: 'Booking deleted'
    });
  } catch (error) {
    return next(error);
  }
};

const getBookingStats = async (req, res, next) => {
  try {
    const db = getDB();

    const [
      totalBookings,
      scheduledBookings,
      completedBookings,
      canceledBookings
    ] = await Promise.all([
      db.collection('bookings').countDocuments(),
      db.collection('bookings').countDocuments({ status: 'scheduled' }),
      db.collection('bookings').countDocuments({ status: 'completed' }),
      db.collection('bookings').countDocuments({ status: 'canceled' })
    ]);

    return res.status(200).json({
      success: true,
      data: {
        totalBookings,
        scheduledBookings,
        completedBookings,
        canceledBookings,
        completionRate: totalBookings > 0 ? `${((completedBookings / totalBookings) * 100).toFixed(2)}%` : '0%'
      }
    });
  } catch (error) {
    return next(error);
  }
};

const updateBookingStatus = async (req, res, next) => {
  try {
    const db = getDB();
    const id = Number(req.params.id);
    const { status, mechanicId, mechanicName } = req.body;

    const normalizedStatus = normalizeBookingStatus(status);

    if (!['pending', 'scheduled', 'in-progress', 'completed', 'canceled'].includes(normalizedStatus)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid status'
      });
    }

    let resolvedMechanicName = mechanicName || '';
    let resolvedMechanicId = mechanicId;

    if (mechanicId && !mechanicName) {
      const mechanic = await db.collection('mechanics').findOne({ id: Number(mechanicId) });
      if (mechanic) {
        resolvedMechanicName = mechanic.name;
        resolvedMechanicId = mechanic.id;
      }
    }

    const updateData = {
      status: normalizedStatus,
      statusUpdatedAt: new Date().toISOString(),
    };

    if (resolvedMechanicId !== undefined && resolvedMechanicId !== null && resolvedMechanicId !== '') {
      updateData.mechanicId = Number(resolvedMechanicId);
    }

    if (resolvedMechanicName) {
      updateData.mechanicName = resolvedMechanicName;
    }

    const updateResult = await db.collection('bookings').updateOne(
      { id },
      {
        $set: updateData
      }
    );

    if (updateResult.matchedCount === 0) {
      return res.status(404).json({
        success: false,
        message: 'Booking not found'
      });
    }

    const updated = await db.collection('bookings').findOne({ id });

    const [enriched] = await enrichBookings(db, [updated]);

    return res.status(200).json({
      success: true,
      message: 'Booking status updated',
      data: enriched || updated
    });
  } catch (error) {
    return next(error);
  }
};

const deleteBookingByAdmin = async (req, res, next) => {
  try {
    const db = getDB();
    const id = Number(req.params.id);
    const result = await db.collection('bookings').deleteOne({ id });

    if (result.deletedCount === 0) {
      return res.status(404).json({ success: false, message: 'Booking not found' });
    }

    return res.status(200).json({ success: true, message: 'Booking deleted' });
  } catch (error) {
    return next(error);
  }
};

const getAvailableSlots = async (req, res, next) => {
  try {
    const { date } = req.query;
    if (!date) {
      return res.status(400).json({
        success: false,
        message: 'Date parameter is required'
      });
    }

    const db = getDB();
    const dayStart = new Date(`${date}T00:00:00.000Z`);
    const dayEnd = new Date(`${date}T23:59:59.999Z`);

    const bookings = await db.collection('bookings').find({
      scheduledAt: { $gte: dayStart.toISOString(), $lte: dayEnd.toISOString() },
      status: { $nin: ['canceled'] }
    }).toArray();

    const slotTemplate = ['09:00-10:00', '10:00-11:00', '11:00-12:00', '14:00-15:00', '15:00-16:00', '16:00-17:00'];
    const occupied = new Set(bookings.map((item) => {
      const hour = new Date(item.scheduledAt).getUTCHours();
      if (hour === 9) return '09:00-10:00';
      if (hour === 10) return '10:00-11:00';
      if (hour === 11) return '11:00-12:00';
      if (hour === 14) return '14:00-15:00';
      if (hour === 15) return '15:00-16:00';
      if (hour === 16) return '16:00-17:00';
      return null;
    }).filter(Boolean));

    const data = slotTemplate.filter((slot) => !occupied.has(slot)).map((time) => ({ time, available: true }));

    return res.status(200).json({
      success: true,
      date,
      data
    });
  } catch (error) {
    return next(error);
  }
};

const rescheduleBooking = async (req, res, next) => {
  try {
    const db = getDB();
    const id = Number(req.params.id);
    const { newScheduledAt } = req.body;
    const userId = Number(req.user.id);

    const booking = await db.collection('bookings').findOne({ id, userId });
    if (!booking) {
      return res.status(404).json({
        success: false,
        message: 'Booking not found'
      });
    }

    if (!newScheduledAt) {
      return res.status(400).json({
        success: false,
        message: 'newScheduledAt is required'
      });
    }

    await db.collection('bookings').updateOne(
      { id, userId },
      {
        $set: {
          scheduledAt: newScheduledAt,
          rescheduledAt: new Date().toISOString(),
          previousScheduledAt: booking.scheduledAt
        }
      }
    );

    const updated = await db.collection('bookings').findOne({ id, userId });
    return res.status(200).json({
      success: true,
      message: 'Booking rescheduled',
      data: updated
    });
  } catch (error) {
    return next(error);
  }
};

module.exports = {
  getBookings,
  getAllBookings,
  getMyBookings,
  getMyServiceHistory,
  createBooking,
  createBookingPublic,
  getBookingById,
  cancelBooking,
  deleteBooking,
  getBookingStats,
  updateBookingStatus,
  deleteBookingByAdmin,
  getAvailableSlots,
  rescheduleBooking
};

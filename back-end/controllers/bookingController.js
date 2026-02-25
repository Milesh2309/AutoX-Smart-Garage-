const { getDB } = require('../config/db');

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
    const userId = Number(req.user.id);
    const records = await db.collection('bookings').find({ userId }).sort({ id: -1 }).toArray();

    return res.status(200).json({
      success: true,
      data: records
    });
  } catch (error) {
    return next(error);
  }
};

const getAllBookings = async (req, res, next) => {
  try {
    const db = getDB();
    const records = await db.collection('bookings').find().sort({ id: -1 }).toArray();
    return res.status(200).json({ success: true, data: records, count: records.length });
  } catch (error) {
    return next(error);
  }
};

const createBooking = async (req, res, next) => {
  try {
    const { serviceId, scheduledAt, notes } = req.body;
    const db = getDB();
    const booking = {
      id: await getNextBookingId(db),
      userId: Number(req.user.id),
      serviceId: Number(serviceId),
      scheduledAt,
      notes,
      status: 'scheduled',
      createdAt: new Date().toISOString()
    };

    await db.collection('bookings').insertOne(booking);

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
      date,
      timeSlot,
      notes,
      amount
    } = req.body;

    const db = getDB();
    const booking = {
      id: await getNextBookingId(db),
      userId: userId ? Number(userId) : null,
      serviceId: serviceId ? Number(serviceId) : null,
      serviceName,
      customerName,
      email,
      phone,
      vehicleNumber,
      date,
      timeSlot,
      notes,
      amount: amount ? Number(amount) : 0,
      status: 'pending',
      createdAt: new Date().toISOString()
    };

    await db.collection('bookings').insertOne(booking);
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
    const { status } = req.body;

    if (!['scheduled', 'in-progress', 'completed', 'canceled'].includes(status)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid status'
      });
    }

    const updateResult = await db.collection('bookings').updateOne(
      { id },
      {
        $set: {
          status,
          statusUpdatedAt: new Date().toISOString()
        }
      }
    );

    if (updateResult.matchedCount === 0) {
      return res.status(404).json({
        success: false,
        message: 'Booking not found'
      });
    }

    const updated = await db.collection('bookings').findOne({ id });

    return res.status(200).json({
      success: true,
      message: 'Booking status updated',
      data: updated
    });
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
  createBooking,
  createBookingPublic,
  getBookingById,
  cancelBooking,
  deleteBooking,
  getBookingStats,
  updateBookingStatus,
  getAvailableSlots,
  rescheduleBooking
};

const { getDB } = require('../config/db');

const getMonthStart = () => {
  const date = new Date();
  return new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), 1)).toISOString();
};

exports.getDashboardMetrics = async (req, res, next) => {
  try {
    const db = getDB();
    const thisMonthStart = getMonthStart();

    const [
      totalBookings,
      activeBookings,
      completedBookings,
      totalCustomers,
      activeCustomers,
      totalServices,
      thisMonthBookings,
      totalRevenueAgg,
      thisMonthRevenueAgg,
      topServicesAgg,
      reviewsAgg
    ] = await Promise.all([
      db.collection('bookings').countDocuments(),
      db.collection('bookings').countDocuments({ status: { $in: ['scheduled', 'in-progress'] } }),
      db.collection('bookings').countDocuments({ status: 'completed' }),
      db.collection('users').countDocuments(),
      db.collection('users').countDocuments({ updatedAt: { $gte: thisMonthStart } }),
      db.collection('services').countDocuments(),
      db.collection('bookings').countDocuments({ createdAt: { $gte: thisMonthStart } }),
      db.collection('payments').aggregate([
        { $match: { status: 'completed' } },
        { $group: { _id: null, total: { $sum: '$amount' } } }
      ]).toArray(),
      db.collection('payments').aggregate([
        { $match: { status: 'completed', createdAt: { $gte: thisMonthStart } } },
        { $group: { _id: null, total: { $sum: '$amount' } } }
      ]).toArray(),
      db.collection('bookings').aggregate([
        { $group: { _id: '$serviceName', count: { $sum: 1 } } },
        { $sort: { count: -1 } },
        { $limit: 7 }
      ]).toArray(),
      db.collection('reviews').aggregate([
        { $group: { _id: null, avg: { $avg: '$rating' } } }
      ]).toArray()
    ]);

    const totalRevenue = totalRevenueAgg[0]?.total || 0;
    const thisMonthRevenue = thisMonthRevenueAgg[0]?.total || 0;
    const avgRating = reviewsAgg[0]?.avg ? Number(reviewsAgg[0].avg.toFixed(1)) : 0;

    const totalBookingsForPie = topServicesAgg.reduce((s, i) => s + i.count, 0) || 1;
    const topServices = topServicesAgg
      .filter((item) => item._id)
      .map((item) => ({
        name: item._id,
        value: item.count,
        percentage: Math.round((item.count / totalBookingsForPie) * 100)
      }));

    const metrics = {
      totalBookings,
      activeBookings,
      completedServices: completedBookings,
      totalCustomers,
      activeCustomers,
      totalServices,
      totalRevenue,
      avgRating,
      thisMonthRevenue,
      thisMonthBookings,
      topServices,
      growth: {
        bookings: 0,
        revenue: 0,
        customers: 0
      }
    };

    return res.json({ success: true, data: metrics });
  } catch (error) {
    return next(error);
  }
};

exports.getRevenueAnalytics = async (req, res, next) => {
  try {
    const db = getDB();
    const { period } = req.query;

    const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

    const [totalAgg, monthlyAgg, categoryAgg, topCustomers] = await Promise.all([
      db.collection('payments').aggregate([
        { $match: { status: 'completed' } },
        { $group: { _id: null, total: { $sum: '$amount' } } }
      ]).toArray(),
      db.collection('payments').aggregate([
        { $match: { status: 'completed' } },
        {
          $group: {
            _id: { $substr: ['$createdAt', 0, 7] },
            amount: { $sum: '$amount' }
          }
        },
        { $sort: { _id: 1 } },
        { $limit: 12 }
      ]).toArray(),
      db.collection('bookings').aggregate([
        { $match: { status: 'completed' } },
        {
          $group: {
            _id: '$serviceName',
            revenue: { $sum: { $ifNull: ['$amount', 0] } }
          }
        },
        { $sort: { revenue: -1 } }
      ]).toArray(),
      db.collection('payments').aggregate([
        { $match: { status: 'completed' } },
        { $group: { _id: '$userId', totalSpent: { $sum: '$amount' } } },
        { $sort: { totalSpent: -1 } },
        { $limit: 5 }
      ]).toArray()
    ]);

    const monthlyRevenue = monthlyAgg.map((item) => {
      const [, m] = (item._id || '').split('-');
      const monthIdx = parseInt(m, 10) - 1;
      return {
        month: monthNames[monthIdx] || item._id,
        revenue: item.amount,
        target: Math.round(item.amount * 1.15)
      };
    });

    const serviceCategories = categoryAgg
      .filter((item) => item._id)
      .map((item) => ({ category: item._id, revenue: item.revenue }));

    const revenueData = {
      period: period || 'monthly',
      total: totalAgg[0]?.total || 0,
      monthlyRevenue,
      serviceCategories,
      breakdown: monthlyAgg.map((item) => ({ month: item._id, amount: item.amount })),
      byService: serviceCategories,
      topCustomers: topCustomers.map((item) => ({ customerId: item._id, totalSpent: item.totalSpent }))
    };

    return res.json({ success: true, data: revenueData });
  } catch (error) {
    return next(error);
  }
};

exports.getBookingTrends = async (req, res, next) => {
  try {
    const db = getDB();
    const { period } = req.query;

    const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

    const [totalBookings, data] = await Promise.all([
      db.collection('bookings').countDocuments(),
      db.collection('bookings').aggregate([
        {
          $group: {
            _id: { $substr: ['$scheduledAt', 0, 10] },
            bookings: { $sum: 1 },
            completed: { $sum: { $cond: [{ $eq: ['$status', 'completed'] }, 1, 0] } },
            cancelled: { $sum: { $cond: [{ $eq: ['$status', 'canceled'] }, 1, 0] } }
          }
        },
        { $sort: { _id: 1 } },
        { $limit: 30 }
      ]).toArray()
    ]);

    const dailyBookings = data.map((item) => {
      const d = new Date(item._id);
      const dayLabel = `${dayNames[d.getUTCDay()]} ${item._id.slice(8)}`;
      return { day: dayLabel, bookings: item.bookings, completed: item.completed, cancelled: item.cancelled };
    });

    return res.json({
      success: true,
      data: {
        period: period || 'weekly',
        totalBookings,
        dailyBookings,
        data: data.map((item) => ({ date: item._id, bookings: item.bookings, completed: item.completed, cancelled: item.cancelled })),
        peakHours: []
      }
    });
  } catch (error) {
    return next(error);
  }
};

exports.getCustomerSatisfaction = async (req, res, next) => {
  try {
    const db = getDB();
    const reviews = await db.collection('reviews').find().toArray();

    if (reviews.length === 0) {
      return res.json({ success: true, data: {
        averageRating: 0,
        totalReviews: 0,
        ratingDistribution: { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 },
        nps: 0,
        comments: { positive: 0, neutral: 0, negative: 0 },
        topCompliments: [],
        commonComplaints: []
      }});
    }

    const totalReviews = reviews.length;
    const averageRating = reviews.reduce((acc, item) => acc + Number(item.rating || 0), 0) / totalReviews;
    const ratingDistribution = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 };
    reviews.forEach((item) => {
      const rating = Math.max(1, Math.min(5, Math.round(Number(item.rating || 0))));
      ratingDistribution[rating] += 1;
    });

    const ratings = Object.entries(ratingDistribution).map(([star, count]) => ({
      rating: `${star} Star`,
      count
    }));

    return res.json({ success: true, data: {
      averageRating: Number(averageRating.toFixed(2)),
      avgRating: Number(averageRating.toFixed(1)),
      totalReviews,
      ratingDistribution,
      ratings,
      nps: 0,
      comments: { positive: 0, neutral: 0, negative: 0 },
      topCompliments: [],
      commonComplaints: []
    }});
  } catch (error) {
    return next(error);
  }
};

exports.generateReport = async (req, res, next) => {
  try {
    const db = getDB();
    const { reportType, startDate, endDate } = req.body;

    if (!reportType) {
      return res.status(400).json({ success: false, message: 'reportType is required' });
    }

    const timestamp = Date.now();
    const report = {
      reportId: `RPT-${timestamp}`,
      reportType,
      generatedAt: new Date().toISOString(),
      period: { startDate, endDate },
      summary: 'Report generated successfully',
      downloadUrl: `/api/reports/download/${timestamp}`
    };

    await db.collection('reports').insertOne(report);
    return res.status(201).json({ success: true, data: report });
  } catch (error) {
    return next(error);
  }
};

exports.scheduleReport = async (req, res, next) => {
  try {
    const db = getDB();
    const { reportType, frequency, email } = req.body;

    if (!reportType || !frequency || !email) {
      return res.status(400).json({ success: false, message: 'reportType, frequency, and email are required' });
    }

    const scheduled = {
      scheduleId: `SCH-${Date.now()}`,
      reportType,
      frequency,
      email,
      status: 'active',
      createdAt: new Date().toISOString(),
      nextRun: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString()
    };

    await db.collection('report_schedules').insertOne(scheduled);
    return res.status(201).json({ success: true, data: scheduled });
  } catch (error) {
    return next(error);
  }
};

const express = require('express');
const { body, param } = require('express-validator');
const router = express.Router();
const bookingController = require('../controllers/bookingController');
const validate = require('../middleware/validationMiddleware');
const authMiddleware = require('../middleware/authMiddleware');

/**
 * @swagger
 * tags:
 *   name: Bookings
 *   description: Service bookings
 */

/**
 * @swagger
 * /bookings:
 *   get:
 *     summary: View user's appointment history
 *     tags: [Bookings]
 */
router.get('/bookings', authMiddleware, bookingController.getBookings);

/**
 * @swagger
 * /bookings/{id}:
 *   get:
 *     summary: Get booking by ID
 *     tags: [Bookings]
 */
router.get(
  '/bookings/:id',
  authMiddleware,
  param('id').isInt({ gt: 0 }).withMessage('id must be a positive integer'),
  validate,
  bookingController.getBookingById
);

/**
 * @swagger
 * /bookings:
 *   post:
 *     summary: Schedule a new service appointment
 *     tags: [Bookings]
 */
router.post(
  '/bookings',
  authMiddleware,
  body('serviceId').isInt({ gt: 0 }).withMessage('serviceId must be a positive integer'),
  body('scheduledAt').notEmpty().withMessage('scheduledAt is required'),
  validate,
  bookingController.createBooking
);

/**
 * @swagger
 * /bookings/{id}/cancel:
 *   put:
 *     summary: Cancel an existing appointment
 *     tags: [Bookings]
 */
router.put(
  '/bookings/:id/cancel',
  authMiddleware,
  param('id').isInt({ gt: 0 }).withMessage('id must be a positive integer'),
  validate,
  bookingController.cancelBooking
);

/**
 * @swagger
 * /bookings/{id}:
 *   delete:
 *     summary: Delete a booking
 *     tags: [Bookings]
 */
router.delete(
  '/bookings/:id',
  authMiddleware,
  param('id').isInt({ gt: 0 }).withMessage('id must be a positive integer'),
  validate,
  bookingController.deleteBooking
);

/**
 * @swagger
 * /bookings/stats:
 *   get:
 *     summary: Get booking statistics (admin)
 *     tags: [Bookings]
 */
router.get('/bookings/stats', bookingController.getBookingStats);

/**
 * @swagger
 * /bookings/{id}/status:
 *   put:
 *     summary: Update booking status
 *     tags: [Bookings]
 */
router.put(
  '/bookings/:id/status',
  param('id').isInt({ gt: 0 }).withMessage('id must be a positive integer'),
  body('status').notEmpty().withMessage('status is required'),
  validate,
  bookingController.updateBookingStatus
);

/**
 * @swagger
 * /bookings/slots:
 *   get:
 *     summary: Get available time slots
 *     tags: [Bookings]
 */
router.get('/bookings/slots', bookingController.getAvailableSlots);

/**
 * @swagger
 * /bookings/{id}/reschedule:
 *   post:
 *     summary: Reschedule booking
 *     tags: [Bookings]
 */
router.post(
  '/bookings/:id/reschedule',
  authMiddleware,
  param('id').isInt({ gt: 0 }).withMessage('id must be a positive integer'),
  body('newScheduledAt').notEmpty().withMessage('newScheduledAt is required'),
  validate,
  bookingController.rescheduleBooking
);

module.exports = router;

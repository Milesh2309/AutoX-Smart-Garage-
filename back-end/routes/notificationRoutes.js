const express = require('express');
const { param, body } = require('express-validator');
const router = express.Router();
const notificationController = require('../controllers/notificationController');
const validate = require('../middleware/validationMiddleware');

/**
 * @swagger
 * tags:
 *   name: Notifications
 *   description: User notifications
 */

/**
 * @swagger
 * /api/notifications/{userId}:
 *   get:
 *     summary: Get user notifications
 *     tags: [Notifications]
 */
router.get(
  '/api/notifications/:userId',
  param('userId').isInt({ gt: 0 }).withMessage('userId must be a positive integer'),
  validate,
  notificationController.getNotifications
);

/**
 * @swagger
 * /api/notifications/send:
 *   post:
 *     summary: Send notification
 *     tags: [Notifications]
 */
router.post(
  '/api/notifications/send',
  body('userId').isInt({ gt: 0 }).withMessage('userId must be a positive integer'),
  body('message').notEmpty().withMessage('message is required'),
  validate,
  notificationController.sendNotification
);

/**
 * @swagger
 * /api/notifications/{id}/read:
 *   put:
 *     summary: Mark notification as read
 *     tags: [Notifications]
 */
router.put(
  '/api/notifications/:id/read',
  param('id').isInt({ gt: 0 }).withMessage('id must be a positive integer'),
  validate,
  notificationController.markAsRead
);

/**
 * @swagger
 * /api/notifications/{id}:
 *   delete:
 *     summary: Delete notification
 *     tags: [Notifications]
 */
router.delete(
  '/api/notifications/:id',
  param('id').isInt({ gt: 0 }).withMessage('id must be a positive integer'),
  validate,
  notificationController.deleteNotification
);

/**
 * @swagger
 * /api/notifications/email:
 *   post:
 *     summary: Send email notification
 *     tags: [Notifications]
 */
router.post(
  '/api/notifications/email',
  body('email').isEmail().withMessage('email must be valid'),
  body('subject').notEmpty().withMessage('subject is required'),
  body('message').notEmpty().withMessage('message is required'),
  validate,
  notificationController.sendEmailNotification
);

/**
 * @swagger
 * /api/notifications/sms:
 *   post:
 *     summary: Send SMS notification
 *     tags: [Notifications]
 */
router.post(
  '/api/notifications/sms',
  body('phoneNumber').notEmpty().withMessage('phoneNumber is required'),
  body('message').notEmpty().withMessage('message is required'),
  validate,
  notificationController.sendSmsNotification
);

module.exports = router;

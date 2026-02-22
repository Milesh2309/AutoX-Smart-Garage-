const express = require('express');
const { body, param, query } = require('express-validator');
const router = express.Router();
const billingController = require('../controllers/billingController');
const validate = require('../middleware/validationMiddleware');

/**
 * @swagger
 * tags:
 *   name: Billing
 *   description: Billing APIs
 */

/**
 * @swagger
 * /api/billing/create:
 *   post:
 *     summary: Create billing record
 *     tags: [Billing]
 */
router.post(
  '/api/billing/create',
  body('userId').notEmpty().withMessage('userId is required'),
  body('amount').isFloat({ gt: 0 }).withMessage('amount must be greater than 0'),
  body('currency').isLength({ min: 3, max: 3 }).withMessage('currency must be 3 letters'),
  validate,
  billingController.createBilling
);

/**
 * @swagger
 * /api/billing/user/{userId}:
 *   get:
 *     summary: Get billing records by user
 *     tags: [Billing]
 */
router.get(
  '/api/billing/user/:userId',
  param('userId').notEmpty().withMessage('userId is required'),
  validate,
  billingController.getBillingByUser
);

/**
 * @swagger
 * /api/billing/all:
 *   get:
 *     summary: Get all billing records
 *     tags: [Billing]
 */
router.get(
  '/api/billing/all',
  query('verified').optional().isBoolean().withMessage('verified must be true or false'),
  validate,
  billingController.getAllBilling
);

/**
 * @swagger
 * /api/billing/refund:
 *   post:
 *     summary: Refund billing record
 *     tags: [Billing]
 */
router.post(
  '/api/billing/refund',
  body('invoiceNumber').notEmpty().withMessage('invoiceNumber is required'),
  body('reason').notEmpty().withMessage('reason is required'),
  validate,
  billingController.refundBilling
);

/**
 * @swagger
 * /api/billing/verify/{invoiceNumber}:
 *   patch:
 *     summary: Verify billing record
 *     tags: [Billing]
 */
router.patch(
  '/api/billing/verify/:invoiceNumber',
  param('invoiceNumber').notEmpty().withMessage('invoiceNumber is required'),
  validate,
  billingController.verifyBilling
);

/**
 * @swagger
 * /api/payments:
 *   post:
 *     summary: Create payment
 *     tags: [Payments]
 */
router.post(
  '/api/payments',
  body('userId').isInt({ gt: 0 }).withMessage('userId must be a positive integer'),
  body('amount').isFloat({ gt: 0 }).withMessage('amount must be greater than 0'),
  body('method').notEmpty().withMessage('method is required'),
  validate,
  billingController.createPayment
);

/**
 * @swagger
 * /api/payments/{paymentId}:
 *   get:
 *     summary: Get payment details
 *     tags: [Payments]
 */
router.get(
  '/api/payments/:paymentId',
  param('paymentId').notEmpty().withMessage('paymentId is required'),
  validate,
  billingController.getPaymentById
);

/**
 * @swagger
 * /api/payments/user/{userId}:
 *   get:
 *     summary: Get user payments
 *     tags: [Payments]
 */
router.get(
  '/api/payments/user/:userId',
  param('userId').isInt({ gt: 0 }).withMessage('userId must be a positive integer'),
  validate,
  billingController.getUserPayments
);

/**
 * @swagger
 * /api/payments/verify:
 *   post:
 *     summary: Verify payment (Razorpay)
 *     tags: [Payments]
 */
router.post(
  '/api/payments/verify',
  body('paymentId').notEmpty().withMessage('paymentId is required'),
  body('razorpayPaymentId').notEmpty().withMessage('razorpayPaymentId is required'),
  validate,
  billingController.verifyPayment
);

/**
 * @swagger
 * /api/refunds:
 *   post:
 *     summary: Process refund
 *     tags: [Payments]
 */
router.post(
  '/api/refunds',
  body('paymentId').notEmpty().withMessage('paymentId is required'),
  validate,
  billingController.processRefund
);

/**
 * @swagger
 * /api/invoices:
 *   get:
 *     summary: List invoices
 *     tags: [Invoices]
 */
router.get('/api/invoices', billingController.getInvoices);

/**
 * @swagger
 * /api/invoices/download/{invoiceId}:
 *   get:
 *     summary: Download invoice
 *     tags: [Invoices]
 */
router.get(
  '/api/invoices/download/:invoiceId',
  param('invoiceId').notEmpty().withMessage('invoiceId is required'),
  validate,
  billingController.downloadInvoice
);

module.exports = router;

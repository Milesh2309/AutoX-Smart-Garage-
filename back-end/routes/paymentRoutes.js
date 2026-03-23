const express = require('express');
const { body } = require('express-validator');
const router = express.Router();
const paymentController = require('../controllers/paymentController');
const validate = require('../middleware/validationMiddleware');

router.post(
  '/create-payment',
  body('service_name').notEmpty().withMessage('service_name is required'),
  body('amount').isFloat({ gt: 0 }).withMessage('amount must be greater than 0'),
  validate,
  paymentController.createPayment
);

router.post(
  '/verify-payment',
  body('service_name').notEmpty().withMessage('service_name is required'),
  body('amount').isFloat({ gt: 0 }).withMessage('amount must be greater than 0'),
  body('razorpay_order_id').notEmpty().withMessage('razorpay_order_id is required'),
  body('razorpay_payment_id').notEmpty().withMessage('razorpay_payment_id is required'),
  body('razorpay_signature').notEmpty().withMessage('razorpay_signature is required'),
  validate,
  paymentController.verifyPayment
);

module.exports = router;
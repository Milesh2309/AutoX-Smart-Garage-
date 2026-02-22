const express = require('express');
const { param, body } = require('express-validator');
const router = express.Router();
const breakdownController = require('../controllers/breakdownController');
const validate = require('../middleware/validationMiddleware');

/**
 * @swagger
 * tags:
 *   name: Breakdown
 *   description: Breakdown and roadside assistance
 */

/**
 * @swagger
 * /api/breakdown-calls:
 *   post:
 *     summary: Request breakdown assistance
 *     tags: [Breakdown]
 */
router.post(
  '/api/breakdown-calls',
  body('userId').isInt({ gt: 0 }).withMessage('userId must be a positive integer'),
  body('location').notEmpty().withMessage('location is required'),
  validate,
  breakdownController.createBreakdownCall
);

/**
 * @swagger
 * /api/breakdown-calls:
 *   get:
 *     summary: List breakdown requests
 *     tags: [Breakdown]
 */
router.get('/api/breakdown-calls', breakdownController.listBreakdownCalls);

/**
 * @swagger
 * /api/breakdown-calls/{id}:
 *   get:
 *     summary: Get breakdown request details
 *     tags: [Breakdown]
 */
router.get(
  '/api/breakdown-calls/:id',
  param('id').isInt({ gt: 0 }).withMessage('id must be a positive integer'),
  validate,
  breakdownController.getBreakdownCall
);

/**
 * @swagger
 * /api/breakdown-calls/{id}:
 *   put:
 *     summary: Update breakdown status
 *     tags: [Breakdown]
 */
router.put(
  '/api/breakdown-calls/:id',
  param('id').isInt({ gt: 0 }).withMessage('id must be a positive integer'),
  validate,
  breakdownController.updateBreakdownStatus
);

/**
 * @swagger
 * /api/breakdown-calls/nearby:
 *   get:
 *     summary: Find nearest mechanic
 *     tags: [Breakdown]
 */
router.get('/api/breakdown-calls/nearby', breakdownController.findNearestMechanic);

module.exports = router;

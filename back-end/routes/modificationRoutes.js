const express = require('express');
const { param, body } = require('express-validator');
const router = express.Router();
const modificationController = require('../controllers/modificationController');
const validate = require('../middleware/validationMiddleware');

/**
 * @swagger
 * tags:
 *   name: Modifications
 *   description: Vehicle modifications and customization
 */

/**
 * @swagger
 * /api/modifications:
 *   get:
 *     summary: List available modifications
 *     tags: [Modifications]
 */
router.get('/api/modifications', modificationController.listModifications);

/**
 * @swagger
 * /api/modifications/{id}:
 *   get:
 *     summary: Get modification details
 *     tags: [Modifications]
 */
router.get(
  '/api/modifications/:id',
  param('id').isInt({ gt: 0 }).withMessage('id must be a positive integer'),
  validate,
  modificationController.getModificationById
);

/**
 * @swagger
 * /api/mod-quotes:
 *   post:
 *     summary: Create modification quote
 *     tags: [Modifications]
 */
router.post(
  '/api/mod-quotes',
  body('userId').isInt({ gt: 0 }).withMessage('userId must be a positive integer'),
  body('modId').isInt({ gt: 0 }).withMessage('modId must be a positive integer'),
  validate,
  modificationController.createModQuote
);

/**
 * @swagger
 * /api/mod-quotes:
 *   get:
 *     summary: List modification quotes
 *     tags: [Modifications]
 */
router.get('/api/mod-quotes', modificationController.listModQuotes);

/**
 * @swagger
 * /api/mod-quotes/{id}:
 *   put:
 *     summary: Update quote status
 *     tags: [Modifications]
 */
router.put(
  '/api/mod-quotes/:id',
  param('id').isInt({ gt: 0 }).withMessage('id must be a positive integer'),
  validate,
  modificationController.updateModQuoteStatus
);

/**
 * @swagger
 * /api/mod-orders:
 *   post:
 *     summary: Create modification order
 *     tags: [Modifications]
 */
router.post(
  '/api/mod-orders',
  body('modQuoteId').isInt({ gt: 0 }).withMessage('modQuoteId must be a positive integer'),
  validate,
  modificationController.createModOrder
);

module.exports = router;

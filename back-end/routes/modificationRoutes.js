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
 *     responses:
 *       200:
 *         description: Modifications list
 */
router.get('/api/modifications', modificationController.listModifications);

router.post('/api/modifications', modificationController.createModification);

/**
 * @swagger
 * /api/modifications/{id}:
 *   get:
 *     summary: Get modification details
 *     tags: [Modifications]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Modification details
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
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [userId, modId]
 *             properties:
 *               userId:
 *                 type: integer
 *               modId:
 *                 type: integer
 *     responses:
 *       201:
 *         description: Quote created
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
 *     responses:
 *       200:
 *         description: Quote list
 */
router.get('/api/mod-quotes', modificationController.listModQuotes);

/**
 * @swagger
 * /api/mod-quotes/{id}:
 *   put:
 *     summary: Update quote status
 *     tags: [Modifications]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     requestBody:
 *       required: false
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               status:
 *                 type: string
 *     responses:
 *       200:
 *         description: Quote updated
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
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [modQuoteId]
 *             properties:
 *               modQuoteId:
 *                 type: integer
 *     responses:
 *       201:
 *         description: Order created
 */
router.post(
  '/api/mod-orders',
  body('modQuoteId').isInt({ gt: 0 }).withMessage('modQuoteId must be a positive integer'),
  validate,
  modificationController.createModOrder
);

module.exports = router;

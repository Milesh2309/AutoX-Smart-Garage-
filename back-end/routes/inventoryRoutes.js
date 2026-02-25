const express = require('express');
const { param, body } = require('express-validator');
const router = express.Router();
const inventoryController = require('../controllers/inventoryController');
const validate = require('../middleware/validationMiddleware');

/**
 * @swagger
 * tags:
 *   name: Inventory
 *   description: Parts and inventory management
 */

/**
 * @swagger
 * /api/inventory:
 *   get:
 *     summary: List all parts
 *     tags: [Inventory]
 *     responses:
 *       200:
 *         description: Inventory parts list
 */
router.get('/api/inventory', inventoryController.listInventory);

/**
 * @swagger
 * /api/inventory:
 *   post:
 *     summary: Add new part
 *     tags: [Inventory]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [name, price, stock]
 *             properties:
 *               name:
 *                 type: string
 *               price:
 *                 type: number
 *               stock:
 *                 type: integer
 *     responses:
 *       201:
 *         description: Part added
 */
router.post(
  '/api/inventory',
  body('name').notEmpty().withMessage('name is required'),
  body('price').isFloat({ gt: 0 }).withMessage('price must be greater than 0'),
  body('stock').isInt({ gte: 0 }).withMessage('stock must be a non-negative integer'),
  validate,
  inventoryController.addPart
);

/**
 * @swagger
 * /api/inventory/{id}:
 *   put:
 *     summary: Update part stock
 *     tags: [Inventory]
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
 *               stock:
 *                 type: integer
 *     responses:
 *       200:
 *         description: Part stock updated
 */
router.put(
  '/api/inventory/:id',
  param('id').isInt({ gt: 0 }).withMessage('id must be a positive integer'),
  validate,
  inventoryController.updateStock
);

/**
 * @swagger
 * /api/inventory/{id}:
 *   delete:
 *     summary: Delete part
 *     tags: [Inventory]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Part deleted
 */
router.delete(
  '/api/inventory/:id',
  param('id').isInt({ gt: 0 }).withMessage('id must be a positive integer'),
  validate,
  inventoryController.deletePart
);

/**
 * @swagger
 * /api/inventory/low-stock:
 *   get:
 *     summary: Get low stock alerts
 *     tags: [Inventory]
 *     responses:
 *       200:
 *         description: Low stock items
 */
router.get('/api/inventory/low-stock', inventoryController.getLowStockAlerts);

/**
 * @swagger
 * /api/inventory/orders:
 *   post:
 *     summary: Create parts order
 *     tags: [Inventory]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [partId, quantity, supplier]
 *             properties:
 *               partId:
 *                 type: integer
 *               quantity:
 *                 type: integer
 *               supplier:
 *                 type: string
 *     responses:
 *       201:
 *         description: Parts order created
 */
router.post(
  '/api/inventory/orders',
  body('partId').isInt({ gt: 0 }).withMessage('partId must be a positive integer'),
  body('quantity').isInt({ gt: 0 }).withMessage('quantity must be a positive integer'),
  body('supplier').notEmpty().withMessage('supplier is required'),
  validate,
  inventoryController.createPartOrder
);

module.exports = router;

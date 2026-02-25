const express = require('express');
const { body, param } = require('express-validator');
const router = express.Router();
const packageController = require('../controllers/packageController');
const authMiddleware = require('../middleware/authMiddleware');
const validate = require('../middleware/validationMiddleware');

/**
 * @swagger
 * tags:
 *   name: Packages
 *   description: Subscription package APIs
 */

/**
 * @swagger
 * /api/packages/me:
 *   get:
 *     summary: Get current user's packages
 *     tags: [Packages]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Current user package list
 *       401:
 *         description: Unauthorized
 */
router.get('/api/packages/me', authMiddleware, packageController.getMyPackages);

/**
 * @swagger
 * /api/packages/{id}/renew:
 *   post:
 *     summary: Renew package
 *     tags: [Packages]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: false
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               amount:
 *                 type: number
 *     responses:
 *       200:
 *         description: Package renewed
 *       401:
 *         description: Unauthorized
 */
router.post(
  '/api/packages/:id/renew',
  authMiddleware,
  param('id').notEmpty().withMessage('package id is required'),
  body('amount').optional().isFloat({ gt: 0 }).withMessage('amount must be greater than 0'),
  validate,
  packageController.renewPackage
);

module.exports = router;

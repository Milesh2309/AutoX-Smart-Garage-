const express = require('express');
const { param, body } = require('express-validator');
const router = express.Router();
const settingsController = require('../controllers/settingsController');
const validate = require('../middleware/validationMiddleware');

/**
 * @swagger
 * tags:
 *   name: Settings
 *   description: System settings and configuration
 */

/**
 * @swagger
 * /api/settings:
 *   get:
 *     summary: Get system settings
 *     tags: [Settings]
 */
router.get('/api/settings', settingsController.getSettings);

/**
 * @swagger
 * /api/settings:
 *   put:
 *     summary: Update system settings
 *     tags: [Settings]
 */
router.put(
  '/api/settings',
  body('businessName').optional().isLength({ min: 3 }).withMessage('businessName must be at least 3 characters'),
  validate,
  settingsController.updateSettings
);

/**
 * @swagger
 * /api/company-info:
 *   get:
 *     summary: Get company information
 *     tags: [Settings]
 */
router.get('/api/company-info', settingsController.getCompanyInfo);

/**
 * @swagger
 * /api/locations:
 *   get:
 *     summary: Get all locations
 *     tags: [Settings]
 */
router.get('/api/locations', settingsController.getLocations);

/**
 * @swagger
 * /api/locations:
 *   post:
 *     summary: Create new location
 *     tags: [Settings]
 */
router.post(
  '/api/locations',
  body('name').notEmpty().withMessage('name is required'),
  body('address').notEmpty().withMessage('address is required'),
  validate,
  settingsController.manageLocation
);

/**
 * @swagger
 * /api/locations/{id}:
 *   put:
 *     summary: Update location
 *     tags: [Settings]
 */
router.put(
  '/api/locations/:id',
  param('id').isInt({ gt: 0 }).withMessage('id must be a positive integer'),
  validate,
  settingsController.manageLocation
);

/**
 * @swagger
 * /api/rates:
 *   get:
 *     summary: Get service rates
 *     tags: [Settings]
 */
router.get('/api/rates', settingsController.getServiceRates);

/**
 * @swagger
 * /api/rates:
 *   post:
 *     summary: Update service rates
 *     tags: [Settings]
 */
router.post(
  '/api/rates',
  body('serviceRateUpdates').isArray().withMessage('serviceRateUpdates must be an array'),
  validate,
  settingsController.updateServiceRates
);

module.exports = router;

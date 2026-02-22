const express = require('express');
const { body, param } = require('express-validator');
const router = express.Router();
const servicesController = require('../controllers/servicesController');
const validate = require('../middleware/validationMiddleware');

/**
 * @swagger
 * tags:
 *   name: Services
 *   description: Garage services
 */

/**
 * @swagger
 * /services:
 *   get:
 *     summary: List all services
 *     tags: [Services]
 */
router.get('/services', servicesController.getServices);

/**
 * @swagger
 * /services/{id}:
 *   get:
 *     summary: Get service by ID
 *     tags: [Services]
 */
router.get(
  '/services/:id',
  param('id').isInt({ gt: 0 }).withMessage('id must be a positive integer'),
  validate,
  servicesController.getServiceById
);

/**
 * @swagger
 * /services:
 *   post:
 *     summary: Create a service
 *     tags: [Services]
 */
router.post(
  '/services',
  body('name').notEmpty().withMessage('name is required'),
  body('price').isFloat({ gt: 0 }).withMessage('price must be greater than 0'),
  body('description').notEmpty().withMessage('description is required'),
  validate,
  servicesController.createService
);

/**
 * @swagger
 * /services/{id}:
 *   put:
 *     summary: Update a service
 *     tags: [Services]
 */
router.put(
  '/services/:id',
  param('id').isInt({ gt: 0 }).withMessage('id must be a positive integer'),
  body('price').optional().isFloat({ gt: 0 }).withMessage('price must be greater than 0'),
  validate,
  servicesController.updateService
);

/**
 * @swagger
 * /services/{id}:
 *   delete:
 *     summary: Delete a service
 *     tags: [Services]
 */
router.delete(
  '/services/:id',
  param('id').isInt({ gt: 0 }).withMessage('id must be a positive integer'),
  validate,
  servicesController.deleteService
);

/**
 * @swagger
 * /services/search:
 *   get:
 *     summary: Search services
 *     tags: [Services]
 */
router.get('/services/search', servicesController.searchServices);

/**
 * @swagger
 * /services/category/{category}:
 *   get:
 *     summary: Get services by category
 *     tags: [Services]
 */
router.get(
  '/services/category/:category',
  param('category').notEmpty().withMessage('category is required'),
  validate,
  servicesController.getServicesByCategory
);

module.exports = router;

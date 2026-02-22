const express = require('express');
const { body, param } = require('express-validator');
const router = express.Router();
const vehicleController = require('../controllers/vehicleController');
const validate = require('../middleware/validationMiddleware');
const authMiddleware = require('../middleware/authMiddleware');

/**
 * @swagger
 * tags:
 *   name: Vehicles
 *   description: User vehicles
 */

/**
 * @swagger
 * /vehicles:
 *   get:
 *     summary: List logged-in user's vehicles
 *     tags: [Vehicles]
 */
router.get('/vehicles', authMiddleware, vehicleController.getVehicles);

/**
 * @swagger
 * /vehicles:
 *   post:
 *     summary: Add a new car to the user's profile
 *     tags: [Vehicles]
 */
router.post(
  '/vehicles',
  authMiddleware,
  body('make').notEmpty().withMessage('make is required'),
  body('model').notEmpty().withMessage('model is required'),
  body('year').isInt({ min: 1980 }).withMessage('year must be valid'),
  body('plate').notEmpty().withMessage('plate is required'),
  validate,
  vehicleController.createVehicle
);

/**
 * @swagger
 * /vehicles/{id}:
 *   get:
 *     summary: Get a vehicle by ID
 *     tags: [Vehicles]
 */
router.get(
  '/vehicles/:id',
  authMiddleware,
  param('id').isInt({ gt: 0 }).withMessage('id must be a positive integer'),
  validate,
  vehicleController.getVehicleById
);

/**
 * @swagger
 * /vehicles/{id}:
 *   put:
 *     summary: Update a vehicle
 *     tags: [Vehicles]
 */
router.put(
  '/vehicles/:id',
  authMiddleware,
  param('id').isInt({ gt: 0 }).withMessage('id must be a positive integer'),
  body('make').optional().notEmpty().withMessage('make is required'),
  body('model').optional().notEmpty().withMessage('model is required'),
  body('year').optional().isInt({ min: 1980 }).withMessage('year must be valid'),
  body('plate').optional().notEmpty().withMessage('plate is required'),
  validate,
  vehicleController.updateVehicle
);

/**
 * @swagger
 * /vehicles/{id}:
 *   delete:
 *     summary: Remove a car from the profile
 *     tags: [Vehicles]
 */
router.delete(
  '/vehicles/:id',
  authMiddleware,
  param('id').isInt({ gt: 0 }).withMessage('id must be a positive integer'),
  validate,
  vehicleController.deleteVehicle
);

module.exports = router;

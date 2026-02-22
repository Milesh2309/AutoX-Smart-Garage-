const express = require('express');
const { param, body } = require('express-validator');
const router = express.Router();
const assignmentController = require('../controllers/assignmentController');
const validate = require('../middleware/validationMiddleware');

/**
 * @swagger
 * tags:
 *   name: Assignments
 *   description: Mechanic job assignments
 */

/**
 * @swagger
 * /api/assignments:
 *   post:
 *     summary: Assign mechanic to booking
 *     tags: [Assignments]
 */
router.post(
  '/api/assignments',
  body('bookingId').isInt({ gt: 0 }).withMessage('bookingId must be a positive integer'),
  body('mechanicId').isInt({ gt: 0 }).withMessage('mechanicId must be a positive integer'),
  validate,
  assignmentController.createAssignment
);

/**
 * @swagger
 * /api/assignments/{id}:
 *   get:
 *     summary: Get assignment details
 *     tags: [Assignments]
 */
router.get(
  '/api/assignments/:id',
  param('id').isInt({ gt: 0 }).withMessage('id must be a positive integer'),
  validate,
  assignmentController.getAssignmentById
);

/**
 * @swagger
 * /api/assignments/{id}:
 *   put:
 *     summary: Update assignment status
 *     tags: [Assignments]
 */
router.put(
  '/api/assignments/:id',
  param('id').isInt({ gt: 0 }).withMessage('id must be a positive integer'),
  validate,
  assignmentController.updateAssignment
);

/**
 * @swagger
 * /api/assignments/{id}:
 *   delete:
 *     summary: Remove assignment
 *     tags: [Assignments]
 */
router.delete(
  '/api/assignments/:id',
  param('id').isInt({ gt: 0 }).withMessage('id must be a positive integer'),
  validate,
  assignmentController.deleteAssignment
);

/**
 * @swagger
 * /api/assignments/mechanic/{mechanicId}:
 *   get:
 *     summary: Get mechanic assignments
 *     tags: [Assignments]
 */
router.get(
  '/api/assignments/mechanic/:mechanicId',
  param('mechanicId').isInt({ gt: 0 }).withMessage('mechanicId must be a positive integer'),
  validate,
  assignmentController.getMechanicAssignments
);

/**
 * @swagger
 * /api/assignments/{id}/progress:
 *   get:
 *     summary: Get job progress
 *     tags: [Assignments]
 */
router.get(
  '/api/assignments/:id/progress',
  param('id').isInt({ gt: 0 }).withMessage('id must be a positive integer'),
  validate,
  assignmentController.getJobProgress
);

module.exports = router;

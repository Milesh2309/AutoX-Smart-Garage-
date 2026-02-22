const express = require('express');
const { body } = require('express-validator');
const router = express.Router();
const authController = require('../controllers/authController');
const validate = require('../middleware/validationMiddleware');
const authMiddleware = require('../middleware/authMiddleware');

/**
 * @swagger
 * tags:
 *   name: Auth
 *   description: Authentication APIs
 */

/**
 * @swagger
 * /auth/register:
 *   post:
 *     summary: Create a new customer account
 *     tags: [Auth]
 */
router.post(
  '/auth/register',
  body('name').notEmpty().withMessage('name is required'),
  body('email').isEmail().withMessage('valid email is required'),
  body('password').isLength({ min: 6 }).withMessage('password must be at least 6 chars'),
  validate,
  authController.register
);

/**
 * @swagger
 * /auth/login:
 *   post:
 *     summary: Authenticate user and receive JWT
 *     tags: [Auth]
 */
router.post(
  '/auth/login',
  body('email').isEmail().withMessage('valid email is required'),
  body('password').notEmpty().withMessage('password is required'),
  validate,
  authController.login
);

/**
 * @swagger
 * /auth/me:
 *   get:
 *     summary: Fetch current logged-in user profile
 *     tags: [Auth]
 */
router.get('/auth/me', authMiddleware, authController.me);

/**
 * @swagger
 * /auth/me:
 *   put:
 *     summary: Update current logged-in user profile
 *     tags: [Auth]
 */
router.put(
  '/auth/me',
  authMiddleware,
  body('email').optional().isEmail().withMessage('valid email is required'),
  body('password').optional().isLength({ min: 6 }).withMessage('password must be at least 6 chars'),
  validate,
  authController.updateProfile
);

/**
 * @swagger
 * /auth/me:
 *   delete:
 *     summary: Delete current account
 *     tags: [Auth]
 */
router.delete('/auth/me', authMiddleware, authController.deleteAccount);

module.exports = router;

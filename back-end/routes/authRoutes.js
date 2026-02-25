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
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [name, email, password]
 *             properties:
 *               name:
 *                 type: string
 *                 example: John Doe
 *               email:
 *                 type: string
 *                 format: email
 *                 example: john@example.com
 *               password:
 *                 type: string
 *                 format: password
 *                 example: secret123
 *     responses:
 *       201:
 *         description: User registered successfully
 *       400:
 *         description: Validation error
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
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [email, password]
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *                 example: john@example.com
 *               password:
 *                 type: string
 *                 format: password
 *                 example: secret123
 *     responses:
 *       200:
 *         description: Login successful
 *       401:
 *         description: Invalid credentials
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
 * /auth/login/send-otp:
 *   post:
 *     summary: Send OTP for login
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [email]
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *                 example: john@example.com
 *     responses:
 *       200:
 *         description: OTP sent
 *       400:
 *         description: Validation error
 */
router.post(
  '/auth/login/send-otp',
  body('email').isEmail().withMessage('valid email is required'),
  validate,
  authController.sendLoginOtp
);

/**
 * @swagger
 * /auth/login/verify-otp:
 *   post:
 *     summary: Verify login OTP
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [email, otp]
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *                 example: john@example.com
 *               otp:
 *                 type: string
 *                 example: "123456"
 *     responses:
 *       200:
 *         description: OTP verified
 *       400:
 *         description: Validation error
 *       401:
 *         description: Invalid OTP
 */
router.post(
  '/auth/login/verify-otp',
  body('email').isEmail().withMessage('valid email is required'),
  body('otp').isLength({ min: 6, max: 6 }).withMessage('otp must be 6 digits'),
  validate,
  authController.verifyLoginOtp
);

/**
 * @swagger
 * /auth/forgot-password:
 *   post:
 *     summary: Request password reset token
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [email]
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *                 example: john@example.com
 *     responses:
 *       200:
 *         description: Reset token sent
 *       400:
 *         description: Validation error
 */
router.post(
  '/auth/forgot-password',
  body('email').isEmail().withMessage('valid email is required'),
  validate,
  authController.forgotPassword
);

/**
 * @swagger
 * /auth/reset-password:
 *   post:
 *     summary: Reset password using token
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [email, resetToken, newPassword]
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *                 example: john@example.com
 *               resetToken:
 *                 type: string
 *                 example: abcd1234
 *               newPassword:
 *                 type: string
 *                 format: password
 *                 example: newsecret123
 *     responses:
 *       200:
 *         description: Password reset successful
 *       400:
 *         description: Validation error
 *       401:
 *         description: Invalid or expired reset token
 */
router.post(
  '/auth/reset-password',
  body('email').isEmail().withMessage('valid email is required'),
  body('resetToken').notEmpty().withMessage('resetToken is required'),
  body('newPassword').isLength({ min: 6 }).withMessage('newPassword must be at least 6 chars'),
  validate,
  authController.resetPassword
);

/**
 * @swagger
 * /auth/me:
 *   get:
 *     summary: Fetch current logged-in user profile
 *     tags: [Auth]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Current user profile
 *       401:
 *         description: Unauthorized
 */
router.get('/auth/me', authMiddleware, authController.me);

/**
 * @swagger
 * /auth/me:
 *   put:
 *     summary: Update current logged-in user profile
 *     tags: [Auth]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *                 example: newmail@example.com
 *               password:
 *                 type: string
 *                 format: password
 *                 example: newsecret123
 *     responses:
 *       200:
 *         description: Profile updated
 *       401:
 *         description: Unauthorized
 *       400:
 *         description: Validation error
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
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Account deleted
 *       401:
 *         description: Unauthorized
 */
router.delete('/auth/me', authMiddleware, authController.deleteAccount);

module.exports = router;

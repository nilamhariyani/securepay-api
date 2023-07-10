const express = require('express');
const validate = require('../../middlewares/validate');
const authValidation = require('./auth.validation');
const authController = require('./auth.controller');

const upload = require('../../config/multer');
const auth = require('../../middlewares/auth');
const router = express.Router();

/**
 * @swagger
 * definitions:
 *   login:
 *     required:
 *       - email
 *       - password
 *       - role
 *     properties:
 *       email:
 *         type: string
 *         example: xyz@domain.com
 *       password:
 *         type: string
 *         example: Test@123
 *       role:
 *         type: string
 *         example: 1
 */

/**
 * @swagger
 *
 * /auth/login:
 *   post:
 *     tags:
 *       - "Auth"
 *     description: Login to the application
 *     produces:
 *       - application/json
 *     parameters:
 *       - name: body
 *         description: Email and password for login.
 *         in: body
 *         required: true
 *         schema:
 *           $ref: "#/definitions/login"
 *     responses:
 *       200:
 *         description: You have successfully logged in!!
 */

router.post('/login', validate(authValidation.login), authController.login);


/**
 * @swagger
 * definitions:
 *   forgot-password:
 *     required:
 *       - email
 *       - role
 *     properties:
 *       email:
 *         type: string
 *         example: xyz@domain.com
 *       role:
 *         type: string
 *         example: 1
 */

/**
 * @swagger
 *
 * /auth/forgot-password:
 *   post:
 *     tags:
 *       - "Auth"
 *     description: Pass valid email address of existing user
 *     produces:
 *       - application/json
 *     parameters:
 *       - name: body
 *         description: Forgot password
 *         in: body
 *         required: true
 *         schema:
 *           $ref: "#/definitions/forgot-password"
 *     responses:
 *       200:
 *         description: Password reset link is sent successfully. Please check your registed email.
 */

router.post('/forgot-password', validate(authValidation.forgotPassword), authController.forgotPassword);


/**
 * @swagger
 *
 * /auth/checkResetLink:
 *   get:
 *     tags:
 *       - "Auth"
 *     description: Check your reset link valid or not
 *     produces:
 *       - application/json
 *     parameters:
 *       - name: token
 *         description: Please enter a valid token.
 *         in: query
 *         required: true
 *         type: string
 *     responses:
 *       200:
 *         description: Your link has been verify successfully.
 */
router.get('/checkResetLink', validate(authValidation.checkResetLink), authController.checkResetLink)

/**
 * @swagger
 * definitions:
 *   reset-password:
 *     required:
 *       - password
 *     properties:
 *       password:
 *         type: string
 *         example: Newpass@123
 */

/**
 * @swagger
 *
 * /auth/reset-password:
 *   post:
 *     tags:
 *       - "Auth"
 *     description: Reset your password
 *     produces:
 *       - application/json
 *     parameters:
 *       - name: token
 *         description: Enter a token.
 *         in: query
 *         required: true
 *         type: string
 *       - name: body
 *         description: New password
 *         in: body
 *         required: true
 *         schema:
 *           $ref: "#/definitions/reset-password"
 *     responses:
 *       200:
 *         description: Your passwords has been changed successfully.
 */

router.post('/reset-password', validate(authValidation.resetPassword), authController.resetPassword);

router.post('/register', upload.single('identityProof'), authController.register);

router.get('/user-verify', validate(authValidation.verifyAccount), authController.verifyAccount);

router.post("/with-gmail", validate(authValidation.loginWithGmail), authController.loginWithGmail);

router.post("/with-facebook", validate(authValidation.loginWithFacebook), authController.loginWithFacebook);

router.post('/refresh-tokens', validate(authValidation.refreshTokens), authController.refreshTokens);


/**
 * @swagger
 * definitions:
 *   change-password:
 *     required:
 *       - oldPassword
 *       - newPassword
 *     properties:
 *       oldPassword:
 *         type: string
 *         example: Oldpass@123
 *       newPassword:
 *         type: string
 *         example: Newpass@123
 */

/**
 * @swagger
 *
 * /auth/{userid}/change-password:
 *   patch:
 *     tags:
 *       - "Auth"
 *     description: Change your password
 *     produces:
 *       - application/json
 *     parameters:
 *       - name: userid
 *         description: Enter a user id.
 *         in: path
 *         required: true
 *         type: string
 *       - name: body
 *         in: body
 *         required: true
 *         schema:
 *           $ref: "#/definitions/change-password"
 *     security:
 *       - Bearer: []
 *     responses:
 *       200:
 *         description: Your passwords has been changed successfully.
 */
router.route('/:userId/change-password').patch(auth('profile'), validate(authValidation.changePassword), authController.changePassword)


router.put("/update/profilepic", auth('profile'), upload.single('profilePic'), validate(authValidation.updateProfilePic), authController.updateProfilePic);

router.put("/verify/otp", auth('profile'), validate(authValidation.verifyOTP), authController.verifyOTP);

router.post('/resend-verify-link', validate(authValidation.resendVerifyLink), authController.resendVerifyLink);
module.exports = router;

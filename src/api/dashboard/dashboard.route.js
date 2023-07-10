const express = require("express");
const validate = require("../../middlewares/validate");
const router = express.Router();
const auth = require("../../middlewares/auth");
const dashboardController = require('./dashboard.controller');
const dashboardValidation = require('./dashboard.validation');

/**
 * @swagger
 * definitions:
 *   Getcount:
 */

/**
 * @swagger
 *
 * /dashboard/getcount:
 *   get:
 *     tags:
 *       - "Dashboard"
 *     description: Get Dashboard Count
 *     produces:
 *       - application/json
 *     parameters:
 *         schema:
 *           $ref: "#/definitions/Getcount"
 *     security:
 *       - Bearer: []
 *     responses:
 *       200:
 *         description: Client data fetched successfully
 */


router.get('/getcount',auth('dashboard'), dashboardController.getCount);

/**
 * @swagger
 * definitions:
 *   ongoingjob:
 */

/**
 * @swagger
 *
 * /dashboard/ongoingjob:
 *   get:
 *     tags:
 *       - "Dashboard"
 *     description: Get letest OnGoing job
 *     produces:
 *       - application/json
 *     parameters:
 *         schema:
 *           $ref: "#/definitions/ongoingjob"
 *     security:
 *       - Bearer: []
 *     responses:
 *       200:
 *         description: On going job fetched successfully
 */

router.get('/ongoingjob',auth('dashboard'), dashboardController.onGoingJob);

/**
 * @swagger
 * definitions:
 *   AdminGetcount:
 */

/**
 * @swagger
 *
 * /dashboard/admin-getcount:
 *   get:
 *     tags:
 *       - "Dashboard"
 *     description: Get Dashboard Count for Admin User
 *     produces:
 *       - application/json
 *     parameters:
 *         schema:
 *           $ref: "#/definitions/AdminGetcount"
 *     security:
 *       - Bearer: []
 *     responses:
 *       200:
 *         description: Admin data fetched successfully
 */

router.get('/admin-getcount', auth('dashboard'), dashboardController.adminGetCount);


module.exports = router;
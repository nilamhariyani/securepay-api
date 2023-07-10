const express = require('express');
const validate = require('../../middlewares/validate');
const adminController = require('./admin.controller');
const adminValidation = require('./admin.validation');
const auth = require('../../middlewares/auth');
const upload = require('../../config/multer');
const router = express.Router();


/**
 * @swagger
 * definitions:
 *   add:
 *     required:
 *       - firstName
 *       - lastName
 *       - email
 *       - dialCode
 *       - number
 *     properties:
 *       firstName:
 *         type: string
 *         example: John
 *       lastName:
 *         type: string
 *         example: Well
 *       email:
 *         type: string
 *         example: john@mailinator.com
 *       dialCode:
 *         type: string
 *         example: 91
 *       number:
 *         type: string
 *         example: 6321546545
 */

/**
 * @swagger
 *
 * /admin/add:
 *   post:
 *     tags:
 *       - "Admin"
 *     description: addstaff member
 *     produces:
 *       - application/json
 *     parameters:
 *       - name: body
 *         description: Add staff member.
 *         in: body
 *         required: true
 *         schema:
 *           $ref: "#/definitions/add"
 *     security:
 *       - Bearer: []
 *     responses:
 *       200:
 *         description: Staff Member added successfully
 */
router.post('/add', auth('staff'), validate(adminValidation.addStaffMember), adminController.addStaffMember)

/**
 * @swagger
 * definitions:
 *   setPassword:
 *     required:
 *       - otp
 *       - password
 *     properties:
 *       otp:
 *         type: number
 *         example: 459865
 *       password:
 *         type: string
 *         example: John@1234
 */

/**
 * @swagger
 *
 * /admin/setPassword:
 *   post:
 *     tags:
 *       - "Admin"
 *     description: set Password
 *     produces:
 *       - application/json
 *     parameters:
 *       - name: body
 *         description: set password.
 *         in: body
 *         required: true
 *         schema:
 *           $ref: "#/definitions/setPassword"
 *     responses:
 *       200:
 *         description: set password successfully
 */
router.post('/setPassword', validate(adminValidation.setPassword), adminController.setPassword)

/**
 * @swagger
 *
 * /admin/checkToken:
 *   get:
 *     tags:
 *       - "Admin"
 *     description: get user details
 *     produces:
 *       - application/json
 *     parameters:
 *       - name: token
 *         description: get user details.
 *         in: query
 *         required: true
 *         schema:
 *           type: string
 *           example: sfsdbfdjshf
 *     responses:
 *       200:
 *         description: get user successfully
 */
router.get('/checkToken', validate(adminValidation.checkToken), adminController.checkToken)
/**
 * @swagger
 *
 * /admin/getList:
 *   get:
 *     tags:
 *       - "Admin"
 *     description: get customer details
 *     produces:
 *       - application/json
 *     parameters:
 *       - name: page
 *         description: enter page number.
 *         in: query
 *         schema:
 *           type: number
 *           example: 1
 *       - name: limit
 *         description: enter limit.
 *         in: query
 *         schema:
 *           type: number
 *           example: 100
 *       - name: search
 *         description: search name email mobilenumber.
 *         in: query
 *         schema:
 *           type: string
 *           example: Super
 *       - name: sortBy
 *         description: enter SortBy.
 *         in: query
 *         schema:
 *           type: string
 *           example: createdAt
 *     security:
 *       - Bearer: []
 *     responses:
 *       200:
 *         description: Staff Member listing data fetched successfully.
 */
router.get('/getList', auth('staff'), validate(adminValidation.getStaffList), adminController.getStaffList)

/**
 * @swagger
 *
 * /admin/delete:
 *   delete:
 *     tags:
 *       - "Admin"
 *     description: delete staff details
 *     produces:
 *       - application/json
 *     parameters:
 *       - name: id
 *         description: delete sataff details.
 *         in: query
 *         required: true
 *         schema:
 *           type: string
 *           example: sfsdbfdjshf
 *     security:
 *       - Bearer: []
 *     responses:
 *       200:
 *         description: Staff Member deleted successfully
 */
router.delete('/delete', auth('staff'), validate(adminValidation.deleteStaffMember), adminController.deleteStaff)

/**
 * @swagger
 * definitions:
 *   update:
 *     properties:
 *       firstName:
 *         type: string
 *         example: john
 *       lastName:
 *         type: string
 *         example: doe
 *       isEnable:
 *         type: boolean
 *         example: true
 *       email:
 *         type: string
 *         example: john@mailinator.com
 *       dialCode:
 *         type: string
 *         example: 91
 *       number:
 *         type: string
 *         example: 6321546545
 */

/**
 * @swagger
 *
 * /admin/update:
 *   put:
 *     tags:
 *       - "Admin"
 *     description: update staff details
 *     produces:
 *       - application/json
 *     parameters:
 *       - name: staffId
 *         description: enter an id .
 *         in: query
 *         required: true
 *         schema:
 *           type: string
 *           example: jdfdsfhd
 *       - name: body
 *         description: update staff details.
 *         in: body
 *         required: true
 *         schema:
 *           $ref: "#/definitions/update"
 *     security:
 *       - Bearer: []
 *     responses:
 *       200:
 *         description: Staff Member updated successfully
 */
router.put('/update', auth('staff'), upload.single('profilePic'), validate(adminValidation.updateStaffMember), adminController.updateStaff)
router.get('/commission', auth('job'), validate(adminValidation.getCommission), adminController.getCommission)

router.get('/dashboard/totalrevenue', validate(adminValidation.totalRevenue), adminController.totalRevenue)
router.get('/dashboard/totalcommission', auth('dashboard'), validate(adminValidation.totalCommission), adminController.totalCommission)
router.get('/dashboard/getjob', auth('dashboard'), validate(adminValidation.jobDashboard), adminController.getJobDashboard)
module.exports = router;
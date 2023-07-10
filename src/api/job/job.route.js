const express = require('express');
const validate = require('../../middlewares/validate');
const jobValidation = require('./job.validation');
const jobController = require('./job.controller');
const router = express.Router();
const auth = require('../../middlewares/auth');

/**
 * @swagger
 *
 * /job/getInviteUserList:
 *   get:
 *     tags:
 *       - "Job"
 *     description: Get Invite UserList
 *     produces:
 *       - application/json
 *     security:
 *       - Bearer: []
 *     responses:
 *       200:
 *         description: Invited Userlist Fetched Successfully.
 */


router.get('/getInviteUserList', auth('job'), validate(jobValidation.getInviteUserList), jobController.getInviteUserList);

/**
 * @swagger
 * definitions:
 *   create-job:
 *     required:
 *       - email
 *       - firstname
 *       - lastname
 *       - jobName
 *       - description
 *       - totalAmount
 *       - serviceFee
 *       - amount
 *       - isFullPayment
 *     properties:
 *       email:
 *         type: string
 *         example: xyz@domain.com
 *       firstname:
 *         type: string
 *         example: James
 *       lastname:
 *         type: string
 *         example: Beaty
 *       jobName:
 *         type: string
 *         example: Testing
 *       description:
 *         type: string
 *         example: This is For Testing
 *       totalAmount:
 *         type: number
 *         example: 1000
 *       serviceFee:
 *         type: number
 *         example: 50
 *       amount:
 *         type: number
 *         example: 1050
 *       isFullPayment:
 *         type: boolean
 *         example: true
 *       milestoneData:
 *         type: array
 *         example: [{"title": "Milestone 11", "amount": 500}]     
 */

/**
 * @swagger
 *
 * /job/create:
 *   post:
 *     tags:
 *       - "Job"
 *     description: Create Job
 *     produces:
 *       - application/json
 *     parameters:
 *       - name: body
 *         description: createJob
 *         in: body
 *         required: true
 *         schema:
 *           $ref: "#/definitions/create-job"
 *     security:
 *       - Bearer: []
 *     responses:
 *       200:
 *         description: Job Created Successfully.
 */

router.post('/create', auth('job'), validate(jobValidation.createJob), jobController.createJob);

/**
 * @swagger
 * definitions:
 *   getJobDetails:
 */

/**
 * @swagger
 *
 * /job/getDetails:
 *   get:
 *     tags:
 *       - "Job"
 *     description: Get job details
 *     produces:
 *       - application/json
 *     parameters:
 *       - name: jobId
 *         in: query
 *         required: true
 *         schema:
 *           $ref: "#/definitions/getJobDetails"
 *     security:
 *       - Bearer: []
 *     responses:
 *       200:
 *         description: Job Details Fetched Successfully.
 */
router.get('/getDetails', auth('job'), validate(jobValidation.getJobDetail), jobController.getJobDetail);

/**
 * @swagger
 * definitions:
 *   getJobList:
 */

/**
 * @swagger
 *
 * /job/get:
 *   get:
 *     tags:
 *       - "Job"
 *     description: Get job List
 *     produces:
 *       - application/json
 *     parameters:
 *       - in: query
 *         name: page
 *         required: true
 *       - in: query
 *         name: limit
 *         required: true
 *       - in: query
 *         name: minAmount
 *         required: false
 *       - in: query
 *         name: maxAmount
 *         required: false
 *       - in: query
 *         name: adminfeesMin
 *         required: false
 *       - in: query
 *         name: adminfeesMax
 *         required: false
 *       - in: query
 *         name: status
 *         required: false
 *       - in: query
 *         name: sortBy
 *         required: false
 *       - in: query
 *         name: search
 *         required: false
 *         schema:
 *           $ref: "#/definitions/getJobList"
 *     security:
 *       - Bearer: []
 *     responses:
 *       200:
 *         description: Job List Fetched Successfully.
 */
router.get('/get', auth('job'), validate(jobValidation.getJob), jobController.getJob);

/**
 * @swagger
 * definitions:
 *   getInvited:
 */

/**
 * @swagger
 *
 * /job/getInvited:
 *   get:
 *     tags:
 *       - "Job"
 *     description: Get Invited Job List
 *     produces:
 *       - application/json
 *     parameters:
 *       - in: query
 *         name: page
 *         required: true
 *       - in: query
 *         name: limit
 *         required: true
 *       - in: query
 *         name: status
 *         required: false
 *       - in: query
 *         name: sortBy
 *         required: false
 *       - in: query
 *         name: search
 *         required: false
 *         schema:
 *           $ref: "#/definitions/getInvited"
 *     security:
 *       - Bearer: []
 *     responses:
 *       200:
 *         description: Invited Job List Fetched Successfully.
 */
router.get('/getInvited', auth('job'), validate(jobValidation.getInvited), jobController.getInvited);


/**
 * @swagger
 *
 * /job/{jobId}/accept:
 *   patch:
 *     tags:
 *       - "Job"
 *     description: Accept job for customer
 *     produces:
 *       - application/json
 *     parameters:
 *       - name: jobId
 *         description: Enter a selected job id.
 *         in: path
 *         required: true
 *         type: string
 *         schema:
 *           $ref: "#/definitions/accept"
 *     security:
 *       - Bearer: []
 *     responses:
 *       200:
 *         description: Job accepted successfully.
 */
router.route('/:jobId/accept').patch(auth('job'), validate(jobValidation.jobAccepted), jobController.jobAccepted)

/**
 * @swagger
 * definitions:
 *   reject:
 *     required:
 *       - reason
 *     properties:
 *       reason:
 *         type: string
 *         example: Please enter your reason 
 */
/**
 * 
 * @swagger
 *
 * /job/{jobId}/reject:
 *   patch:
 *     tags:
 *       - "Job"
 *     description: Reject job for customer
 *     produces:
 *       - application/json
 *     parameters:
 *       - name: jobId
 *         description: Enter a selected job id.
 *         in: path
 *         required: true
 *         type: string
 *       - name: body
 *         in: body
 *         required: true
 *         schema:
 *           $ref: "#/definitions/reject"
 *     security:
 *       - Bearer: []
 *     responses:
 *       200:
 *         description: Job rejected successfully.
 */
router.route('/:jobId/reject').patch(auth('job'), validate(jobValidation.jobRejected), jobController.jobRejected)


/**
 * @swagger
 * definitions:
 *   confirm-job:
 *     required:
 *       - totalAmount
 *     properties:
 *       totalAmount:
 *         type: number
 *         example: 15000
 */
/**
 * 
 * @swagger
 *
 * /job/amount/{jobId}/confirm:
 *   patch:
 *     tags:
 *       - "Job"
 *     description: Confirm job amount
 *     produces:
 *       - application/json
 *     parameters:
 *       - name: jobId
 *         description: Please enter a job id.
 *         in: path
 *         required: true
 *         type: string
 *       - name: body
 *         in: body
 *         required: true
 *         schema:
 *           $ref: "#/definitions/confirm-job"
 *     security:
 *       - Bearer: []
 *     responses:
 *       200:
 *         description: Job amount changed successfully.
 */
router.route('/amount/:jobId/confirm').patch(auth('job'), validate(jobValidation.confirmJobAmount), jobController.confirmJobAmount)

router.route('/modification/request').patch(auth('job'), validate(jobValidation.jobModificationRequest), jobController.jobModificationRequest)

module.exports = router;

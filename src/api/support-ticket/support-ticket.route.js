const express = require('express');
const validate = require('../../middlewares/validate');
const supportTicketValidation = require('./support-ticket.validation');
const supportTicketController = require('./support-ticket.controller');
const upload = require('../../config/multer');
const router = express.Router();
const auth = require('../../middlewares/auth');



/**
 * @swagger
 * definitions:
 *   create-support-ticket:
 *     required:
 *       - title
 *       - description
 *       - images
 *     properties:
 *       title:
 *         type: string
 *         example: Payment not working
 *       description:
 *         type: string
 *         example: Escrow button not working in payment module
 *      
 */

/**
 * @swagger
 *
 * /support/ticket:
 *   post:
 *     tags:
 *       - "Support Ticket"
 *     description: Raised support ticket
 *     produces:
 *       - multipart/form-data
 *     parameters:
 *       - name: images
 *         in: formData
 *         required: false
 *         type: file
 *       - name: title
 *         in: formData
 *         required: true
 *       - name: description
 *         in: formData
 *         required: true
 *         schema:
 *           $ref: "#/definitions/create-support-ticket"
 *     security:
 *       - Bearer: []
 *     responses:
 *       200:
 *         description: Support Ticket raised successfully.
 */

router.post('/', auth('support'), upload.array('images'), validate(supportTicketValidation.createSupportTicket), supportTicketController.createSupportTicket);



/**
 * @swagger
 *
 * /support/ticket:
 *   get:
 *     tags:
 *       - "Support Ticket"
 *     description: Getting support ticket list
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
 *         name: search
 *         required: false
 *       - in: query
 *         name: status
 *         required: false
 *       - in: query
 *         name: startDate
 *         required: false
 *       - in: query
 *         name: endDate
 *         required: false
 *       - in: query
 *         name: sortBy
 *         required: false
 *       - in: query
 *         name: staff
 *         required: false
 *         schema:
 *           $ref: "#/definitions/getSupportTicketList"
 *     security:
 *       - Bearer: []
 *     responses:
 *       200:
 *         description: Support Ticket listing data fetched successfully.
 */

router.get('/', auth('support'), validate(supportTicketValidation.getSupportTicket), supportTicketController.getSupportTicket);


/**
 * @swagger
 *
 * /support/ticket/details:
 *   get:
 *     tags:
 *       - "Support Ticket"
 *     description: Getting support ticket list
 *     produces:
 *       - application/json
 *     parameters:
 *       - in: query
 *         name: ticketId
 *         required: true
 *         schema:
 *           $ref: "#/definitions/getTicketDetails"
 *     security:
 *       - Bearer: []
 *     responses:
 *       200:
 *         description: Support Ticket details fetched successfully.
 */

router.get('/details', auth('support'), validate(supportTicketValidation.getSupportTicketDetail), supportTicketController.getSupportTicketDetail);


/**
 * @swagger
 *
 * /support/ticket/comment:
 *   post:
 *     tags:
 *       - "Support Ticket"
 *     description: Comment on support ticket by Staff & Client/Customer
 *     produces:
 *       - multipart/form-data
 *     parameters:
 *       - name: ticketId
 *         in: formData
 *         required: true
 *       - name: description
 *         in: formData
 *         required: true
 *       - name: images
 *         in: formData
 *         required: false
 *         type: file
 *         schema:
 *     security:
 *       - Bearer: []
 *     responses:
 *       200:
 *         description: Comment added successfully.
 */

router.post('/comment', auth('support'), upload.array('images'), validate(supportTicketValidation.commentSupportTicket), supportTicketController.commentSupportTicket);


/**
 * @swagger
 *
 * /support/ticket/resolve:
 *   patch:
 *     tags:
 *       - "Support Ticket"
 *     description: Resolved ticket by staff
 *     produces:
 *       - application/json
 *     parameters:
 *       - in: query
 *         name: ticketId
 *         required: true
 *         schema:
 *     security:
 *       - Bearer: []
 *     responses:
 *       200:
 *         description: Support Ticket resolved successfully.
 */

router.patch('/resolve', auth('support'), validate(supportTicketValidation.supportTicketResolve), supportTicketController.supportTicketResolve);

module.exports = router;

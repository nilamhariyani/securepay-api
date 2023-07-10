const express = require("express");
const validate = require("../../middlewares/validate");
const milestoneController = require("./milestone.controller");
const router = express.Router();
const auth = require("../../middlewares/auth");
const milestoneValidation = require('./milestone.validation');



/**
 * @swagger
 *
 * /milestone/{milestoneId}:
 *   delete:
 *     tags:
 *       - "Milestone"
 *     description: Delete interim payment
 *     produces:
 *       - application/json
 *     parameters:
 *       - name: milestoneId
 *         in: path
 *         required: true
 *         type: string
 *         schema:
 *           $ref: "#/definitions/delete-milestone"
 *     security:
 *       - Bearer: []
 *     responses:
 *       200:
 *         description: Milestone deleted successfully.
 */
router.route('/:milestoneId').delete(auth('milestone'), validate(milestoneValidation.deleteMilestone), milestoneController.deleteMilestone)


/**
 * @swagger
 * definitions:
 *   update-milestone:
 *     required:
 *       - title
 *       - amount
 *       - description
 *       - completionDate
 *     properties:
 *       title:
 *         type: string
 *         example: Milestone 1
 *       amount:
 *         type: string
 *         example: 5000
 *       description:
 *         type: string
 *         example: Reference site about Lorem Ipsum, giving information on its origins, as well as a random Lipsum generator.
 *       completionDate:
 *         type: date
 *         example: 2021-09-20
 * 
 */
/**
 * 
 * @swagger
 *
 * /milestone/{milestoneId}:
 *   put:
 *     tags:
 *       - "Milestone"
 *     description: Update interim payment
 *     produces:
 *       - application/json
 *     parameters:
 *       - name: milestoneId
 *         in: path
 *         required: true
 *         type: string
 *       - name: body
 *         in: body
 *         required: true
 *         schema:
 *           $ref: "#/definitions/update-milestone"
 *     security:
 *       - Bearer: []
 *     responses:
 *       200:
 *         description: Milestone updated successfully.
 */
router.route('/:milestoneId').put(auth('milestone'), validate(milestoneValidation.updateMilestone), milestoneController.updateMilestone)


/**
 * @swagger
 * definitions:
 *   add-milestone:
 *     required:
 *       - jobId
 *       - title
 *       - description
 *       - completionDate
 *       - amount
 *     properties:
 *       jobId:
 *         type: string
 *         example: 6110ba51eaace40d9b79accd
 *       title:
 *         type: string
 *         example: Milestone 1
 *       description:
 *         type: string
 *         example: Reference site about Lorem Ipsum, giving information on its origins, as well as a random Lipsum generator.
 *       completionDate:
 *         type: string
 *         example: 2021-09-20
 *       amount:
 *         type: string
 *         example: 5000
 */
/**
 * 
 * @swagger
 *
 * /milestone:
 *   post:
 *     tags:
 *       - "Milestone"
 *     description: Added interim payment 
 *     produces:
 *       - application/json
 *     parameters:
 *       - name: body
 *         in: body
 *         required: true
 *         schema:
 *           $ref: "#/definitions/add-milestone"
 *     security:
 *       - Bearer: []
 *     responses:
 *       200:
 *         description: Milestone added successfully.
 */
router.route('/').post(auth('milestone'), validate(milestoneValidation.addMilestone), milestoneController.addMilestone)
module.exports = router;

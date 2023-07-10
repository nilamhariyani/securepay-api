const express = require('express');
const validate = require('../../middlewares/validate');
const customerValidation = require('./customer.validation');
const customerController = require('./customer.controller');
const router = express.Router();
const upload = require('../../config/multer');
const auth = require('../../middlewares/auth');

/**
 * @swagger
 * definitions:
 *   check-mail:
 *     properties:
 *       email:
 *         type: string
 *         example: xyz@domain.com
 */

/**
 * @swagger
 *
 * /customer/checkEmail:
 *   get:
 *     tags:
 *       - "Customer"
 *     description: CheckMail
 *     produces:
 *       - application/json
 *     parameters:
 *       - name: email
 *         description: CheckMail
 *         in: query
 *         required: true
 *         schema:
 *           $ref: "#/definitions/check-mail"
 *     responses:
 *       200:
 *         description: CheckMaile Function.
 */
router.get('/checkEmail', auth('customer'), validate(customerValidation.checkEmail), customerController.checkEmail);

/**
 * @swagger
 * definitions:
 *   getcustomerList:
 */

/**
 * @swagger
 *
 * /customer/get:
 *   get:
 *     tags:
 *       - "Customer"
 *     description: Get Customer List
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
 *         name: sortBy
 *         required: false
 *       - in: query
 *         name: search
 *         required: false
 *         schema:
 *           $ref: "#/definitions/getcustomerList"
 *     security:
 *       - Bearer: []
 *     responses:
 *       200:
 *         description: Customer listing data Fetched successfully.
 */

router.get('/get', auth('customer'), validate(customerValidation.getCustomerList), customerController.getCustomerList);

/**
 * @swagger
 * definitions:
 *   disabled:
 *     required:
 *       - isEnable
 *     properties:
 *       isEnable:
 *         type: boolean
 *         example: true
 */
/**
 * @swagger
 *
 * /customer/disabled:
 *   put:
 *     tags:
 *       - "Customer"
 *     description: Get Customer List
 *     produces:
 *       - application/json
 *     parameters:
 *       - in: query
 *         name: customerId
 *         required: true
 *       - in: body
 *         name: isEnable
 *         required: true
 *         schema:
 *           $ref: "#/definitions/disabled"
 *     security:
 *       - Bearer: []
 *     responses:
 *       200:
 *         description: Ben Jamin has been disabled successfully..
 */

router.put("/disabled", auth('customer'), validate(customerValidation.customerDisabled), customerController.customerDisabled);

router.put("/update/bankinfo", auth('customer'), upload.single('identityProof'), validate(customerValidation.updateBankInfo), customerController.updateBankInfo);

router.put("/update/personalinfo", auth('customer'), validate(customerValidation.updatePersonalInfo), customerController.updatePersonalInfo);

router.put("/update/companyinfo", auth('customer'), validate(customerValidation.updateCompanyInfo), customerController.updateCompanyInfo);

router.put("/update/updateubo", auth('customer'), validate(customerValidation.updateUBO), customerController.updateUBO);

router.put("/add/addubo", auth('customer'), validate(customerValidation.addUBO), customerController.addUBO);

router.get("/kyc/status", auth('customer'), customerController.getKycStatus);

router.post("/invite", auth('customer'), validate(customerValidation.inviteCustomer), customerController.inviteCustomer);
module.exports = router;





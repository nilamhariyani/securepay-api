const express = require("express");
const validate = require("../../middlewares/validate");
const router = express.Router();
const auth = require("../../middlewares/auth");
const paymentController = require('./payment.controller');
const paymentValidation = require('./payment.validation');

router.route('/escrow-with-bank').post(auth('payment'), validate(paymentValidation.escrowPaymentsWithBank), paymentController.escrowPaymentsWithBank);

router.route('/escrow-with-card').post(auth('payment'), validate(paymentValidation.escrowPaymentsWithCard), paymentController.escrowPaymentsWithCard);

router.route('/release').post(auth('payment'), validate(paymentValidation.paymentRelease), paymentController.paymentRelease);

router.route('/truelayer/status').get(auth('payment'), validate(paymentValidation.getTrueLayerStatus), paymentController.getTrueLayerStatus);

router.route('/release/requested').get(auth('payment'), validate(paymentValidation.paymentReleaseRequest), paymentController.paymentReleaseRequest);

router.route('/history').get(auth('paymentHistory'), validate(paymentValidation.getPaymentHistory), paymentController.getPaymentHistory);

module.exports = router;
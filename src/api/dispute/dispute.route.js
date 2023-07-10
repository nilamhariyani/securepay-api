const express = require('express');
const validate = require('../../middlewares/validate');
const disputeValidation = require('./dispute.validation');
const disputeController = require('./dispute.controller');
const upload = require('../../config/multer');
const router = express.Router();
const auth = require('../../middlewares/auth');



router.post('/raised', auth('dispute'), upload.array('images'), validate(disputeValidation.raisedDispute), disputeController.raisedDispute);

router.get('/', auth('dispute'), validate(disputeValidation.getDisputeList), disputeController.getDisputeList);

router.get('/details', auth('dispute'), validate(disputeValidation.getDisputeDetails), disputeController.getDisputeDetails);

router.put('/announce', auth('dispute'), validate(disputeValidation.disputeAnnounce), disputeController.disputeAnnounce);

router.put('/accept', auth('dispute'), validate(disputeValidation.disputeAccept), disputeController.disputeAccept);

router.get('/milestone/details', auth('dispute'), validate(disputeValidation.disputeMilestoneDetails), disputeController.disputeMilestoneDetails);

router.put('/', auth('dispute'), validate(disputeValidation.updateDispute), disputeController.updateDispute);

module.exports = router;

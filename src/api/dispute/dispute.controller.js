

const httpStatus = require('http-status');
const catchAsync = require('../../utils/catchAsync');
const createResponse = require('../../utils/response');
const Messages = require('../../utils/messages');
const emailService = require("../common/email.service");
const disputeServices = require("./dispute.service");
const adminServices = require("../admin/admin.service");
const customerServices = require("../customer/customer.service");
const milestoneServices = require("../milestone/milestone.service");
const jobServices = require("../job/job.service");
const config = require('../../config/config');

const { DISPUTE_USER_STATUS, DISPUTE_STATUS, SUPPORT_STATUS } = require('../../config/constant');
const { TITLE, DESC } = require('../../config/notification');
const pubnubService = require("../common/pubnub.service");
const { JOBSTATUS, MILESTONESTATUS } = require('../../config/constant');
const twiloService = require('../common/twilo.service');

const raisedDispute = catchAsync(async (req, res) => {
	// console.log(req.user.id)
	// console.log(config)
	let data = await disputeServices.createDisputeTicket(req);

	let customer;
	let createdUser;
	if (data.clientId == req.user.id) {
		console.log('if')
		createdUser = await customerServices.getUserById(data.clientId)
		customer = await customerServices.getUserById(data.customerId)
	} else if (data.customerId == req.user.id) {
		console.log('else')
		createdUser = await customerServices.getUserById(data.customerId)
		customer = await customerServices.getUserById(data.clientId)
	}
	const mileStone = await milestoneServices.getMilestoneById(req.body.milestoneId);
	const job = await jobServices.getJobById(req.body.jobId)
	let staff = await adminServices.getUserById(data.staffId)
	let adminData = await adminServices.getUserById(config.admin.id)

	await emailService.disputeRaised(customer.email, { 'name': customer.firstName + ' ' + customer.lastName, 'milestoneTitle': job.name, 'amount': mileStone.amount, 'createdBy': createdUser.firstName + ' ' + createdUser.lastName, 'reason': req.body.description })
	await emailService.disputeRaised(staff.email, { 'name': staff.firstName + ' ' + staff.lastName, 'milestoneTitle': job.name, 'amount': mileStone.amount, 'createdBy': createdUser.firstName + ' ' + createdUser.lastName, 'reason': req.body.description })
	await emailService.disputeRaised(config.admin.email, { 'name': adminData.firstName + ' ' + adminData.lastName, 'milestoneTitle': job.name, 'amount': mileStone.amount, 'createdBy': createdUser.firstName + ' ' + createdUser.lastName, 'reason': req.body.description })

	let des = DESC.DISPUTE_RAISED.replace('$', job.name).replace('#', createdUser.firstName + ' ' + createdUser.lastName);
	// if (customer.number && customer.dialCode) {
	// 	let toMobile = "+" + customer.dialCode + "" + customer.number
	// 	let body = des
	// 	await twiloService.sendSms(toMobile, body)
	// }
	pubnubService.sendNotification(customer._id, { title: TITLE.DISPUTE_RAISED, description: des });
	pubnubService.sendNotification(staff._id, { title: TITLE.DISPUTE_RAISED, description: des });
	pubnubService.sendNotification(config.admin.id, { title: TITLE.DISPUTE_RAISED, description: des });

	createResponse(res, httpStatus.OK, Messages.DISPUTE_RAISED, data);
});
const getDisputeList = catchAsync(async (req, res) => {
	let data = await disputeServices.disputeListing(req);
	createResponse(res, httpStatus.OK, Messages.DISPUTE_GET, data);
});
const getDisputeDetails = catchAsync(async (req, res) => {
	let data = await disputeServices.disputeDetails(req);
	createResponse(res, httpStatus.OK, Messages.DISPUTE_DETAILS_GET, data);
});
const disputeAnnounce = catchAsync(async (req, res) => {

	req.body.resolvedDate = new Date();
	req.body.customerResponse = DISPUTE_USER_STATUS.PENDING;
	req.body.clientResponse = DISPUTE_USER_STATUS.PENDING;
	req.body.status = DISPUTE_STATUS.RESOLVED;


	let disputeData = await disputeServices.disputeUpdate(req.query.disputeId, req.body);

	const milestoneData = await milestoneServices.getMilestoneById(disputeData.milestoneId);
	const jobs = await jobServices.getJobById(milestoneData.jobId);
	const customer = await customerServices.getUserById(milestoneData.inviteUserId);
	const client = await customerServices.getUserById(milestoneData.userId);

	await emailService.disputeAnnounced(customer.email, { ...req.body, 'CUSTOMER_NAME': customer.firstName + ' ' + customer.lastName, 'MILESTONE_TITLE': milestoneData.title, 'JOB_TITLE': jobs.name, 'ESCROW_AMOUNT': milestoneData.amount })
	await emailService.disputeAnnounced(client.email, { ...req.body, 'CUSTOMER_NAME': client.firstName + ' ' + client.lastName, 'MILESTONE_TITLE': milestoneData.title, 'JOB_TITLE': jobs.name, 'ESCROW_AMOUNT': milestoneData.amount })

	let des = DESC.DISPUTE_DECISION_ANNOUNCED.replace('$', milestoneData.title);

	// if (customer.number && customer.dialCode) {
	// 	let toMobile = "+" + customer.dialCode + "" + customer.number
	// 	let body = des
	// 	await twiloService.sendSms(toMobile, body)
	// }

	// if (client.number && client.dialCode) {
	// 	let toMobile = "+" + client.dialCode + "" + client.number
	// 	let body = des
	// 	await twiloService.sendSms(toMobile, body)
	// }

	pubnubService.sendNotification(customer._id, { title: TITLE.DISPUTE_DECISION_ANNOUNCED, description: des });
	pubnubService.sendNotification(client._id, { title: TITLE.DISPUTE_DECISION_ANNOUNCED, description: des });

	createResponse(res, httpStatus.OK, Messages.DISPUTE_ANNOUNCE, disputeData);
});

const disputeAccept = catchAsync(async (req, res) => {
	if (req.body.userType === 'CLIENT') {
		req.body.clientResponse = req.body.response
	} else {
		req.body.customerResponse = req.body.response
	}


	let data = await disputeServices.disputeUpdate(req.query.disputeId, req.body);

	if (data.clientResponse === "ACCEPT" && data.customerResponse === "ACCEPT") {
		await milestoneServices.milestoneUpdate(data.milestoneId, { status: MILESTONESTATUS.PAYMENT_IN_DEPOSITE });
		await jobServices.jobUpdate(data.jobId, { status: JOBSTATUS.PAYMENT_IN_DEPOSITE });
	} else if (data.clientResponse === "REJECTED" || data.customerResponse === "REJECTED") {
		console.log('jaimin');
		await milestoneServices.milestoneUpdate(data.milestoneId, { status: MILESTONESTATUS.DISPUTE });
		await jobServices.jobUpdate(data.jobId, { status: JOBSTATUS.DISPUTE });
		await disputeServices.disputeUpdate(req.query.disputeId, { status: 'RAISED' });
	}
	let staff = await adminServices.getUserById(data.staffId);
	let adminData = await adminServices.getUserById(config.admin.id)
	const milestoneData = await milestoneServices.getMilestoneById(data.milestoneId);
	const jobs = await jobServices.getJobById(milestoneData.jobId);
	let customerDetails;
	// console.log(req.user.id)
	// console.log(milestoneData.userId)
	if (req.user.id == milestoneData.userId) {
		customerDetails = milestoneData.inviteUserId
	} else {
		customerDetails = milestoneData.userId
	}
	let customer = await customerServices.getUserById(customerDetails)

	if (req.body.response === 'ACCEPT') {
		await emailService.disputeAccept(staff.email, { CUSTOMER_NAME: `${req.user.firstName} ${req.user.lastName}`, STAFF_NAME: staff.firstName + ' ' + staff.lastName, 'MILESTONE_TITLE': milestoneData.title, 'JOB_TITLE': jobs.name });
		await emailService.disputeAccept(config.admin.email, { CUSTOMER_NAME: `${req.user.firstName} ${req.user.lastName}`, STAFF_NAME: adminData.firstName + ' ' + adminData.lastName, 'MILESTONE_TITLE': milestoneData.title, 'JOB_TITLE': jobs.name });
		await emailService.disputeAccept(customer.email, { CUSTOMER_NAME: `${req.user.firstName} ${req.user.lastName}`, STAFF_NAME: customer.firstName + ' ' + customer.lastName, 'MILESTONE_TITLE': milestoneData.title, 'JOB_TITLE': jobs.name });
		let des = DESC.DISPUTE_DECISION_ACCEPTED.replace('$', milestoneData.title).replace('#', req.user.firstName + ' ' + req.user.lastName);
		pubnubService.sendNotification(staff._id, { title: TITLE.DISPUTE_DECISION_ACCEPTED, description: des });
		pubnubService.sendNotification(config.admin.id, { title: TITLE.DISPUTE_DECISION_ACCEPTED, description: des });
		pubnubService.sendNotification(customer._id, { title: TITLE.DISPUTE_DECISION_ACCEPTED, description: des });
	} else {
		await emailService.disputeReject(staff.email, { CUSTOMER_NAME: `${req.user.firstName} ${req.user.lastName}`, STAFF_NAME: staff.firstName + ' ' + staff.lastName, 'MILESTONE_TITLE': milestoneData.title, 'JOB_TITLE': jobs.name });
		await emailService.disputeReject(config.admin.email, { CUSTOMER_NAME: `${req.user.firstName} ${req.user.lastName}`, STAFF_NAME: adminData.firstName + ' ' + adminData.lastName, 'MILESTONE_TITLE': milestoneData.title, 'JOB_TITLE': jobs.name });
		await emailService.disputeReject(customer.email, { CUSTOMER_NAME: `${req.user.firstName} ${req.user.lastName}`, STAFF_NAME: customer.firstName + ' ' + customer.lastName, 'MILESTONE_TITLE': milestoneData.title, 'JOB_TITLE': jobs.name });
		await emailService.disputeAccept(config.admin.email, { STAFF_NAME: adminData.firstName + ' ' + adminData.lastName, 'MILESTONE_TITLE': milestoneData.title, 'JOB_TITLE': jobs.name });
		let des = DESC.DISPUTE_DECISION_REJECTED.replace('$', milestoneData.title).replace('#', req.user.firstName + ' ' + req.user.lastName);
		pubnubService.sendNotification(staff._id, { title: TITLE.DISPUTE_DECISION_REJECTED, description: des });
		pubnubService.sendNotification(config.admin.id, { title: TITLE.DISPUTE_DECISION_REJECTED, description: des });
		pubnubService.sendNotification(customer._id, { title: TITLE.DISPUTE_DECISION_REJECTED, description: des });
	}



	createResponse(res, httpStatus.OK, req.body.response === 'ACCEPT' ? Messages.DISPUTE_ACCEPT : Messages.DISPUTE_REJECT, {});
});

const disputeMilestoneDetails = catchAsync(async (req, res) => {
	let data = await disputeServices.disputeMilestoneDetails(req);
	createResponse(res, httpStatus.OK, Messages.DISPUTE_MILESTONE_DETAILS_GET, data);
});

const updateDispute = catchAsync(async (req, res) => {
	let data = await disputeServices.disputeUpdate(req.query.disputeId, req.body);
	createResponse(res, httpStatus.OK, Messages.DISPUTE_UPDATE, data);
});

module.exports = {
	raisedDispute,
	getDisputeList,
	getDisputeDetails,
	disputeAnnounce,
	disputeAccept,
	disputeMilestoneDetails,
	updateDispute
};

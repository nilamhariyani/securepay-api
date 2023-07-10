const httpStatus = require('http-status');
const catchAsync = require('../../utils/catchAsync');
const createResponse = require('../../utils/response');
const Messages = require('../../utils/messages');
const emailService = require("../common/email.service");
const pubnubService = require("../common/pubnub.service");
const jobServices = require("../job/job.service");
const customerServices = require("../customer/customer.service");
const twiloService = require('../common/twilo.service')


const { TITLE, DESC } = require('../../config/notification');


const getInviteUserList = catchAsync(async (req, res) => {
    const jobData = await jobServices.getInviteUserList(req.user);
    createResponse(res, httpStatus.OK, Messages.INVITE_FETCHED, jobData)
});

const createJob = catchAsync(async (req, res) => {
    const Job = await jobServices.createjob(req);
    const getjobdata = await jobServices.getjobdetails(Job.id);

    getjobdata[0].createdByFirstName = Job.createdByFirstName;
    getjobdata[0].createdByLastName = Job.createdByLastName;
    getjobdata[0].totalpayment = Job.totalPayment;

    // ------------------- Mail Send & notification ----------------------
    let jobMilestone;
    if (req.body.isFullPayment) {
        await emailService.sendMilestoneSingle(getjobdata[0].customerEmail, getjobdata);
        jobMilestone = {
            Job, getjobdata
        }
    } else {
        await emailService.sendMilestoneMultiple(getjobdata[0].customerEmail, getjobdata);
        jobMilestone = {
            Job, getjobdata
        }
    }

    pubnubService.sendNotification(getjobdata[0].inviteUserId, { title: TITLE.NEW_TRANSACTION, description: DESC.NEW_TRANSACTION })
    createResponse(res, httpStatus.CREATED, Messages.CREAT_JOB_CUSTOMER, jobMilestone)
});

const getJobDetail = catchAsync(async (req, res) => {
    const JobDetails = await jobServices.getjobdetails(req.query.jobId);
    createResponse(res, httpStatus.OK, Messages.JOB_DETAILS, JobDetails)
});

const getJob = catchAsync(async (req, res) => {
    let result = await jobServices.getJobList(req);
    createResponse(res, httpStatus.OK, Messages.JOB_LIST, result);
});

const getInvited = catchAsync(async (req, res) => {
    let result = await jobServices.getInvitedList(req);
    createResponse(res, httpStatus.OK, Messages.JOB_LIST, result);
});
// *********************** Job Accpted **********************
const jobAccepted = catchAsync(async (req, res) => {
    let result = await jobServices.jobAccepted(req);

    // ------- Send Notification & Mail ---------
    let client = await customerServices.getUserById(result.userId);
    let customer = await customerServices.getUserById(result.inviteUserId);

    await emailService.acceptedJob(client.email, {
        clientName: client.firstName + ' ' + client.lastName,
        customerName: customer.firstName + ' ' + customer.lastName,
        jobName: result.name,
        // status: 'accepted',
        // subject: TITLE.TRANSACTION_ACCEPTED,
    });
    let des = DESC.TRANSACTION_ACCEPTED.replace('$', result.name)
    if (client.number && client.dialCode) {
        let toMobile = "+" + client.dialCode + "" + client.number
        let body = des
        await twiloService.sendSms(toMobile, body)
    }
    pubnubService.sendNotification(result.userId, { title: TITLE.TRANSACTION_ACCEPTED, description: DESC.TRANSACTION_ACCEPTED.replace('$', result.name) })
    //  -------------------------------------------------
    createResponse(res, httpStatus.OK, Messages.JOB_ACCEPT, {});
});

// *********************** Job Rejected **********************
const jobRejected = catchAsync(async (req, res) => {
    let result = await jobServices.jobRejected(req);
    // console.log(result)
    // ------- Send Notification & Mail ---------


    let client = await customerServices.getUserById(result.userId);
    let customer = await customerServices.getUserById(result.inviteUserId);

    await emailService.rejectedJob(client.email, {
        clientName: client.firstName + ' ' + client.lastName,
        customerName: customer.firstName + ' ' + customer.lastName,
        jobName: result.name,
        // status: 'rejected',
        // rejectComment: req.body.reason,
        // subject: TITLE.TRANSACTION_REJECTED,
    });
    let des = DESC.TRANSACTION_REJECTED.replace('$', result.name)
    if (client.number && client.dialCode) {
        let toMobile = "+" + client.dialCode + "" + client.number
        let body = des
        await twiloService.sendSms(toMobile, body)
    }
    pubnubService.sendNotification(result.userId, { title: TITLE.TRANSACTION_REJECTED, description: DESC.TRANSACTION_REJECTED.replace('$', result.name) })

    createResponse(res, httpStatus.OK, Messages.JOB_REJECT, {});
});


const confirmJobAmount = catchAsync(async (req, res) => {
    let user = await customerServices.getUserById(req.user.id);
    // console.log(user.commission);
    let result = await jobServices.confirmJobAmount(req, user.commission);
    createResponse(res, httpStatus.OK, Messages.JOB_CONFIRM, {});
});

// *********************************** Modification Request ***************************
const jobModificationRequest = catchAsync(async (req, res) => {
    let result = await jobServices.jobPush(req.body.jobId, { modificationRequestHistory: { comment: req.body.note, date: new Date() } });
    console.log(result);

    let client = await customerServices.getUserById(result.userId);
    let customer = await customerServices.getUserById(result.inviteUserId);

    await emailService.modificationRequest(client.email, {
        clientName: client.firstName + ' ' + client.lastName,
        customerName: customer.firstName + ' ' + customer.lastName,
        jobName: result.name,
        modificationComment: req.body.note
    });

    if (client.number && client.dialCode) {
        let toMobile = "+" + client.dialCode + "" + client.number
        let body = `${customer.firstName} ${customer.lastName} has submitted a job modification request regarding ${result.name}`
        await twiloService.sendSms(toMobile, body)
    }

    createResponse(res, httpStatus.OK, Messages.MODIFICATION_REQUEST, {});
});
module.exports = {
    getInviteUserList,
    createJob,
    getJobDetail,
    getJob,
    getInvited,
    jobAccepted,
    jobRejected,
    confirmJobAmount,
    jobModificationRequest
};

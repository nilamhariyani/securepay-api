const httpStatus = require('http-status');
const catchAsync = require('../../utils/catchAsync');
const createResponse = require('../../utils/response');
const Messages = require('../../utils/messages');
const emailService = require("../common/email.service");
const supportTicketServices = require("./support-ticket.service");
const adminServices = require("../admin/admin.service");
const customerServices = require("../customer/customer.service");
const { SUPPORT_STATUS } = require('../../config/constant');
const { TITLE, DESC } = require('../../config/notification');
const pubnubService = require("../common/pubnub.service");
const config = require('../../config/config');
const twiloService = require('../common/twilo.service');

const createSupportTicket = catchAsync(async (req, res) => {
    let data = await supportTicketServices.createTicket(req);
    console.log(data);
    let des = DESC.CREATED_SUPPORT_TICKET.replace('#', req.body.title).replace('$', req.user.firstName + ' ' + req.user.lastName);

    let staff = await adminServices.getUserById(data.assignedUserId)
    let adminData = await adminServices.getUserById(config.admin.id)

    await emailService.supportTicketRaised(staff.email, { 'staffName': staff.firstName + ' ' + staff.lastName, userName: `${req.user.firstName} ${req.user.lastName}`, details: req.body.description, title: req.body.title })
    await emailService.supportTicketRaised(adminData.email, { 'staffName': adminData.firstName + ' ' + adminData.lastName, userName: `${req.user.firstName} ${req.user.lastName}`, details: req.body.description, title: req.body.title })

    pubnubService.sendNotification(data.assignedUserId, { title: TITLE.CREATED_SUPPORT_TICKET, description: des });
    pubnubService.sendNotification(config.admin.id, { title: TITLE.CREATED_SUPPORT_TICKET, description: des });

    createResponse(res, httpStatus.OK, Messages.SUPPORT_TICKET_CREATED, {});
});
const getSupportTicket = catchAsync(async (req, res) => {
    let data = await supportTicketServices.getTicket(req);
    createResponse(res, httpStatus.OK, Messages.SUPPORT_TICKET_GET, data);
});
const getSupportTicketDetail = catchAsync(async (req, res) => {
    let data = await supportTicketServices.getTicketDetails(req);
    createResponse(res, httpStatus.OK, Messages.SUPPORT_TICKET_GET_DETAILS, data);
});
const commentSupportTicket = catchAsync(async (req, res) => {
    req.body.userId = req.user.id
    let data = await supportTicketServices.addComments(req.body, req.files);

    let ticketData = await supportTicketServices.getTicketById(data.ticketId);
    console.log(ticketData.userId)
    console.log(req.user.id)
    let userData;
    if (ticketData.userId == req.user.id) {
        userData = await adminServices.getUserById(ticketData.assignedUserId)
    } else {
        userData = await customerServices.getUserById(ticketData.userId)
    }
    console.log(userData.email);


    await emailService.supportTicketComment(userData.email, { userName: `${userData.firstName} ${userData.lastName}`, ticketTitle: ticketData.title, comment: data.description })


    let des = DESC.RECEIVED_NEW_COMMNET.replace('#', ticketData.title);
    // if (userData.number && userData.dialCode) {
    //     let toMobile = "+" + userData.dialCode + "" + userData.number
    //     let body = des
    //     await twiloService.sendSms(toMobile, body)
    // }
    pubnubService.sendNotification(userData._id, { title: TITLE.RECEIVED_NEW_COMMNET, description: des });

    createResponse(res, httpStatus.OK, Messages.COMMENT_ADD, {});
});
const supportTicketResolve = catchAsync(async (req, res) => {
    req.body.userId = req.user.id
    let data = await supportTicketServices.ticketUpdate(req.query.ticketId, { status: SUPPORT_STATUS.RESOLVED });

    let userData = await customerServices.getUserById(data.userId)
    await emailService.supportTicketResolved(userData.email, { userName: `${userData.firstName} ${userData.lastName}`, title: data.title })

    let des = DESC.SUPPORT_TICKET_RESOLVE.replace('$', req.user.firstName + ' ' + req.user.lastName).replace('#', data.title);
    // if (userData.number && userData.dialCode) {
    //     let toMobile = "+" + userData.dialCode + "" + userData.number
    //     let body = des
    //     await twiloService.sendSms(toMobile, body)
    // }
    pubnubService.sendNotification(data.userId, { title: TITLE.SUPPORT_TICKET_RESOLVE, description: des });
    createResponse(res, httpStatus.OK, Messages.TICKET_RESOLVED, {});
});

module.exports = {
    createSupportTicket,
    getSupportTicket,
    getSupportTicketDetail,
    commentSupportTicket,
    supportTicketResolve
};

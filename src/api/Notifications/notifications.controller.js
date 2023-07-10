const httpStatus = require('http-status');
const catchAsync = require('../../utils/catchAsync');
const createResponse = require('../../utils/response');
const Messages = require('../../utils/messages');
// const emailService = require("../common/email.service");
const notificationServices = require("./notifications.service");

const getNotifications = catchAsync(async (req, res) => {
	let data = await notificationServices.getNotifications(req);

	createResponse(res, httpStatus.OK, Messages.NOTIFICATION_GETS, data);
});


module.exports = {
    getNotifications
};

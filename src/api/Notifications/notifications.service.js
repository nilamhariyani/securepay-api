
const Notification = require('../../models/notification.model');
const AppError = require("../../utils/AppError");
const httpStatus = require("http-status");
const { pick, get, gt } = require("lodash");
const mongoose = require("mongoose");
const ObjectId = mongoose.Types.ObjectId;


const getNotifications = async (req) => {
	const {search} = req.query
	let searchfilter = { userId: req.user.id }


	const searchFields = ["title", "description"];
	if (search) {
        searchfilter["$or"] = searchFields.map((field) => ({
            [field]: { $regex: search, $options: "i" },
        }));
	}
	
	let notificationData = await Notification.find(searchfilter).sort({createdAt: -1});
	return notificationData
}

module.exports = {
	getNotifications
};

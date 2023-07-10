var mongoose = require('mongoose');
var validator = require('validator');
const { DISPUTE_STATUS, DISPUTE_USER_STATUS, CONCLUSION_STATUS } = require('../config/constant');
var Schema = mongoose.Schema;

var notificationsSchema = new Schema(
	{
		
		userId: {
			type: Schema.Types.ObjectId,
			required: true,
			ref: "Customer", // User Id
		},
		title: {
			type: String
		},
		description: {
			type: String
		},
		action: {
			type: String
		},
		metaData: {
			type: String
		}
	},
	{
		timestamps: true,
		toObject: { getters: true },
		toJSON: { getters: true },
	}
);



const notifications = mongoose.model('notification', notificationsSchema);

module.exports = notifications;
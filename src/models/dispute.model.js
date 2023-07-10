var mongoose = require('mongoose');
var validator = require('validator');
const { DISPUTE_STATUS, DISPUTE_USER_STATUS, CONCLUSION_STATUS } = require('../config/constant');
var Schema = mongoose.Schema;

var disputeSchema = new Schema(
	{
		jobId: {
			type: Schema.Types.ObjectId,
			required: true,
			ref: "Job", // Job ID
		},
		milestoneId: {
			type: Schema.Types.ObjectId,
			required: true,
			ref: "Milestone", // Milestone ID
		},
		userId: {
			type: Schema.Types.ObjectId,
			required: true,
			ref: "Customer", // User Id
		},
		staffId: {
			type: Schema.Types.ObjectId,
			required: true,
			ref: "Admin", // Staff Id
		},
		description:{
			type: String
		},
		images: {
			type: Array
		},
		status: {
			type: String,
			enum: [
				DISPUTE_STATUS.RAISED,
				DISPUTE_STATUS.ONGOING,
				DISPUTE_STATUS.RESOLVED,
				DISPUTE_STATUS.ARBITRATION
			],
			default: DISPUTE_STATUS.RAISED,
		},
		resolvedDate: {
			type: Date
		},
		conclusion: {
			type: String,
			enum: [
				CONCLUSION_STATUS.CLIENT,
				CONCLUSION_STATUS.CUSTOMER,
				CONCLUSION_STATUS.ARBITRATION
			]
		},
		conclusionStatement: {
			type: String
		},
		amountPayClient: {
			type: Number
		},
		amountRefundCustomer: {
			type: Number
		},
		customerResponse: {
			type: 'String',
			enum: [
				DISPUTE_USER_STATUS.PENDING,
				DISPUTE_USER_STATUS.ACCEPT,
				DISPUTE_USER_STATUS.REJECTED,
			]
		},
		clientResponse: {
			type: 'String',
			enum: [
				DISPUTE_USER_STATUS.PENDING,
				DISPUTE_USER_STATUS.ACCEPT,
				DISPUTE_USER_STATUS.REJECTED,
			]
		},
		channelId: {
			type: 'String'
		}
	},
	{
		timestamps: true,
		toObject: { getters: true },
		toJSON: { getters: true },
	}
);



const disputes = mongoose.model('Dispute', disputeSchema);

module.exports = disputes;
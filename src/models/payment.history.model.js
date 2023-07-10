var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var paymentHistorySchema = new Schema(
	{
		jobId: {
			type: Schema.Types.ObjectId,
			required: true,
			ref: "Milestone", // Job ID
		},
		milestoneId: {
			type: Schema.Types.ObjectId,
			required: true,
			ref: "Milestone", // Milestone ID
		},
		totalAmount: {
			type: Number
		},
		adminFees: {
			type: Number
		}
	},
	{
		timestamps: true,
		toObject: { getters: true },
		toJSON: { getters: true },
	}
);



const paymentHistory = mongoose.model('PaymentHistory', paymentHistorySchema);

module.exports = paymentHistory;
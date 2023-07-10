
var mongoose = require('mongoose');
var validator = require('validator');
const { SUPPORT_STATUS } = require('../config/constant');
var Schema = mongoose.Schema;

var supportTicketSchema = new Schema({
    userId: {
        type: Schema.Types.ObjectId, required: true, ref: 'Customer' // Created user id
    },
    assignedUserId: {
        type: Schema.Types.ObjectId, required: true, ref: 'Admin' // Assign staff id
    },
    ticketId: {
        type: String
    },
    title: {
        type: String,
        index: true
    },
    status: {
        type: String,
        enum: [
            SUPPORT_STATUS.PENDING,
            SUPPORT_STATUS.RESOLVED
        ],
        default: SUPPORT_STATUS.PENDING
    }
}, {
        timestamps: true,
        toObject: { getters: true },
        toJSON: { getters: true },
    }
);



const supportTicket = mongoose.model('SupportTicket', supportTicketSchema);

module.exports = supportTicket;
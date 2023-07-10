var mongoose = require('mongoose');
var validator = require('validator');
// const bcrypt = require('bcryptjs');
// const { omit, pick } = require('lodash');
const { JOBSTATUS } = require('../config/constant');
var Schema = mongoose.Schema;

var jobSchema = new Schema({
    userId: {
        type: Schema.Types.ObjectId, required: true, ref: 'Customer' // Job create user ID 
    },
    inviteUserId: {
        type: Schema.Types.ObjectId, required: true, ref: 'Customer' // Job Invite user ID 
    },
    name: {
        type: String,
        index: true
    },
    totalAmount: {
        type: Number,
        index: true
    },
    serviceFee: {
        type: Number
    },
    servicePercentage: {
        type: Number
    },
    amount: {
        type: Number
    },
    description: {
        type: String
    },
    status: {
        type: String,
        enum: [
            JOBSTATUS.CREATED,
            JOBSTATUS.WAITING_ACCEPT,
            JOBSTATUS.WAITING_FUND_DEPOSITE,
            JOBSTATUS.PAYMENT_IN_DEPOSITE,
            JOBSTATUS.RELEASE_REQUESTED,
            JOBSTATUS.PAYMENT_RELEASE,
            JOBSTATUS.PAYMENT_COMPLETE,
            JOBSTATUS.JOB_COMPLETE,
            JOBSTATUS.PAYMENT_REJECTED,
            JOBSTATUS.DISPUTE,
            JOBSTATUS.DISPUTE_RESOLVED,
            JOBSTATUS.PAID,
            JOBSTATUS.REJECTED
        ],
        default: JOBSTATUS.WAITING_ACCEPT
    },
    rejectHistory: {
        type: Array
    },
    isUpdate:{
      type: Boolean  
    },
    modificationRequestHistory: [
        {
            comment: {
                type: String
            },
            date: {
                type: Date
            }
        }
    ],
}, {
        timestamps: true,
        toObject: { getters: true },
        toJSON: { getters: true },
    }
);



const job = mongoose.model('Job', jobSchema);

module.exports = job;
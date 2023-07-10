var mongoose = require('mongoose');
var validator = require('validator');
// const bcrypt = require('bcryptjs');
// const { omit, pick } = require('lodash');
const { MILESTONESTATUS, PAYMENT_TYPE } = require('../config/constant');
var Schema = mongoose.Schema;

var milestoneSchema = new Schema(
  {
    jobId: {
      type: Schema.Types.ObjectId,
      required: true,
      ref: "Job", // Job create user ID
    },
    title: {
      type: String,
    },
    description: {
      type: String,
    },
    completionDate: {
      type: Date, // 1996-11-20
    },
    amount: {
      type: Number,
    },
    description: {
      type: String,
    },
    isFullPayment: {
      type: Boolean,
    },
    status: {
      type: String,
      enum: [
        MILESTONESTATUS.WAITING_ACCEPT,
        MILESTONESTATUS.WAITING_FUND_DEPOSITE,
        MILESTONESTATUS.PAYMENT_IN_DEPOSITE,
        MILESTONESTATUS.RELEASE_REQUESTED,
        MILESTONESTATUS.PAYMENT_RELEASE,
        MILESTONESTATUS.PAYMENT_COMPLETE,
        MILESTONESTATUS.PAYMENT_REJECTED,
        MILESTONESTATUS.DISPUTE,
        MILESTONESTATUS.DISPUTE_RESOLVED,
        MILESTONESTATUS.PAID,
        MILESTONESTATUS.REJECTED
      ],
      default: MILESTONESTATUS.WAITING_ACCEPT,
    },
    escrowDetails: {
      id: {
        type: String
      },
      date: {
        type: Date
      },
      wireReference: { // For bank WireReference and For card cardId
        type: String
      },
      paymentType: {
        type: String,
        enum: [
          PAYMENT_TYPE.BANK,
          PAYMENT_TYPE.CARD
        ]
      },
      status: {
        type: String
      },
      totalAmount: {
        type: String
      }
    },
    trueLayerDetails: {
      paymentId: {
        type: String
      },
      date: {
        type: Date
      },
      status: {
        type: String
      }
    },
    paymentReleaseId: {
      type: String
    },
    paymentReleaseDate: {
      type: Date
    },
    paymentPayoutId: {
      type: String
    },
    status: {
      type: String,
    },


    userId: {
      type: Schema.Types.ObjectId,
      required: true,
      ref: "Customer", // Job create user ID
    },
    inviteUserId: {
      type: Schema.Types.ObjectId,
      required: true,
      ref: "Customer", // Job Invite user ID
    },
  },
  {
    timestamps: true,
    toObject: { getters: true },
    toJSON: { getters: true },
  }
);



const milestone = mongoose.model('Milestone', milestoneSchema);

module.exports = milestone;
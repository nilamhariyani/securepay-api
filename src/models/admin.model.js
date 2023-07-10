var mongoose = require('mongoose');
var Schema = mongoose.Schema;
const bcrypt = require('bcryptjs');
const { omit, pick } = require('lodash');
const { ROLES, DEFAULT_IMAGE } = require('../config/constant');

var adminSchema = new Schema(
  {
    firstName: {
      type: String,
      required: true,
    },
    lastName: {
      type: String,
      required: true,
    },
    // dob: {
    //     type: Date
    // },
    email: {
      type: String,
      required: true,
    },
    password: {
      type: String,
    },
    role: {
      type: Number,
      enum: [ROLES.ADMIN, ROLES.STAFF_MEMBERS],
      required: true,
      default: ROLES.STAFF_MEMBERS
    },
    commission: {
      commission: {
        type: Number
      },
      commission1: {
        type: Number
      },
      commission2: {
        type: Number
      }
    },
    disputeCount: {
      type: Number,
      default: 0
    },
    supportCount: {
      type: Number,
      default: 0
    },
    isDeleted: { type: Boolean, default: false },
    isEnable: { type: Boolean, default: false },
    profilePic: { type: String, default: DEFAULT_IMAGE.DUMMYPROFILE },
    profilePicURL: { type: String, default: DEFAULT_IMAGE.URL },
    // gender: {
    //     type: Number
    // },
    dialCode: {
      type: String,
    },
    number: {
      type: String,
    },
    otp: Number,
    verifyOtp: { type: Number }
  },
  {
    timestamps: true,
    toObject: { getters: true },
    toJSON: { getters: true },
  }
);

adminSchema.methods.toJSON = function () {
  const client = this;
  return omit(client.toObject(), ['password']);
};
adminSchema.methods.transform = function () {
  const user = this;
  return pick(user.toJSON(), ['_id', 'email', 'firstName', 'lastName', 'role', 'registerStep', 'registerComplete', 'dialCode', 'number',]);
};
adminSchema.pre('save', async function (next) {
  const client = this;
  if (client.isModified('password')) {
    client.password = await bcrypt.hash(client.password, 8);
  }
  next();
});
const Admin = mongoose.model('Admin', adminSchema);

module.exports = Admin;
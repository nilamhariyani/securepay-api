const Admin = require('../../models/admin.model')
const AppError = require('../../utils/AppError');
const httpStatus = require('http-status');
const { pick, get } = require('lodash');
const { getQueryOptions } = require('../../utils/service.util');
const mongoose = require('mongoose');
const Messages = require('../../utils/messages');
const commonService = require("../common/common.service");
const ObjectId = mongoose.Types.ObjectId
// const Admin = require('../../models/admin.model')
const tokenService = require('../common/token.service');
const config = require('../../config/config')
const { TOKEN_TYPE } = require('../../config/constant');
const moment = require('moment');
const PaymentHistory = require('../../models/payment.history.model');
const Job = require('../../models/job.model')
const _ = require('lodash');

const getAdminByEmail = async (email) => {
  const admins = await Admin.findOne({ email })
  console.log("admins ::", admins)
  if (!admins) {
    throw new AppError(httpStatus.UNPROCESSABLE_ENTITY, Messages.EMAIL_NOT_FOUND);
  }
  return admins
}


const getUserById = async (userId) => {
  const user = await Admin.findById(userId);
  if (!user) {
    throw new AppError(httpStatus.NOT_FOUND, Messages.ID_NOT_FOUND);
  }
  return user;
};

const updateUser = async (userId, updateBody) => {
  const user = await getUserById(userId);
  // if (updateBody.email) {
  //   await checkDuplicateEmail(updateBody.email, userId);
  // }
  Object.assign(user, updateBody);
  await user.save();
  return user;
};

const checkAdminByEmail = async (email) => {
  const admins = await Admin.findOne({ email })
  if (admins) {
    throw new AppError(httpStatus.UNPROCESSABLE_ENTITY, Messages.ALREADY_EXITS);
  } else {
    return admins
  }
}
const createUser = async (userBody) => {
  const admin = await checkAdminByEmail(userBody.email)
  return await Admin.create(userBody)
}

const getStaffList = async (req) => {
  const { search } = req.query;
  const { limit, skip, page, sort } = getQueryOptions(req.query);

  let searchfilter = {};

  const searchFields = ["firstName", "lastName", "email", "contactNumber"];
  if (search) {
    searchfilter["$or"] = searchFields.map((field) => ({
      [field]: { $regex: search, $options: "i" },
    }));
  }
  const customerDetails = await Admin.aggregate([
    {
      $match: {
        isDeleted: false, role: 2
      }
    },
    {
      $addFields: {
        contactNumber: {
          $concat: ["(", "$dialCode", ")", "$number"],
        },
      },
    },
    {
      $addFields: {
        fullName: {
          $concat: ["$firstName", "$lastName"],
        },
      },
    },
    { $match: searchfilter },
    { $sort: sort },
    { $skip: parseInt(skip) },
    { $limit: parseInt(limit) },
    {
      $project: {
        firstName: 1,
        lastName: 1,
        email: 1,
        contactNumber: 1,
        isDeleted: 1,
        isEnable: 1,
        profilePic: 1,
        profilePicURL: 1
      }
    }
  ])
  return customerDetails;
}

const updateStaffMember = async (id, data) => {
  const user = await getUserById(id);
  Object.assign(user, data);
  await user.save();
  return user;
};

const generateUserVerifyToken = async (userId, token) => {
  const expires = moment().add(
    config.jwt.refreshExpirationDays,
    "days"
  );
  const verifyUserToken = tokenService.generateToken(userId, token, expires);
  await tokenService.saveToken(
    verifyUserToken,
    userId,
    expires,
    TOKEN_TYPE.VERIFICATION_TOKEN
  );
  return verifyUserToken;
};

const verifyAuthOTP = async (req) => {
  await getUserById(req.user.id);

  const user = await Admin.findOne({ _id: ObjectId(req.user.id), verifyOtp: req.body.verifyOtp });
  if (!user) {
    throw new AppError(httpStatus.NOT_FOUND, Messages.WRONG_OTP);
  }
  await updateUser(req.user.id, { verifyOtp: '' })
  return user;
}


const getTotalRevenue = async (query) => {

  let totalRevenue
  let dateFilter = {};

  if (query.startDate && query.endDate) {
    dateFilter = {
      createdAt: { $gte: new Date(query.startDate), $lt: new Date(query.endDate) }
    }
  }
  if (query.key === "month") {
    totalRevenue = await PaymentHistory.aggregate([
      [
        {
          '$addFields': {
            'month': {
              '$month': '$createdAt'
            },
            'year': {
              '$year': '$createdAt'
            },
            'day': {
              '$dayOfMonth': '$createdAt'
            }
          }
        }, {
          '$match': {
            'year': parseInt(query.year),
            'month': parseInt(query.month)
          }
        }, {
          '$group': {
            '_id': {
              'month': '$month',
              'year': '$year',
              'day': '$day'
            },
            'totalEarning': {
              '$sum': '$totalAmount'
            }
          }
        }, {
          '$sort': {
            '_id.day': 1
          }
        }
      ]
    ]);
  }
  else if (query.key === "year") {
    totalRevenue = await PaymentHistory.aggregate([
      [
        {
          '$addFields': {
            'month': {
              '$month': '$createdAt'
            },
            'year': {
              '$year': '$createdAt'
            }
          }
        }, {
          '$match': {
            'year': parseInt(query.year)
          }
        }, {
          '$group': {
            '_id': {
              'month': '$month',
              'year': '$year'
            },
            'totalEarning': {
              '$sum': '$totalAmount'
            }
          }
        }, {
          '$sort': {
            '_id.month': 1
          }
        }
      ]
    ])
  }
  else {
    totalRevenue = await PaymentHistory.aggregate([
      [
        {
          '$match': dateFilter
        }, {
          '$addFields': {
            'month': {
              '$month': '$createdAt'
            },
            'year': {
              '$year': '$createdAt'
            },
            'day': {
              '$dayOfMonth': '$createdAt'
            }
          }
        }, {
          '$addFields': {
            'FullDate': {
              '$concat': [
                {
                  '$toString': '$year'
                }, '-', {
                  '$toString': '$month'
                }, '-', {
                  '$toString': '$day'
                }
              ]
            }
          }
        }, {
          '$addFields': {
            'FullDate': {
              '$dateFromString': {
                'dateString': '$FullDate'
              }
            }
          }
        }, {
          '$group': {
            '_id': {
              'month': '$month',
              'year': '$year',
              'day': '$day'
            },
            'totalEarning': {
              '$sum': '$totalAmount'
            },
            'fullDate': {
              '$first': '$FullDate'
            }
          }
        }, {
          '$sort': {
            'fullDate': 1
          }
        }
      ]
    ])
  }
  return totalRevenue;
}

const getTotalCommission = async (query) => {
  console.log('COmmision-----')
  let totalCommission;
  let dateFilter = {};
  console.log('query  :', query)
  if (query.startDate && query.endDate) {
    dateFilter = {
      createdAt: { $gte: new Date(query.startDate), $lt: new Date(query.endDate) }
    }
  }
  if (query.key === "month") {
    console.log('Month Comm-----')
    totalCommission = await PaymentHistory.aggregate([
      [
        {
          '$addFields': {
            'month': {
              '$month': '$createdAt'
            },
            'year': {
              '$year': '$createdAt'
            },
            'day': {
              '$dayOfMonth': '$createdAt'
            }
          }
        }, {
          '$match': {
            'year': parseInt(query.year),
            'month': parseInt(query.month)
          }
        }, {
          '$group': {
            '_id': {
              'month': '$month',
              'year': '$year',
              'day': '$day'
            },
            'totalEarning': {
              '$sum': '$adminFees'
            }
          }
        }, {
          '$sort': {
            '_id.day': 1
          }
        }
      ]
    ]);
  }
  else if (query.key === "year") {
    console.log('Year COmmision-----')
    totalCommission = await PaymentHistory.aggregate([
      [
        {
          '$addFields': {
            'month': {
              '$month': '$createdAt'
            },
            'year': {
              '$year': '$createdAt'
            }
          }
        }, {
          '$match': {
            'year': parseInt(query.year)
          }
        }, {
          '$group': {
            '_id': {
              'month': '$month',
              'year': '$year'
            },
            'totalEarning': {
              '$sum': '$adminFees'
            }
          }
        }, {
          '$sort': {
            '_id.month': 1
          }
        }
      ]
    ])
  }
  else {
    console.log('dateFilter :', dateFilter)
    totalCommission = await PaymentHistory.aggregate([
      [
        {
          '$match': dateFilter
        }, {
          '$addFields': {
            'month': {
              '$month': '$createdAt'
            },
            'year': {
              '$year': '$createdAt'
            },
            'day': {
              '$dayOfMonth': '$createdAt'
            }
          }
        }, {
          '$addFields': {
            'FullDate': {
              '$concat': [
                {
                  '$toString': '$year'
                }, '-', {
                  '$toString': '$month'
                }, '-', {
                  '$toString': '$day'
                }
              ]
            }
          }
        }, {
          '$addFields': {
            'FullDate': {
              '$dateFromString': {
                'dateString': '$FullDate'
              }
            }
          }
        }, {
          '$group': {
            '_id': {
              'month': '$month',
              'year': '$year',
              'day': '$day'
            },
            'totalEarning': {
              '$sum': '$adminFees'
            },
            'fullDate': {
              '$first': '$FullDate'
            }
          }
        }, {
          '$sort': {
            'fullDate': 1
          }
        }
      ]
    ])
  }
  return totalCommission;
}

const getJobDashboard = async (query) => {
  let JobDashboard
  let dateFilter = {};
  console.log('query.startDate :', query.startDate, "ENd Date :", query.endDate)
  if (query.startDate && query.endDate) {
    dateFilter = {
      createdAt: { $gte: new Date(query.startDate), $lt: new Date(query.endDate) }
    }
  }
  if (query.key === "month") {
    JobDashboard = await Job.aggregate([
      [
        {
          '$addFields': {
            'month': {
              '$month': '$createdAt'
            },
            'year': {
              '$year': '$createdAt'
            },
            'day': {
              '$dayOfMonth': '$createdAt'
            }
          }
        }, {
          '$match': {
            'year': parseInt(query.year),
            'month': parseInt(query.month)
          }
        }, {
          '$project': {
            '_id': 1,
            'month': 1,
            'year': 1,
            'day': 1,
            'ongoingPayment': {
              '$cond': [
                {
                  '$or': [
                    {
                      '$eq': [
                        '$status', 'WAITING_ACCEPT'
                      ]
                    }, {
                      '$eq': [
                        '$status', 'PAYMENT_REJECTED'
                      ]
                    }, {
                      '$eq': [
                        '$status', 'REJECTED'
                      ]
                    }, {
                      '$eq': [
                        '$status', 'WAITING_FUND_DEPOSITE'
                      ]
                    }, {
                      '$eq': [
                        '$status', 'PAYMENT_IN_DEPOSITE'
                      ]
                    }, {
                      '$eq': [
                        '$status', 'RELEASE_REQUESTED'
                      ]
                    }, {
                      '$eq': [
                        '$status', 'PAYMENT_RELEASE'
                      ]
                    }, {
                      '$eq': [
                        '$status', 'PAYMENT_COMPLETE'
                      ]
                    }
                  ]
                }, 1, 0
              ]
            },
            'completedPayment': {
              '$cond': [
                {
                  '$and': [
                    {
                      '$eq': [
                        '$status', 'JOB_COMPLETE'
                      ]
                    }
                  ]
                }, 1, 0
              ]
            },
            'paymentinDispute': {
              '$cond': [
                {
                  '$and': [
                    {
                      '$eq': [
                        '$status', 'DISPUTE'
                      ]
                    }
                  ]
                }, 1, 0
              ]
            }
          }
        }, {
          '$group': {
            '_id': {
              'day': '$day',
              'month': '$month',
              'year': '$year'
            },
            'totalOngoing': {
              '$sum': '$ongoingPayment'
            },
            'totalcompleted': {
              '$sum': '$completedPayment'
            },
            'totalpayment': {
              '$sum': '$paymentinDispute'
            }
          }
        }, {
          '$sort': {
            '_id.day': 1
          }
        }
      ]
    ]);
  }
  else if (query.key === "year") {
    JobDashboard = await Job.aggregate([
      [
        {
          '$addFields': {
            'month': {
              '$month': '$createdAt'
            },
            'year': {
              '$year': '$createdAt'
            }
          }
        }, {
          '$match': {
            'year': parseInt(query.year),
          }
        }, {
          '$project': {
            '_id': 1,
            'month': 1,
            'year': 1,
            'day': 1,
            'ongoingPayment': {
              '$cond': [
                {
                  '$or': [
                    {
                      '$eq': [
                        '$status', 'WAITING_ACCEPT'
                      ]
                    }, {
                      '$eq': [
                        '$status', 'PAYMENT_REJECTED'
                      ]
                    }, {
                      '$eq': [
                        '$status', 'REJECTED'
                      ]
                    }, {
                      '$eq': [
                        '$status', 'WAITING_FUND_DEPOSITE'
                      ]
                    }, {
                      '$eq': [
                        '$status', 'PAYMENT_IN_DEPOSITE'
                      ]
                    }, {
                      '$eq': [
                        '$status', 'RELEASE_REQUESTED'
                      ]
                    }, {
                      '$eq': [
                        '$status', 'PAYMENT_RELEASE'
                      ]
                    }, {
                      '$eq': [
                        '$status', 'PAYMENT_COMPLETE'
                      ]
                    }
                  ]
                }, 1, 0
              ]
            },
            'completedPayment': {
              '$cond': [
                {
                  '$and': [
                    {
                      '$eq': [
                        '$status', 'JOB_COMPLETE'
                      ]
                    }
                  ]
                }, 1, 0
              ]
            },
            'paymentinDispute': {
              '$cond': [
                {
                  '$and': [
                    {
                      '$eq': [
                        '$status', 'DISPUTE'
                      ]
                    }
                  ]
                }, 1, 0
              ]
            }
          }
        }, {
          '$group': {
            '_id': {
              'month': '$month',
              'year': '$year'
            },
            'totalOngoing': {
              '$sum': '$ongoingPayment'
            },
            'totalcompleted': {
              '$sum': '$completedPayment'
            },
            'totalpayment': {
              '$sum': '$paymentinDispute'
            }
          }
        }, {
          '$sort': {
            '_id.month': 1
          }
        }
      ]
    ])
  }
  else {
    JobDashboard = await Job.aggregate([
      [
        {
          '$match': dateFilter
        }, {
          '$addFields': {
            'month': {
              '$month': '$createdAt'
            },
            'year': {
              '$year': '$createdAt'
            },
            'day': {
              '$dayOfMonth': '$createdAt'
            }
          }
        }, {
          '$addFields': {
            'FullDate': {
              '$concat': [
                {
                  '$toString': '$year'
                }, '-', {
                  '$toString': '$month'
                }, '-', {
                  '$toString': '$day'
                }
              ]
            }
          }
        }, {
          '$addFields': {
            'FullDate': {
              '$dateFromString': {
                'dateString': '$FullDate'
              }
            }
          }
        }, {
          '$project': {
            '_id': 1,
            'month': 1,
            'year': 1,
            'day': 1,
            'FullDate': 1,
            'ongoingPayment': {
              '$cond': [
                {
                  '$or': [
                    {
                      '$eq': [
                        '$status', 'WAITING_ACCEPT'
                      ]
                    }, {
                      '$eq': [
                        '$status', 'PAYMENT_REJECTED'
                      ]
                    }, {
                      '$eq': [
                        '$status', 'REJECTED'
                      ]
                    }, {
                      '$eq': [
                        '$status', 'WAITING_FUND_DEPOSITE'
                      ]
                    }, {
                      '$eq': [
                        '$status', 'PAYMENT_IN_DEPOSITE'
                      ]
                    }, {
                      '$eq': [
                        '$status', 'RELEASE_REQUESTED'
                      ]
                    }, {
                      '$eq': [
                        '$status', 'PAYMENT_RELEASE'
                      ]
                    }, {
                      '$eq': [
                        '$status', 'PAYMENT_COMPLETE'
                      ]
                    }
                  ]
                }, 1, 0
              ]
            },
            'completedPayment': {
              '$cond': [
                {
                  '$and': [
                    {
                      '$eq': [
                        '$status', 'JOB_COMPLETE'
                      ]
                    }
                  ]
                }, 1, 0
              ]
            },
            'paymentinDispute': {
              '$cond': [
                {
                  '$and': [
                    {
                      '$eq': [
                        '$status', 'DISPUTE'
                      ]
                    }
                  ]
                }, 1, 0
              ]
            }
          }
        }, {
          '$group': {
            '_id': {
              'month': '$month',
              'year': '$year',
              'day': '$day'
            },
            'totalOngoing': {
              '$sum': '$ongoingPayment'
            },
            'totalcompleted': {
              '$sum': '$completedPayment'
            },
            'totalpayment': {
              '$sum': '$paymentinDispute'
            },
            'FullDate': {
              '$first': '$FullDate'
            }
          }
        }, {
          '$sort': {
            'FullDate': 1
          }
        }
      ]
    ])
  }
  return JobDashboard;
}

module.exports = {
  getAdminByEmail,
  getUserById,
  updateUser,
  createUser,
  getStaffList,
  checkAdminByEmail,
  updateStaffMember,
  generateUserVerifyToken,
  verifyAuthOTP,
  getTotalRevenue,
  getTotalCommission,
  getJobDashboard
}
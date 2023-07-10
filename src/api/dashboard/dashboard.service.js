const Milestone = require("../../models/milestone.model");
const AppError = require("../../utils/AppError");
const httpStatus = require("http-status");
const { pick, get, gt } = require("lodash");
const mongoose = require("mongoose");
const Messages = require("../../utils/messages");
const ObjectId = mongoose.Types.ObjectId;
const { getQueryOptions } = require("../../utils/service.util");
const moment = require('moment');
const Customer = require("../../models/customer.model");
const Job = require("../../models/job.model");

const getCount = async (user) => {
  var currentMonth = new Date();
  let month = currentMonth.getMonth();
  let year = new Date().getFullYear();
  const milestoneCount = await Milestone.count({ userId: ObjectId(user._id) });
  const mileStoneData = await Milestone.aggregate([
    [
      {
        $match: {
          $or: [{ userId: ObjectId(user._id) }, { inviteUserId: ObjectId(user._id) }]
        },
      },
      {
        $project: {
          _id: 1,
          amount: 1,
          status: 1,
          year: {
            $cond: [
              {
                $and: [
                  {
                    $eq: [
                      {
                        $year: "$updatedAt",
                      },
                      year,
                    ],
                  },
                  {
                    $eq: ["$status", "PAYMENT_COMPLETE"],
                  },
                ],
              },
              "$amount",
              0,
            ],
          },
          month: {
            $cond: [
              {
                $and: [
                  {
                    $eq: [
                      {
                        $month: "$updatedAt",
                      },
                      month,
                    ],
                  },
                  {
                    $eq: [
                      {
                        $year: "$updatedAt",
                      },
                      year,
                    ],
                  },
                  {
                    $eq: ["$status", "PAYMENT_COMPLETE"],
                  },
                ],
              },
              "$amount",
              0,
            ],
          },
          bigAmount: {
            $cond: {
              if: {
                $or: [
                  { $eq: ["$status", "PAYMENT_IN_DEPOSITE"] },
                  { $eq: ["$status", "RELEASE_REQUESTED"] },
                  { $eq: ["$status", "PAYMENT_RELEASE"] },
                  { $eq: ["$status", "PAYMENT_COMPLETE"] }
                ]
              },
              then: "$amount",
              else: 0,

            },
          },
          totalRevenue: {
            $cond: {
              if: {
                $eq: ["$status", "PAYMENT_COMPLETE"]
              },
              then: "$amount",
              else: 0,
            },
          },

          outstandingPayment: {
            $cond: [
              {
                $or: [
                  {
                    $eq: ["$status", "WAITING_ACCEPT"],
                  },
                  {
                    $eq: ["$status", "WAITING_FUND_DEPOSITE"],
                  }
                ],
              },
              "$amount",
              0,
            ],
          },
          nextInterimPayment: {
            $cond: [
              {
                $or: [
                  { $eq: ["$status", "PAYMENT_IN_DEPOSITE"] },
                  { $eq: ["$status", "RELEASE_REQUESTED"] },
                  { $eq: ["$status", "PAYMENT_RELEASE"] },
                ],
              },
              "$amount",
              0,
            ]
          }
        }
      },
      {
        $group: {
          _id: null,
          totalRevenue: {
            $sum: "$totalRevenue",
          },
          monthWise: {
            $sum: "$month",
          },
          yearWise: {
            $sum: "$year",
          },
          BiggestPayment: {
            $max: "$bigAmount",
          },
          outstandingPayment: {
            $sum: "$outstandingPayment",
          },
          // ongoingPayment: {
          //   $sum: "$ongoingPayment",
          // },
          // completedPayment: {
          //   $sum: "$completedPayment",
          // },
          // paymentinDispute: {
          //   $sum: "$paymentinDispute",
          // },
          // totalRecord: {
          //   $sum: "$totalRecord",
          // },
          nextInterimPayment: {
            $sum: "$nextInterimPayment"
          }
        }
      }
    ]
  ]);

  const jobData = await Job.aggregate([
    {
      $match: {
        $or: [{ userId: ObjectId(user._id) }, { inviteUserId: ObjectId(user._id) }]
      }
    },
    {
      $project: {
        _id: 1,
        // amount: 1,
        // status: 1,
        ongoingPayment: {
          $cond: [
            {
              $or: [
                {
                  $eq: ["$status", "WAITING_ACCEPT"],
                },
                {
                  $eq: ["$status", "PAYMENT_REJECTED"],
                },
                {
                  $eq: ["$status", "REJECTED"],
                },
                {
                  $eq: ["$status", "WAITING_FUND_DEPOSITE"],
                },
                {
                  $eq: ["$status", "PAYMENT_IN_DEPOSITE"],
                },
                {
                  $eq: ["$status", "RELEASE_REQUESTED"],
                },
                {
                  $eq: ["$status", "PAYMENT_RELEASE"],
                },
                {
                  $eq: ["$status", "PAYMENT_COMPLETE"],
                }
              ],
            },
            1,
            0,
          ],
        },

        completedPayment: {
          $cond: [
            {
              $and: [
                {
                  $eq: ["$status", "JOB_COMPLETE"],
                },
              ],
            },
            1,
            0,
          ],
        },
        paymentinDispute: {
          $cond: [
            {
              $and: [
                {
                  $eq: ["$status", "DISPUTE"],
                },
              ],
            },
            1,
            0,
          ],
        },
        totalRecord: {
          $cond: [
            {
              $and: [
                {
                  $ne: ["$amount", 0],
                },
              ],
            },
            1,
            0,
          ],
        },
      },
    },
    {
      $group: {
        _id: null,
        ongoingPayment: {
          $sum: "$ongoingPayment",
        },
        completedPayment: {
          $sum: "$completedPayment",
        },
        paymentinDispute: {
          $sum: "$paymentinDispute",
        },
        totalRecord: {
          $sum: "$totalRecord",
        },
      },
    },
  ]);

  return { milestoneCount, jobData, mileStoneData };
};

const onGoingJob = async (req) => {
  let { role, id } = req.user;
  let param;
  if (role === 3) {
    param = {
      $and: [
        { $or: [{ userId: ObjectId(id) }, { inviteUserId: ObjectId(id) }] },
        {
          $or: [
            { status: "WAITING_FUND_DEPOSITE" },
            { status: "PAYMENT_IN_DEPOSITE" },
            { status: "RELEASE_REQUESTED" },
            { status: "PAYMENT_RELEASE" },
          ]
        }
      ]
    };
  } else {
    param = {
      $or: [
        { status: "WAITING_FUND_DEPOSITE" },
        { status: "PAYMENT_IN_DEPOSITE" },
        { status: "RELEASE_REQUESTED" },
        { status: "PAYMENT_RELEASE" },
      ]
    }
  }
  let totalJob = await Job.count(param);
  let onGoingData = await Job.aggregate([
    {
      $match: param,
    },
    { $sort: { createdAt: -1 } },
    // { $skip: parseInt(skip) },
    { $limit: 3 },
    {
      $lookup: {
        from: "customers",
        localField: "inviteUserId",
        foreignField: "_id",
        as: "customerdata",
      },
    },
    {
      $unwind: {
        path: "$customerdata",
        preserveNullAndEmptyArrays: true,
      },
    },
    {
      $addFields: {
        customerName: {
          $concat: ["$customerdata.firstName", " ", "$customerdata.lastName"],
        },
      },
    },
    {
      $lookup: {
        from: "customers",
        localField: "userId",
        foreignField: "_id",
        as: "createdBy",
      },
    },
    {
      $unwind: {
        path: "$createdBy",
        preserveNullAndEmptyArrays: true,
      },
    },
    {
      $addFields: {
        createdby: {
          $concat: ["$createdBy.firstName", " ", "$createdBy.lastName"],
        },
        businessName: "$createdBy.name",
      },
    },
    {
      $lookup: {
        from: "milestones",
        let: {
          id: "$_id",
        },
        pipeline: [
          {
            $match: {
              $expr: {
                $eq: ["$jobId", "$$id"],
              },
            },
          },
          {
            $project: {
              _id: 1,
              completedPayment: {
                $cond: [
                  {
                    $and: [
                      {
                        $eq: ["$status", "PAYMENT_COMPLETE"],
                      },
                    ],
                  },
                  1,
                  0,
                ],
              },
            },
          },
          {
            $group: {
              _id: "$$id",
              totalJob: { $sum: 1 },
              completedJob: { $sum: "$completedPayment" },
            },
          },
        ],
        as: "totalPayment",
      },
    },
    {
      $unwind: {
        path: "$totalPayment",
        preserveNullAndEmptyArrays: false,
      },
    },
    {
      $addFields: {
        totalMilestone: "$totalPayment.totalJob",
        CompletedMilestone: "$totalPayment.completedJob",
      },
    },
    {
      $project: {
        name: 1,
        totalAmount: 1,
        createdAt: 1,
        createdby: 1,
        businessName: 1,
        customerName: 1,
        totalMilestone: 1,
        CompletedMilestone: 1,
        updatedAt: 1,
      },
    },
  ]).collation({ locale: "en" });

  let respons = {
    totalJob,
    onGoingData
  };
  return respons;
};

const adminGetCount = async (req) => {
  const clientCount = await Customer.count({ isVerified: true, isEnable: false, isDeleted: false });
  const adminData = await Job.aggregate([
    {
      $project: {
        _id: 1,
        // amount: 1,
        // status: 1,
        ongoingPayment: {
          $cond: [
            {
              $or: [
                {
                  $eq: ["$status", "WAITING_ACCEPT"],
                },
                {
                  $eq: ["$status", "PAYMENT_REJECTED"],
                },
                {
                  $eq: ["$status", "REJECTED"],
                },
                {
                  $eq: ["$status", "WAITING_FUND_DEPOSITE"],
                },
                {
                  $eq: ["$status", "PAYMENT_IN_DEPOSITE"],
                },
                {
                  $eq: ["$status", "RELEASE_REQUESTED"],
                },
                {
                  $eq: ["$status", "PAYMENT_RELEASE"],
                },
                {
                  $eq: ["$status", "PAYMENT_COMPLETE"],
                }
              ],
            },
            1,
            0,
          ],
        },

        completedPayment: {
          $cond: [
            {
              $and: [
                {
                  $eq: ["$status", "JOB_COMPLETE"],
                },
              ],
            },
            1,
            0,
          ],
        },
        paymentinDispute: {
          $cond: [
            {
              $and: [
                {
                  $eq: ["$status", "DISPUTE"],
                },
              ],
            },
            1,
            0,
          ],
        },
        totalRecord: {
          $cond: [
            {
              $and: [
                {
                  $ne: ["$amount", 0],
                },
              ],
            },
            1,
            0,
          ],
        }
      }
    },
    {
      $group: {
        _id: null,
        ongoingPayment: {
          $sum: "$ongoingPayment",
        },
        completedPayment: {
          $sum: "$completedPayment",
        },
        paymentinDispute: {
          $sum: "$paymentinDispute",
        },
        totalRecord: {
          $sum: "$totalRecord",
        }
      }
    }

  ]);

  return { clientCount, adminData };
}

module.exports = {
  getCount,
  onGoingJob,
  adminGetCount
};





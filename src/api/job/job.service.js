const Job = require("../../models/job.model");
const Customer = require("../../models/customer.model");
const Milestone = require("../../models/milestone.model");
const AppError = require("../../utils/AppError");
const httpStatus = require("http-status");
const { pick, get, gt } = require("lodash");
const mongoose = require("mongoose");
const Messages = require("../../utils/messages");
const ObjectId = mongoose.Types.ObjectId;
const customerService = require("../customer/customer.service");
const authService = require("../auth/auth.service");
const emailService = require("../common/email.service");
const milestoneService = require("../milestone/milestone.service");
const { getQueryOptions, checkCommission } = require("../../utils/service.util");
const { JOBSTATUS, MILESTONESTATUS } = require('../../config/constant');

// ********************** Invited User Listing api **************************************
const getInviteUserList = async (user) => {
  const job = await Job.distinct("inviteUserId", { userId: ObjectId(user.id) });
  const userDetails = await Customer.find(
    { _id: { $in: job } },
    { firstName: 1, lastName: 1, email: 1 , company: 1 }
  );
  return userDetails;
};


// ********************** Create Job api **************************************
const createjob = async (req) => {
  const data = await customerService.getUserByIdForJob(req);
  if (!data.isRegistered) {
    let verifyToken = await authService.generateUserVerifyToken(
      data.customer._id,
      data.customer.role
    );
    // console.log(verifyToken);
    await emailService.inviteUserVerify(data.customer.email, {
      ...data.customer.toJSON(),
      customerName: `${req.user.firstName} ${req.user.lastName}`,
      token: verifyToken,
    });
  }
  delete req.body.name;
  delete req.body.email;
  req.body.userId = req.user.id;
  req.body.name = req.body.jobName;
  req.body.inviteUserId = data.customer._id;

  let saveJobs = await Job.create(req.body);
  // console.log(req.body.milestoneData)
  let saveObj = []
  req.body.milestoneData.forEach(async (milestonesdata) => {
    saveObj.push({
      jobId: ObjectId(saveJobs.id),
      title: milestonesdata.title,
      userId: req.body.userId,
      inviteUserId: req.body.inviteUserId,
      amount: milestonesdata.amount,
      isFullPayment: req.body.isFullPayment,
      status: MILESTONESTATUS.WAITING_ACCEPT,
    });
  });
  let mileStone = await Milestone.insertMany(saveObj);

  let createdBy = await customerService.getCustomerByEmail(req.user.email);
  saveJobs.createdByFirstName = createdBy.firstName
  saveJobs.createdByLastName = createdBy.lastName;
  saveJobs.totalPayment = saveObj.length;

  return saveJobs;
};


// ********************** Job Details api **************************************
const getjobdetails = async (jobId) => {
  let jobDetail = await Job.aggregate([
    {
      $match: {
        _id: ObjectId(jobId),
      },
    },
    {
      $lookup: {
        from: "customers",
        let: {
          id: "$inviteUserId",
        },
        pipeline: [
          {
            $match: {
              $expr: {
                $eq: ["$_id", "$$id"],
              },
            },
          },
        ],
        as: "customer",
      },
    },
    {
      $unwind: {
        path: "$customer",
      },
    },
    {
      $addFields: {
        customerName: {
          $concat: ["$customer.firstName", " ", "$customer.lastName"],
        },
        company: "$customer.company",
        customerEmail: "$customer.email",
        phoneNumber: "$customer.number",
        address: "$customer.address",
        dialCode: "$customer.dialCode",
        mangoPayCustomerId: "$customer.customerId",
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
        ],
        as: "milestoneDetails",
      },
    },
    {
      $project: {
        name: 1,
        status: 1,
        description: 1,
        totalAmount: 1,
        isUpdate: 1,
        serviceFee: 1,
        inviteUserId: 1,
        servicePercentage: 1,
        rejectHistory: 1,
        modificationRequestHistory: 1,
        amount: 1,
        customerName: 1,
        phoneNumber: 1,
        mangoPayCustomerId: 1,
        address: 1,
        company: 1,
        customerEmail: 1,
        dialCode: 1,
        mileStoneData: "$milestoneDetails"
      },
    },
  ]);
  return jobDetail;
};

// ********************** Job Listing api for Client **************************************
const getJobList = async (req) => {
  const { minAmount, maxAmount, status, search, adminfeesMin, adminfeesMax } = req.query;
  const { limit, skip, page, sort } = getQueryOptions(req.query);
  let { role, id } = req.user;

  let filter = {};
  // console.log("Role", role);

  let param;
  if (role == 3) {
    param = {
      userId: new ObjectId(id)
    };
  }
  else {
    param = {};
    if (adminfeesMin && adminfeesMax) {
      filter.serviceFee = {
        $gte: adminfeesMin,
        $lte: adminfeesMax,
      };
    } else {
      if (adminfeesMin) {
        filter.serviceFee = {
          $gte: adminfeesMin,
        };
      }
      if (adminfeesMax) {
        filter.serviceFee = {
          $gte: adminfeesMax,
        };
      }
    }
  }

  // console.log("Params", sort);
  let searchfilter = {};

  const searchFields = ["name", "jobFor", "createdBy"];

  if (search) {
    searchfilter["$or"] = searchFields.map((field) => ({
      [field]: { $regex: search, $options: "i" },
    }));
  }

  if (minAmount && maxAmount) {
    filter.totalAmount = {
      $gte: minAmount,
      $lte: maxAmount,
    };
  } else {
    if (minAmount) {
      filter.totalAmount = {
        $gte: minAmount,
      };
    }
    if (maxAmount) {
      filter.totalAmount = {
        $lte: maxAmount,
      };
    }
  }
  if (status) {
    filter.status = status;
  }
  let totalRecord;
  if (role == 3) {
    totalRecord = await Job.count({ userId: ObjectId(req.user._id) });
  }
  else {
    totalRecord = await Job.count();
  }

  let jobDetail = await Job.aggregate([
    {
      $match: param,
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
      },
    },
    {
      $addFields: {
        createdBy: {
          $concat: ["$createdBy.firstName", " ", "$createdBy.lastName"],
        },
      },
    },
    {
      $lookup: {
        from: "customers",
        localField: "inviteUserId",
        foreignField: "_id",
        as: "jobFor",
      },
    },
    {
      $unwind: {
        path: "$jobFor",
      },
    },
    {
      $addFields: {
        jobFor: {
          $concat: ["$jobFor.firstName", " ", "$jobFor.lastName"],
        },
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
        ],
        as: "listJob",
      },
    },
    {
      $addFields: {
        numberOfpayment: {
          $size: "$listJob",
        },
      },
    },
    {
      $project: {
        name: 1,
        createdAt: 1,
        createdBy: 1,
        jobFor: 1,
        amount: 1,
        totalAmount: 1,
        serviceFee: 1,
        status: 1,
        rejectHistory: 1,
        numberOfpayment: 1
      },
    },
    { $match: filter },
    { $match: searchfilter },
    { $sort: sort },
    { $skip: parseInt(skip) },
    { $limit: parseInt(limit) }
  ]).collation({ locale: "en" });

  // console.log("Job Details", jobDetail);
  QueryResult = jobDetail.length;
  let response = { jobDetail, totalRecord, QueryResult };
  return response;
};

// ********************** Job Listing api for Customer **************************************
const getInvitedList = async (req) => {
  const { minAmount, maxAmount, status, search } = req.query;
  const { limit, skip, page, sort } = getQueryOptions(req.query);

  let filter = {};
  let searchfilter = {};

  filter = { inviteUserId: new ObjectId(req.user._id) };
  const searchFields = ["name", "customerName", "companyName.name"];

  if (search) {
    searchfilter["$or"] = searchFields.map((field) => ({
      [field]: { $regex: search, $options: "i" },
    }));
  }

  if (status) {
    filter.status = status;
  }
  console.log(searchfilter);
  let totalRecord = await Job.count({ inviteUserId: ObjectId(req.user._id) });
  let jobDetail = await Job.aggregate([
    [
      {
        $match: filter,
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
          ],
          as: "listJob",
        },
      },
      {
        $lookup: {
          from: "customers",
          let: {
            id: "$userId",
          },
          pipeline: [
            {
              $match: {
                $expr: {
                  $eq: ["$_id", "$$id"],
                },
              },
            },
          ],
          as: "UserData",
        },
      },
      {
        $unwind: {
          path: "$UserData",
        },
      },
      {
        $addFields: {
          customerName: {
            $concat: ["$UserData.firstName", " ", "$UserData.lastName"],
          },
        },
      },
      {
        $addFields: {
          companyName: "$UserData.company"
        },
      },
      {
        $addFields: {
          numberOfpayment: {
            $cond: {
              if: {
                $isArray: "$listJob",
              },
              then: {
                $size: "$listJob",
              },
              else: "NA",
            },
          },
        },
      },
      {
        $addFields: {
          numberOfpayment: {
            $cond: {
              if: {
                $isArray: "$listJob",
              },
              then: {
                $size: "$listJob",
              },
              else: "NA",
            },
          },
        },
      },
      { $match: searchfilter },
      { $sort: sort },
      { $skip: parseInt(skip) },
      { $limit: parseInt(limit) },
      {
        $project: {
          name: 1,
          customerName: 1,
          companyName: 1,
          totalAmount: 1,
          numberOfpayment: 1,
          status: 1,
          rejectHistory: 1
        },
      },
    ],
  ]);
  QueryResult = jobDetail.length;
  let response = { jobDetail, totalRecord, QueryResult };
  return response;
};

// ********************** Job Accepted api for Customer **************************************
const jobAccepted = async (req) => {
  let { jobId } = req.params;
  const data = await jobUpdate(jobId, { status: JOBSTATUS.WAITING_FUND_DEPOSITE })
  const mileStoneData = await milestoneService.updateStatus(jobId, { status: MILESTONESTATUS.WAITING_FUND_DEPOSITE })

  return data;
}

// ********************** Get Job By Id api **************************************
const getJobById = async (jobId) => {
  const job = await Job.findById(jobId);
  if (!job) {
    throw new AppError(httpStatus.NOT_FOUND, Messages.JOB_ID_NOT_FOUND);
  }
  return job;
};

// ********************** Job Update api **************************************
const jobUpdate = async (jobId, updateBody) => {
  const jobs = await getJobById(jobId);

  Object.assign(jobs, updateBody);
  await jobs.save();
  return jobs;
}

// ********************** Job Update & Push api **************************************
const jobUpdateAndPush = async (jobId, updatedStatus, pushData) => {
  const jobs = await getJobById(jobId);

  const updatedData = Job.findOneAndUpdate({ _id: ObjectId(jobId) }, { "$push": pushData, "$set": updatedStatus }, { useFindAndModify: false })
  return updatedData
}

// ********************** Job Push api **************************************
const jobPush = async (jobId, pushData) => {
  const jobs = await getJobById(jobId);

  const puseData = Job.update({ _id: ObjectId(jobId) }, { "$push": pushData })
  return jobs
}


// ********************** Job Rejected api for Customer **************************************
const jobRejected = async (req) => {
  let { jobId } = req.params;
  let { reason } = req.body;
  const data = await jobUpdateAndPush(jobId, { status: JOBSTATUS.REJECTED }, { rejectHistory: reason })
  await milestoneService.updateStatus(jobId, { status: MILESTONESTATUS.REJECTED })
  return data;
}

// ********************** Modification save api for Client **************************************
const confirmJobAmount = async (req, userData) => {

  let commissionAmount = await checkCommission(req.body.totalAmount, userData)
  req.body.serviceFee = commissionAmount.serviceFee
  req.body.amount = commissionAmount.amount
  req.body.isUpdate = false
  if (!req.body.isModification) {
    req.body.status = JOBSTATUS.WAITING_ACCEPT
  }
  // console.log(req.body.isModification)
  // console.log(req.body)
  const data = await jobUpdate(req.params.jobId, req.body)
  if (!req.body.isModification) {
    const mileStoneData = await milestoneService.updateStatus(req.params.jobId, { status: MILESTONESTATUS.WAITING_ACCEPT })
  }

  return data
}
module.exports = {
  getInviteUserList,
  createjob,
  getjobdetails,
  getJobList,
  getInvitedList,
  jobAccepted,
  getJobById,
  jobUpdate,
  jobRejected,
  jobUpdateAndPush,
  confirmJobAmount,
  jobPush
};

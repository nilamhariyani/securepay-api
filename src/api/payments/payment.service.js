const Job = require("../../models/job.model");
const Milestone = require("../../models/milestone.model");
const Customer = require("../../models/customer.model");
const PaymentHistory = require("../../models/payment.history.model");
const AppError = require("../../utils/AppError");
const httpStatus = require("http-status");
const { pick, get, gt, isEmpty } = require("lodash");
const mongoose = require("mongoose");
const Messages = require("../../utils/messages");
const ObjectId = mongoose.Types.ObjectId;
const { PAYMENT_TYPE, MILESTONESTATUS, JOBSTATUS } = require('../../config/constant');

const emailService = require("../common/email.service");
const mangopayService = require('../common/mangopay.service')
const trueLayerService = require('../common/truelayer.service')
const milestoneService = require('../milestone/milestone.service')
const jobService = require('../job/job.service')
const customerService = require('../customer/customer.service')

const { getQueryOptions } = require("../../utils/service.util");

const pubnubService = require("../common/pubnub.service");
const { TITLE, DESC } = require('../../config/notification');
const twiloService = require('../common/twilo.service');

// ********************************************** Escrow Payment by customer with bank **********************************************
const escrowPaymentsWithBank = async (req) => {


  const milestones = await Milestone.findOne({ _id: ObjectId(req.body.mileStoneId) });
  const jobs = await Job.findOne({ _id: ObjectId(milestones.jobId) });
  const customers = await Customer.findOne({ _id: ObjectId(milestones.inviteUserId) });
  const clients = await Customer.findOne({ _id: ObjectId(milestones.userId) });



  let DeclaredDebitedFunds = milestones.amount;
  let DeclaredFees = milestones.amount * jobs.servicePercentage / 100;
  // let finalAmount = DeclaredDebitedFunds + DeclaredFees
  // if (req.body.paymentType === PAYMENT_TYPE.BANK) {
  // let param = {
  //   "AuthorId": customers.customerId,
  //   "DeclaredDebitedFunds": {
  //     "Currency": "GBP",
  //     "Amount": DeclaredDebitedFunds * 100
  //   },
  //   "DeclaredFees": {
  //     "Currency": "GBP",
  //     "Amount": 0
  //   },
  //   "CreditedWalletId": customers.walletId,
  //   "Tag": `Escrow for job ${jobs.name} and milestone ${milestones.title}`
  // }

  // let paymentData = await mangopayService.payinByBankWire(param);

  // let token = await trueLayerService.generateTrueLayerToken()
  // let authToken = `${token.token_type} ${token.access_token}`

  // if (authToken) {
  //   let iban = paymentData.BankAccount.IBAN
  //   let tempIbn = iban.substr(iban.length - 14);
  //   let sort_code = tempIbn.substr(0, 6);
  //   let account_number = iban.substr(iban.length - 8);

  //   let bodyData = {
  //     "amount": DeclaredDebitedFunds * 100,
  //     "currency": "GBP",
  //     "beneficiary_name": clients.firstName + ' ' + clients.lastName,
  //     "beneficiary_reference": paymentData.WireReference,
  //     "beneficiary_sort_code": sort_code,
  //     "beneficiary_account_number": account_number,
  //     "remitter_reference": Math.random().toString(36).replace(/[^a-z]+/g, '').substr(0, 8),
  //     "redirect_uri": `${process.env.HOST}/payments/details`
  //   }
  //   let payment = await trueLayerService.singleImmediatePayment(bodyData, authToken)
  //   console.log("payment", payment)
  // await milestoneService.milestoneUpdate(req.body.mileStoneId, { escrowDetails: { id: 'paymentData.Id', date: new Date(), paymentType: req.body.paymentType, wireReference: 'paymentData.WireReference', status: paymentData.Status, totalAmount: DeclaredDebitedFunds } });
  await milestoneService.milestoneUpdate(req.body.mileStoneId, { status: JOBSTATUS.PAYMENT_IN_DEPOSITE, escrowDetails: { id: 'paymentData.Id', date: new Date(), paymentType: req.body.paymentType, wireReference: 'paymentData.WireReference', status: JOBSTATUS.PAYMENT_IN_DEPOSITE, totalAmount: DeclaredDebitedFunds } });
  await jobService.jobUpdate(milestones.jobId, { status: JOBSTATUS.PAYMENT_IN_DEPOSITE });
  return

  // }

}
// ********************************************** Escrow Payment by customer with card **********************************************

const escrowPaymentsWithCard = async (req) => {

  const milestones = await Milestone.findOne({ _id: ObjectId(req.body.mileStoneId) });
  const jobs = await Job.findOne({ _id: ObjectId(milestones.jobId) });
  const customers = await Customer.findOne({ _id: ObjectId(milestones.inviteUserId) });
  const client = await Customer.findOne({ _id: ObjectId(milestones.userId) }, { firstName: 1, lastName: 1, email: 1, number: 1, dialCode: 1 });

  let DeclaredDebitedFunds = milestones.amount;
  let DeclaredFees = milestones.amount * jobs.servicePercentage / 100;
  // let finalAmount = DeclaredDebitedFunds + DeclaredFees
  let param = {
    "AuthorId": customers.customerId,
    "DebitedFunds": {
      "Currency": "GBP",
      "Amount": DeclaredDebitedFunds * 100
    },
    "Fees": {
      "Currency": "GBP",
      "Amount": 0
    },
    "CreditedWalletId": customers.walletId,
    "SecureModeReturnURL": `${process.env.HOST}/payments/details`,
    "SecureMode": "DEFAULT",
    "SecureModeNeeded": milestones.amount >= 50,
    "CardID": req.body.cardId,
    "Tag": `Escrow for job ${jobs.name} and milestone ${milestones.title}`,
    "StatementDescriptor": `Yatapay`
  }
  console.log(param)
  // let paymentData = await mangopayService.payinByCard(param);
  // console.log(paymentData)



  let mileStonestatus = (paymentData.Status === 'FAILED' ? MILESTONESTATUS.PAYMENT_REJECTED : MILESTONESTATUS.PAYMENT_IN_DEPOSITE);
  let Jobstatus = (paymentData.Status === 'FAILED' ? JOBSTATUS.PAYMENT_REJECTED : JOBSTATUS.PAYMENT_IN_DEPOSITE);

  await milestoneService.milestoneUpdate(req.body.mileStoneId, { status: mileStonestatus, escrowDetails: { id: paymentData.Id, date: new Date(), paymentType: req.body.paymentType, wireReference: paymentData.CardId, status: paymentData.Status, totalAmount: DeclaredDebitedFunds } });

  const inDispute = await checkMilestoneinDispute(milestones.jobId);
  if (inDispute === -1) {
    await jobService.jobUpdate(milestones.jobId, { status: Jobstatus });
  }
  // await customerService.updateUser(customers._id, { mangopayCardId: paymentData.CardId });

  if (paymentData.Status === 'FAILED') {
    throw new AppError(httpStatus.NOT_FOUND, paymentData.ResultMessage);
  } else {

    await emailService.escrowPayment(client.email, {
      clientName: client.firstName + ' ' + client.lastName,
      jobName: jobs.name,
      mileStoneName: milestones.title,
      amount: milestones.amount,
      status: 'Payment In Deposit Box'
    });

    let des = DESC.PAYMENT_STAGE_UPDATED.replace('$', jobs.name).replace('#', 'Payment In Deposit Box');

    // if (client.number && client.dialCode) {
    //   let toMobile = "+" + client.dialCode + "" + client.number
    //   let body = des
    //   await twiloService.sendSms(toMobile, body)
    // }

    pubnubService.sendNotification(client._id, { title: TITLE.PAYMENT_STAGE_UPDATED, description: des })

    return paymentData
  }
}
// ********************************************** Payment Release by customer **********************************************

const paymentReleases = async (req) => {
  const milestones = await Milestone.findOne({ _id: ObjectId(req.body.mileStoneId) });
  const jobs = await Job.findOne({ _id: ObjectId(milestones.jobId) });
  const customers = await Customer.findOne({ _id: ObjectId(milestones.inviteUserId) });
  const client = await Customer.findOne({ _id: ObjectId(milestones.userId) });

  // let kycStatus = await mangopayService.getKYCStatus(client.kycDocsId);
  // console.log(kycStatus)
  let DeclaredDebitedFunds = milestones.amount;
  let DeclaredFees = milestones.amount * jobs.servicePercentage / 100;
  let finalAmount = DeclaredDebitedFunds - DeclaredFees;
  let params = {
    "AuthorId": customers.customerId,
    "DebitedFunds": {
      "Currency": "GBP",
      "Amount": finalAmount * 100
    },
    "Fees": {
      "Currency": "GBP",
      "Amount": 0
    },
    "DebitedWalletId": customers.walletId,
    "CreditedWalletId": client.walletId,
    "Tag": `Payment release for job ${jobs.name} and milestone ${milestones.title}`
  }
  // console.log(params)
  // let releaseData = await mangopayService.paymentTransfer(params);
  // if (releaseData.Status === "FAILED") {
  //   throw new AppError(httpStatus.UNPROCESSABLE_ENTITY, releaseData.ResultMessage);
  // } else {
  let payoutParams = {
    "AuthorId": client.customerId,
    "DebitedFunds": {
      "Currency": "GBP",
      "Amount": finalAmount * 100
    },
    "Fees": {
      "Currency": "GBP",
      "Amount": 0
    },
    "BankAccountId": client.bankId,
    "DebitedWalletId": client.walletId,
    // "CreditedWalletId": client.walletId,
    // "Tag": `Payment payout for job ${jobs.name} and milestone ${milestones.title}`
  }

  // let payoutData = await mangopayService.payOutInBank(payoutParams);
  // if (payoutData.Status === 'FAILED') {
  //   throw new AppError(httpStatus.NOT_FOUND, payoutData.ResultMessage);
  // } else {

  let mileStoneDetails = await milestoneService.getMilestoneByJobId(milestones.jobId);
  let resultData = mileStoneDetails.filter((value) => {
    return value.status === 'WAITING_FUND_DEPOSITE';
  });

  await milestoneService.milestoneUpdate(req.body.mileStoneId, { status: MILESTONESTATUS.PAYMENT_COMPLETE, paymentPayoutId: 'payoutData.Id', paymentReleaseId: 'releaseData.Id', paymentReleaseDate: new Date() });
  let param = {
    jobId: milestones.jobId,
    milestoneId: req.body.mileStoneId,
    milestoneId: req.body.mileStoneId,
    totalAmount: finalAmount,
    adminFees: DeclaredFees

  }
  await PaymentHistory.create(param);
  let des;
  let fullMilestone;
  if (resultData.length > 0) {
    fullMilestone = false
    const inDispute = await checkMilestoneinDispute(milestones.jobId);
    if (inDispute === -1) {
      await jobService.jobUpdate(milestones.jobId, { status: JOBSTATUS.PAYMENT_COMPLETE });
    }
    des = DESC.PAYMENT_STAGE_UPDATED.replace('$', jobs.name).replace('#', 'Waiting For Client to Fund Next Payment Stage');
  } else {
    fullMilestone = true
    await jobService.jobUpdate(milestones.jobId, { status: JOBSTATUS.JOB_COMPLETE });
    des = DESC.PAYMENT_STAGE_UPDATED.replace('$', jobs.name).replace('#', 'Job completed');
  }

  let data = { milestoneName: milestones.title, jobName: jobs.name, clientEmail: client.email, customerName: customers.firstName + ' ' + customers.lastName, clientName: client.firstName + ' ' + client.lastName };

  await emailService.paymentRelease(data.clientEmail, data);

  // if (client.number && client.dialCode) {
  //   let toMobile = "+" + client.dialCode + "" + client.number
  //   let body = des
  //   await twiloService.sendSms(toMobile, body)
  // }

  pubnubService.sendNotification(client._id, { title: TITLE.PAYMENT_STAGE_UPDATED, description: des });

  return { data, fullMilestone };
  // }
  // }
}

// ********************************************** Get Payment success confirm by truelayer  **********************************************

const getTrueLayerStatus = async (req) => {
  let token = await trueLayerService.generateTrueLayerToken()
  let authToken = `${token.token_type} ${token.access_token}`
  let statusData = await trueLayerService.getPaymentStatus(req.query.paymentId, authToken)
  // console.log(statusData)
  let mileStonestatus = MILESTONESTATUS.PAYMENT_IN_DEPOSITE;
  let Jobstatus = JOBSTATUS.PAYMENT_IN_DEPOSITE;
  // console.log(statusData.results[0].status)
  if (statusData.results[0].status === 'cancelled' || statusData.results[0].status === 'new') {
    throw new AppError(httpStatus.NOT_FOUND, Messages.PAYMENT_CANCEL);
  } else {

    if (statusData.results[0].status === "rejected") {
      throw new AppError(httpStatus.NOT_FOUND, Messages.PAYMENT_FAILED);
    } else {
      let milestones = await milestoneService.milestoneUpdate(req.query.mileStoneId, { status: mileStonestatus, trueLayerDetails: { paymentId: statusData.results[0].simp_id, date: new Date(), status: statusData.results[0].status } });

      const inDispute = await checkMilestoneinDispute(req.query.jobId);
      let jobs;
      if (inDispute === -1) {
        jobs = await jobService.jobUpdate(req.query.jobId, { status: Jobstatus });
      } else {
        jobs = await Job.findOne({ _id: req.query.jobId });
      }

      const client = await Customer.findOne({ _id: ObjectId(milestones.userId) }, { firstName: 1, lastName: 1, email: 1, number: 1, dialCode: 1 });

      await emailService.escrowPayment(client.email, {
        clientName: client.firstName + ' ' + client.lastName,
        jobName: jobs.name,
        mileStoneName: milestones.title,
        amount: milestones.amount,
        status: 'Payment In Deposit Box'
      });

      let des = DESC.PAYMENT_STAGE_UPDATED.replace('$', jobs.name).replace('#', 'Payment In Deposit Box')

      if (client.number && client.dialCode) {
        let toMobile = "+" + client.dialCode + "" + client.number
        let body = des
        await twiloService.sendSms(toMobile, body)
      }

      pubnubService.sendNotification(client._id, { title: TITLE.PAYMENT_STAGE_UPDATED, description: des })

      return statusData.results[0].status;
    }
  }
}
const paymentReleaseRequests = async (req) => {
  const milestones = await Milestone.findOne({ _id: ObjectId(req.query.mileStoneId) });
  const client = await Customer.findOne({ _id: ObjectId(milestones.userId) });
  const customer = await Customer.findOne({ _id: ObjectId(milestones.inviteUserId) });
  let data = await milestoneService.milestoneUpdate(req.query.mileStoneId, { status: MILESTONESTATUS.RELEASE_REQUESTED });
  const inDispute = await checkMilestoneinDispute(milestones.jobId);
  let jobDetails;
  if (inDispute === -1) {
    jobDetails = await jobService.jobUpdate(milestones.jobId, { status: JOBSTATUS.RELEASE_REQUESTED });
  } else {
    jobDetails = await Job.findOne({ _id: milestones.jobId });
  }

  let response = { milestoneName: data.title, jobName: jobDetails.name, customerEmail: customer.email, customerName: customer.firstName + ' ' + customer.lastName, clientName: client.firstName + ' ' + client.lastName };

  await emailService.paymentReleaseRequest(response.customerEmail, response);

  let des = DESC.PAYMENT_STAGE_UPDATED.replace('$', response.jobName).replace('#', 'Payment Release Requested');

  // if (customer.number && customer.dialCode) {
  //   let toMobile = "+" + customer.dialCode + "" + customer.number
  //   let body = des
  //   await twiloService.sendSms(toMobile, body)
  // }

  pubnubService.sendNotification(customer._id, { title: TITLE.PAYMENT_STAGE_UPDATED, description: des });

  return response;
  // if (client.bankId) {

  //   let kycStatus = await mangopayService.getKYCStatus(client.kycDocsId);
  //   // console.log(kycStatus)
  //   if (kycStatus.Status === 'VALIDATION_ASKED') {
  //     throw new AppError(httpStatus.NOT_FOUND, Messages.KYC_IN_PROGRESS);

  //   } else if (kycStatus.Status === 'REFUSED') {
  //     throw new AppError(httpStatus.NOT_FOUND, Messages.KYC_REFUSED);
  //   } else {

  //     let data = await milestoneService.milestoneUpdate(req.query.mileStoneId, { status: MILESTONESTATUS.RELEASE_REQUESTED });
  //     const inDispute = await checkMilestoneinDispute(milestones.jobId);
  //     let jobDetails;
  //     if (inDispute === -1) {
  //       jobDetails = await jobService.jobUpdate(milestones.jobId, { status: JOBSTATUS.RELEASE_REQUESTED });
  //     } else {
  //       jobDetails = await Job.findOne({ _id: milestones.jobId });
  //     }

  //     let response = { milestoneName: data.title, jobName: jobDetails.name, customerEmail: customer.email, customerName: customer.firstName + ' ' + customer.lastName, clientName: client.firstName + ' ' + client.lastName };

  // await emailService.paymentReleaseRequest(response.customerEmail, response);

  //     let des = DESC.PAYMENT_STAGE_UPDATED.replace('$', response.jobName).replace('#', 'Payment Release Requested');

  //     if (customer.number && customer.dialCode) {
  //       let toMobile = "+" + customer.dialCode + "" + customer.number
  //       let body = des
  //       await twiloService.sendSms(toMobile, body)
  //     }

  //     pubnubService.sendNotification(customer._id, { title: TITLE.PAYMENT_STAGE_UPDATED, description: des });

  //     return response;
  //   }

  // } else {
  //   throw new AppError(httpStatus.NOT_FOUND, Messages.BANK_NOT_FOUND);
  // }
}

const getPaymentHistory = async (req) => {
  const { search, minAmount, maxAmount, minFees, maxFees, startDate, endDate } = req.query;
  const { limit, skip, page, sort } = getQueryOptions(req.query);
  // let { id, role } = req.user;


  // ***************************** Search started **********************
  let searchfilter = {};

  const searchFields = ["jobName", "createdBy", "jobFor", "mileStoneTitle", "paymentReleaseId"];

  if (search) {
    searchfilter["$or"] = searchFields.map((field) => ({
      [field]: { $regex: search, $options: "i" },
    }));
  }
  // ***************************** Search Ended **********************

  // **************************** Filter by Status started ************************
  // if (status) {
  //     searchfilter.status = status;
  // }
  // **************************** Filter by Status ended ************************

  // ***************************** Filter By MinAmount & MaxAmount strated *************************
  if (minAmount && maxAmount) {
    searchfilter.totalAmount = {
      $gte: Number(minAmount),
      $lte: Number(maxAmount),
    };
  } else {
    if (minAmount) {
      searchfilter.totalAmount = {
        $gte: Number(minAmount)
      };
    }
    if (maxAmount) {
      searchfilter.totalAmount = {
        $gte: Number(maxAmount),
      };
    }
  }
  if (minFees && maxFees) {
    searchfilter.adminFees = {
      $gte: Number(minFees),
      $lte: Number(maxFees)
    };
  } else {
    if (minFees) {
      searchfilter.adminFees = {
        $gte: Number(minFees)
      };
    }
    if (maxFees) {
      searchfilter.adminFees = {
        $gte: Number(maxFees)
      };
    }
  }
  let start = startDate + ' 00:00:00';
  let end = endDate + ' 23:59:59';
  console.log(start)
  console.log(end)
  if (startDate && endDate) {
    searchfilter.paymentReleaseDate = {
      $gte: new Date(start),
      $lte: new Date(end),
    };
  } else {
    if (startDate) {
      searchfilter.paymentReleaseDate = {
        $gte: new Date(start),
      };
    }
    if (endDate) {
      searchfilter.paymentReleaseDate = {
        $lte: new Date(end),
      };
    }
  }
  // ***************************** Filter By MinAmount & MaxAmount Date Ended *************************
  console.log(searchfilter, '-----------')
  let totalRecord = await PaymentHistory.count(searchfilter);
  let paymentHistoryData = await PaymentHistory.aggregate([
    {
      $lookup: {
        from: "jobs",
        let: { jobId: "$jobId", },
        pipeline: [
          {
            $match: {
              $expr: {
                $or: [
                  { $eq: ["$_id", "$$jobId"] }
                ]
              }
            }
          },
          {
            $lookup: {
              from: "customers",
              let: { userId: "$userId", },
              as: "client",
              pipeline: [
                {
                  $match: {
                    $expr: {
                      $and: [
                        { $eq: ["$_id", "$$userId"] }
                      ]
                    }
                  }
                },
                {
                  $project: {
                    firstName: 1,
                    lastName: 1
                  }
                }

              ]
            }
          },
          {
            $lookup: {
              from: "customers",
              let: { inviteUserId: "$inviteUserId", },
              as: "customer",
              pipeline: [
                {
                  $match: {
                    $expr: {
                      $and: [
                        { $eq: ["$_id", "$$inviteUserId"] }
                      ]
                    }
                  }
                },
                {
                  $project: {
                    firstName: 1,
                    lastName: 1
                  }
                }

              ]
            }
          },
          {
            $unwind: {
              path: "$client",
              preserveNullAndEmptyArrays: true
            },
          },
          {
            $addFields: {
              createdBy: {
                $concat: ["$client.firstName", " ", "$client.lastName"],
              }
            },
          },
          {
            $unwind: {
              path: "$customer",
              preserveNullAndEmptyArrays: true
            },
          },
          {
            $addFields: {
              jobFor: {
                $concat: ["$customer.firstName", " ", "$customer.lastName"],
              }
            },
          },
          {
            $project: {
              name: 1,
              createdBy: '$createdBy',
              jobFor: '$jobFor'

            }
          }
        ],
        as: "jobs",
      },
    },
    {
      $unwind: {
        path: "$jobs",
      },
    },
    {
      $lookup: {
        from: "milestones",
        let: { milestoneId: "$milestoneId", },
        pipeline: [
          {
            $match: {
              $expr: {
                $or: [
                  { $eq: ["$_id", "$$milestoneId"] }
                ]
              }
            }
          },
          {
            $project: {
              title: 1,
              escrowDetails: 1,
              paymentReleaseDate: 1,
              paymentReleaseId: 1
            }
          }
        ],
        as: "milestone",
      },
    },
    {
      $unwind: {
        path: "$milestone",
      },
    },
    {
      $project: {

        totalAmount: 1,
        adminFees: 1,
        jobName: '$jobs.name',
        createdBy: '$jobs.createdBy',
        jobFor: '$jobs.jobFor',
        mileStoneTitle: '$milestone.title',
        escrowDate: '$milestone.escrowDetails.date',
        paymentReleaseDate: '$milestone.paymentReleaseDate',
        paymentReleaseId: '$milestone.paymentReleaseId'
      }
    },
    { $match: searchfilter },
    { $sort: sort },
    { $skip: parseInt(skip) },
    { $limit: parseInt(limit) }

  ]).collation({ locale: "en" });

  return { paymentHistoryData, totalRecord };
}

const checkMilestoneinDispute = async (jobId) => {
  const milestones = await Milestone.find({ jobId: ObjectId(jobId) });
  // console.log(milestones);
  let index = milestones.findIndex((pre) => pre.status === MILESTONESTATUS.DISPUTE);
  console.log(index);
  return index;
}
module.exports = {
  escrowPaymentsWithBank,
  paymentReleases,
  getTrueLayerStatus,
  escrowPaymentsWithCard,
  paymentReleaseRequests,
  getPaymentHistory,
  checkMilestoneinDispute
};

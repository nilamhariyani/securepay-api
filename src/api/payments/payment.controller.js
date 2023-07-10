const httpStatus = require("http-status");
const catchAsync = require("../../utils/catchAsync");
const createResponse = require("../../utils/response");
const Messages = require("../../utils/messages");
const paymentService = require("./payment.service");
const trueLayerService = require("../common/truelayer.service");
const emailService = require("../common/email.service");

const escrowPaymentsWithBank = catchAsync(async (req, res) => {
  const data = await paymentService.escrowPaymentsWithBank(req)
  createResponse(res, httpStatus.OK, Messages.PAYMENT_ESCROW, data);
});
const escrowPaymentsWithCard = catchAsync(async (req, res) => {
  const data = await paymentService.escrowPaymentsWithCard(req)
  createResponse(res, httpStatus.OK, Messages.PAYMENT_ESCROW, data);
});
const paymentRelease = catchAsync(async (req, res) => {
  const data = await paymentService.paymentReleases(req);

  createResponse(res, httpStatus.OK, data.fullMilestone ? Messages.PAYMENT_RELEASE_COMPLETED : Messages.PAYMENT_RELEASE, data.data);
});

const getTrueLayerStatus = catchAsync(async (req, res) => {
  await paymentService.getTrueLayerStatus(req)
  createResponse(res, httpStatus.OK, Messages.PAYMENT_ESCROW, {});
});

const paymentReleaseRequest = catchAsync(async (req, res) => {
  let response = await paymentService.paymentReleaseRequests(req)
  createResponse(res, httpStatus.OK, Messages.PAYMENT_RELEASE_REQUEST, {});
})

const getPaymentHistory = catchAsync(async (req, res) => {
  let data = await paymentService.getPaymentHistory(req)
  createResponse(res, httpStatus.OK, Messages.PAYMENT_HISTORY, data);
})

module.exports = {
  escrowPaymentsWithBank,
  paymentRelease,
  getTrueLayerStatus,
  escrowPaymentsWithCard,
  paymentReleaseRequest,
  getPaymentHistory
};
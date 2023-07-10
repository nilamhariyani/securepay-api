const httpStatus = require("http-status");
const catchAsync = require("../../utils/catchAsync");
const createResponse = require("../../utils/response");
const Messages = require("../../utils/messages");
const dashboardService = require("./dashboard.service");

const getCount = catchAsync(async (req, res) => {
    const dashboardData = await dashboardService.getCount(req.user);
    createResponse(res, httpStatus.OK, Messages.DASHBOARD_DATA_FETHCED, dashboardData);
});

const onGoingJob = catchAsync(async (req, res) => {
  const letestongoing = await dashboardService.onGoingJob(req);
  createResponse(res, httpStatus.OK, Messages.ONGOING_PAYMENT, letestongoing);
});

const adminGetCount = catchAsync(async (req, res) => {
  const adminDashboardData = await dashboardService.adminGetCount(req);
  createResponse(res, httpStatus.OK, Messages.ADMIN_DASHBOARD_DATA_FETHCED, adminDashboardData);
});

module.exports = {
  getCount,
  onGoingJob,
  adminGetCount
};
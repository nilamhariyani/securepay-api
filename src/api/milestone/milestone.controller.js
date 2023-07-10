const httpStatus = require("http-status");
const catchAsync = require("../../utils/catchAsync");
const createResponse = require("../../utils/response");
const Messages = require("../../utils/messages");
const milestoneService = require("./milestone.service");
const jobService = require("../job/job.service");

const deleteMilestone = catchAsync(async (req, res) => {
    let result = await milestoneService.deleteMilestone(req.params.milestoneId);
    // console.log(result)
    await jobService.jobUpdate(result.jobId, { isUpdate: true });
    createResponse(res, httpStatus.OK, Messages.MILESTONE_DELETE, {});
});
const updateMilestone = catchAsync(async (req, res) => {
    let result = await milestoneService.milestoneUpdate(req.params.milestoneId, req.body);
    await jobService.jobUpdate(result.jobId, { isUpdate: true });
    createResponse(res, httpStatus.OK, Messages.MILESTONE_UPDATE, {});
});
const addMilestone = catchAsync(async (req, res) => {
    const job = await jobService.getJobById(req.body.jobId);
    let result = await milestoneService.addMilestones(req.body, job);
    await jobService.jobUpdate(req.body.jobId, { isUpdate: true });
    createResponse(res, httpStatus.OK, Messages.MILESTONE_ADDED, {});
});

module.exports = {
    deleteMilestone,
    updateMilestone,
    addMilestone
};

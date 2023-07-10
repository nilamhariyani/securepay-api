
const Milestone = require("../../models/milestone.model");
const Job = require("../../models/job.model");
const AppError = require("../../utils/AppError");
const httpStatus = require("http-status");
const { pick, get } = require("lodash");
const mongoose = require("mongoose");
const Messages = require("../../utils/messages");
const { JOBSTATUS } = require('../../config/constant');
const { json } = require("express");
const ObjectId = mongoose.Types.ObjectId;


const updateStatus = async (jobId, updatedBody) => {
    let updatedData = await Milestone.updateMany({ jobId: ObjectId(jobId) }, { $set: updatedBody })
    return updatedData;
}
const deleteMilestone = async (milestoneId) => {
    let deletedData = await Milestone.findOneAndDelete({ _id: ObjectId(milestoneId) })
    return deletedData;
}
const getMilestoneById = async (jobId) => {
    const milestone = await Milestone.findById(jobId);
    if (!milestone) {
        throw new AppError(httpStatus.NOT_FOUND, Messages.JOB_ID_NOT_FOUND);
    }
    return milestone;
};
const getMilestoneByJobId = async (jobId) => {
    const milestone = await Milestone.find({ jobId: ObjectId(jobId) });
    if (!milestone) {
        throw new AppError(httpStatus.NOT_FOUND, Messages.JOB_ID_NOT_FOUND);
    }
    return milestone;
};
const milestoneUpdate = async (milestoneId, updateBody) => {
    const milestones = await getMilestoneById(milestoneId);

    Object.assign(milestones, updateBody);
    await milestones.save();
    console.log("milestones :::", updateBody)
    return milestones;
}
const addMilestones = async (body, job) => {
    // console.log(job)
    let param = {
        status: job.status === JOBSTATUS.WAITING_ACCEPT ? JOBSTATUS.WAITING_ACCEPT : job.status === JOBSTATUS.REJECTED ? JOBSTATUS.REJECTED : JOBSTATUS.WAITING_FUND_DEPOSITE,
        jobId: body.jobId,
        title: body.title,
        description: body.description,
        completionDate: body.completionDate,
        amount: body.amount,
        userId: job.userId,
        inviteUserId: job.inviteUserId,
        isFullPayment: false
    }

    const milestones = await Milestone.create(param)
    return milestones;

}
module.exports = {
    updateStatus,
    deleteMilestone,
    getMilestoneById,
    milestoneUpdate,
    addMilestones,
    getMilestoneByJobId
};

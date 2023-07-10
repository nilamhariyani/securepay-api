
const DisputeTicket = require("../../models/dispute.model");
// const SupportComment = require("../../models/support.comment.model");
const Admin = require('../../models/admin.model');
const AppError = require("../../utils/AppError");
const httpStatus = require("http-status");
const { pick, get, gt } = require("lodash");
const mongoose = require("mongoose");
const Messages = require("../../utils/messages");
const cloudinaryService = require('../common/cloudinary.service')
const milestoneService = require('../milestone/milestone.service')
const jobService = require('../job/job.service');
const ObjectId = mongoose.Types.ObjectId;
const { getQueryOptions, checkCommission } = require("../../utils/service.util");
const { MILESTONESTATUS, JOBSTATUS } = require('../../config/constant');
const adminService = require('../admin/admin.service');
const { getRandomStaff } = require('../common/common.service');


const createDisputeTicket = async (req) => {
    // let staff = await Admin.findOne({ role: 2 })
    let staff = await getRandomStaff('DISPUTE');
    req.body.staffId = staff._id
    req.body.userId = req.user.id;


    if (req.files.length > 0) {
        let tempImg = [];
        let disputeData = req.files.map(async (file) => {

            let url = await cloudinaryService.uploadOnCloudinary(file.path, file.originalname);
            let imageURL = url.secure_url.split('/upload');
            // return imageURL[1]
            tempImg.push(imageURL[1])
            if (tempImg.length === req.files.length) {
                req.body.images = tempImg;
                const raised = await DisputeTicket.create(req.body);
                await adminService.updateUser(staff._id, { disputeCount: staff.disputeCount + 1 })
                const data = await milestoneService.milestoneUpdate(req.body.milestoneId, { status: MILESTONESTATUS.DISPUTE });
                await jobService.jobUpdate(req.body.jobId, { status: JOBSTATUS.DISPUTE });
                return { _id: raised._id, clientId: data.userId, customerId: data.inviteUserId, staffId: raised.staffId };;
            }
        })

        return await Promise.all(disputeData).then(async (values) => {
            return true
        });
    } else {
        const raised = await DisputeTicket.create(req.body);
        await adminService.updateUser(staff._id, { disputeCount: staff.disputeCount + 1 })
        const data = await milestoneService.milestoneUpdate(req.body.milestoneId, { status: MILESTONESTATUS.DISPUTE });
        await jobService.jobUpdate(req.body.jobId, { status: JOBSTATUS.DISPUTE });
        return { _id: raised._id, clientId: data.userId, customerId: data.inviteUserId, staffId: raised.staffId };
    }
}
const disputeListing = async (req) => {
    const { search, status, minAmount, maxAmount } = req.query;
    const { limit, skip, page, sort } = getQueryOptions(req.query);
    let { id, role } = req.user;

    let param = {};
    if (role == 3) {
        param = {
            userId: ObjectId(id)
        };
    }

    // ***************************** Search started **********************
    let searchfilter = {};

    const searchFields = ["jobName", "createdBy", "jobFor"];

    if (search) {
        searchfilter["$or"] = searchFields.map((field) => ({
            [field]: { $regex: search, $options: "i" },
        }));
    }
    // ***************************** Search Ended **********************

    // **************************** Filter by Status started ************************
    if (status) {
        searchfilter.status = status;
    }
    // **************************** Filter by Status ended ************************

    // ***************************** Filter By MinAmount & MaxAmount strated *************************
    if (minAmount && maxAmount) {
        searchfilter.jobAmount = {
            $gte: minAmount,
            $lte: maxAmount,
        };
    } else {
        if (minAmount) {
            searchfilter.jobAmount = {
                $gte: minAmount,
            };
        }
        if (maxAmount) {
            searchfilter.jobAmount = {
                $gte: maxAmount,
            };
        }
    }
    // ***************************** Filter By MinAmount & MaxAmount Date Ended *************************
    console.log(sort, '-----------')
    let totalRecord = await DisputeTicket.count(param);
    let disputeData = await DisputeTicket.aggregate([
        {
            $match: param,
        },
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
                            totalAmount: 1,
                            serviceFee: 1,
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
                from: "customers",
                let: { userId: "$userId", },
                pipeline: [
                    {
                        $match: {
                            $expr: {
                                $or: [
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
                disputedBy: {
                    $concat: ["$customer.firstName", " ", "$customer.lastName"],
                }
            },
        },
        {
            $project: {
                status: 1,
                disputedBy: 1,
                jobName: '$jobs.name',
                jobAmount: '$jobs.totalAmount',
                jobAdminFess: '$jobs.serviceFee',
                createdBy: '$jobs.createdBy',
                jobFor: '$jobs.jobFor',
                createdAt: 1
            }
        },
        { $match: searchfilter },
        { $sort: sort },
        { $skip: parseInt(skip) },
        { $limit: parseInt(limit) }

    ]).collation({ locale: "en" });

    return { disputeData, totalRecord };
}

const disputeDetails = async (req) => {

    let disputeDetails = await DisputeTicket.aggregate([
        {
            $match: { _id: ObjectId(req.query.disputeId) },
        },
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
                                        lastName: 1,
                                        email: 1,
                                        dialCode: 1,
                                        number: 1
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
                                        lastName: 1,
                                        email: 1,
                                        dialCode: 1,
                                        number: 1
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
                    // {
                    //     $addFields: {
                    //         createdBy: {
                    //             $concat: ["$client.firstName", " ", "$client.lastName"],
                    //         }
                    //     },
                    // },
                    {
                        $unwind: {
                            path: "$customer",
                            preserveNullAndEmptyArrays: true
                        },
                    },
                    // {
                    //     $addFields: {
                    //         jobFor: {
                    //             $concat: ["$customer.firstName", " ", "$customer.lastName"],
                    //         }
                    //     },
                    // },
                    {
                        $project: {
                            name: 1,
                            description: 1,
                            totalAmount: 1,
                            serviceFee: 1,
                            clientDetails: '$client',
                            customerDetails: '$customer'

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
                from: "customers",
                let: { userId: "$userId", },
                pipeline: [
                    {
                        $match: {
                            $expr: {
                                $or: [
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
                ],
                as: "createdCustomer",
            },
        },
        {
            $unwind: {
                path: "$createdCustomer",
            },
        },
        {
            $addFields: {
                disputedBy: {
                    $concat: ["$createdCustomer.firstName", " ", "$createdCustomer.lastName"],
                }
            },
        },
        {
            $lookup: {
                from: "milestones",
                let: { jobId: "$jobId", },
                pipeline: [
                    {
                        $match: {
                            $expr: {
                                $or: [
                                    { $eq: ["$jobId", "$$jobId"] }
                                ]
                            }
                        }
                    },
                    {
                        $project: {
                            title: 1,
                            amount: 1,
                            status: 1,
                            description: 1
                        }
                    }
                ],
                as: "milestone",
            },
        },
        {
            $lookup: {
                from: "admins",
                let: { staffId: "$staffId", },
                pipeline: [
                    {
                        $match: {
                            $expr: {
                                $or: [
                                    { $eq: ["$_id", "$$staffId"] }
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
                ],
                as: "admin",
            },
        },
        {
            $unwind: {
                path: "$admin",
            },
        },
        {
            $addFields: {
                staffMember: {
                    $concat: ["$admin.firstName", " ", "$admin.lastName"],
                }
            },
        },
        {
            $project: {
                channelId: 1,
                status: 1,
                milestoneId: 1,
                disputedBy: 1,
                description: 1,
                images: 1,
                resolvedDate: 1,
                conclusion: 1,
                conclusionStatement: 1,
                amountPayClient: 1,
                amountRefundCustomer: 1,
                customerResponse: 1,
                clientResponse: 1,
                jobDetails: {
                    name: '$jobs.name',
                    description: '$jobs.description',
                    totalAmount: '$jobs.totalAmount',
                    adminFess: '$jobs.serviceFee'
                },
                clientDetails: '$jobs.clientDetails',
                customerDetails: '$jobs.customerDetails',
                milestone: '$milestone',
                staffMember: 1
            }
        }
    ]).collation({ locale: "en" });

    return disputeDetails;
}

const getDisputeById = async (disputeId) => {
    const tickets = await DisputeTicket.findById(disputeId);
    if (!tickets) {
        throw new AppError(httpStatus.NOT_FOUND, Messages.DISPUTE_ID_NOT_FOUND);
    }
    return tickets;
};
const disputeUpdate = async (disputeId, updatedBody) => {
    const disputes = await getDisputeById(disputeId);

    Object.assign(disputes, updatedBody);
    await disputes.save();
    return disputes;
}

const disputeMilestoneDetails = async (req) => {
    let disputeDetails = await DisputeTicket.aggregate([
        {
            $match: { milestoneId: ObjectId(req.query.milestoneId) },
        },
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
                        $unwind: {
                            path: "$customer",
                            preserveNullAndEmptyArrays: true
                        },
                    },
                    {
                        $project: {
                            name: 1,
                            description: 1,
                            totalAmount: 1,
                            serviceFee: 1,
                            clientDetails: '$client',
                            customerDetails: '$customer'

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
                from: "admins",
                let: { staffId: "$staffId", },
                pipeline: [
                    {
                        $match: {
                            $expr: {
                                $or: [
                                    { $eq: ["$_id", "$$staffId"] }
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
                ],
                as: "admin",
            },
        },
        {
            $unwind: {
                path: "$admin",
            },
        },
        {
            $addFields: {
                staffMember: {
                    $concat: ["$admin.firstName", " ", "$admin.lastName"],
                }
            },
        },
        {
            $project: {
                channelId: 1,
                status: 1,
                resolvedDate: 1,
                conclusion: 1,
                conclusionStatement: 1,
                amountPayClient: 1,
                amountRefundCustomer: 1,
                customerResponse: 1,
                clientResponse: 1,
                description: 1,
                images: 1,
                staffMember: 1,
                jobDetails: {
                    name: '$jobs.name',
                    description: '$jobs.description',
                    totalAmount: '$jobs.totalAmount',
                    adminFess: '$jobs.serviceFee'
                },
                clientDetails: '$jobs.clientDetails',
                customerDetails: '$jobs.customerDetails',
            }
        }
    ]).collation({ locale: "en" });

    return disputeDetails;
}
module.exports = {
    createDisputeTicket,
    disputeListing,
    disputeDetails,
    disputeUpdate,
    disputeMilestoneDetails,
    getDisputeById
};

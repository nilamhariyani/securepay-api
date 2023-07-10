const SupportTicket = require("../../models/support.ticket.model");
const SupportComment = require("../../models/support.comment.model");
const Admin = require('../../models/admin.model');
const AppError = require("../../utils/AppError");
const httpStatus = require("http-status");
const { pick, get, gt } = require("lodash");
const mongoose = require("mongoose");
const Messages = require("../../utils/messages");
const cloudinaryService = require('../common/cloudinary.service');
const adminService = require('../admin/admin.service');
const { getRandomStaff } = require('../common/common.service');
const ObjectId = mongoose.Types.ObjectId;
const { getQueryOptions, checkCommission } = require("../../utils/service.util");

const createTicket = async (req) => {
    req.body.userId = req.user.id
    let staff = await getRandomStaff('SUPPORT');

    let ticketCount = await SupportTicket.countDocuments({})
    req.body.assignedUserId = staff._id
    req.body.ticketId = ticketCount + 1

    const tickets = await SupportTicket.create(req.body);
    // console.log(tickets);
    let comments = await addComments({ description: req.body.description, ticketId: tickets.id, userId: req.user.id }, req.files)
    await adminService.updateUser(staff._id, { supportCount: staff.supportCount + 1 })
    return tickets;


};
const getTicket = async (req) => {

    const { search, status, startDate, endDate, staff } = req.query;
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

    const searchFields = ["title", "ticketId", "assignTo"];

    if (search) {
        searchfilter["$or"] = searchFields.map((field) => ({
            [field]: { $regex: search, $options: "i" },
        }));
    }
    // ***************************** Search Ended **********************

    // ***************************** Filter By Status started *************************
    if (staff) {
        searchfilter.assignedUserId = ObjectId(staff);
    }
    // ***************************** Filter By Status ended *************************

    // **************************** Filter by Staff Member started ************************
    if (status) {
        searchfilter.status = status;
    }
    // **************************** Filter by Staff Member ended ************************
    // ***************************** Filter By startDate * End Date strated *************************
    let start = startDate + ' 00:00:00';
    let end = endDate + ' 23:59:59';
    console.log(start)
    console.log(end)
    if (startDate && endDate) {
        searchfilter.createdAt = {
            $gte: new Date(start),
            $lte: new Date(end),
        };
    } else {
        if (startDate) {
            searchfilter.createdAt = {
                $gte: new Date(start),
            };
        }
        if (endDate) {
            searchfilter.createdAt = {
                $lte: new Date(end),
            };
        }
    }
    // ***************************** Filter By startDate * End Date Ended *************************
    // console.log(param, 'param ============>');
    console.log(searchfilter, 'searchfilter ============>');
    // console.log(sort, 'sort ============>');
    let totalRecord = await SupportTicket.count(param);
    let ticketData = await SupportTicket.aggregate([
        {
            $match: param,
        },
        {
            $lookup: {
                from: "admins",
                let: { userId: "$assignedUserId", },
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
                as: "admin",
            },
        },
        {
            $unwind: {
                path: "$admin",
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
                assignTo: {
                    $concat: ["$admin.firstName", " ", "$admin.lastName"],
                }
            },
        },
        {
            $addFields: {
                createdBy: {
                    $concat: ["$customer.firstName", " ", "$customer.lastName"],
                }
            },
        },
        {
            $project: {
                ticketId: 1,
                title: 1,
                description: 1,
                status: 1,
                createdAt: 1,
                assignTo: 1,
                createdBy: 1,
                assignedUserId: 1
            }
        },
        { $match: searchfilter },
        { $sort: sort },
        { $skip: parseInt(skip) },
        { $limit: parseInt(limit) }
    ]).collation({ locale: "en" });

    return { ticketData, totalRecord };
}

const getTicketDetails = async (req) => {
    let ticketDetails = await SupportTicket.aggregate([
        {
            $match: { _id: ObjectId(req.query.ticketId) },
        },
        {
            $lookup: {
                from: "supportcomments",
                let: { id: "$_id" },
                as: "comments",
                pipeline: [
                    {
                        $match: {
                            $expr: {
                                $or: [
                                    { $eq: ["$ticketId", "$$id"] }
                                ]
                            }
                        }
                    },
                    {
                        $lookup: {
                            from: "customers",
                            let: { userId: "$userId", },
                            as: "commentCustomer",
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
                            from: "admins",
                            let: { userId: "$userId", },
                            as: "commentAdmins",
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
                        $unwind: {
                            path: "$commentAdmins",
                            preserveNullAndEmptyArrays: true
                        },
                    },
                    {
                        $addFields: {
                            commentedByAdmin: {
                                $concat: ["$commentAdmins.firstName", " ", "$commentAdmins.lastName"],
                            }
                        },
                    },
                    {
                        $unwind: {
                            path: "$commentCustomer",
                            preserveNullAndEmptyArrays: true
                        },
                    },
                    {
                        $addFields: {
                            commentedBy: {
                                $concat: ["$commentCustomer.firstName", " ", "$commentCustomer.lastName"],
                            }
                        },
                    },
                    {
                        $project: {
                            images: 1,
                            description: 1,
                            commentedBy: { $cond: { if: { $eq: ['$commentedByAdmin', null] }, then: '$commentedBy', else: '$commentedByAdmin' } },
                            createdAt: 1

                        }
                    }

                ]
            }
        },
        {
            $lookup: {
                from: "admins",
                let: { userId: "$assignedUserId", },
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
                as: "admin",
            },
        },
        {
            $unwind: {
                path: "$admin",
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
                assignTo: {
                    $concat: ["$admin.firstName", " ", "$admin.lastName"],
                }
            },
        },
        {
            $addFields: {
                createdBy: {
                    $concat: ["$customer.firstName", " ", "$customer.lastName"],
                }
            },
        },
        {
            $project: {
                ticketId: 1,
                title: 1,
                status: 1,
                createdAt: 1,
                assignTo: 1,
                createdBy: 1,
                comments: '$comments'
            }
        },
    ]).collation({ locale: "en" });

    return ticketDetails;
}
const addComments = async (reqBody, files) => {
    let tempImg = [];
    if (files.length > 0) {
        let comments = files.map(async (file) => {

            let url = await cloudinaryService.uploadOnCloudinary(file.path, file.originalname);
            let imageURL = url.secure_url.split('/upload');
            // return imageURL[1]
            tempImg.push(imageURL[1])
            if (tempImg.length === files.length) {
                reqBody.images = tempImg;
                let comments = await SupportComment.create(reqBody);
                return comments
            }
        })
        return await Promise.all(comments).then(async (values) => {
            return true
        });
    } else {
        let comments = await SupportComment.create(reqBody);
        return comments
    }
}

const getTicketById = async (ticketId) => {
    const tickets = await SupportTicket.findById(ticketId);
    if (!tickets) {
        throw new AppError(httpStatus.NOT_FOUND, Messages.TICKET_ID_NOT_FOUND);
    }
    return tickets;
};

const ticketUpdate = async (ticketId, updateBody) => {
    const tickets = await getTicketById(ticketId);

    Object.assign(tickets, updateBody);
    await tickets.save();
    return tickets;
}
module.exports = {
    createTicket,
    getTicket,
    getTicketDetails,
    addComments,
    ticketUpdate,
    getTicketById
};

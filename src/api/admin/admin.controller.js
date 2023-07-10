const httpStatus = require('http-status');
const catchAsync = require('../../utils/catchAsync');
const createResponse = require('../../utils/response');
const Messages = require('../../utils/messages');
const adminService = require('./admin.service');
const emailService = require('../common/email.service');
const bcrypt = require('bcryptjs');
const tokenService = require('../common/token.service');
const { TOKEN_TYPE } = require('../../config/constant');
const common = require('../common/common.service')
const cloudinaryService = require('../common/cloudinary.service');
const config = require('../../config/config');

const addStaffMember = catchAsync(async (req, res) => {
    const createUser = await adminService.createUser(req.body)
    if (createUser) {
        const verifyToken = await adminService.generateUserVerifyToken(
            createUser._id,
            createUser.role
        );
        const otp = common.generateOtp()
        await emailService.sendOtpVarification(createUser.email, otp, {
            ...createUser.toJSON(),
            token: verifyToken
        })
        await adminService.updateStaffMember(createUser._id, { otp: otp })
    }
    createResponse(res, httpStatus.CREATED, Messages.ADD_STAFF_MEMBER, createUser)
})

const getStaffList = catchAsync(async (req, res) => {
    const user = await adminService.getStaffList(req);
    createResponse(res, httpStatus.OK, Messages.GET_STAFF_MEMBER, user);
});

const deleteStaff = catchAsync(async (req, res) => {
    const deleteUser = await adminService.updateStaffMember(req.query.id, { isDeleted: true })
    createResponse(res, httpStatus.OK, Messages.DELETE_STAFF_MEMBER, deleteUser)
})

const updateStaff = catchAsync(async (req, res) => {
    console.log(req.file)
    if (req.file) {
        let url = await cloudinaryService.uploadOnCloudinary(req.file.path, req.file.originalname);
        let imageURL = url.secure_url.split('/upload');
        req.body.profilePic = imageURL[1]
    }
    const updateUser = await adminService.updateStaffMember(req.query.staffId, req.body)
    createResponse(res, httpStatus.OK, Messages.UPDATE_STAFF_MEMBER, updateUser)
})
const setPassword = catchAsync(async (req, res) => {
    const tokenData = await tokenService.verifyToken(req.query.token, TOKEN_TYPE.VERIFICATION_TOKEN)
    const user = await adminService.getUserById(tokenData.sub.user)
    if (req.body.otp == user.otp) {
        const updatePassword = await adminService.updateStaffMember(tokenData.sub.user, { password: req.body.password })
        createResponse(res, httpStatus.OK, Messages.PASSWORD_CHANGED, updatePassword)
    } else {
        createResponse(res, httpStatus.OK, Messages.WRONG_OTP, {})
    }
})

const checkToken = catchAsync(async (req, res) => {
    const tokenData = await tokenService.verifyToken(req.query.token, TOKEN_TYPE.VERIFICATION_TOKEN)
    if (tokenData) {
        const user = await adminService.getUserById(tokenData.sub.user)
        createResponse(res, httpStatus.OK, Messages.VERIFIED_USER, { firstName: user.firstName, lastName: user.lastName });
    }
})

const getCommission = catchAsync(async (req, res) => {
    const data = await adminService.getUserById(config.admin.id)
    createResponse(res, httpStatus.OK, "", data.commission)
});

const totalRevenue = catchAsync(async (req, res) => {
    const data = await adminService.getTotalRevenue(req.query)
    createResponse(res, httpStatus.OK, "", data)
});

const totalCommission = catchAsync(async (req, res) => {
    const data = await adminService.getTotalCommission(req.query)
    createResponse(res, httpStatus.OK, "", data)
});

const getJobDashboard = catchAsync(async (req, res) => {
    const data = await adminService.getJobDashboard(req.query)
    createResponse(res, httpStatus.OK, "", data)
});
module.exports = {
    addStaffMember,
    getStaffList,
    deleteStaff,
    updateStaff,
    setPassword,
    checkToken,
    getCommission,
    totalRevenue,
    totalCommission,
    getJobDashboard
}
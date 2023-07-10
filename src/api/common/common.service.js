const { User, Admin } = require("../../models");
const AppError = require('../../utils/AppError');
const Messages = require('../../utils/messages');
const httpStatus = require('http-status');

const generateOtp = () => {
    var digits = "123456789";
    var otp = "";
    var nMaxOtpLength = 6;

    for (let i = 1; i <= nMaxOtpLength; i++) {
        var index = Math.floor(Math.random() * digits.length);
        otp = otp + digits[index];
    }
    return otp
}
const getUniqueOTP = async (otp = '') => {
    var otp;
    if (otp === '') {
        otp = generateOtp();
    }
    var otps = await User.find({ otp: otp });
    var isOTPExists = false;
    if (otps.length > 0) {
        isOTPExists = true;
    }
    if (isOTPExists) {
        otp = generateOtp();
        await getUniqueOTP(otp);
    } else {
        return otp;
    }
};
const checkDeleted = async (user) => {
    if (user.isDeleted === false) {
        return true
    } else {
        throw new AppError(
            httpStatus.UNAUTHORIZED,
            Messages.ACCOUNT_DELETED
        );
    }
}
const checkDisable = async (user) => {

    if (user.isEnable === false) {
        return true
    } else {
        throw new AppError(
            httpStatus.UNAUTHORIZED,
            Messages.ACCOUNT_DISABLED
        );
    }
}
const checkVerify = async (user) => {
    if (user.isVerified === true) {
        return true
    } else {
        throw new AppError(
            httpStatus.UNAUTHORIZED,
            Messages.EMAIL_NOT_VERIFY
        );
    }
}
const getRandomStaff = async (data) => {
    let staffArray = await Admin.find({ role: 2, isEnable: false, isDeleted: false }, { disputeCount: 1, supportCount: 1 });
    let value;
    if(data === 'SUPPORT'){
        value = staffArray.reduce(function(prev, curr) {
            return prev.supportCount < curr.supportCount ? prev : curr;
        });
    }else{
        value = staffArray.reduce(function(prev, curr) {
            return prev.disputeCount < curr.disputeCount ? prev : curr;
        });
    }
    return value
}
module.exports = {
    generateOtp,
    getUniqueOTP,
    checkDeleted,
    checkDisable,
    checkVerify,
    getRandomStaff
}
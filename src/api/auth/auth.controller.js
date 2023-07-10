const httpStatus = require('http-status');
const { isUndefined } = require('lodash');
const catchAsync = require('../../utils/catchAsync');
const createResponse = require('../../utils/response');
const Messages = require('../../utils/messages');
const emailService = require('../common/email.service')
const cloudinaryService = require('../common/cloudinary.service')
const mangopayService = require('../common/mangopay.service')
const commonService = require('../common/common.service')
const authService = require("./auth.service");
const adminService = require("../admin/admin.service");
const customerService = require("../customer/customer.service");
const mongoose = require("mongoose");
const ObjectId = mongoose.Types.ObjectId;
const { USER_TYPE, ROLES, ACCOUNT_TYPE } = require('../../config/constant')
const fs = require('fs');
const twiloService = require('../common/twilo.service')
const login = catchAsync(async (req, res) => {
    let { email, password, role } = req.body;
    const user = await authService.loginUser(email, password, role);
    const tokens = await authService.generateAuthTokens(user._id, user.role);
    if (role === ROLES.CLIENT && user.registerComplete) {
        let otp = await commonService.generateOtp();
        await emailService.verifyOTP(email, {
            ...user.toJSON(),
            otp: otp
        });
        await customerService.updateUser(user._id, { verifyOtp: otp })

        // if (user.number && user.dialCode) {
        //     let toMobile = "+" + user.dialCode + "" + user.number
        //     let body = "Your One Time Password (OTP) for Yatapay is" + otp + " .Please do not share this OTP with anyone. Thanks"
        //     await twiloService.sendSms(toMobile, body)
        // }
    } else if (role === ROLES.ADMIN || role === ROLES.STAFF_MEMBERS) {

        let otp = await commonService.generateOtp();
        await emailService.verifyOTP(email, {
            ...user.toJSON(),
            otp: otp
        });
        await adminService.updateUser(user._id, { verifyOtp: otp })

        // if (user.number && user.dialCode) {
        //     let toMobile = "+" + user.dialCode + "" + user.number
        //     let body = "Your One Time Password (OTP) for Yatapay is" + otp + " .Please do not share this OTP with anyone. Thanks"
        //     await twiloService.sendSms(toMobile, body)
        // }
    }
    const response = { user, tokens };
    createResponse(res, httpStatus.OK, role === ROLES.CLIENT ? user.registerComplete ? Messages.LOGIN_WITH_OTP : Messages.LOGIN : Messages.LOGIN_WITH_OTP, response)
});
const checkResetLink = catchAsync(async (req, res) => {
    let value = await authService.checkResetLink(req.query.token);
    createResponse(res, httpStatus.OK, value, {});
});

const resetPassword = catchAsync(async (req, res) => {
    let user = await authService.resetPassword(req.query.token, req.body.password);
    await emailService.sendResetedPassword(user.email, {
        ...user.toJSON(),
    });
    // if (user.number && user.dialCode) {
    //     let toMobile = "+" + user.dialCode + "" + user.number
    //     let body = "Your password has been updated successfully. You can now log in to Yatapay Secure dashboard with your new password"
    //     await twiloService.sendSms(toMobile, body)
    // }
    createResponse(res, httpStatus.OK, Messages.RESET_PASSWORD, {});
})
const forgotPassword = catchAsync(async (req, res) => {

    let user;
    switch (req.body.role) {
        case ROLES.ADMIN: case ROLES.STAFF_MEMBERS:
            user = await adminService.getAdminByEmail(req.body.email);
            break;
        case ROLES.CLIENT:
            user = await customerService.getCustomerByEmail(req.body.email);
            break;
        default:
            break;
    }

    const resetPasswordToken = await authService.generateResetPasswordToken(user);
    // const user = await userService.getUserByEmail(req.body.email);
    await emailService.sendForgotPasswordEmail(req.body.email, {
        ...user.toJSON(),
        token: resetPasswordToken,
    });
    createResponse(res, httpStatus.OK, Messages.FORGOT_PASSWORD, {});
});

const register = catchAsync(async (req, res) => {
    if (req.body.registerStep == 1) {
        if (req.query.userId) {
            const user = await customerService.updateUser(req.query.userId, req.body);
            createResponse(res, httpStatus.CREATED, Messages.ACCOUNT_CREATED, user);
        } else {
            if (req.body.email) {
                await customerService.checkDuplicateEmail(req.body.email)
                // req.body.isVerified = true
            }
            const user = await customerService.createCustomer(req.body);
            createResponse(res, httpStatus.CREATED, Messages.ACCOUNT_CREATED, user);
        }
    }
    else if (req.body.registerStep == 2 || req.body.registerStep == 3 || req.body.registerStep == 5 || req.body.registerStep == 6) {
        const user = await customerService.updateUser(req.query.userId, req.body);
        createResponse(res, httpStatus.CREATED, Messages.ACCOUNT_CREATED, user);
    }
    else if (req.body.registerStep == 4) {
        await customerService.checkDuplicateEmailWithId(req.body.email, req.query.userId)
        const user = await customerService.updateUser(req.query.userId, req.body);



        createResponse(res, httpStatus.CREATED, Messages.ACCOUNT_CREATED, user);
    }
    else if (req.body.registerStep == 7) {
        const userData = await customerService.updateUser(req.query.userId, req.body);


        // ************************************* Start Create and update natural user & create wallets *************************************
        if (userData.accountType === ACCOUNT_TYPE.INDIVIDUAL) {
            let param = {
                FirstName: userData.firstName,
                LastName: userData.lastName,
                Birthday: new Date(userData.dob).getTime() / 1000,
                Nationality: userData.country,
                CountryOfResidence: userData.country,
                Email: userData.email,
            };
            let mangoData;
            let walletData;
            // if (userData.customerId) {
            //     mangoData = await mangopayService.updateNaturalUser(param, userData.customerId);
            //     let walletParam = {
            //         "Description": `Legal user wallet for creating Pay in`,
            //     }
            //     walletData = await mangopayService.updateWallets(walletParam, userData.walletId);
            // } else {
            //     mangoData = await mangopayService.createNaturalUser(param);
            //     let walletParam = {
            //         "Owners": [mangoData.Id],
            //         "Description": `Legal user wallet for creating Pay in`,
            //         "Currency": "GBP"
            //     }
            //     walletData = await mangopayService.createWallets(walletParam);
            // }
            // ************************************* End Create and update natural user & create wallets *************************************


            await customerService.updateUser(req.query.userId);
        }
        createResponse(res, httpStatus.CREATED, Messages.ACCOUNT_CREATED, userData);
    }
    else if (req.body.registerStep == 8) {
        req.body.address = { 'houseNo': req.body.houseNo, 'addressLine1': req.body.addressLine1, 'addressLine2': req.body.addressLine2, 'city': req.body.city, 'region': req.body.region, 'postalCode': req.body.postalCode };
        const user = await customerService.updateUser(req.query.userId, req.body);
        createResponse(res, httpStatus.CREATED, Messages.ACCOUNT_CREATED, user);
    }
    else if (req.body.registerStep == 9) {
        req.body.company = { 'name': req.body.name, 'number': req.body.number };
        delete req.body.number;
        delete req.body.name;
        const userData = await customerService.updateUser(req.query.userId, req.body);

        // ************************************* Start Create and update natural user & create wallets *************************************
        if (userData.accountType === ACCOUNT_TYPE.ORGANIZATION) {
            let param = {
                "LegalPersonType": "BUSINESS",
                "Name": userData.company.name,
                "LegalRepresentativeAddress": {
                    "AddressLine1": userData.address.addressLine1,
                    "AddressLine2": userData.address.addressLine2,
                    "City": userData.address.city,
                    "Region": userData.address.region,
                    "PostalCode": userData.address.postalCode,
                    "Country": userData.country
                },
                "LegalRepresentativeFirstName": userData.firstName,
                "LegalRepresentativeLastName": userData.lastName,
                "LegalRepresentativeEmail": userData.email,
                "LegalRepresentativeBirthday": new Date(userData.dob).getTime() / 1000,
                "LegalRepresentativeNationality": userData.country,
                "LegalRepresentativeCountryOfResidence": userData.country,
                "CompanyNumber": userData.company.number,
                "Email": userData.email,
            }
            let mangoData;
            let walletData;
            // if (userData.customerId) {
            //     mangoData = await mangopayService.updateLegalUser(param, userData.customerId);
            //     let walletParam = {
            //         "Description": `Legal user wallet for creating Pay in`,
            //     }
            //     walletData = await mangopayService.updateWallets(walletParam, userData.walletId);
            // } else {
            //     mangoData = await mangopayService.createLegalUser(param);
            //     let walletParam = {
            //         "Owners": [mangoData.Id],
            //         "Description": `Legal user wallet for creating Pay in`,
            //         "Currency": "GBP"
            //     }
            //     walletData = await mangopayService.createWallets(walletParam);

            // }
            // ************************************* End create and update natural user & create wallets *************************************

            await customerService.updateUser(req.query.userId);
        }
        createResponse(res, httpStatus.CREATED, Messages.ACCOUNT_CREATED, userData);
    }
    else if (req.body.registerStep == 10) {
        req.body.bankInfo = { 'accountNumber': req.body.accountNumber, 'sortCode': req.body.sortCode };
        const userData = await customerService.updateUser(req.query.userId, req.body);

        // ************************************* Start Create and update bank account *************************************
        let bankParam = {
            SortCode: userData.bankInfo.sortCode,
            AccountNumber: userData.bankInfo.accountNumber,
            OwnerName: userData.firstName + ' ' + userData.lastName,
            OwnerAddress: {
                "AddressLine1": userData.address.addressLine1,
                "AddressLine2": userData.address.addressLine2,
                "City": userData.address.city,
                "Region": userData.address.region,
                "PostalCode": userData.address.postalCode,
                "Country": userData.country
            },
        }
        // if (userData.bankId) {
        //     let body = {
        //         Active: false
        //     };
        //     await mangopayService.deactivateBankAccount(body, userData.customerId, userData.bankId);
        // }
        // let bankDetail = await mangopayService.createBankAccount(bankParam, userData.customerId)

        // ************************************* End Create and update bank account *************************************

        const userd = await customerService.updateUser(req.query.userId);
        createResponse(res, httpStatus.CREATED, Messages.ACCOUNT_CREATED, userd);
    }
    else if (req.body.registerStep == 11) {
        if (req.file) {
            let url = await cloudinaryService.uploadOnCloudinary(req.file.path, req.file.originalname);
            let imageURL = url.secure_url.split('/upload')
            req.body.identityProof = imageURL[1];
        }
        const user = await customerService.updateUser(req.query.userId, req.body);

        // ************************************* Start Create and update KYC Docs *************************************
        let declaration;
        let kycPage;
        let kycData;
        // if (user.kycDocsId) {
        //     declaration = user.kycDocsId;
        // } else {
        // kycData = await mangopayService.createkycDoc(user.customerId);
        // declaration = kycData.Id;
        // // }
        // const contents = fs.readFileSync(req.file.path, { encoding: 'base64' });
        // kycPage = await mangopayService.createkycPage(user.customerId, declaration, contents)
        // ************************************* Start Create and update KYC Docs *************************************

        const userd = await customerService.updateUser(req.query.userId);
        createResponse(res, httpStatus.CREATED, Messages.ACCOUNT_CREATED, userd);
    }
    else if (req.body.registerStep == 12) {
        const userData = await customerService.updateUser(req.query.userId, req.body);

        // ************************************* Start Create and update UBO Info *************************************
        let declaration;
        // if (userData.uboDeclarationId) {
        //     declaration = userData.uboDeclarationId;
        // } else {
        //     let uboDec = await mangopayService.createDeclaration(userData.customerId);
        //     declaration = uboDec.Id;
        //     await customerService.updateUser(req.query.userId, { uboDeclarationId: uboDec.Id });
        // }

        userData.uboInfo.map(async (value, index) => {
            let uboParam = {
                "FirstName": value.firstName,
                "LastName": value.lastName,
                "Address": {
                    "AddressLine1": value.address.addressLine,
                    "AddressLine2": "",
                    "City": value.address.city,
                    "Region": value.address.region,
                    "PostalCode": value.address.postalCode,
                    "Country": value.nationality
                },
                "Birthday": new Date(value.dob).getTime() / 1000,
                "Nationality": value.nationality,
                "Birthplace": {
                    "City": value.address.city,
                    "Country": value.nationality
                }
            }
            let uboData;
            // if (value.uboId) {
            //     uboData = await mangopayService.updateUBO(uboParam, userData.customerId, declaration, value.uboId)
            // } else {
            //     uboData = await mangopayService.createUBO(uboParam, userData.customerId, declaration)
            // }
            userData.uboInfo[index].uboId = uboData.Id;
            if (index === userData.uboInfo.length - 1) {
                let userValue = await customerService.updateUser(req.query.userId, { uboInfo: userData.uboInfo });
                createResponse(res, httpStatus.CREATED, Messages.ACCOUNT_CREATED, userValue);
            }

        });
        // ************************************* End Create and update UBO Info *************************************
    }
    else if (req.body.registerStep == 13) {
        req.body.registerComplete = true
        const user = await customerService.updateUser(req.query.userId, req.body);

        const verifyToken = await authService.generateUserVerifyToken(
            req.query.userId,
            user.role
        );
        if (user.facebookId == null && user.gmailId == null) {
            req.body.isVerified = false
            await emailService.sendUserVerify(user.email, {
                ...user.toJSON(),
                token: verifyToken,
            });
            await customerService.updateUser(req.query.userId, req.body);
        }
        if (user.accountType === ACCOUNT_TYPE.ORGANIZATION) {
            console.log(user.uboInfo.length)
            if (user.uboInfo.length === 0) {
                // let uboDec = await mangopayService.createDeclaration(user.customerId);
                // let declaration = uboDec.Id;

                let uboParam = {
                    "FirstName": user.firstName,
                    "LastName": user.lastName,
                    "Address": {
                        "AddressLine1": user.address.addressLine1,
                        "AddressLine2": "",
                        "City": user.address.city,
                        "Region": user.address.region,
                        "PostalCode": user.address.postalCode,
                        "Country": user.country
                    },
                    "Birthday": new Date(user.dob).getTime() / 1000,
                    "Nationality": user.country,
                    "Birthplace": {
                        "City": user.address.city,
                        "Country": user.country
                    }
                }
                // let uboData = await mangopayService.createUBO(uboParam, user.customerId, declaration)
                let uboBody = [{
                    "address": {
                        "houseNo": user.address.houseNo,
                        "addressLine": user.address.addressLine1,
                        "city": user.address.city,
                        "region": user.address.region,
                        "postalCode": user.address.postalCode
                    },
                    "firstName": user.firstName,
                    "lastName": user.lastName,
                    "nationality": user.country,
                    "dob": new Date(user.dob),
                    // "uboId": uboData.Id
                }]
                let userValue = await customerService.updateUser(req.query.userId, { uboDeclarationId: declaration, uboInfo: uboBody });
            }
        }
        createResponse(res, httpStatus.CREATED, Messages.ACCOUNT_CREATED, user);
    }

});
const verifyAccount = catchAsync(async (req, res) => {
    let value = await authService.verifyAccount(req.query.token);
    createResponse(res, httpStatus.OK, value, {});
});

const loginWithGmail = catchAsync(async (req, res) => {

    let user = await authService.gmailLogin(req.body);
    if (user._id) {
        let data = user;
        const tokens = await authService.generateAuthTokens(user._id, user.role);
        user = { register_status: true, user, tokens };

        if (data.role === ROLES.CLIENT && data.registerComplete) {
            let otp = await commonService.generateOtp();
            await emailService.verifyOTP(data.email, {
                ...data.toJSON(),
                otp: otp
            });
            await customerService.updateUser(data._id, { verifyOtp: otp })
        }
    }
    createResponse(res, httpStatus.OK, Messages.LOGIN, user);
});

const loginWithFacebook = catchAsync(async (req, res) => {

    let user = await authService.facebookLogin(req.body);
    if (user._id) {
        let data = user;
        const tokens = await authService.generateAuthTokens(user._id, user.role);
        user = { register_status: true, user, tokens, };

        if (data.role === ROLES.CLIENT && data.registerComplete) {
            let otp = await commonService.generateOtp();
            await emailService.verifyOTP(data.email, {
                ...data.toJSON(),
                otp: otp
            });
            await customerService.updateUser(data._id, { verifyOtp: otp })
        }
    }
    createResponse(res, httpStatus.OK, Messages.LOGIN, user);
});
const refreshTokens = catchAsync(async (req, res) => {
    const tokens = await authService.refreshAuthTokens(req.body.refreshToken);
    const response = { ...tokens };
    createResponse(res, httpStatus.OK, Messages.REFRESH_TOKEN, {
        tokens: response,
    });
});

const changePassword = catchAsync(async (req, res) => {
    const user = await authService.changePassword(req.user.role, req.params.userId, req.body.newPassword, req.body.oldPassword);

    await emailService.sendResetedPassword(user.email, {
        ...user.toJSON(),
    });

    // if (user.number && user.dialCode) {
    //     let toMobile = "+" + user.dialCode + "" + user.number
    //     let body = "Your password has been changed successfully. You can now log in to Yatapay Secure dashboard with your new password"
    //     await twiloService.sendSms(toMobile, body)
    // }

    createResponse(res, httpStatus.OK, Messages.PASSWORD_CHANGED, {})
});

const updateProfilePic = catchAsync(async (req, res) => {
    let url = await cloudinaryService.uploadOnCloudinary(req.file.path, req.file.originalname);
    let imageURL = url.secure_url.split('/upload')
    req.body.profilePic = imageURL[1];
    const user = await authService.updateProfilePic(req)
    createResponse(res, httpStatus.OK, Messages.PROFILE_PIC_UPDATED, user)
});

const verifyOTP = catchAsync(async (req, res) => {
    console.log(req.user);
    if (req.user.role === 3) {
        const user = await customerService.verifyAuthOTP(req);
    } else {
        const user = await adminService.verifyAuthOTP(req);
    }
    createResponse(res, httpStatus.OK, Messages.LOGIN, {})
});

const resendVerifyLink = catchAsync(async (req, res) => {
    const user = await customerService.getUserById(req.query.userId)
    const verifyToken = await authService.generateUserVerifyToken(
        req.query.userId,
        user.role
    );
    if (user.facebookId == null && user.gmailId == null) {
        req.body.isVerified = false
        await emailService.sendUserVerify(user.email, {
            ...user.toJSON(),
            token: verifyToken,
        });
        await customerService.updateUser(req.query.userId, req.body);
    }
    createResponse(res, httpStatus.OK, Messages.LINK_RESEND_SUCCESS, {})
});
module.exports = {
    login,
    checkResetLink,
    resetPassword,
    forgotPassword,
    register,
    verifyAccount,
    loginWithGmail,
    loginWithFacebook,
    refreshTokens,
    changePassword,
    updateProfilePic,
    verifyOTP,
    resendVerifyLink
};

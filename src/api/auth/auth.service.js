const moment = require('moment');
const bcrypt = require('bcryptjs');
const Token = require("../../models/tokens.model");
// const { Client, Customer, Tokens } = require('../../models');
const httpStatus = require('http-status');
const config = require('../../config/config');

const customerService = require('../customer/customer.service');
const adminService = require('../admin/admin.service');
const commonService = require('../common/common.service');

const tokenService = require('../common/token.service');

const AppError = require('../../utils/AppError');
const { TOKEN_TYPE, ROLES } = require('../../config/constant');
const Messages = require('../../utils/messages');
const jwt = require('jsonwebtoken');
const generateAuthTokens = async (userId, role) => {
  const accessTokenExpires = moment().add(config.jwt.accessExpirationMinutes, 'minutes');
  const accessToken = tokenService.generateToken(userId, role, accessTokenExpires);
  const refreshTokenExpires = moment().add(config.jwt.refreshExpirationDays, 'days');
  const refreshToken = tokenService.generateToken(userId, role, refreshTokenExpires);
  await tokenService.saveToken(refreshToken, userId, refreshTokenExpires, TOKEN_TYPE.REFRESH_TOKEN);

  return {
    access: {
      token: accessToken,
      expires: accessTokenExpires.toDate(),
    },
    refresh: {
      token: refreshToken,
      expires: refreshTokenExpires.toDate(),
    },
  };
};

const checkPassword = async (password, correctPassword) => {
  if (correctPassword == undefined) {
    throw new AppError(httpStatus.UNPROCESSABLE_ENTITY, Messages.SET_PASSWORD);
  }
  const isPasswordMatch = await bcrypt.compare(password, correctPassword);
  if (!isPasswordMatch) {
    throw new AppError(httpStatus.UNPROCESSABLE_ENTITY, Messages.PASSWORD_INCORRECT);
  }
};
const checkOldPassword = async (password, correctPassword) => {

  const isPasswordMatch = await bcrypt.compare(password, correctPassword);
  if (!isPasswordMatch) {
    throw new AppError(httpStatus.UNPROCESSABLE_ENTITY, Messages.OLD_PASSWORD_INCORRECT);
  }
};


const loginUser = async (email, password, role) => {
  let user;
  console.log("email, password, role :", email, password, role)
  switch (role) {
    case ROLES.ADMIN: case ROLES.STAFF_MEMBERS:
      user = await adminService.getAdminByEmail(email);
      break;
    case ROLES.CLIENT:
      user = await customerService.getCustomerByEmail(email);
      // await commonService.checkVerify(user);
      break;
    default:
      break;
  }
  if (user.role !== role) {
    throw new AppError(httpStatus.FORBIDDEN, 'Not allowed to do this action.');
  }
  if (user.facebookId != null) {
    throw new AppError(httpStatus.NOT_FOUND, Messages.REGISTERED_WITH_FACEBOOK);
  }
  if (user.gmailId != null) {
    throw new AppError(httpStatus.NOT_FOUND, Messages.REGISTERED_WITH_GOOGLE);
  }
  await commonService.checkDeleted(user);
  await commonService.checkDisable(user);
  await checkPassword(password, user.password);
  return user;


};
const refreshAuthTokens = async (refreshToken) => {
  try {
    const refreshTokenDoc = await tokenService.verifyToken(refreshToken, TOKEN_TYPE.REFRESH_TOKEN);
    const userId = refreshTokenDoc.sub.user;
    let user;
    if (refreshTokenDoc.sub.role === 3) {
      user = await customerService.getUserById(userId)
    } else {
      user = await adminService.getUserById(userId)
    }
    return await generateAuthTokens(userId, refreshTokenDoc.sub.role);
  } catch (error) {
    throw new AppError(httpStatus.UNAUTHORIZED, Messages.INVALID_TOKEN);
  }
};

const checkResetLink = async (resetPasswordToken) => {
  try {
    const resetPasswordTokenDoc = await tokenService.verifyToken(
      resetPasswordToken,
      TOKEN_TYPE.RESET_PASSWORD
    );
    userId = resetPasswordTokenDoc.sub.user;
    // let user = await customerService.getUserById(userId);
    let user;
    if (resetPasswordTokenDoc.sub.role === 3) {
      user = await customerService.getUserById(userId)
    } else {
      user = await adminService.getUserById(userId)
    }
    let name = {
      firstName: user.firstName,
      lastName: user.lastName,
      role: user.role

    }
    return { message: Messages.VALID_LINK, status: true, name };
  } catch (error) {
    return { message: Messages.INVALID_LINK, status: false };
  }
};
const resetPassword = async (resetPasswordToken, newPassword) => {
  let userId;
  var user;
  try {
    const resetPasswordTokenDoc = await tokenService.verifyToken(
      resetPasswordToken,
      TOKEN_TYPE.RESET_PASSWORD
    );
    userId = resetPasswordTokenDoc.sub.user;
    let userData;
    if (resetPasswordTokenDoc.sub.role === 3) {
      userData = await customerService.getUserById(userId)
    } else {
      userData = await adminService.getUserById(userId)
    }
    let obj = {};
    if (userData.password == null) {
      obj = {
        registerStep: 5,
        password: newPassword,
      };
    } else {
      obj = {
        password: newPassword,
      };
    }
    switch (resetPasswordTokenDoc.sub.role) {
      case ROLES.ADMIN: case ROLES.STAFF_MEMBERS:
        user = await adminService.updateUser(userId, { password: newPassword });
        break;
      case ROLES.CLIENT:
        user = await customerService.updateUser(userId, obj);
        break;
      default:
        break;
    }
    return user
    // await userService.updateUser(userId, { password: newPassword });
  } catch (error) {
    throw new AppError(httpStatus.UNPROCESSABLE_ENTITY, "Password reset failed");
  }
  await Token.deleteMany({ user: userId, type: TOKEN_TYPE.RESET_PASSWORD });
}
const generateResetPasswordToken = async (user) => {
  // const user = await userService.getUserByEmail(email);
  const expires = moment().add(
    config.jwt.resetPasswordExpirationMinutes,
    "minutes"
  );
  const resetPasswordToken = tokenService.generateToken(
    user._id,
    user.role,
    expires
  );
  await tokenService.saveToken(
    resetPasswordToken,
    user._id,
    expires,
    TOKEN_TYPE.RESET_PASSWORD
  );
  return resetPasswordToken;
};

const generateUserVerifyToken = async (userId, token) => {
  const expires = moment().add(
    config.jwt.verifyPasswordExpirationMinutes,
    "minutes"
  );
  const verifyUserToken = tokenService.generateToken(userId, token, expires);
  await tokenService.saveToken(
    verifyUserToken,
    userId,
    expires,
    TOKEN_TYPE.VERIFICATION_TOKEN
  );
  return verifyUserToken;
};
const verifyAccount = async (resetPasswordToken) => {
  try {
    const resetPasswordTokenDoc = await tokenService.verifyToken(
      resetPasswordToken,
      TOKEN_TYPE.VERIFICATION_TOKEN
    );
    console.log("resetPasswordTokenDoc :", resetPasswordTokenDoc)
    let userId = resetPasswordTokenDoc.sub.user;
    let user = await customerService.getUserById(userId);
    if (user.isVerified) {
      return { 'message': Messages.VERIFIED_ALREADY, status: false, data: user };
    } else {
      Object.assign(user, { isVerified: true });
      let data = await user.save();
      return { 'message': Messages.VERIFIED_USER, status: true, data: data };
    }
  } catch (error) {
    const payload = jwt.verify(resetPasswordToken, config.jwt.secret, { ignoreExpiration: true });
    let userId = payload.sub.user;
    let user = await customerService.getUserById(userId);
    if (user.isVerified) {
      return { 'message': Messages.VERIFIED_ALREADY, status: false, data: user };
    } else {
      return {
        'message': Messages.EXPIRED_VERIFICATION_TOKEN, status: false, data: { isExpire: true, userId: payload.sub.user }
      };
    }
  }
};

const gmailLogin = async (req) => {
  const resp = await customerService.getGmailUser(req);
  return resp;

};
const facebookLogin = async (req) => {
  const resp = await customerService.getFacebookUser(req);
  return resp;
};

const changePassword = async (role, userId, newPassword, oldPassword) => {
  let user;
  switch (role) {
    case ROLES.ADMIN: case ROLES.STAFF_MEMBERS:
      user = await adminService.getUserById(userId);
      break;
    case ROLES.CLIENT:
      user = await customerService.getUserById(userId);
      await commonService.checkVerify(user);
      break;
    default:
      break;
  }
  // const user = await getUserById(userId);
  await checkOldPassword(oldPassword, user.password);
  Object.assign(user, { password: newPassword });
  await user.save();
  return user;
};

const updateProfilePic = async (req) => {

  let user;
  switch (req.user.role) {
    case ROLES.ADMIN: case ROLES.STAFF_MEMBERS:
      user = await adminService.getUserById(req.user.id);
      break;
    case ROLES.CLIENT:
      user = await customerService.getUserById(req.user.id);
      break;
    default:
      break;
  }

  Object.assign(user, { profilePic: req.body.profilePic });
  await user.save();

  return user;

}

module.exports = {
  generateAuthTokens,
  refreshAuthTokens,
  loginUser,
  checkPassword,
  checkResetLink,
  resetPassword,
  generateResetPasswordToken,
  generateUserVerifyToken,
  verifyAccount,
  gmailLogin,
  facebookLogin,
  changePassword,
  updateProfilePic
};

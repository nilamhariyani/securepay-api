const Joi = require('@hapi/joi');
const { password, objectId } = require('../common/custom.validation');
const { ROLES, GENDER, USER_TYPE, SOCIALMEDIA_TYPE } = require('../../config/constant')

const login = {
  body: Joi.object().keys({
    email: Joi.string().email().required().messages({
      'string.email': "Are you sure you entered the valid email address?",
      'string.empty': "Email address cannot be empty."
    }),
    password: Joi.string().required().messages({
      'string.empty': "Password cannot be empty."
    }),
    role: Joi.number().valid(ROLES.ADMIN, ROLES.STAFF_MEMBERS, ROLES.CLIENT, ROLES.CUSTOMER)
  }),
};
const checkResetLink = {
  query: Joi.object().keys({
    token: Joi.string().required()
  })
}
const resetPassword = {
  query: Joi.object().keys({
    token: Joi.string().required()
  }),
  body: Joi.object().keys({
    password: Joi.string()
      .required()
      .custom(password)
      .messages({
        'string.empty': "New password cannot be empty."
      }),
  })
}

const forgotPassword = {
  body: Joi.object().keys({
    email: Joi.string()
      .email()
      .required().messages({
        'string.email': "Are you sure you entered the valid email address?",
        'string.empty': "Email address cannot be empty."
      }),
    role: Joi.number().required()

  })
};

const loginWithGmail = {
  body: Joi.object().keys({
    email: Joi.string()
      .email()
      .required()
      .messages({
        "string.email": "Are you sure you entered the valid email address?",
        "string.empty": "Email address cannot be empty.",
      }),
    gmailId: Joi.string()
  }),
};
const loginWithFacebook = {
  body: Joi.object().keys({
    email: Joi.string()
      .email()
      .required()
      .messages({
        "string.email": "Are you sure you entered the valid email address?",
        "string.empty": "Email address cannot be empty.",
      }),
    facebookId: Joi.string()
  }),
};
const refreshTokens = {
  body: Joi.object().keys({
    refreshToken: Joi.string().required(),
  }),
};

const changePassword = {
  params: Joi.object().keys({
    userId: Joi.required().custom(objectId).messages({
      'string.empty': "Userid cannot be empty.",
      'string.valid': "Userid must be a valid mongo id.",
    })
  }),
  body: Joi.object().keys({
    oldPassword: Joi.string().required()
      .messages({
        'string.empty': "Old password cannot be empty."
      }),
    newPassword: Joi.string()
      .required()
      .custom(password)
      .messages({
        'string.empty': "New password cannot be empty."
      }),
  }),
};
const updateProfilePic = {
};
const verifyOTP = {
  body: Joi.object().keys({
    verifyOtp: Joi.number().required()
      .messages({
        'string.empty': "OTP cannot be empty."
      })
  })
}
const resendVerifyLink = {
  query: Joi.object().keys({
    userId: Joi.required().custom(objectId).messages({
      'string.empty': "Userid cannot be empty.",
      'string.valid': "Userid must be a valid mongo id.",
    })
  })
}
module.exports = {
  login,
  checkResetLink,
  resetPassword,
  forgotPassword,
  loginWithGmail,
  loginWithFacebook,
  refreshTokens,
  changePassword,
  updateProfilePic,
  verifyOTP,
  resendVerifyLink
};

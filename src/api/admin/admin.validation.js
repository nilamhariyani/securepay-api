const Joi = require('@hapi/joi');
const { password } = require('../common/custom.validation')

const addStaffMember = {
    body: Joi.object().keys({
        firstName: Joi.string()
            .required()
            .messages({
                'string.empty': "first Name cannot be empty."
            }),
        lastName: Joi.string()
            .required()
            .messages({
                'string.empty': "last Name cannot be empty."
            }),
        email: Joi.string()
            .required()
            .messages({
                "string.email": "Are you sure you entered the valid email address?",
                "string.empty": "Email address cannot be empty.",
            }),
        dialCode: Joi.string()
            .required()
            .messages({
                'string.empty': "Dial code cannot be empty."
            }),
        number: Joi.string()
            .required()
            .messages({
                'string.empty': "number cannot be empty."
            })
    })
}

const getStaffList = {
    query: Joi.object().keys({
        page: Joi.number(),
        limit: Joi.number(),
        search: Joi.string(),
        sortBy: Joi.string()
    })
};

const deleteStaffMember = {
    query: Joi.object().keys({
        id: Joi.string()
            .required()
            .messages({
                "string.empty": "ID Should Not be Empty.",
            }),
    })
}

const updateStaffMember = {
    query: Joi.object().keys({
        staffId: Joi.string()
            .required()
            .messages({
                "string.empty": "ID Should Not be Empty.",
            }),
    }),
    body: Joi.object().keys({
        isEnable: Joi.boolean(),
        firstName: Joi.string(),
        lastName: Joi.string(),
        commission: Joi.object(),
        email: Joi.string()
            .messages({
                "string.email": "Are you sure you entered the valid email address?",
                "string.empty": "Email address cannot be empty.",
            }),
        dialCode: Joi.string()
            .messages({
                'string.empty': "Dial code cannot be empty."
            }),
        number: Joi.string()
            .messages({
                'string.empty': "number cannot be empty."
            })
    })
}

const setPassword = {
    query: Joi.object().keys({
        token: Joi.string()
            .messages({
                'string.empty': "token cannot be empty."
            }),
    }),
    body: Joi.object().keys({
        otp: Joi.number()
            .messages({
                'number.empty': "otp cannot be empty."
            }),
        password: Joi.string()
            .custom(password)
            .messages({
                'string.empty': "New password cannot be empty."
            }),
    })
}

const checkToken = {
    query: Joi.object().keys({
        token: Joi.string()
            .messages({
                'string.empty': "token cannot be empty."
            }),
    })
}
const getCommission = {
}
const totalRevenue = {
    query: Joi.object().keys({
        key: Joi.string().required()
            .messages({
                'string.empty': "key cannot be empty."
            }),
        year: Joi.number(),
        month: Joi.number(),
        startDate: Joi.date(),
        endDate: Joi.date()
    })
}
const totalCommission = {
    query: Joi.object().keys({
        key: Joi.string().required()
            .messages({
                'string.empty': "key cannot be empty."
            }),
        year: Joi.number(),
        month: Joi.number(),
        startDate: Joi.date(),
        endDate: Joi.date()
    })
}
const jobDashboard = {
    query: Joi.object().keys({
        key: Joi.string().required()
            .messages({
                'string.empty': "key cannot be empty."
            }),
        year: Joi.number(),
        month: Joi.number(),
        startDate: Joi.date(),
        endDate: Joi.date()
    })
}

module.exports = {
    addStaffMember,
    getStaffList,
    deleteStaffMember,
    updateStaffMember,
    setPassword,
    checkToken,
    getCommission,
    totalRevenue,
    totalCommission,
    jobDashboard
}
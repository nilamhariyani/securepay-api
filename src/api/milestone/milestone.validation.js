const Joimain = require("@hapi/joi");
const JoiDate = require('@hapi/joi-date');
const Joi = Joimain.extend(JoiDate)
const { objectId } = require('../common/custom.validation');

const deleteMilestone = {
    params: Joi.object().keys({
        milestoneId: Joi.required().custom(objectId).messages({
            'string.empty': "Milestoneid cannot be empty."
        })
    })
}
const updateMilestone = {
    params: Joi.object().keys({
        milestoneId: Joi.required().custom(objectId).messages({
            'string.empty': "Milestoneid cannot be empty."
        })
    }),
    body: Joi.object().keys({
        title: Joi.string()
            .required()
            .messages({
                'string.empty': "Title cannot be empty."
            }),
        amount: Joi.string()
            .required()
            .messages({
                'string.empty': "Amount cannot be empty."
            }),
        description: Joi.string()
            .required()
            .messages({
                'string.empty': "Description cannot be empty."
            }),
        completionDate: Joi.date()
            .required()
            .format('YYYY-MM-DD')
            .messages({
                'string.empty': "Completion date cannot be empty.",
                'date.format': "Completion date must be in YYYY-MM-DD format."
            })
    })
}
const addMilestone = {
    body: Joi.object().keys({
        jobId: Joi.string().custom(objectId)
            .required()
            .messages({
                'string.empty': "jobId cannot be empty."
            }),
        title: Joi.string()
            .required()
            .messages({
                'string.empty': "Title cannot be empty."
            }),
        description: Joi.string()
            .required()
            .messages({
                'string.empty': "Description cannot be empty."
            }),
        completionDate: Joi.date()
            .required()
            .format('YYYY-MM-DD')
            .messages({
                'string.empty': "Completion date cannot be empty.",
                'date.format': "Completion date must be in YYYY-MM-DD format."
            }),
        amount: Joi.number()
            .required()
            .messages({
                'string.empty': "Amount cannot be empty."
            })
    })
}

module.exports = {
    deleteMilestone,
    updateMilestone,
    addMilestone
};

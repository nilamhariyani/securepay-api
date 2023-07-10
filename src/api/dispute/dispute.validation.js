
const Joi = require('@hapi/joi');
const { objectId } = require('../common/custom.validation');

const raisedDispute = {
    body: Joi.object().keys({
        jobId: Joi.string().custom(objectId)
            .required()
            .messages({
                'string.empty': "Job Id cannot be empty."
            }),
        milestoneId: Joi.string().custom(objectId)
            .required()
            .messages({
                'string.empty': "Milestone Id cannot be empty."
            }),
        description: Joi.string()
            .required()
            .messages({
                'string.empty': "Description cannot be empty."
            })   
    })
}
const getDisputeList = {
    query: Joi.object().keys({
        page: Joi.number(),
        limit: Joi.number(),
        search: Joi.string(),
        status: Joi.string(),
        minAmount: Joi.number(),
        maxAmount: Joi.number(),
        sortBy: Joi.string()
    })
}
const getDisputeDetails = {
    query: Joi.object().keys({
        disputeId: Joi.required().custom(objectId).messages({
            'string.empty': "Dispute id cannot be empty."
        }),
    })
}
const disputeAnnounce = {
    query: Joi.object().keys({
        disputeId: Joi.required().custom(objectId).messages({
            'string.empty': "Dispute id cannot be empty."
        }),
    }),
    body: Joi.object().keys({
        conclusion: Joi.string()
            .required()
            .messages({
                'string.empty': "Conclusion cannot be empty."
            }),
        conclusionStatement: Joi.string()
            .required()
            .messages({
                'string.empty': "Conclusion Statement cannot be empty."
            }),
        amountPayClient: Joi.number(),
        amountRefundCustomer: Joi.number()
    })
}
const disputeAccept = {
    query: Joi.object().keys({
        disputeId: Joi.required().custom(objectId).messages({
            'string.empty': "Dispute id cannot be empty."
        }),
    }),
    body: Joi.object().keys({
        userType: Joi.string()
            .required()
            .messages({
                'string.empty': "User Type cannot be empty."
            }),
        response: Joi.string()
            .required()
            .messages({
                'string.empty': "Response cannot be empty."
            })
    })
}
const disputeMilestoneDetails =  {
    query: Joi.object().keys({
        milestoneId: Joi.required().custom(objectId).messages({
            'string.empty': "Milestone id cannot be empty."
        })
    })
}
const updateDispute =  {
    query: Joi.object().keys({
        disputeId: Joi.required().custom(objectId).messages({
            'string.empty': "Dispute id cannot be empty."
        })
    }),
    body: Joi.object().keys({
        channelId: Joi.string()
            .required()
            .messages({
                'string.empty': "channelId cannot be empty."
            })
    })
}
module.exports = {
    raisedDispute,
    getDisputeList,
    getDisputeDetails,
    disputeAnnounce,
    disputeAccept,
    disputeMilestoneDetails,
    updateDispute
};

const Joi = require("@hapi/joi");

const { objectId } = require('../common/custom.validation');


const escrowPaymentsWithBank = {
    body: Joi.object().keys({
        mileStoneId: Joi.string().custom(objectId)
            .required()
            .messages({
                'string.empty': "MileStone id cannot be empty."
            }),
        paymentType: Joi.string()
            .required()
            .messages({
                'string.empty': "Payment type cannot be empty."
            })

    })
}
const escrowPaymentsWithCard = {
    body: Joi.object().keys({
        mileStoneId: Joi.string().custom(objectId)
            .required()
            .messages({
                'string.empty': "MileStone id cannot be empty."
            }),
        paymentType: Joi.string()
            .required()
            .messages({
                'string.empty': "Payment type cannot be empty."
            }),
        cardId: Joi.string()
            .required()
            .messages({
                'string.empty': "Card Id cannot be empty."
            })

    })
}
const paymentRelease = {
    body: Joi.object().keys({
        mileStoneId: Joi.string().custom(objectId)
            .required()
            .messages({
                'string.empty': "MileStone id cannot be empty."
            })

    })
}
const getTrueLayerStatus = {
    query: Joi.object().keys({
        paymentId: Joi.string()
            .required()
            .messages({
                'string.empty': "Payment id cannot be empty."
            }),
        mileStoneId: Joi.string().custom(objectId)
            .required()
            .messages({
                'string.empty': "Milestone id cannot be empty."
            }),
        jobId: Joi.string().custom(objectId)
            .required()
            .messages({
                'string.empty': "Job id cannot be empty."
            })

    })
}
const paymentReleaseRequest = {
    query: Joi.object().keys({
        mileStoneId: Joi.string().custom(objectId)
            .required()
            .messages({
                'string.empty': "Milestone id cannot be empty."
            })
    })
}
const getPaymentHistory = {

}
module.exports = {
    escrowPaymentsWithBank,
    paymentRelease,
    getTrueLayerStatus,
    escrowPaymentsWithCard,
    paymentReleaseRequest,
    getPaymentHistory
};
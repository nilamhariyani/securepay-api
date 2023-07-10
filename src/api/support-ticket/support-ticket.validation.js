
const Joi = require('@hapi/joi');
const { objectId } = require('../common/custom.validation');

const createSupportTicket = {
    body: Joi.object().keys({
        title: Joi.string()
            .required()
            .messages({
                'string.empty': "Title cannot be empty."
            }),
        description: Joi.string()
            .required()
            .messages({
                'string.empty': "Description cannot be empty."
            })
    })
}
const getSupportTicket = {
    query: Joi.object().keys({
        page: Joi.number(),
        limit: Joi.number(),
        search: Joi.string(),
        status: Joi.string(),
        startDate: Joi.string(),
        endDate: Joi.string(),
        sortBy: Joi.string(),
        staff: Joi.string()
    })
}
const getSupportTicketDetail = {
    query: Joi.object().keys({
        ticketId: Joi.required().custom(objectId).messages({
            'string.empty': "Ticket id cannot be empty."
        }),
    })
}
const commentSupportTicket = {
    body: Joi.object().keys({
        ticketId: Joi.required().custom(objectId).messages({
            'string.empty': "Ticket id cannot be empty."
        }),
        description: Joi.string()
            .required()
            .messages({
                'string.empty': "Description cannot be empty."
            })
    })
}
const supportTicketResolve = {
    query: Joi.object().keys({
        ticketId: Joi.required().custom(objectId).messages({
            'string.empty': "Ticket id cannot be empty."
        }),
    })
}
module.exports = {
    createSupportTicket,
    getSupportTicket,
    getSupportTicketDetail,
    commentSupportTicket,
    supportTicketResolve
};


const Joi = require('@hapi/joi');
const { objectId } = require('../common/custom.validation');

const getInviteUserList = {

};
const createJob = {
  body: Joi.object().keys({
    email: Joi.string()
      .email()
      .required()
      .messages({
        "string.email": "Are you sure you entered the valid email address?",
        "string.empty": "Email address cannot be empty.",
      }),
    firstname: Joi.string()
      .required()
      .messages({
        "string.empty": "FirstName cannot be empty.",
      }),
    lastname: Joi.string()
      .required()
      .messages({
        "string.empty": "LastName cannot be empty.",
      }),
    businessname: Joi.string(),
    jobName: Joi.string()
      .required()
      .messages({
        "string.empty": "jobName cannot be empty.",
      }),
    description: Joi.string()
      .required()
      .messages({
        "string.empty": "Description cannot be empty.",
      }),
    totalAmount: Joi.number()
      .required()
      .messages({
        "number.empty": "Total amount cannot be empty.",
      }),
    serviceFee: Joi.number()
      .required()
      .messages({
        "number.empty": "Service fee cannot be empty.",
      }),
    servicePercentage: Joi.number()
      .required()
      .messages({
        "number.empty": "Service percentage cannot be empty.",
      }),
    amount: Joi.number()
      .required()
      .messages({
        "number.empty": "Amount cannot be empty.",
      }),
    isFullPayment: Joi.boolean(),
    milestoneData: Joi.array(),
    rate: Joi.array(),
  }),
};
const getJobDetail = {
  query: Joi.object().keys({
    jobId: Joi.string().required().messages({
      'string.empty': "jobId cannot be empty."
    }),

  })
};

const getJob = {
  query: Joi.object().keys({
    page: Joi.number(),
    limit: Joi.number(),
    search: Joi.string(),
    minAmount: Joi.number(),
    maxAmount: Joi.number(),
    status: Joi.string(),
    sortBy: Joi.string(),
    adminfeesMin: Joi.number(),
    adminfeesMax: Joi.number()
  }),
};

const getInvited = {
  query: Joi.object().keys({
    page: Joi.number(),
    limit: Joi.number(),
    search: Joi.string(),
    minAmount: Joi.number(),
    maxAmount: Joi.number(),

    status: Joi.string(),
    sortBy: Joi.string(),
  }),
};


const jobListing = {
  query: Joi.object().keys({
    page: Joi.number(),
    limit: Joi.number(),
    search: Joi.string(),
    minAmount: Joi.number(),
    maxAmount: Joi.number(),
    adminfeesMin: Joi.number(),
    adminfeesMax: Joi.number(),
    status: Joi.string(),
    sortBy: Joi.string(),
  }),
};

const jobAccepted = {
  params: Joi.object().keys({
    jobId: Joi.required().custom(objectId).messages({
      'string.empty': "Jobid cannot be empty."
    })
  })
}
const jobRejected = {
  params: Joi.object().keys({
    jobId: Joi.required().custom(objectId).messages({
      'string.empty': "Jobid cannot be empty."
    })
  }),
  body: Joi.object().keys({
    reason: Joi.string()
      .required()
      .messages({
        'string.empty': "Reason cannot be empty."
      })
  })
}

const confirmJobAmount = {
  params: Joi.object().keys({
    jobId: Joi.string().required().messages({
      'string.empty': "jobId cannot be empty."
    })
  }),
  body: Joi.object().keys({
    totalAmount: Joi.number()
      .required()
      .messages({
        'number.base': "Total amount must be a number.",
        'number.empty': "Total amount cannot be empty."
      }),
    servicePercentage: Joi.number()
      .required()
      .messages({
        'number.base': "Service percentage must be a number.",
        'number.empty': "Service percentage cannot be empty."
      }),
    isModification: Joi.boolean()
  })
};
const jobModificationRequest = {
  body: Joi.object().keys({
    jobId: Joi.required().custom(objectId).messages({
      'string.empty': "Jobid cannot be empty."
    }),
    note: Joi.string()
      .required()
      .messages({
        'string.empty': "Modification note cannot be empty."
      })
  })
}
module.exports = {
  getInviteUserList,
  createJob,
  getJobDetail,
  getJob,
  getInvited,
  jobAccepted,
  jobRejected,
  confirmJobAmount,
  jobModificationRequest
};

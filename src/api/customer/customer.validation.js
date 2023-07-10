const Joi = require('@hapi/joi');

const checkEmail = {
  query: Joi.object().keys({
    email: Joi.string().email().required().messages({
      'string.email': "Are you sure you entered the valid email address?",
      'string.empty': "Email address cannot be empty."
    })
  })
};



const getCustomerList = {
  query: Joi.object().keys({
    page: Joi.number(),
    limit: Joi.number(),
    search: Joi.string(),
    minAmount: Joi.number(),
    maxAmount: Joi.number(),
    sortBy: Joi.string(),
  })
};
const customerDisabled = {
  query: Joi.object().keys({
    customerId: Joi.string()
      .required()
      .messages({
        "string.empty": "Customer Id cannot be empty.",
      })
  }),
  body: Joi.object().keys({
    isEnable: Joi.boolean()
      .required()
      .messages({
        "boolean.empty": "isEnable cannot be empty.",
      }),
  }),
};
const updateBankInfo = {
  body: Joi.object().keys({
    accountNumber: Joi.string()
      .required()
      .messages({
        'string.empty': "Account Number cannot be empty."
      }),
    sortCode: Joi.string()
      .required()
      .messages({
        'string.empty': "Sort Code cannot be empty."
      }),
    identityProof: Joi.string()
  })
}
const updatePersonalInfo = {
  body: Joi.object().keys({
    firstName: Joi.string()
      .required()
      .messages({
        'string.empty': "Firstname cannot be empty."
      }),
    lastName: Joi.string()
      .required()
      .messages({
        'string.empty': "Lastname cannot be empty."
      }),
    country: Joi.string()
      .required()
      .messages({
        'string.empty': "Country cannot be empty."
      }),
    dob: Joi.string()
      .required()
      .messages({
        'string.empty': "Date of Birth cannot be empty."
      }),
    number: Joi.string()
      .required()
      .messages({
        'string.empty': "Number cannot be empty."
      }),
    dialCode: Joi.string()
      .required()
      .messages({
        'string.empty': "Dial code cannot be empty."
      }),
    houseNo: Joi.string(),
    addressLine1: Joi.string()
      .required()
      .messages({
        'string.empty': "AddressLine1 cannot be empty."
      }),
    addressLine2: Joi.string(),
    city: Joi.string()
      .required()
      .messages({
        'string.empty': "City cannot be empty."
      }),
    region: Joi.string()
      .required()
      .messages({
        'string.empty': "Region cannot be empty."
      }),
    postalCode: Joi.string()
      .required()
      .messages({
        'string.empty': "Postal Code cannot be empty."
      })
  })
}

const updateCompanyInfo = {
  body: Joi.object().keys({
    name: Joi.string()
      .required()
      .messages({
        'string.empty': "Company name cannot be empty."
      }),
    number: Joi.string()
      .required()
      .messages({
        'string.empty': "Company number cannot be empty."
      }),

    houseNo: Joi.string()
      .required()
      .messages({
        'string.empty': "house Number cannot be empty."
      }),
    country: Joi.string()
      .required()
      .messages({
        'string.empty': "country cannot be empty."
      }),
    addressLine1: Joi.string()
      .required()
      .messages({
        'string.empty': "AddressLine1 cannot be empty."
      }),
    addressLine2: Joi.string(),
    city: Joi.string()
      .required()
      .messages({
        'string.empty': "City cannot be empty."
      }),
    region: Joi.string()
      .required()
      .messages({
        'string.empty': "Region cannot be empty."
      }),
    postalCode: Joi.string()
      .required()
      .messages({
        'string.empty': "Postal Code cannot be empty."
      })
  })
}

const addUBO = {

  firstName: Joi.string()
    .required()
    .messages({
      'string.empty': "name cannot be empty."
    }),
  lastName: Joi.string()
    .required()
    .messages({
      'string.empty': "name cannot be empty."
    }),

  nationality: Joi.string()
    .required()
    .messages({
      'string.empty': "country cannot be empty."
    }),

  addressLine1: Joi.string()
    .required()
    .messages({
      'string.empty': "AddressLine1 cannot be empty."
    }),
  addressLine2: Joi.string(),
  city: Joi.string()
    .required()
    .messages({
      'string.empty': "City cannot be empty."
    }),
  region: Joi.string()
    .required()
    .messages({
      'string.empty': "Region cannot be empty."
    }),
  postalCode: Joi.string()
    .required()
    .messages({
      'string.empty': "Postal Code cannot be empty."
    })
}

const updateUBO = {

  firstName: Joi.string()
    .required()
    .messages({
      'string.empty': "name cannot be empty."
    }),
  lastName: Joi.string()
    .required()
    .messages({
      'string.empty': "name cannot be empty."
    }),

  nationality: Joi.string()
    .required()
    .messages({
      'string.empty': "country cannot be empty."
    }),

  addressLine1: Joi.string()
    .required()
    .messages({
      'string.empty': "AddressLine1 cannot be empty."
    }),
  addressLine2: Joi.string(),
  city: Joi.string()
    .required()
    .messages({
      'string.empty': "City cannot be empty."
    }),
  region: Joi.string()
    .required()
    .messages({
      'string.empty': "Region cannot be empty."
    }),
  postalCode: Joi.string()
    .required()
    .messages({
      'string.empty': "Postal Code cannot be empty."
    }),
  dob: Joi.string()
    .required()
    .messages({
      'string.empty': "date of birth cannot be empty."
    }),
  uboId: Joi.string()
    .required()
}

const inviteCustomer = {
  body: Joi.object().keys({
    firstName: Joi.string()
      .required()
      .messages({
        'string.empty': "First name cannot be empty."
      }),
    lastName: Joi.string()
      .required()
      .messages({
        'string.empty': "Last name cannot be empty."
      }),
    email: Joi.string().email()
      .required()
      .messages({
        'string.email': "Are you sure you entered the valid email address?",
        'string.empty': "Email address cannot be empty."
      }),
    number: Joi.string()
      .required()
      .messages({
        'string.empty': "Number cannot be empty."
      }),
    dialCode: Joi.string()
      .required()
      .messages({
        'string.empty': "Dial code cannot be empty."
      })
  })
}

module.exports = {
  checkEmail,
  getCustomerList,
  customerDisabled,
  updateBankInfo,
  updatePersonalInfo,
  updateCompanyInfo,
  addUBO,
  updateUBO,
  inviteCustomer
};

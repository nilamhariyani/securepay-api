var mongoose = require('mongoose');
var validator = require('validator');
const bcrypt = require('bcryptjs');
const { omit, pick } = require('lodash');
const { ROLES, DEFAULT_IMAGE, ACCOUNT_TYPE } = require('../config/constant');
var Schema = mongoose.Schema;

var customerSchema = new Schema({
    email: {
        type: String,
        trim: true,
        lowercase: true,
        // validate(value) {
        //     if (!validator.isEmail(value)) {
        //         throw new Error('Invalid email');
        //     }
        // },
    },
    password: {
        type: String,
        trim: true,
        minlength: 8,
        // validate(value) {
        //     if (!value.match(/\d/) || !value.match(/[a-zA-Z]/)) {
        //         throw new Error('Password must contain at least one letter and one number');
        //     }
        // },
    },
    facebookId: {
        type: String
    },
    gmailId: {
        type: String
    },
    customerId: {
        type: String
    },
    bankId: {
        type: String
    },
    uboDeclarationId: {
        type: String
    },
    walletId: {
        type: String
    },
    kycDocsId: {
        type: String
    },
    firstName: {
        type: String
    },
    lastName: {
        type: String
    },
    dob: {
        type: Date
    },
    role: {
        type: Number,
        enum: [ROLES.CLIENT, ROLES.CUSTOMER],
        default: ROLES.CLIENT
    },
    dialCode: {
        type: String
    },
    number: {
        type: String
    },
    country: {
        type: String
    },
    address: {
        houseNo: {
            type: String
        },
        addressLine1: {
            type: String
        },
        addressLine2: {
            type: String
        },
        city: {
            type: String
        },
        region: {
            type: String
        },
        postalCode: {
            type: String
        }
    },
    companyAddress: {
        houseNo: {
            type: String
        },
        addressLine1: {
            type: String
        },
        addressLine2: {
            type: String
        },
        city: {
            type: String
        },
        region: {
            type: String
        },
        postalCode: {
            type: String
        }
    },
    accountType: {
        type: Number,
        enum: [ACCOUNT_TYPE.INDIVIDUAL, ACCOUNT_TYPE.ORGANIZATION]
    },
    profilePic: { type: String, default: DEFAULT_IMAGE.DUMMYPROFILE },
    profilePicURL: { type: String, default: DEFAULT_IMAGE.URL },
    isDeleted: { type: Boolean, default: false },
    isEnable: { type: Boolean, default: false },
    registerStep: { type: Number },
    registerComplete: { type: Boolean, default: false },
    verifyOtp: { type: Number },
    bankInfo: {
        accountNumber: {
            type: String
        },
        sortCode: {
            type: String
        }
    },
    isVerified: {
        type: Boolean, default: true
    },
    identityProof: {
        type: String
    },
    company: {
        name: {
            type: String
        },
        number: {
            type: String
        }
    },
    uboInfo: [
        {
            firstName: {
                type: String
            },
            lastName: {
                type: String
            },
            dob: {
                type: Date
            },
            nationality: {
                type: String
            },
            uboId: {
                type: String
            },
            address: {
                houseNo: {
                    type: String
                },
                addressLine: {
                    type: String
                },
                city: {
                    type: String
                },
                region: {
                    type: String
                },
                postalCode: {
                    type: String
                }
            }
        }
    ],
    commission: {
        type: Array,
        default: [
            {
                amount: 1100,
                intrest: 15
            },
            {
                amount: 5100,
                intrest: 10
            },
            {
                amount: 50000,
                intrest: 5
            }
        ]
    }
}, {
        timestamps: true,
        toObject: { getters: true },
        toJSON: { getters: true },
    });

customerSchema.methods.toJSON = function () {
    const client = this;
    return omit(client.toObject(), ['password']);
};
customerSchema.methods.transform = function () {
    const user = this;
    return pick(user.toJSON(), ['_id', 'email', 'firstName', 'lastName', 'role', 'registerStep', 'registerComplete', 'dialCode', 'number',]);
};
customerSchema.pre('save', async function (next) {
    const client = this;
    if (client.isModified('password')) {
        client.password = await bcrypt.hash(client.password, 8);
    }
    next();
});

const customer = mongoose.model('Customer', customerSchema);

module.exports = customer;
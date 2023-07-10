const Customer = require('../../models/customer.model');
const AppError = require('../../utils/AppError');
const httpStatus = require('http-status');
const { pick, get, result } = require('lodash');
const cloudinaryService = require('../common/cloudinary.service')
const mangopayService = require('../common/mangopay.service')
const commonService = require("../common/common.service");
const { getQueryOptions } = require('../../utils/service.util');
const mongoose = require('mongoose');
const Messages = require('../../utils/messages');
const ObjectId = mongoose.Types.ObjectId
const fs = require('fs');
const { ACCOUNT_TYPE } = require('../../config/constant')


const getCustomerByEmail = async (email) => {
  const customer = await Customer.findOne({ email })
  if (!customer) {
    throw new AppError(httpStatus.UNPROCESSABLE_ENTITY, Messages.EMAIL_NOT_FOUND);
  }

  return customer
}
const getUserById = async (userId) => {
  const user = await Customer.findById(userId);
  if (!user) {
    throw new AppError(httpStatus.NOT_FOUND, Messages.ID_NOT_FOUND);
  }
  return user;
};

const getUserByIdForJob = async (req) => {

  const user = await Customer.findOne({ email: req.body.email });
  if (!user) {
    const userBody = {
      email: req.body.email,
      firstName: req.body.firstname,
      lastName: req.body.lastname,
      company: {
        name: req.body.businessname,
      },
      role: 3
    };
    const customer = await createCustomer(userBody);
    return { customer: customer, isRegistered: false };
  } else {
    return { customer: user, isRegistered: true };
  }
}

const updateUser = async (userId, updateBody) => {
  const user = await getUserById(userId);

  Object.assign(user, updateBody);
  await user.save();
  return user;
};
const createCustomer = async (userBody) => {
  const customer = await Customer.create(userBody);
  return customer;
};
const checkDuplicateEmail = async (email, excludeUserId) => {
  const customer = await Customer.findOne({ email });
  if (customer) {
    // if (!customer.registerComplete) {
    // if (user.isDeleted) {
    //   // const value = await User.remove({ _id: user._id });
    //   // const receiveRequest = await Request.remove({ receiveId: user._id }, { multi: true });
    //   // const senderRequest = await Request.remove({ senderId: user._id }, { multi: true });
    //   return null
    // } else {
    throw new AppError(httpStatus.BAD_REQUEST, Messages.ALREADY_EXITS);
    // }
  } else {
    return null
  }
};
const checkDuplicateEmailWithId = async (email, excludeUserId) => {
  const customer = await Customer.findOne({ email });
  if (customer) {
    if (!customer.registerComplete) {
      if (excludeUserId == customer._id) {
        return null
      } else {
        throw new AppError(httpStatus.BAD_REQUEST, Messages.ALREADY_EXITS);
      }
    } else {
      throw new AppError(httpStatus.BAD_REQUEST, Messages.ALREADY_EXITS);
    }
  } else {
    return null
  }
};
const getGmailUser = async (req) => {
  let result = await Customer.findOne({ email: req.email, gmailId: req.gmailId });
  if (result) {
    return result;
  } else {
    let mailcheck = await Customer.findOne({ email: req.email });
    if (!mailcheck) {
      return { register_status: false };
    } else {
      if (mailcheck.facebookId) {
        throw new AppError(httpStatus.UNPROCESSABLE_ENTITY, Messages.REGISTERED_WITH_FACEBOOK);
      } else {
        throw new AppError(httpStatus.UNPROCESSABLE_ENTITY, Messages.REGISTERED_WITH_EMAIL);
      }
    }
  }
}
const getFacebookUser = async (req) => {
  let result = await Customer.findOne({ facebookId: req.facebookId, email: req.email });
  if (result) {
    return result;
  } else {
    let mailcheck = await Customer.findOne({ email: req.email });
    if (!mailcheck) {
      return { register_status: false };
    } else {
      if (mailcheck.gmailId) {
        throw new AppError(httpStatus.UNPROCESSABLE_ENTITY, Messages.REGISTERED_WITH_GOOGLE);
      } else {
        throw new AppError(httpStatus.UNPROCESSABLE_ENTITY, Messages.REGISTERED_WITH_EMAIL);
      }
    }
  }
};

const getCustomerList = async (req) => {
  const { minAmount, maxAmount, category, search } = req.query;
  const { limit, skip, page, sort } = getQueryOptions(req.query);

  let filter = {};
  let searchfilter = {};

  //filter = { userId: new ObjectId(req.user._id) };
  const searchFields = ["fullName", "companyName", "email", "contactNumber"];

  if (search) {
    searchfilter["$or"] = searchFields.map((field) => ({
      [field]: { $regex: search, $options: "i" },
    }));
  }

  if (minAmount && maxAmount) {
    searchfilter.Amount = {
      $gt: parseInt(minAmount),
      $lt: parseInt(maxAmount),
    };
  } else {
    if (minAmount) {
      searchfilter.Amount = {
        $gte: parseInt(minAmount),
      };
    }
    if (maxAmount) {
      searchfilter.Amount = {
        $lte: parseInt(maxAmount),
      };
    }
  }
  // filter.role = 3;

  let totalRecord = await Customer.count({ role: 3 });
  let customerDetails = await Customer.aggregate([
    [
      {
        $match: { registerComplete: true },
      },
      {
        $project: {
          profilePic: 1,
          profilePicURL: 1,
          isEnable: 1,
          firstName: 1,
          lastName: 1,
          email: 1,
          dialCode: 1,
          number: 1,
          commission: 1,
          createdAt: 1
        }
      },
      {
        $lookup: {
          from: "jobs",
          let: {
            id: "$_id",
          },
          pipeline: [
            {
              $match: {
                $expr: {
                  $or: [
                    { $eq: ["$userId", "$$id"] },
                    { $eq: ["$inviteUserId", "$$id"] }
                  ]
                }
              }
            },
          ],
          as: "listJob",
        },
      },
      {
        $addFields: {
          totalJobs: {
            $cond: {
              if: {
                $isArray: "$listJob",
              },
              then: {
                $size: "$listJob",
              },
              else: "NA",
            },
          },
        },
      },
      {
        $addFields: {
          fullName: {
            $concat: ["$firstName", " ", "$lastName"],
          },
        },
      },
      {
        $addFields: {
          contactNumber: {
            $concat: ["+", "$dialCode", " ", "$number"],
          },
        },
      },
      {
        $addFields: {
          ongoingJob: {
            $size: {
              $filter: {
                input: "$listJob",
                as: "num",
                cond: {
                  $or: [
                    {
                      $eq: ["$$num.status", "PAYMENT_IN_DEPOSITE"],
                    },
                    {
                      $eq: ["$$num.status", "RELEASE_REQUESTED"],
                    },
                    {
                      $eq: ["$$num.status", "PAYMENT_RELEASE"],
                    },

                  ],
                },
              },
            },
          },
        },
      },
      {
        $addFields: {
          CompltedJob: {
            $size: {
              $filter: {
                input: "$listJob",
                as: "num",
                cond: {
                  $or: [
                    {
                      $eq: ["$$num.status", "JOB_COMPLETE"],
                    },
                  ],
                },
              },
            },
          },
        },
      },
      {
        $addFields: {
          DisputeJob: {
            $size: {
              $filter: {
                input: "$listJob",
                as: "num",
                cond: {
                  $or: [
                    {
                      $eq: ["$$num.status", "DISPUTE"],
                    },
                  ],
                },
              },
            },
          },
        },
      },
      {
        $lookup: {
          from: "milestones",
          let: {
            id: "$_id",
          },
          pipeline: [
            {
              $match: {
                $expr: {
                  $and: [
                    {
                      $eq: ["$userId", "$$id"],
                    },
                    {
                      $eq: ["$status", "PAYMENT_COMPLETE"],
                    },
                  ],
                },
              },
            },
            {
              $group: {
                _id: "$$id",
                total: {
                  $sum: "$amount",
                },
              },
            },
          ],
          as: "Amount",
        },
      },
      {
        $unwind: {
          path: "$Amount",
          includeArrayIndex: "index",
          preserveNullAndEmptyArrays: true,
        },
      },

      { $match: searchfilter },
      { $sort: sort },
      { $skip: parseInt(skip) },
      { $limit: parseInt(limit) },
      {
        $project: {
          fullName: 1,
          companyName: 1,
          email: 1,
          contactNumber: 1,
          ongoingJob: 1,
          totalJobs: 1,
          CompltedJob: 1,
          DisputeJob: 1,
          profilePicURL: 1,
          profilePic: 1,
          Amount: '$Amount.total',
          isEnable: 1,
          commission: 1,
        },
      },
    ],
  ]).collation({ locale: "en" });
  QueryResult = customerDetails.length;
  let response = { customerDetails, totalRecord, QueryResult };
  return response;
}

const changeStatus = async (req) => {
  const results = await updateUser(req.query.customerId, req.body);
  return results;
};

const updateBankInfo = async (req) => {
  // console.log(req.user.id)
  const userData = await getUserById(req.user.id);
  // console.log(userData);

  let bankParam = {
    SortCode: req.body.sortCode,
    AccountNumber: req.body.accountNumber,
    OwnerName: userData.firstName + ' ' + userData.lastName,
    OwnerAddress: {
      "AddressLine1": userData.address.addressLine1,
      "AddressLine2": userData.address.addressLine2,
      "City": userData.address.city,
      "Region": userData.address.region,
      "PostalCode": userData.address.postalCode,
      "Country": userData.country
    }
  }
  // if (userData.bankId) {
  //   let body = {
  //     Active: false
  //   };
  //   await mangopayService.deactivateBankAccount(body, userData.customerId, userData.bankId);
  // }
  // let bankDetail = await mangopayService.createBankAccount(bankParam, userData.customerId)

  // let declaration;
  // let kycData;

  // if (userData.kycDocsId) {
  //   declaration = userData.kycDocsId;
  // } else {
  // kycData = await mangopayService.createkycDoc(userData.customerId);
  // declaration = kycData.Id;
  // }
  // if (req.file) {

  //   let url = await cloudinaryService.uploadOnCloudinary(req.file.path, req.file.originalname);
  //   let imageURL = url.secure_url.split('/upload')
  //   req.body.identityProof = imageURL[1];


  //   // console.log(declaration)
  //   const contents = fs.readFileSync(req.file.path, { encoding: 'base64' });
  //   // console.log(contents);
  //   await mangopayService.createkycPage(userData.customerId, declaration, contents)

  // }

  let body = {
    bankId: bankDetail.Id,
    bankInfo: { 'accountNumber': req.body.accountNumber, 'sortCode': req.body.sortCode },
    // kycDocsId: declaration,
    identityProof: req.body.identityProof
  }
  const users = await updateUser(req.user.id, body);

  return users

}

const updatePersonalInfo = async (req) => {
  const userData = await getUserById(req.user.id);

  if (userData.accountType === ACCOUNT_TYPE.ORGANIZATION) {
    let param = {
      "LegalPersonType": "BUSINESS",
      "Name": userData.company.name,
      "LegalRepresentativeAddress": {
        "AddressLine1": req.body.addressLine1,
        "AddressLine2": req.body.addressLine2,
        "City": req.body.city,
        "Region": req.body.region,
        "PostalCode": req.body.postalCode,
        "Country": req.body.country
      },
      "LegalRepresentativeFirstName": req.body.firstName,
      "LegalRepresentativeLastName": req.body.lastName,
      "LegalRepresentativeEmail": userData.email,
      "LegalRepresentativeBirthday": new Date(req.body.dob).getTime() / 1000,
      "LegalRepresentativeNationality": req.body.country,
      "LegalRepresentativeCountryOfResidence": req.body.country,
      "CompanyNumber": userData.company.number,
      "Email": userData.email,
    }
    // mangoData = await mangopayService.updateLegalUser(param, userData.customerId);
    console.log(param);
  } else {
    let param = {
      FirstName: req.body.firstName,
      LastName: req.body.lastName,
      Birthday: new Date(req.body.dob).getTime() / 1000,
      Nationality: req.body.country,
      CountryOfResidence: req.body.country,
      Email: userData.email,
    };
    // mangoData = await mangopayService.updateNaturalUser(param, userData.customerId);
  }
  let body = {
    firstName: req.body.firstName,
    lastName: req.body.lastName,
    dob: req.body.dob,
    number: req.body.number,
    dialCode: req.body.dialCode,
    country: req.body.country,
    address: {
      'houseNo': req.body.houseNo,
      'addressLine1': req.body.addressLine1,
      'addressLine2': req.body.addressLine2,
      'city': req.body.city,
      'region': req.body.region,
      'postalCode': req.body.postalCode
    }
  }
  const users = await updateUser(req.user.id, body);
  return users;
}

const updateCompanyInfo = async (req) => {

  const userData = await getUserById(req.user.id);
  let param = {
    "LegalPersonType": "BUSINESS",
    "Name": req.body.name,
    "LegalRepresentativeAddress": {
      "AddressLine1": req.body.addressLine1,
      "AddressLine2": req.body.addressLine2,
      "City": req.body.city,
      "Region": req.body.region,
      "PostalCode": req.body.postalCode,
      "Country": req.body.country
    },
    "LegalRepresentativeFirstName": userData.firstName,
    "LegalRepresentativeLastName": userData.lastName,
    "LegalRepresentativeEmail": userData.email,
    "LegalRepresentativeBirthday": new Date(userData.dob).getTime() / 1000,
    "LegalRepresentativeNationality": req.body.country,
    "LegalRepresentativeCountryOfResidence": req.body.country,
    "CompanyNumber": req.body.number,
    "Email": userData.email,
  }
  // let mangoData = await mangopayService.updateLegalUser(param, userData.customerId);


  let body = {
    company: {
      name: req.body.name,
      number: req.body.number,
    },
    companyAddress: {
      houseNo: req.body.houseNo,
      addressLine1: req.body.addressLine1,
      addressLine2: req.body.addressLine2,
      city: req.body.city,
      region: req.body.region,
      postalCode: req.body.postalCode
    },
    country: req.body.country
  }
  const users = await updateUser(req.user.id, body);
  return users;
}


const updateUBO = async (body, user) => {
  const userData = await getUserById(user.id);
  let declaration = userData.uboDeclarationId;
  let uboParam = {
    "FirstName": body.firstName,
    "LastName": body.lastName,
    "Address": {
      "AddressLine1": body.address.addressLine,
      "AddressLine2": "",
      "City": body.address.city,
      "Region": body.address.region,
      "PostalCode": body.address.postalCode,
      "Country": body.nationality
    },
    "Birthday": new Date(body.dob).getTime() / 1000,
    "Nationality": body.nationality,
    "Birthplace": {
      "City": body.address.city,
      "Country": body.nationality
    }
  }

  // let uboData = await mangopayService.updateUBO(uboParam, userData.customerId, declaration, body.uboId)

  let param = {
    firstName: body.firstName,
    lastName: body.lastName,
    dob: new Date(body.dob),
    nationality: body.nationality,
    uboId: body.uboId,
    address: {
      houseNo: body.address.houseNo,
      addressLine: body.address.addressLine,
      city: body.address.city,
      region: body.address.region,
      postalCode: body.address.postalCode
    },
  }
  let index = userData.uboInfo.findIndex(i => i.uboId === body.uboId);
  userData.uboInfo[index] = param;
  Object.assign(userData, userData.uboInfo);
  let newData = await userData.save();
  console.log(newData);
  return newData;
}

const addUBO = async (body, user) => {
  var userData = await getUserById(user.id);

  let declaration;
  if (userData.uboDeclarationId) {
    declaration = userData.uboDeclarationId;
  } else {
    // let uboDec = await mangopayService.createDeclaration(userData.customerId);
    declaration = uboDec.Id;
    await updateUser(user.id, { uboDeclarationId: uboDec.Id });
  }

  let uboParam = {
    "FirstName": body.firstName,
    "LastName": body.lastName,
    "Address": {
      "AddressLine1": body.address.addressLine,
      "AddressLine2": "",
      "City": body.address.city,
      "Region": body.address.region,
      "PostalCode": body.address.postalCode,
      "Country": body.nationality
    },
    "Birthday": new Date(body.dob).getTime() / 1000,
    "Nationality": body.nationality,
    "Birthplace": {
      "City": body.address.city,
      "Country": body.nationality
    }
  }
  // let uboData = await mangopayService.createUBO(uboParam, userData.customerId, declaration)

  let param = {
    firstName: body.firstName,
    lastName: body.lastName,
    dob: new Date(body.dob),
    nationality: body.nationality,
    uboId: uboData.Id,
    address: {
      houseNo: body.address.houseNo,
      addressLine: body.address.addressLine,
      city: body.address.city,
      region: body.address.region,
      postalCode: body.address.postalCode
    }
  }
  userData.uboInfo.push(param)
  Object.assign(userData, userData.uboInfo);
  let newData = await userData.save();
  return newData;
}

const getKycStatus = async (user) => {

  let client = await getUserById(user.id);

  // let kycStatus = await mangopayService.getKYCStatus(client.kycDocsId);

  return

}

const verifyAuthOTP = async (req) => {
  await getUserById(req.user.id);

  const user = await Customer.findOne({ _id: ObjectId(req.user.id), verifyOtp: req.body.verifyOtp });
  if (!user) {
    throw new AppError(httpStatus.NOT_FOUND, Messages.WRONG_OTP);
  }
  await updateUser(req.user.id, { verifyOtp: '' })
  return user;
}
const inviteCustomer = async (req) => {
  const user = await checkDuplicateEmail(req.body.email);

  const data = await createCustomer(req.body);

  return data;
}
module.exports = {
  getCustomerByEmail,
  getUserById,
  updateUser,
  createCustomer,
  checkDuplicateEmail,
  getGmailUser,
  getFacebookUser,
  getUserByIdForJob,
  checkDuplicateEmailWithId,
  getCustomerList,
  changeStatus,
  updateBankInfo,
  updatePersonalInfo,
  updateCompanyInfo,
  updateUBO,
  addUBO,
  getKycStatus,
  verifyAuthOTP,
  inviteCustomer
};

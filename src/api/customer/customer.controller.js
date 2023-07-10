const httpStatus = require('http-status');
const catchAsync = require('../../utils/catchAsync');
const createResponse = require('../../utils/response');
const Messages = require('../../utils/messages');
const customerService = require("../customer/customer.service");
const authService = require("../auth/auth.service");
const emailService = require("../common/email.service");
const { response } = require('express');

const checkEmail = catchAsync(async (req, res) => {
  const user = await customerService.getCustomerByEmail(req.query.email);
  const response = { user: user.transform() };
  createResponse(res, httpStatus.OK, Messages.LOGIN, response)
});

const getCustomerList = catchAsync(async (req, res) => {
  const user = await customerService.getCustomerList(req);
  createResponse(res, httpStatus.OK, Messages.GET_CUSTOMER_LIST, user);
});

const customerDisabled = catchAsync(async (req, res) => {
  const result = await customerService.changeStatus(req);
  if (req.body.isEnable) {
    createResponse(res, httpStatus.OK, result.firstName + ' ' + result.lastName + ' has been disabled successfully.', {});
  } else {
    createResponse(res, httpStatus.OK, result.firstName + ' ' + result.lastName + ' has been enabled successfully.', {});
  }
});

const updateBankInfo = catchAsync(async (req, res) => {
  const user = await customerService.updateBankInfo(req);
  createResponse(res, httpStatus.OK, Messages.BANK_INFO_UPDATE, user);
});

const updatePersonalInfo = catchAsync(async (req, res) => {
  const user = await customerService.updatePersonalInfo(req);
  createResponse(res, httpStatus.OK, Messages.PERSONAL_INFO_UPDATE, user);
});
const updateCompanyInfo = catchAsync(async (req, res) => {
  const updateCompany = await customerService.updateCompanyInfo(req);
  createResponse(res, httpStatus.OK, Messages.COMPANY_UPDATE_SUCCESS, updateCompany)
})

const updateUBO = catchAsync(async (req, res) => {
  var { uboId } = req.params
  let updateUbo = await customerService.updateUBO(req.body, req.user, req.params)
  createResponse(res, httpStatus.OK, Messages.UPDATE_UBO_SUCCESS, updateUbo)
})

const addUBO = catchAsync(async (req, res) => {

  const addUbo = await customerService.addUBO(req.body, req.user)
  createResponse(res, httpStatus.OK, Messages.ADD_UBO_SUCCESS, addUbo)
})

const getKycStatus = catchAsync(async (req, res) => {

  const kycStatus = await customerService.getKycStatus(req.user)
  createResponse(res, httpStatus.OK, '', kycStatus);

});

const inviteCustomer = catchAsync(async (req, res) => {
  const data = await customerService.inviteCustomer(req)
  let verifyToken = await authService.generateUserVerifyToken(
    data._id,
    data.role
  );
  // console.log(verifyToken);
  await emailService.inviteUserVerify(data.email, {
    ...data.toJSON(),
    customerName: `${data.firstName} ${data.lastName}`,
    token: verifyToken,
  });
  createResponse(res, httpStatus.OK, 'Invitation has been sent successfully.', data)
});

module.exports = {
  checkEmail,
  getCustomerList,
  customerDisabled,
  updateBankInfo,
  updatePersonalInfo,
  updateCompanyInfo,
  updateUBO,
  addUBO,
  getKycStatus,
  inviteCustomer
};

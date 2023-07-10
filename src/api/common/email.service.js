const fs = require('fs');
const path = require('path');
const nodemailer = require('nodemailer');
const handlebars = require("handlebars");
const config = require('../../config/config')
const logger = require('../../config/logger');
const sgTransport = require("nodemailer-sendgrid-transport");
let BASE_PATH = __dirname.split('/');
// BASE_PATH.splice(-1, 1);
BASE_PATH = BASE_PATH.join('/');

const emailConfig = () => {
  var options = {
    service: "SendGrid",
    auth: {
      api_key: process.env.SEND_GRID_KEY
    }
  }
  return options
}

const transporter = nodemailer.createTransport(sgTransport(emailConfig()));
const mailBody = (to, htmlToSend, subject) => {
  var mailOptions = {
    from: process.env.EMAIL_FROM,
    to: to,
    fromname: "Securepay",
    replyTo: process.env.EMAIL_FROM,
    subject: subject,
    html: htmlToSend
  };
  return mailOptions
}

const sendEmail = async (mailOptions) => {
  var info = "";
  try {
    info = await transporter.sendMail(mailOptions);
    info && console.log("send mail successfully..!!");
  } catch (error) {
    console.log({ status: false, data: {}, msg: "mail send error : " + error });
  }
  return info;
};

const sendForgotPasswordEmail = async (to, body) => {
  const subject = 'Forgot Your Securepay  Password?';
  const html = fs.readFileSync(path.join(BASE_PATH, "/public/template/ForgotPassword.html"), { encoding: "utf-8" });  // const url = `http://${process.env.HOST}/v1/reset-password?token=${body.token}`;

  var url = `${process.env.HOST}/resetpassword?token=${body.token}`;
  const template = handlebars.compile(html);
  const htmlToSend = template({
    name: body.firstName + ' ' + body.lastName,
    email: body.email,
    url,
    // deviceUrl
  });
  const mailOptions = mailBody(to, htmlToSend, subject)
  await sendEmail(mailOptions)
};

const sendUserVerify = async (to, body) => {
  var subject = 'Welcome to Securepay';
  var html = fs.readFileSync(path.join(BASE_PATH, "/public/template/VerifiedEmail.html"), { encoding: "utf-8" });

  let url = `${process.env.HOST}/verify?token=${body.token}`;

  const template = handlebars.compile(html);
  const htmlToSend = template({
    name: body.firstName + ' ' + body.lastName,
    url
  });
  const mailOptions = mailBody(to, htmlToSend, subject)
  await sendEmail(mailOptions)
};

const sendResetedPassword = async (to, body) => {
  var subject = 'Your Password On Securepay  Has Changed';
  var html = fs.readFileSync(path.join(BASE_PATH, "/public/template/ResetedPassword.html"), { encoding: "utf-8" });

  // let url = `${process.env.HOST}/verify?token=${body.token}`;

  const template = handlebars.compile(html);
  const htmlToSend = template({
    name: body.firstName + ' ' + body.lastName
  });
  const mailOptions = mailBody(to, htmlToSend, subject)
  await sendEmail(mailOptions)
};

const sendMilestoneMultiple = async (to, body) => {
  var subject = 'New Transaction Proposal on Securepay ';
  let url = `${process.env.HOST}/login`;
  var html = fs.readFileSync(path.join(BASE_PATH, "/public/template/JobCreationForMultipleMilestoneTransactions.html"), { encoding: "utf-8" });
  const template = handlebars.compile(html);
  const htmlToSend = template({
    ...body[0],
    milestonedata: body[0].mileStoneData,
    url: url
  });
  const mailOptions = mailBody(to, htmlToSend, subject)
  await sendEmail(mailOptions)
}

const sendMilestoneSingle = async (to, body) => {
  var subject = 'New Transaction Proposal on Securepay ';
  let url = `${process.env.HOST}/login`;
  var html = fs.readFileSync(path.join(BASE_PATH, "/public/template/JobCreationForSingleMilestoneTransactions.html"), { encoding: "utf-8" });
  const template = handlebars.compile(html);
  const htmlToSend = template({
    ...body[0],
    milestonedata: body[0].mileStoneData[0],
    url: url
  });
  const mailOptions = mailBody(to, htmlToSend, subject)
  await sendEmail(mailOptions)
}

const inviteUserVerify = async (to, body) => {
  var subject = "You've Been Invited To Join Securepay ";
  var html = fs.readFileSync(path.join(BASE_PATH, "/public/template/InviteUser.html"), { encoding: "utf-8" });
  let url = `${process.env.HOST}/first-time-verify?token=${body.token}`;

  const template = handlebars.compile(html);
  const htmlToSend = template({
    name: body.firstName + " " + body.lastName,
    customerName: body.customerName,
    url,
  });
  const mailOptions = mailBody(to, htmlToSend, subject);
  await sendEmail(mailOptions);
};

const rejectedJob = async (to, body) => {
  var subject = 'Transaction Rejected On Securepay ';
  var html = fs.readFileSync(path.join(BASE_PATH, "/public/template/JobProposalRejectedByClient.html"), { encoding: "utf-8" });
  // let url = `${process.env.HOST}/first-time-verify?token=${body.token}`;

  const template = handlebars.compile(html);
  const htmlToSend = template({
    clientName: body.clientName,
    customerName: body.customerName,
    jobName: body.jobName,
    // status: body.status,
    // subject: body.subject,
    // rejectComment: body.rejectComment
  });
  const mailOptions = mailBody(to, htmlToSend, subject);
  await sendEmail(mailOptions);
};
const acceptedJob = async (to, body) => {
  var subject = 'Transaction Accepted On Securepay ';
  var html = fs.readFileSync(path.join(BASE_PATH, "/public/template/JobProposalAcceptedByClient.html"), { encoding: "utf-8" });
  // let url = `${process.env.HOST}/first-time-verify?token=${body.token}`;

  const template = handlebars.compile(html);
  const htmlToSend = template({
    clientName: body.clientName,
    customerName: body.customerName,
    jobName: body.jobName,
    // status: body.status,
    // subject: body.subject,
    // rejectComment: body.rejectComment
  });
  const mailOptions = mailBody(to, htmlToSend, subject);
  await sendEmail(mailOptions);
};
const escrowPayment = async (to, body) => {
  var subject = 'Trustpay Payment Escrowed';
  var html = fs.readFileSync(path.join(BASE_PATH, "/public/template/PaymentInEscrow.html"), { encoding: "utf-8" });
  // let url = `${process.env.HOST}/first-time-verify?token=${body.token}`;

  const template = handlebars.compile(html);
  const htmlToSend = template(body);
  const mailOptions = mailBody(to, htmlToSend, subject);
  await sendEmail(mailOptions);
};

const sendOtpVarification = async (to, varificationOtp, body) => {
  var subject = 'Welcome to Securepay ';
  var html = fs.readFileSync(path.join(BASE_PATH, "/public/template/Otpvarification.html"), { encoding: "utf-8" });

  let url = `${process.env.HOST}/set-password?token=${body.token}`;
  const template = handlebars.compile(html);
  const htmlToSend = template({
    name: body.firstName + ' ' + body.lastName,
    otp: varificationOtp,
    url
  });
  const mailOptions = mailBody(to, htmlToSend, subject)
  await sendEmail(mailOptions)
}

const modificationRequest = async (to, body) => {
  var subject = "Job Modification Request Received | Securepay ";
  var html = fs.readFileSync(path.join(BASE_PATH, "/public/template/ModificationRequest.html"), { encoding: "utf-8" });
  // let url = `${process.env.HOST}/first-time-verify?token=${body.token}`;

  const template = handlebars.compile(html);
  const htmlToSend = template({
    clientName: body.clientName,
    customerName: body.customerName,
    jobName: body.jobName,
    modificationComment: body.modificationComment
  });
  const mailOptions = mailBody(to, htmlToSend, subject);
  await sendEmail(mailOptions);
};

const paymentReleaseRequest = async (to, body) => {
  var subject = "Trustpay Payment Release Request";
  var html = fs.readFileSync(path.join(BASE_PATH, "/public/template/ReleaseRequest.html"), { encoding: "utf-8" });
  // let url = `${process.env.HOST}/first-time-verify?token=${body.token}`;

  const template = handlebars.compile(html);
  const htmlToSend = template(body);
  const mailOptions = mailBody(to, htmlToSend, subject);
  await sendEmail(mailOptions);
};
const paymentRelease = async (to, body) => {
  var subject = "Trustpay Payment Released";
  var html = fs.readFileSync(path.join(BASE_PATH, "/public/template/PaymentRelease.html"), { encoding: "utf-8" });
  // let url = `${process.env.HOST}/first-time-verify?token=${body.token}`;

  const template = handlebars.compile(html);
  const htmlToSend = template(body);
  const mailOptions = mailBody(to, htmlToSend, subject);
  await sendEmail(mailOptions);
};
const disputeRaised = async (to, body) => {
  var subject = "A New Job Query Has Been Raised | Securepay ";
  var html = fs.readFileSync(path.join(BASE_PATH, "/public/template/DisputeRaised.html"), { encoding: "utf-8" });
  // let url = `${process.env.HOST}/first-time-verify?token=${body.token}`;

  const template = handlebars.compile(html);
  const htmlToSend = template(body);
  const mailOptions = mailBody(to, htmlToSend, subject);
  await sendEmail(mailOptions);
};


const disputeAnnounced = async (to, body) => {
  var subject = "Query Resolution Proposed | Securepay ";
  var html = fs.readFileSync(path.join(BASE_PATH, "/public/template/DisputeAnnounced.html"), { encoding: "utf-8" });
  // let url = `${process.env.HOST}/first-time-verify?token=${body.token}`;

  const template = handlebars.compile(html);
  const htmlToSend = template(body);
  const mailOptions = mailBody(to, htmlToSend, subject);
  await sendEmail(mailOptions);
};
const disputeAccept = async (to, body) => {
  var subject = "Query Resolution Accepted | Securepay ";
  var html = fs.readFileSync(path.join(BASE_PATH, "/public/template/DisputeAccepted.html"), { encoding: "utf-8" });
  // let url = `${process.env.HOST}/first-time-verify?token=${body.token}`;

  const template = handlebars.compile(html);
  const htmlToSend = template(body);
  const mailOptions = mailBody(to, htmlToSend, subject);
  await sendEmail(mailOptions);
};
const disputeReject = async (to, body) => {
  var subject = "Query Resolution Rejected | Securepay ";
  var html = fs.readFileSync(path.join(BASE_PATH, "/public/template/DisputeRejected.html"), { encoding: "utf-8" });
  // let url = `${process.env.HOST}/first-time-verify?token=${body.token}`;

  const template = handlebars.compile(html);
  const htmlToSend = template(body);
  const mailOptions = mailBody(to, htmlToSend, subject);
  await sendEmail(mailOptions);
};

const verifyOTP = async (to, body) => {
  console.log("BASE_PATH :", BASE_PATH)
  var subject = 'OTP for your login | Securepay ';
  var html = fs.readFileSync(path.join(BASE_PATH, "/public/template/VerifiedOTP.html"), { encoding: "utf-8" });

  // let url = `${process.env.HOST}/verify?token=${body.token}`;

  const template = handlebars.compile(html);
  const htmlToSend = template({
    name: body.firstName + ' ' + body.lastName,
    otp: body.otp
  });
  const mailOptions = mailBody(to, htmlToSend, subject)
  await sendEmail(mailOptions)
};

const supportTicketRaised = async (to, body) => {
  var subject = 'A New Support Ticket Has Been Raised | Securepay ';
  var html = fs.readFileSync(path.join(BASE_PATH, "/public/template/SupportTicketRaised.html"), { encoding: "utf-8" });

  // let url = `${process.env.HOST}/verify?token=${body.token}`;

  const template = handlebars.compile(html);
  const htmlToSend = template(body);

  const mailOptions = mailBody(to, htmlToSend, subject)
  await sendEmail(mailOptions)
};

const supportTicketResolved = async (to, body) => {
  var subject = 'Support Ticket Has Been Resolved | Securepay ';
  var html = fs.readFileSync(path.join(BASE_PATH, "/public/template/SupportTicketResolved.html"), { encoding: "utf-8" });

  // let url = `${process.env.HOST}/verify?token=${body.token}`;

  const template = handlebars.compile(html);
  const htmlToSend = template(body);

  const mailOptions = mailBody(to, htmlToSend, subject)
  await sendEmail(mailOptions)
};

const supportTicketComment = async (to, body) => {
  var subject = ' New comments received on your support ticket | Securepay ';
  var html = fs.readFileSync(path.join(BASE_PATH, "/public/template/SupportTicketComment.html"), { encoding: "utf-8" });

  // let url = `${process.env.HOST}/verify?token=${body.token}`;

  const template = handlebars.compile(html);
  const htmlToSend = template(body);

  const mailOptions = mailBody(to, htmlToSend, subject)
  await sendEmail(mailOptions)
};

module.exports = {
  emailConfig,
  mailBody,
  sendEmail,
  sendForgotPasswordEmail,
  sendUserVerify,
  sendResetedPassword,
  sendMilestoneSingle,
  sendMilestoneMultiple,
  inviteUserVerify,
  rejectedJob,
  acceptedJob,
  escrowPayment,
  sendOtpVarification,
  modificationRequest,
  paymentReleaseRequest,
  paymentRelease,
  disputeRaised,
  disputeAnnounced,
  disputeAccept,
  disputeReject,
  verifyOTP,
  supportTicketRaised,
  supportTicketResolved,
  supportTicketComment
};

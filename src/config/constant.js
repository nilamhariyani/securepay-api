const ROLES = {
    ADMIN: 1,
    STAFF_MEMBERS: 2,
    CLIENT: 3,
    CUSTOMER: 4
};
const ACCOUNT_TYPE = {
    INDIVIDUAL: 1,
    ORGANIZATION: 2
}
const TOKEN_TYPE = {
    ACCESS_TOKEN: 1,
    REFRESH_TOKEN: 2,
    VERIFICATION_TOKEN: 3,
    RESET_PASSWORD: 4,
};
const DEFAULT_IMAGE = {
    URL: 'https://res.cloudinary.com/dt5pgt4gk/image/upload/',
    DUMMYPROFILE: 'v1639200232/Trustpay/blank-profile_lvfrbt.png'
}
const MILESTONESTATUS = {
    WAITING_ACCEPT: "WAITING_ACCEPT",  // Client = Waiting For Client to Accept Job, Customer = Waiting for You to Accept Job
    WAITING_FUND_DEPOSITE: "WAITING_FUND_DEPOSITE", // Client = Waiting For Client To Fund Deposit Box, Customer = Waiting For You To Fund Deposit Box
    PAYMENT_IN_DEPOSITE: "PAYMENT_IN_DEPOSITE", // Client & Customer = Payment In Deposit Box
    RELEASE_REQUESTED: "RELEASE_REQUESTED", // Client & Customer = Payment Release Requested 
    PAYMENT_RELEASE: "PAYMENT_RELEASE", // Client & Customer = Proccessing Payment Release
    PAYMENT_COMPLETE: "PAYMENT_COMPLETE", // Client & Customer = "Payment Stage X Paid. Waiting For Client To Fund Payment Stage Y."
    PAYMENT_REJECTED: "PAYMENT_REJECTED",
    DISPUTE: "DISPUTE",
    DISPUTE_RESOLVED: "DISPUTE_RESOLVED",
    PAID: "PAID",
    REJECTED: "REJECTED",
}

const JOBSTATUS = {
    CREATED: "CREATED", // Incomplete Payment Stages
    WAITING_ACCEPT: "WAITING_ACCEPT",  // Client = Waiting For Client to Accept Job, Customer = Waiting for You to Accept Job
    WAITING_FUND_DEPOSITE: "WAITING_FUND_DEPOSITE", // Client = Waiting For Client To Fund Deposit Box, Customer = Waiting For You To Fund Deposit Box
    PAYMENT_IN_DEPOSITE: "PAYMENT_IN_DEPOSITE", // Client & Customer = Payment In Deposit Box
    RELEASE_REQUESTED: "RELEASE_REQUESTED", // Client & Customer = Payment Release Requested 
    PAYMENT_RELEASE: "PAYMENT_RELEASE", // Client & Customer = Proccessing Payment Release
    PAYMENT_COMPLETE: "PAYMENT_COMPLETE", // Client = Waiting For Client to Fund Next Payment Stage, Customer = Waiting For You to Fund Next Payment Stage
    JOB_COMPLETE: "JOB_COMPLETE",
    PAYMENT_REJECTED: "PAYMENT_REJECTED",
    DISPUTE: "DISPUTE",
    DISPUTE_RESOLVED: "DISPUTE_RESOLVED",
    PAID: "PAID",
    REJECTED: "REJECTED",
}
const SUPPORT_STATUS = {
    PENDING: "PENDING",
    RESOLVED: "RESOLVED"
}
const DISPUTE_STATUS = {
    RAISED: 'RAISED',
    ONGOING: 'ONGOING',
    RESOLVED: 'RESOLVED',
    ARBITRATION: 'ARBITRATION'
}
const DISPUTE_USER_STATUS = {
    PENDING: 'PENDING',
    ACCEPT: 'ACCEPT',
    REJECTED: 'REJECTED'
}
const CONCLUSION_STATUS = {
    CLIENT: 'CLIENT',
    CUSTOMER: 'CUSTOMER',
    ARBITRATION: 'ARBITRATION'
}
const PAYMENT_TYPE = {
    CARD: "CARD",
    BANK: "BANK"
}
module.exports = {
    ROLES,
    ACCOUNT_TYPE,
    TOKEN_TYPE,
    DEFAULT_IMAGE,
    JOBSTATUS,
    MILESTONESTATUS,
    PAYMENT_TYPE,
    SUPPORT_STATUS,
    DISPUTE_STATUS,
    DISPUTE_USER_STATUS,
    CONCLUSION_STATUS
};

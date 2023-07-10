
const axios = require('axios');
var mangopay = require('mangopay2-nodejs-sdk');
const httpStatus = require('http-status');
const AppError = require('../../utils/AppError');
// /** Production */
// let MangopayCreds = {
//     clientId: 'pongopaymentsltdprod',
//     clientApiKey: 'K9ErenrQ5Rn3JD8Fqz882OiHEdNXwuxa4XE3U3gJhviFq3JwfX',
//     baseUrl: 'https://api.mangopay.com'
// }

/** Sandbox */
let MangopayCreds = {
    clientId: process.env.MANGO_CLIENT_ID,
    clientApiKey: process.env.MANGO_API_KEY,
    baseUrl: process.env.MANGO_BASE_URL
}

var api = new mangopay(MangopayCreds);

let MANGOPAY = {
    AUTH: `Basic ${Buffer.from((`${MangopayCreds.clientId}:${MangopayCreds.clientApiKey}`)).toString("base64")}`,
    URL: `${MangopayCreds.baseUrl}/v2.01/${MangopayCreds.clientId}/`
}

const createNaturalUser = async (params) => {
    let url = `${MANGOPAY.URL}users/natural`
    try {
        let response = await axios.post(url, params, { headers: { 'Authorization': MANGOPAY.AUTH } })
        return response.data

    } catch (err) {
        let d = err.response.data.errors
        let obj = Object.keys(err.response.data.errors);
        for (var x in obj) {
            let s = obj[x].replace(/([A-Z])/g, ' $1').trim().toLowerCase()
            throw new AppError(httpStatus.UNPROCESSABLE_ENTITY, `The ${s} you have entered is not valid. Please check your ${s} and try again.`);
        }
    }

};

const updateNaturalUser = async (params, customerId) => {
    let url = `${MANGOPAY.URL}users/natural/${customerId}`;
    try {
        let response = await axios.put(url, params, {
            headers: { Authorization: MANGOPAY.AUTH },
        });
        return response.data;
    } catch (err) {
        console.log(err.response.data);
        let d = err.response.data.errors;
        let obj = Object.keys(err.response.data.errors);
        for (var x in obj) {
            let s = obj[x].replace(/([A-Z])/g, ' $1').trim().toLowerCase()
            throw new AppError(httpStatus.UNPROCESSABLE_ENTITY, `The ${s} you have entered is not valid. Please check your ${s} and try again.`);
        }
    }
};

const createLegalUser = async (params) => {
    let url = `${MANGOPAY.URL}users/legal`
    try {
        let response = await axios.post(url, params, { headers: { 'Authorization': MANGOPAY.AUTH } })
        return response.data

    } catch (err) {
        let d = err.response.data.errors
        let obj = Object.keys(err.response.data.errors);
        for (var x in obj) {
            let s = obj[x].replace(/([A-Z])/g, ' $1').trim().toLowerCase()
            throw new AppError(httpStatus.UNPROCESSABLE_ENTITY, `The ${s} you have entered is not valid. Please check your ${s} and try again.`);
        }
    }

};
const updateLegalUser = async (params, customerId) => {
    let url = `${MANGOPAY.URL}users/legal/${customerId}`;
    try {
        let response = await axios.put(url, params, { headers: { 'Authorization': MANGOPAY.AUTH } })
        return response.data

    } catch (err) {
        let d = err.response.data.errors
        let obj = Object.keys(err.response.data.errors);
        for (var x in obj) {
            let s = obj[x].replace(/([A-Z])/g, ' $1').trim().toLowerCase()
            throw new AppError(httpStatus.UNPROCESSABLE_ENTITY, `The ${s} you have entered is not valid. Please check your ${s} and try again.`);
        }
    }

};
const createBankAccount = async (params, customerId) => {
    let url = `${MANGOPAY.URL}users/${customerId}/bankaccounts/gb`
    try {
        let response = await axios.post(url, params, { headers: { 'Authorization': MANGOPAY.AUTH } })
        return response.data

    } catch (err) {
        let d = err.response.data.errors
        let obj = Object.keys(err.response.data.errors);
        for (var x in obj) {
            let s = obj[x].replace(/([A-Z])/g, ' $1').trim().toLowerCase()
            throw new AppError(httpStatus.UNPROCESSABLE_ENTITY, `The ${s} you have entered is not valid. Please check your ${s} and try again.`);
        }
    }

};
const deactivateBankAccount = async (params, customerId, bankId) => {
    let url = `${MANGOPAY.URL}users/${customerId}/bankaccounts/${bankId}`;
    try {
        let response = await axios.put(url, params, {
            headers: { Authorization: MANGOPAY.AUTH },
        });
        return response.data;
    } catch (err) {
        let d = err.response.data.errors;
        let obj = Object.keys(err.response.data.errors);
        for (var x in obj) {
            let s = obj[x].replace(/([A-Z])/g, ' $1').trim().toLowerCase()
            throw new AppError(httpStatus.UNPROCESSABLE_ENTITY, `The ${s} you have entered is not valid. Please check your ${s} and try again.`);
        }
    }
};
const createDeclaration = async (customerId) => {
    let url = `${MANGOPAY.URL}users/${customerId}/KYC/ubodeclarations`
    try {
        let response = await axios.post(url, {}, { headers: { 'Authorization': MANGOPAY.AUTH } })
        console.log("UBO declaration Created Successfully. =====>")
        return response.data

    } catch (err) {
        let d = err.response.data.errors
        let obj = Object.keys(err.response.data.errors);
        for (var x in obj) {
            let s = obj[x].replace(/([A-Z])/g, ' $1').trim().toLowerCase()
            throw new AppError(httpStatus.UNPROCESSABLE_ENTITY, `The ${s} you have entered is not valid. Please check your ${s} and try again.`);
        }
    }

};
const createUBO = async (params, customerId, UboDeclarationId) => {
    let url = `${MANGOPAY.URL}users/${customerId}/KYC/ubodeclarations/${UboDeclarationId}/ubos`
    try {
        let response = await axios.post(url, params, { headers: { 'Authorization': MANGOPAY.AUTH } })
        console.log("UBO Created Successfully. =====>")
        return response.data

    } catch (err) {
        let d = err.response.data.errors
        let obj = Object.keys(err.response.data.errors);
        for (var x in obj) {
            let s = obj[x].replace(/([A-Z])/g, ' $1').trim().toLowerCase()
            throw new AppError(httpStatus.UNPROCESSABLE_ENTITY, `The ${s} you have entered is not valid. Please check your ${s} and try again.`);
        }
    }

};
const updateUBO = async (params, customerId, UboDeclarationId, uboId) => {
    let url = `${MANGOPAY.URL}users/${customerId}/KYC/ubodeclarations/${UboDeclarationId}/ubos/${uboId}`;
    try {
        let response = await axios.put(url, params, { headers: { 'Authorization': MANGOPAY.AUTH } })
        console.log("UBO Udated Successfully. =====>")
        return response.data

    } catch (err) {
        let d = err.response.data.errors
        let obj = Object.keys(err.response.data.errors);
        for (var x in obj) {
            let s = obj[x].replace(/([A-Z])/g, ' $1').trim().toLowerCase()
            throw new AppError(httpStatus.UNPROCESSABLE_ENTITY, `The ${s} you have entered is not valid. Please check your ${s} and try again.`);
        }
    }

};
const createWallets = async (params) => {
    let url = `${MANGOPAY.URL}wallets/`;
    try {
        let response = await axios.post(url, params, { headers: { 'Authorization': MANGOPAY.AUTH } })
        console.log("Wallet created Successfully. =====>")
        return response.data

    } catch (err) {
        let d = err.response.data.errors;
        console.log(d);
        let obj = Object.keys(err.response.data.errors);
        for (var x in obj) {
            let s = obj[x].replace(/([A-Z])/g, ' $1').trim().toLowerCase()
            throw new AppError(httpStatus.UNPROCESSABLE_ENTITY, `The ${s} you have entered is not valid. Please check your ${s} and try again.`);
        }
    }

};
const updateWallets = async (params, WalletId) => {
    let url = `${MANGOPAY.URL}wallets/${WalletId}`;
    try {
        let response = await axios.put(url, params, { headers: { 'Authorization': MANGOPAY.AUTH } })
        console.log("Wallet updated Successfully. =====>")
        return response.data

    } catch (err) {
        let d = err.response.data.errors;
        console.log(d);
        let obj = Object.keys(err.response.data.errors);
        for (var x in obj) {
            let s = obj[x].replace(/([A-Z])/g, ' $1').trim().toLowerCase()
            throw new AppError(httpStatus.UNPROCESSABLE_ENTITY, `The ${s} you have entered is not valid. Please check your ${s} and try again.`);
        }
    }

};
const createkycDoc = async (customerId) => {
    let url = `${MANGOPAY.URL}users/${customerId}/kyc/documents`;
    try {
        let response = await axios.post(url, { "Type": "IDENTITY_PROOF" }, { headers: { 'Authorization': MANGOPAY.AUTH } })
        console.log("KYC docs created Successfully. =====>")
        return response.data

    } catch (err) {
        let d = err.response.data.errors
        console.log(d)
        // let obj = Object.keys(err.response.data.errors);
        // for (var x in obj) {
        //     let s = obj[x].replace(/([A-Z])/g, ' $1').trim().toLowerCase()
        //     throw new AppError(httpStatus.UNPROCESSABLE_ENTITY, `The ${s} you have entered is not valid. Please check your ${s} and try again.`);
        // }
    }

};
const createkycPage = async (customerId, KYCDocumentId, files) => {
    let url = `${MANGOPAY.URL}users/${customerId}/kyc/documents/${KYCDocumentId}/pages`;
    try {
        let response = await axios.post(url, { "File": files }, { headers: { 'Authorization': MANGOPAY.AUTH } })
        console.log("KYC page created Successfully. =====>")
        await submitKYC(customerId, KYCDocumentId)
        return response.data

    } catch (err) {
        let d = err.response.data.errors;
        // let obj = Object.keys(err.response.data.errors);
        // for (var x in obj) {
        //     let s = obj[x].replace(/([A-Z])/g, ' $1').trim().toLowerCase()
        throw new AppError(httpStatus.UNPROCESSABLE_ENTITY, `KYC is not uploaded`);
        // }
    }

};
const submitKYC = async (customerId, KYCDocumentId) => {
    console.log(KYCDocumentId);
    let url = `${MANGOPAY.URL}users/${customerId}/kyc/documents/${KYCDocumentId}`;
    try {
        let response = await axios.put(url, { "Status": "VALIDATION_ASKED" }, { headers: { 'Authorization': MANGOPAY.AUTH } })
        console.log("KYC submitted Successfully. =====>")
        return response.data

    } catch (err) {
        let d = err.response
        console.log(d)
        throw new AppError(httpStatus.UNPROCESSABLE_ENTITY, `KYC is not submitted`);
    }

};
const payinByBankWire = async (params) => {
    let url = `${MANGOPAY.URL}payins/bankwire/direct`;
    console.log(params);
    try {
        let response = await axios.post(url, params, { headers: { 'Authorization': MANGOPAY.AUTH } })
        console.log("Payins by bank wire is Successfully. =====>")
        return response.data

    } catch (err) {
        let d = err.response.data.errors
        console.log(d)
        let obj = Object.keys(err.response.data.errors);
        for (var x in obj) {
            let s = obj[x].replace(/([A-Z])/g, ' $1').trim().toLowerCase()
            throw new AppError(httpStatus.UNPROCESSABLE_ENTITY, `The ${s} you have entered is not valid. Please check your ${s} and try again.`);
        }
    }

};
const payinByCard = async (params) => {
    let url = `${MANGOPAY.URL}payins/card/direct`;
    try {
        let response = await axios.post(url, params, { headers: { 'Authorization': MANGOPAY.AUTH } })
        console.log("Payins by Card direct is Successfully. =====>")
        return response.data

    } catch (err) {
        let d = err.response.data.errors
        console.log(d)
        let obj = Object.keys(err.response.data.errors);
        for (var x in obj) {
            let s = obj[x].replace(/([A-Z])/g, ' $1').trim().toLowerCase()
            throw new AppError(httpStatus.UNPROCESSABLE_ENTITY, `The ${s} you have entered is not valid. Please check your ${s} and try again.`);
        }
    }

};
const paymentTransfer = async (params) => {
    let url = `${MANGOPAY.URL}transfers`;
    try {
        let response = await axios.post(url, params, { headers: { 'Authorization': MANGOPAY.AUTH } })
        console.log("Payment release successfully. =====>")
        return response.data

    } catch (err) {
        let d = err.response.data.errors
        console.log(d)
        let obj = Object.keys(err.response.data.errors);
        for (var x in obj) {
            let s = obj[x].replace(/([A-Z])/g, ' $1').trim().toLowerCase()
            throw new AppError(httpStatus.UNPROCESSABLE_ENTITY, `The ${s} you have entered is not valid. Please check your ${s} and try again.`);
        }
    }

};
const payOutInBank = async (params) => {
    let url = `${MANGOPAY.URL}payouts/bankwire/`;
    try {
        let response = await axios.post(url, params, { headers: { 'Authorization': MANGOPAY.AUTH } })
        console.log("Payment payout successfully. =====>")
        return response.data

    } catch (err) {
        let d = err.response.data.errors
        console.log(d)
        let obj = Object.keys(err.response.data.errors);
        for (var x in obj) {
            let s = obj[x].replace(/([A-Z])/g, ' $1').trim().toLowerCase()
            throw new AppError(httpStatus.UNPROCESSABLE_ENTITY, `The ${s} you have entered is not valid. Please check your ${s} and try again.`);
        }
    }

};

const getKYCStatus = async (KYCDocumentId) => {
    console.log(KYCDocumentId);
    let url = `${MANGOPAY.URL}kyc/documents/${KYCDocumentId}/`;
    try {
        let response = await axios.get(url, { headers: { 'Authorization': MANGOPAY.AUTH } })
        console.log("KYC Status fetch successfully. =====>")
        return response.data

    } catch (err) {
        let d = err.response.data.errors
        console.log(d)
        let obj = Object.keys(err.response.data.errors);
        for (var x in obj) {
            let s = obj[x].replace(/([A-Z])/g, ' $1').trim().toLowerCase()
            throw new AppError(httpStatus.UNPROCESSABLE_ENTITY, `The ${s} you have entered is not valid. Please check your ${s} and try again.`);
        }
    }

};






module.exports = {
    createNaturalUser,
    createLegalUser,
    createBankAccount,
    createDeclaration,
    createUBO,
    updateNaturalUser,
    updateLegalUser,
    deactivateBankAccount,
    updateUBO,
    createWallets,
    updateWallets,
    createkycDoc,
    createkycPage,
    payinByBankWire,
    payinByCard,
    paymentTransfer,
    payOutInBank,
    getKYCStatus
};
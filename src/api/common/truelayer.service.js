let axios = require("axios")
const httpStatus = require('http-status');
const AppError = require('../../utils/AppError');

const endpoint = {
    authToken: process.env.TRUE_LAYER_AUTH_URL + 'connect/token',
    payment: process.env.TRUE_LAYER_URL + 'single-immediate-payments',
}

const generateTrueLayerToken = async () => {

    let params = {
        client_id: process.env.TRUE_LAYER_CLIENT_ID,
        client_secret: process.env.TRUE_LAYER_CLIENT_SECRET,
        scope: "payments",
        grant_type: "client_credentials",
    }
    try {
        let response = await axios.post(endpoint.authToken, params, { headers: { 'Access-Control-Allow-Origin': '*' } })
        console.log('generateTrueLayerToken response===')
        return response.data
    } catch (error) {
        throw new AppError(httpStatus.UNPROCESSABLE_ENTITY, `TrueLayer token was not generated`);
    }
}

const singleImmediatePayment = async (params, authToken) => {
    try {
        let response = await axios.post(endpoint.payment, params, { headers: { 'Authorization': authToken } })
        console.log('singleImmediatePayment response===')
        return response.data
    } catch (error) {
        console.log(error.response.data.error_details)
        throw new AppError(httpStatus.UNPROCESSABLE_ENTITY, `TrueLayer payment link expire`);
    }
}
const getPaymentStatus = async (paymentId, authToken) => {
    try {
        let response = await axios.get(endpoint.payment + '/' + paymentId, { headers: { 'Authorization': authToken } })
        console.log('Get Payment Status response===')
        return response.data
    } catch (error) {
        throw new AppError(httpStatus.UNPROCESSABLE_ENTITY, `Payment status is not getting`);
    }
}

module.exports = {
    generateTrueLayerToken,
    singleImmediatePayment,
    getPaymentStatus
}
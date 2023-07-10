const { reject } = require('lodash');
const twilio = require('twilio');
const client = new twilio(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN);


exports.sendSms = async (toMobileNumber, body) => {
    let info = await client.messages
        .create({
            body: body,
            from: process.env.TWILIO_FROM,
            to: toMobileNumber
        })
        .then((message) => {
            console.log("message========>", message);
            // resolve(message.body)

        }).
        catch((err) => {
            console.log("err", err)
            // reject(err.code)
        });
};

// module.exports = { sendTwilio };
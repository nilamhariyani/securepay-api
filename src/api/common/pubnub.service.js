const pubnub = require('../../config/pubnub')
const { has, isEmpty } = require('lodash');
const Notifications = require('../../models/notification.model');

const getNotificationPayload = (userId, action, meta) => {
    var notification = {
        channel: userId,
        message: {
            title: action.title,
            description: action.description,
            pn_debug: true
        },
        meta: meta || {}
    };
    return notification
}

const sendNotification = async (userId, action, meta) => {
    const payload = getNotificationPayload(userId, action, meta)
    await addNotification(userId, action, meta);
    pubnub.publish(payload, async (status, response) => {
        if (status) {
            console.log("NOTIFICATION SENT to User--->", userId);
        } else {
            console.log("NOTIFICATION NOT SENT to User--->", userId);
        }
    });
}

const addNotification = async (userId, action, meta) => {
    let notificationBody = {
        title: action.title,
        description: action.description,
        userId: userId,
        action: action.action,
        metaData: meta
    }
    let notification = await Notifications.create(notificationBody)
    return notification
}

module.exports = {
    sendNotification
}
const { Notification } = require('@byjus-orders/tyrion-plugins');

const config = require('../config');

/***
 * @param
 * type:String
 * details : {
    * contact:String,
    * userMessage:String,
    * otp:String,
    * voiceOtp:String
 * }
 * 
 */
const sendNotification = async (type, details) => {
    try {
        const smsConfig = {
            key: config.notification.key,
            salt: config.notification.salt,
            serviceUrl: config.notification.serviceUrl
        };
        const data = {
            contact: details.contactNo,
            userMessage: details.message,
            otp: details.otp,
            voiceType: details.voiceType
        };

        const response = await Notification.sendNotification(data, type, smsConfig);
        return response;
    } catch (error) {
        throw new Error(error)
    }
}

module.exports = {
    sendNotification
}
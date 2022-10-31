const cryptoJS = require("crypto-js");
const Promise = require("bluebird");
const request = require("request-promise");
const { mail: helper } = require("sendgrid");
const sendgrid = require("sendgrid");

const bunyan = require("../lib/bunyan-logger");
const config = require("../config");

const logger = bunyan("index");
const sg = sendgrid(
  "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"
);

/**
 * Send a ping to Notification Hub for Sending an SMS.
 * @param data
 * @returns {*}
 */
const sendNotification = async (data) => {
  const secretKey = cryptoJS.AES.encrypt(
    config.notification.key,
    config.notification.salt
  );

  const options = {
    uri: config.notification.serviceUrl,
    method: "POST",
    body: { ...data, secretKey },
    json: true,
  };
  return request(options);
};
/**
 * Send SMS to a phone number.
 * Specific provider can be passed in case you want to send SMS in a specific geo region. i.e US, middle east
 * More providers can be configured in Notification Hub. Defaults to plivo and gupsup for now.
 *
 *
 * @param contact -> phone number
 * @param message
 * @param provider (gupsup|plivo)
 * @returns Promise
 */

const sendSMS = async (contact, message, provider) => {
  const smsBody = {
    // eslint-disable-next-line camelcase
    channel_type: "sms",
    contact,
    message,
  };
  if (provider) {
    const sendNotificationResponse = await sendNotification({
      ...smsBody,
      provider,
    });
    return sendNotificationResponse;
  }
  // Send via ALL providers
  const sendAllNotificationResponse = Promise.all([
    sendNotification({ ...smsBody, provider: "gupsup" }),
    sendNotification({ ...smsBody, provider: "plivo" }),
  ]);
  return sendAllNotificationResponse;
};

/**
 * Sends Email Messages using Notification Hub
 *
 * @param fromEmail
 * @param toEmail
 * @param subject
 * @param content
 */

const sendEMail = (fromEmail, toEmail, subject, content) => {
  if (fromEmail && toEmail) {
    /* eslint-disable */
    const email_body = {
      channel_type: "EMAIL",
      reciever_email: [toEmail],
      sender_email: fromEmail,
      subject,
      body: content,
    };
    /* eslint-enable */
    sendNotification(email_body);
  }
};

/**
 * Send Voice OTP to phones if SMS is not reachable/landline.
 * Types are predefined in Notification Hub and tts Message is configured accordingly,
 * Configure your TTS message inside notification hub for new types.
 *
 * @param contact
 * @param otp
 * @param type
 * @returns {Promise<boolean>|Promise<void>|Promise<*>}
 */
const sendVoiceOtp = ({ contact, otp, type }) => {
  const voiceBody = {
    // eslint-disable-next-line camelcase
    channel_type: "voice",
    contact,
    otp,
    type, // Only Predefined Types are supported by Notification Hub
  };
  logger.info("voice sms sent", otp);
  // eslint-disable-next-line no-undef
  return sms.sendNotification({ ...voiceBody, provider: "voice" });
};

/**
 * Directly Use SendGrid to send An Email.
 *
 * @param fromEmail
 * @param toEmail
 * @param subject
 * @param content
 * @returns {Promise<SendGrid.Rest.Response>}
 */
const sendGridEMail = (fromEmail, toEmail, subject, content) => {
  const fromEmailObj = new helper.Email(fromEmail);
  const toEmailObj = new helper.Email(toEmail);
  const contentObj = new helper.Content("text/html", content);
  const mail = new helper.Mail(fromEmailObj, subject, toEmailObj, contentObj);

  const requests = sg.emptyRequest({
    method: "POST",
    path: "/v3/mail/send",
    body: mail.toJSON(),
  });

  return sg.API(requests);
};

const sendGridEmailToMultipleRecipients = (
  fromEmail,
  toEmails,
  subject,
  content
) => {
  const bodyPayload = {
    personalizations: [
      {
        to: toEmails.map((email) => ({ email })),
        subject,
      },
    ],
    from: { email: fromEmail },
    content: [
      {
        type: "text/plain",
        value: content,
      },
    ],
  };

  const requests = sg.emptyRequest({
    method: "POST",
    path: "/v3/mail/send",
    body: bodyPayload,
  });

  return sg.API(requests);
};

module.exports = {
  sendSMS,
  sendEMail,
  sendGridEMail,
  sendVoiceOtp,
  sendGridEmailToMultipleRecipients,
};

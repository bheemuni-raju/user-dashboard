const request = require('request-promise').defaults({ encoding: null });
const config = require('../config/environment')

const bunyan = require('./bunyan-logger');
const logger = bunyan('sendMail');

const sendgrid = require('sendgrid');
const { mail: helper } = require('sendgrid');

const sg = sendgrid(process.env.SENDGRID_API_KEY);

const sendMail = async (recieverEmailArray, subject, emailBody) => {
  var postData = {
    channel_type: 'EMAIL',
    reciever_email: recieverEmailArray,
    sender_email: 'noreply@byjus.com',
    body: emailBody,
    subject: subject,
    access: 'admin'
  };

  const options = {
    method: 'POST',
    uri: config.notification.serviceUrl,
    headers: {
      "Content-Type": "application/json"
    },
    body: postData,
    json: true,
    resolveWithFullResponse: true
  };

  await request(options)
    .then(() => {
      logger.info("Successfully sent the mail!");
    })
    .catch(() => {
      logger.error("Error while sending mail!");
    });
}

const sendPersonalizedEmail = async (fromEmail, toEmails, subject, content) => {
  const bodyPayload = {
    personalizations: [{
      to: toEmails.map(email => ({ email })),
      subject: subject
    }],
    from: { email: fromEmail },
    content: [{
      type: 'text/html',
      value: content
    }]
  };

  const request = sg.emptyRequest({
    method: 'POST',
    path: '/v3/mail/send',
    body: bodyPayload
  });

  return sg.API(request);
}

module.exports = {
  sendMail,
  sendPersonalizedEmail
}
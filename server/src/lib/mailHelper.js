'use strict';

const request = require('request-promise');

const getMailBody = loanDetails => {
  const data = {
    channel_type: 'EMAIL',
    reciever_email: [loanDetails.createdBy, 'optech@byjus.com'],
    sender_email: 'noreply@byjus.com',
    subject: `ZestMoney LoanID: ${loanDetails.appId} is ${loanDetails.status.toLowerCase()}.`,
    access: 'admin'
  };
  switch (loanDetails.status && loanDetails.status.toUpperCase()) {
    case 'INITIATED':
      data.body = `You have initiated a loan with zest having orderId: ${
        loanDetails.appId
      }. Please wait for sometime will notify once loan status gets changed.`;
      return data;
    case 'APPROVED':
      data.body = `This is just to intimate you about the Loan you punched having orderId: ${
        loanDetails.appId
      } has been approved by the zest.`;
      return data;
    case 'DECLINED':
      data.body = `We are really sorry to inform about the loan you punched with zest having orderId: ${
        loanDetails.appId
      } is declined by the zest please refer to OMS dashboard.`;
      return data;
    case 'ACTIVE':
      data.body = `Congratulation this is just to inform you about the Loan you punched with zest having orderId: ${
        loanDetails.appId
      } is now activated.`;
      return data;
    default:
      return {};
  }
};

const sendEmailNotification = async loanDetails => {
  const body = getMailBody(loanDetails);
  const reqOptions = {
    uri: 'https://byjus-notification-hub.herokuapp.com/api/v1/notification',
    method: 'POST',
    body,
    json: true
  };
  return request(reqOptions);
};

module.exports = {
  sendEmailNotification
};

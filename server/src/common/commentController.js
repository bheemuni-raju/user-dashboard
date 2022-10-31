const request = require('request-promise');
const { uniq } = require('lodash');

const notifyComment = async (req, res) => {
    const { emails = [], comment, subject } = req.body;
    const body = {
        channel_type: 'EMAIL',
        reciever_email: uniq([...emails, 'swati.gupta@byjus.com']),
        sender_email: 'no-reply-notify@byjus.com',
        subject: subject,
        access: 'admin',
        body: comment
    };

    const reqOptions = {
        uri: 'https://byjus-notification-hub.herokuapp.com/api/v1/notification',
        method: 'POST',
        body,
        json: true
    };

    try {
        const resp = await request(reqOptions);
        res.json(`Comment sent successfully in mail to ${emails.join()}`);
    } catch (error) {
        res.status(500).json(error);
    }
}

module.exports = {
    notifyComment
}
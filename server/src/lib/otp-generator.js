const randomString = require("randomstring");



module.exports = () => {
    const otp = randomString.generate({
        length: 4,
        charset: 'numeric'
    });

    return otp;
}
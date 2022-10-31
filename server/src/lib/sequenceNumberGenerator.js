const moment = require('moment');
const lodash = require('lodash');

const generateSeqNumber = (prefix) => {
    const currentDate = moment().format('YYMMDDHHmmss');
    const randomNumber = lodash.random(1, 999);
    const paddedRandomNumber = lodash.padStart(randomNumber, 4, 0);
    const seqNo = `${prefix}-${currentDate}${paddedRandomNumber}`;

    return seqNo;
}

module.exports = {
    generateSeqNumber
}
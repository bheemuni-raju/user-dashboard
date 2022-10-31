const { random } = require("lodash");
const moment = require("moment");

module.exports = () => {
  const currentDate = moment().format("YYMMDDhhmmss");
  const randomNum = random(1, 9999);

  return `${currentDate}${randomNum}`;
};

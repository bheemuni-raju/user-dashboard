'use strict';

const Router = require('express-promise-router');
const controller = require('./authController');
const { AppToken } = require('@byjus-orders/nexemplum/ums');

const validateApiToken = async (req, res, next) => {
  const token = req.headers["x-api-key"];
  // Validating token
  if (token && token.match(/^[0-9a-fA-F]{24}$/)) {
    const validatedToken = await AppToken.findById(token)
    return validatedToken ? next() : res.status(403).json({ message: "Invalid App token" })
  }
  else {
    return res.status(403).json({ message: "App Token is missing or invalid" })
  }
}

module.exports = () => {
  const router = Router({ mergeParams: false });

  router.route('/getUser')
    .get(controller.getUserFromToken);
  //Note: This route is used from mobile app of the loanVendor partners to authenticate sales people
  router.route('/vendor/getUserDetails')
    .post(validateApiToken, controller.getUserDetails);

  return router;
};

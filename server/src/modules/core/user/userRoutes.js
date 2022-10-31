'use strict';

const Router = require('express-promise-router');
const { get, isEmpty } = require('lodash');

const controller = require('./userController');
let userSummaryController = require('./userSummaryController');
const userHelper = require('@byjus-orders/nfoundation/ums/user/userHelper');
const appUserHelper = require('@byjus-orders/nfoundation/ums/user/appUserHelper');
const userCache = require('./userCache');
const validator = require('./userValidator');
const { emailFromTokenMiddleware } = require('./userMiddleware');
const logger = require('@byjus-orders/byjus-logger').child({module: 'userRoutes'})

module.exports = () => {
  const router = Router({ mergeParams: true });

  router.route(`/employee/list`).post(controller.listData);
  router.route(`/employee/listMasterData`).post(controller.listMasterData);
  router.route(`/employee/colUniqueValues`).get(controller.getColUniqueValues);
  router.route(`/employee/download`).post(controller.downloadData);
  router.route('/employee').post(controller.createData);

  router.route('/employee/getUserProfile').get(async (req, res) => {
    logger.info({method:"getUserProfile", url: req.url}, "getUserProfile initialized");
    let { byPassCache = false } = req.query;
    console.log(`GetUserProfile api: User Details - ${JSON.stringify(req.user.email)}`);

    if (req.user) {
      let applicationName = get(req, "headers.x-app-origin", null);
      await appUserHelper.saveLastLogin(req.user.email, applicationName, req.user.lastLoginAt);
      await appUserHelper.savePicture(req.user.email, applicationName, req.user.picture);
      await appUserHelper.saveEmployeePicture(req.user.email, req.user.picture);
      const actualUser = req.actualUser || {};
      /**if byPassCache is passed as true in query param then it will take the user from DB else it will take from cache as usual */
      if (byPassCache == "true" || byPassCache == true) {
        let userData = await appUserHelper.findAppUserByEmailId(req.user.email, applicationName);
        return res.json({ ...userData, actualUser, env: process.env.NODE_ENV });
      }
      return res.json({ ...req.user, actualUser, env: process.env.NODE_ENV });
    }
    logger.error({method:"getUserProfile"}, "Unauthorized Access")
    return res.status(401).json({ message: 'Unauthorized Access' });
  });

  router.route('/employee/getEmailFromToken').get(controller.getEmailFromToken);

  router.route('/employee/checkMfaEnabled').post(controller.checkMfaEnabled);

  router.route('/employee/checkMfaFactors').post(emailFromTokenMiddleware, controller.checkMfaFactors);

  router.route('/employee/logoutUser').post(controller.logoutUser);
  router.route('/employee/changeDefaultOrg').post(controller.changeDefaultOrg);

  router
    .route('/employee/:userId')
    .get(controller.readData)
    .put(controller.updateData);

  /**Api's to update Employee data */
  router.route('/employee/assignReporters').post(controller.assignReporters);
  router.route('/employee/assignMiscellaneousReporters').post(controller.assignMiscellaneousReporters);
  router.route('/employee/updateProfile/:userId').put(controller.updateProfile);
  router.route('/employee/updateContactDetails').post(validator.updateContactDetails, controller.updateContactDetails);
  router.route('/employee/updateUserEmail').post(validator.updateUserEmail, controller.updateUserEmail);

  router.route('/employee/operartion/updateData').post(controller.updateUserDetails);

  router.route('/employee/operartion/getComments').get(controller.getUserComments);
  router.route('/employee/operation/updateComments').put(controller.updateUserComments);

  /**This api will fetch employee details from cache */
  router.route('/employee/getByEmail/:emailId').get(controller.readEmployeeData);

  /**This api will fetch employee details for external applications */
  router.route('/employee/fetchByEmail/:email').get(controller.readEmployeeData);

  /**This api will fetch employee details for external applications */
  router.route('/employee/fetchUserFromCache/:cacheKey').get(controller.fetchUserFromCache);

  /**This api will be used to get employee from DB and not from cache, mainly will be used for impersonate functionality */
  router.route('/employee/getByEmail').post(controller.fetchEmployeeData);

  router.route('/employee/getReporters').post(controller.getReporters);

  router.route('/employee/operation/getSummary').post(userSummaryController.getSummary);

  //This for getting the cache and deleting data
  router.route('/employee/cache/deleteUserCacheData/:cacheKey').get(userCache.deleteUserCache);

  router.route('/cache/getAllKeys').get(userCache.gettingKeys);

  // Finish by binding the user middleware
  router.param('userId', controller.userById);
  router.param('emailId', controller.userByEmailId);

  //Verifies app origin for external users and calls userByEmailId
  router.param('email', controller.verifyAppOrigin);

  return router;
};

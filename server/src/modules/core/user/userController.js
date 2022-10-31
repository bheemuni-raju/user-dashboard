'use strict';

const { extend, map, find, uniq, size, cloneDeep, transform, isEmpty, isEqual, get } = require('lodash');
const mongoose = require('mongoose');
const jwt = require('jsonwebtoken');
const { Employee, Role, MasterEmployee, ScEmployee, UeEmployee, FinanceEmployee, AppUser, Organization } = require('@byjus-orders/nexemplum/ums');
const Promise = require('bluebird');

// const bunyan = require('../../../lib/bunyan-logger');
const { NotFoundError, BadRequestError } = require('../../../lib/errors');
const { criteriaBuilder } = require('../../../common/criteriaBuilder');
const userDetailController = require('./userDetailController');
const commonController = require('../../../common/dataController');
const employeeReferralController = require('../../businessdevelopment/employeereferral/employeeReferralController');

const userHelper = require('@byjus-orders/nfoundation/ums/user/userHelper');
const appUserHelper = require('@byjus-orders/nfoundation/ums/user/appUserHelper');
const userUtil = require('@byjus-orders/nfoundation/ums/utils/userUtil');
const userCache = require('./userCache');
const config = require('../../../config');

// const logger = bunyan('userController');
const logger = require('@byjus-orders/byjus-logger').child({module: 'userController'});
const permissionList = require('../../../lib/permissionList');
const { updateContextCriteriaBasedOnHierarchyPermissions } = require('../../settings/hierarchy/utils/hierarchyUtil');

/**
* List of grid data
*/
const listData = async (req, res) => {
  let userPermissions = get(req, 'user.permissions');
  let hierarchyBasedPermissions = get(permissionList, 'hierarchy', {});
  let { page, limit, sort, populate, filter = {}, searchCriterias = [], contextCriterias = [], select } = req.body;
  filter = size(filter) === 0 ? criteriaBuilder(searchCriterias, contextCriterias) : filter;
  contextCriterias = updateContextCriteriaBasedOnHierarchyPermissions(userPermissions, hierarchyBasedPermissions, contextCriterias, "departmentFormattedName");

  try {
    const options = {
      page: page || 1,
      limit: limit || 10,
      sort,
      populate,
      select,
      lean: true
    };

    const list = await Employee.paginate(filter, options)
    res.json(list);
  } catch (error) {
    throw new Error(error || "Error in fetching data");
  }
}

const listMasterData = async (req, res) => {
  let { page, limit, sort, populate, filter = {}, searchCriterias = [], contextCriterias = [], select } = req.body;
  filter = size(filter) === 0 ? criteriaBuilder(searchCriterias, contextCriterias) : filter;

  try {
    const options = {
      page: page || 1,
      limit: limit || 10,
      sort,
      populate,
      select,
      lean: true
    };

    const list = await MasterEmployee.paginate(filter, options)
    res.sendWithMetaData(list);
  } catch (error) {
    throw new Error(error || "Error in fetching data");
  }
}

/**
 * Create a user
 */
const createData = async (req, res) => {
  const { name, email, department, subDepartment, role, tnlId } = req.body;
  logger.info({method: 'createData', url: req.url}, "createData method initialized")

  if (!name || !email) throw new BadRequestError('Invalid Request : Required parameters missing');

  try {
    const newUser = new Employee({
      ...req.body,
      createdBy: req.user ? get(req.user, 'email') : 'system',
      "updateCounter": 0,
      "reconciliationDetails": {
        "status": "no"
      }
    });
    const savedUser = await newUser.save();
    await userUtil.retainActiveDepartmentInMaster(email);
    employeeReferralController.updateRhUserData(req);

    //logger.info({ method: 'createData' }, 'Employee created succesfully', savedUser);
    res.json(savedUser);

  } catch (error) {
    if (error && error.code === 11000) {
      if (error.message.includes("email_1")) {
        logger.error(error, "Duplicate Email");
        throw new Error('Employee already exist with this EmailId!');
      }
      else if (error.message.includes("tnlId_1")) {
        logger.error(error, "Duplicate TnlId");
        throw new Error('Employee already exist with this TnlId!');
      }
      throw new Error(error.message);
    }
    logger.error(error, "Employee creation failed");
    throw new Error(error);
  }
};

/**
 * Show the current user
 */
const readData = async (req, res) => {
  const id = req.params.userId;
  let user = await Employee.findById(id)
    .lean();

  res.json(user);
};

/**
 * Update a user
 */
const updateData = async (req, res) => {
  try {
    const user = req.user;
    const updateBody = {
      ...req.body
    };

    /**Updated only those fields which are changed */
    const existingUserDetails = cloneDeep(user);
    const formattedUserDetails = transform(updateBody, (result, value, key) => {
      if (!(isEmpty(value) && isEmpty(existingUserDetails[key])) &&
        !isEqual(value, existingUserDetails[key])) {
        result[key] = value;
      }
    }, {});

    const savedUser = await Employee.findOneAndUpdate({ _id: user._id }, {
      $set: {
        ...formattedUserDetails,
        updatedBy: req.user ? get(req.user, 'email') : 'system'
      }
    });

    await userUtil.retainActiveDepartmentInMaster(user.email);

    res.json(savedUser);

  } catch (error) {
    throw new Error(error);
  }
};

/**
 * Update a user profile information
 * Note: This is duplicate of updateData with restrictions on updation of information
 */
const updateProfile = async (req, res) => {
  const { mobile, tnlId } = req.body;
  const { tnlId: existingTnlId } = req.user;
  const existingContact = req.user.contact || [];

  const contact = existingContact.filter(mn => mn !== mobile && mn !== '-');
  contact.unshift(mobile);
  const user = extend(req.user, {
    contact,
    // if old tnlId exists then don't update that
    tnlId: existingTnlId || tnlId
  });
  const savedUser = await user.save();

  res.json(savedUser);
};

/** Get Reporters of an Employee */
const getReporters = async (req, res) => {
  const { page, limit, select, populate, emailId } = req.body;
  if (isEmpty(emailId)) throw new BadRequestError('Invalid Request : emailId Id missing');
  let applicationName = get(req, "headers.x-app-origin", null);
  let user = await appUserHelper.findAppUserByEmailId(emailId, applicationName);
  //userCache.deleteUserFromCache(emailId);

  if (isEmpty(user)) throw new NotFoundError('Employee not found');
  const { reportersObj, reporters } = await userHelper.fetchReportersWithRoles({ page, limit, select, populate, user });

  res.json({
    reporters: reportersObj,
    total: reporters.total,
    page: reporters.page,
    pages: reporters.pages,
    limit: reporters.limit
  });
};

const readEmployeeData = async (req, res) => {
  logger.info({method:"readEmployeeData", url: req.url}, "readEmployeeData method initialized");
  
  try
  {
    const { user } = req;

    if (!isEmpty(user)) {
      const { department, subDepartment, role } = user;
      const userRoleDetails = await Role.findOne({ subDepartmentFormattedName: subDepartment, departmentFormattedName: (isEmpty(department) ? "" : department), formattedName: role }).lean();
      user.roleDetails = userRoleDetails;
    }
    logger.debug({ method: "readEmployeeData", url: req.url}, `Response : ${user}`);
    res.json(user);
  }
  catch(error){
    logger.error({method:"readEmployeeData", error}, "Error in fetching data from readEmployeeData");
    res.status(500).json({message: `Failed to fetch Empoyee data : ${error.message}`})
  }

};

const userByEmailId = async (req, res, next, emailId) => {
  logger.info({method:"userByEmailId"}, "userByEmailId method initialized");
  if (isEmpty(emailId)) { throw new BadRequestError('Invalid Request : Email Id missing'); }
  let applicationName = get(req, "headers.x-app-origin", null);

  let cachedUser = await userCache.getUserFrmCache(emailId, applicationName);
  if (isEmpty(cachedUser)) {
    cachedUser = await appUserHelper.findAppUserByEmailId(emailId, applicationName);
    //userCache.deleteUserFromCache(emailId);

    let reportersResult = await userHelper.fetchReportersWithRoles({ page: 1, limit: 100, user: cachedUser, userPlatform: applicationName });

    if (!isEmpty(cachedUser)) cachedUser.reporters = reportersResult.reportersObj || {};
    // if (cachedUser.isMfaEnabled) cachedUser["isMfaVerified"] = true;
    await userCache.setUserCache(emailId, cachedUser, applicationName);
  }

  const user = cachedUser;
  if (isEmpty(user)) return res.status(404).json({ status: 404, message: 'Employee Not Found!!' });
  req.user = user;
  return next();
};

const fetchUserFromCache = async (req, res) => {
  const cacheKey = get(req, "params.cacheKey", "");
  let allCacheKeys = await userCache.getAllKeys();
  if (!isEmpty(allCacheKeys)) {
    const keyExist = allCacheKeys.find(value => value === cacheKey);
    if (!isEmpty(cacheKey) && keyExist === cacheKey) {
      let emailId = cacheKey.split('_')[0];
      let applicationName = cacheKey.split('_')[1];
      let cachedUser = await userCache.getUserFrmCache(emailId, applicationName);
      res.json(cachedUser);
    }
    else {
      return res.status(404).json({ status: 404, message: '`Sorry your data is not present in cache`' });

    }
  }
  else {
    return res.status(404).json({ status: 404, message: '`Sorry cannot access cache data from localhost`' });
  }
}

/**This will be used to get employee from DB and not from cache, mainly will be used for impersonate functionality */
const fetchEmployeeData = async (req, res) => {
  try{

  const { email } = req.body;
  if (isEmpty(email)) throw new BadRequestError('Invalid Request : Email is missing');
  let applicationName = get(req, "headers.x-app-origin", null);
  logger.info({method:"fetchEmployeeData", url: req.url}, "fetchEmployeeData method initialized");
  let user = await appUserHelper.findAppUserByEmailId(email, applicationName);
  //userCache.deleteUserFromCache(email);
  if (isEmpty(user)) return res.status(404).json({ status: 404, message: 'Employee Not Found!!' });

  //logger.info({ method: "fetchEmployeeData", email, user });
  let reportersResult = await userHelper.fetchReportersWithRoles({ page: 1, limit: 10000, user });

  if (!isEmpty(reportersResult)) {
    user["reporters"] = reportersResult.reportersObj;
  }

  res.json(user);
}
catch(error){
  logger.error(error, "Error in fetching data from fetchEmployeeData");
}
}

/** Employee middlewares */
const userById = async (req, res, next, id) => {
  const user = await Employee.findById(id);

  if (isEmpty(user)) throw new NotFoundError();

  req.user = user;
  next();
};

/** Verify app origin of external applications */
const verifyAppOrigin = async (req, res, next, email) => {
  let appOriginHeader = get(req, "headers.x-app-origin");
  if (!isEmpty(appOriginHeader) && ["web-wms-app"].includes(appOriginHeader)) {
    await userByEmailId(req, res, next, email);
  }
  else {
    return res.status(404).json({ status: 404, message: 'Invalid App Origin !!' });
  }

  return res;
}

const fetchActiveDepartmentArray = async (email) => {
  let masterDeptArray = [];
  let statusArray = ["left", "non_sales", "exit"];

  const deptMap = {
    'business_development': Employee,
    'supply_chain': ScEmployee,
    'user_experience': UeEmployee,
    'finance': FinanceEmployee,
    'human_resources': HrbpEmployee
  }

  await Promise.map(Object.keys(deptMap), async (deptKey) => {
    let userData = await deptMap[deptKey].findOne({ email, status: { "$nin": statusArray } });
    let { department, status } = userData || {};
    if (!isEmpty(department) && !statusArray.includes(snakeCase(status))) {
      masterDeptArray.push(department);
    }
  });

  return uniq(masterDeptArray);
}

const changeDefaultOrg = async (req, res) => {
  const { orgFormattedName, appRoleName } = req.body
  const { email } = req.user;
  let appName = get(req, "headers.x-app-origin", null);
  if (!isEmpty(orgFormattedName) && !isEmpty(appRoleName)) {

    await AppUser.updateMany({ email, appName, orgFormattedName: { "$nin": [orgFormattedName] } }, {
      "$set": {
        isDefaultOrg: false
      }
    });

    await AppUser.updateOne({ email, appName, orgFormattedName }, {
      "$set": {
        isDefaultOrg: true
      }
    });

    let cacheKey = !isEmpty(appName) ? email + "_" + appName : email;
    userCache.deleteUserFromCache(cacheKey);
    return res.status(200).json({ message: 'Change Default Org Successful.' });
  }
}

const getEmailFromToken = async (req, res) => {
  logger.info({method:"getEmailFromToken", url: req.url}, "getEmailFromToken method initialized");
  try {
    const token = get(req, "headers.x-id-token", "");
    // if (!isEmpty(token) && token.header.alg !== 'RS256') {
    //   throw new BadRequestError('Token Tampered, Please try login again');
    // }
    const { payload } = jwt.decode(token, { complete: true });
    const { email } = payload;
    return res.json({ email });
  }
  catch (error) {
    logger.error(error, "Error in fetching data from getEmailFromToken");
    throw error;
  }
}

const checkMfaFactors = async (req, res) => {
  try {
    logger.info({method:"checkMfaFactors", url: req.url}, "checkMfaFactors method initialized");
    const { email = "", mfaSessionToken = "" } = req.body;
    const applicationName = get(req, "headers.x-app-origin", null);
    let showMfa = false;
    const cacheUser = await userCache.getUserFrmCache(email, applicationName);
    if (!isEmpty(cacheUser)) {
      let isMfaVerified = false;
      let { isMfaEnabled, mfaVerifiedArray = [] } = cacheUser;
      let mfaSessionTokenFoundFlag = false;

      if (!isEmpty(mfaVerifiedArray)) {
        await Promise.map(mfaVerifiedArray, (mfaVerified) => {
          if (mfaVerified.mfaSessionToken === mfaSessionToken) {
            isMfaVerified = mfaVerified.isMfaVerified;
            mfaSessionTokenFoundFlag = true;
          }
        });

        if (!mfaSessionTokenFoundFlag) {
          mfaVerifiedArray.push({
            mfaSessionToken,
            isMfaVerified
          });
        }
      }
      else {
        mfaVerifiedArray = [{
          mfaSessionToken,
          isMfaVerified
        }]
      }

      await userCache.deleteUserFromCache(email + "_" + applicationName);
      cacheUser["mfaVerifiedArray"] = mfaVerifiedArray;
      await userCache.setUserCache(email, cacheUser, applicationName);
      showMfa = isMfaEnabled && !isMfaVerified ? true : false;
    }
    else {
      let userData = await appUserHelper.findAppUserByEmailId(email, applicationName);
      console.log("Userdata", userData);
      let isMfaVerified = false;
      let { isMfaEnabled = false, mfaVerifiedArray = [] } = userData || {};
      if (!isEmpty(mfaVerifiedArray)) {
        await Promise.map(mfaVerifiedArray, (mfaVerified) => {
          if (mfaVerified.mfaSessionToken === mfaSessionToken) {
            isMfaVerified = mfaVerified.isMfaVerified;
          }
        });
      }
      else {
        mfaVerifiedArray = [{
          mfaSessionToken,
          isMfaVerified
        }]
      }

      await userCache.deleteUserFromCache(email + "_" + applicationName);
      userData["mfaVerifiedArray"] = mfaVerifiedArray;
      await userCache.setUserCache(email, userData, applicationName);

      const { mfaStrategy = {} } = config;
      const { enforceMfa = [] } = mfaStrategy
      showMfa = enforceMfa.includes(applicationName) ? (!isMfaEnabled || !isMfaVerified) : (isMfaEnabled && !isMfaVerified);
    }
    res.json({ showMfa });
  }
  catch (error) {
    logger.error( error, "Error in fetching data from checkMfaFactors");
    throw error;
  }
}

const checkMfaEnabled = async (req, res) => {
  try {
    const { email } = req.body
    const applicationName = get(req, "headers.x-app-origin", null);
    let userData = await appUserHelper.findAppUserByEmailId(email, applicationName);
    const { isMfaEnabled = false } = userData || {};
    res.json({ isMfaEnabled });
  }
  catch (error) {
    throw error;
  }
}

module.exports = {
  ...commonController,
  ...userCache,
  ...userHelper,
  ...userDetailController,
  createData,
  readData,
  listData,
  listMasterData,
  updateData,
  updateProfile,
  getReporters,
  userById,
  userByEmailId,
  readEmployeeData,
  fetchEmployeeData,
  verifyAppOrigin,
  fetchUserFromCache,
  changeDefaultOrg,
  getEmailFromToken,
  checkMfaFactors,
  checkMfaEnabled
};

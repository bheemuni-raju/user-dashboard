'use strict';

const bunyan = require('bunyan');
const Promise = require('bluebird');
const jwt = require('jsonwebtoken');
const { isArray, startCase, get, isEmpty, flattenDeep } = require("lodash");
const { AccessToken, Employee, MasterEmployee } = require('@byjus-orders/nexemplum/ums');
const userUtil = require('@byjus-orders/nfoundation/ums/utils/userUtil');

const jwtHelper = require('../../../common/jwtMiddleware');
const config = require('../../../config');
const logger = require('@byjus-orders/byjus-logger').child({ module: 'authController'});

const createAccessToken = async user => {
  const { accessToken, refreshToken } = await jwtHelper.createTokens(user);

  const tokenInstance = new AccessToken({
    accessToken,
    createdAt: new Date(),
    validTill: new Date(),
    employee: user
  });
  tokenInstance.save();

  return {
    accessToken,
    refreshToken
  };
};

const refreshAccessToken = async (req, res) => {
  if (req.headers && req.headers.authorization) {
    const authToken = req.headers.authorization;
    const tokenModel = AccessToken.findOne({ where: { token: authToken } });

    if (!tokenModel) {
      return res.json({ message: 'Please provide a valid authToken to get new token.' });
    }

    const { accessToken, refreshToken } = await createAccessToken(accessToken.user);
    return res.status(200).json({ accessToken, refreshToken });
  } else {
    return res.status(403).json({ message: 'Unauthorised access, please provide auth creds.' });
  }
};

const generateToken = async (req, res) => {
  if (req.body && req.body.employeeId) {
    const { employeeId } = req.body;
    const employee = await Employee.findById(employeeId).lean();

    if (!employee) return res.status(404).json({ message: `No emloyee found with Id: ${req.body.employeeId}` });
    const { accessToken, refreshToken } = await createAccessToken(employee);

    if (!accessToken) {
      return res.status(400).json({ messgae: `Unable to create access token for empId: ${employeeId}` });
    }
    return res.status(200).json({ employeeId, accessToken, refreshToken });
  }

  return res.status(400).json({ message: 'Please provide userId to get accesstoken.' });
};

/***
This method is used from mobile app of the loanVendor partners to authenticate sales people
Example: Ezcred mobile app for ICICI and Paysense mobile app for RBL and Fullerton
 */
const getUserDetails = async (req, res) => {
  const { email } = req.body;
  logger.info({method:"getUserDetails", url: req.url}, "getUserDetails method initialized");
  try {
    if (!email) {
      return res.status(400).json({ message: "Missing Email Id" })
    }

    const masterUser = await MasterEmployee.findOne({ email }).lean();
    if (!isEmpty(masterUser)) {
      let userDept = get(masterUser, "department", []);
      const EmployeeCollection = userUtil.getEmployeeCollection(userDept[0]) || Employee;
      const user = await EmployeeCollection.findOne({ email });
      if (user) {
        const data = {
          name: user.name,
          email: user.email,
          city: user.location,
          status: startCase(user.status),
          phone: isArray(user.contact) && user.contact.length !== 0 && user.contact[0] !== "-" ? user.contact[0] : undefined,
          role: "sales_agent",
        };
        const pics = [];

        const reportingTo = user.reportingTo;
        const reportingValues = reportingTo && Object.values(reportingTo);
        const eligibleReporters = flattenDeep(reportingValues);
        eligibleReporters.map(reporter => {
          let reporterEmail = get(reporter, 'userEmail', '');
          if (!isEmpty(reporterEmail)) {
            pics.push(reporterEmail);
          }
        })

        data.pic_emails = pics;

        return res.status(200).json(data);
      } else {
        return res.status(400).json({ message: "Invalid Email Id" });
      }
    }


  } catch (err) {
    logger.error(err , 'Error on getUserDetails API');
    return res.status(500).json({ message: "Internal server error. Please contact with Byjus" });
  }
}

const getUserFromToken = async (req, res) => {
  res.append('x-access-token', req.accessToken);
  res.append('x-refresh-token', req.refreshToken);
  return res.json(req.user);
};

module.exports = {
  generateToken,
  getUserFromToken,
  createAccessToken,
  refreshAccessToken,
  getUserDetails
};

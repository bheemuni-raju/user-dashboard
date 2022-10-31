const { startCase, get, isEmpty } = require('lodash');
const jwt = require('jsonwebtoken');

const { MasterEmployee, ScEmployee, UeEmployee, Employee, FinanceEmployee } = require('@byjus-orders/nexemplum/ums');
const userUtil = require('@byjus-orders/nfoundation/ums/utils/userUtil');
const { BadRequestError } = require('../../../lib/errors')


const emailFromTokenMiddleware = async (req, res, next) => {
    const token = get(req, "headers.x-id-token", "");
    if (isEmpty(token)) {
        next(new BadRequestError('Token Tampered, Please try login again'));
    }
    const { payload: { email = '' } = {} } = jwt.decode(token, { complete: true });
    const cloneReqBody = { ...req.body, email };
    console.log('cloneReqBody : ', cloneReqBody);
    req.body = cloneReqBody;
    next();
}

const getUserByDepartmentMiddleware = async (req, res, next) => {
    let { email, department: requestedDepartment } = req.body;

    try {
        const user = await getEmployeeData(email, requestedDepartment);

        req.user = user;
        next;
    } catch (error) {
        throw new Error(error);
    }
}

const getUserDataByDepartment = async (email, requestedDepartment, applicationName = "") => {
    let validEmailFlag = false;
    let inputEmailFormat = "";
    let validEmailFormats = ["@byjus.com", "@moreideas.ae", "@ls.moreideas.ae", "@aesl.in", "@tangibleplay.com"];
    validEmailFormats.map(emailFormat => {
        if (email.includes(emailFormat)) {
            validEmailFlag = true;
            inputEmailFormat = emailFormat;
        }
    });

    if (validEmailFlag) {
        const masterUser = await MasterEmployee.findOne({ email }).lean();
        let statusArray = ["left", "non_sales", "exit"];
        if (masterUser) {
            const { department } = masterUser;
            const departmentName = requestedDepartment || get(department, '0');

            /**Taking the collection based on department */
            const EmployeeCollection = userUtil.getEmployeeCollection(departmentName) || Employee;
            const user = await EmployeeCollection.findOne({ email, status: { "$nin": statusArray } }).lean();

            /**if user doesn't exist in respective collection, return the master data corresponding to it.*/
            return user || masterUser;
        }
        else {
            /**For safer side checking across collection and giving data for the email */
            let userData = await Employee.findOne({ email, status: { "$nin": statusArray } }).lean();
            if (!userData) {
                userData = await ScEmployee.findOne({ email, status: { "$nin": statusArray } }).lean();
            }
            if (!userData) {
                userData = await UeEmployee.findOne({ email, status: { "$nin": statusArray } }).lean();
            }
            if (!userData) {
                userData = await FinanceEmployee.findOne({ email, status: { "$nin": statusArray } }).lean();
            }

            if (applicationName !== "web-wms-app") {
                const masterEmployeeDepartment = (userData && userData.department) || requestedDepartment;
                let updateObj = {
                    name: startCase(email.split(inputEmailFormat)[0]),
                    email,
                    department: [masterEmployeeDepartment],
                    createdBy: 'system'
                }
                if (!isEmpty(userData)) {
                    updateObj = {
                        name: get(userData, 'name', ''),
                        email,
                        tnlId: get(userData, 'tnlId', ''),
                        campaign: get(userData, 'campaign', ''),
                        country: get(userData, 'country', ''),
                        location: get(userData, 'location', ''),
                        department: [masterEmployeeDepartment],
                        createdBy: 'system'
                    }
                }

                let userTnlId = get(userData, 'tnlId', '');
                let userEmailId = get(userData, 'email', '');
                let duplicatedTnlMasterEntry = await MasterEmployee.findOne({ email: userEmailId, tnlId: userTnlId }).lean();

                if (!isEmpty(userTnlId) && !isEmpty(duplicatedTnlMasterEntry)) {
                    throw new Error('Employee already exist with this TnlId!');
                }
                else {
                    await userUtil.retainActiveDepartmentInMaster(email);
                    const newUser = new MasterEmployee(updateObj);
                    const savedUser = await newUser.save();
                    console.log(`${email} is not part of Master employee. Creating entry`);

                    return userData || savedUser;
                }
            }
            else {
                return {};
            }
        }
    }
    else {
        return {};
    }
}

module.exports = {
    getUserByDepartmentMiddleware,
    getUserDataByDepartment,
    emailFromTokenMiddleware
}
const Promise = require('bluebird');
const { Employee, Department, SubDepartment, Role, ScEmployee, UeEmployee, FinanceEmployee } = require('@byjus-orders/nexemplum/ums');

const otpGenerator = require('../../../lib/otp-generator');
const { get, map, isEmpty, uniq } = require('lodash');
const { sendNotification } = require('../../../lib/send-notification');
const { getDiff, validateEmailFormat } = require('../utils/userUtil');
const MasterEmployee = require('@byjus-orders/nexemplum/ums/MasterEmployee');
const userUtil = require('@byjus-orders/nfoundation/ums/utils/userUtil');
const logger = require('../../../lib/bunyan-logger')('userDetailController');
const employeeReferralController = require('../../businessdevelopment/employeereferral/employeeReferralController');

const updateUserDetails = async (req, res) => {
    const { email, status, campaign, location, tnlId, country, department, name } = req.body;

    if (["non_sales", "Non Sales"].includes(status) && department === "business_development") {
        throw new Error("Please select valid Non-Sales Department");
    }

    const updateKeys = Object.keys(req.body) || {};

    try {
        /**Get user old details and format it to perform diff on it */
        const oldData = await getUserDataByEmailId(email);
        const formattedOldData = oldData;

        /**Update Employee with payload passed */
        const updateObj = getFormattedUpdateObj(req.body);
        const isValidAttritionDetails = checkAttritionDetails(updateObj);
        if (isValidAttritionDetails) {
            await Employee.updateOne({ email }, {
                $set: {
                    ...updateObj
                }
            });

            let employee = await MasterEmployee.findOne({ email });
            let departmentArray = get(employee, "department");
            if (!isEmpty(department)) {
                if (!isEmpty(departmentArray)) {
                    departmentArray.push(department);
                    departmentArray = uniq(departmentArray);
                }
                else {
                    departmentArray = [department];
                }
            }

            if (["non_sales", "Non Sales"].includes(status) && !isEmpty(departmentArray)) {
                departmentArray = departmentArray.filter(x => x != "business_development");
            }

            await MasterEmployee.updateOne({ email }, {
                "$set": {
                    name,
                    tnlId,
                    country,
                    campaign,
                    location,
                    updatedBy: get(req, 'user.email'),
                    department: departmentArray
                }
            }, { upsert: true });
        }
        else {
            throw new Error("Please enter valid Filled By byjus email id");
        }

        /**Get user new details and format it to perform diff on it */
        const newData = await getUserDataByEmailId(email);
        const formattedNewData = newData;
        const historyLogs = getDiff(formattedOldData, formattedNewData, "userDetail");

        /**if changes are there, then only update history */
        if (!isEmpty(historyLogs)) {
            let employee = await Employee.findOne({ email });
            let history = get(employee, "history", []);

            await Employee.updateOne({ email }, {
                $push: {
                    history: {
                        changes: historyLogs,
                        updatedBy: req.user ? get(req.user, 'email') : 'system',
                        updatedAt: new Date()
                    }
                },
                $set: {
                    "updateCounter": history.length + 1,
                    "selfReconciliationDetails.reconciliationRequired": "yes"
                }
            })
        }

        res.json({ historyLogs, message: 'Updated Successfully' });
        await userUtil.retainActiveDepartmentInMaster(email);
        employeeReferralController.updateRhUserData(req);

    } catch (error) {
        if (error && error.code === 11000) {
            if (error.message.includes("tnlId_1")) {
                logger.error({ method: 'updateUserDetails' }, 'Duplicate TnlId', error);
                throw new Error('Employee already exist with this TnlId!');
            }
            throw new Error(error.message);
        }

        logger.error({ method: 'updateUserDetails' }, 'Employee updation failed', error);
        throw new Error(error);
    }
}

/**Fields with referenceId should have either _id or null, other non-empty value can not be used */
const getFormattedUpdateObj = (updateObj) => {
    Object.keys(updateObj).map(key => {
        if (["department", "subDepartment", "role"].includes(key) && isEmpty(updateObj[key])) {
            updateObj[key] = null;
        }
    });

    return updateObj;
}

/** To check whether attrition details provided by the user as valid */
const checkAttritionDetails = (updateObj) => {
    let validEmailFlag = true;
    if (["left", "Left"].includes(updateObj.status) && !isEmpty(updateObj.attritionDetails)) {
        let email = get(updateObj, "attritionDetails.filledByEmail");
        validEmailFlag = validateEmailFormat(email);

    }

    return validEmailFlag;
}

/**Getting all user details by populating required fields */
const getUserDataByEmailId = async emailId => {
    const user = await Employee.findOne({ email: emailId }).lean();

    return user;
};

const assignReporters = async (req, res) => {
    const { reporters, reportingToUser, reportingToType, roleLevel } = req.body;

    try {
        await Employee.updateMany({ email: { "$in": reporters } }, {
            "$addToSet": {
                "reportingTo": {
                    user: reportingToUser,
                    level: roleLevel,
                    userType: reportingToType || 'PRIMARY'
                }
            }
        });

        res.json('Reporters are updated successfully');
    } catch (error) {
        throw new Error(error);
    }
}

const assignMiscellaneousReporters = async (req, res) => {
    const { reporters, reportingToUser, role } = req.body;

    try {
        await Employee.updateMany({ email: { "$in": reporters } }, {
            "$addToSet": {
                "managedBy": {
                    user: reportingToUser,
                    role
                }
            }
        });

        res.json('Reporters are updated successfully');
    } catch (error) {
        throw new Error(error);
    }
}

const getUserComments = async (req, res) => {
    const { email } = req.query;

    if (!email) throw new Error('email is missing');

    try {
        const userData = await Employee.findOne({ email }).lean();

        if (userData) {
            res.json(userData.comments || []);
        }
        else {
            throw new Error(`${email} is not found`);
        }
    } catch (error) {
        throw new Error(error);
    }
}

const updateUserComments = async (req, res) => {
    const { email, comment, commentedBy } = req.body;

    if (!email) throw new Error('email is missing');

    try {
        const savedData = await Employee.findOneAndUpdate({ email }, {
            $addToSet: {
                "comments": {
                    comment,
                    commentedBy,
                    commentedAt: new Date()
                }
            }
        }, {
            new: true
        });

        res.json(savedData);
    } catch (error) {
        throw new Error(error);
    }
}

const updateUserEmail = async (req, res) => {
    const { oldEmail, newEmail, updatedBy } = req.body;

    logger.info(`Updating email for ${oldEmail} to ${newEmail}`);

    try {
        let historyObj = {
            "changes": {
                "email": {
                    "oldValue": oldEmail,
                    "newValue": newEmail
                }
            },
            "updatedBy": updatedBy,
            "updatedAt": new Date()
        }

        await Employee.findOneAndUpdate({ email: oldEmail.toLowerCase() }, {
            "$set": {
                "email": newEmail.toLowerCase()
            },
            "$push": {
                "history": historyObj
            }
        });

        await MasterEmployee.findOneAndUpdate({ email: oldEmail.toLowerCase() }, {
            "$set": {
                "email": newEmail.toLowerCase()
            }
        });

        return res.json({ message: `Email updated successfully for ${oldEmail}`, data: newEmail });
    } catch (error) {
        throw new Error(error);
    }
}

const checkDuplicateContact = async (email, contacts, action) => {
    let query = { 'contactDetails.contactNo': { "$in": contacts } };

    if (["SAVE_CONTACT_DETAILS", "SAVE_MARK_PRIMARY"].includes(action)) {
        query["email"] = { "$ne": email }
    }

    const duplicateContact = await Employee.findOne(query);

    if (duplicateContact) {
        const duplicateContactEmail = get(duplicateContact, 'email');
        const msg = (duplicateContactEmail == email) ? `Contact no. is already added` : `Duplicate contact. ContactNo is already assigned to ${duplicateContactEmail}`;
        throw new Error(msg);
    }
    else if (action != "SAVE_CONTACT_DETAILS") {
        const employeeData = await Employee.findOne({ email });
        const { contactDetails } = employeeData || {};

        if (contactDetails.length >= 2) {
            throw new Error(`Only 2 contacts can be added. To change existing contact please request STC team`);
        }
    }
    else {
        return;
    }
    return;
}

const updateContactDetails = async (req, res) => {
    const { user } = req;
    const userEmail = get(user, 'email');
    let { contactNo, contactDetails, email, action, otp, otpMessage } = req.body;
    let contacts = [contactNo];
    let data = req.body;
    let finalisedEmail = email || userEmail;
    data["email"] = finalisedEmail;

    logger.info(`Updating contactDetails for ${finalisedEmail} with ${contactNo}`);

    if (action === "SAVE_CONTACT_DETAILS") {
        contacts = map(contactDetails, 'contactNo', '');
    }

    await checkDuplicateContact(finalisedEmail, contacts, action);

    try {
        if (action === "SAVE_CONTACT_DETAILS") {
            await saveContactDetails(data, req);
        }
        else if (action === "SAVE") {
            await saveContact(data, req);
        }
        else if (action === "SAVE_MARK_PRIMARY") {
            await saveContactAndMarkPrimary(data, req);
        }
        else if (action === "SAVE_SEND_OTP") {
            await saveContactAndSendOtp(data, req);
        }
        else if (action === "SAVE_VERIFY_OTP") {
            await saveContactAndVerifyOtp(data, req);
        }
        else {
            return res.status(400).json(`action is not allowed`);
        }

        const updatedData = await Employee.findOne({ email: finalisedEmail }).lean();
        delete updatedData.additionalDetails;
        let rhData = {
            body: {
                ...updatedData
            }
        }

        employeeReferralController.updateRhUserData(rhData);

        return res.json({ message: `Contact updated successfully for ${finalisedEmail}`, data: updatedData });
    } catch (error) {
        throw new Error(error);
    }
}

const saveContactDetails = async (data, req) => {
    let { contactDetails, email } = data;
    const contactArray = map(contactDetails, 'contactNo', '');

    if (contactArray.length > 2) throw new Error(`Only 2 contacts can be added`);
    const formattedContactDetails = contactDetails.map((data) => {
        return {
            contactNo: get(data, 'contactNo'),
            updatedAt: new Date(),
            isVerified: true,
            updatedBy: get(req, 'user.email')
        }
    })
    await Employee.updateOne({ email }, {
        "$set": {
            "contactDetails": formattedContactDetails,
            "contact": contactArray
        }
    });
}

const saveContact = async (data, req) => {
    let { contactNo, email } = data;

    /**Resetting all the contactDetails isPrimary flag to false before updating the new one */
    // await Employee.update({ email, "contactDetails.isPrimary": true }, {
    //     "$set": { "contactDetails.$[elem].isPrimary": false }
    // }, {
    //     "arrayFilters": [{ "elem.isPrimary": true }],
    //     "multi": true
    // });

    await Employee.updateOne({ email, "contactDetails.contactNo": { "$ne": contactNo } }, {
        "$addToSet": {
            "contactDetails": {
                contactNo,
                updatedAt: new Date(),
                isVerified: false,
                updatedAt: new Date(),
                updatedBy: get(req, 'user.email')
            }
        },
        "$push": {
            "contact": contactNo
        }
    });
}

const saveContactAndMarkPrimary = async (data, req) => {
    let { contactNo, email } = data;

    /**Resetting all the contactDetails isPrimary flag to false before updating the new one */
    await Employee.update({ email, "contactDetails.isPrimary": true }, {
        "$set": { "contactDetails.$[elem].isPrimary": false }
    }, {
        "arrayFilters": [{ "elem.isPrimary": true }],
        "multi": true
    });

    await Employee.updateOne({ email, "contactDetails.contactNo": { "$eq": contactNo } }, {
        "$set": {
            "contactDetails.$.isPrimary": true,
            "contactDetails.$.updatedAt": new Date(),
            "contactDetails.$.updatedBy": get(req, 'user.email')
        }
    });
}

const saveContactAndSendOtp = async (data, req) => {
    let { contactNo, email, otpMessage } = data;

    const otp = otpGenerator();
    await sendNotification('sms', { otp, message: `${otpMessage}. Otp is ${otp}`, contactNo });
    logger.info(`Otp for updating contactDetails for ${email} with ${contactNo} is ${otp}`);

    await Employee.updateOne({ email }, {
        "$set": {
            [`additionalDetails.contactVerification.${contactNo}`]: otp
        }
    });
}

const saveContactAndVerifyOtp = async (data, req) => {
    let { contactNo, email, otp, otpMessage } = data;
    const employeeData = await Employee.findOne({ email }).select('contactDetails additionalDetails').lean();

    const { additionalDetails = {} } = employeeData || {};
    const { contactVerification } = additionalDetails || {};
    const exactOtp = contactVerification && contactVerification[contactNo];

    if (!exactOtp) throw new Error(`contact not found.`);

    if (exactOtp === otp) {
        logger.info(`Otp matched for ${email} for ${contactNo}. ActualOtp:${exactOtp} EnteredOtp:${otp}`);
        findQuery = { email, "contactDetails.contactNo": contactNo };

        await Employee.updateOne({ email }, {
            "$addToSet": {
                "contactDetails": {
                    contactNo,
                    updatedAt: new Date(),
                    isVerified: true,
                    otp,
                    updatedAt: new Date(),
                    updatedBy: get(req, 'user.email')
                }
            },
            "$push": {
                "contact": contactNo
            }
        });
    }
    else {
        throw new Error(`Invalid Otp. Please try again`)
    }
}

module.exports = {
    assignReporters,
    assignMiscellaneousReporters,
    getUserComments,
    updateUserComments,
    updateUserDetails,
    updateContactDetails,
    updateUserEmail
}

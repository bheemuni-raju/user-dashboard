const { MasterEmployee, Employee, ScEmployee, UeEmployee, FinanceEmployee } = require('@byjus-orders/nexemplum/ums');
const { get, difference, isEqual, isEmpty, isObject, transform, isDate } = require('lodash');
const moment = require('moment');

const departmentWithOldModel = ["business_development", "buisness_development", "", null, undefined];
const departmentWithNewModel = ["supply_chain", "user_experience"];

const userPopulateKeysArray = ['department', 'department.permissionTemplate',
    'subDepartment', 'subDepartment.permissionTemplate',
    'role', 'miscellaneousRole', 'role.permissionTemplate', 'miscellaneousRole.permissionTemplate',
    'groups', 'groups.permissionTemplate',
    'permissionTemplate'];

/**Function to perform diff between oldUserData and newUserData and create historyLogs */
const getDiff = (oldData, newData, controllerName) => {
    const arrayFields = ["permissionTemplate", "groups", "contact"];
    const objectFields = ["reportingTo", "additionalDetails", "dateFields", "attritionDetails", "tags"];
    const dateFields = ["doj", "activationDate"];

    if (controllerName != "attrition") {
        dateFields.push('lastWorkingDate');
    }

    const historyLogs = {};

    Object.keys(newData).map(key => {
        let oldValue = get(oldData, key);
        let newValue = get(newData, key);

        if (["updatedAt", "history"].includes(key)) {
            /**Dont track changes for this */
        }
        else if (arrayFields.includes(key) && difference(newValue, oldValue) != 0) {
            oldValue = (oldValue && oldValue.join) ? oldValue.join() : oldValue;
            newValue = (newValue && newValue.join) ? newValue.join() : newValue;
            historyLogs[key] = { oldValue, newValue };
        }
        else if (dateFields.includes(key)) {
            oldValue = oldValue ? moment(new Date(oldValue)) : oldValue;
            newValue = newValue ? moment(new Date(newValue)) : newValue;
            const dayDifference = (newValue && oldValue) ? newValue.diff(oldValue, 'days') : ((!newValue && !oldValue) ? 0 : 1);
            if (dayDifference != 0) {
                historyLogs[key] = { oldValue: !isEmpty(oldValue) ? new Date(oldValue).toDateString() : "", newValue: !isEmpty(newValue) ? new Date(newValue).toDateString() : "" };
            }
        }
        else if (objectFields.includes(key) && !isEqual(newValue, oldValue)) {
            /**Get the keys of object which has been changed */

            if (["reportingTo"].includes(key)) {
                let reportingToKeys = Object.keys(newValue);
                if (!isEmpty(oldValue)) {
                    Object.keys(oldValue).map((oldKey) => {
                        if (!reportingToKeys.includes(oldKey)) {
                            reportingToKeys.push(oldKey);
                        }
                    });

                    reportingToKeys.map((key) => {
                        let newUserEmails = (isEmpty(newValue[key])) ? [] : newValue[key].map(val => {
                            return val.userEmail;
                        });
                        newUserEmails.filter(ele => !isEmpty(ele));

                        let oldUserEmails = (isEmpty(oldValue[key])) ? [] : oldValue[key].map(val => {
                            return val.userEmail;
                        });
                        oldUserEmails.filter(ele => !isEmpty(ele));

                        if (difference(newUserEmails, oldUserEmails) != 0 || difference(oldUserEmails, newUserEmails) != 0) {
                            historyLogs[`${key}`] = { oldValue: oldUserEmails.join(), newValue: newUserEmails.join() };
                        }
                    })
                }
            }
            else if (["dateFields"].includes(key)) {
                let dateFieldKeys = Object.keys(newValue);
                if (!isEmpty(oldValue)) {
                    Object.keys(oldValue).map((oldKey) => {
                        if (!dateFieldKeys.includes(oldKey)) {
                            dateFieldKeys.push(oldKey);
                        }
                    });

                    dateFieldKeys.map((key) => {
                        oldValue[key] = oldValue[key] ? moment(new Date(oldValue[key])) : oldValue[key];
                        newValue[key] = newValue[key] ? moment(new Date(newValue[key])) : newValue[key];
                        const dayDifference = (newValue[key] && oldValue[key]) ? newValue[key].diff(oldValue[key], 'days') : ((!newValue[key] && !oldValue[key]) ? 0 : 1);
                        if (dayDifference != 0) {
                            historyLogs[key] = { oldValue: !isEmpty(oldValue[key]) ? new Date(oldValue[key]).toDateString() : "", newValue: !isEmpty(newValue[key]) ? new Date(newValue[key]).toDateString() : "" };
                        }
                    })
                }
            }
            else {
                const objChanges = getObjectDiff(newValue, oldValue);
                Object.keys(objChanges).map((objKey) => {
                    let formattedOldValue = get(oldValue, objKey, "");
                    let formattedNewValue = get(newValue, objKey, "");
                    if (formattedOldValue !== formattedNewValue) {
                        historyLogs[`${key}:${objKey}`] = { oldValue: formattedOldValue, newValue: formattedNewValue };
                    }
                })
            }
        }
        else if (!isEqual(newValue, oldValue)) {
            if (typeof newValue === "boolean" && typeof oldValue === "boolean") {
                historyLogs[key] = { oldValue: oldValue, newValue: newValue };
            }
            else {
                let formattedNewValue = !isEmpty(newValue) ? newValue : "";
                let formattedOldValue = !isEmpty(oldValue) ? oldValue : "";
                if (formattedOldValue !== formattedNewValue) {
                    historyLogs[key] = { oldValue: formattedOldValue, newValue: formattedNewValue };
                }
            }
        }
    });

    return historyLogs;
}

const getObjectDiff = (object, base = {}) => {
    function changes(object, base) {
        return transform(object, (result, value, key) => {
            if (!isEqual(value, base[key])) {
                result[key] = (isObject(value) && isObject(base[key])) ? changes(value, base[key]) : value;
            }
        });
    }
    return changes(object, base);
}

const setActionDetails = (actionDetails, formattedOldData, formattedNewData) => {
    actionDetails["updatedAt"] = new Date();
    let oldStatus = get(formattedOldData, "status", "");
    let newStatus = get(formattedNewData, "status", "");

    if (oldStatus === "active" && newStatus === "inactive") {
        actionDetails["deactivatedAt"] = new Date();
    }
    else if (newStatus === "active" && oldStatus === "inactive") {
        actionDetails["activatedAt"] = new Date();
    }

    return actionDetails;
}

module.exports = {
    departmentWithOldModel,
    departmentWithNewModel,
    userPopulateKeysArray,
    getDiff,
    setActionDetails
}
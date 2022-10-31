
import { get, sortBy, remove, isEmpty } from 'lodash'
import { callApi } from 'store/middleware/api';

export const fetchDependentSeperationReason = (primarySeperationReason) => {
    const subCategoryMap = {
        "managementIssue": [{
            label: 'Unprofessional Behaviour', value: 'unprofessionalBehaviour'
        }, {
            label: 'Lack of Support', value: 'lackOfSupport'
        }, {
            label: 'Favoritism', value: 'favoritism'
        }],
        "workCulture": [{
            label: 'Work Load', value: 'workLoad'
        }, {
            label: 'Work Life Imbalance', value: 'workLifeImbalance'
        }, {
            label: 'Long Working Hours (>12 hrs)', value: 'longWorkingHours'
        }],
        "policyIssue": [{
            label: 'Location Issue', value: 'locationIssue'
        }, {
            label: 'Lack of Growth Opportunities', value: 'lackOfGrowthOpportunities'
        }, {
            label: 'Training Issue', value: 'trainingIssue'
        }, {
            label: 'Pay/Appraisal Issue', valuue: 'payIssue'
        }],
        "personalReasons": [{
            label: 'Health Issues', value: 'healthIssues'
        }, {
            label: 'Higher Education', value: 'higherEducation'
        }, {
            label: 'Family Issues', value: 'familyIssues'
        }, {
            label: 'Better Opportunity Outside', value: 'betterOpportunityOutside'
        }],
        "othersCategory": [{
            label: 'Moral Dilemma of Sales', value: 'moralSalesDilemma'
        }, {
            label: 'Travel Issues', value: 'travelIssues'
        }, {
            label: 'Peer Issues', value: 'peerIssues'
        }, {
            label: 'Others', value: 'othersSubCategory'
        }]
    }

    return subCategoryMap[primarySeperationReason] || [];
}

export const fetchEscalationPriority = (primarySeperationReason) => {
    let escalationPriorityOptions = [];
    if (primarySeperationReason === "managementIssue") {
        escalationPriorityOptions = [{
            label: "High", value: "highPriority"
        }, {
            label: "Medium", value: "mediumPriority"
        }];
    }

    return escalationPriorityOptions;
}

/**Applicable ReportingTo roles = roles with level greater than the level of user role*/
export const fetchReportingToRoles = (reportingTo, teamRoles, userRole, status, activationDate, department) => {
    let initialValues = {};
    /**Map values from reportingTo to initialValues */
    Object.keys(reportingTo).map(rep => {
        const roleFormattedName = rep;
        let values = isEmpty(reportingTo[rep]) ? [] : reportingTo[rep].map(r => {
            return get(r, 'userEmail');
        })
        remove(values, n => !n);
        initialValues[roleFormattedName] = values;
    });

    /**Applicable ReportingTo roles = roles with level greatyer than the level of user role*/
    let reportingToRoles = teamRoles.filter(role => { return role.level > userRole.level });

    if (department === "supply_chain") {
        reportingToRoles = teamRoles.filter(role => { return role.level >= userRole.level });
    }

    reportingToRoles = sortBy(reportingToRoles, 'level');

    if (department === "business_development" && get(userRole, "subDepartmentFormattedName", "") === "sales") {
        if (['bdt'].includes(userRole.formattedName)) {
            let includedRoles = ['bdtm', 'team_manager', 'assistant_senior_bdtm', 'senior_bdtm', 'assistant_senior_manager', 'senior_manager', 'agm', 'gm', 'avp', 'team_head', 'director', 'hrbp_lead'];
            reportingToRoles = reportingToRoles.filter(role => { return includedRoles.includes(role.formattedName) });
        }

        if (['bda', 'bdat'].includes(userRole.formattedName)) {
            let includedRoles = ['team_manager', 'assistant_senior_manager', 'senior_manager', 'agm', 'gm', 'avp', 'team_head', 'director', 'hrbp_lead'];
            reportingToRoles = reportingToRoles.filter(role => { return includedRoles.includes(role.formattedName) });
        }

        if (['bdtm'].includes(userRole.formattedName)) {
            let includedRoles = ['team_manager', 'assistant_senior_bdtm', 'senior_bdtm', 'assistant_senior_manager', 'senior_manager', 'agm', 'gm', 'avp', 'team_head', 'director', 'hrbp_lead'];
            reportingToRoles = reportingToRoles.filter(role => { return includedRoles.includes(role.formattedName) });
        }

        if (['team_manager'].includes(userRole.formattedName)) {
            let includedRoles = ['assistant_senior_manager', 'senior_manager', 'agm', 'gm', 'avp', 'team_head', 'director', 'hrbp_lead'];
            reportingToRoles = reportingToRoles.filter(role => { return includedRoles.includes(role.formattedName) });
        }

        if (['senior_bdtm'].includes(userRole.formattedName)) {
            let includedRoles = ['senior_manager', 'agm', 'gm', 'avp', 'team_head', 'director', 'hrbp_lead'];
            reportingToRoles = reportingToRoles.filter(role => { return includedRoles.includes(role.formattedName) });
        }

        if (['senior_manager'].includes(userRole.formattedName)) {
            let includedRoles = ['agm', 'gm', 'avp', 'team_head', 'director', 'hrbp_lead'];
            reportingToRoles = reportingToRoles.filter(role => { return includedRoles.includes(role.formattedName) });
        }
    }

    return { reportingToRoles, initialValues };
}

export const getUeUserStatuses = () => {
    let statusArray = ['active', 'transition', 'long_leave', 'maternity', 'notice_period', 'exit'];
    return statusArray;
}

export const modelMap = {
    'business_development': 'Employee',
    'finance': 'FinanceEmployee',
    'user_experience': 'UeEmployee',
    'supply_chain': 'ScEmployee',
    'human_resources': 'HrbpEmployee'
}

export const urlCreateMap = {
    'business_development': "/usermanagement/employee",
    'finance': '/usermanagement/financeemployee/createData',
    'user_experience': '/usermanagement/ueemployee/createData',
    'supply_chain': '/usermanagement/scemployee/createData'
}

export const urlUpdateMap = {
    'business_development': "/usermanagement/employee/operartion/updateData",
    'finance': '/usermanagement/financeemployee/updateData',
    'user_experience': '/usermanagement/ueemployee/updateData',
    'supply_chain': '/usermanagement/scemployee/updateData'
}

export const fetchStatusByDepartment = (department) => {
    let statusOptions = [];
    if (department === "business_development") {
        statusOptions = [
            {
                "label": "Active",
                "value": "active"
            },
            {
                "label": "Left",
                "value": "left"
            },
            {
                "label": "Campaign Training",
                "value": "campaign_training"
            },
            {
                "label": "Non Sales",
                "value": "non_sales"
            }
        ];
    }
    else if (["user_experience", "supply_chain", "finance"].includes(department)) {
        statusOptions = [
            {
                "label": "Active",
                "value": "active"
            }, {
                "label": "Transition",
                "value": "transition"
            }, {
                "label": "Long Leave",
                "value": "long_leave"
            }, {
                "label": "Maternity",
                "value": "maternity"
            }, {
                "label": "Notice Period",
                "value": "notice_period"
            }, {
                "label": "Exit",
                "value": "exit"
            }];
    }

    return statusOptions;
}

export const getFormattedDateFields = (userDetails) => {
    let { campaignTrainingStartDate, campaignTrainingEndDate, longLeaveStartDate, longLeaveEndDate, maternityStartDate,
        maternityEndDate, noticePeriodStartDate, noticePeriodEndDate, transitionDate } = userDetails;

    let dateFields = {};
    if (!isEmpty(campaignTrainingStartDate) && !isEmpty(campaignTrainingEndDate)) {
        dateFields["campaignTrainingStartDate"] = campaignTrainingStartDate;
        dateFields["campaignTrainingEndDate"] = campaignTrainingEndDate;
    }

    if (!isEmpty(longLeaveStartDate) && !isEmpty(longLeaveEndDate)) {
        dateFields["longLeaveStartDate"] = longLeaveStartDate;
        dateFields["longLeaveEndDate"] = longLeaveEndDate;
    }

    if (!isEmpty(maternityStartDate) && !isEmpty(maternityEndDate)) {
        dateFields["maternityStartDate"] = maternityStartDate;
        dateFields["maternityEndDate"] = maternityEndDate;
    }

    if (!isEmpty(noticePeriodStartDate) && !isEmpty(noticePeriodEndDate)) {
        dateFields["noticePeriodStartDate"] = noticePeriodStartDate;
        dateFields["noticePeriodEndDate"] = noticePeriodEndDate
    }

    if (!isEmpty(transitionDate)) {
        dateFields["transitionDate"] = transitionDate;
    }

    return dateFields;
}

export const validateEmail = (email) => {
    let validEmailFlag = false;

    if (!["", "NA"].includes(email)) {
        validEmailFlag = true;
    }

    if (validEmailFlag) {
        validEmailFlag = validateEmailFormat(email);
    }

    if (validEmailFlag) {
        let formattedEmail = email.split('@')[0].replace(".", "");
        //Regex for Valid Characters i.e. Alphabets & Numbers.
        var regex = /^[A-Za-z0-9_\-]+$/

        //Validate Email value against the Regex.
        var isValid = regex.test(formattedEmail);
        validEmailFlag = isValid;
    }

    return validEmailFlag;
}

export const validateEmailFormat = (email) => {
    let validEmailFormats = ["@byjus.com", "@moreideas.ae", "@ls.moreideas.ae", "@aesl.in", "@tangibleplay.com"];
    let validEmailArray = validEmailFormats.filter(format => email.indexOf(format) >= 0);
    let validEmailFlag = !isEmpty(validEmailArray) ? true : false;
    return validEmailFlag;
}

export const validateDateRange = (value) => {
    //Added min & max date range on date save
    let minDateRange = new Date("01-01-2010");
    let maxDateRange = new Date();
    let currentValue = new Date(value);
    let defaultValue = new Date("01-01-1970");

    if (!isEmpty(value) && (currentValue !== defaultValue) && ((currentValue < minDateRange) || (currentValue > maxDateRange))) {
        return false;
    }

    return true;
}

export const checkMultiFactorAuth = async () => {
    const url = `/usermanagement/employee/checkMfaFactors`;
    const method = "POST";
    const email = await getEmailFromToken();
    const mfaSessionToken = localStorage.getItem("mfa-session-id")

    const body = {
        email,
        mfaSessionToken
    }

    try {
        const response = await callApi(url, method, body, null, null, true)
        if (response != null) {
            console.log("Check Mfa Response: ", response);
            return response.showMfa;
        }
    }
    catch (error) {
        console.log(error.message);
        throw error;
    }

}

export const getEmailFromToken = () => {
    const url = `/usermanagement/employee/getEmailFromToken`;
    const method = "GET";
    return callApi(url, method, null, null, null, true)
        .then(response => {
            console.log(response);
            return response.email;
        })
}

export const checkMfaEnabled = async (email) => {
    const url = `/usermanagement/employee/checkMfaEnabled`;
    const method = "POST";
    try {
        const response = await callApi(url, method, { email }, null, null, true)
        if (response != null) {
            console.log("Check Mfa Response: ", response);
            return response.isMfaEnabled;
        }
    }
    catch (error) {
        throw error;
    }
}

export const getMfaUserToken = async () => {
    try {
        const url = `/usermanagement/getMfaUserToken`;
        const method = "GET";
        const response = await callApi(url, method, null, null, null, true)
        if (response != null) {
            console.log("Mfa User Token: ", response);
            return response.mfaSessionToken;
        }
    }
    catch (error) {
        throw error;
    }
}
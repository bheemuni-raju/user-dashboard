const permissionList = require('../../../../lib/permissionList');
const { isEmpty, get, snakeCase } = require('lodash');

let { viewSales, viewUserExperience, viewSupplyChain, viewFinance, viewAll } = permissionList.hierarchy;
const { Organization, Application } = require("@byjus-orders/npgexemplum");

const hierarchyMap = {
    [viewSales]: "business_development",
    [viewUserExperience]: "user_experience",
    [viewSupplyChain]: "supply_chain",
    [viewFinance]: "finance"
}

const getPermissionToHierarchyMapping = (userPermissions) => {
    let hierarchy = [];

    userPermissions.map((permission) => {
        if (hierarchyMap[permission]) {
            hierarchy.push(hierarchyMap[permission]);
        }
    });

    return hierarchy;
}

const getOrgId = async (orgName) => {
    let orgDetails = await Organization.findOne({ where: { orgFormattedName: snakeCase(orgName) } });
    let orgId = get(orgDetails, "id", "");
    return orgId;
}
const getAppId = async (appName) => {
    let appDetails = await Application.findOne({ where: { formattedName: snakeCase(appName) } });
    let appId = get(appDetails, "id", "");
    return appId;
}

const updateContextCriteriaBasedOnHierarchyPermissions = (userPermissions, hierarchyBasedPermissions, contextCriterias, formattedName) => {
    if (!isEmpty(userPermissions) && !userPermissions.includes(hierarchyBasedPermissions.viewAll)) {
        const allowedHierarchy = getPermissionToHierarchyMapping(userPermissions);

        if (!isEmpty(allowedHierarchy)) {
            contextCriterias.push({ [formattedName]: { "$in": allowedHierarchy }, selectedOperator: "in", selectedValue: allowedHierarchy, selectedColumn: formattedName });
        }
        else {
            contextCriterias.push({ [formattedName]: null, selectedOperator: "equal", selectedValue: null, selectedColumn: formattedName });
        }

        return contextCriterias;
    }
}

module.exports = {
    updateContextCriteriaBasedOnHierarchyPermissions,
    getOrgId,
    getAppId
}
const permissionList = require('../../../../lib/permissionList');
const { isEmpty } = require('lodash');

let { viewSales, viewUserExperience, viewSupplyChain, viewFinance, viewAll } = permissionList.hierarchy;

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
    updateContextCriteriaBasedOnHierarchyPermissions
}
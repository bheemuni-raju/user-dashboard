const { flattenDeep, map, union, isArray, concat, isEmpty, get, uniq, isObject } = require('lodash');
const { Role, Department, SubDepartment, Group, PermissionTemplate } = require('@byjus-orders/nexemplum/ums');

const bunyan = require('../../../lib/bunyan-logger');

const logger = bunyan('userHelper');

const addPermissionArray = user => {
    logger.info({ method: "addPermissionArray", message: "Create permission array by merging all permissionTemplates" });
    let mergedPermissions = [];
    if (user) {
        const userPermissions = extractPermissions(user);
        const departmentPermissions = user && extractPermissions(user.department);
        const rolePermissions = user && extractPermissions(user.role);
        const miscRolePermissions = user && extractPermissions(user.miscellaneousRole);
        const groupPermissions = user && extractPermissions(user.groups);
        /**Merging permissions of User, department and Role */
        mergedPermissions = flattenDeep(concat(userPermissions, departmentPermissions, rolePermissions, miscRolePermissions, groupPermissions));
    }
    return mergedPermissions;
};

const addNonSalesPermissionArray = async (user) => {
    logger.info({ method: "addNonSalesPermissionArray", message: "Create permission array by merging all permissionTemplates" });
    let mergedPermissions = [];
    let { permissionTemplate = [] } = user;
    if (user) {
        let userPermissionTemplate = await PermissionTemplate.find({ formatted_name: { "$in": permissionTemplate } }).lean();
        const userPermissions = extractUserPermissions(userPermissionTemplate);
        //TODO:Remove the fallback after collections are seggregated
        const department = user.department && await Department.findOne({ formattedName: isEmpty(user.department) ? "" : user.department }).populate('permissionTemplate').lean();
        const subDepartment = user.subDepartment && await SubDepartment.findOne({ formattedName: user.subDepartment }).populate('permissionTemplate').lean();
        const role = (user.role || user.miscellaneousRole) && await Role.find({ formattedName: { "$in": [user.role, ...(user.miscellaneousRole || [])] } }).populate('permissionTemplate').lean();

        const group = user.groups && await Group.find({ formattedName: { "$in": user.groups } }).lean();
        let groupPermissionTemplateArray = map(group, 'permissionTemplate', []);
        groupPermissionTemplateArray = flattenDeep(groupPermissionTemplateArray);

        const groupsPermissionTemplate = await PermissionTemplate.find({ "formatted_name": { "$in": groupPermissionTemplateArray } });
        const groupPermissions = extractUserPermissions(groupsPermissionTemplate);

        let deptBasedPermissionTemplate = get(department, 'permissionTemplate', []);
        let deptPermissionTemplate = map(deptBasedPermissionTemplate, 'formatted_name');

        let subDeptBasedPermissionTemplate = get(subDepartment, 'permissionTemplate', []);
        let subDeptPermissionTemplate = map(subDeptBasedPermissionTemplate, 'formatted_name')

        let roleBasedPermissionTemplate = get(role, '0.permissionTemplate', []);
        let rolePermissionTemplate = map(roleBasedPermissionTemplate, 'formatted_name')

        permissionTemplate = uniq(concat(permissionTemplate, deptPermissionTemplate, subDeptPermissionTemplate, rolePermissionTemplate));

        const departmentPermissions = extractPermissions(department);
        const subDepartmentPermissions = extractPermissions(subDepartment);
        const rolePermissions = extractPermissions(role);

        /**Merging permissions of User, department and Role */
        mergedPermissions = flattenDeep(concat(userPermissions, groupPermissions, departmentPermissions, subDepartmentPermissions, rolePermissions));
    }
    return { mergedPermissions, permissionTemplate };
};

const extractPermissions = entity => {
    let userPermissions = [];
    entity = isArray(entity) ? entity : [entity];

    entity.map((entityElm) => {
        if (entityElm &&
            entityElm.permissionTemplate &&
            entityElm.permissionTemplate.length > 0) {
            const permissionsArray = map(entityElm.permissionTemplate, 'permissions');
            userPermissions = concat(userPermissions, union(...permissionsArray));
        }
    });

    return userPermissions;
};

const extractUserPermissions = entity => {
    let userPermissions = [];
    entity = isArray(entity) ? entity : [entity];

    entity.map((permissionTemplate) => {
        if (!isEmpty(permissionTemplate)) {
            const permissionsArray = get(permissionTemplate, 'permissions');
            userPermissions = concat(userPermissions, permissionsArray);
        }
    });

    return uniq(userPermissions);
};

module.exports = {
    addPermissionArray,
    addNonSalesPermissionArray
}

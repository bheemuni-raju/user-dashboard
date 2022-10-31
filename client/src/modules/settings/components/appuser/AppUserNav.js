import { get, flattenDeep, remove, difference, size, startCase } from 'lodash';

export const appUserNavConfig = (user, appRoles) => {
    const appUserNavItems = getAppUserNavItems(appRoles, user) || [];
    let allItems = flattenDeep([
        ...appUserNavItems
    ]);

    const allPermissions = get(user, 'permissions');

    allItems = allItems.map((item) => {
        let { permission: itemPermission, children } = item;
        let childrenArray = [];

        /**If childrens are there, render them based on permissions */
        if (children) {
            childrenArray = children.map((child) => {
                let { permission: childPermission } = child;

                if (childPermission && childPermission.length) {
                    const diffCount = size(difference(childPermission, allPermissions));
                    const isValid = (diffCount === 0);
                    return isValid ? child : null;
                }
                return child;
            });
        }
        /**Removing null items */
        remove(childrenArray, n => !n);

        children && (item["children"] = childrenArray);
        /**If childrens has permission, render them based on permissions */
        if (itemPermission && itemPermission.length) {
            const diffCount = size(difference(itemPermission, allPermissions));
            /**If one or more permission is matching render the component */
            const isValid = (diffCount >= 0 && diffCount < itemPermission.length);
            return isValid ? item : null;
        }
        return item;
    })

    /**Removing null items */
    remove(allItems, n => !n);

    return {
        items: allItems
    }
};

const getRoleChildren = (appRoles, user) => {
    let children = [{
        name: 'All',
        url: `/settings/app-users/all`,
        icon: 'fa fa-user'
    }];

    appRoles.map(appRole => {
        let childObject = {
            name: startCase(appRole.appRoleName),
            url: `/settings/app-users/${appRole.appRoleName}`,
            icon: 'fa fa-user'
        }

        if (get(appRole, 'orgFormattedName', '') === get(user, 'orgFormattedName', '')) {
            children.push(childObject);
        }
    });

    return children;
}

const getAppUserNavItems = (appRoles, user) => {

    console.log(appRoles);
    let roleChildren = getRoleChildren(appRoles, user);

    return [{
        name: 'Roles',
        url: '/settings/app-users',
        icon: 'bjs-roles',
        badge: {
            variant: 'info',
            text: 'NEW',
        },
        children: roleChildren
    }]
}

export default appUserNavConfig;
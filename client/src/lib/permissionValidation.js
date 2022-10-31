import { isEmpty } from "lodash";

export const validatePermission = (user, permissionName) => {
  /** Merging permissions of User, department and Role */
  const mergedPermissions = (user && user.permissions) || [];

  return (
    user &&
    (permissionName
      ? mergedPermissions && mergedPermissions.includes(permissionName)
      : true)
  );
};

export const getRestrictedUserFlag = (user, restrictedPermissions) => {
  const { permissions = [] } = user;
  const isRestrictedUser = permissions.filter((val) =>
    restrictedPermissions.includes(val)
  );
  let restrictedFlag = false;
  if (!isEmpty(isRestrictedUser)) {
    restrictedFlag = true;
  }

  return restrictedFlag;
};

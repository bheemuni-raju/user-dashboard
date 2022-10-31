import React from 'react'
import { compose, setDisplayName } from 'recompose'
import { intersection, concat, map, flattenDeep, union, isArray, get } from 'lodash'

import Unauthorized from 'modules/core/components/errors/Unauthorized'
import userOrRedirect from './userOrRedirect'

const enhance = compose(userOrRedirect, setDisplayName('RequireRole'))

/**
 * This can be used to wrap components and only render them if the user is
 * logged on and has a role that matches one in the authorizedRoles param
 */
const requireRole = authorizedRoles => WrappedComponent =>
  enhance(({ user, ...props }) => {
    authorizedRoles = isArray(authorizedRoles) ? authorizedRoles : [authorizedRoles];

    const userPermissions = extractPermissions(user)
    const departmentPermissions = user && extractPermissions(user.department)
    const rolePermissions = user && extractPermissions(user.role)

    /**Merging permissions of User, department and Role */
    const mergedPermissions = flattenDeep(get(user, 'permissions')) || []

    return (intersection(authorizedRoles, mergedPermissions).length > 0) ?
      <WrappedComponent {...props} /> :
      <Unauthorized />
  })

const extractPermissions = (entity) => {
  let userPermissions = [];
  if (entity && entity.permission_template && entity.permission_template.length > 0) {
    const permissionsArray = map(entity.permission_template, 'permissions');
    userPermissions = union(...permissionsArray);
  }
  return userPermissions;
}

export default requireRole
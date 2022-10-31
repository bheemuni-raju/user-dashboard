import React from 'react';

import PermissionForm from './PermissionForm';

const PermissionEdit = (props) => {
  const { permissionId, appName } = props.match.params
  return <PermissionForm permissionId={permissionId} appName={appName} isEdit={true} />
}

export default PermissionEdit;
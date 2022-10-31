import React from 'react';

import PermissionForm from './PermissionForm';

const PermissionCreate = (props) => {
  const { appName } = props.match.params;

  return <PermissionForm appName={appName} isEdit={false} />
}

export default PermissionCreate;
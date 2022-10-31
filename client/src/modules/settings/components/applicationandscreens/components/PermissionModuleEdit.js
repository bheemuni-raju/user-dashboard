import React from 'react';

import PermissionModuleForm from './PermissionModuleForm';

const PermissionModuleEdit = (props) => {
    const { moduleId, appName } = props.match.params
    return <PermissionModuleForm moduleId={moduleId} appName={appName} />
}

export default PermissionModuleEdit;
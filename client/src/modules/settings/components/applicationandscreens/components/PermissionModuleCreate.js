import React from 'react';

import PermissionModuleForm from './PermissionModuleForm';

const PermissionModuleCreate = (props) => {
    const { appName } = props.match.params;

    return <PermissionModuleForm appName={appName} />
}

export default PermissionModuleCreate;
import React, { Component } from 'react'
import AppRoleForm from './AppRoleForm'

class AppRoleClone extends Component {
    render() {
        return (
            <AppRoleForm appRoleName={this.props.match.params.appRoleName} />
        )
    }
}

export default AppRoleClone
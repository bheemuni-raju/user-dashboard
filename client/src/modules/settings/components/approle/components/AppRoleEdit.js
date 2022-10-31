import React, { Component } from 'react'
import AppRoleForm from './AppRoleForm'

class AppRoleEdit extends Component {
    render() {
        return (
            <AppRoleForm appRoleFormattedName={this.props.match.params.appRoleFormattedName} isEdit={true} />
        )
    }
}

export default AppRoleEdit
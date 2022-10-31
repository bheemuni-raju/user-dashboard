import React, { Component } from 'react'
import AppRoleForm from './AppRoleForm'

class AppRoleEdit extends Component {
    render() {
        return (
            <AppRoleForm formattedName={this.props.match.params.formattedName} isEdit={true} />
        )
    }
}

export default AppRoleEdit
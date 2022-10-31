import React, { Component } from 'react';
import { get } from 'lodash';

import UserForm from './UserForm';

class UserEdit extends Component {
    render() {
        const { data } = get(this.props, 'location.state', {}) || {};
        const { email, department } = get(this.props, 'match.params');

        return (
            <UserForm email={email} department={department} data={data} />
        )
    }
}

export default UserEdit
import React, { Component } from 'react';

import { Box, BoxBody } from 'components/box';
import UserList from './UserList';

class UserDashboard extends Component {
    render() {
        return (
            <Box>
                <BoxBody>
                    <UserList />
                </BoxBody>
            </Box>
        )
    }
}

export default UserDashboard

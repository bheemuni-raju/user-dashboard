import React, { useState } from 'react';

import TabBuilder from 'modules/core/components/TabBuilder';
import ProfileDetails from './ProfileDetails';
import DeveloperSetting from './DeveloperSetting';
import MultifactorDetails from './MultifactorDetails';

const Profile = (props) => {
    const [selectedTab, setSelectedTab] = useState(0);

    const handleTabSelect = (tabNo) => {
        setSelectedTab(tabNo);
    }

    return (<TabBuilder
        defaultTab={selectedTab}
        tabs={[{
            title: "Detail",
            component: <ProfileDetails />
        }, {
            title: "Developer Settings",
            component: <DeveloperSetting />
        }, {
            title: "Multifactor Authentication",
            component: <MultifactorDetails tabSelect={handleTabSelect} />
        }]}
    />)
}

export default Profile;
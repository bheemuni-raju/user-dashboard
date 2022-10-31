import React, { useState, useEffect } from 'react';
import { connect } from 'react-redux';

import PermissionList from './PermissionList';
import { callApi } from "../../../../../store/middleware/api";
import { Box, BoxHeader, BoxBody } from 'components/box';
import TabBuilder from 'modules/core/components/TabBuilder';

const ApplicationList = () => {
  const [apps, setApps] = useState([]);

  useEffect(() => {
    async function getAllApplications() {
      const url = `/usermanagement/v1/permission/listAllApplications`;
      const method = "GET";
      const appResponse = await callApi(url, method, null, null, null, true)
      setApps(appResponse);
    }

    getAllApplications();
  }, [])

  const tabs = [];

  const commonAppDetails = apps.filter(app => app.formattedName === "common");
  if (commonAppDetails.length > 0) {
    tabs.push({
      title: "Common(OMS,LMS,UMS)",
      component: <PermissionList appId={commonAppDetails[0].id} appName={commonAppDetails[0].formattedName} />
    });
  }

  apps.map(app => {
    if (app.formattedName !== "common") {
      tabs.push({
        title: app.name,
        component: <PermissionList appId={app.id} appName={app.formattedName} />
      });
    }
  });

  return (
    <Box>
      <BoxHeader heading="Applications & Screens" />
      <BoxBody>
        <TabBuilder tabs={tabs} />
      </BoxBody>
    </Box>
  )
}

const mapStatetoProps = state => ({
  user: state.auth.user
});

export default connect(mapStatetoProps)(ApplicationList)

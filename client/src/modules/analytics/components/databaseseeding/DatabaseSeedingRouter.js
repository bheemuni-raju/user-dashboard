import React from 'react';
import { Route } from 'react-router-dom';

import SwitchWithNotFound from "components/router/SwitchWithNotFound";

import DatabaseSeedingList from './DatabaseSeedingList';
import requireRole from "components/router/requireRole";
import { dataSeeding } from 'lib/permissionList';

const canViewDataSeeding = requireRole(dataSeeding.viewDataSeeding);

const DataBaseSeedingRouter = ({ match }) => (
    <SwitchWithNotFound>
        <Route path={match.url} exact component={canViewDataSeeding(DatabaseSeedingList)} />
    </SwitchWithNotFound>
);

export default DataBaseSeedingRouter;

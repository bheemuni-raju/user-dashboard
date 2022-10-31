import React from 'react';
import { Route } from 'react-router-dom';

import SwitchWithNotFound from "components/router/SwitchWithNotFound";

import DatabaseMigrationList from './DatabaseMigrationList';
import requireRole from "components/router/requireRole";
import { npgexemplumMigration } from 'lib/permissionList';

const canViewMigration = requireRole(npgexemplumMigration.viewNpgexemplumMigration);

const DataBaseMigrationRouter = ({ match }) => (
    <SwitchWithNotFound>
        <Route path={match.url} exact component={canViewMigration(DatabaseMigrationList)} />
    </SwitchWithNotFound>
);

export default DataBaseMigrationRouter;

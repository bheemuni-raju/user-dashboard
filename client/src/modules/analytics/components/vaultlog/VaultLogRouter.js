import React from 'react';
import { Route } from 'react-router-dom';

import SwitchWithNotFound from "components/router/SwitchWithNotFound";

import VaultLogList from './VaultLogList';
import requireRole from "components/router/requireRole";
import { secret } from 'lib/permissionList';

const canViewSecret = requireRole(secret.viewSecret);

const VaultLogRouter = ({ match }) => (
    <SwitchWithNotFound>
        <Route path={match.url} exact component={canViewSecret(VaultLogList)} />
        <Route path={`${match.url}/email`} exact component={(VaultLogList)} />
        <Route path={`${match.url}/vaultuid`} exact component={(VaultLogList)} />

    </SwitchWithNotFound>
);

export default VaultLogRouter;

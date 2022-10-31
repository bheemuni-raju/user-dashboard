import React from 'react';
import { Route } from 'react-router-dom';

import SwitchWithNotFound from "components/router/SwitchWithNotFound";

import VaultAuditList from './VaultAuditList';
import requireRole from "components/router/requireRole";
import { vault } from 'lib/permissionList';

const canViewVault = requireRole(vault.viewVault);

const VaultAuditRouter = ({ match }) => (
    <SwitchWithNotFound>
        <Route path={match.url} exact component={canViewVault(VaultAuditList)} />
    </SwitchWithNotFound>
);

export default VaultAuditRouter;

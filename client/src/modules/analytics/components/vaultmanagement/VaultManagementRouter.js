import React from 'react';
import { Route } from 'react-router-dom';

import SwitchWithNotFound from "components/router/SwitchWithNotFound";

import VaultList from './VaultList.js';
import AssignUnassign from './AssignUnassign';
import vaultSplitLayout from './VaultSplitLayout'
import VaultSecretPoolMappingList from './VaultSecretPoolMappingList';
import requireRole from "components/router/requireRole";
import { vault } from 'lib/permissionList';

const canViewVault = requireRole(vault.viewVault);
const caEditVault = requireRole(vault.editVault);

const SecretRouter = ({ match }) => (
    <SwitchWithNotFound>
        <Route path={match.url} exact component={canViewVault(VaultList)} />
        <Route path={`${match.url}/:id/:vaultUid`} exact component={caEditVault(VaultList)} />
        <Route path={`${match.url}/:vaultmappinglist/vault-secretpool-mapping`} exact component={caEditVault(VaultSecretPoolMappingList)} />
        <Route path={`${match.url}/:vaultsecretpoolmapping/assign`} exact component={caEditVault(AssignUnassign)} />
        <Route path={`${match.url}/:vaultsecretpoolmapping/unassign`} exact component={caEditVault(AssignUnassign)} />
        <Route path={`${match.url}/:vaultmappinglist/vault-split-layout/:vaultuuid`} exact component={caEditVault(vaultSplitLayout)} />
    </SwitchWithNotFound>
);

export default SecretRouter;

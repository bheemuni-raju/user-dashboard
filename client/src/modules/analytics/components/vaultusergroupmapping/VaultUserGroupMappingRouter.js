import React from 'react';
import { Route } from 'react-router-dom';

import SwitchWithNotFound from "components/router/SwitchWithNotFound";
import requireRole from "components/router/requireRole";
import { secret, vault } from 'lib/permissionList';

import VaultUserGroupMappingList from './VaultUserGroupMappingList.js';
import VaultRoleMappingModal from './VaultUserMappingModal';


const canViewSecret = requireRole(secret.viewSecret);
const canEditSecret = requireRole(secret.editSecret);
const canViewVault = requireRole(vault.viewVault);
const caEditVault = requireRole(vault.editVault);

const SecretRouter = ({ match }) => (
    <SwitchWithNotFound>
        <Route path={match.url} exact component={canViewSecret(VaultUserGroupMappingList)} />
        <Route path={`${match.url}/:vaultrolemapping/update`} exact component={canEditSecret(VaultRoleMappingModal)} />
    </SwitchWithNotFound>
);

export default SecretRouter;

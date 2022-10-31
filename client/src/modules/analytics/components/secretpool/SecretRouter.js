import React from 'react';
import { Route } from 'react-router-dom';

import SwitchWithNotFound from "components/router/SwitchWithNotFound";

import SecretPoolsList from './SecretPoolsList.js';
import SecretModal from './SecretModal';
import SecretList from './SecretList';
import requireRole from "components/router/requireRole";
import ImportSecretModal from './ImportSecretModal'
import { secret } from 'lib/permissionList';

const canViewSecret = requireRole(secret.viewSecret);
const canEditSecret = requireRole(secret.editSecret);

const SecretRouter = ({ match }) => (
    <SwitchWithNotFound>
        <Route path={match.url} exact component={canViewSecret(SecretPoolsList)} />
        <Route path={`${match.url}/secret/:secret/secrets`} exact component={canEditSecret(SecretList)} />
        <Route path={`${match.url}/:secret/jdjeiu`} exact component={canEditSecret(SecretModal)} />
        <Route path={`${match.url}/:secret/unassign`} exact component={canEditSecret(SecretModal)} />
        <Route path={`${match.url}/secret/:secret/import-secrets`} exact component={canEditSecret(ImportSecretModal)} />
    </SwitchWithNotFound>
);

export default SecretRouter;

import React from 'react';
import { Route } from 'react-router-dom';

import SwitchWithNotFound from "components/router/SwitchWithNotFound";

import SemanticConfiCreate from './semanticconfig/SemanticConfigList';
import requireRole from "components/router/requireRole";
import { semantic } from 'lib/permissionList';

const canViewSemantic = requireRole(semantic.viewSemanticConfig);

const SemanticRouter = ({ match }) => (
    <SwitchWithNotFound>
        <Route path={match.url} exact component={canViewSemantic(SemanticConfiCreate)} />
    </SwitchWithNotFound>
);

export default SemanticRouter;

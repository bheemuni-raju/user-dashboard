import React from 'react'
import { Route } from 'react-router-dom'

import { assignmentRule } from 'lib/permissionList';
import requireRole from "components/router/requireRole";
import SwitchWithNotFound from 'components/router/SwitchWithNotFound'

import AssignmentRuleGrid from './components/AssignmentRuleGrid';
import AssignmentRuleCreate from './components/AssignmentRuleCreate'
import AssignmentRuleEdit from './components/AssignmentRuleEdit'

const canViewAssignmentRule = requireRole(assignmentRule.viewAssignmentRule);
const canCreateAssignmentRule = requireRole(assignmentRule.createAssignmentRule);
const canEditAssignmentRule = requireRole(assignmentRule.editAssignmentRule);

const AppRoleRouter = ({ match }) =>
    <SwitchWithNotFound>
        <Route path={`${match.url}`} exact component={canViewAssignmentRule(AssignmentRuleGrid)} />
        <Route path={`${match.url}/create`} exact component={canCreateAssignmentRule(AssignmentRuleCreate)} />
        <Route path={`${match.url}/:ruleFormattedName/edit`} exact component={canEditAssignmentRule(AssignmentRuleEdit)} />
    </SwitchWithNotFound>

export default AppRoleRouter;
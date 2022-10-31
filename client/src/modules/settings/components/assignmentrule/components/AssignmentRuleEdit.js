import React, { Component } from 'react'
import AssignmentRuleBuilder from './AssignmentRuleBuilder'

class AssignmentRuleEdit extends Component {
    render() {
        return (
            <AssignmentRuleBuilder ruleFormattedName={this.props.match.params.ruleFormattedName} />
        )
    }
}

export default AssignmentRuleEdit
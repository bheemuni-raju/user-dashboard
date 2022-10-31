import React from 'react';
import { Badge, NavItem } from 'reactstrap';

const EnvNavBadge = () => {
    const origin = window.location.origin;

    if (origin.includes("localhost") || origin.includes("dev-")) {
        return <EnvBadge>Development</EnvBadge>
    }

    if (origin.includes("uat-")) {
        return <EnvBadge>UAT</EnvBadge>
    }

    return ""
}

const EnvBadge = ({ children }) => (
    <NavItem>
        <h5 className="mb-0">
            <Badge color="warning"
                className="pr-2"
                style={{ padding: "1px" }}
                pill>
                <span className="fa-stack fa-lg">
                    <i className="fa fa-circle fa-stack-2x"></i>
                    <i className="fa fa-code fa-stack-1x fa-inverse"></i>
                </span> {children}
            </Badge>
        </h5>
    </NavItem>
)

export default EnvNavBadge;


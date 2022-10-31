import React from 'react';
import PropTypes from 'prop-types'
import { Badge } from 'reactstrap';

const colorMap = {
    "success": "#28a745",
    "danger": "#dc3545",
    "primary": "#007bff",
    "info": "#17a2b8",
    "warning": "#ffc107",
    "default": "#6c757d"
}

const ByjusBadge = ({ variant = "default", children, color, ...props }) => {
    return <Badge style={{ backgroundColor: color || colorMap[variant], whiteSpace: "unset" }} {...props}>{children}</Badge>
}

ByjusBadge.propTypes = {
    variant: PropTypes.string,
    children: PropTypes.oneOfType([
        PropTypes.string,
        PropTypes.node
    ]),
    color: PropTypes.string
}


export default ByjusBadge;

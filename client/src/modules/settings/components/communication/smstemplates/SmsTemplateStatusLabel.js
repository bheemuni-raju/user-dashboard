import React from 'react';
import { Badge } from 'reactstrap';
import PropTypes from 'prop-types';
import { smsTemplateStatusColourMap } from 'utils/componentUtil';

const SmsTemplateStatusLabel = ({ status, color, formatter, ...props }) => {
    const labelClass = status ? smsTemplateStatusColourMap[status.toLowerCase()] : 'info';
    const text = status ? status : '';
    return (
        <Badge color={color || labelClass || 'info'} className='status-label' {...props}>
            {formatter ? formatter(text) : text}
        </Badge>
    )
}

SmsTemplateStatusLabel.propTypes = {}

export default SmsTemplateStatusLabel

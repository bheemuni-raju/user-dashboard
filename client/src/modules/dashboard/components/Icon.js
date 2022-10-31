import React from 'react';

const Icon = ({ iconName, gradientCls }) => {
    const baseCls = "icon icon-shape text-white rounded-circle shadow";
    const finalCls = `${baseCls} ${gradientCls}`;

    return (
        <div className={finalCls}>
            <i className={iconName}></i>
        </div>
    )
}

export default Icon;
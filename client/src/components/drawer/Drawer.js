import React from 'react';
import { Spin } from 'antd';

import LoadingWrapper from 'components/LoadingWrapper';
import ErrorWrapper from 'components/error/ErrorWrapper';

import './drawer.scss';

const Drawer = (props) => {
    const { title, children, width, titleStyle = {}, onClose, loading = false, error } = props;

    return (
        <Spin spinning={loading} style={{ position: 'relative', left: '30%', 'z-index': 10000 }}>
            {error && <ErrorWrapper error={error} errorTop={true} />}
            <div tabIndex="-1" className="drawer drawer-right drawer-open">
                <div className="drawer-mask"></div>
                <div className="drawer-content-wrapper" style={{ width: width || '40%' }}>
                    <div className="drawer-content">
                        <div className="drawer-wrapper-body">
                            <div className="drawer-header">
                                <div className="drawer-title text-primary" style={titleStyle}>{title}</div>
                                <div className="drawer-close-button" onClick={onClose}>
                                    <i className="fa fa-times drawer-close-icon" />
                                </div>
                            </div>
                            <div className="drawer-body">
                                {children}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </Spin>
    )
}

export default Drawer;
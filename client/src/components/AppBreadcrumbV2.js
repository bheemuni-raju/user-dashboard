import React from 'react';
import { useLocation, useHistory } from 'react-router-dom';
import { startCase } from 'lodash';

const AppBreadcrumbV2 = (props) => {
    const location = useLocation();
    const history = useHistory();
    let splitPath = location.pathname.split("/");
    let lastPath = splitPath[splitPath.length - 1];
    let displayName = /\d/.test(lastPath) ? lastPath : startCase(lastPath);

    function onClickBack() {
        history.goBack();
    }

    return (
        <span style={{ textAlign: 'center' }}>
            {splitPath.length > 2 && <i
                className="fa fa-angle-left"
                style={{ paddingRight: 10, fontWeight: 'bold', fontSize: 25 }}
                onClick={onClickBack}
            >
            </i>}
            <span className="truncate" style={{ fontSize: 18 }}>{displayName}</span>
        </span>
    );
}

export default AppBreadcrumbV2;
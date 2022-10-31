import React, { Component } from 'react';
import { Col, Dropdown, DropdownMenu, DropdownToggle, Row } from 'reactstrap';
import { AppHeaderDropdown } from '@byjus-orders/uikit-react';
import { upperCase } from 'lodash';

import { appMap } from './appMap';
import './appDropdown.scss';

const getAllApps = (appName) => {
    const appArray = Object.keys(appMap).filter(key => key !== appName);

    return appArray.map((appName) => {
        const env = (window.location.origin.includes("localhost") || window.location.origin.includes("dev-")) ? "dev" : "prod";
        const url = appMap[appName]["url"];

        return {
            name: appName,
            icon: appMap[appName]["icon"],
            redirectTo: (env === "dev") ? url.replace('https://', "https://dev-") : url
        }
    });
};

const AppsDropdown = (props) => {
    const { appName } = props;
    const apps = getAllApps(appName) || [];
    const chunk_size = 3;
    const appsChunks = Array(Math.ceil(apps.length / chunk_size)).fill().map((_, index) => index * chunk_size).map(begin => apps.slice(begin, begin + chunk_size));

    return (
        <AppHeaderDropdown direction="down">
            <DropdownToggle nav>
                <i className="fa fa-th fa-lg"></i>
            </DropdownToggle>
            <DropdownMenu right className="dropdown-menu-animated dropdown-lg p-0">
                <div className="p-2">
                    {appsChunks.map((chunk, idx) => (
                        <Row noGutters key={idx}>
                            {chunk.map((item, i) => (
                                <Col sm={12/chunk_size} key={i}>
                                    <a className="app-dropdown-icon-item" target="_blank" href={item.redirectTo}>
                                        <img src={item.icon}></img>
                                        <div className="text-primary">{upperCase(item.name)}</div>
                                    </a>
                                </Col>
                            ))}
                        </Row>
                    ))}
                </div>
            </DropdownMenu>
        </AppHeaderDropdown >
    );
}

export default AppsDropdown;
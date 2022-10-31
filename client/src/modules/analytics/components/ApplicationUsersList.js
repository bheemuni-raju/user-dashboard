import React, { Fragment, useState, useRef, useEffect } from 'react';
import { useParams } from 'react-router'
import { Link } from 'react-router-dom';
import moment from 'moment';

import ToggleButton from 'react-toggle-button'
import { startCase, get, isEmpty } from 'lodash';

import { Box, BoxBody } from 'components/box';
import ByjusGrid from 'modules/core/components/grid/ByjusGridV3';
import ByjusDropdown from 'components/ByjusDropdown';
import { callApi } from 'store/middleware/api';
import { useSelector } from 'react-redux';
import { settings, validatePermission, analytics } from 'lib/permissionList';
import defaultIcon from '../../../assets/user-icon.jpg';

import { AppSidebarNav } from '@byjus-orders/uikit-react';

const ApplicationUsersList = (props) => {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [data, setData] = useState(null);
    const [appRoles, setAppRoles] = useState([]);
    const user = useSelector(state => get(state, 'auth.user'));
    let byjusGridRef = useRef();
    const paramArray = useParams();

    useEffect(() => {
        async function getAppRoles() {
            const url = `/usermanagement/analytics/listAllRoles`;
            const method = "GET";
            const appRoleResponse = await callApi(url, method, null, null, null, true)
            setAppRoles(appRoleResponse);
        }

        getAppRoles();
    }, [])

    const buildToolbarItems = () => {
        const canCreateApplicationUser = validatePermission(user, [analytics.createApplicationUser])

        return (
            <>
                <Fragment>
                    <Link className="btn btn-success btn-sm mr-2"
                        hidden={!canCreateApplicationUser}
                        style={{ paddingTop: '3%' }}
                        to="create-user">
                        <i className="fa fa-plus"></i> {' '}Create
                </Link> {" "}
                </Fragment>
            </>
        )
    }

    const onClickToggle = async (record, value) => {
        let email = record.email;
        let appName = record.appName;
        let appRoleName = record.appRoleName;
        let userStatus = (value) ? "inactive" : "active";
        await updateUserStatus(email, appName, userStatus, appRoleName);
    }

    const updateUserStatus = async (email, appName, status, appRoleName) => {
        const body = {
            email,
            appName,
            appRoleName
        }

        let url = `/usermanagement/appuser/${email}`;
        let method = (status === "active") ? 'PUT' : 'DELETE';

        callApi(url, method, body, null, null, true)
            .then(response => {
                setLoading(false);
                setError(null);
                byjusGridRef && refreshGrid();
            })
            .catch(error => {
                setLoading(false);
                setError(error);
            })
    }

    const refreshGrid = () => {
        byjusGridRef.current.refreshGrid();
    }

    const formatters = () => ({
        actionFormatter: (cell, row) => {
            const canEditApplicationUser = row.status === "active" && validatePermission(user, [settings.editApplicationUser])
            if (canEditApplicationUser) {
                return (
                    <ByjusDropdown
                        type="simple"
                        defaultTitle=""
                        titleIcon="fa fa-gear"
                        items={
                            [{
                                title: 'Edit',
                                icon: 'fa fa-pencil',
                                isAllowed: canEditApplicationUser
                            }]} />
                )
            }
        },
        emailFormatter: (cell, row) => {
            let picture = get(row, "picture", defaultIcon);
            return (
                <div style={{ textOverflow: "ellipsis" }}>
                    <img src={picture} style={{ marginLeft: 10, width: 30, height: 30, borderRadius: 50 }} />
                        &nbsp; {cell}
                </div>
            )
        },
        appRoleFormatter: (cell) => {
            return startCase(cell);
        },
        skillFormatter: (cell) => {
            return startCase(cell);
        },
        createdAtFormatter: (cell, row) => {
            let createdAt = get(row, "actionDetails.createdAt", "");
            if (!isEmpty(createdAt)) {
                return createdAt && moment(createdAt).format("MMM D YYYY, h:mm a");
            }
        },
        updatedAtFormatter: (cell, row) => {
            let updatedAt = get(row, "actionDetails.updatedAt", "");
            if (!isEmpty(updatedAt)) {
                return updatedAt && moment(updatedAt).format("MMM D YYYY, h:mm a");
            }
        },
        lastLoginDateFormatter: (cell, row) => {
            let lastLogin = get(row, "actionDetails.lastLoginAt", "");
            if (!isEmpty(lastLogin)) {
                return lastLogin && moment(lastLogin).format("MMM D YYYY, h:mm a");
            }
        },
        lastActivityDateFormatter: (cell, row) => {
            let lastActivity = get(row, "actionDetails.lastActivityAt", "");
            if (!isEmpty(lastActivity)) {
                return lastActivity && moment(lastActivity).format("MMM D YYYY, h:mm a");
            }
        },
        statusFormatter: (cell, row) => {
            const canDeleteApplicationUser = validatePermission(user, [settings.deleteApplicationUser])
            let toggleValue = (cell === "active") ? true : false;

            return (
                <ToggleButton
                    inactiveLabel={''}
                    activeLabel={''}
                    colors={{
                        activeThumb: {
                            base: 'green',
                        },
                        active: {
                            base: 'green',
                            hover: 'rgb(177, 191, 215)',
                        },
                        inactiveThumb: {
                            base: 'cyan',
                        },
                        inactive: {
                            base: 'cyan',
                            hover: 'rgb(177, 191, 215)',
                        }
                    }}
                    hidden={canDeleteApplicationUser}
                    value={toggleValue}
                    onToggle={(value) => onClickToggle(row, value)} />
            )
        }
    })

    let appRoleContextCriteria = [];
    if (!isEmpty(paramArray) && !isEmpty(paramArray.appRoleName)) {
        let appRoleArray = appRoles.map(appRole => {
            return appRole.appRoleName;
        });

        let roleValue = (paramArray.appRoleName !== "all") ? [paramArray.appRoleName] : appRoleArray;
        appRoleContextCriteria = [{
            selectedColumn: "appRoleName",
            selectedOperator: "in",
            selectedValue: roleValue
        }];
    }

    AppSidebarNav.prototype.activeRoute = function activeRoute(routeName, props) {
        return (routeName === `/settings/app-users` && routeName === props.location.pathname) ? 'nav-item nav-dropdown' : 'nav-item nav-dropdown open';
    };

    return (
        <>
            <div className="app-body">
                <Box>
                    <BoxBody loading={loading} error={error}>
                        <ByjusGrid
                            isKey="_id"
                            gridId="ums_application_user_grid"
                            ref={byjusGridRef}
                            toolbarItems={buildToolbarItems()}
                            formatters={formatters()}
                            contextCriterias={appRoleContextCriteria}
                            modelName="AppUser"
                            sort={{ "actionDetails.lastActivityAt": 'DESC' }}
                            gridDataUrl={`/usermanagement/analytics/listUser`}
                        />
                    </BoxBody>
                </Box>
            </div>
        </>
    )
}

export default ApplicationUsersList
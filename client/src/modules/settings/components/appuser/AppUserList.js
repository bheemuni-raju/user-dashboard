import React, { Fragment, useState, useRef, Suspense, useEffect } from 'react';
import { useParams } from 'react-router'
import { Link } from 'react-router-dom';
import moment from 'moment';

import { Button } from 'reactstrap';
import ToggleButton from 'react-toggle-button'
import { startCase, get, isEmpty } from 'lodash';

import { Box, BoxBody } from 'components/box';
import ByjusGrid from 'modules/core/components/grid/ByjusGridV3';
import ByjusDropdown from 'components/ByjusDropdown';
import { callApi } from 'store/middleware/api';
import { useSelector } from 'react-redux';
import Confirm from 'components/confirm';
import { settings, validatePermission } from 'lib/permissionList';
import AppUserModal from './AppUserModal';
import { appUserNavConfig } from './AppUserNav';
import './SideBarNav.css'
import defaultIcon from '../../../../assets/user-icon.jpg';

import {
    AppSidebar,
    AppSidebarFooter,
    AppSidebarForm,
    AppSidebarHeader,
    AppSidebarMinimizer,
    AppSidebarNav,
} from '@byjus-orders/uikit-react';

const AppUserList = (props) => {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [data, setData] = useState(null);
    const [appRoles, setAppRoles] = useState([]);
    const [showAppUserModal, setShowAppUserModal] = useState(false);
    const user = useSelector(state => get(state, 'auth.user'));
    let byjusGridRef = useRef();
    const paramArray = useParams();

    useEffect(() => {
        async function getAppRoles() {
            const url = `/usermanagement/approle/listAll`;
            const method = "GET";
            const appRoleResponse = await callApi(url, method, null, null, null, true)
            setAppRoles(appRoleResponse);
        }

        getAppRoles();
    }, [])

    const buildToolbarItems = () => {
        const canCreateAppUser = validatePermission(user, [settings.createAppUser])

        return (
            <>
                <Fragment>
                    <Link className="btn btn-success btn-sm mr-2"
                        hidden={!canCreateAppUser}
                        style={{ paddingTop: '3%' }}
                        to="create-user">
                        <i className="fa fa-plus"></i> {' '}Create
                </Link> {" "}
                </Fragment>
            </>
        )
    }

    const onClickToggle = async (record, value) => {
        let userStatus = (value) ? "inactive" : "active";
        await updateUserStatus(record, userStatus);
    }

    const updateUserStatus = async (record, status) => {
        const body = {
            ...record,
            status
        }

        let url = `/usermanagement/appuser/${record.email}`;
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


    const closeAppUserModal = () => {
        setShowAppUserModal(false);
        setData(null);
    }

    const onClickEdit = (data) => {
        data["orgFormattedName"] = get(user, 'orgFormattedName', '');
        setShowAppUserModal(true);
        setData(data);
    }

    const refreshGrid = () => {
        byjusGridRef.current.refreshGrid();
    }

    const formatters = () => ({
        actionFormatter: (cell, row) => {
            const canEditAppUser = row.status === "active" && validatePermission(user, [settings.editAppUser])

            if (canEditAppUser) {
                return (
                    <ByjusDropdown
                        type="simple"
                        defaultTitle=""
                        titleIcon="fa fa-gear"
                        items={
                            [{
                                title: 'Edit',
                                icon: 'fa fa-pencil',
                                onClick: () => onClickEdit(row),
                                isAllowed: canEditAppUser
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
            const canDeleteAppUser = validatePermission(user, [settings.deleteAppUser])
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
                    hidden={!canDeleteAppUser}
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
            selectedColumn: "userOrganizations.appRoleName",
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
                <AppSidebar display="lg">
                    <AppSidebarHeader />
                    <AppSidebarForm />
                    <Suspense>
                        <AppSidebarNav navConfig={appUserNavConfig(user, appRoles)} location={props.history.location} />
                    </Suspense>
                    <AppSidebarFooter />
                </AppSidebar>
                <Box>
                    <BoxBody loading={loading} error={error}>
                        <ByjusGrid
                            isKey="_id"
                            gridId="ums_appuser_grid"
                            ref={byjusGridRef}
                            toolbarItems={buildToolbarItems()}
                            formatters={formatters()}
                            contextCriterias={appRoleContextCriteria}
                            modelName="AppUser"
                            sort={{ "actionDetails.lastActivityAt": 'DESC' }}
                            gridDataUrl={`/usermanagement/appuser/list`}
                        />
                        {showAppUserModal &&
                            <AppUserModal
                                closeModal={closeAppUserModal}
                                refreshGrid={refreshGrid}
                                data={data}
                            />}
                    </BoxBody>
                </Box>
            </div>
        </>
    )
}

export default AppUserList
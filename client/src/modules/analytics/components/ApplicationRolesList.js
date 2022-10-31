import React, { useState, useRef, Fragment, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { Button } from 'reactstrap';
import ToggleButton from 'react-toggle-button'
import { Link, useHistory } from 'react-router-dom';
import { get, startCase, isEmpty } from 'lodash';
import moment from 'moment';

import { Box, BoxBody } from 'components/box';
import ByjusGrid from 'modules/core/components/grid/ByjusGridV3';
import ByjusDropdown from 'components/ByjusDropdown';
import { callApi } from 'store/middleware/api';
import ModalWindow from 'components/modalWindow';
import AppRoleView from '../../settings/components/approle/components/AppRoleView';
import defaultIcon from '../../../assets/user-icon.jpg';

import { settings, analytics, validatePermission } from 'lib/permissionList';

const ApplicationRolesList = () => {
    const [loading, setLoading] = useState(false);
    const history = useHistory();
    const [error, setError] = useState(null);
    const user = useSelector(state => get(state, 'auth.user'));
    const [showViewModal, setShowViewModal] = useState(false);
    const [templateData, setTemplateData] = useState(null);
    const [appUsers, setAppUsers] = useState([]);
    const [appUsersLoaded, setAppUsersLoaded] = useState(false);
    let byjusGridRef = useRef();

    useEffect(() => {
        async function getAppUsers() {
            const url = `/usermanagement/analytics/listAllUsers`;
            const method = "GET";
            const appUserResponse = await callApi(url, method, null, null, null, true)
            setAppUsers(appUserResponse);
            setAppUsersLoaded(true);
        }

        getAppUsers();
    }, [])

    const buildToolbarItems = () => {
        const canCreateApplicationRole = validatePermission(user, [analytics.createApplicationRole])

        return (
            <Fragment>
                <Link className="btn btn-secondary btn-sm"
                    hidden={!canCreateApplicationRole}
                    style={{ paddingTop: '3%' }}
                    to="create-role">
                    <i className="fa fa-plus"></i> {' '}Create
                </Link> {" "}
            </Fragment>
        )
    }

    const onClickToggle = async (record, value) => {
        let appRoleName = record.appRoleName;
        let appName = record.appName;
        let method = (!value) ? 'PUT' : 'DELETE';

        setLoading(true);
        let appRoleUsers = appUsers.filter(user => user.appRoleName === appRoleName);
        await updateRoleStatus(appRoleName, appName, appRoleUsers, method);
    }

    const updateRoleStatus = async (appRoleName, appName, appRoleUsers, method) => {
        const body = {
            appRoleName,
            appName,
            appRoleUsers
        }

        let url = `/usermanagement/approle/${appRoleName}`;
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

    const closeModal = () => {
        setShowViewModal(false);
    }

    const onClickView = (cell, row) => {
        setShowViewModal(true);
        setTemplateData(row);
    }

    const formatters = () => ({
        actionFormatter: (cell, row) => {
            const canEditApplicationRole = row.status === "active" && validatePermission(user, [settings.editApplicationRole])

            return (
                <ByjusDropdown
                    type="simple"
                    defaultTitle=""
                    titleIcon="fa fa-gear"
                    items={
                        [{
                            title: 'View',
                            icon: 'fa fa-eye',
                            onClick: () => onClickView(cell, row),
                            isAllowed: true
                        }, {
                            title: 'Edit',
                            icon: 'fa fa-pencil',
                            isAllowed: canEditApplicationRole
                        }]} />
            )
        },
        appRoleFormatter: (cell, row) => {
            let description = get(row, "description", "");
            let appRoleUsers = appUsers.filter(user => user.appRoleName === cell && user.status === "active");
            let appUserCount = appRoleUsers.length;

            let imageCount = 1;
            let imageCountUpperLimit = (appUserCount >= 4) ? 4 : appUserCount;

            let userImages = appRoleUsers.map(user => {
                if (imageCount <= imageCountUpperLimit) {
                    imageCount++;
                    let picture = get(user, "picture", defaultIcon);
                    return <img src={picture} style={{ marginLeft: 10, width: 30, height: 30, borderRadius: 50 }} />
                }

                return null;
            });

            userImages = userImages.filter(img => img != null);

            if (appUserCount > 4) {
                userImages.push(<b> + {appUserCount - 4}</b>);
            }

            return (
                <>
                    <Fragment>
                        <div>
                            <b>{startCase(cell)}</b> <br />
                            <div style={{ width: "100%" }}>
                                <div style={{ float: "left" }}>{description}</div>
                                <div style={{ float: "right", marginRight: "1px" }}>{userImages}</div>
                            </div>
                        </div>
                    </Fragment>
                </>
            );
        },
        statusFormatter: (cell, row) => {
            const canDeleteApplicationRole = validatePermission(user, [settings.deleteApplicationRole])
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
                            base: 'blue',
                        },
                        inactive: {
                            base: 'blue',
                            hover: 'rgb(177, 191, 215)',
                        }
                    }}
                    hidden={!canDeleteApplicationRole}
                    value={toggleValue}
                    onToggle={(value) => onClickToggle(row, value)} />
            )
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
    })

    return (
        <Box>
            <BoxBody loading={loading} error={error}>
                {appUsersLoaded && <ByjusGrid
                    isKey="_id"
                    gridId="ums_application_role_grid"
                    ref={byjusGridRef}
                    toolbarItems={buildToolbarItems()}
                    formatters={formatters()}
                    modelName="AppRole"
                    gridDataUrl={`/usermanagement/analytics/listRole`}
                />}
                <ModalWindow
                    showModal={showViewModal}
                    closeModal={closeModal}
                    closeButton={true}
                    heading="Application Role Details"
                >
                    {templateData && <AppRoleView templateData={templateData} />}
                </ModalWindow>
            </BoxBody>
        </Box>
    )
}

export default ApplicationRolesList;
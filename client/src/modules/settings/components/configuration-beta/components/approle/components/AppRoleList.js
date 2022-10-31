import React, { useState, useRef, Fragment, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { Button, UncontrolledTooltip } from 'reactstrap';
import ToggleButton from 'react-toggle-button'
import { Link, useHistory } from 'react-router-dom';
import { get, startCase, isEmpty } from 'lodash';
import moment from 'moment';

import { Box, BoxBody } from 'components/box';
import ByjusGrid from 'modules/core/components/grid/ByjusGridV3';
import ByjusDropdown from 'components/ByjusDropdown';
import { callApi } from 'store/middleware/api';
import Confirm from 'components/confirm';
import ModalWindow from 'components/modalWindow';
import AppRoleView from './AppRoleView';
import defaultIcon from '../../../../../../../assets/user-icon.jpg'
import UpdateRoleNameModal from './UpdateRoleNameModal';

import { settings, validatePermission } from 'lib/permissionList';

const AppRoleList = (props) => {
    const [loading, setLoading] = useState(false);
    const history = useHistory();
    const [error, setError] = useState(null);
    const user = useSelector(state => get(state, 'auth.user'));
    const [showViewModal, setShowViewModal] = useState(false);
    const [templateData, setTemplateData] = useState(null);
    const [appUsers, setAppUsers] = useState([]);
    const [appUsersLoaded, setAppUsersLoaded] = useState(false);
    const [showUpdateRoleNameDialog, setShowUpdateRoleNameDialog] = useState(false);
    const [selectedRow, setSelectedRow] = useState(null);

    let byjusGridRef = useRef();

    useEffect(() => {
        async function getAppUsers() {
            const url = `/usermanagement/appuser/listAll`;
            const method = "GET";
            const appUserResponse = await callApi(url, method, null, null, null, true)
            setAppUsers(appUserResponse);
            setAppUsersLoaded(true);
        }

        getAppUsers();
    }, [])

    const buildToolbarItems = () => {
        const canCreateAppRole = validatePermission(user, [settings.createAppRole])

        return (
            <Fragment>
                <Link className="btn btn-secondary btn-sm"
                    hidden={!canCreateAppRole}
                    style={{ paddingTop: '3%' }}
                    to="app-roles/create">
                    <i className="fa fa-plus"></i> {' '}Create
                </Link> {" "}
            </Fragment>
        )
    }

    console.log(appUsers);

    const onClickToggle = async (record, value) => {
        let method = (!value) ? 'PUT' : 'DELETE';
        setLoading(true);
        let appRoleUsers = appUsers.filter(user => user.appRole === record.formattedName);
        await updateRoleStatus(record, appRoleUsers, method, true);
    }

    const updateRoleStatus = async (record, appRoleUsers, method, onToggle) => {
        const body = {
            ...record,
            appRoleUsers,
            onToggle
        }
        console.log(updateRoleStatus)
        let url = `/v1/usermanagement/config/approle/${record.formattedName}`;
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

    const onClickEdit = (row) => {
        history.push(`app-roles/${row.formattedName}/edit`);
    }

    const onClickClone = (row) => {
        history.push(`app-roles/${row.formattedName}/clone`);
    }

    const onClickRoleNameEdit = (row) => {
        setShowUpdateRoleNameDialog(true);
        setSelectedRow(row);
    }

    const formatters = () => ({
        actionFormatter: (cell, row) => {
            const canEditAppRole = row.status === "active" && validatePermission(user, [settings.editAppRole])
            const canCloneAppRole = row.status === "active" && validatePermission(user, [settings.cloneAppRole])
            const canViewAppRolePermissions = row.status === "active" && validatePermission(user, settings.viewAppRolePermissions);

            if (canEditAppRole || canCloneAppRole || canViewAppRolePermissions) {
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
                                isAllowed: canViewAppRolePermissions
                            }, {
                                title: 'Edit',
                                icon: 'fa fa-pencil',
                                onClick: () => onClickEdit(row),
                                isAllowed: canEditAppRole
                            }, {
                                title: 'Clone',
                                icon: 'fa fa-clone',
                                onClick: () => onClickClone(row),
                                isAllowed: canCloneAppRole
                            }
                            ]
                        } />
                )
            }
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
                    let email = get(user, "email");
                    let objectId = get(user, "_id");
                    let ttId = `tt_${objectId}`
                    return (
                        <>
                            <img src={picture} id={ttId} style={{ marginLeft: 2, width: 30, height: 30, borderRadius: "50px" }} />
                            {email && <UncontrolledTooltip target={`${ttId}`}><span className="text-nowrap">{email}</span></UncontrolledTooltip>}
                        </>
                    )
                }

                return null;
            });

            userImages = userImages.filter(img => img != null);

            if (appUserCount > 4) {
                userImages.push(
                    <span
                        className="border border-info text-info d-inline-block font-weight-bold align-middle text-center"
                        style={{
                            marginLeft: "2px",
                            minWidth: "30px",
                            lineHeight: "28px",
                            borderRadius: "50px"
                        }}>
                        <small>
                            &nbsp;+{appUserCount - 4}&nbsp;
                        </small>
                    </span>
                );
            }

            const canEditAppRoleName = row.status === "active" && validatePermission(user, settings.editAppRoleName);

            return (
                <>
                    <div className="d-flex">
                        <div className="flex-grow-1 pr-2">
                            <b>{cell}</b>
                            <Button color="link" size="sm" className="ml-2" hidden={!canEditAppRoleName} onClick={() => onClickRoleNameEdit(row)}>
                                <i className="fa fa-pencil" />
                            </Button><br />
                            <div style={{ float: "left" }}>{description}</div>
                        </div>
                        <div>
                            <div style={{ width: "175px" }}>
                                <div style={{ float: "right" }}>{userImages}</div>
                            </div>
                        </div>
                    </div>
                </>
            );
        },
        statusFormatter: (cell, row) => {
            const canDeleteAppRole = validatePermission(user, [settings.deleteAppRole])
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
                    hidden={!canDeleteAppRole}
                    value={toggleValue}
                    onToggle={(value) => onClickToggle(row, value)} />
            )
        },
        createdAtFormatter: (cell, row) => {
            let createdAt = get(row, "createdAt", "");
            if (!isEmpty(createdAt)) {
                return createdAt && moment(createdAt).format("MMM D YYYY, h:mm a");
            }
        },
        updatedAtFormatter: (cell, row) => {
            let updatedAt = get(row, "updatedAt", "");
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
                    gridId="ums_approle_beta_grid"
                    ref={byjusGridRef}
                    toolbarItems={buildToolbarItems()}
                    formatters={formatters()}
                    modelName="AppRole"
                    gridDataUrl={`/usermanagement/v1/config/approle/list`}
                    contextCriterias={[{
                        selectedColumn: "appId",
                        selectedOperator: "in",
                        selectedValue: ["APP-00000004"]
                    }, {
                        selectedColumn: "orgId",
                        selectedOperator: "in",
                        selectedValue: ["ORG-00000001"]
                    }]}
                />}
                <ModalWindow
                    showModal={showViewModal}
                    closeModal={closeModal}
                    closeButton={true}
                    heading="Application Role Details"
                >
                    {templateData && <AppRoleView templateData={templateData} />}
                </ModalWindow>

                {showUpdateRoleNameDialog &&
                    <ModalWindow
                        showModal={true}
                        heading={`Update Role Name`}
                        closeModal={() => setShowUpdateRoleNameDialog(false)}
                        size="sm"
                    >
                        <UpdateRoleNameModal
                            userData={selectedRow}
                            user={props.user}
                            closeModal={() => setShowUpdateRoleNameDialog(false)}
                            refreshGrid={refreshGrid}
                        />
                    </ModalWindow>
                }
            </BoxBody>
        </Box>
    )
}

export default AppRoleList;
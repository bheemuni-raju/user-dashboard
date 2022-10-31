import React, { Fragment, useState, useRef, useEffect } from 'react';
import { Button } from 'reactstrap';
import { Link } from 'react-router-dom';
import { get, startCase, isEmpty } from 'lodash';
import moment from 'moment';

import { callApi } from 'store/middleware/api';
import ByjusGrid from 'modules/core/components/grid/ByjusGridV3';
import ByjusDropdown from 'components/ByjusDropdown';
import { Box, BoxBody } from 'components/box';
import AppGroupModal from './AppGroupBetaModal';
import Confirm from 'components/confirm';
import ToggleButton from 'react-toggle-button'
import { settings, validatePermission } from 'lib/permissionList';
import { useSelector } from 'react-redux';

const AppGroupList = (props) => {
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [actionType, setActionType] = useState("");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [appDetails, setAppDetails] = useState(null);
    const [appGroupData, setAppGroupData] = useState("");
    const user = useSelector(state => get(state, 'auth.user'));
    let byjusGridRef = useRef();

    useEffect(() => {
        getAppDetails();
    }, []);

    const getAppDetails = async () => {
        setError(null);
        setLoading(true);
        const body = {
            "appName": "UMS"
        }
        let url = `/usermanagement/v1/appgroup/appDetails`;
        let method = 'POST';

        callApi(url, method, body, null, null, true)
            .then(response => {
                setAppDetails(response);
                setLoading(false);
            })
            .catch(error => {
                setLoading(false);
                setError(error);
            })
    }

    const onClickCreate = () => {
        setShowCreateModal(true);
        setActionType('CREATE');
        setAppGroupData(null);
    }

    const onClickEdit = (data) => {
        setShowCreateModal(true);
        setActionType('UPDATE');
        setAppGroupData(data);
    }

    const onCloseModal = (type) => {
        setAppGroupData(null);
        setShowCreateModal(false);
        byjusGridRef.current.refreshGrid();
    }

    const buildToolbarItems = () => {
        const canCreateAppGroup = validatePermission(user, [settings.createAppGroup]);

        return (
            <Fragment>
                <Button color="secondary" size="sm" hidden={!canCreateAppGroup} onClick={onClickCreate}>
                    <i className="fa fa-plus"></i> {' '}Create
                </Button> {' '}
            </Fragment>
        )
    }

    const refreshGrid = () => {
        byjusGridRef.current.refreshGrid();
    }

    const onClickToggle = async (record, value) => {
        let userStatus = (value) ? "inactive" : "active";
        await updateGroupStatus(record, userStatus);
    }

    const updateGroupStatus = async (record, status) => {
        const body = {
            "id": record.id,
            "status": status,
            "updatedBy": user.email
        }
        let url = `/usermanagement/v1/appgroup/update`;
        let method = 'delete';

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

    const formatters = () => ({
        appGroupFormatter: (cell, row) => {
            const canEditAppGroup = row.status === "active" && validatePermission(user, [settings.editAppGroup]);

            let description = get(row, "description", "");

            if (canEditAppGroup) {
                return (
                    <div>
                        <Link
                            to={{ pathname: `/settings/v1/app-groups/${row.id}/users`, state: { groupData: row } }}
                        >{startCase(cell)}</Link>
                        <div style={{ width: "100%" }}>
                            <div style={{ float: "left" }}>{description}</div>
                        </div>
                    </div>
                )
            }
            else {
                return startCase(cell);
            }

        },
        actionFormatter: (cell, row) => {
            const canEditAppGroup = row.status === "active" && validatePermission(user, [settings.editAppGroup])
            if (canEditAppGroup) {
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
                                isAllowed: canEditAppGroup
                            }]} />
                )
            }
        },
        statusFormatter: (cell, row) => {
            const canDeleteAppGroup = validatePermission(user, [settings.deleteAppGroup])
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
                    hidden={!canDeleteAppGroup}
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
        }
    })

    return (
        <Box>
            <BoxBody loading={loading} error={error}>
                <ByjusGrid
                    isKey="_id"
                    gridId="ums_pg_appgroup_grid"
                    ref={byjusGridRef}
                    toolbarItems={buildToolbarItems()}
                    formatters={formatters()}
                    // modelName="AppGroup"
                    gridDataUrl="/usermanagement/v1/appgroup/list"
                />
                {showCreateModal &&
                    <AppGroupModal
                        actionType={actionType}
                        closeModal={onCloseModal}
                        refreshGrid={() => byjusGridRef.current.refreshGrid()}
                        appGroupData={appGroupData}
                        appId={appDetails.id}

                    />
                }
            </BoxBody>
        </Box>
    )
}

export default AppGroupList;

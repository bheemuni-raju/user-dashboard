import React, { Fragment, useState, useRef } from 'react';
import { Button } from 'reactstrap';
import { Link } from 'react-router-dom';
import { get, startCase, isEmpty } from 'lodash';
import moment from 'moment';

import { callApi } from 'store/middleware/api';
import ByjusGrid from 'modules/core/components/grid/ByjusGridV3';
import ByjusDropdown from 'components/ByjusDropdown';
import { Box, BoxBody } from 'components/box';
import AppGroupModal from './AppGroupModal';
import Confirm from 'components/confirm';
import ToggleButton from 'react-toggle-button'
import { settings, validatePermission } from 'lib/permissionList';
import { useSelector } from 'react-redux';

const AppGroupList = (props) => {
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [actionType, setActionType] = useState("");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [appGroupData, setAppGroupData] = useState("");
    const user = useSelector(state => get(state, 'auth.user'));
    let byjusGridRef = useRef();

    const onClickCreate = () => {
        setShowCreateModal(true);
        setActionType('CREATE');
    }

    const onClickEdit = (data) => {
        setShowCreateModal(true);
        setActionType('UPDATE');
        setAppGroupData(data);
    }

    const onClickDelete = async (data) => {
        let result = await Confirm();
        if (result) {
            deleteRecord(data);
        }
    }

    const deleteRecord = (record) => {
        let groupFormattedName = record.formattedName;

        setLoading(true);
        setError(null);
        callApi(`/usermanagement/v1/config/appgroup/${groupFormattedName}`, 'DELETE', null, null, null, true)
            .then(response => {
                byjusGridRef && byjusGridRef.current.refreshGrid();
                setLoading(false);
                setError(null);
            })
            .catch(error => {
                setLoading(false);
                setError(error);
            })
    }

    const onCloseModal = (type) => {
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
            ...record,
            status
        }

        let url = `/usermanagement/v1/config/appgroup/${record.name}`;
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

    const formatters = () => ({
        appGroupFormatter: (cell, row) => {
            const canEditAppGroup = row.status === "active" && validatePermission(user, [settings.editAppGroup]);

            let description = get(row, "description", "");

            if (canEditAppGroup) {
                return (
                    <div>
                        <Link
                            to={{ pathname: `/settings/app-groups/${row.name}/edit`, state: { groupData: row } }}
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
                            }]
                        }
                    />
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
                    gridId="ums_appgroup_beta_grid"
                    ref={byjusGridRef}
                    toolbarItems={buildToolbarItems()}
                    formatters={formatters()}
                    modelName="AppGroup"
                    gridDataUrl="/usermanagement/v1/config/appgroup/list"
                    contextCriterias={[{
                        selectedColumn: "appId",
                        selectedOperator: "in",
                        selectedValue: ["APP-00000004"]
                    }, {
                        selectedColumn: "orgId",
                        selectedOperator: "in",
                        selectedValue: ["ORG-00000001"]
                    }]}
                />
                {showCreateModal &&
                    <AppGroupModal
                        actionType={actionType}
                        closeModal={onCloseModal}
                        refreshGrid={() => byjusGridRef.current.refreshGrid()}
                        appGroupData={appGroupData}
                    />
                }
            </BoxBody>
        </Box>
    )
}

export default AppGroupList;

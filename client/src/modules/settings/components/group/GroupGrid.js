import React, { Fragment, useState, useRef } from 'react';
import { Link } from 'react-router-dom';
import { Button } from 'reactstrap';
import { startCase, get } from 'lodash';
import { useSelector } from 'react-redux';
import { group, validatePermission } from 'lib/permissionList';

import { callApi } from 'store/middleware/api';
import ByjusGrid from 'modules/core/components/grid/ByjusGridV3';
import { Box, BoxHeader, BoxBody } from 'components/box';
import GroupModal from './GroupModal';
import Confirm from 'components/confirm';

const GroupGrid = (props) => {
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [actionType, setActionType] = useState("");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const user = useSelector(state => get(state, 'auth.user'));
    const [groupData, setGroupData] = useState("");
    let byjusGridRef = useRef();

    const onClickCreate = () => {
        setShowCreateModal(true);
        setActionType('CREATE');
    }

    const onClickEdit = (data) => {
        setShowCreateModal(true);
        setActionType('UPDATE');
        setGroupData(data);
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
        callApi(`/usermanagement/group/${groupFormattedName}`, 'DELETE', null, null, null, true)
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
        setGroupData({});
        if (type === "save") {
            byjusGridRef.current.refreshGrid();
        }
    }

    const buildToolbarItems = () => {
        const canCreateGroup = validatePermission(user, [group.createGroup])

        return (
            <Fragment>
                <Button color="secondary" size="sm" hidden={!canCreateGroup} onClick={onClickCreate}>
                    <i className="fa fa-plus"></i> {' '}Create
                </Button> {' '}
            </Fragment>
        )
    }

    const formatters = () => ({
        nameFormatter: (cell, row) => {
            const canEditGroup = validatePermission(user, [group.editGroup])
            if (canEditGroup) {
                return <Link
                    to={{ pathname: `/settings/groups/${row.formattedName}/edit`, state: { data: row } }}
                >{startCase(cell)}</Link>
            }
            else {
                return startCase(cell);
            }

        },
        actionFormatter: (cell, row) => {
            const canEditGroup = validatePermission(user, [group.editGroup])
            const canDeleteGroup = validatePermission(user, [group.deleteGroup])

            return (
                <div>
                    <Button color="primary" size="sm" hidden={!canEditGroup} onClick={() => onClickEdit(row)}>
                        <i className="fa fa-pencil" />
                    </Button>
                    {' '}
                    <Button color="danger" size="sm" hidden={!canDeleteGroup} onClick={() => onClickDelete(row)}>
                        <i className="fa fa-trash" />
                    </Button>
                </div>
            )
        }
    })

    return (
        <Box>
            <BoxHeader heading="Groups" />
            <BoxBody loading={loading} error={error}>
                <ByjusGrid
                    isKey="_id"
                    gridId="ums_group_grid"
                    ref={byjusGridRef}
                    toolbarItems={buildToolbarItems()}
                    formatters={formatters()}
                    modelName="Group"
                    gridDataUrl="/usermanagement/group/list"
                />
                {showCreateModal &&
                    <GroupModal
                        actionType={actionType}
                        closeModal={onCloseModal}
                        refreshGrid={() => byjusGridRef.current.refreshGrid()}
                        groupData={groupData}
                    />
                }
            </BoxBody>
        </Box>
    )
}

export default GroupGrid;

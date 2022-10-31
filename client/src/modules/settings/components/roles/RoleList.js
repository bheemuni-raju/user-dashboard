import React, { useEffect, useState, useRef } from 'react';
import { useSelector } from 'react-redux';
import { Button } from 'reactstrap'
import { get, startCase } from 'lodash';

import { Box, BoxHeader, BoxBody } from 'components/box';
import ByjusGrid from 'modules/core/components/grid/ByjusGridV3';
import Confirm from 'components/confirm';
import { callApi } from 'store/middleware/api';
import { hierarchy as hierarchyPermissions, validatePermission } from 'lib/permissionList';

import RoleModal from './RoleModal';

const RoleList = (props) => {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [showRoleModal, setShowRoleModal] = useState(false);
    const [subDepartmentData, setSubDepartmentData] = useState("");
    const [subDepartment, setSubDepartment] = useState("");
    const [data, setData] = useState("");
    const user = useSelector(state => get(state, 'auth.user'));
    let byjusGridRef = useRef();

    useEffect(() => {
        const { subDepartmentData } = get(props, 'location.state', {});
        const { subDepartment } = get(props, 'match.params', {});

        setSubDepartmentData(subDepartmentData);
        setSubDepartment(subDepartment);
    })

    const buildToolbarItems = () => {
        const canCreateRole = validatePermission(user, hierarchyPermissions.createRole);

        return (
            <>
                <Button color="secondary" size="sm" hidden={!canCreateRole} onClick={onClickCreate}>
                    <i className="fa fa-plus"></i> {' '}Create
                    </Button>
            </>
        )
    }

    const onClickDelete = async (roleData) => {
        let result = await Confirm();
        if (result) {
            deleteRecord(roleData);
        }
    }

    const deleteRecord = (roleData) => {
        setLoading(true);
        callApi(`/usermanagement/hierarchy/role/${get(roleData, '_id')}`, 'DELETE', null, null, null, true)
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

    const closeRoleModal = () => {
        setShowRoleModal(false);
        setData(null);
    }

    const onClickCreate = () => {
        setShowRoleModal(true);
    }

    const onClickEdit = (data) => {
        setShowRoleModal(true);
        setData(data);
    }

    const refreshGrid = () => {
        byjusGridRef.current.refreshGrid();
    }

    const formatters = () => ({
        levelFormatter: (level) => {
            return (level == 0) ? "-" : level;
        },
        departmentFormatter: (departmentFormattedName) => {
            return startCase(departmentFormattedName);
        },
        subdepartmentFormatter: (subDepartmentFormattedName) => {
            return startCase(subDepartmentFormattedName);
        },
        actionFormatter: (cell, row) => {
            const canEditRole = validatePermission(user, hierarchyPermissions.editRole);

            return (
                <div>
                    <Button color="primary" size="sm" hidden={!canEditRole} onClick={() => onClickEdit(row)}>
                        <i className="fa fa-pencil" />
                    </Button>
                    {' '}
                </div>
            )
        }
    })

    return (
        <Box>
            <BoxHeader heading="Roles" />
            <BoxBody loading={loading} error={error}>
                <ByjusGrid
                    isKey="_id"
                    gridId="ums_role_grid"
                    ref={byjusGridRef}
                    toolbarItems={buildToolbarItems()}
                    formatters={formatters()}
                    modelName="Role"
                    gridDataUrl={`/usermanagement/hierarchy/role/list`}
                />
                {showRoleModal &&
                    <RoleModal
                        closeModal={closeRoleModal}
                        refreshGrid={refreshGrid}
                        data={data}
                        subDepartmentData={subDepartmentData}
                    />}
            </BoxBody>
        </Box>
    )
}

export default RoleList;

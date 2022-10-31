import React, { useEffect, useState, useRef } from 'react';
import { useSelector } from 'react-redux';
import { Button, Badge } from 'reactstrap'
import { get, startCase } from 'lodash';

import { Box, BoxBody } from 'components/box';
import ByjusGrid from 'modules/core/components/grid/ByjusGridV3';
import { hierarchy as hierarchyPermissions, validatePermission } from 'lib/permissionList';

import EditModal from './EditModal';

const ConfigList = (props) => {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [showEditModal, setShowEditModal] = useState(false);
    const [data, setData] = useState(null);
    const user = useSelector(state => get(state, 'auth.user'));
    let byjusGridRef = useRef();

    useEffect(() => {
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

    const onClickCreate = () => {

    }

    const onClickEdit = (data) => {
        setData(data);
        setShowEditModal(true);
    }

    const refreshGrid = () => {
        byjusGridRef.current.refreshGrid();
    }

    const formatters = () => ({
        applicationNameFormatter: (cell, row) => {
            return startCase(cell);
        },
        teamNameFormatter: (cell, row) => {
            const colorMap = {
                'upstream': 'info',
                'downstream': 'warning',
                'digital_finance': 'success'
            }
            return <Badge color={colorMap[cell] || 'primary'}>{startCase(cell)}</Badge>
        },
        actionFormatter: (cell, row) => {

            return (
                <div>
                    <Button color="primary" size="sm" onClick={() => onClickEdit(row)}>
                        <i className="fa fa-pencil" />
                    </Button>
                    {' '}
                </div>
            )
        }
    })

    return (
        <Box>
            <BoxBody loading={loading} error={error}>
                <ByjusGrid
                    isKey="_id"
                    gridId="ums_devops_infra_configs_grid"
                    ref={byjusGridRef}
                    //toolbarItems={buildToolbarItems()}
                    formatters={formatters()}
                    modelName="DevopsInfraConfig"
                    gridDataUrl={`/usermanagement/settings/devopsinfra/list`}
                />
                {showEditModal &&
                    <EditModal
                        closeModal={() => setShowEditModal(false)}
                        refreshGrid={refreshGrid}
                        data={data}
                    />}
            </BoxBody>
        </Box>
    )
}

export default ConfigList;

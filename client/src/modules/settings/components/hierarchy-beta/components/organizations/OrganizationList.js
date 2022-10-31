import React, { useRef, useState } from 'react';
import { Button } from 'reactstrap';
import { useSelector } from 'react-redux';
import { isEmpty, get, startCase } from 'lodash';

import { Box, BoxBody } from 'components/box';
import ByjusGrid from 'modules/core/components/grid/ByjusGridV3';
import Confirm from 'components/confirm';
import { callApi } from 'store/middleware/api';
import { setup, validatePermission } from 'lib/permissionList';
import OrganizationModal from './OrganizationModal';

const OrganizationList = () => {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [data, setData] = useState(null);
    const [showOrganizationModal, setShowOrganizationModal] = useState(false);
    const user = useSelector(state => get(state, 'auth.user'));
    let byjusGridRef = useRef();

    const buildToolbarItems = () => {
        const createFlag = validatePermission(user, setup.createOrganization);

        return (
            <Button color="secondary" size="sm" hidden={!createFlag} onClick={onClickCreate}>
                <i className="fa fa-plus"></i> {' '}Create
            </Button>
        )
    }

    const onClickDelete = async (data) => {
        let result = await Confirm();
        if (result) {
            deleteRecord(data);
        }
    }

    const deleteRecord = (data) => {
        let orgId = data.id;

        setLoading(true);
        callApi(`/usermanagement/hierarchy-beta/organization/${orgId}`, 'DELETE', null, null, null, true)
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

    const closeOrganizationModal = () => {
        setShowOrganizationModal(false);
        setData(null);
    }

    const onClickCreate = () => {
        setShowOrganizationModal(true);
    }

    const onClickEdit = (data) => {
        setShowOrganizationModal(true);
        setData(data);
    }

    const refreshGrid = () => {
        byjusGridRef.current.refreshGrid();
    }

    const formatters = () => ({
        actionFormatter: (cell, row) => {
            const editFlag = validatePermission(user, setup.editOrganization);
            const deleteFlag = validatePermission(user, setup.deleteOrganization);

            return (
                <div>
                    <Button color="primary" size="sm" hidden={!editFlag} onClick={() => onClickEdit(row)}>
                        <i className="fa fa-pencil" />
                    </Button>
                    {' '}
                    <Button color="danger" size="sm" hidden={!deleteFlag} onClick={() => onClickDelete(row)}>
                        <i className="fa fa-trash" />
                    </Button>
                </div>
            )
        }
    })

    return (
        <Box>
            <BoxBody loading={loading} error={error}>
                <ByjusGrid
                    isKey="_id"
                    gridId="ums_organization_beta_grid"
                    ref={byjusGridRef}
                    toolbarItems={buildToolbarItems()}
                    formatters={formatters()}
                    modelName="Organization"
                    gridDataUrl="/usermanagement/hierarchy-beta/organization/list"
                />
                {showOrganizationModal &&
                    <OrganizationModal
                        closeModal={closeOrganizationModal}
                        refreshGrid={refreshGrid}
                        data={data}
                    />}
            </BoxBody>
        </Box>
    )
}

export default OrganizationList;
import React, { useState, useRef } from 'react';
import { useSelector } from 'react-redux';
import { Button, Row, Col } from 'reactstrap';
import { isEmpty, get } from 'lodash';

import { Box, BoxHeader, BoxBody } from 'components/box';
import ByjusGrid from 'modules/core/components/grid/ByjusGridV3';
import { callApi } from 'store/middleware/api';
import Confirm from 'components/confirm';
import AppTokenModal from './AppTokenModal';
import { appToken, validatePermission } from 'lib/permissionList';

const AppTokenList = () => {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [data, setData] = useState(null);
    const [showAppTokenModal, setShowAppTokenModal] = useState(false);
    const user = useSelector(state => get(state, 'auth.user'));
    let byjusGridRef = useRef();

    const buildToolbarItems = () => {
        const canCreateAppToken = validatePermission(user, [appToken.createAppToken])

        return (
            <>
                <Button className="btn btn-secondary btn-sm"
                    hidden={!canCreateAppToken} onClick={onClickCreate}>
                    <i className="fa fa-plus"></i> {' '}Create
                </Button> {' '}
            </>
        )
    }

    const onClickDelete = async (data) => {
        let result = await Confirm();
        if (result) {
            deleteRecord(data);
        }
    }

    const deleteRecord = (record) => {
        let appTokenId = record._id;

        setLoading(true);
        callApi(`/usermanagement/apptoken/${appTokenId}`, 'DELETE', null, null, null, true)
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

    const closeAppTokenModal = () => {
        setShowAppTokenModal(false);
        setData(null);
    }

    const onClickCreate = () => {
        setShowAppTokenModal(true);
    }

    const onClickEdit = (data) => {
        setShowAppTokenModal(true);
        setData(data);
    }

    const refreshGrid = () => {
        byjusGridRef.current.refreshGrid();
    }

    const formatters = () => ({
        actionFormatter: (cell, row) => {
            const canEditAppToken = validatePermission(user, [appToken.editAppToken]);
            const canDeleteAppToken = validatePermission(user, [appToken.deleteAppToken]);

            return (
                <div>
                    {' '}
                    <Button color="primary" size="sm" hidden={!canEditAppToken} onClick={() => onClickEdit(row)}>
                        <i className="fa fa-pencil" />
                    </Button>
                    {' '}
                    <Button color="danger" size="sm" hidden={!canDeleteAppToken} onClick={() => onClickDelete(row)}>
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
                    gridId="ums_apptoken_grid"
                    ref={byjusGridRef}
                    toolbarItems={buildToolbarItems()}
                    formatters={formatters()}
                    modelName="AppTokens"
                    gridDataUrl={`/usermanagement/apptoken/list`}
                />
                {showAppTokenModal &&
                    <AppTokenModal
                        closeModal={closeAppTokenModal}
                        refreshGrid={refreshGrid}
                        data={data}
                    />}
            </BoxBody>
        </Box>
    )
}

export default AppTokenList;
import React, { useState, useRef } from 'react';
import { useSelector } from 'react-redux';
import { Button, Row, Col } from 'reactstrap';
import { isEmpty, get } from 'lodash';

import { Box, BoxHeader, BoxBody } from 'components/box';
import ByjusGrid from 'modules/core/components/grid/ByjusGridV3';
import { callApi } from 'store/middleware/api';
import Confirm from 'components/confirm';
import SmsProviderModal from './SmsProviderModal';
import { communication, validatePermission } from 'lib/permissionList';

const SmsProviderList = () => {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [data, setData] = useState(null);
    const [showSmsProviderModal, setShowSmsProviderModal] = useState(false);
    const user = useSelector(state => get(state, 'auth.user'));
    let byjusGridRef = useRef();

    const buildToolbarItems = () => {
        const canCreateSmsProvider = validatePermission(user, [communication.createSmsProvider])

        return (
            <>
                <Button className="btn btn-secondary btn-sm"
                    hidden={!canCreateSmsProvider} onClick={onClickCreate}>
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
        let smsProviderId = record._id;

        setLoading(true);
        callApi(`/usermanagement/smsprovider/${smsProviderId}`, 'DELETE', null, null, null, true)
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

    const closeSmsProviderModal = () => {
        setShowSmsProviderModal(false);
        setData(null);
    }

    const onClickCreate = () => {
        setShowSmsProviderModal(true);
    }

    const onClickEdit = (data) => {
        setShowSmsProviderModal(true);
        setData(data);
    }

    const refreshGrid = () => {
        byjusGridRef.current.refreshGrid();
    }

    const formatters = () => ({
        actionFormatter: (cell, row) => {
            const canEditSmsProvider = validatePermission(user, [communication.editSmsProvider]);
            const canDeleteSmsProvider = validatePermission(user, [communication.deleteSmsProvider]);

            return (
                <div>
                    {' '}
                    <Button color="primary" size="sm" hidden={!canEditSmsProvider} onClick={() => onClickEdit(row)}>
                        <i className="fa fa-pencil" />
                    </Button>
                    {' '}
                    <Button color="danger" size="sm" hidden={!canDeleteSmsProvider} onClick={() => onClickDelete(row)}>
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
                    gridId="ums_sms_provider_grid"
                    ref={byjusGridRef}
                    toolbarItems={buildToolbarItems()}
                    formatters={formatters()}
                    modelName="SmsProvider"
                    gridDataUrl={`/usermanagement/smsprovider/list`}
                />
                {showSmsProviderModal &&
                    <SmsProviderModal
                        closeModal={closeSmsProviderModal}
                        refreshGrid={refreshGrid}
                        data={data}
                    />}
            </BoxBody>
        </Box>
    )
}

export default SmsProviderList;
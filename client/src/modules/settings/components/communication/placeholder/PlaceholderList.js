import React, { useState, useRef } from 'react';
import { Button } from 'reactstrap';
import { get } from 'lodash';
import { useSelector } from 'react-redux';

import { callApi } from "store/middleware/api";
import Confirm from 'components/confirm';
import ByjusGrid from 'modules/core/components/grid/ByjusGridV3';
import ByjusDropdown from 'components/ByjusDropdown';

import { Box, BoxBody } from 'components/box';
import { communication, validatePermission } from 'lib/permissionList';

import PlaceholderModal from './PlaceholderModal';

const PlaceholderList = (props) => {
    const [showPlaceholderModal, setShowPlaceholderModal] = useState(false);
    const [actionType, setActionType] = useState("");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [placeholderData, setPlaceholderData] = useState("");
    const user = useSelector(state => get(state, 'auth.user'));
    const byjusGridRef = useRef();

    const onClickCreate = () => {
        setShowPlaceholderModal(true);
        setActionType('CREATE');
        setPlaceholderData({});
    }

    const onClickEdit = (data) => {
        setShowPlaceholderModal(true);
        setActionType('UPDATE');
        setPlaceholderData(data);
    }

    const onClickDelete = async (data) => {
        let result = await Confirm();
        if (result) {
            deleteRecord(data);
            setPlaceholderData({});
        }
    }

    const deleteRecord = (record) => {
        let placeholderId = record._id;

        setLoading(true);
        setError(null);
        callApi(`/usermanagement/placeholder/${placeholderId}`, 'DELETE', null, null, null, true)
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
        setShowPlaceholderModal(false);
        byjusGridRef.current.refreshGrid();
    }

    function buildToolbarItems() {
        const canCreatePlaceholder = validatePermission(user, [communication.createPlaceholder])

        return (
            <>
                <Button color="secondary" size="sm" hidden={!canCreatePlaceholder} onClick={onClickCreate}>
                    <i className="fa fa-plus"></i> {' '}Create
                </Button>
            </>
        )
    }

    const formatters = {
        actionFormatter: (cell, row) => {
            const canEditPlaceholder = validatePermission(user, [communication.editPlaceholder])
            const canDeletePlaceholder = validatePermission(user, [communication.deletePlaceholder])

            if (canEditPlaceholder || canDeletePlaceholder) {
                return (
                    <ByjusDropdown
                        type="simple"
                        defaultTitle=""
                        titleIcon="fa fa-gear"
                        items={
                            [{
                                title: 'Delete',
                                icon: 'fa fa-trash',
                                onClick: () => onClickDelete(row),
                                isAllowed: canDeletePlaceholder
                            }]}
                    />
                )
            }
        },
    };

    return (
        <Box>
            <BoxBody loading={loading} error={error}>
                <ByjusGrid
                    isKey="_id"
                    gridId="ums_placeholder_grid"
                    ref={byjusGridRef}
                    toolbarItems={buildToolbarItems()}
                    formatters={formatters}
                    modelName="TemplatePlaceholder"
                    gridDataUrl={`/usermanagement/placeholder/list`}
                />
                {showPlaceholderModal &&
                    <PlaceholderModal
                        actionType={actionType}
                        closeModal={onCloseModal}
                        refreshGrid={() => byjusGridRef.current.refreshGrid()}
                        placeholderData={placeholderData}
                    />
                }
            </BoxBody>
        </Box>
    )
}

export default PlaceholderList

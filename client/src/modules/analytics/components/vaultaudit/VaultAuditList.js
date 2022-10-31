import React, { useState, useRef } from 'react';
import { isEmpty, get } from 'lodash';
import moment from 'moment';
import ModalWindow from 'components/modalWindow';
import { useSelector } from 'react-redux';

import ByjusGrid from 'modules/core/components/grid/ByjusGridV3';
import { Box, BoxBody } from 'components/box';
import { validatePermission, secret } from 'lib/permissionList';
import ByjusDropdown from 'components/ByjusDropdown';

import ViewSecretValue from './ViewSecretValue';

const VaultAuditList = (props) => {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [templateData, setTemplateData] = useState(null);
    const [showViewModal, setShowViewModal] = useState(false);
    const user = useSelector(state => get(state, 'auth.user'));
    const secretDataList = useSelector(state => get(state, 'secretData'));



    let byjusGridRef = useRef();

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

    const formatters = () => ({
        actionFormatter: (cell, row) => {
            const canViewSecret =  validatePermission(user, [secret.viewSecret])
            if (canViewSecret) {
                return (
                    <ByjusDropdown
                        type="simple"
                        defaultTitle=""
                        titleIcon="fa fa-gear"
                        items={
                            [{
                                title: 'View',
                                icon: 'fa fa-eye',
                                onClick: () => onClickView(cell, row)
                            }]} />
                )
            }
        },

        createdAtFormatter: (cell, row) => {
            let createdAt = row.createdAt;
            if (!isEmpty(createdAt)) {
                return createdAt && moment(createdAt).format("MMM D YYYY, h:mm a");
            }
        }
    })

    return (
        <Box>
            <BoxBody loading={loading} error={error}>
                <ByjusGrid
                    isKey="_id"
                    gridId="ums_vaultaudit_grid"
                    ref={byjusGridRef}
                    formatters={formatters()}
                    gridDataUrl="/usermanagement/vault/vaultmanagement/auditList"
                />
                <ModalWindow
                    showModal={showViewModal}
                    closeModal={closeModal}
                    closeButton={true}
                    heading="Secret Value Details"
                >
                    {templateData && <ViewSecretValue templateData={templateData} />}
                </ModalWindow>
            </BoxBody>
        </Box>
    )
}

export default VaultAuditList;

import React, { useState, useEffect } from 'react';
import moment from 'moment';
import Avatar from 'react-avatar';

import { callApi } from 'store/middleware/api';
import './VaultDetails.scss';
import VaultModal from './VaultModal';
import lock from './lock.png'

const VaultDetails = (props) => {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [vaultDetails, setVaultDetails] = useState({});
    const [showEditModal, setShowEditModal] = useState(false);
    const vaultId = props.vaultId;
    const vaultUid = props.vaultUid;

    useEffect(() => {
        getVaultDetails();
    }, []);

    const getVaultDetails = async () => {
        setError(null);
        setLoading(true);
        const body = {
            "id": vaultId
        }
        let url = `/usermanagement/vault/vaultmanagement/vaultDetailsById`;
        let method = 'POST';

        callApi(url, method, body, null, null, true)
            .then(response => {
                setVaultDetails(response);
                setLoading(false);
            })
            .catch(error => {
                setLoading(false);
                setError(error);
            })
    }

    const onClickEditVault = async () => {
        setShowEditModal(true);
    }

    const onCloseModal = (type) => {
        setShowEditModal(false);
    }

    return (
        <div className="main-profile-user-details">
            <div >
                <div className="profile-image">
                    <Avatar
                        maxInitials={2}
                        src={lock}
                        size="60"
                        round={true}
                        color={"#ff7043"}
                    />
                </div>
                {<div className="edit-user" onClick={onClickEditVault}>
                    <i className="fa fa-edit" />&nbsp;&nbsp;EDIT VAULT
                </div>}
            </div>
            <div className="profile-general-details">
                <div className="emailId-label">Name :&nbsp;&nbsp;
                    {vaultDetails.vaultUuid}&nbsp;&nbsp;
                </div>
                <div className="tnlId"> Created By :&nbsp;
                    {vaultDetails.createdBy && vaultDetails.createdBy}
                </div>
                <div className="tnlId"> Created At :&nbsp;
                    {vaultDetails.createdAt ? moment(vaultDetails.createdAt).format('DD-MM-YYYY') : "N/A"}
                </div>
            </div>

            <div className="profile-general-details">
                <div className="emailId-label"> Status :&nbsp;
                    {vaultDetails.isActive == "true" ? <span className="active-name">Active</span> : <span className="inactive-name">Inactive</span>}
                </div>
                <div className="tnlId"> Updated By :&nbsp;&nbsp;
                    {vaultDetails.updatedBy && vaultDetails.updatedBy}&nbsp;&nbsp;
                </div>
                <div className="tnlId"> Updated At :&nbsp;
                    {vaultDetails.updatedAt ? moment(vaultDetails.updatedAt).format('DD-MM-YYYY') : "N/A"}
                </div>
            </div>
            {showEditModal &&
                <VaultModal
                    actionType="UPDATE"
                    closeModal={onCloseModal}
                    // refreshGrid={() => byjusGridRef.current.refreshGrid()}
                    vaultData={vaultDetails}
                />
            }
        </div>
    );
}

export default VaultDetails;

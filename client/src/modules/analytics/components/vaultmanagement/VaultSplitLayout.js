import React, { useState, useEffect, useRef } from 'react'
import { connect } from 'react-redux';
import { Button, ButtonGroup, Badge } from 'reactstrap';
import { useHistory, Link } from 'react-router-dom';

import { callApi } from 'store/middleware/api';
import TabBuilder from 'modules/core/components/TabBuilder';
import VaultSecretPoolMappingList from '../vaultmanagement/VaultSecretPoolMappingList';
import VaultUserGroupMappingList from '../vaultusergroupmapping/VaultUserGroupMappingList';
import VaultLogs from '../vaultlog/VaultLogList';
import VaultDetails from './VaultDetails'
import './VaultDetails.scss'

const Profile = (props, state) => {
    const [selectedTab, setSelectedTab] = useState(0);
    const vaultData = props;
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [vaultDetails, setVaultDetails] = useState(null);
    const handleTabSelect = (tabNo) => {
        setSelectedTab(tabNo);
    }
    const vaultUid = props.vaultUid;
    const vaultId = props.vaultId;
    const history = useHistory();
    const { goBack, replace } = history;

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

    return (
        <div>
            <div className="d-inline-block float-right">
                <Button color="danger" onClick={() => replace({ pathname: "/analytics/vault" })}>
                    <i className="fa fa-close" />&nbsp;
                </Button>
            </div>
            <TabBuilder
                defaultTab={selectedTab}
                tabs={[{
                    title: "Details",
                    component: <VaultDetails
                        vaultId={vaultId}
                        createdBy={vaultDetails}
                        vaultUid={vaultUid}
                    />
                }, {
                    title: "Sub Vault Mapping",
                    component: <VaultSecretPoolMappingList
                        vaultId={vaultId}
                    />
                }, {
                    title: 'User Group Mapping',
                    component: <VaultUserGroupMappingList
                        vaultId={vaultId}
                    />
                }, {
                    title: "Vault logs",
                    component: <VaultLogs
                        vaultId={vaultId}
                    />
                }]}
            />
        </div>
    )
}

const mapStateToProps = state => ({
    user: state.auth.user
});

export default connect(mapStateToProps)(Profile);

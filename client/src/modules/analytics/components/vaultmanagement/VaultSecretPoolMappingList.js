import React, { Fragment, useState, useRef } from 'react';
import { Button } from 'reactstrap';
import { Link } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { get, isEmpty, startCase } from 'lodash';
import moment from 'moment';
import { callApi } from 'store/middleware/api';

import ByjusGrid from 'modules/core/components/grid/ByjusGridV3';
import { Box, BoxBody } from 'components/box';
import { validatePermission, vault, secret } from 'lib/permissionList';

import AssignUnassign from './AssignUnassign';

const VaultSecretMappingList = (props) => {
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [actionType, setActionType] = useState("");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [secretData, setSecretData] = useState("");
    const user = useSelector(state => get(state, 'auth.user'));
    const vaultId = props.vaultId;
    let byjusGridRef = useRef();

    const onClickCreate = () => {
        setShowCreateModal(true);
        setActionType('CREATE');
    }
    const onCloseModal = (type) => {
        setShowCreateModal(false);
        byjusGridRef.current.refreshGrid();
    }

    const buildToolbarItems = () => {
        const canCreateVault = validatePermission(user, [vault.editVault]);

        return (
            <Fragment>
                <Button color="success" size="sm" hidden={!canCreateVault} onClick={onClickCreate}>
                    <i className="fa fa-plus"></i> {' '}Assign
                </Button> {' '}
            </Fragment>
        )
    }

    const refreshGrid = () => {
        byjusGridRef.current.refreshGrid();
    }

    const onClickUnAssignActionBtn = async (mappingData) => {
        const body = {
            id: mappingData.id,
        };

        let url = `/usermanagement/vault/vaultsecretpoolmapping/update`;
        let method = 'DELETE';

        callApi(url, method, body, null, null, true)
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

    const formatters = () => ({
        secretPoolFormatter: (cell, row) => {
            let description = get(row, "description", "");

            const canEditSecretPool = validatePermission(user, [secret.editSecret]);
            if (canEditSecretPool) {
                return (
                    <div>
                        <Link
                            to={{ pathname: `/analytics/sub-vaults/secret/${row.secretPoolId}/secrets`, state: { secretPoolData: row } }}
                        >{cell}</Link>
                        <div style={{ width: "100%" }}>
                            <div style={{ float: "left" }}>{description}</div>
                        </div>
                    </div>
                )
            }
            else {
                return startCase(cell);
            }

        },
        assignFormatter: (cell, row) => {
            return (
                <Button color="danger"
                    onClick={() => onClickUnAssignActionBtn(row)}
                >
                    <i className="fa fa-minus"></i>
                </Button >
            )
        },
        createdAtFormatter: (cell, row) => {
            let createdAt = get(row, "actionDetails.createdAt", "");
            if (!isEmpty(createdAt)) {
                return createdAt && moment(createdAt).format("MMM D YYYY, h:mm a");
            }
        },
        updatedAtFormatter: (cell, row) => {
            let updatedAt = get(row, "actionDetails.updatedAt", "");
            if (!isEmpty(updatedAt)) {
                return updatedAt && moment(updatedAt).format("MMM D YYYY, h:mm a");
            }
        }
    })


    return (

        <Box>
            <BoxBody loading={loading} error={error}>
                <ByjusGrid
                    isKey="_id"
                    gridId="ums_vaultpoolmapping_grid"
                    ref={byjusGridRef}
                    toolbarItems={buildToolbarItems()}
                    formatters={formatters()}
                    contextCriterias={[{
                        selectedColumn: "vaultId",
                        selectedOperator: "equal",
                        selectedValue: vaultId
                    }]}
                    gridDataUrl="/usermanagement/vault/vaultsecretpoolmapping/list"
                />
                {showCreateModal &&
                    <AssignUnassign
                        actionType={actionType}
                        closeModal={onCloseModal}
                        refreshGrid={() => byjusGridRef.current.refreshGrid()}
                        secretData={secretData}
                        vaultId={vaultId}
                    />

                }
            </BoxBody>
        </Box>
    )

}

export default VaultSecretMappingList;


import React, { Fragment, useState, useRef } from 'react';
import { Button, Container } from 'reactstrap';
import { Link } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { get, startCase, isEmpty } from 'lodash';
import moment from 'moment';
import ToggleButton from 'react-toggle-button';
import ModalWindow from 'components/modalWindow';

import { callApi } from 'store/middleware/api';
import ByjusGrid from 'modules/core/components/grid/ByjusGridV3';
import ByjusDropdown from 'components/ByjusDropdown';
import { validatePermission, vaultRole, secret } from 'lib/permissionList';

import VaultRoleMappingModal from './VaultUserMappingModal';
import AppRoleView from './AppUserMappingView';

const VaultRoleMappingList = (props) => {
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [actionType, setActionType] = useState("");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [status, setStatus] = useState("");
    const [vaultRoleMappingData, setVaultRoleMappingData] = useState("");
    const [showViewModal, setShowViewModal] = useState(false);
    const [templateData, setTemplateData] = useState(null);
    const user = useSelector(state => get(state, 'auth.user'));
    const id = props.vaultId;
    let byjusGridRef = useRef();

    const closeModal = () => {
        setShowViewModal(false);
    }

    const onClickView = (cell, row) => {
        setShowViewModal(true);
        setTemplateData(row);
    }

    const onClickCreate = () => {
        setStatus(true);
        setShowCreateModal(true);
        setActionType('CREATE');
    }

    const onClickEdit = (data) => {
        setStatus(false);
        setShowCreateModal(true);
        setActionType('UPDATE');
        setVaultRoleMappingData(data);
    }

    const onCloseModal = (type) => {
        setShowCreateModal(false);
        byjusGridRef.current.refreshGrid();
    }

    const buildToolbarItems = () => {
        const canCreatSecret = validatePermission(user, [vaultRole.editVaultRole]);

        return (
            <Fragment>
                <Button color="success" size="sm" hidden={!canCreatSecret} onClick={onClickCreate}>
                    <i className="fa fa-plus"></i> {' '}Assign
                </Button> {' '}
            </Fragment>
        )
    }

    const refreshGrid = () => {
        byjusGridRef.current.refreshGrid();
    }

    const onClickToggle = async (record, value) => {
        let userStatus = (value) ? false : true;
        await updateVaultRoleMapping(record, userStatus);
    }

    const onClickUnAssignActionBtn = async (mappingData) => {
        const body = {
            userGroupId: mappingData.id,
            vaultId: id
        };
        setLoading(true);
        const url = `/usermanagement/vault/vaultrolemapping/delete`;
        const method = 'DELETE';

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

    const updateVaultRoleMapping = async (record, status) => {
        let body = {
            "id": record.id,
            "isActive": status
        }
        let url = `/usermanagement/vault/vaultrolemapping/update`;
        let method = 'PATCH';

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
        entityFormatter: (cell, row) => {
            const entities = cell.map((record) => {
                return record && record.name
            })
            return entities && entities.join(', ')
        },
        secretPoolFormatter: (cell, row) => {
            const canEditSecretPool = row.isActive === "true" && validatePermission(user, [vaultRole.editVaultRole]);
            if (canEditSecretPool) {
                return (
                    <div>
                        <Link
                            to={{ pathname: `/analytics/vault/vaultrolemapping/${row.id}/update`, state: { vaultRoleMappingData: row } }}
                        >{cell}</Link>
                    </div>
                )
            }
            else {
                return startCase(cell);
            }
        },

        actionFormatter: (cell, row) => {
            const canEditVaultRoleMapping = row.isActive === "true" && validatePermission(user, [vaultRole.editVaultRole])
            if (canEditVaultRoleMapping) {
                return (
                    <ByjusDropdown
                        type="simple"
                        defaultTitle=""
                        titleIcon="fa fa-gear"
                        items={
                            [{
                                title: 'Edit',
                                icon: 'fa fa-pencil',
                                onClick: () => onClickEdit(row),
                                isAllowed: canEditVaultRoleMapping
                            },
                            {
                                title: 'View',
                                icon: 'fa fa-eye',
                                onClick: () => onClickView(cell, row)
                            }]} />
                )
            }
        },
        statusFormatter: (cell, row) => {
            const canDeleteSecret = validatePermission(user, [vaultRole.deleteVaultRole])
            let toggleValue = (cell === "true") ? true : false;

            return (
                <ToggleButton
                    inactiveLabel={''}
                    activeLabel={''}
                    colors={{
                        activeThumb: {
                            base: 'green',
                        },
                        active: {
                            base: 'green',
                            hover: 'rgb(177, 191, 215)',
                        },
                        inactiveThumb: {
                            base: 'cyan',
                        },
                        inactive: {
                            base: 'cyan',
                            hover: 'rgb(177, 191, 215)',
                        }
                    }}
                    hidden={!canDeleteSecret}
                    value={toggleValue}
                    onToggle={(value) => onClickToggle(row, value)} />
            )
        },
        createdAtFormatter: (cell, row) => {
            let createdAt = get(row, "createdAt", "");
            if (!isEmpty(createdAt)) {
                return createdAt && moment(createdAt).format("MMM D YYYY, h:mm a");
            }
        },
        updatedAtFormatter: (cell, row) => {
            let updatedAt = get(row, "updatedAt", "");
            if (!isEmpty(updatedAt)) {
                return updatedAt && moment(updatedAt).format("MMM D YYYY, h:mm a");
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
        }
    })

    return (
            <Container>
                <ByjusGrid
                    isKey="_id"
                    gridId="ums_user_group_mapping_grid"
                    ref={byjusGridRef}
                    toolbarItems={buildToolbarItems()}
                    formatters={formatters()}
                    contextCriterias={[{
                        selectedColumn: "vault_id",
                        selectedOperator: "equal",
                        selectedValue: id
                    }]}
                    gridDataUrl={`/usermanagement/vault/vaultrolemapping/list`}
                />
                {showCreateModal &&
                    <VaultRoleMappingModal
                        actionType={actionType}
                        closeModal={onCloseModal}
                        refreshGrid={() => byjusGridRef.current.refreshGrid()}
                        vaultRoleMappingData={vaultRoleMappingData}
                        status={status}
                        id={id}
                    />
                }
                <ModalWindow
                    showModal={showViewModal}
                    closeModal={closeModal}
                    closeButton={true}
                    heading="Application Group Details"
                >
                    {templateData && <AppRoleView templateData={templateData} />}
                </ModalWindow>
            </Container>
    )
}

export default VaultRoleMappingList;


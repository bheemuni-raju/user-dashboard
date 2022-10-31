import React, { Fragment, useState, useRef } from 'react';
import { Button } from 'reactstrap';
import { Link } from 'react-router-dom';
import { get, startCase, isEmpty } from 'lodash';
import moment from 'moment';
import ToggleButton from 'react-toggle-button'

import { callApi } from 'store/middleware/api';
import ByjusGrid from 'modules/core/components/grid/ByjusGridV3';
import ByjusDropdown from 'components/ByjusDropdown';
import { Box, BoxBody } from 'components/box';
import { validatePermission, secret } from 'lib/permissionList';
import { useSelector } from 'react-redux';

import SecretPoolModal from './SecretPoolModal';


const SecretPoolList = (props) => {
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [actionType, setActionType] = useState("");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [secretPoolData, setSecretPoolData] = useState("");
    const user = useSelector(state => get(state, 'auth.user'));

    let byjusGridRef = useRef();

    const onClickCreate = () => {
        setShowCreateModal(true);
        setActionType('CREATE');
    }

    const onClickEdit = (data) => {
        setShowCreateModal(true);
        setActionType('UPDATE');
        setSecretPoolData(data);
    }

    const onCloseModal = (type) => {
        setShowCreateModal(false);
        setSecretPoolData(null);
        byjusGridRef.current.refreshGrid();
    }

    const buildToolbarItems = () => {
        const canCreateSecretPool = validatePermission(user, [secret.editSecret]);

        return (
            <Fragment>
                <Button color="secondary" size="sm" hidden={!canCreateSecretPool} onClick={onClickCreate}>
                    <i className="fa fa-plus"></i> {' '}Create
                </Button> {' '}
            </Fragment>
        )
    }

    const refreshGrid = () => {
        byjusGridRef.current.refreshGrid();
    }

    const onClickToggle = async (record, value) => {
        let userStatus = (value) ? "false" : "true";
        await updateSecretPoolStatus(record, userStatus);
    }

    const updateSecretPoolStatus = async (record, status) => {
        const body = {
            "id": record.id,
            "isActive": status
        }
        let url = `/usermanagement/vault/secretpool/delete`;
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

            const canEditSecretPool = row.isActive === "true" && validatePermission(user, [secret.editSecret]);
            if (canEditSecretPool) {
                return (
                    <div>
                        <Link
                            to={{ pathname: `/analytics/sub-vaults/secret/${row.id}/secrets`, state: { secretPoolData: row } }}
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
        actionFormatter: (cell, row) => {
            const canEditSecretPool = row.isActive === "true" && validatePermission(user, [secret.editSecret])
            if (canEditSecretPool) {
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
                                isAllowed: canEditSecretPool
                            }]} />
                )
            }
        },
        statusFormatter: (cell, row) => {
            const canDeleteSecretPool = validatePermission(user, [secret.deleteSecret])
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
                    hidden={!canDeleteSecretPool}
                    value={toggleValue}
                    onToggle={(value) => onClickToggle(row, value)} />
            )
        },
        createdAtFormatter: (cell, row) => {
            let createdAt = row.createdAt;
            if (!isEmpty(createdAt)) {
                return createdAt && moment(createdAt).format("MMM D YYYY, h:mm a");
            }
        },
        updatedAtFormatter: (cell, row) => {
            let updatedAt = row.updatedAt;
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
                    gridId="ums_secretpool_grid"
                    ref={byjusGridRef}
                    toolbarItems={buildToolbarItems()}
                    formatters={formatters()}
                    gridDataUrl="/usermanagement/vault/secretpool/list"
                />
                {showCreateModal &&
                    <SecretPoolModal
                        actionType={actionType}
                        closeModal={onCloseModal}
                        refreshGrid={() => byjusGridRef.current.refreshGrid()}
                        secretPoolData={secretPoolData}
                    />
                }
            </BoxBody>
        </Box>
    )
}

export default SecretPoolList;

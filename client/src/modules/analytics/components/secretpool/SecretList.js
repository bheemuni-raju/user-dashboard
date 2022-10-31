import React, { Fragment, useState, useRef } from 'react';
import { Button } from 'reactstrap';
import { useSelector } from 'react-redux';
import { get, startCase, isEmpty } from 'lodash';
import moment from 'moment';
import ToggleButton from 'react-toggle-button'
import { callApi } from 'store/middleware/api';
import ModalWindow from 'components/modalWindow';
import { useHistory } from 'react-router-dom';

import ByjusGrid from 'modules/core/components/grid/ByjusGridV3';
import ByjusDropdown from 'components/ByjusDropdown';
import { Box, BoxBody } from 'components/box';
import { validatePermission, secret } from 'lib/permissionList';

import SecretModal from './SecretModal';
import ViewSecretValue from './ViewSecretValue';

const SecretList = (props) => {
    const [templateData, setTemplateData] = useState(null);
    const [showViewModal, setShowViewModal] = useState(false);
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [actionType, setActionType] = useState("");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [secretData, setSecretData] = useState("");
    const user = useSelector(state => get(state, 'auth.user'));
    const poolId = props.match.params.secret;
    const secretDataList = useSelector(state => get(state, 'secretData'));
    let byjusGridRef = useRef();
    const history = useHistory();

    const closeModal = () => {
        setShowViewModal(false);
    }

    const onClickView = (cell, row) => {
        setShowViewModal(true);
        setTemplateData(row);
    }

    const onClickCreate = () => {
        setShowCreateModal(true);
        setActionType('CREATE');
    }

    const onClickEdit = (data) => {
        setShowCreateModal(true);
        setActionType('UPDATE');
        setSecretData(data);
    }

    const onCloseModal = (type) => {
        setShowCreateModal(false);
        setSecretData(null);
        byjusGridRef.current.refreshGrid();
    }

    const buildToolbarItems = () => {
        const canCreatSecret = validatePermission(user, [secret.editSecret]);

        return (
            <Fragment>
                <Button color="secondary" size="sm" hidden={!canCreatSecret} onClick={onClickCreate}>
                    <i className="fa fa-plus"></i> {' '}Create
                </Button> {' '}
                <Button color="secondary" size="sm" hidden={!canCreatSecret} onClick={() => history.push(`/analytics/sub-vaults/secret/${poolId}/import-secrets`)}>
                    <i className="fa fa-plus"></i> {' '}Import
                </Button> {' '}
            </Fragment>
        )
    }

    const refreshGrid = () => {
        byjusGridRef.current.refreshGrid();
    }

    const onClickToggle = async (record, value) => {
        let userStatus = (value) ? "false" : "true";
        await updateSecretStatus(record, userStatus);
    }

    const updateSecretStatus = async (record, status) => {
        const body = {
            "id": record.id,
            "isActive": status
        }
        let url = `/usermanagement/vault/secret/update`;
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
        secretValueFormatter: (cell, row) => {
            let value = '';
            for (let i = 0; i < cell.length; i++) {
                value = value + '*'
            }
            return value;
        },
        actionFormatter: (cell, row) => {
            const canEditSecret = row.isActive === "true" && validatePermission(user, [secret.editSecret])
            if (canEditSecret) {
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
                                isAllowed: canEditSecret
                            }, {
                                title: 'View',
                                icon: 'fa fa-eye',
                                onClick: () => onClickView(cell, row)
                            }]} />
                )
            }
        },
        statusFormatter: (cell, row) => {
            const canDeleteSecret = validatePermission(user, [secret.deleteSecret])
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
            const createdAt = row.createdAt;
            if (!isEmpty(createdAt)) {
                return createdAt && moment(createdAt).format("MMM D YYYY, h:mm a");
            }
        },
        updatedAtFormatter: (cell, row) => {
            const updatedAt = row.updatedAt;
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
                    gridId="ums_secret_grid"
                    ref={byjusGridRef}
                    toolbarItems={buildToolbarItems()}
                    formatters={formatters()}
                    contextCriterias={[{
                        selectedColumn: "secretPoolId",
                        selectedOperator: "equal",
                        selectedValue: poolId
                    }]}
                    gridDataUrl="/usermanagement/vault/secret/list"
                />
                {showCreateModal &&
                    <SecretModal
                        actionType={actionType}
                        closeModal={onCloseModal}
                        refreshGrid={() => byjusGridRef.current.refreshGrid()}
                        secretData={secretData}
                        poolId={poolId}
                    />

                }
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

export default SecretList;


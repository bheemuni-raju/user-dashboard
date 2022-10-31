import React, { Fragment, useState, useRef, useEffect } from 'react';
import { Button } from 'reactstrap';
import { Link, useLocation, useHistory, useParams } from 'react-router-dom';
import { get, startCase, isEmpty } from 'lodash';
import moment from 'moment';
import ToggleButton from 'react-toggle-button'

import { callApi } from 'store/middleware/api';
import SplitViewContainer from 'modules/core/components/grid/SplitViewContainer';
import ByjusDropdown from 'components/ByjusDropdown';
import { Box, BoxBody } from 'components/box';
import { validatePermission, vault } from 'lib/permissionList';
import { useSelector } from 'react-redux';

import VaultModal from './VaultModal';
import VaultSplitLayout from './VaultSplitLayout'

const VaultList = (props) => {
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [actionType, setActionType] = useState("");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [vaultData, setVaultData] = useState("");
    const user = useSelector(state => get(state, 'auth.user'));
    const [maximized, setMaximized] = useState(false);
    const [gridDataCount, setGridDataCount] = useState(0);
    const { pathname } = useLocation();
    const selectedId = pathname.split("/")[3];
    const selectedVaultUId = pathname.split("/")[4];
    const [hideList, setHideList] = useState(false)
    const [vaultId, setVaultId] = useState(null);
    const { vaultUid } = useParams();
    const history = useHistory();
    let byjusGridRef = useRef();
    const condensed = vaultUid;

    useEffect(() => {
        !condensed && setHideList(false)
    }, [condensed])


    const onClickCreate = () => {
        setShowCreateModal(true);
        setActionType('CREATE');
    }

    const onClickEdit = (data) => {
        setShowCreateModal(true);
        setActionType('UPDATE');
        setVaultData(data);
    }

    function onGridDataLoad(state, data) {
        const docs = get(data, 'docs', []);
        setGridDataCount(docs.length);
        if (condensed && state && state.autoSelect && docs.length) {
            let { id } = docs[0]
            history.push(`/analytics/vault/${data.id}/${data.vaultUuid}`);
        }
    }

    function handleOrderClick(id, type) {
        if (gridDataCount === 1) {
            setMaximized(true);
        }
        history.push(`/analytics/vault/${id} `)
    }

    const onCloseModal = (type) => {
        setShowCreateModal(false);
        setVaultData(null);
        byjusGridRef.current.refreshGrid();
    }

    const buildToolbarItems = () => {
        const canCreateVault = validatePermission(user, [vault.editVault]);

        return (
            <Fragment>
                <Button color="secondary" size="sm" hidden={!canCreateVault} onClick={onClickCreate}>
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
        await updateVaultPoolStatus(record, userStatus);
    }

    const updateVaultPoolStatus = async (record, status) => {
        const body = {
            "id": record.id,
            "isActive": status
        }
        let url = `/usermanagement/vault/vaultmanagement/update`;
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

    const formatters = {
        vaultFormatter: (cell, row) => {
            const canEditVault = row.isActive === "true" && validatePermission(user, [vault.editVault]);
            let description = get(row, "description", "");
            setVaultId(row.id);
            if (canEditVault) {
                return (
                    <div>
                        <Link
                            to={{ pathname: `/analytics/vault/${row.id}/${row.vaultUuid}`, state: { vaultData: row } }}
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
            const canEditVault = row.isActive === "true" && validatePermission(user, [vault.editVault])
            if (canEditVault) {
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
                                isAllowed: canEditVault
                            }]} />
                )
            }
        },
        statusFormatter: (cell, row) => {
            const canDeleteVault = validatePermission(user, [vault.deleteVault])
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
                    hidden={!canDeleteVault}
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
    }

    function getCondensedColumns(selectedVaultUId) {
        return [{
            dataField: 'vaultUuid',
            text: 'Vault Uid',
            type: 'string',
            columnClassName: (col) => col === selectedVaultUId ? "bg-highlight" : "",
            quickFilter: true,
            formatter: (cell, row) => {
                const id = row.id;
                const vaultUid = row.vaultUuid;
                const description = row.description;

                return (
                    <Link to={`/analytics/vault/${row.id}/${row.vaultUuid}`}>
                        <div className="d-flex justify-content-between">
                            <div className="text-truncate text-lowercase text-dark">
                                {vaultUid}
                            </div>
                        </div>
                        <div className="d-flex justify-content-between">
                            <div className="text-truncate subtitle-orderid">
                                <small className="font-weight-bold">#{description}</small><br />
                                <small>{moment(row.createdAt).format("lll")}</small>
                            </div>
                        </div>
                    </Link>
                )
            }
        }]
    }
    return (
        <Box>
            <BoxBody>
                <SplitViewContainer
                    ref={byjusGridRef}
                    gridId="ums_vaultmanagement_grid"
                    gridDataUrl={"/usermanagement/vault/vaultmanagement/list"}
                    compactView={condensed}
                    bodyContainerClass={condensed ? "order-split-table custom-scrollbar" : ""}
                    toolbarItems={buildToolbarItems()}
                    formatters={formatters}
                    condensed={condensed}
                    maximized={false}
                    resize={true}
                    onLoadDataCompletion={onGridDataLoad}
                    condensedColumns={getCondensedColumns(selectedVaultUId)}
                    bodyContainerClass={condensed ? "attendance-split-table custom-scrollbar" : ""}
                >
                    <VaultSplitLayout
                        refreshGrid={byjusGridRef}
                        maximized={false}
                        vaultUid={vaultUid}
                        vaultId={selectedId}
                        resize={true}
                    />
                </SplitViewContainer>
                {showCreateModal &&
                    <VaultModal
                        actionType={actionType}
                        closeModal={onCloseModal}
                        refreshGrid={() => byjusGridRef.current.refreshGrid()}
                        vaultData={vaultData}
                    />
                }
            </BoxBody>
        </Box>
    );
}

export default VaultList;

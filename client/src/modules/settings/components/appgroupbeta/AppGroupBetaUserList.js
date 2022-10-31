
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

import AssignUnssignBetaGroup from './AssignUnssignBetaGroup';

const AppGroupUserList = (props) => {
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [actionType, setActionType] = useState("");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const user = useSelector(state => get(state, 'auth.user'));
    const appGroupData = props.location.state.groupData;
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
        setLoading(true);
        const body = {
            id: mappingData.id,
        };

        let url = `/usermanagement/v1/appgroup/unAssign`;
        let method = 'delete';

        callApi(url, method, body, null, null, true)
            .then(response => {
                setLoading(false);
                byjusGridRef && refreshGrid();
                return false;
            })
            .catch(error => {
                byjusGridRef && refreshGrid();
                setLoading(false);
            })
    }

    const formatters = () => ({
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
                    gridId="ums_app_group_user_grid"
                    ref={byjusGridRef}
                    toolbarItems={buildToolbarItems()}
                    formatters={formatters()}
                    contextCriterias={[{
                        selectedColumn: "appGroupId",
                        selectedOperator: "equal",
                        selectedValue: appGroupData.id
                    }]}
                    gridDataUrl="/usermanagement/v1/appgroup/userList"
                />
                {showCreateModal &&
                    <AssignUnssignBetaGroup
                        actionType={actionType}
                        closeModal={onCloseModal}
                        refreshGrid={() => byjusGridRef.current.refreshGrid()}
                        appGroupData={appGroupData}
                    />
                }
            </BoxBody>
        </Box>
    )

}

export default AppGroupUserList;


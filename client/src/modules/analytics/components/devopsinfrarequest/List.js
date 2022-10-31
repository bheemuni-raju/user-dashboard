import React, { useState, useRef } from 'react';
import { connect } from 'react-redux';
import { Link, useLocation } from 'react-router-dom';
import { Button, Badge } from 'reactstrap';
import { startCase, upperCase } from 'lodash';
import moment from 'moment';

import ByjusDropdown from 'components/ByjusDropdown'
import { Box, BoxBody } from 'components/box';
import SplitViewContainer from 'modules/core/components/grid/SplitViewContainer';
import { validatePermission, deploymentRequest } from 'lib/permissionList';

import DeploymentRequestForm from './Form';
import DeploymentRequestRouter from './Router';
import { statusColourMap } from './config';

const DeploymentRequestList = (props) => {
    const { user, match } = props;
    const [showCreateForm, setShowCreateForm] = useState(false);
    const [searchCriterias, setSearchCriterias] = useState([]);
    const { pathname } = useLocation();
    let byjusGridRef = useRef();
    const condensed = match.path !== pathname;
    const selectedRequestId = pathname.split("/")[3];

    const formatters = () => ({
        requestIdFormatter: (cell, row) => {
            return <Link to={{ pathname: `devops-infra-requests/${row.requestId}` }}>{startCase(cell)}</Link>
        },
        statusFormatter: (cell, row) => {
            return <Badge color={statusColourMap[cell]}>{cell}</Badge>
        }
    });

    const condensedColumns = [{
        dataField: 'requestId',
        text: 'DR Id',
        type: 'String',
        columnClassName: (col) => col === selectedRequestId ? "bg-highlight" : "",
        // width: '250',
        quickFilter: true,
        formatter: (cell, row) => {
            return (
                <Link to={{ pathname: `${cell}` }}>
                    {`${startCase(cell)} - ${upperCase(row.application)}`}
                    <span className="text-truncate text-dark float-right">
                        <Badge color={statusColourMap[row.status]}>{row.status}</Badge>
                    </span>
                    <div className="d-flex justify-content-between">
                        <div className="text-secondary">
                            <small>{moment(row.createdAt).format("lll")}</small>
                        </div>
                    </div>
                </Link>
            )
        }
    }];

    const onClickCreate = () => {
        setShowCreateForm(true);
    }

    const onClickClose = () => {
        setShowCreateForm(false);
    }

    const refreshGrid = () => {
        byjusGridRef && byjusGridRef.current && byjusGridRef.current.refreshGrid();
    }

    const myTicketsDetails = async () => {
        const status = ['created', 'approved', 'in_progress']
        const data = [{
            selectedColumn: 'toBeDeployedBy',
            selectedOperator: 'equal',
            selectedValue: user.email
        }, {
            selectedColumn: 'status',
            selectedOperator: 'in',
            selectedValue: status
        }]
        setSearchCriterias(data)
    }

    const openTicketsDetails = () => {
        const status = ['created', 'approved', 'in_progress']
        const data = [{
            selectedColumn: 'status',
            selectedOperator: 'in',
            selectedValue: status
        }]
        setSearchCriterias(data)
    }

    const getActions = () => {
        return [{
            title: 'My Tickets',
            onClick: () => myTicketsDetails()
        },
        {
            title: 'Open Tickets',
            onClick: () => openTicketsDetails()
        }];
    }

    const buildToolbarItems = () => {
        const canCreateDr = validatePermission(user, [deploymentRequest.createDeploymentRequest]);
        const canFilterDr = validatePermission(user, [deploymentRequest.filterDeploymentRequest]);

        if (condensed) {
            return <></>
        }

        return (<>
            <div>
                {canFilterDr && <ByjusDropdown defaultTitle="Ticket Filter" type="simple" items={getActions()} />}{" "}
                {canCreateDr && <Button color="success" onClick={onClickCreate}>
                    <i className="fa fa-plus"></i> {' '}Create</Button>}
            </div>
        </>)
    }

    return (
        <Box>
            <BoxBody>
                <SplitViewContainer
                    ref={byjusGridRef}
                    gridId={`devops_infra_request_base_grid`}
                    modelName="DevopsInfraRequest"
                    gridDataUrl={`/usermanagement/analyticsmanagement/deploymentrequest/list`}
                    formatters={formatters()}
                    toolbarItems={buildToolbarItems()}
                    condensed={condensed}
                    condensedColumns={condensedColumns}
                    sort={{ 'createdAt': 'desc' }}
                    searchCriterias={{ conditionType: "$and", searchBuilder: searchCriterias }}
                >
                    < DeploymentRequestRouter refreshGrid={refreshGrid} />
                </SplitViewContainer>
                {showCreateForm &&
                    < DeploymentRequestForm
                        onClose={onClickClose}
                        refreshGrid={refreshGrid}
                    />}
            </BoxBody>
        </Box>
    )
}

const mapStateToProps = state => ({
    user: state.auth.user
});

export default connect(mapStateToProps)(DeploymentRequestList);
import React from 'react';
import { connect } from 'react-redux';
import { get } from 'lodash';
import { Button } from 'reactstrap';
import { Link } from 'react-router-dom';
import moment from 'moment';
import Notify from 'react-s-alert';

import ByjusDropdown from 'components/ByjusDropdown';
import { Box, BoxHeader, BoxBody } from 'components/box';
import ByjusGrid from 'modules/core/components/grid/ByjusGrid';

import EmployeeSnapshotList from './EmployeeSnapshotList'
import { cycleNameFormatter } from 'utils/componentUtil';
import EmployeeSnapshotWorkflowModal from './EmployeeSnapshotWorkflowModal'
import { callApi } from 'store/middleware/api';
import { sales } from "lib/permissionList";

class EmployeeSnapshotWorkflow extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            showEmloyeeWarningModal: false,
            cycleData: null
        };
    }

    refreshGrid = () => {
        const byjusGrid = this.refs.snapshotStatusGrid;
        byjusGrid.onClickRefresh();
    }

    handleApproveCycle = (cycleName) => {
        this.setState({
            showCycleApprovalModal: true,
            cycleData: cycleName
        })
    }

    closeModal = () => {
        this.setState({
            showCycleApprovalModal: false,
        });
    };
    getColumns = () => {
        return [{
            dataField: 'cycleName',
            filterType: 'TEXT',
            text: 'Cycle Name',
            width: 220,
            formatter: (cell, row) => {
                const { cycleName } = row;
                return cycleNameFormatter(cycleName);
            },
            quickFilter: true
        }, {
            dataField: 'snapshotTakenAt',
            text: 'Snapshot Taken At',
            formatter: (cell, row) => {
                const { employeeSnapshotWorkflow } = row;
                const snapshotApprovedAt = get(employeeSnapshotWorkflow, 'snapshotApprovedAt', '');
                const status = get(employeeSnapshotWorkflow, 'status');
                const snapshotTakenAt = get(employeeSnapshotWorkflow, 'snapshotTakenAt', '');
                if (snapshotTakenAt) {
                    const date = (moment(snapshotTakenAt).toDate())
                    return (
                        <>
                            {
                                status === "review_pending" ?
                                    <span className="badge  badge-pill badge-danger ml-2 mr-3">{moment(date).format("YYYY-MM-DD H:mm:ss")}</span>
                                    : <span>{moment(date).format("YYYY-MM-DD H:mm:ss")}</span>
                            }
                        </>
                    )
                }
            }
        }, {
            dataField: 'snapshotApprovedAt',
            text: 'Snapshot Approved At',
            formatter: (cell, row) => {
                const { employeeSnapshotWorkflow } = row;
                const snapshotApprovedAt = get(employeeSnapshotWorkflow, 'snapshotApprovedAt', '');
                const status = get(employeeSnapshotWorkflow, 'status');
                if (snapshotApprovedAt) {
                    const date = (moment(snapshotApprovedAt).toDate())
                    return (
                        <>
                            {
                                status === "approved" ?
                                    <span className="badge  badge-pill badge-info ml-2 mr-3">{moment(date).format("YYYY-MM-DD H:mm:ss")}</span>
                                    : <span>{moment(date).format("YYYY-MM-DD H:mm:ss")}</span>
                            }
                        </>
                    )
                }
            }
        }, {
            dataField: 'snapshotModifiedAt',
            text: 'Snapshot Modified At',
            formatter: (cell, row) => {
                const { employeeSnapshotWorkflow } = row;
                const snapshotModifiedAt = get(employeeSnapshotWorkflow, 'snapshotModifiedAt', '');
                const status = get(employeeSnapshotWorkflow, 'status');
                if (snapshotModifiedAt) {
                    const date = (moment(snapshotModifiedAt).toDate())
                    return (
                        <>
                            {
                                status === "modified" ?
                                    <span className="badge  badge-pill badge-warning ml-2 mr-2">
                                        {moment(date).format("YYYY-MM-DD H:mm:ss")}
                                    </span>
                                    : <span>{moment(date).format("YYYY-MM-DD H:mm:ss")}</span>
                            }
                        </>
                    )
                }
            }
        }, {
            dataField: 'status',
            text: 'Status',
            width: 150,
            formatter: (cell, row) => {
                const { employeeSnapshotWorkflow } = row;
                const status = get(employeeSnapshotWorkflow, 'status');

                return (
                    <>
                        {
                            status === "approved" ?
                                <span className="badge  badge-pill badge-info ml-2 mr-2">Approved</span>
                                : status === "modified" ?
                                    <span className="badge  badge-pill badge-warning ml-2 mr-2">Modified</span>
                                    : <span className="badge  badge-pill badge-danger ml-2 mr-2">Review Pending</span>
                        }
                    </>
                )
            }
        },{
            dataField: 'actions',
            isDummyField: true,
            text: 'Actions',
            width: 120,
            formatter: (cell, row) => {
                const { history } = this.props;
                const { employeeSnapshotWorkflow, cycleName } = row;
                const status = get(employeeSnapshotWorkflow, 'status');
                const permissionList = get(this.props.user, 'permissions', []);
                const editEmployeeSnapshot = permissionList.includes(sales.editSalesSnapshotCard);
                const enableApproveButton = (["review_pending","modified"].includes(status) || !status) ? true : false;

                if (editEmployeeSnapshot) {
                    return (
                            <ByjusDropdown
                                type="simple"
                                defaultTitle="Actions"
                                titleIcon="fa fa-gear"
                                items={[
                                    {
                                        title: 'Snapshot',
                                        icon: 'fa fa-users',
                                        onClick: () => { history.push(`es-snapshot/${cycleName}`); }
                                    }, {
                                        title: 'View History',
                                        icon: 'fa fa-eye',
                                        onClick: () => { history.push(`es-history/${cycleName}`); }
                                    }, {
                                        title: 'Report',
                                        icon: 'fa fa-envelope',
                                        onClick: () => { this.handleDownloadReport(cycleName) },
                                        disabled: status === 'published'
                                    }, {
                                        title: 'Approve Cycle',
                                        icon: 'fa fa-check',
                                        disabled: !enableApproveButton,
                                        onClick: () => { this.handleApproveCycle(cycleName) },
                                    }]} />
                    );
                }
                return (
                    <center>
                        <Link to={{ pathname: `es-snapshot/${cycleName}` }} >
                            <Button size="sm" color="info">
                                <i className="fa fa-users" />
                            </Button>
                        </Link>
                    </center>
                )
            }
        }];
    }

    handleDownloadReport = (cycleName) => {
        const body = {
            cycleName
        };

        callApi(`/usermanagement/employeesnapshot/downloadReport`, 'POST', body, null, null, true)
            .then(response => {
                Notify.success(`Employee Snapshot report has been initiated. You will get the mail once the report is generated.`);
            })
    }

    render() {
        const { showCycleApprovalModal, cycleData } = this.state;
        const columns = this.getColumns();
        const gridDataUrl = `/usermanagement/employeesnapshot/getSnapshotWorkflow?filterBy=${"weekly"}`;

        return (
            <Box>
                {/*<BoxHeader><b>Employee Snapshot Workflow</b></BoxHeader>*/}
                <BoxBody >
                    <ByjusGrid
                        ref="snapshotStatusGrid"
                        columns={columns}
                        modelName="AchieveAnalytics"
                        gridDataUrl={gridDataUrl}
                        sort={{ cycleEnd: "desc" }}
                    />
                    {showCycleApprovalModal &&
                        <EmployeeSnapshotWorkflowModal
                            cycleData={cycleData}
                            closeModal={() => { this.closeModal() }}
                            refreshGrid={this.refreshGrid}
                        />}
                </BoxBody>
            </Box >
        );
    }
}

const mapStateToProps = state => ({
    user: state.auth.user
});

export default connect(mapStateToProps)(EmployeeSnapshotWorkflow);

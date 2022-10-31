import React, { Component, Fragment } from 'react'
import { Link } from 'react-router-dom'
import { get } from 'lodash';
import { Button } from 'reactstrap';
import Notify from "react-s-alert";

import { callApi } from 'store/middleware/api';
import { Box, BoxHeader, BoxBody } from 'components/box';
import ByjusGrid from 'modules/core/components/grid/ByjusGrid';

class AppGroupUserList extends Component {
    constructor(props) {
        super(props)
        this.state = {
            itemData: null
        }
    }

    buildToolbarItems = (groupData) => {
        return (
            <Fragment>
                <Link
                    to={{
                        pathname: `/settings/app-groups/${get(groupData, 'appGroupName', '')}/assign`,
                        state: { operation: "assign", groupData }
                    }}
                    className="btn btn-success btn-sm mr-2">
                    <i className="fa fa-plus"></i> {' '}Assign
                </Link>{' '}
                <Link
                    to={{
                        pathname: `/settings/app-groups/${get(groupData, 'appGroupName', '')}/unassign`,
                        state: { operation: "unassign", groupData }
                    }}
                    className="btn btn-danger btn-sm">
                    <i className="fa fa-minus"></i> {' '}Un-Assign
                </Link>
            </Fragment>
        )
    }

    onClickUnAssignActionBtn = async (email) => {
        const { groupData } = this.state;
        const { byjusGrid } = this.refs;

        const payload = {
            appGroupName: get(groupData, 'appGroupName'),
            appName: 'ums',
            emails: [email]
        }

        this.setState({ loading: true, error: null });
        await callApi(`/usermanagement/appgroup/unassign`, "POST", payload, null, null, true)
            .then(async (res) => {
                Notify.success(`Successfully UnAssigned ${get(groupData, 'appGroupName', '')} Group`);
                this.setState({ loading: false, error: null });
                byjusGrid && byjusGrid.onClickRefresh();
            })
            .catch((err) => {
                this.setState({ loading: false, error: err });
            });
    }

    getColumns = () => {
        return [{
            dataField: 'email',
            text: 'Email',
            quickFilter: true
        }, {
            dataField: '',
            text: 'Actions',
            width: '100px',
            formatter: (cell, row) => {
                const { email } = row;
                return (
                    <Button color="danger"
                        onClick={() => this.onClickUnAssignActionBtn(email)}
                    >
                        <i className="fa fa-minus"></i>
                    </Button >
                )
            }
        }];
    }

    componentWillMount = () => {
        const { groupData } = get(this.props, 'location.state');
        this.setState({ groupData });
    }

    render() {
        const { loading, error, groupData } = this.state;
        let columns = this.getColumns();

        return (
            <Box>
                <BoxHeader heading={`Group : ${get(groupData, 'appGroupName', '')}`} closeBtn={true} />
                <BoxBody loading={loading} error={error}>
                    <ByjusGrid ref="byjusGrid"
                        columns={columns}
                        toolbarItems={this.buildToolbarItems(groupData)}
                        modelName="AppUser"
                        contextCriterias={[{
                            selectedColumn: "groups",
                            selectedOperator: "equal",
                            selectedValue: get(groupData, 'appGroupName', '')
                        }]}
                        gridId='appUserGrid'
                        gridDataUrl={`/usermanagement/appuser/list`}
                    />
                </BoxBody>
            </Box>
        )
    }
}

export default AppGroupUserList;
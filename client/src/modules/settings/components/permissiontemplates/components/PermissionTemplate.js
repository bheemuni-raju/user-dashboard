import React, { Component, Fragment } from 'react'
import { Link } from 'react-router-dom'
import { get } from 'lodash';
import { Button } from 'reactstrap';
import Notify from "react-s-alert";

import { callApi } from 'store/middleware/api';
import { Box, BoxHeader, BoxBody } from 'components/box';
import ByjusGrid from 'modules/core/components/grid/ByjusGrid';

class UserList extends Component {
    constructor(props) {
        super(props)
        this.state = {
            itemData: null
        }
    }

    buildToolbarItems = (templateData) => {
        return (
            <Fragment>
                <Link
                    to={{
                        pathname: `${get(templateData, 'formatted_name', '')}/assign`,
                        state: { operation: "assign", templateData }
                    }}
                    className="btn btn-success btn-sm mr-2">
                    <i className="fa fa-plus"></i> {' '}Assign
                </Link>{' '}
                <Link
                    to={{
                        pathname: `${get(templateData, 'formatted_name', '')}/unassign`,
                        state: { operation: "unassign", templateData }
                    }}
                    className="btn btn-danger btn-sm">
                    <i className="fa fa-minus"></i> {' '}Un-Assign
                </Link>
            </Fragment>
        )
    }

    onClickUnAssignActionBtn = async (email) => {
        const { templateData } = this.state;
        const { byjusGrid } = this.refs;

        const payload = {
            templateFormattedName: get(templateData, 'formatted_name'),
            emails: [email]
        }

        this.setState({ loading: true, error: null });
        await callApi(`/usermanagement/permission/permissionTemplate/unassign`, "POST", payload, null, null, true)
            .then(async (res) => {
                Notify.success(`Successfully UnAssigned ${get(templateData, 'name', '')} Template`);
                this.setState({ loading: false, error: null });
                byjusGrid && byjusGrid.onClickRefresh();
            })
            .catch((err) => {
                this.setState({ loading: false, error: err });
            });
    }

    getColumns = () => {
        return [{
            dataField: 'name',
            text: 'Name',
            quickFilter: true,
            formatter: (cell, row) => {
                return (
                    <div>
                        <Link
                            to={{ pathname: `/user/${row.email}/edit` }}
                        >{cell}</Link>
                    </div>
                )
            }
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
        }, {
            dataField: 'email',
            text: 'Email',
            quickFilter: true
        }, {
            dataField: 'campaign',
            text: 'Campaign',
            quickFilter: true
        }];
    }

    componentWillMount = () => {
        const { templateData } = get(this.props, 'location.state');
        this.setState({ templateData });
    }

    render() {
        const { loading, error, templateData } = this.state;
        let columns = this.getColumns();

        return (
            <Box>
                <BoxHeader heading={`Template : ${get(templateData, 'name', '')}`} closeBtn={true} />
                <BoxBody loading={loading} error={error}>
                    <ByjusGrid ref="byjusGrid"
                        columns={columns}
                        toolbarItems={this.buildToolbarItems(templateData)}
                        modelName="MasterEmployee"
                        contextCriterias={[{
                            selectedColumn: "permissionTemplate",
                            selectedOperator: "in",
                            selectedValue: [get(templateData, 'formatted_name', null)]
                        }]}
                        gridId='userGrid'
                        gridDataUrl={`/usermanagement/employee/listMasterData`}
                    />
                </BoxBody>
            </Box>
        )
    }
}

export default UserList;

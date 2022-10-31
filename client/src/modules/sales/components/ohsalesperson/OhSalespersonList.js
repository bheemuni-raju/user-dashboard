import React from 'react';
import { Button } from 'reactstrap';
import moment from 'moment';
import { connect } from 'react-redux';
import { get, isEmpty } from 'lodash';
import Notify from 'react-s-alert';

import ByjusGrid from 'modules/core/components/grid/ByjusGrid';
import { callApi } from 'store/middleware/api';
import { Box, BoxHeader, BoxBody } from 'components/box';

import OhSalespersonModal from './OhSalespersonModal';
import { businessDevelopment, validatePermission } from 'lib/permissionList';

class OhSalespersonList extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            showCreateModal: false,
            showEditModal: false,
            ohUserData: null
        }
    }

    buildToolbarItems = () => {
        let { user = {} } = this.props;
        const createFlag = validatePermission(user, businessDevelopment.createBDEmployees);

        return (
            <>
                <Button className="btn btn-success btn-sm" hidden={!createFlag} onClick={this.onClickCreateInOH}>
                    <i className="fa fa-plus"></i> {' '} Create User in OH
                </Button>{' '}
                <Button className="btn btn-success btn-sm" hidden={!createFlag} onClick={this.onClickCreateInUMS}>
                    <i className="fa fa-plus"></i> {' '} Add OH User in UMS
                </Button>{' '}
            </>
        )
    }

    onClickCreateInUMS = () => {
        this.setState({ showCreateUMSModal: true, modalType: "createUMSModal" });
    }

    onClickCreateInOH = () => {
        this.setState({ showCreateOHModal: true, modalType: "createOHModal" });
    }

    onClickEdit = (row) => {
        this.setState({ showEditModal: true, ohUserData: row, modalType: "editModal" });
    }

    closeModal = () => {
        const { ohSalesGrid } = this.refs;

        this.setState({ showCreateOHModal: false, showCreateUMSModal: false, showEditModal: false, ohUserData: null });
        ohSalesGrid && ohSalesGrid.onClickRefresh()
    }

    getOHSalesColumns = () => {
        let { user = {} } = this.props;
        const editFlag = validatePermission(user, businessDevelopment.editBDEmployees);

        const columns = [{
            dataField: 'username',
            text: 'Email',
            quickFilter: true,
            formatter: (cell) => {
                return cell && cell.toLowerCase()
            }
        }, {
            dataField: 'userId',
            text: 'OH User Id',
            quickFilter: true
        }, {
            dataField: 'employee_code',
            text: 'Tnl Id',
            quickFilter: true
        }, {
            dataField: '',
            width: '150',
            text: 'Actions',
            formatter: (cell, row) => {
                return (
                    <>
                        <Button color="info" size="sm" hidden={!editFlag} onClick={() => this.onClickEdit(row)}>
                            <i className="fa fa-pencil" /> Edit
                        </Button>{' '}
                    </>
                )
            }
        }, {
            dataField: 'createdAt',
            text: 'Created At',
            formatter: (cell) => {
                return cell ? moment(cell).format('LLL') : '';
            }
        }];

        return columns;
    }

    render() {
        const { showCreateOHModal, showCreateUMSModal, showEditModal, ohUserData, loading, error, modalType } = this.state;
        const columns = this.getOHSalesColumns();

        return (
            <Box>
                {/*<BoxHeader><b>OH Sales Person List</b></BoxHeader>*/}
                <BoxBody loading={loading} error={error}>
                    <ByjusGrid ref="ohSalesGrid"
                        columns={columns}
                        toolbarItems={this.buildToolbarItems()}
                        modelName="OrderhiveSalesperson"
                        gridDataUrl={`/usermanagement/orderhiveSalesperson/orderhive/list`}
                        sort={{ username: "1" }}
                    />
                    {(showCreateOHModal || showCreateUMSModal || showEditModal) &&
                        <OhSalespersonModal
                            ohUserData={ohUserData}
                            closeModal={this.closeModal}
                            modalType={modalType}
                        />}
                </BoxBody>
            </Box>
        );
    }

}

const mapStateToProps = (state) => ({
    user: get(state, 'auth.user')
});

export default connect(mapStateToProps)(OhSalespersonList)

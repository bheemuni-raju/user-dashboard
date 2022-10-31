import React, { Component, Fragment } from 'react'
import { connect } from 'react-redux'
import { Button } from 'reactstrap'
import moment from 'moment';
import { Link } from 'react-router-dom'
import { startCase, upperCase, get, concat, isEmpty, orderBy, map } from 'lodash';
import { Alert } from 'antd';

import TabBuilder from 'modules/core/components/TabBuilder';
import { Box, BoxHeader, BoxBody } from 'components/box';
import ByjusGrid from 'modules/core/components/grid/ByjusGrid';
import ModalWindow from 'components/modalWindow';
import { callApi } from 'store/middleware/api'
import Confirm from 'components/confirm';
import { businessDevelopment, validatePermission } from 'lib/permissionList';

import UserHistory from 'modules/user/components/UserHistory';
import QuickSearch from './QuickSearch';
import ContactDetailForm from './ContactDetailForm';
import UpdateEmailModal from './UpdateEmailModal';
import ContactImage from 'assets/user/contact.png'

class EmployeeList extends Component {
    constructor(props) {
        super(props);
        this.state = {
            loading: false,
            error: null,
            salesDetails: null
        }
    }

    buildToolbarItems = () => {
        const { user = {}, subDepartment } = this.props;
        let toPath = isEmpty(subDepartment) ? `create/business_development` : `create/business_development/${get(subDepartment, "formattedName")}`;
        const createFlag = validatePermission(user, businessDevelopment.createBDEmployees);

        return (
            <>
                <Link className="btn btn-success btn-sm" hidden={!createFlag} to={toPath}>
                    <i className="fa fa-plus"></i> {' '}Create
                </Link>{' '}
            </>
        )
    }

    onClickRoleHistory = (selectedRow) => {
        const { history } = selectedRow;
        const roleHistory = history && history
            .filter(entry => !!(entry.changes && entry.changes.role))
            .map(entry => ({ ...entry, changes: { role: entry.changes.role } }));
        this.setState({ showRoleHistory: true, selectedRow, roleHistory })
    }

    getListColumns = () => {
        let { user = {} } = this.props;
        const editFlag = validatePermission(user, businessDevelopment.editBDEmployees);

        let columns = [{
            dataField: 'name',
            text: 'Name',
            formatter: (cell, row) => {
                let subDepartment = isEmpty(get(row, "subDepartment")) ? undefined : row.subDepartment;

                if (editFlag) {
                    return <Link
                        to={{ pathname: `${row._id}/${subDepartment}/edit` }}
                    >{startCase(cell)}</Link>
                }
                else {
                    startCase(cell);
                }
            },
            quickFilter: true
        }, {
            dataField: '',
            width: '100',
            text: 'Actions',
            formatter: (cell, row) => {
                let subDepartment = isEmpty(get(row, "subDepartment")) ? undefined : row.subDepartment;
                return (
                    <>
                        <Link
                            to={{ pathname: `${row._id}/${subDepartment}/edit` }}
                            hidden={!editFlag}
                            className="btn btn-primary btn-sm"
                        ><i className="fa fa-pencil" /></Link>
                    </>
                )
            }
        }, {
            dataField: 'status',
            text: 'Status',
            formatter: (status) => {
                status = startCase(status);
                const styleMap = {
                    'Active': 'green',
                    'Left': 'red',
                    'Training': 'blue',
                    'Longleave': '#bebf50',
                    'Campaign Training': 'pink',
                    'Non Sales': 'maroon'
                }

                return <div style={{ color: styleMap[status] }}>{status}</div>
            },
            quickFilter: true
        }, {
            dataField: 'contactDetails',
            text: 'Contact Details',
            width: '300',
            formatter: (contactDetails, row) => {
                const contacts = map(contactDetails, 'contactNo');
                return <>
                    <Button color="link" size="sm" className="ml-2" onClick={() => this.setState({ showContactDialog: true, selectedRow: row })}>
                        <i className="fa fa-pencil" />
                    </Button>{" "}
                    <span>{contacts.join()}</span>
                </>
            }
        }, {
            dataField: 'tnlId',
            text: 'TnL Id',
            formatter: (cell) => {
                return cell && cell.toUpperCase();
            },
            quickFilter: true
        }, {
            dataField: 'email',
            text: 'Email',
            quickFilter: true,
            formatter: (email, row) => {
                let salesEmployee = (get(row, "subDepartment") === "sales");
                return <>
                    {editFlag && salesEmployee &&
                        <Button color="link" size="sm" className="ml-2" onClick={() => this.setState({ showUpdateEmailDialog: true, selectedRow: row })}>
                            <i className="fa fa-pencil" />
                        </Button>}{" "}
                    <span>{email}</span>
                </>
            }
        }, {
            dataField: 'role',
            text: 'Role',
            formatter: (role, row) => {
                return <>
                    <span>{role && role.name}</span>
                    <Button color="link" size="sm" className="ml-2" onClick={() => this.onClickRoleHistory(row)}>
                        <i className="fa fa-history" />
                    </Button>
                </>
            }
        },
        {
            dataField: 'doj',
            text: 'Date Of Joining',
            formatter: (cell) => {
                return cell && moment(cell).format('DD MMM YYYY');
            }
        },
        {
            dataField: 'campaign',
            text: 'Campaign',
            quickFilter: true
        }, {
            dataField: 'vertical',
            text: 'Vertical',
            quickFilter: true
        }, {
            dataField: 'department',
            text: 'Department',
            quickFilter: true
        }, {
            dataField: 'subDepartment',
            text: 'Sub Department',
            quickFilter: true
        }, {
            dataField: 'updateCounter',
            text: 'Update Counter'
        }];

        return columns;
    }

    getListPills = () => {
        const { subDepartment, roles } = this.props || {};

        let departmentFilter = [{
            selectedColumn: "department",
            selectedOperator: "in",
            selectedValue: ["business_development"]
        }];

        let contextCriterias = departmentFilter;

        if (!isEmpty(subDepartment)) {
            contextCriterias.push({
                selectedColumn: "subDepartment",
                selectedOperator: "in",
                selectedValue: [get(subDepartment, 'formattedName')]
            });
        }

        let subDepartmentFilter = [{
            selectedColumn: "subDepartment",
            selectedOperator: "in",
            selectedValue: [get(subDepartment, 'formattedName')]
        }];

        let activeStatusFilter = [{
            selectedColumn: "status",
            selectedOperator: "not_in",
            selectedValue: ['Left', 'left']
        }];

        let nonActiveStatusFilter = [{
            selectedColumn: "status",
            selectedOperator: "in",
            selectedValue: ['Left', 'left']
        }];

        let attritionDetailsFilter = {
            conditionType: "$and",
            conditions: this.getAttritionFilters("not_in")
        };

        let nonAttritionDetailsFilter = {
            conditionType: "$or",
            conditions: this.getAttritionFilters("in")
        };

        /**Creating pills based on hierarchy roles */
        let pills = [{
            title: 'All',
            contextCriterias
        }];

        roles && roles.map(role => {
            const roleFilter = [{
                selectedColumn: "role",
                selectedOperator: "in",
                selectedValue: [get(role, 'formattedName')]
            }];

            pills.push({
                title: startCase(get(role, 'name', '')),
                role: get(role, 'formattedName'),
                contextCriterias: concat(contextCriterias, activeStatusFilter, roleFilter)
            });
        });

        /**Adding a pill for left employees together irrespective of roles */
        pills.push({
            title: 'Left-AD Filled',
            contextCriterias: concat(subDepartmentFilter, nonActiveStatusFilter, attritionDetailsFilter)
        }, {
            title: 'Left-AD Not Filled',
            contextCriterias: concat(subDepartmentFilter, nonActiveStatusFilter, nonAttritionDetailsFilter)
        });

        return pills;
    }

    getAttritionFilters = (operator) => {
        let attritionFilters = [];
        let attritionKeys = ["filledByEmail", "relievingFormFilledDate", "typeOfSeperation", "reasonForSeperation", "primarySeperationReason", "dependentSeperationReason", "remarkSection", "summarySection", "reportingManager", "lessThanDRPS", "reportingManagerRating", "seniorManagerRating", "avpRating"]
        attritionKeys.map((item) => {
            attritionFilters.push({
                selectedColumn: "attritionDetails." + item,
                selectedOperator: operator,
                selectedValue: ["", null]
            })
        })

        return attritionFilters;
    }

    getSalesList = () => {
        const { salesDetails, searchCriterias = {} } = this.state;

        let columns = []
        let pills = []
        if (!isEmpty(salesDetails)) {
            columns = this.getListColumns();
            pills = this.getListPills();
        }

        return (salesDetails ?
            <ByjusGrid
                ref="byjusGrid"
                searchCriterias={searchCriterias}
                columns={columns}
                toolbarItems={this.buildToolbarItems()}
                modelName="Employee"
                gridTitle="BD Employees"
                pillOptions={{
                    pills,
                    defaultPill: 1
                }}
                gridId='userGrid'
                gridDataUrl={`/usermanagement/employee/list`}
                sort={{ email: 'asc' }}
            /> :
            <div style={{ margin: '1%' }}>
                < Alert type="success" message="Fetching Data" />
            </div>)
    }

    updateSearchCriterias = (filter) => {
        this.setState({ searchCriterias: filter })
    }

    refreshGrid = () => {
        const { byjusGrid } = this.refs;
        byjusGrid && byjusGrid.onClickRefresh();
    }

    componentDidMount = () => {
        const { subDepartment, roles } = this.props || {};
        let subDepartmentFormattedName = get(subDepartment, "formattedName", "");
        let salesDetails = {
            formattedName: subDepartmentFormattedName,
            roles
        };

        let showQuickSearch = !isEmpty(subDepartmentFormattedName);
        this.setState({ salesDetails, showQuickSearch });
    }

    render() {
        const { loading, error, salesDetails, showRoleHistory, selectedRow, roleHistory, showContactDialog, showUpdateEmailDialog, showQuickSearch } = this.state;

        return (
            <Box>
                {/*<BoxHeader><b>Employee List</b></BoxHeader>*/}
                <BoxBody loading={loading} error={error}>
                    {showQuickSearch && <QuickSearch salesDetails={salesDetails} updateSearchCriterias={this.updateSearchCriterias} />}
                    {this.getSalesList()}
                    {showRoleHistory && <UserHistory history={roleHistory} userData={selectedRow} closeModal={() => this.setState({ showRoleHistory: false })} />}
                    {showContactDialog &&
                        <ModalWindow
                            showModal={true}
                            heading={`${get(selectedRow, 'email')} - Update Contact details`}
                            closeModal={() => this.setState({ showContactDialog: false })}
                            //image={ContactImage}
                            size="sm"
                        >
                            <ContactDetailForm
                                userData={selectedRow}
                                closeModal={() => this.setState({ showContactDialog: false })}
                                refreshGrid={this.refreshGrid}
                            />
                        </ModalWindow>
                    }
                    {showUpdateEmailDialog &&
                        <ModalWindow
                            showModal={true}
                            heading={`Update User Email`}
                            closeModal={() => this.setState({ showUpdateEmailDialog: false })}
                            size="sm"
                        >
                            <UpdateEmailModal
                                userData={selectedRow}
                                user={this.props.user}
                                closeModal={() => this.setState({ showUpdateEmailDialog: false })}
                                refreshGrid={this.refreshGrid}
                            />
                        </ModalWindow>
                    }
                </BoxBody>
            </Box>
        )
    }
}

const mapStateToProps = (state) => ({
    user: get(state, 'auth.user')
});

export default connect(mapStateToProps)(EmployeeList);

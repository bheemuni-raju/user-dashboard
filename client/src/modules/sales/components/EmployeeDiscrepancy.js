import React, { Component } from 'react'
import { get, startCase, orderBy } from 'lodash';
import { Link } from 'react-router-dom';
import { Alert } from 'reactstrap';
import moment from 'moment';

import { Box, BoxHeader, BoxBody } from 'components/box';
import { callApi } from 'store/middleware/api'
import ByjusGrid from 'modules/core/components/grid/ByjusGrid';

class EmployeeDiscrepancy extends Component {
    constructor(props) {
        super(props);
        this.state = {
            loading: false,
            error: null,
            salesDetails: null
        }
    }


    getPills = () => {
        const { salesDetails } = this.state;
        const { roles } = salesDetails || [];

        let roleList = [];

        let hierarchyRoles = roles && roles.filter(role => get(role, 'type') == "HIERARCHY");
        hierarchyRoles = orderBy(hierarchyRoles, ['level'], ['asc']);
        hierarchyRoles.forEach((ele) => ["bda", "bdat", "bdt"].includes(ele.formattedName) && roleList.push(ele.formattedName))

        const roleFilter = {
            selectedColumn: "role",
            selectedOperator: "in",
            selectedValue: roleList
        };

        const subDepartmentFilter = {
            selectedColumn: "subDepartment",
            selectedOperator: "in",
            selectedValue: [get(salesDetails, 'formattedName')]
        };

        const verticalFilter = {
            selectedColumn: "vertical",
            selectedOperator: "in",
            selectedValue: ["DS Weekend", "JEE Weekend", "DS Weekend-CAT+IAS", "Special Campaign", "JEE-Weekend", "Offline Campaign"]
        };

        const locationFilter = {
            selectedColumn: "location",
            selectedOperator: "not_in",
            selectedValue: ["Middle East"]
        };

        return [
            {
                title: 'CM',
                contextCriterias: [{
                    conditionType: "$and",
                    conditions: [{
                        selectedColumn: 'contactDetails.0.contactNo',
                        selectedOperator: 'not_exists'
                    }, {
                        selectedColumn: 'status',
                        selectedOperator: 'not_in',
                        selectedValue: ["Left", "left"]
                    },
                        subDepartmentFilter,
                        roleFilter,
                        verticalFilter,
                        locationFilter
                    ]
                }]
            },
            {
                title: 'DOJM',
                contextCriterias: [{
                    conditionType: "$and",
                    conditions: [{
                        conditionType: "$or",
                        conditions: [
                            {
                                selectedColumn: 'doj',
                                selectedOperator: 'in',
                                selectedValue: ["", null]
                            }, {
                                selectedColumn: 'doj',
                                selectedOperator: 'not_exists'
                            }]
                    },
                        subDepartmentFilter,
                        roleFilter,
                        verticalFilter,
                        locationFilter]
                }]
            },
            {
                title: 'LWDM',
                contextCriterias: [{
                    conditionType: "$and",
                    conditions: [{
                        conditionType: "$or",
                        conditions: [
                            {
                                selectedColumn: 'lastWorkingDate',
                                selectedOperator: 'in',
                                selectedValue: ["", null]
                            }, {
                                selectedColumn: 'lastWorkingDate',
                                selectedOperator: 'not_exists'
                            }]
                    },
                    {
                        selectedColumn: 'status',
                        selectedOperator: 'in',
                        selectedValue: ["Left", "left"]
                    },
                        subDepartmentFilter,
                        roleFilter,
                        verticalFilter,
                        locationFilter]
                }]
            }, {
                title: 'FFM',
                contextCriterias: [{
                    conditionType: "$and",
                    conditions: [{
                        conditionType: "$or",
                        conditions: [
                            {
                                selectedColumn: 'attritionDetails.relievingFormFilledDate',
                                selectedOperator: 'in',
                                selectedValue: ["", null]
                            }, {
                                selectedColumn: 'attritionDetails.relievingFormFilledDate',
                                selectedOperator: 'not_exists'
                            }]
                    },
                    {
                        selectedColumn: 'status',
                        selectedOperator: 'in',
                        selectedValue: ["Left", "left"]
                    },
                        subDepartmentFilter,
                        roleFilter,
                        verticalFilter,
                        locationFilter]
                }]
            }, {
                title: "VM",
                contextCriterias: [{
                    selectedColumn: 'vertical',
                    selectedOperator: 'in',
                    selectedValue: ["", null]
                }]
            }
        ]
    }

    getSalesSubDepartmentDetails = () => {
        const bodyPayload = {
            name: "sales"
        }

        this.setState({ loading: true, error: null });
        callApi(`/usermanagement/hierarchy/subDepartment/details`, 'POST', bodyPayload, null, null, true)
            .then(response => {
                this.setState({ salesDetails: response, loading: false, error: null })
            })
            .catch(error => {
                this.setState({ loading: false, error });
            })

    }

    getColumns = () => {
        let columns = [{
            dataField: 'name',
            text: 'Name',
            formatter: (cell, row) => {
                return <Link
                    to={{ pathname: `${row._id}/sales/edit` }}
                >{startCase(cell)}</Link>
            },
            quickFilter: true
        },
        {
            dataField: 'status',
            text: 'Status',
            formatter: (status) => {
                status = startCase(status);
                const styleMap = {
                    'Active': 'green',
                    'Left': 'red',
                    'Training': 'blue',
                    'Long Leave': '#bebf50',
                    'Campaign Training': 'pink',
                    'Non Sales': 'maroon'
                }

                return <div style={{ color: styleMap[status] }}>{status}</div>
            },
            quickFilter: true
        },
        {
            dataField: 'tnlId',
            text: 'TnL Id',
            formatter: (cell) => {
                return cell && cell.toUpperCase();
            },
            quickFilter: true
        }, 
        {
            dataField: 'email',
            text: 'Email',
            quickFilter: true
        }, 
        {
            dataField: 'contacts',
            text: 'Contact',
            formatter: (cell) => {
                return cell && cell.join();
            }
        },
        {
            dataField: 'role',
            text: 'Role',
            formatter: (role, row) => {
                return <>
                    <span>{role && role.name}</span>
                </>
            }
        },
        {
            dataField: 'department.name',
            text: 'Department'
        }, 
        {
            dataField: 'subDepartment.name',
            text: 'Sub Department'
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
        }, 
        {
            dataField: 'vertical',
            text: 'Vertical',
            quickFilter: true
        }, 
        {
            dataField: 'lastWorkingDate',
            text: 'Last Working Date',
            formatter: (cell) => {
                return cell && moment(cell).format('DD MMM YYYY');
            }
        }, 
        {
            dataField: 'attritionDetails.relievingFormFilledDate',
            text: 'Form Filled Date'
        },        {
            dataField: 'selfReconciliationDetails.agentStatus',
            text: 'Agent Status',
            quickFilter: true
        },
        {
            dataField: 'selfReconciliationDetails.agentRemarks',
            text: 'Agent Remarks',
            quickFilter: true
        },
        {
            dataField: 'selfReconciliationDetails.raisedAt',
            text: 'Raised At',
            formatter: (cell, row) => {
                const { selfReconciliationDetails = {}} = row;
                const { raisedAt = ""} = selfReconciliationDetails
                return raisedAt && moment(raisedAt).format('DD MMM YYYY');
            }
        }];

        return columns;
    }

    onPillChange = selectedPill => {
        this.setState({
            currentSelectedPill: selectedPill.title
        });
    };

    componentDidMount = () => {
        console.log('inside component did  mount')
        this.getSalesSubDepartmentDetails();
    }

    render() {
        const { loading, error, salesDetails } = this.state;
        const pills = this.getPills();
        const columns = this.getColumns();
        const gridDataUrl = `/usermanagement/employee/list`;

        return (
            <Box>
                <BoxBody loading={loading} error={error}>
                    {salesDetails ?
                        <>
                            <Alert color="info">
                                CM - Contact Missing,
                                DOJM - Date of Joining Missing,
                                LWDM - Last Working Date Missing,
                                FFM - Form Filled Date Missing,
                                VM - Vertical Missing
                            </Alert>
                            <ByjusGrid
                                ref="orderGrid"
                                columns={columns}
                                modelName="AchieveOrder"
                                gridDataUrl={gridDataUrl}
                                pillOptions={{
                                    pills,
                                    onPillChange: this.onPillChange
                                }}
                                sort={{ createdAt: 'desc' }}
                            />
                        </> :
                        <div>Fetching Details</div>
                    }
                </BoxBody>
            </Box>
        )
    }
}

export default EmployeeDiscrepancy;

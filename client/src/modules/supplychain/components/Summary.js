import React from 'react';
import { Drawer } from 'antd';
import { Link } from 'react-router-dom';
import { Alert } from 'reactstrap';
import { get, startCase, sortBy } from 'lodash';

import ByjusGrid from "modules/core/components/grid/ByjusGrid";
import FormBuilder from "components/form/FormBuilder";
import { Box, BoxBody } from 'components/box';
import { connect } from 'react-redux';
import { callApi } from 'store/middleware/api';

class Summary extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            formValues: {
                filterByRole: 'manager',
                filterBySubDept: 'digital_finance'
            }
        }
    }

    getColumns = () => {
        return [{
            text: 'Email',
            dataField: 'email',
            width: '200',
            className: 'td-header-info',
            columnClassName: 'td-column-info',
            quickFilter: true,
            formatter: (cell, row) => {
                return (
                    <Link to={{ pathname: `reporters/list/${cell}` }} target="_blank" >{cell}</Link>
                )
            }
        }, {
            text: 'TR',
            width: '100',
            dataField: 'totalReportersCount',
            className: 'td-header-warning'
        }, {
            text: 'Interns',
            width: '100',
            dataField: 'internCount',
            className: 'td-header-warning',
            formatter: (cell, row) => this.reporterCountFormatter(cell, row, 'isIntern')
        }, {
            text: 'OAs',
            width: '100',
            dataField: 'officeAssistantCount',
            className: 'td-header-warning',
            formatter: (cell, row) => this.reporterCountFormatter(cell, row, 'isOfficeAssistant')
        }, {
            text: 'Trainees',
            width: '100',
            dataField: 'traineeCount',
            className: 'td-header-warning',
            formatter: (cell, row) => this.reporterCountFormatter(cell, row, 'isTrainee')
        }, {
            text: 'Executives',
            width: '100',
            dataField: 'executiveCount',
            className: 'td-header-warning',
            formatter: (cell, row) => this.reporterCountFormatter(cell, row, 'isExecutive')
        }, {
            text: 'SEs',
            width: '100',
            dataField: 'seniorExecutiveCount',
            className: 'td-header-warning',
            formatter: (cell, row) => this.reporterCountFormatter(cell, row, 'isSeniorExecutive')
        }, {
            text: 'Associates',
            width: '150',
            dataField: 'associateCount',
            className: 'td-header-warning',
            formatter: (cell, row) => this.reporterCountFormatter(cell, row, 'isAssociate')
        }, {
            text: 'SAs',
            width: '100',
            dataField: 'seniorAssociateCount',
            className: 'td-header-warning',
            formatter: (cell, row) => this.reporterCountFormatter(cell, row, 'isSeniorAssociate')
        }, {
            text: 'TLs',
            width: '100',
            dataField: 'teamLeadCount',
            className: 'td-header-warning',
            formatter: (cell, row) => this.reporterCountFormatter(cell, row, 'isTeamLead')
        }, {
            text: 'AMs',
            width: '100',
            dataField: 'assistantManagerCount',
            className: 'td-header-warning',
            formatter: (cell, row) => this.reporterCountFormatter(cell, row, 'isAssistantManager')
        }, {
            text: 'Managers',
            width: '130',
            dataField: 'managerCount',
            className: 'td-header-warning',
            formatter: (cell, row) => this.reporterCountFormatter(cell, row, 'isManager')
        }, {
            text: 'SMs',
            width: '130',
            dataField: 'seniorManagerCount',
            className: 'td-header-warning',
            formatter: (cell, row) => this.reporterCountFormatter(cell, row, 'isSeniorManager')
        }, {
            text: 'AGMs',
            width: '130',
            dataField: 'assistantGeneralManagerCount',
            className: 'td-header-warning',
            formatter: (cell, row) => this.reporterCountFormatter(cell, row, 'isAssistantGeneralManager')
        }, {
            text: 'GMs',
            width: '130',
            dataField: 'generalManagerCount',
            className: 'td-header-warning',
            formatter: (cell, row) => this.reporterCountFormatter(cell, row, 'isGeneralManager')
        }, {
            text: 'AVPs',
            width: '130',
            dataField: 'assistantVicePresidentCount',
            className: 'td-header-warning',
            formatter: (cell, row) => this.reporterCountFormatter(cell, row, 'isAssistantVicePresident')
        }, {
            text: 'VPs',
            width: '130',
            dataField: 'vpCount',
            className: 'td-header-warning',
            formatter: (cell, row) => this.reporterCountFormatter(cell, row, 'isVp')
        }];
    }

    onClickSearch = () => {
        const searchForm = this.refs.searchForm;
        const formValues = searchForm.getFormValues();
        this.setState({
            formValues
        });
    }

    componentDidMount = () => {
        this.getTeamDetails();
    }


    getTeamDetails = async () => {
        this.setState({ loading: true });
        await callApi(`/usermanagement/hierarchy/department/getDetails`, 'POST', {
            name: "supply_chain"
        }, null, null, true)
            .then(response => {
                this.setState({
                    subDepartments: response.subDepartments,
                    roles: response.roles,
                    loading: false,
                    error: null
                });
            })
            .catch(error => {
                this.setState({ error, loading: false });
            })
    }

    getSearchFields = () => {
        let { roles = [], subDepartments = [], formValues } = this.state;
        let { filterBySubDept } = formValues;

        roles = roles.filter(role => role.subDepartmentFormattedName == filterBySubDept);
        roles = sortBy(roles, 'level');

        let subDeptOptions = subDepartments.map((subDept) => {
            return {
                "label": subDept.name,
                "value": subDept.formattedName
            }
        });

        let roleOptions = roles.map((role) => {
            return {
                "label": role.name,
                "value": role.formattedName
            }
        });

        return [
            {
                name: 'filterBySubDept',
                type: 'select',
                value: 'digital_finance',
                placeholder: 'Filter SubDepartment',
                options: subDeptOptions
            },
            {
                name: 'filterByRole',
                type: 'select',
                value: 'manager',
                placeholder: 'Filter Role',
                options: roleOptions
            },
            {
                type: 'button',
                text: 'Search',
                onClick: this.onClickSearch
            }];
    }

    reporterCountFormatter = (cell, row, type) => {
        const reporters = get(row, type);
        const formattedType = startCase(type.replace(/is/, ''));
        const email = get(row, 'email');

        if (cell > 0) {
            return (<div style={{ cursor: 'pointer', color: '#ff00eb' }}
                onClick={() => this.onClickReportersCount({ reporters, type: formattedType, email })}>{cell}</div>)
        }
        else {
            return cell;
        }
    }

    onClickReportersCount = (reporterData) => {
        this.setState({ showReporters: true, reporterData });
    }

    closeModal = () => {
        this.setState({ showReporters: false });
    }

    getReportersList = () => {
        const { reporterData = {} } = this.state;
        let { reporters = [], type, email } = reporterData;
        reporters = reporters.sort();

        return (
            <>
                <Drawer
                    title={`${email} : Covering ${startCase(type)}(s)`}
                    placement="right"
                    width="30%"
                    style={{ zIndex: '100000' }}
                    closable={true}
                    onClose={this.closeModal}
                    visible={true}
                >
                    <ol>
                        {reporters.map((rep, index) => {
                            return (<li key={index}>{rep}</li>)
                        })}
                    </ol>
                </Drawer>
            </>
        );
    }

    render() {
        const { modelName } = this.props;
        const { formValues, showReporters, reporterData } = this.state;
        const { filterByRole = "manager", filterBySubDept = "digital_finance" } = formValues;
        const columns = this.getColumns();
        const fields = this.getSearchFields();
        const gridDataUrl = `/usermanagement/scemployee/getSummary?filterBySubDept=${filterBySubDept}&filterByRole=${filterByRole}`;

        return (
            <Box>
                <BoxBody>
                    <FormBuilder
                        ref="searchForm"
                        fields={fields}
                        initialValues={formValues}
                        cols={4}
                    />
                    <Alert color="info">
                        OAs - Office Assistants
                        SEs - Senior Executives
                        SAs - Senior Associates
                        TLs - Team Leads
                        AMs - Assistant Managers
                        SMs - Senior Managers
                        AGMs - Assitant General Managers
                        GMs - General Managers
                        AVPs - Assistant Vice Presidents
                    </Alert>
                    <ByjusGrid
                        ref="byjusGrid"
                        columns={columns}
                        gridDataUrl={gridDataUrl}
                        modelName={modelName}
                        sort={{ email: 'asc' }}
                    />
                    {showReporters && reporterData && this.getReportersList()}
                </BoxBody>
            </Box>
        )
    }
}

const mapStateToProps = state => ({
    user: state.auth.user
});

export default connect(mapStateToProps)(Summary);
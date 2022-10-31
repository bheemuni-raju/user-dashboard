import React from 'react';
import { Drawer } from 'antd';
import { Link } from 'react-router-dom';
import { get, startCase } from 'lodash';

import ByjusGrid from "modules/core/components/grid/ByjusGrid";
import FormBuilder from "components/form/FormBuilder";
import { Box, BoxBody } from 'components/box';
import { connect } from 'react-redux';

class Summary extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            formValues: {
                filterBy: 'team_manager'
            }
        }
    }

    getColumns = () => {
        const { filterBy } = this.state.formValues;
        const { env } = this.props.user;

        let summaryRoleFields = [{
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
            text: 'BDTs',
            width: '100',
            dataField: 'bdtCount',
            className: 'td-header-warning',
            formatter: (cell, row) => this.reporterCountFormatter(cell, row, 'isBdt')
        }, {
            text: 'BDATs',
            width: '100',
            dataField: 'bdaTCount',
            className: 'td-header-warning',
            formatter: (cell, row) => this.reporterCountFormatter(cell, row, 'isBdaT')
        }, {
            text: 'BDAs',
            width: '100',
            dataField: 'bdaCount',
            className: 'td-header-warning',
            formatter: (cell, row) => this.reporterCountFormatter(cell, row, 'isBda')
        }, {
            text: 'BDTMs',
            width: '100',
            dataField: 'bdtmCount',
            className: 'td-header-warning',
            formatter: (cell, row) => this.reporterCountFormatter(cell, row, 'isBdtm')
        }, {
            text: 'TMs',
            width: '100',
            dataField: 'tmCount',
            className: 'td-header-warning',
            formatter: (cell, row) => this.reporterCountFormatter(cell, row, 'isTeamManager')
        }, {
            text: 'Senior BDTMs',
            width: '150',
            dataField: 'seniorBdtmCount',
            className: 'td-header-warning',
            formatter: (cell, row) => this.reporterCountFormatter(cell, row, 'isSeniorBdtm')
        }, {
            text: 'SMs',
            width: '100',
            dataField: 'smCount',
            className: 'td-header-warning',
            formatter: (cell, row) => this.reporterCountFormatter(cell, row, 'isSeniorManager')
        }];

        summaryRoleFields.push({
            text: 'AGMs',
            width: '100',
            dataField: 'agmCount',
            className: 'td-header-warning',
            formatter: (cell, row) => this.reporterCountFormatter(cell, row, 'isAgm')
        }, {
            text: 'GMs',
            width: '100',
            dataField: 'gmCount',
            className: 'td-header-warning',
            formatter: (cell, row) => this.reporterCountFormatter(cell, row, 'isGm')
        });

        summaryRoleFields.push({
            text: 'AVPs',
            width: '100',
            dataField: 'avpCount',
            className: 'td-header-warning',
            formatter: (cell, row) => this.reporterCountFormatter(cell, row, 'isAvp')
        }, {
            text: 'HRBP Leads',
            width: '100',
            dataField: 'avpHrbpCount',
            className: 'td-header-warning',
            formatter: (cell, row) => this.reporterCountFormatter(cell, row, 'isHrbpLead')
        }, {
            text: 'Team Heads',
            width: '130',
            dataField: 'thCount',
            className: 'td-header-warning',
            formatter: (cell, row) => this.reporterCountFormatter(cell, row, 'isTeamHead')
        });

        return summaryRoleFields;
    }

    onClickSearch = () => {
        const searchForm = this.refs.searchForm;
        const formValues = searchForm.getFormValues();
        this.setState({
            formValues
        });
    }

    getSearchFields = () => {
        const { env } = this.props.user;

        let options = [{
            label: 'BDTM',
            value: 'bdtm'
        }, {
            label: 'Team Manager',
            value: 'team_manager'
        }, {
            label: 'Senior BDTM',
            value: 'senior_bdtm'
        }, {
            label: 'Senior Manager',
            value: 'senior_manager'
        }];

        options.push({
            label: 'AGM',
            value: 'agm'
        }, {
            label: 'GM',
            value: 'gm'
        });

        options.push({
            label: 'AVP',
            value: 'avp'
        }, {
            label: 'HRBP Lead',
            value: 'hrbp_lead'
        }, {
            label: 'Team Head',
            value: 'team_head'
        });

        return [{
            name: 'filterBy',
            type: 'select',
            value: 'team_manager',
            placeholder: 'Filter By',
            options: options
        }, {
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
        const { filterBy = "team_manager" } = formValues;
        const columns = this.getColumns();
        const fields = this.getSearchFields();
        const gridDataUrl = `/usermanagement/employee/operation/getSummary?filterBy=${filterBy}`;

        return (
            <Box>
                <BoxBody>
                    <FormBuilder
                        ref="searchForm"
                        fields={fields}
                        initialValues={formValues}
                        cols={4}
                    />
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
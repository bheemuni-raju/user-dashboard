import React, { Component, Fragment } from 'react';
import { connect } from 'react-redux';
import { withRouter } from 'react-router'
import { Button, Row, Col } from 'reactstrap';
import { get, isEmpty, startCase } from 'lodash';

import { FormBuilder } from 'components/form';
import { callApi } from 'store/middleware/api';
import { Box, BoxBody, BoxHeader } from 'components/box';
import AssignmentRuleFilters from './AssignmentRuleFilters';
import TextArea from 'antd/lib/input/TextArea';
import Notify from 'react-s-alert';

class AssignmentRuleBuilder extends Component {
    constructor(props) {
        super(props);
        this.state = {
            loading: false,
            error: null,
            comboLoading: false,
            db: null,
            gridTemplateId: null,
            gridTemplateList: [],
            columnList: [],
            allColumnKeys: [],
            searchCriterias: [],
            showAssignmentRuleFilterModal: false,
            isAssignmentRuleFilterApplied: false,
            ruleCondition: {}
        };
    }

    componentWillMount = async () => {
        let { ruleFormattedName } = this.props;
        if (!isEmpty(ruleFormattedName)) {
            await this.getAssignmentRule(ruleFormattedName);
            let { assignmentRule } = this.state;
            let gridTemplateId = get(assignmentRule, "gridId", "");
            await this.getGridTemplate(gridTemplateId);
        }
        else {
            await this.getGridTemplate(null);
        }
    }

    showAssignmentRuleFilterModal = () => {
        this.setState({
            showAssignmentRuleFilterModal: true
        });
    }

    hideAssignmentRuleFilterModal = () => {
        this.setState({
            showAssignmentRuleFilterModal: false
        });
    }

    onClickSave = () => {
        const { location, ruleFormattedName } = this.props;
        const { name, ruleCondition, gridTemplateId, description, assignmentRule, searchCriterias, anyCriteria } = this.state;
        const formBuilder = this.refs.formBuilder;
        const formValues = formBuilder && formBuilder.validateFormAndGetValues();
        let actionType = !isEmpty(ruleFormattedName) ? "update" : "create";

        let formattedName = !isEmpty(name) ? name : (!isEmpty(get(assignmentRule, 'name', '')) ? get(assignmentRule, 'name', '') : '');
        let formattedDescription = !isEmpty(description) ? description : (!isEmpty(get(assignmentRule, 'description', '')) ? get(assignmentRule, 'description', '') : '')
        let formattedGridId = !isEmpty(gridTemplateId) ? gridTemplateId : (!isEmpty(get(assignmentRule, 'gridId', '')) ? get(assignmentRule, 'gridId', '') : '');
        let formattedRuleCondition = !isEmpty(ruleCondition) ? ruleCondition : (!isEmpty(get(assignmentRule, 'ruleCondition', {})) ? get(assignmentRule, 'ruleCondition', {}) : {});
        let formattedSearchCriterias = !isEmpty(searchCriterias) ? searchCriterias : (!isEmpty(get(assignmentRule, 'searchCriterias', [])) ? get(assignmentRule, 'searchCriterias', []) : []);
        let formattedAnyCriteria = (anyCriteria !== get(assignmentRule, 'anyCriteria', true) && anyCriteria != undefined) ? anyCriteria : get(assignmentRule, 'anyCriteria', true);

        if (isEmpty(formattedName) || isEmpty(formattedDescription) || isEmpty(formattedGridId) || isEmpty(get(formValues, 'assignedToGroups', []))) {
            Notify.error("Please fill all the mandatory fields!");
        }
        else if (isEmpty(formattedRuleCondition)) {
            Notify.error("Please select atleast one assignment rule filter critiera!");
        }
        else if (formValues) {
            this.setState({ loading: true });
            const assignedTo = {
                groupFormattedName: get(formValues, 'assignedToGroups', [])
            };
            const body = {
                ...formValues,
                name: formattedName,
                ruleCondition: formattedRuleCondition,
                description: formattedDescription,
                gridId: formattedGridId,
                searchCriterias: formattedSearchCriterias,
                anyCriteria: formattedAnyCriteria,
                assignedTo,
                appName: 'ums',
                enabled: true
            };

            try {
                const method = actionType === "update" ? "PUT" : "POST";
                const uri = actionType === "update" ? `/usermanagement/assignmentrule/${ruleFormattedName}` : `/usermanagement/assignmentrule`;
                const userKey = actionType === "update" ? "createdBy" : "updatedBy";

                body[userKey] = get(this.props.user, 'email', "");
                callApi(uri, method, body, null, null, true)
                    .then(response => {
                        this.setState({ loading: false });
                        this.onClickClose();
                    })
                    .catch(error => {
                        this.setState({ loading: false, error });
                    })
            } catch (error) {
                this.setState({ loading: false, error });
            }
        }
    }

    getDataColumns = () => {
        const { assignmentRule, columnList } = this.state;
        const { collectionHeaders = [], filters = [] } = assignmentRule || {};
        const selectedColumnKeys = [];
        const targetColumnKeys = [];

        let allColumnKeys = columnList.map((col, index) => {
            const { dataField } = col || {};
            if (collectionHeaders.indexOf(dataField) >= 0 && !isEmpty(dataField)) {
                targetColumnKeys.push(dataField);
            }
            return {
                key: dataField,
                title: dataField
            }
        });

        allColumnKeys = allColumnKeys.filter(x => !isEmpty(x.key) && !isEmpty(x.title));
        this.setState({ allColumnKeys, targetColumnKeys, selectedColumnKeys });
    };

    onClickClose = () => {
        const { history } = this.props;
        history && history.goBack();
    }

    buildForm = () => {
        let { ruleFormattedName } = this.props;
        const { assignmentRule, gridTemplateId, name, assignedToGroups, ruleCondition, description, comboLoading } = this.state;

        let formattedName = !isEmpty(name) ? name : (!isEmpty(get(assignmentRule, "name", "")) ? get(assignmentRule, "name", "") : '');
        let formattedDescription = !isEmpty(description) ? description : (!isEmpty(get(assignmentRule, "description", "")) ? get(assignmentRule, "description", "") : '');
        let formattedGridId = !isEmpty(gridTemplateId) ? gridTemplateId : (!isEmpty(get(assignmentRule, "gridId", "")) ? get(assignmentRule, "gridId", "") : '');
        let formattedAssignedToGroups = !isEmpty(assignedToGroups) ? assignedToGroups : (!isEmpty(get(assignmentRule, 'assignedTo.groupFormattedName', [])) ? get(assignmentRule, 'assignedTo.groupFormattedName', []) : '');
        let formattedRuleCondition = !isEmpty(ruleCondition) ? ruleCondition : (!isEmpty(get(assignmentRule, 'ruleCondition', {})) ? get(assignmentRule, 'ruleCondition', {}) : {});

        let showAssignmentRuleFilterButton = (!isEmpty(formattedName) && !isEmpty(formattedDescription) && !isEmpty(formattedGridId) && !isEmpty(formattedAssignedToGroups));

        const fields = [{
            type: 'text',
            name: 'name',
            label: 'Name your rule',
            placeholder: 'Eg: Live Chat Users',
            required: true,
            disabled: isEmpty(ruleFormattedName) ? false : true,
            onChange: this.handleOnChange
        }, {
            type: 'text',
            name: 'description',
            label: 'Rule Description',
            placeholder: 'Eg: Describe your rule',
            required: true,
            onChange: this.handleOnChange
        }, {
            type: 'select',
            name: 'gridTemplateId',
            label: 'Grid Template',
            model: 'GridTemplate',
            displayKey: `gridId`,
            valueKey: 'gridId',
            filter: { "viewFormattedName": "all" },
            limit: 1000,
            required: true,
            placeholder: 'Select Grid Template',
            onChange: this.handleOnChange
        }, {
            type: 'select',
            name: 'assignedToGroups',
            label: 'Assign to a Group',
            model: 'AppGroup',
            displayKey: `appGroupName`,
            valueKey: 'appGroupName',
            placeholder: 'Eg: Live Chat Group',
            filter: { "appName": "ums" },
            isMulti: true,
            required: true,
            loading: comboLoading,
            onChange: this.handleOnChange
        }, {
            type: (showAssignmentRuleFilterButton) ? 'button' : 'hidden',
            name: 'assignmentRuleFilterButton',
            text: 'Select Required Filters',
            style: { marginTop: '13%' },
            onClick: this.onClickFilterButton
        }];

        const initialValues = assignmentRule ? {
            ...assignmentRule,
            gridTemplateId: formattedGridId,
            assignedToGroups: formattedAssignedToGroups
        } : {};

        return (
            <>
                <Row>
                    <Col>
                        <FormBuilder
                            ref="formBuilder"
                            fields={fields}
                            initialValues={initialValues}
                        />
                    </Col>
                    <Col>
                        <TextArea
                            value={JSON.stringify(formattedRuleCondition, null, 2)}
                            disabled={true}
                            placeholder={{}}
                            rows={20}
                            cols={5}
                        ></TextArea>

                    </Col>
                </Row>
            </>
        )
    }

    onClickFilterButton = () => {
        let { gridTemplateId, assignmentRule } = this.state;
        let formattedGridId = !isEmpty(gridTemplateId) ? gridTemplateId : (!isEmpty(get(assignmentRule, "gridId", "")) ? get(assignmentRule, "gridId", "") : "");

        if (formattedGridId) {
            this.setState({ showAssignmentRuleFilterModal: true });
        }
    }

    prettyPrint = (uglyJson) => {
        try {
            var obj = JSON.parse(uglyJson);
            var prettyJson = JSON.stringify(obj, undefined, 4);
            return prettyJson;
        }
        catch (ex) {
            console.log(ex);
        }
    }

    handleOnChange = (selectedValue, name) => {
        this.setState({ [name]: selectedValue })

        if (name === "gridTemplateId") {
            this.getGridTemplate(selectedValue);
        }
    }

    getGridTemplate = async (gridTemplateId) => {
        if (gridTemplateId) {
            this.setState({ loading: true, comboLoading: true, columnList: [] });
            return await callApi(`/usermanagement/assignmentrule/listGridTemplate`, "POST", { gridId: gridTemplateId }, null, null, true)
                .then(res => {
                    let columnList = [];
                    res.docs.map((colList) => columnList = colList.columns);
                    this.setState({ loading: false, gridTemplateList: res.docs, columnList: columnList, gridTemplateId: gridTemplateId, comboLoading: false, error: null });
                    this.getDataColumns();
                })
                .catch(error => {
                    this.setState({ loading: false, comboLoading: false, error });
                });
        }
    }

    getAssignmentRule = async (ruleFormattedName) => {
        if (ruleFormattedName) {
            this.setState({ loading: true, comboLoading: true, columnList: [] });
            return await callApi(`/usermanagement/assignmentrule/${ruleFormattedName}`, "GET", null, null, null, true)
                .then(res => {
                    this.setState({ loading: false, assignmentRule: res, comboLoading: false, error: null });
                })
                .catch(error => {
                    this.setState({ loading: false, comboLoading: false, error });
                });
        }
    }

    saveAssignmentRuleFilter = (ruleCondition, searchCriterias, anyCriteria) => {
        this.setState({ ruleCondition, searchCriterias, anyCriteria });
    }

    render = () => {
        const { ruleFormattedName } = this.props;
        let { loading, error, assignmentRule, allColumnKeys, showAssignmentRuleFilterModal, modelName, gridTemplateId, searchCriterias, anyCriteria } = this.state;

        let formattedSearchCriterias = !isEmpty(searchCriterias) ? searchCriterias : (!isEmpty(get(assignmentRule, 'searchCriterias', [])) ? get(assignmentRule, 'searchCriterias', []) : []);
        let formattedAnyCriteria = (anyCriteria !== get(assignmentRule, 'anyCriteria', true) && anyCriteria != undefined) ? anyCriteria : get(assignmentRule, 'anyCriteria', true);

        const heading = isEmpty(ruleFormattedName) ? "Add A New Assignment Rule" : `Assignment Rule : ${startCase(ruleFormattedName)}`;

        return (
            <Box>
                <BoxHeader heading={heading} closeBtn={true} />
                <BoxBody loading={loading} error={error}>
                    {this.buildForm()}
                    <div className="text-right" class="pt-1">
                        <Button type="button" color="success" onClick={this.onClickSave}>Save</Button>
                        {'   '}
                        <Button type="button" color="danger" onClick={this.onClickClose}>Close</Button>
                    </div>
                </BoxBody>
                {allColumnKeys.length > 0 &&
                    <Fragment>
                        {showAssignmentRuleFilterModal && <AssignmentRuleFilters
                            ref="assignmentRuleFilterForm"
                            searchCriterias={formattedSearchCriterias}
                            anyCriteria={formattedAnyCriteria}
                            onSave={this.saveAssignmentRuleFilter}
                            columns={allColumnKeys}
                            loadData={this.loadWithAssignmentRuleFilter}
                            modelName={modelName}
                            gridId={gridTemplateId}
                            hideAssignmentRuleFilterModal={this.hideAssignmentRuleFilterModal}
                        />}
                    </Fragment>
                }
            </Box>
        )
    }
}

const mapStateToProps = (state) => ({
    user: get(state, 'auth.user')
});

export default withRouter(connect(mapStateToProps)(AssignmentRuleBuilder))
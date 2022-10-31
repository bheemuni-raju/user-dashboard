import React, { Component, Fragment, useState } from 'react'
import { withRouter } from 'react-router'
import { connect } from 'react-redux'
import { get, find, map, isEmpty, camelCase, isArray, remove, startCase } from 'lodash'
import { Button, Nav, NavItem, NavLink, TabContent, TabPane } from 'reactstrap'
import classNames from 'classnames';
import Notify from 'react-s-alert';

import Confirm from 'components/confirm';
import { FormBuilder } from 'components/form';
import { Page, PageBody, PageHeader } from 'components/page';
import { Box, BoxBody, BoxHeader } from 'components/box';
import { callApi } from 'store/middleware/api';

import CommonUserForm from '../../common/CommonUserForm';
import { fetchReportingToRoles, getFormattedDateFields, validateEmail, validateDateRange } from '../../user/utils/userUtil';

class EmployeeForm extends Component {
    constructor(props) {
        super(props)
        this.state = {
            loading: false,
            error: null,

            teamDetails: {},
            userData: {},

            department: null,
            subDepartment: null,
            role: null,

            showCommentModal: false,

            showHistoryModal: false,
            activeTab: "1"
        }
    }


    getUpdatedUserFormFields = (fields, status) => {
        let disableActivationDate = true;
        if (["long_leave", "maternity", "notice_period", "Long Leave", "Maternity", "Notice Period"].includes(status)) {
            fields.push({
                type: "date",
                label: `${startCase(status)} Start Date`,
                name: `${camelCase(status)}StartDate`,
                required: true
            }, {
                type: "date",
                label: `${startCase(status)} End Date`,
                name: `${camelCase(status)}EndDate`,
                required: true
            });
        }
        else if (["transition", "Transition"].includes(status)) {
            fields.push({
                type: "date",
                label: `Transition Date`,
                name: `transitionDate`,
                required: true
            })
        }
        else if (["exit", "Exit"].includes(status)) {
            fields.push({
                type: "date",
                label: `Last Working Date`,
                name: `lastWorkingDate`,
                required: true
            })
        }
        else {
            disableActivationDate = false;
        }

        fields.push({
            type: "date",
            label: "Activation Date",
            name: "activationDate",
            required: !disableActivationDate, // if the activation date is disabled it is not a required field
            disabled: disableActivationDate
        })

        return fields;
    }

    handleOnChange = (selectedValue, name) => {
        this.setState({ [name]: selectedValue });
    }

    buildReportingToDetailsForm = (userData) => {
        let { teamDetails, role, status, activationDate } = this.state;
        const reportingTo = get(userData, 'reportingTo', []);
        const teamRoles = get(teamDetails, 'roles', []);
        const userRole = find(teamRoles, { formattedName: role }) || {};

        /**Applicable ReportingTo roles = roles with level greater than the level of user role*/
        let { reportingToRoles, initialValues } = fetchReportingToRoles(reportingTo, teamRoles, userRole, status, activationDate, "supply_chain");

        const fields = reportingToRoles.map(r => {
            return {
                type: "select",
                name: get(r, 'formattedName', '').toString(),
                label: get(r, 'name'),
                model: 'ScEmployee',
                displayKey: 'email',
                valueKey: 'email',
                filter: { role: get(r, 'formattedName') },
                valueRenderer: (selectedValue, index) => this.reportingToRender(selectedValue, index, reportingTo),
                isMulti: true,
                onChange: this.handleReportingToChanges
            }
        });

        return (
            <FormBuilder
                fields={fields}
                ref="reportingToDetailsForm"
                initialValues={initialValues}
                cols={3}
                exactFormValues={true}
            />
        );
    }

    /**A render function for formatting the reportingTo PRIMARY and SECONDARY user */
    reportingToRender = (selectedValue, index, reportingTo) => {
        const { label, value } = selectedValue;
        const userDetails = find(reportingTo, { "user": value });
        const userType = get(userDetails, 'userType', '');
        const isPrimary = userDetails ? (userType == "PRIMARY") : (index == 0);

        if (isPrimary) {
            return <div style={{ color: 'green', textAlign: 'center' }}>
                <span style={{ textAlign: 'center' }}>
                    <i className="fa fa-user-circle-o" aria-hidden="true"></i>{` ${userType}: ${label}`}
                </span>
            </div>
        }
        else {
            return label;
        }
    }

    toggleTab = tabKey => {
        let { activeTab } = this.state;
        if (activeTab !== tabKey) {
            this.setState({
                activeTab: tabKey,
            });
        }
    }

    buildTabs = (userData) => {
        const { activeTab, teamDetails = {} } = this.state;

        return (
            <Box>
                <BoxBody>
                    <Nav tabs>
                        <NavItem>
                            <NavLink
                                className={classNames({ active: activeTab === '1' })}
                                onClick={() => this.toggleTab("1")}>
                                General Details
                            </NavLink>
                        </NavItem>
                    </Nav>
                    <TabContent activeTab={activeTab}>
                        <TabPane tabId="1">
                            {teamDetails && this.buildUserForm(userData)}
                        </TabPane>
                    </TabContent>
                </BoxBody>
            </Box>
        )
    }

    buildUserForm = (userData) => {
        const { user } = this.props;
        return (
            <>
                <CommonUserForm ref="commonUserForm"
                    userData={this.state.userData}
                    role={this.state.role}
                    subDepartment={this.state.subDepartment}
                    department={"supply_chain"}
                    handleOnChange={this.handleOnChange}
                    getUpdatedUserFormFields={this.getUpdatedUserFormFields}
                    showCommentModal={this.state.showCommentModal}
                    showHistoryModal={this.state.showHistoryModal}
                    onCloseCommentModal={this.onCloseCommentModal}
                    onCloseHistoryModal={this.onCloseHistoryModal}
                    loadCommentUrl={`/usermanagement/scemployee/getComments?email=${get(userData, 'email', '')}`}
                    updateCommentUrl={`/usermanagement/scemployee/updateComments`}
                    validateUserSection={this.validateUserSection}
                >
                </CommonUserForm>
                <BoxHeader>Reporting To Details</BoxHeader>
                <BoxBody>{this.buildReportingToDetailsForm(userData)}</BoxBody>
                <div className="text-right">
                    <Button type="button" color="success" onClick={this.onClickSaveUser}>Save</Button>{' '}
                    <Button type="button" color="danger" onClick={() => this.props.history.goBack()}>Close</Button>
                </div>
            </>
        )
    }

    handleReportingToChanges = (selectedOptions, role, originalValues) => {
        let { userFormValues = {}, teamDetails = {} } = this.state;
        const teamRoles = get(teamDetails, 'roles', []);
        let { reportingTo = {} } = userFormValues
        let value = [];

        value = originalValues.map((originalValue, index) => {
            let selectedOption = {};
            let { value, label } = originalValue
            let userType = index == 0 ? "PRIMARY" : "SECONDARY"
            let roleDetail = teamRoles.find((ele) => ele.formattedName === role);
            selectedOption.userType = userType
            selectedOption.userEmail = label
            selectedOption.level = roleDetail.level

            return selectedOption;
        })

        reportingTo[role] = value
        userFormValues.reportingTo = reportingTo;
        this.setState({ userFormValues })
    }

    getContactValue = (contact) => {
        if (isArray(contact)) {
            remove(contact, v => !v); //remove empty values in department if any
            return contact;
        }
        else {
            return contact || "";
        }
    }

    validateUserSection = (formValues = {}) => {
        let { name = "", email = "", tnlId = "", contact = "", doj = "", activationDate = "", lastWorkingDate = "" } = formValues;
        tnlId = tnlId && tnlId.toUpperCase();
        let validationErrors = {};
        let nameRegex = new RegExp(/^[a-zA-Z\s\.]+$/);
        let contactRegex = new RegExp(/^\d{10}$/);

        if (!nameRegex.test(name)) {
            validationErrors["name"] = `Invalid Name.`
        }

        contact = this.getContactValue(contact);
        if (!isEmpty(contact)) {
            if (isArray(contact)) {
                contact.map(contactNo => {
                    if (!contactRegex.test(contactNo)) {
                        if (isEmpty(validationErrors["contact"])) {
                            validationErrors["contact"] = `Enter 10 digit valid Mobile No`
                        }
                    }
                })
            }
            else if (!contactRegex.test(contact) && isEmpty(validationErrors["contact"])) {
                validationErrors["contact"] = `Enter 10 digit valid Mobile No`
            }
        }

        let validEmailFlag = validateEmail(email);
        if (!validEmailFlag) {
            validationErrors["email"] = `Please enter valid byjus email id`
        }

        let validTnlFormats = ["TNL", "tnl", "C1", "c1"];
        let validTnlFlag = false;
        validTnlFormats.map(tnlFormat => {
            if (tnlId.includes(tnlFormat)) {
                validTnlFlag = true;
            }
        });

        if (!validTnlFlag) {
            validationErrors["tnlId"] = `Please enter valid TNL id`
        }

        if (!validateDateRange(doj)) {
            validationErrors["doj"] = `DOJ should be after 2010 and should not be a future date. Please enter valid Date of Joining`
        }

        if (!validateDateRange(activationDate)) {
            validationErrors["activationDate"] = `Activation Date should be after 2010 and should not be a future date. Please enter valid Activation Date`
        }

        if (!validateDateRange(lastWorkingDate)) {
            validationErrors["lastWorkingDate"] = `Last Working Date should be after 2010 and should not be a future date. Please enter valid Last Working Date`
        }

        return validationErrors;
    }

    onClickSaveUser = async () => {
        const { commonUserForm, reportingToDetailsForm } = this.refs;
        const commonUserFormDetails = commonUserForm ? commonUserForm.validateFormAndGetValues() : {};
        const reportingToDetails = reportingToDetailsForm ? reportingToDetailsForm.validateFormAndGetValues() : {};

        /** 
         * Validate all forms. 
         * If successs, show the confirmation dialog
         */
        if (commonUserFormDetails && reportingToDetails) {
            let result = await Confirm();
            if (result) {
                this.saveUser(commonUserFormDetails, reportingToDetails);
            }
        }
    }

    saveUser = async (commonUserFormDetails, reportingToDetails) => {
        const { user } = this.props;
        const { operationType, userId, teamDetails, userFormValues = {}, userData = {} } = this.state;
        const { reportingTo } = userData;
        const method = "POST"
        const url = operationType == "create" ? "/usermanagement/scemployee/createData" : `/usermanagement/scemployee/updateData`

        try {
            const formattedReportingTo = this.formatReportingTo(reportingTo, userFormValues);
            const formattedAdditionalDetails = this.formatAdditionalDetails(commonUserFormDetails);
            const dateFields = getFormattedDateFields(commonUserFormDetails);

            let bodyPayload = {
                ...commonUserFormDetails,
                department: get(teamDetails, 'departmentFormattedName'),
                subDepartment: get(teamDetails, 'formattedName'),
                doj: get(commonUserFormDetails, 'doj', null),
                activationDate: get(commonUserFormDetails, 'activationDate', null),
                lastWorkingDate: get(commonUserFormDetails, 'lastWorkingDate', null),
                role: isEmpty(get(commonUserFormDetails, 'role', null)) ? null : get(commonUserFormDetails, 'role', null),
                reportingTo: formattedReportingTo,
                additionalDetails: formattedAdditionalDetails,
                updatedBy: get(user, 'email')
            }

            if (!isEmpty(dateFields)) {
                bodyPayload["dateFields"] = dateFields;
            }

            this.setState({ loading: true, error: null })
            await this.addOrUpdateEmployee(url, operationType, method, bodyPayload);
            this.props.history.goBack();
        } catch (error) {
            this.setState({ loading: false, error });
        }
    }

    formatAdditionalDetails = (commonUserFormDetails = {}) => {
        let sfVertical = get(commonUserFormDetails, 'sfVertical', '');
        let teamName = get(commonUserFormDetails, 'teamName', '');
        let formattedAdditionalDetails = {
            "sfVertical": sfVertical,
            "teamName": teamName
        };

        return formattedAdditionalDetails;
    }

    addOrUpdateEmployee = async (url, operationType, method, bodyPayload) => {
        /* API call to add new user in Employee Collection */
        await callApi(url, method, bodyPayload, null, null, true)
            .then(response => {
                if (response != null) {
                    Notify.success(`User ${operationType == "create" ? 'created' : 'updated'} successfully!`);
                    this.setState({ loading: false, error: null });
                }
            })
            .catch(error => {
                this.setState({ loading: false, error: error });
                Notify.error(error.message);
            })
    }

    formatReportingTo = (reportingToDetails = {}, userFormValues = {}) => {
        let formattedReportingTo = {};
        let { reportingTo = {} } = userFormValues;

        if (isEmpty(reportingToDetails) && !isEmpty(reportingTo)) {
            formattedReportingTo = reportingTo;
        }
        else {
            if (!isEmpty(reportingToDetails)) {
                reportingToDetails = Object.keys(reportingToDetails).map((reportingToDetailsKey) => {
                    let reportingToKeys = Object.keys(reportingTo).map((reportingToKey) => { return reportingToKey });
                    if (!(reportingToKeys.includes(reportingToDetailsKey))) {
                        return { [reportingToDetailsKey]: reportingToDetails[reportingToDetailsKey] };
                    }
                })

                reportingToDetails = reportingToDetails.filter((ele) => !isEmpty(ele));
            }

            if (!isEmpty(reportingTo)) {
                formattedReportingTo = reportingTo;
            }

            if (!isEmpty(reportingToDetails)) {
                reportingToDetails.map((key, index) => {
                    let roleKey = Object.keys(reportingToDetails[index]);
                    let val = reportingToDetails[index][roleKey];
                    if (!isEmpty(val)) {
                        formattedReportingTo[roleKey] = val;
                    }
                });
            }
        }

        return formattedReportingTo;
    }

    getUserData = (email) => {
        this.setState({ loading: true, error: null })
        callApi(`/usermanagement/scemployee/readData/${email}`, "GET", null, null, null, true)
            .then(response => {
                this.setState({
                    userData: response,
                    role: get(response, 'role', ''),
                    department: get(response, 'department'),
                    subDepartment: get(response, 'subDepartment'),
                    status: get(response, 'status'),
                    sfVertical: get(response, 'additionalDetails.sfVertical', ""),
                    teamName: get(response, "additionalDetails.teamName", ""),
                    loading: false
                });
                let { subDepartment } = this.state;
                const { commonUserForm } = this.refs;
                commonUserForm.getTeamDetails(subDepartment);
            }).catch(error => {
                this.setState({ loading: false, error: error });
            })
    }

    componentWillMount = async () => {
        const { email, subDepartment } = this.props.match.params;

        this.setState({ operationType: email ? "edit" : "create", email });
        if (email) {
            this.setState({ subDepartment });
            this.getUserData(email);
        }
    }

    onClickComment = () => {
        const { userData } = this.state;
        let comments = [];

        if (userData) {
            comments = get(userData, 'comments', []);
        }

        this.setState({ showCommentModal: true, comments });
    }

    onCloseCommentModal = () => {
        this.setState({ showCommentModal: false });
    }

    onClickHistory = () => {
        this.setState({ showHistoryModal: true });
    }

    onCloseHistoryModal = () => {
        this.setState({ showHistoryModal: false });
    }

    getHeading = (userData) => {
        let { teamDetails = {} } = this.state;
        let subDepartmentName = isEmpty(get(teamDetails, "name")) ? "All" : get(teamDetails, "name");

        if (!isEmpty(userData)) {
            return (
                <span style={{ color: "#eb2f96" }}>
                    {subDepartmentName + ` : ${get(userData, 'email', '')}`}
                    <Button className="comment-btn" color="" size="lg" onClick={this.onClickComment}>
                        <i className="fa fa-comments-o" />
                    </Button>
                    <Button className="history-btn" color="" size="lg" onClick={this.onClickHistory}>
                        <i className="fa fa-history" />
                    </Button>
                </span>
            );
        }
        else {
            return (<span>{subDepartmentName + ` Employee`}</span>);
        }
    }

    render() {
        const { loading, error, userData, showCommentModal, showHistoryModal } = this.state;

        return (
            <>
                <Page loading={loading}  >
                    <PageHeader heading={this.getHeading(userData)} />
                    <PageBody error={error}>
                        {this.buildTabs(userData)}
                    </PageBody>
                </Page >
            </>
        )
    }
}

const mapStateToProps = (state) => ({
    user: get(state, 'auth.user')
});

export default withRouter(connect(mapStateToProps)(EmployeeForm))

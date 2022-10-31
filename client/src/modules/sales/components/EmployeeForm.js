import React, { Component } from 'react'
import { withRouter } from 'react-router'
import { connect } from 'react-redux'
import { get, find, map, isEmpty, camelCase, startCase } from 'lodash'
import { Button, Nav, NavItem, NavLink, TabContent, TabPane } from 'reactstrap'
import classNames from 'classnames';
import Notify from 'react-s-alert';

import Confirm from 'components/confirm';
import { FormBuilder } from 'components/form';
import { Page, PageBody, PageHeader } from 'components/page';
import { Box, BoxBody, BoxHeader } from 'components/box';
import { callApi } from 'store/middleware/api';

import CommonUserForm from '../../common/CommonUserForm';
import { fetchReportingToRoles, getFormattedDateFields, urlCreateMap, urlUpdateMap, validateEmail, validateDateRange } from 'modules/user/utils/userUtil';
import AttritionForm from './AttritionForm';
class EmployeeForm extends Component {
    constructor(props) {
        super(props)
        this.state = {
            loading: false,
            error: null,
            status: "",
            formFields: {},
            teamDetails: {},
            userData: {},

            department: null,
            subDepartment: null,
            role: null,

            showCommentModal: false,
            showAttritionForm: false,
            activeTab: "1"
        }
    }

    getUpdatedUserFormFields = (fields, status) => {
        let disableActivationDate = true;
        let showActivationDate = true;
        if (["campaign_training", "Campaign Training"].includes(status)) {
            showActivationDate = false;
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
        else if (["left", "Left"].includes(status)) {
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

        if (showActivationDate) {
            fields.push({
                type: "date",
                label: "Activation Date",
                name: "activationDate",
                required: !disableActivationDate, // if the activation date is disabled it is not a required field
                disabled: disableActivationDate
            })
        }

        return fields;
    }

    handleOnChange = (selectedValue, name) => {
        this.setState({ [name]: selectedValue });
        if (name == "status") {
            if (["left", "Left"].includes(selectedValue)) {
                this.setState({ status: selectedValue, showAttritionForm: true });
            }
            else {
                this.setState({ status: selectedValue, showAttritionForm: false });
            }
        }

    }

    buildReportingToDetailsForm = (userData) => {
        let { teamDetails, role, status, activationDate } = this.state;
        const reportingTo = get(userData, 'reportingTo', []);
        const teamRoles = get(teamDetails, 'roles', []);
        const userRole = find(teamRoles, { formattedName: role }) || {};
        let { subDepartment } = this.props.match.params;
        subDepartment = !isEmpty(subDepartment) ? subDepartment : get(teamDetails, 'formattedName');

        /**Applicable ReportingTo roles = roles with level greater than the level of user role*/
        let { reportingToRoles, initialValues } = fetchReportingToRoles(reportingTo, teamRoles, userRole, status, activationDate, "business_development");

        if (["non_sales", "Non Sales"].includes(status)) {
            reportingToRoles = [];
            initialValues = {};
        }

        const fields = reportingToRoles.map(r => {
            return {
                type: "select",
                name: get(r, 'formattedName', '').toString(),
                label: get(r, 'name'),
                model: 'Employee',
                displayKey: 'email',
                valueKey: 'email',
                filter: { role: get(r, 'formattedName'), subDepartment },
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
                key={role}
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
        const { showAttritionForm, activeTab } = this.state;

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
                        <NavItem>
                            <NavLink
                                className={classNames({ active: activeTab === '2' })}
                                onClick={() => this.toggleTab("2")}
                                hidden={!showAttritionForm}
                            >
                                Attrition Details
                            </NavLink>
                        </NavItem>
                    </Nav>
                    <TabContent activeTab={activeTab}>
                        <TabPane tabId="1">
                            {this.buildUserForm(userData)}
                        </TabPane>
                        <TabPane tabId="2">
                            <>
                                {showAttritionForm && <AttritionForm ref="salesAttritionForm" userData={userData} toggleTab={this.toggleTab} />}
                            </>
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
                    department={"business_development"}
                    handleOnChange={this.handleOnChange}
                    getUpdatedUserFormFields={this.getUpdatedUserFormFields}
                    showCommentModal={this.state.showCommentModal}
                    showHistoryModal={this.state.showHistoryModal}
                    onCloseCommentModal={this.onCloseCommentModal}
                    onCloseHistoryModal={this.onCloseHistoryModal}
                    loadCommentUrl={`/usermanagement/employee/operartion/getComments?email=${get(userData, 'email', '')}`}
                    updateCommentUrl={`/usermanagement/employee/operation/updateComments`}
                    validateUserSection={this.validateUserSection}
                    user={user}
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

    validateUserSection = (formValues = {}) => {
        let { name = "", email = "", tnlId = "", contact = "", doj = "", activationDate = "", lastWorkingDate = "" } = formValues;
        tnlId = tnlId && tnlId.toUpperCase();
        let validationErrors = {};
        let nameRegex = new RegExp(/^[a-zA-Z\s\.]+$/);
        let contactRegex = new RegExp(/^\d{10}$/);

        if (!nameRegex.test(name)) {
            validationErrors["name"] = `Invalid Name.`
        }

        /*if (!isEmpty(contact) && !contactRegex.test(contact)) {
            validationErrors["contact"] = `Enter 10 digit valid Mobile No`
        }*/

        let validEmailFlag = validateEmail(email);
        if (!validEmailFlag) {
            validationErrors["email"] = `Please enter valid byjus email id`
        }

        let validTnlFormats = ["TNL", "tnl", "MI", "mi", "C1", "c1"];
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
        const { commonUserForm, reportingToDetailsForm,
            salesAttritionForm } = this.refs;
        const commonUserFormDetails = commonUserForm ? commonUserForm.validateFormAndGetValues() : {};
        const reportingToDetails = reportingToDetailsForm ? reportingToDetailsForm.validateFormAndGetValues() : {};
        const attritionDetails = salesAttritionForm ? salesAttritionForm.getAttritionStateValues() : {};

        /** 
         * Validate all forms. 
         * If successs, show the confirmation dialog
         */

        if (commonUserFormDetails && reportingToDetails && attritionDetails) {

            let result = await Confirm();
            if (result) {
                this.saveUser(commonUserFormDetails, reportingToDetails, attritionDetails);
            }
        }
        else if (!attritionDetails && get(commonUserFormDetails, 'lastWorkingDate')) {
            this.toggleTab("2");
        }
    }

    saveUser = async (commonUserFormDetails, reportingToDetails, attritionDetails) => {
        const { teamDetails, operationType, userId, userFormValues = {}, userData = {} } = this.state
        const { department = "", status = "" } = commonUserFormDetails;
        const { reportingTo } = userData;
        const { user } = this.props;
        const method = "POST";

        try {
            const formattedReportingTo = this.getFormattedReportingTo(reportingToDetails);
            const formattedAdditionalDetails = this.formatAdditionalDetails(commonUserFormDetails);
            const dateFields = getFormattedDateFields(commonUserFormDetails);

            let bodyPayload = {
                ...commonUserFormDetails,
                role: isEmpty(get(commonUserFormDetails, 'role')) ? null : get(commonUserFormDetails, 'role'),
                doj: get(commonUserFormDetails, 'doj', "1970-01-01"),
                activationDate: get(commonUserFormDetails, 'activationDate', "1970-01-01"),
                lastWorkingDate: get(commonUserFormDetails, 'lastWorkingDate', "1970-01-01"),
                reportingTo: formattedReportingTo,
                additionalDetails: formattedAdditionalDetails,
                updatedBy: get(user, 'email')
            }

            if (!isEmpty(dateFields)) {
                bodyPayload["dateFields"] = dateFields;
            }

            if (!isEmpty(attritionDetails)) {
                bodyPayload["attritionDetails"] = attritionDetails;
            }

            this.setState({ loading: true, error: null })

            /* 
             * If the status = "other than non-sales" then create/update entry in employees collection
             * If the status = "non-sales" and department = "other than buisness_development" then update entry employees collection
             */
            await this.addOrUpdateEmployee("business_development", operationType, method, bodyPayload);

            /* 
             * If the status = "non_sales" 
             * department is other than business_development
             * then create entry in the respective department collection with status "active"
             */
            if (["non_sales", "Non Sales"].includes(status) && !isEmpty(department) && department != "business_development") {
                bodyPayload["status"] = "active";
                await this.addOrUpdateEmployee(department, operationType, method, bodyPayload);
            }

            if (operationType == "create") {
                let email = get(commonUserFormDetails, 'email');
                this.setState({ loading: true, error: null });
                await this.addEmployeeInOH(email);
            }
            else {
                this.props.history.goBack()
            }

        } catch (error) {
            this.setState({ loading: false, error });
        }
    }


    formatAdditionalDetails = (commonUserFormDetails = {}) => {
        let hiringCampaign = get(commonUserFormDetails, 'hiringCampaign', '');
        let formattedAdditionalDetails = {
            "hiringCampaign": hiringCampaign
        };

        return formattedAdditionalDetails;
    }

    addOrUpdateEmployee = async (department, operationType, method, bodyPayload) => {
        let employeeCreateUrl = urlCreateMap[department];
        let employeeUpdateUrl = urlUpdateMap[department];
        let url = operationType == "create" ? employeeCreateUrl : employeeUpdateUrl;

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

    addEmployeeInOH = async (email) => {
        /* API call to add new user entry in OrderHive collection */
        const ohUrl = "/usermanagement/orderhiveSalesperson";
        const method = "POST";
        const ohPayload = { email };
        await callApi(ohUrl, method, ohPayload, null, null, true)
            .then(response => {
                console.log(response);
                if (response.status) {
                    Notify.success(`${email} is added successfully in OH salesperson list.`);
                    this.setState({ loading: false, error: null });
                }
                else {
                    Notify.success(response.error);
                    this.setState({ loading: false, error: response.error });
                }

                this.props.history.push({
                    pathname: '/user/business-development/dashboard'
                });
            })
            .catch(error => {
                this.setState({ loading: false, error });
                Notify.error(`User creation failed on OrderHive!\n` + error);
                this.props.history.push({
                    pathname: '/user/business-development/dashboard'
                });
            })
    }

    getFormattedReportingTo = (reportingToDetails = {}) => {
        let { teamDetails = {} } = this.state;
        const reportingToRoles = Object.keys(reportingToDetails);
        const formattedReportingTo = {};
        const teamRoles = get(teamDetails, 'roles', []);

        reportingToRoles.forEach((reportingToRole) => {
            const reportingToUsers = reportingToDetails[reportingToRole];
            const users = reportingToUsers.map((user, index) => {
                let roleDetail = teamRoles.find((ele) => ele.formattedName === reportingToRole);
                return {
                    userEmail: user,
                    userType: (index === 0) ? 'PRIMARY' : 'SECONDARY',
                    level: roleDetail.level
                }
            });
            formattedReportingTo[reportingToRole] = users;
        });

        return formattedReportingTo;
    }

    getUserData = (userId) => {
        this.setState({ loading: true, error: null })
        callApi(`/usermanagement/employee/${userId}`, "GET", null, null, null, true)
            .then(response => {
                this.setState({
                    userData: response,
                    role: get(response, 'role', ''),
                    department: get(response, 'department'),
                    subDepartment: get(response, 'subDepartment'),
                    status: get(response, 'status'),
                    hiringCampaign: get(response, 'additionalDetails.hiringCampaign', ""),
                    loading: false,
                    showAttritionForm: ["Left", "left"].includes(get(response, 'status'))
                });

                let { subDepartment } = this.state;
                const { commonUserForm } = this.refs;
                commonUserForm.getTeamDetails(subDepartment, "name");
            }).catch(error => {
                this.setState({ loading: false, error: error });
            })
    }


    componentWillMount = async () => {
        const { userId } = this.props.match.params;

        this.setState({ operationType: userId ? "edit" : "create", userId });
        if (userId) {
            this.getUserData(userId);
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
        const { loading, error, userData, showCommentModal, showHistoryModal, showAttritionForm } = this.state;

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
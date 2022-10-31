import React, { Component, Fragment } from 'react'
import { withRouter } from 'react-router'
import { connect } from 'react-redux'
import { chunk, get, capitalize, find, map, sortBy, flattenDeep, isEmpty, remove, camelCase, isArray } from 'lodash'
import { Row, Col, Button } from 'reactstrap'
import Notify from 'react-s-alert';

import { FormBuilder } from 'components/form';
import { Page, PageBody, PageHeader } from 'components/page';
import { Box, BoxBody, BoxHeader } from 'components/box';
import { callApi } from 'store/middleware/api';

import { fetchReportingToRoles, getFormattedDateFields, fetchStatusByDepartment, validateDateRange } from '../utils/userUtil';
import { user as userPermissions, validatePermission } from 'lib/permissionList';

import { modelMap, validateEmail } from '../utils/userUtil';
class UserForm extends Component {
    constructor(props) {
        super(props)
        this.state = {
            loading: false,
            error: null,
            teamDetails: {},
            userData: {},
            department: null,
            subDepartment: null,
            role: null
        }
    }

    buildUserDetailsForm = (userData) => {
        const { isUserAdmin, status } = this.state;
        const location = get(userData, "location");
        const country = get(userData, "country");
        const { department } = this.state;
        let locationFilter = (!isEmpty(userData) || !isEmpty(this.state.search)) ? { "city": { "$regex": this.state.search || location, "$options": "i" } } : {};
        let dateFields = get(userData, "dateFields");
        let statusOptions = fetchStatusByDepartment(department);

        let fields = [{
            type: "text",
            label: "Name",
            name: "name",
            placeholder: "Enter User name",
            required: true
        }, {
            type: "email",
            label: "Email",
            name: "email",
            placeholder: "Enter User email",
            required: true,
            disabled: !isEmpty(userData)
        }, {
            type: "text",
            label: "TnL Id",
            name: "tnlId",
            placeholder: "Enter User TnL Id"
        }, {
            type: "text",
            label: "Contact",
            name: "contact",
            placeholder: "Enter User contact",
            disabled: !isEmpty(userData)
        }, {
            type: "select",
            label: "Location",
            name: "location",
            model: "City",
            filter: locationFilter,
            onInputChange: search => search && this.setState({ search }),
            displayKey: "city",
            valueKey: "city"
        }, {
            type: "select",
            label: "Country",
            name: "country",
            model: "Country",
            displayKey: "name",
            valueKey: "formattedName",
            required: true
        }, {
            type: "select",
            label: "Status",
            name: "status",
            options: statusOptions
        }, {
            type: "date",
            label: "DOJ",
            name: "doj"
        }];

        return (
            <FormBuilder
                fields={fields}
                ref="userDetailsForm"
                initialValues={!isEmpty(userData) ? {
                    name: get(userData, 'name'),
                    email: get(userData, 'email'),
                    tnlId: get(userData, 'tnlId'),
                    contact: get(userData, 'contact'),
                    doj: get(userData, 'doj'),
                    location: get(userData, 'location', ''),
                    country: get(userData, 'country', ''),
                    status: get(userData, 'status'),
                    ...dateFields,
                } : null}
                cols={4}
                exactFormValues={true}
                validateValues={this.validateUserSection}
            />
        );
    }

    buildDepartmentDetailsForm = (userData) => {
        const { teamDetails = {}, department, subDepartment, role, isUserAdmin } = this.state;
        const units = get(teamDetails, 'units', []);
        const verticals = get(teamDetails, 'verticals', []);
        const campaigns = get(teamDetails, 'campaigns', []);
        const roles = get(teamDetails, 'roles', []);

        const fields = [{
            type: "select",
            label: "Department",
            name: "department",
            model: "Department",
            displayKey: "name",
            valueKey: "formattedName",
            onChange: this.handleOnChange,
            disabled: department ? true : false
        }, {
            type: "select",
            label: "Sub Department",
            name: "subDepartment",
            model: "SubDepartment",
            filter: { departmentFormattedName: department },
            displayKey: "name",
            valueKey: "formattedName",
            loadByDefault: department ? true : false,
            onChange: this.handleOnChange,
            disabled: subDepartment ? true : false
        }, {
            type: "select",
            label: "Unit",
            name: "unit",
            options: this.formatComboOptions(units, 'name', 'name')
        }, {
            type: "select",
            label: "Vertical",
            name: "vertical",
            options: this.formatComboOptions(verticals, 'name', 'name')
        }, {
            type: "select",
            label: "Campaign",
            name: "campaign",
            options: this.formatComboOptions(campaigns, 'name', 'name')
        }, {
            type: "select",
            label: "Role",
            name: "role",
            options: this.getFilteredRoles(roles, 'HIERARCHY'),
            onChange: this.handleOnChange
        }, {
            type: "select",
            isMulti: true,
            label: "Application Role",
            name: "miscellaneousRole",
            options: this.getFilteredRoles(roles, 'MISCELLANEOUS'),
            onChange: this.handleOnChange
        }];

        return (
            <FormBuilder
                fields={fields}
                ref="departmentDetailsForm"
                initialValues={!isEmpty(userData) ? {
                    department,
                    subDepartment,
                    unit: get(userData, 'unit'),
                    vertical: get(userData, 'vertical'),
                    campaign: get(userData, 'campaign'),
                    role,
                    miscellaneousRole: get(userData, 'miscellaneousRole', [])
                } : null}
                cols={4}
                exactFormValues={true}
            />
        );
    }

    handleOnChange = (selectedValue, name) => {
        this.setState({ [name]: selectedValue });
        if (name == "subDepartment") {
            this.getTeamDetails(selectedValue);
        }
    }

    getFilteredRoles = (roles, roleType) => {
        const filteredRoles = roles.filter((role) => (role.type === roleType));
        return this.formatComboOptions(filteredRoles, 'name', 'formattedName')
    }

    formatComboOptions = (options = [], labelKey, valueKey) => {
        return options.map(opt => {
            return {
                label: get(opt, labelKey),
                value: get(opt, valueKey)
            }
        })
    }

    buildReportingToDetailsForm = (userData) => {
        let { teamDetails, role, status, activationDate } = this.state;
        const { subDepartment, department } = userData;
        const reportingTo = get(userData, 'reportingTo', []);
        const teamRoles = get(teamDetails, 'roles', []);
        const userRole = find(teamRoles, { formattedName: role }) || {};

        /**Applicable ReportingTo roles = roles with level greater than the level of user role*/
        let { reportingToRoles, initialValues } = fetchReportingToRoles(reportingTo, teamRoles, userRole, status, activationDate, department);

        const fields = reportingToRoles.map(r => {
            return {
                type: "select",
                name: get(r, 'formattedName', '').toString(),
                label: get(r, 'name'),
                model: modelMap[department] || 'Employee',
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

    buildPermissionDetailsForm = (userData) => {
        const fields = [{
            type: "select",
            label: "Permission Template",
            name: "permissionTemplate",
            model: "PermissionTemplate",
            isMulti: true,
            displayKey: "name",
            value: get(userData, 'permissionTemplate'),
            valueKey: "formatted_name"
        }];

        return (
            <FormBuilder
                fields={fields}
                ref="permissionDetailsForm"
                initialValues={{
                    permissionTemplate: get(userData, 'permissionTemplate')
                }}
                cols={1}
                exactFormValues={true}
            />
        );
    }


    buildUserForm = (userData) => {
        const { user } = this.props;
        const canUpdatePermission = validatePermission(user, userPermissions.editUserPermission);

        return (
            <>
                <BoxHeader>General</BoxHeader>
                <BoxBody>{this.buildUserDetailsForm(userData)}</BoxBody>
                <BoxHeader>Department Details</BoxHeader>
                <BoxBody>{this.buildDepartmentDetailsForm(userData)}</BoxBody>
                <BoxHeader>Reporting To Details</BoxHeader>
                <BoxBody>{this.buildReportingToDetailsForm(userData)}</BoxBody>
                {canUpdatePermission &&
                    <>
                        <BoxHeader>Permission Details</BoxHeader>
                        <BoxBody>{this.buildPermissionDetailsForm(userData)}</BoxBody>
                    </>
                }
            </>
        )
    }

    handleReportingToChanges = (selectedOptions, role, originalValues) => {
        let { userFormValues = {} } = this.state;
        let { reportingTo = {} } = userFormValues
        let value = [];

        value = originalValues.map((originalValue, index) => {
            let selectedOption = {};
            let { value, label } = originalValue
            let userType = index == 0 ? "PRIMARY" : "SECONDARY"
            //selectedOption.level = level ? Number(level) : level.replace(/level/g, '')
            selectedOption.userType = userType
            selectedOption.userEmail = label

            return selectedOption;
        })

        reportingTo[role] = value
        userFormValues.reportingTo = reportingTo;
        this.setState({ userFormValues })
    }

    getTeamDetails = async (subDepartment) => {
        if (subDepartment) {
            this.setState({ loading: true, error: null });
            const bodyPayload = {
                name: subDepartment
            }
            callApi(`/usermanagement/hierarchy/subDepartment/details`, 'POST', bodyPayload, null, null, true)
                .then(response => {
                    this.setState({ teamDetails: response, loading: false, error: null })
                })
                .catch(error => {
                    this.setState({ error });
                })
        }
        else {
            this.setState({ teamDetails: {} });
        }
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

        if (!isEmpty(tnlId)) {
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

    onClickSaveUser = () => {
        const { email } = this.props;
        const { userFormValues = {}, userData = {} } = this.state;
        const { reportingTo } = userData;
        const { userDetailsForm, departmentDetailsForm, reportingToDetailsForm, permissionDetailsForm } = this.refs;
        const userDetails = userDetailsForm ? userDetailsForm.validateFormAndGetValues() : {};
        const departmentDetails = departmentDetailsForm ? departmentDetailsForm.validateFormAndGetValues() : {};
        const reportingToDetails = reportingToDetailsForm ? reportingToDetailsForm.validateFormAndGetValues() : {};
        const permissionDetails = permissionDetailsForm ? permissionDetailsForm.validateFormAndGetValues() : {};

        if (userDetails && departmentDetails && reportingToDetails && permissionDetails) {
            const { data, user } = this.props
            const method = "POST"
            const url = !email ? "/usermanagement/masteremployee/create" : `/usermanagement/masteremployee/update`

            try {
                const formattedReportingTo = this.getFormattedReportingTo(reportingToDetails);
                const dateFields = getFormattedDateFields(userDetails);

                const bodyPayload = {
                    email,
                    ...userDetails,
                    doj: get(userDetails, 'doj', "1970-01-01"),
                    activationDate: get(userDetails, 'activationDate', "1970-01-01"),
                    lastWorkingDate: get(userDetails, 'lastWorkingDate', "1970-01-01"),
                    ...departmentDetails,
                    role: isEmpty(get(departmentDetails, 'role', null)) ? null : get(departmentDetails, 'role', null),
                    reportingTo: formattedReportingTo,
                    ...permissionDetails
                }

                if (!isEmpty(dateFields)) {
                    bodyPayload["dateFields"] = dateFields;
                }

                this.setState({ loading: true, error: null })
                callApi(url, method, bodyPayload, null, null, true)
                    .then(response => {
                        this.props.history.goBack();
                        Notify.success(`User ${!email ? 'created' : 'updated'} successfully!`);
                    })
                    .catch(error => {
                        this.setState({ loading: false, error: error });
                        Notify.error(error);
                    })
            } catch (error) {
                this.setState({ loading: false, error });
            }
        }
    }

    getFormattedReportingTo = (reportingToDetails = {}) => {
        const reportingToRoles = Object.keys(reportingToDetails);
        const formattedReportingTo = {};

        reportingToRoles.forEach((reportingToRole) => {
            const reportingToUsers = reportingToDetails[reportingToRole];
            const users = reportingToUsers.map((user, index) => {
                return {
                    userEmail: user,
                    userType: (index === 0) ? 'PRIMARY' : 'SECONDARY'
                }
            });
            formattedReportingTo[reportingToRole] = users;
        });

        return formattedReportingTo;
    }

    getUserData = (email, department) => {
        this.setState({ loading: true, error: null })
        callApi(`/usermanagement/masteremployee/read`, "POST", { email, department: department || '' }, null, null, true)
            .then(response => {
                const department = get(response, 'department');
                this.setState({
                    userData: response,
                    role: get(response, 'role', ''),
                    department: isArray(department) ? department[0] : department,
                    subDepartment: get(response, 'subDepartment'),
                    loading: false
                });

                this.getTeamDetails(get(response, 'subDepartment'));
            })
            .catch(error => {
                this.setState({ loading: false, error: error });
            })
    }

    componentWillMount = async () => {
        let { email, user, department } = this.props || {};
        const isUserAdmin = validatePermission(user, userPermissions.createUserByAdmin);
        this.setState({ isUserAdmin });
        if (email) {
            this.getUserData(email, department);
        }
    }

    render() {
        const { loading, error, userData } = this.state;
        const { email } = this.props;
        const isAllowRendering = email ? !isEmpty(userData) : true;

        return (
            <Page loading={loading}  >
                <PageHeader heading="User Details" />
                <PageBody error={error}>
                    {isAllowRendering && this.buildUserForm(userData)}
                    <div className="text-right">
                        <Button type="button" color="success" onClick={this.onClickSaveUser}>Save</Button>{' '}
                        <Button type="button" color="danger" onClick={() => this.props.history.goBack()}>Close</Button>
                    </div>
                </PageBody>
            </Page>
        )
    }
}

const mapStateToProps = (state) => ({
    user: get(state, 'auth.user')
});

export default withRouter(connect(mapStateToProps)(UserForm))

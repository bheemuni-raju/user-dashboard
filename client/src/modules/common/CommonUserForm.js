import React, { Component } from 'react';
import { Button } from 'reactstrap'
import { chunk, get, capitalize, find, map, sortBy, flattenDeep, isEmpty, startCase } from 'lodash'

import { FormBuilder } from 'components/form';
import UserCommentDrawer from '../user/components/UserComment';
import UserHistory from '../user/components/UserHistory';
import { Box, BoxBody, BoxHeader } from 'components/box';
import { callApi } from 'store/middleware/api';
import { sales, validatePermission } from 'lib/permissionList';

class CommonUserForm extends Component {
    state = {
        status: "",
        formFields: {},
        userData: {},
        showCommentModal: false,
        showHistoryModal: false
    }

    componentWillMount = async () => {
        const { department } = this.props;
        this.getUserFormTemplate(department);
    }

    componentWillUpdate = async (nextProps, nextState) => {
        const status = get(this, "props.userData.status");
        const nextStatus = get(nextProps, "userData.status");
        if (status !== nextStatus) {
            this.setState({ status: nextStatus })
        }
    }

    validateFormAndGetValues = () => {
        const { userDetailsForm, departmentDetailsForm } = this.refs;
        const userDetails = userDetailsForm ? userDetailsForm.validateFormAndGetValues() : {};
        const departmentDetails = departmentDetailsForm ? departmentDetailsForm.validateFormAndGetValues() : {};
        return (userDetails && departmentDetails) ? {
            ...userDetails, ...departmentDetails
        } : null;
    }

    getGeneralFields = (userData) => {
        const { status = "" } = this.state;
        const { validateUserSection } = this.props;
        let dateFields = get(userData, "dateFields", {});
        const additionalDetails = get(userData, 'additionalDetails', {});
        let languageArray = get(additionalDetails, "languageFormattedName", []);
        languageArray = isEmpty(languageArray) ? [] : languageArray.map((language) => {
            return startCase(language);
        });

        let fields = [];
        let generalFormFields = get(this, "state.formFields.general");
        if (!isEmpty(generalFormFields)) {
            fields = this.getFormattedGeneralFields(userData, generalFormFields);
        }
        if (status) {
            fields = this.props.getUpdatedUserFormFields(fields, status);
        }

        return (
            <>
                <FormBuilder
                    fields={fields}
                    ref="userDetailsForm"
                    initialValues={!isEmpty(userData) ? {
                        ...userData,
                        ...dateFields,
                        location: get(userData, "location", ""),
                        country: get(userData, "country", ""),
                        language: languageArray.join(","),
                        tenure: get(additionalDetails, "tenure", ""),
                        lsUserName: get(additionalDetails, "lsUserName", ""),
                        fdUserName: get(additionalDetails, "fdUserName", ""),
                        byjusClasses: get(additionalDetails, "byjusClasses", ""),
                        highPriority: get(additionalDetails, "highPriority", ""),
                        capacity: get(additionalDetails, "capacity", ""),
                        weekoffWkOneDayOne: get(additionalDetails, "weekoffWkOneDayOne", ""),
                        weekoffWkOneDayTwo: get(additionalDetails, "weekoffWkOneDayTwo", ""),
                        weekoffWkTwoDayOne: get(additionalDetails, "weekoffWkTwoDayOne", ""),
                        weekoffWkTwoDayTwo: get(additionalDetails, "weekoffWkTwoDayTwo", ""),
                        webSite: get(additionalDetails, "webSite", ""),
                        customerType: get(additionalDetails, "customerType", ""),
                        nestingEnabled: get(additionalDetails, "nestingEnabled", ""),
                    } : null}
                    validateValues={validateUserSection}
                    cols={4}
                    exactFormValues={true}
                />
            </>
        )
    }

    getFormattedGeneralFields = (userData, generalFormFields) => {
        const location = get(userData, "location", "");
        let locationFilter = (!isEmpty(userData) || !isEmpty(this.state.search)) ? { "city": { "$regex": this.state.search || location, "$options": "i" } } : {};

        let { department, subDepartment } = this.props

        generalFormFields = generalFormFields.map((field) => {
            console.log(field);
            if (field.name === "status") {
                if (subDepartment === "sales_operations") {
                    field.options = field.options.filter(x => x.value != "non_sales");
                }
                field.onChange = this.handleOnChange
            }
            else if (field.name === "email") {
                field.disabled = !isEmpty(userData)
            }
            else if (field.name === "location") {
                field.filter = locationFilter
                field.onInputChange = search => search && this.setState({ search })
            }

            if (department === "business_development" && field.name === "contact") {
                field.disabled = true;
            }

            return field;
        })

        return generalFormFields;
    }

    getDepartmentFields = (userData) => {
        let fields = [];
        let { department = "", subDepartment = "", role = "", user } = this.props;
        let { status } = this.state;
        let unit = get(userData, 'unit', "");
        let vertical = get(userData, 'vertical', "");
        let campaign = get(userData, 'campaign', "");
        const additionalDetails = get(userData, 'additionalDetails', []);
        let additionalRegions = get(additionalDetails, "additionalRegions", []);
        let miscellaneousRole = get(userData, 'miscellaneousRole', []);
        let sfVertical = get(additionalDetails, "sfVertical", "");
        let teamName = get(additionalDetails, "teamName", "");
        let hiringCampaign = get(additionalDetails, "hiringCampaign", "");

        let departmentFormFields = get(this, "state.formFields.department");
        if (!isEmpty(departmentFormFields)) {
            fields = this.getFormattedDepartmentFields(userData, departmentFormFields);
        }

        const viewHiringCampaign = validatePermission(user, get(sales, 'salesViewHiringCampaign', ''));
        if (viewHiringCampaign) {
            fields.push({
                "type": "text",
                "label": "Hiring Campaign",
                "name": "hiringCampaign",
                "placeholder": "Enter Hiring Campaign"
            });
        }

        if (["non_sales", "Non Sales"].includes(status)) {
            department = get(this, "state.department", "");
        }

        if (["non_sales", "Non Sales", "transition", "Transition"].includes(status)) {
            subDepartment = get(this, "state.subDepartment", "");
            unit = get(this, "state.unit", "");
            vertical = get(this, "state.vertical", "");
            campaign = get(this, "state.campaign", "");
            role = get(this, "state.role", "");
            additionalRegions = get(this, "state.additionalRegions", []);
            miscellaneousRole = get(this, "state.miscellaneousRole", []);
        }

        return (
            <FormBuilder
                fields={fields}
                ref="departmentDetailsForm"
                initialValues={{
                    department,
                    subDepartment,
                    ...(!isEmpty(userData) ? {
                        unit,
                        vertical,
                        campaign,
                        additionalRegions,
                        role,
                        miscellaneousRole,
                        sfVertical,
                        teamName,
                        hiringCampaign
                    } : {})
                }}
                cols={3}
                exactFormValues={true}
            />
        );
    }

    getFormattedDepartmentFields = (userData, departmentFormFields) => {
        let { department, subDepartment } = this.props;
        let { teamDetails = {}, regionList, additionalRegionList, status } = this.state;

        const units = get(teamDetails, 'units', []);
        const verticals = get(teamDetails, 'verticals', []);
        const campaigns = get(teamDetails, 'campaigns', []);
        const roles = get(teamDetails, 'roles', []);
        regionList = isEmpty(regionList) ? campaigns : regionList;
        additionalRegionList = isEmpty(additionalRegionList) ? campaigns : additionalRegionList;

        let subDepartmentFromProps = isEmpty(subDepartment) ? get(userData, 'subDepartment', '') : subDepartment;
        let departmentFromProps = isEmpty(department) ? get(userData, 'department', '') : department;
        department = isEmpty(departmentFromProps) ? get(teamDetails, 'departmentFormattedName', '') : departmentFromProps;
        subDepartment = isEmpty(subDepartmentFromProps) ? get(teamDetails, 'formattedName', '') : subDepartmentFromProps;

        departmentFormFields = departmentFormFields.map((field) => {
            if (field.name === "department") {
                field.filter = { formattedName: department }
                field.disabled = isEmpty(departmentFromProps) ? false : true
            }
            else if (field.name === "subDepartment") {
                field.filter = { departmentFormattedName: department }
                field.loadByDefault = department ? true : false
                field.disabled = isEmpty(get(teamDetails, 'formattedName', '')) ? false : true
            }
            else if (field.name === "unit") {
                field.options = this.formatComboOptions(units, 'name', 'name')
            }
            else if (field.name === "additionalRegions") {
                field.options = this.formatComboOptions(additionalRegionList, 'name', 'name')
            }
            else if (field.name === "vertical") {
                field.options = this.formatComboOptions(verticals, 'name', 'name')
            }
            else if (field.name === "campaign") {
                field.options = this.formatComboOptions(campaigns, 'name', 'name')
            }
            else if (field.name === "role") {
                field.options = this.getFilteredRoles(roles, 'HIERARCHY')
            }
            else if (field.name === "miscellaneousRole") {
                field.options = this.getFilteredRoles(roles, 'MISCELLANEOUS')
            }

            if (["non_sales", "Non Sales", "transition", "Transition"].includes(status)) {
                field = this.getNonSalesDepartmentFormFields(field);
            }

            field.onChange = this.handleOnChange
            return field;
        });

        return departmentFormFields;
    }

    getNonSalesDepartmentFormFields = (field) => {
        let department = get(this, "state.department", "");
        let { status } = this.state;
        if (["transition", "Transition"].includes(status)) {
            department = get(this, "props.department", "");
        }

        if (["non_sales", "Non Sales"].includes(status)) {
            if (field.name === "department") {
                field.filter = {};
                field.loadByDefault = true;
                field.disabled = false;
                field.required = false;
            }
        }

        if (field.name === "subDepartment") {
            field.filter = !isEmpty(department) ? { departmentFormattedName: department } : {};
            field.loadByDefault = false;
            field.required = false;
            field.disabled = !isEmpty(department) ? false : true;
        }
        else if (["unit", "additionalRegions", "vertical", "campaign", "role", "miscellaneousRole"].includes(field.name)) {
            this.formatComboOptions([], 'name', 'name')
            field.required = false;
        }

        return field;
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

    handleOnChange = (selectedValue, name) => {
        this.setState({ [name]: selectedValue });
        if (name == "subDepartment") {
            this.getTeamDetails(selectedValue);
        }
        if (name == "department") {
            this.setState({ teamDetails: null, subDepartment: null });
        }
        this.props.handleOnChange(selectedValue, name)
    }

    getTeamDetails = async (subDepartment, searchKey) => {
        if (subDepartment) {
            this.setState({ loading: true, error: null });

            const bodyPayload = {
                name: subDepartment
            }

            callApi(`/usermanagement/hierarchy/subDepartment/details`, 'POST', bodyPayload, null, null, true)
                .then(response => {
                    this.setState({ teamDetails: response, loading: false, error: null })
                    this.props.handleOnChange(response, "teamDetails")

                })
                .catch(error => {
                    this.setState({ error });
                })
        }
        else {
            this.setState({ teamDetails: {} });
        }
    }

    getUserFormTemplate = (department) => {
        callApi(`/usermanagement/common/getUserFormTemplate/${department}`, "GET", null, null, null, true)
            .then(response => {
                const formFields = get(response, 'formFields', []);
                this.setState({ formFields: formFields });
            })
            .catch(error => {
                this.setState({ error });
            })
    }

    render() {
        const { userData, showCommentModal, showHistoryModal } = this.props;

        return (
            <>
                <BoxHeader>General</BoxHeader>
                <BoxBody>{this.getGeneralFields(userData)}</BoxBody>
                <BoxHeader>Department Details</BoxHeader>
                <BoxBody>{this.getDepartmentFields(userData)}</BoxBody>
                {userData && showCommentModal &&
                    <UserCommentDrawer
                        email={get(userData, 'email', '')}
                        loadUrl={this.props.loadCommentUrl}
                        updateUrl={this.props.updateCommentUrl}
                        loggedInUser={this.props.user}
                        closeModal={this.props.onCloseCommentModal}
                    />}
                {userData && showHistoryModal &&
                    <UserHistory
                        email={get(userData, 'email', '')}
                        userData={userData}
                        history={get(userData, 'history', [])}
                        closeModal={this.props.onCloseHistoryModal}
                    />}
            </>
        )
    }
}

export default CommonUserForm


import React, { Component } from 'react';
import { get, isEmpty, map, pick } from 'lodash';

import { FormBuilder } from 'components/form';
import { BoxBody } from 'components/box';
import { Button } from 'reactstrap'

import { fetchDependentSeperationReason, fetchEscalationPriority, validateDateRange, validateEmailFormat } from '../../user/utils/userUtil';

class AttritionForm extends Component {
    constructor(props) {
        super(props);
        this.state = {
            userData: {}
        }
    }

    onChange = (selectedValue, name) => {
        if (get(selectedValue, "target.type") == "radio" && get(selectedValue, "target.name") == "lessThanDRPS") {
            let { isLessDRPS } = this.state;
            isLessDRPS = selectedValue.target.value == "yes" ? true : false;
            this.setState({ isLessDRPS: isLessDRPS })
        }
        else {
            this.setState({ [name]: selectedValue })
        }
    }

    buildAttritionDetailsForm = () => {
        const { userData = {}, primarySeperationReason, isLessDRPS } = this.state;
        const subCategoryOptions = fetchDependentSeperationReason(primarySeperationReason);
        const escalationPriorityOptions = fetchEscalationPriority(primarySeperationReason);
        let ratingTooltips = ["1", "2", "3", "4", "5", "6", "7", "8", "9", "10"];

        let fields = [{
            type: "email",
            label: 'Filled By',
            name: 'filledByEmail',
            placeholder: "Enter Email of AVP/Senior Manager",
            required: true
        }, {
            type: "date",
            label: `Relieving Form Filled Date`,
            name: `relievingFormFilledDate`,
            required: true
        }, {
            type: "select",
            label: "Type of Seperation",
            name: "typeOfSeperation",
            options: [
                { label: 'Resignation', value: 'resignation' },
                { label: 'Termination', value: 'termination' },
                { label: 'Absconding', value: 'absconding' },
                { label: 'Inter-Department Movement', value: 'interDepartmentMovement' }
            ],
            required: true
        }, {
            type: "textarea",
            label: "Reason for Seperation as per AVP/Senior Manager",
            name: "reasonForSeperation"
        }, {
            type: "select",
            label: "Seperation Reason [Primary Category]",
            name: "primarySeperationReason",
            options: [
                { label: 'Management Issue', value: 'managementIssue' },
                { label: 'Work Culture', value: 'workCulture' },
                { label: 'Policy Issue', value: 'policyIssue' },
                { label: 'Personal Reasons', value: 'personalReasons' },
                { label: 'Others', value: 'othersCategory' },
                { label: 'Termination', value: 'termination' },
                { label: 'Wrong Hire', value: 'wrongHire' },
                { label: 'NATC', value: 'natc' }
            ],
            value: primarySeperationReason,
            onChange: this.onChange
        }, {
            type: "select",
            label: "Seperation Reason [Dependent Sub-Category]",
            name: "dependentSeperationReason",
            options: subCategoryOptions,
            disabled: isEmpty(subCategoryOptions) ? true : false
        }, {
            type: "select",
            label: "Priority of Escalation",
            name: "escalationPriority",
            options: escalationPriorityOptions,
            disabled: isEmpty(escalationPriorityOptions) ? true : false
        }, {
            type: "textarea",
            label: "Remarks/Escalated Against",
            name: "remarkSection"
        }, {
            type: "textarea",
            label: "Summary",
            name: "summarySection"
        }, {
            type: "textarea",
            label: "Reporting Manager as per Employee",
            name: "reportingManager"
        }, {
            type: "rate",
            count: 10,
            tooltips: ratingTooltips,
            label: "Rating for Reporting Manager [Between 1 to 10]",
            name: "reportingManagerRating"
        }, {
            type: "rate",
            count: 10,
            tooltips: ratingTooltips,
            label: "Rating for Senior Manager [Between 1 to 10]",
            name: "seniorManagerRating"
        }, {
            type: "rate",
            count: 10,
            tooltips: ratingTooltips,
            label: "Rating for AVP [Between 1 to 10]",
            name: "avpRating"
        }, {
            type: "radio",
            label: "Less than 10K DRPS",
            name: "lessThanDRPS",
            options: [
                { label: "Yes", value: "yes", checked: isLessDRPS },
                { label: "No", value: "no", checked: (isLessDRPS == undefined) ? isLessDRPS : !isLessDRPS }
            ],
            onChange: this.onChange
        }];

        const initialValues = this.extractDefaultValues(fields, get(userData, 'attritionDetails', {}));

        return (
            <div style={{ width: '50%', marginLeft: '25%' }}>
                <FormBuilder
                    fields={fields}
                    ref="salesAttritionForm"
                    initialValues={!isEmpty(userData) ? {
                        ...initialValues,
                        lastWorkingDate: get(userData, 'lastWorkingDate', null)
                    } : null}
                    validateValues={this.validateAttritionSection}
                    cols={1}
                    exactFormValues={true}
                />
            </div>
        );
    }

    validateAttritionSection = (formValues = {}) => {
        let { filledByEmail = "", relievingFormFilledDate = "" } = formValues;
        let validationErrors = {};

        let validateEmailFlag = validateEmailFormat(filledByEmail);
        if (!isEmpty(filledByEmail) && !validateEmailFlag) {
            validationErrors["filledByEmail"] = `Please enter valid byjus email id`
        }

        if (!validateDateRange(relievingFormFilledDate)) {
            validationErrors["relievingFormFilledDate"] = `Please enter valid Relieving Form Filled Date`
        }

        return validationErrors;
    }

    extractDefaultValues = (fields, defaultValues) => {
        const fieldKeys = map(fields, 'name');

        const requiredValues = pick(defaultValues, fieldKeys);
        return requiredValues;
    }

    getAttritionDetails = () => {
        const { salesAttritionForm } = this.refs;
        let { isLessDRPS } = this.state;
        let lessThanDRPS = isLessDRPS ? "yes" : "no";
        const attritionDetails = salesAttritionForm ? salesAttritionForm.validateFormAndGetValues() : {};
        let relievingFormFilledDate = get(attritionDetails, "relievingFormFilledDate", "1970-01-01");

        if (attritionDetails) {
            return {
                ...attritionDetails,
                relievingFormFilledDate,
                lessThanDRPS: lessThanDRPS
            }
        }
        else {
            return null;
        }
    }

    getAttritionStateValues = () => {
        let { salesAttritionFormValues } = this.state;
        return salesAttritionFormValues;
    }

    buildForm = () => {
        return (
            <>
                <BoxBody>{this.buildAttritionDetailsForm()}</BoxBody>
                <div className="text-right">
                    <Button id="btnSave" type="button" color="success" onClick={this.onSaveAttritionDetails}>Save Attrition Details</Button>{' '}
                    <Button id="btnBack" type="button" color="danger" onClick={this.goBack}>Back</Button>
                </div>
            </>
        )
    }

    componentDidMount = () => {
        const { userData } = this.props;

        this.setState({ userData }, () => {
            const primaryReason = get(userData, 'attritionDetails.primarySeperationReason', '')
            this.onChange(primaryReason, 'primarySeperationReason')

            let { isLessDRPS } = this.state;
            if (get(userData, "attritionDetails.lessThanDRPS")) {
                isLessDRPS = (get(userData, 'attritionDetails.lessThanDRPS') == "yes") ? true : false;
            }
            this.setState({ isLessDRPS: isLessDRPS })
        });
    }

    onSaveAttritionDetails = () => {
        const attritionDetails = this.getAttritionDetails();
        if (attritionDetails) {
            this.setState({ salesAttritionFormValues: attritionDetails });
            this.goBack();
        }
    }

    goBack = () => {
        this.props.toggleTab("1");
    }

    render() {
        return (
            <>
                {this.buildForm()}
            </>
        )
    }
}

export default AttritionForm;
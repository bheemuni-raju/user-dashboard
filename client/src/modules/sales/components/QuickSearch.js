import React from 'react';
import { connect } from 'react-redux';
import { startCase, get, concat, isEmpty, orderBy } from 'lodash';

import FormBuilder from 'components/form/FormBuilder';
import { callApi } from 'store/middleware/api';

class QuickSearch extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            formValues: {
                filterBy: '',
                email: '',
                employeeDetails: '',
                reportingDetails: ''
            }
        };
    }

    getSearchFields = () => {
        const { salesDetails = {} } = this.props;
        const { employeeDetails = {}, filterBy, email } = this.state;
        const { roles } = salesDetails || [];
        let hierarchyRoles = !isEmpty(roles) ? roles.filter(role => get(role, 'type') == "HIERARCHY") : [];
        hierarchyRoles = orderBy(hierarchyRoles, ['level'], ['asc']);
        let hierarchyEmails = employeeDetails.docs;
        let roleOptions = [];
        let emailOptions = [];

        let subDepartmentFilter = [{
            selectedColumn: "subDepartment",
            selectedOperator: "in",
            selectedValue: [get(salesDetails, 'formattedName')]
        }];

        hierarchyRoles && hierarchyRoles.map(role => {
            const roleFilter = [{
                selectedColumn: "role",
                selectedOperator: "in",
                selectedValue: [get(role, 'formattedName')]
            }];

            roleOptions.push({
                label: startCase(get(role, 'name', '')),
                value: get(role, 'formattedName'),
                contextCriterias: concat(subDepartmentFilter, roleFilter)
            });
        });

        hierarchyEmails && hierarchyEmails.map(employee => {

            emailOptions.push({
                label: get(employee, 'email', ''),
                value: get(employee, 'email')
            });
        });

        let emailFilter = null;
        if (!isEmpty(emailOptions) && !isEmpty(this.state.search)) {
            emailFilter = { subDepartment: get(salesDetails, 'formattedName'), "role": filterBy, "email": { "$regex": this.state.search, "$options": "i" } };
        }
        else if (!isEmpty(email) || !isEmpty(this.state.search)) {
            if (!isEmpty(email)) {
                emailFilter = { subDepartment: get(salesDetails, 'formattedName'), "role": filterBy, "email": email };
            }

            if (!isEmpty(this.state.search)) {
                emailFilter = { subDepartment: get(salesDetails, 'formattedName'), "role": filterBy, "email": { "$regex": this.state.search, "$options": "i" } };
            }
        }
        else {
            emailFilter = { subDepartment: get(salesDetails, 'formattedName'), "role": filterBy };
        }

        return [{
            name: 'filterBy',
            type: 'select',
            value: filterBy,
            onChange: this.handleOnChange,
            placeholder: 'Filter By',
            options: roleOptions
        },
        {
            type: "select",
            name: "email",
            model: "Employee",
            filter: emailFilter,
            placeholder: 'Enter Email',
            onInputChange: search => search && this.setState({ search }),
            //onChange: this.handleOnChange,
            displayKey: "email",
            valueKey: "email",
            required: true,
            disabled: isEmpty(filterBy) ? true : false
        }, {
            type: 'button',
            text: 'Search',
            onClick: this.onClickSearch
        }];
    }

    handleOnChange = async (selectedValue, name) => {
        this.setState({ [name]: selectedValue });
        let { salesDetails } = this.props;
        if (name == 'filterBy') {
            let filter = {
                "subDepartment": get(salesDetails, 'formattedName', ''),
                "role": selectedValue
            }
            await this.getRoleBasedEmployees(filter, "onchange");
        }
    }

    onClickSearch = async () => {
        const { filterBy } = this.state;
        const { updateSearchCriterias, salesDetails } = this.props;
        const searchForm = this.refs.searchForm;
        const formValues = searchForm.getFormValues();
        let email = get(formValues, 'email');

        let filter = {
            "conditionType": "$and",
            "searchBuilder": [
                {
                    "selectedColumn": `subDepartment`,
                    "selectedOperator": "in",
                    "selectedValue": [get(salesDetails, 'formattedName', '')]
                },
                {
                    "selectedColumn": `reportingTo.${filterBy}.userEmail`,
                    "selectedOperator": "in",
                    "selectedValue": [email]
                }
            ]
        }

        updateSearchCriterias && updateSearchCriterias(filter);

        this.setState({
            formValues
        });
    };

    getRoleBasedEmployees = async (filter, functionType) => {
        const bodyPayload = {
            filter
        }

        this.setState({ loading: true, error: null });
        callApi(`/usermanagement/employee/list`, 'POST', bodyPayload, null, null, true)
            .then(response => {
                if (functionType == "onchange") {
                    this.setState({ employeeDetails: response, loading: false, error: null })
                }
                else if (functionType == "onclick") {
                    this.setState({ reportingDetails: response, loading: false, error: null })
                }

            })
            .catch(error => {
                this.setState({ loading: false, error });
            })
    }

    componentDidMount = async () => {
        let salesDetails = this.props;
    }

    render() {
        const { loading, error, formValues, filterByValues } = this.state;
        const { role, email } = formValues;

        const fields = this.getSearchFields(filterByValues);

        const selectRowProp = {
            mode: 'checkbox',
            bgColor: 'lightblue',
            onSelect: this.handleOnSelect,
            onSelectAll: this.handleOnSelectAll,
            clickToSelect: false
        };

        return (
            <FormBuilder
                ref="searchForm"
                fields={fields}
                initialValues={formValues}
                cols={4}
            />
        );
    }
}

const mapStateToProps = state => ({
    user: state.auth.user
});

export default connect(mapStateToProps)(QuickSearch);
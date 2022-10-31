import React, { Component } from 'react';
import { get, capitalize, remove, isEmpty } from 'lodash';
import { Button } from 'reactstrap';
import Notify from "react-s-alert";

import { BoxBody } from 'components/box';
import { callApi } from 'store/middleware/api';
import FormBuilder from 'components/form/FormBuilder';
import { validateEmail } from 'modules/user/utils/userUtil';

class AssignUnassignPermissionTemplate extends Component {
    constructor(props) {
        super(props);
        this.state = {
            loading: false,
            error: null
        }
    }

    componentWillMount = async () => {
        this.setState({ showModal: true })
    }

    onClickOk = async () => {
        const { operation, templateData } = this.state;
        const emails = this.getEmails();

        const payload = {
            templateFormattedName: get(templateData, 'formatted_name'),
            emails
        };

        if (emails) {
            this.setState({ loading: true, error: null });
            await callApi(`/usermanagement/permission/permissionTemplate/${operation}`, "POST", payload, null, null, true)
                .then(async (res) => {
                    Notify.success(`Successfully ${operation}ed ${get(templateData, 'name', '')} Template`);
                    this.setState({ loading: false, error: null });
                    this.onClickClose();
                })
                .catch((err) => {
                    this.setState({ loading: false, error: err });
                });
        }
    }

    getEmails = () => {
        const { assignUnassignTemplateForm } = this.refs;
        const formValues = (assignUnassignTemplateForm && assignUnassignTemplateForm.validateFormAndGetValues());

        if (formValues) {
            const { emails } = formValues;
            //Split by comma or  new-line
            let emailArray = emails.split(/[\n,]/);

            remove(emailArray, e => !e);
            let nonByjusEmailArray = emailArray.map(email => {
                let validEmailFlag = validateEmail(email);
                if (!validEmailFlag) {
                    return email;
                }
            });

            nonByjusEmailArray = nonByjusEmailArray.filter(email => !isEmpty(email));

            if (nonByjusEmailArray.length) {
                this.setState({ error: `Invalid Email Ids : ${nonByjusEmailArray.join()} Please input valid byjus email Ids.` });
                return null;
            }
            else if (emailArray.length > 100) {
                this.setState({ error: "Max. Email Id(s) must be less than or equal to 50" });
                return null;
            }
            else {
                return emailArray;
            }
        }
    }

    onClickClose = () => {
        this.props.history.goBack();
    }

    componentWillMount = () => {
        const { operation, templateData } = get(this.props, 'location.state');
        this.setState({ operation, templateData });
    }

    render = () => {
        const { loading, error, operation, templateData } = this.state;

        const fields = [{
            name: "emails",
            label: "Input Email Id(s):",
            type: "textarea",
            required: true,
            style: { height: '200px' }
        }];

        return (
            <BoxBody loading={loading} error={error}>
                <div className="card">
                    <div className="card-header">{`${capitalize(operation)} ${get(templateData, 'name', '')} Template`}</div>
                    <div className="card-body">
                        <FormBuilder
                            ref="assignUnassignTemplateForm"
                            fields={fields}
                            cols={1}
                        />
                    </div>
                    <div className="card-footer text-right">
                        <Button color="success" size="sm" onClick={this.onClickOk}>Ok</Button>{" "}
                        <Button color="danger" size="sm" onClick={this.onClickClose}>Cancel</Button>
                    </div>
                </div>
            </BoxBody>
        )
    }
}

export default AssignUnassignPermissionTemplate;

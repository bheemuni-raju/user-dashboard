import React, { Component } from 'react';
import { get, capitalize, remove, isEmpty } from 'lodash';
import { Button } from 'reactstrap';
import Notify from "react-s-alert";

import { BoxBody } from 'components/box';
import { callApi } from 'store/middleware/api';
import FormBuilder from 'components/form/FormBuilder';
import { validateEmailFormat } from 'modules/user/utils/userUtil';

class AssignUnassignGroup extends Component {
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
        const { operation, groupData } = this.state;
        const emails = this.getEmails();

        const payload = {
            appGroupName: get(groupData, 'appGroupName'),
            appName: 'ums',
            emails
        };

        if (emails) {
            this.setState({ loading: true, error: null });
            await callApi(`/usermanagement/appgroup/${operation}`, "POST", payload, null, null, true)
                .then(async (res) => {
                    Notify.success(`Successfully ${operation}ed ${get(groupData, 'name', '')} Group`);
                    this.setState({ loading: false, error: null });
                    this.onClickClose();
                })
                .catch((err) => {
                    this.setState({ loading: false, error: err });
                });
        }
    }

    getEmails = () => {
        const { assignUnassignGroup } = this.refs;
        const formValues = (assignUnassignGroup && assignUnassignGroup.validateFormAndGetValues());

        if (formValues) {
            const { emails } = formValues;
            //Split by comma or  new-line
            let emailArray = emails.split(/[\n,]/);

            remove(emailArray, e => !e);
            let nonByjusEmailArray = emailArray.map(email => {
                let validEmailArray = validateEmailFormat(email);
                if (isEmpty(validEmailArray)) {
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
        const { operation, groupData } = get(this.props, 'location.state');
        this.setState({ operation, groupData });
    }

    render = () => {
        const { loading, error, operation, groupData } = this.state;

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
                    <div className="card-header">{`${capitalize(operation)} ${get(groupData, 'name', '')} Group`}</div>
                    <div className="card-body">
                        <FormBuilder
                            ref="assignUnassignGroup"
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

export default AssignUnassignGroup;

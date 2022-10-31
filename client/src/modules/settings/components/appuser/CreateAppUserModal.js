import React, { useState, useEffect, useRef } from 'react';
import { get, capitalize, remove, isEmpty } from 'lodash';
import { Button } from 'reactstrap';
import Notify from "react-s-alert";
import { useSelector } from 'react-redux';

import { BoxBody } from 'components/box';
import { callApi } from 'store/middleware/api';
import FormBuilder from 'components/form/FormBuilder';
import { validateEmail } from 'modules/user/utils/userUtil';

const CreateAppUserModal = (props) => {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [showModal, setShowModal] = useState(false);
    const user = useSelector(state => get(state, 'auth.user'));
    const formRef = useRef();

    useEffect(() => {
        setShowModal(true);
    }, []);

    const onClickOk = async () => {
        const formValues = (formRef && formRef.current.validateFormAndGetValues());

        if (formValues) {
            const { appRoleName, skill } = formValues;
            const emails = getEmails();

            const payload = {
                appRoleName,
                skill,
                appName: "ums",
                emails,
                orgFormattedName: get(user, 'orgFormattedName', ''),
                orgId: get(user, 'orgId', '')
            };

            if (emails) {
                setLoading(true);
                setError(null);
                await callApi(`/usermanagement/appuser/assign`, "POST", payload, null, null, true)
                    .then(async (res) => {
                        Notify.success(`Successfully assigned Role`);
                        setLoading(false);
                        setError(null);
                        onClickClose();
                    })
                    .catch((err) => {
                        setLoading(false);
                        setError(err);
                    });
            }
        }

    }

    const getEmails = () => {
        const formValues = (formRef && formRef.current.validateFormAndGetValues());

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
                setError(`Invalid Email Ids : ${nonByjusEmailArray.join()} Please input valid byjus email Ids.`);
                return null;
            }
            else if (emailArray.length > 100) {
                setError("Max. Email Id(s) must be less than or equal to 50");
                return null;
            }
            else {
                return emailArray;
            }
        }
    }

    const onClickClose = () => {
        props.history.goBack();
    }

    const fields = [{
        name: "emails",
        label: "Input Email Id(s):",
        type: "textarea",
        required: true,
        style: { height: '200px' }
    }, {
        type: "select",
        name: "appRoleName",
        label: "Application Role",
        model: "AppRole",
        filter: { 'appName': 'ums', 'status': 'active', 'orgFormattedName': get(user, 'orgFormattedName', '') },
        displayKey: "appRoleName",
        valueKey: "appRoleName",
        required: true
    }, {
        type: "select",
        name: "skill",
        label: "Skill",
        required: true,
        options: [
            { label: "Beginner", value: "beginner" },
            { label: "Intermediate", value: "intermediate" },
            { label: "Expert", value: "expert" }
        ],
    }];

    return (
        <BoxBody loading={loading} error={error}>
            <div className="card">
                <div className="card-body">
                    <FormBuilder
                        ref={formRef}
                        fields={fields}
                        cols={1}
                    />
                </div>
                <div className="card-footer text-right">
                    <Button color="success" size="sm" onClick={onClickOk}>Ok</Button>{" "}
                    <Button color="danger" size="sm" onClick={onClickClose}>Cancel</Button>
                </div>
            </div>
        </BoxBody>
    )
}

export default CreateAppUserModal;

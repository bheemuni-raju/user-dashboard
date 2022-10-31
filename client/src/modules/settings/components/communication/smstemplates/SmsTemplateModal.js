import React, { useEffect, useState, useRef, Fragment } from 'react';
import { connect } from 'react-redux';
import { Button, Row, Col } from 'reactstrap';
import { get, isEmpty, startCase } from 'lodash';

import ModalWindow from 'components/modalWindow';
import { FormBuilder } from 'components/form';
import { callApi } from 'store/middleware/api';
import { MentionsInput, Mention } from 'react-mentions'
import Notify from 'react-s-alert';

const SmsTemplateModal = (props) => {
    const [showModal, setShowModal] = useState(true);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const { smsTemplateData = {} } = props;
    const formRef = useRef();

    const [input, setInput] = useState('');
    const [changed, setChanged] = useState(false);
    const [placeholderArray, setPlaceholderArray] = useState([]);

    const [placeholderSuggestions, setPlaceholderSuggestions] = useState([]);

    useEffect(() => {
        renderPlaceholderSuggestions();
    }, [])

    const buildForm = () => {
        const { smsTemplateData = {}, user } = props;
        const fields = [{
            type: 'text',
            name: 'name',
            label: 'SMS Template Name',
            required: true,
            disabled: isEmpty(smsTemplateData) ? false : true,
        }, {
            type: 'select',
            name: 'language',
            label: 'Language',
            options: [
                { label: "English", value: "english" },
                { label: "Hindi", value: "hindi" }
            ],
            required: true,
            disabled: isEmpty(smsTemplateData) ? false : true,
        }, {
            type: 'select',
            name: 'contentType',
            label: 'Type',
            options: [
                { label: "Transactional", value: "transactional" },
                { label: "Promotional", value: "promotional" }
            ],
            required: true
        }, {
            type: "select",
            isMulti: true,
            name: "activeProviders",
            label: "Providers",
            model: 'SmsProvider',
            required: true,
            filter: { 'appName': 'ums', 'status': 'active', orgFormattedName: get(user, "orgFormattedName", "") },
            displayKey: 'name',
            valueKey: 'formattedName'
        }];

        let { placeholders = [], content } = smsTemplateData;
        let formattedContent = !isEmpty(input) ? input : (changed) ? input : content;
        formattedContent = !isEmpty(formattedContent) ? formattedContent.toString() : '';

        return (
            <>
                <FormBuilder
                    ref={formRef}
                    fields={fields}
                    initialValues={{
                        ...smsTemplateData,
                        placeholders: placeholders.join(",")
                    }}
                    cols={2}
                />
                <p>SMS Content</p>
                <MentionsInput
                    value={formattedContent}
                    onChange={onChangeSmsText}
                    placeholder="You can use @ to add placeholder here. Each template placeholder supports 30 characters."
                    style={{
                        control: {
                            backgroundColor: '#fff',
                            fontSize: 14,
                            fontWeight: 'normal',
                            height: "150px"
                        },

                        '&multiLine': {
                            control: {
                                fontFamily: 'monospace',
                                minHeight: 63,
                            },
                            highlighter: {
                                padding: 9,
                                border: '1px solid transparent',
                            },
                            input: {
                                padding: 9,
                                border: '1px solid silver',
                            },
                        },

                        '&singleLine': {
                            display: 'inline-block',
                            width: 180,

                            highlighter: {
                                padding: 1,
                                border: '2px inset transparent',
                            },
                            input: {
                                padding: 1,
                                border: '2px inset',
                            },
                        },

                        suggestions: {
                            list: {
                                backgroundColor: 'white',
                                border: '1px solid rgba(0,0,0,0.15)',
                                fontSize: 14,
                            },
                            item: {
                                padding: '5px 15px',
                                borderBottom: '1px solid rgba(0,0,0,0.15)',
                                '&focused': {
                                    backgroundColor: '#cee4e5',
                                },
                            },
                        },
                    }}
                >
                    <Mention
                        trigger="@"
                        data={placeholderSuggestions}
                    />
                </MentionsInput>
                <br />
            </>
        )
    }

    const renderPlaceholderSuggestions = () => {
        let uri = `/usermanagement/placeholder/list`;
        let method = 'POST';
        callApi(uri, method, { limit: 100000 }, null, null, true)
            .then(response => {
                let formattedResponse = response.docs.map(record => {
                    return {
                        id: "",
                        display: "{" + record.formattedName + "}"
                    }
                });
                formattedResponse = formattedResponse.filter(x => !isEmpty(x));
                setPlaceholderSuggestions(formattedResponse);
            })
            .catch(error => {
                setLoading(false);
                setError(error);
            })
    }

    const onChangeSmsText = (sms) => {
        let formattedContent = sms.target.value;
        formattedContent = formattedContent.replace("@[", "").replace("]()", "");
        setInput(formattedContent);
        setChanged(true);
    }

    const formatPlaceholderArray = (formattedContent) => {
        let formattedPlaceholderArray = [];
        if (!isEmpty(formattedContent)) {
            for (let i = 0; i < formattedContent.length; i++) {
                let placeholderKey = "";
                if (formattedContent[i] === '{') {
                    let j = i + 1;
                    while (formattedContent[j] !== '}') {
                        if (formattedContent[j] === '{') {
                            i = j - 1;
                            placeholderKey = "";
                            break;
                        }
                        else if (j >= formattedContent.length) {
                            i = j;
                            placeholderKey = "";
                            break;
                        }
                        else {
                            placeholderKey = placeholderKey + formattedContent[j];
                            j++;
                        }
                    }

                    if (!isEmpty(placeholderKey)) {
                        formattedPlaceholderArray.push(placeholderKey);
                        i = j;
                    }
                }
            }
        }
        else {
            formattedPlaceholderArray = placeholderArray;
        }

        return formattedPlaceholderArray;
    }

    const validateSmsContent = (smsContent) => {
        let orgName = get(props, 'user.orgFormattedName', "");
        smsContent = !isEmpty(smsContent) ? smsContent.toLowerCase() : '';
        return smsContent.includes(startCase(orgName).toLowerCase());
    }

    const onClickSave = () => {
        const { smsTemplateData = {}, actionType } = props;
        let { content } = smsTemplateData;
        let formattedContent = !isEmpty(input) ? input : (changed) ? input : content;
        let isValidContent = validateSmsContent(formattedContent);
        let orgName = get(props, 'user.orgFormattedName', "");

        if (!isValidContent) {
            formattedContent = (isEmpty(formattedContent) ? "" : formattedContent) + " " + startCase(orgName).toUpperCase();
            if (formattedContent.trim() !== startCase(orgName).toUpperCase()) {
                Notify.info("Appended Organization Name in Sms Content as it is required to be present in the Sms Content for DLT approval");
            }
        }

        const formValues = (formRef && formRef.current.validateFormAndGetValues());
        let formattedPlaceholderArray = formatPlaceholderArray(formattedContent);

        if (formValues) {
            setLoading(true);
            const body = {
                ...formValues,
                content: formattedContent,
                placeholders: formattedPlaceholderArray,
                appName: "ums"
            };

            try {
                const method = actionType === "UPDATE" ? "PUT" : "POST";
                const uri = actionType === "CREATE" ? `/usermanagement/smstemplate` : `/usermanagement/smstemplate/${get(smsTemplateData, 'templateId')}`;
                const userKey = actionType === "UPDATE" ? "updatedBy" : "createdBy";

                body[userKey] = get(props.user, 'email', "");
                callApi(uri, method, body, null, null, true)
                    .then(response => {
                        props.refreshGrid();
                        props.closeModal("save");
                    })
                    .catch(error => {
                        setLoading(false);
                        setError(error);
                    })
            } catch (error) {
                setLoading(false);
                setError(error);
            }
        }
    }

    return (
        <ModalWindow
            heading={isEmpty(smsTemplateData) ? "Create SMS Template" : `SMS Template : ${get(smsTemplateData, 'name', '')}`}
            showModal={showModal}
            closeModal={props.closeModal}
            onClickOk={onClickSave}
            okText={`Save`}
            cancelText={`Close`}
            addOkCancelButtons={true}
            loading={loading}
            error={error}
            size={`lg`}
        >
            {buildForm()}
        </ModalWindow>
    )
}

const mapStateToProps = (state) => ({
    user: get(state, 'auth.user')
});

export default connect(mapStateToProps)(SmsTemplateModal);
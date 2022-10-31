import React, { Component } from 'react';
import { get } from 'lodash';
import Notify from 'react-s-alert';

import { callApi } from 'store/middleware/api';
import ModalWindow from 'components/modalWindow';
import { FormBuilder } from 'components/form';

class AssignReportersModal extends Component {
    constructor(props) {
        super(props);
        this.state = {
            loading: false,
            error: null
        }
    }

    createForm = () => {
        const fields = [{
            type: 'textarea',
            name: 'reporters',
            label: 'Reporters',
            required: true
        }];

        return (
            <>
                <FormBuilder
                    ref="reportersForm"
                    fields={fields}
                />
            </>
        );
    }

    onClickSaveReporters = () => {
        const { reportingToData, closeModal } = this.props;
        const { reportersForm } = this.refs;
        const formValues = reportersForm.validateFormAndGetValues();

        if (formValues) {
            let emailArray = get(formValues, 'reporters').split(/[\n,]/);
            const payload = {
                reporters: emailArray,
                reportingToUser: get(reportingToData, '_id')
            }
            this.setState({ loading: true, error: null });
            callApi(`/usermanagement/employee/assignReporters`, 'POST', payload, null, null, true)
                .then(response => {
                    Notify.success(`Reporters for ${get(reportingToData, 'email')} updated successfully!`);
                    closeModal();
                })
                .catch(error => {
                    this.setState({ loading: false, error });
                })
        }
    }


    render() {
        const { reportingToData, closeModal } = this.props;
        const { loading, error } = this.state;

        return (
            <ModalWindow
                showModal={true}
                closeModal={closeModal}
                heading={`${get(reportingToData, 'email')} - Assign Reporters`}
                loading={loading}
                error={error}
                addOkCancelButtons={true}
                okText="Save"
                onClickOk={this.onClickSaveReporters}
            >
                {this.createForm(reportingToData)}
            </ModalWindow>
        )
    }
}

export default AssignReportersModal;

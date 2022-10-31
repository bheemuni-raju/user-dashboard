import React from 'react';
import Notify from 'react-s-alert';

import ModalWindow from 'components/modalWindow';
import { FormBuilder } from 'components/form';
import { callApi } from 'store/middleware/api';


class PicModal extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            loading: false,
            error: null
        }
    }

    buildForm = () => {
        const fields = [{
            type: 'select',
            model: 'Employee',
            displayKey: 'email',
            valueKey: 'email',
            name: 'email',
            label: 'Pic Email',
            required: true
        }];

        return (
            <FormBuilder
                fields={fields}
                ref="picForm"
            />
        );
    }

    onClickAddPic = () => {
        const { picForm } = this.refs;
        const formValues = picForm.validateFormAndGetValues();

        if (formValues) {
            const { email } = formValues;
            const payload = { email };
            try {
                this.setState({ loading: true, error: null })
                callApi('/usermanagement/pic/inventory/addPic', "POST", payload, null, null, true)
                    .then(response => {
                        Notify.success(`Pic ${email} added successfully!`);
                        this.props.closeModal();
                    })
                    .catch(error => {
                        this.setState({ loading: false, error: error });
                    })
            } catch (error) {
                this.setState({ error, loading: false });
            }
        }
    }

    render() {
        const { loading, error } = this.state;

        return (
            <ModalWindow
                showModal={true}
                loading={loading}
                error={error}
                closeModal={this.props.closeModal}
                heading="Add Pic"
                addOkCancelButtons={true}
                okText="Save"
                onClickOk={this.onClickAddPic}
                size="sm"
                style={{ width: '100%' }}
            >
                {this.buildForm()}
            </ModalWindow>
        );
    }
}

export default PicModal;

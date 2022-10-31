import React from 'react';
import { connect } from 'react-redux';
import { get } from 'lodash';
import Notify from 'react-s-alert';

import ModalWindow from 'components/modalWindow';
import { FormBuilder } from 'components/form';
import { callApi } from 'store/middleware/api';
import Confirm from 'components/confirm';

class CreatePicModal extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            loading: false,
            error: null
        }
    }

    buildForm = () => {
        const fields = [{
            name: 'picEmailId',
            label: 'PIC Email',
            model: 'Employee',
            type: 'select',
            displayKey: 'email',
            valueKey: 'email',
            filter: { subDepartment: { "$in": ["sales_operations"] }, status: "active" },
            required: true,
        }, {
            name: 'coveringUserEmail',
            type: 'select',
            model: 'Employee',
            displayKey: 'email',
            valueKey: 'email',
            filter: { role: { "$in": ["avp", "senior_manager", "gm", "agm", "senior_bdtm"] }, status : "active"  },
            label: 'Covering User Email',
            required: true
        }, {
            name: 'scope',
            label: 'Scope',
            type: "select",
            isMulti: true,
            options: [
                { label: "Attendance", value: "attendance" },
                { label: "ICR", value: "icr" },
                { label: "Manage SOP", value: "manage_sop" },
                { label: "Order", value: "order" },
                { label: "Team Performace", value: "team_performance" },
            ],
            required: true
        }];

        return (
            <FormBuilder
                fields={fields}
                ref="picForm"
                col={2}
            />
        );
    }

    onClickAddPic = async () => {
        const { picForm } = this.refs;
        const formValues = picForm.validateFormAndGetValues();

        if (formValues) {
            const { picEmailId } = formValues;
            let isConfirm = await Confirm();

            if (isConfirm) {
                try {
                    this.setState({ loading: true, error: null })
                    callApi('/usermanagement/pic/salespics/createPic', "POST", formValues, null, null, true)
                        .then(response => {
                            Notify.success(`Pic ${picEmailId} added successfully!`);
                            this.props.onClickSave();
                        })
                        .catch(error => {
                            this.setState({ loading: false, error: error });
                        })
                } catch (error) {
                    this.setState({ error, loading: false });
                }
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
                heading="Add PIC"
                addOkCancelButtons={true}
                okText="Save"
                onClickOk={this.onClickAddPic}
            >
                {this.buildForm()}
            </ModalWindow>
        );
    }
}

const mapStateToProps = (state) => ({
    user: get(state, 'auth.user')
})

export default connect(mapStateToProps)(CreatePicModal);

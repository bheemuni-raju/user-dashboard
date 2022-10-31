import React from "react";
import { Alert, Button, Row, Col } from 'reactstrap';
import Notify from 'react-s-alert';
import moment from 'moment';

import { FormBuilder } from 'components/form';
import ModalWindow from "components/modalWindow";
import { BoxBody } from 'components/box';
import { callApi } from 'store/middleware/api';

class MarkAttendanceModal extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
            loading: false,
            error: null,
            showModal: true,
            showWarning: false,
            warningMessage: ""
        };
    }

    onSave = async () => {

        const { selectedEmail, refreshGrid } = this.props;
        const editAttendanceForm = this.refs.editAttendanceForm;
        let formValues = editAttendanceForm.validateFormAndGetValues();
        formValues['email'] = selectedEmail;
        if (formValues) {
            this.setState({ loading: true });
            callApi(`/usermanagement/wfhattendance/seedBulkAttendance`, 'POST', formValues, null, null, true)
                .then(response => {
                    this.setState({ showModal: false });
                    Notify.success(response.message);
                    this.props.closeModal();
                    refreshGrid();
                }).catch(error => {
                    this.setState({
                        showWarning: true,
                        warningMessage: error.message,
                        loading: false
                    })
                })
        }
    }

    getFields = () => {
        return [
            {
                name: 'from',
                type: 'date',
                required: true,
                label: 'Start Date',
            },
            {
                name: 'to',
                type: 'date',
                label: 'End Date',
                required: true
            },
            {
                type: "select",
                label: "Attendance Status",
                name: "status",
                options: [
                    { label: 'Present', value: 'present' },
                    { label: 'Absent', value: 'absent' },
                    { label: 'Week Off', value: 'week_off' },
                    { label: 'Holiday', value: 'holiday' }
                ],
                required: true
            }
        ];
    };

    render() {
        const { closeModal, selectedEmail } = this.props;
        const { showModal, loading, warningMessage, showWarning } = this.state;

        return (
            <ModalWindow
                loading={loading}
                closeModal={closeModal}
                heading={`${selectedEmail}`}
                showModal={showModal}
                size={"md"}
            >
                {showWarning &&
                    <Alert className="alert alert-warning">
                        <i className="fa fa-info-circle"></i>{" "}
                        {warningMessage}
                    </Alert>
                }
                <BoxBody>
                    <Row>
                        <Col md={12}>
                            <FormBuilder
                                ref="editAttendanceForm"
                                fields={this.getFields()}
                                cols={2}
                            />
                            <br></br>
                            <div className="text-right">
                                <Button color="success" onClick={this.onSave}>
                                    Save
                            </Button>{' '}
                                <Button color="danger" onClick={closeModal}>
                                    Cancel
                            </Button>
                            </div>
                        </Col>
                    </Row>
                </BoxBody>
            </ModalWindow>
        );
    }
}

export default MarkAttendanceModal;
import React from "react";
import { Button, Row, Col } from 'reactstrap';
import Notify from 'react-s-alert';
import moment from 'moment';

import ModalWindow from "components/modalWindow";
import { callApi } from 'store/middleware/api';

class EmployeeSnapshotWorkflowModal extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
            loading: false,
            error: null,
            showModal: true,
        };
    }

    onSave = async (cycleName) => {

        const formValues = {
            cycleName
        }
        if (cycleName) {
            callApi(`/usermanagement/employeesnapshot/updateSnapshotWorkflow`, 'POST', formValues, null, null, true)
                .then(response => {
                    Notify.success(`Cycle Status Approved`);
                    this.props.refreshGrid();
                    this.props.closeModal();
                })
        }
    }

    render() {
        const { closeModal, cycleData } = this.props;
        const { showModal, loading } = this.state;

        return (
            <ModalWindow
                loading={loading}
                closeModal={closeModal}
                heading={`Warning`}
                showModal={showModal}
                size={"md"}
            >
                <Row>
                    <Col md={12}>
                        <p>
                            <i className="fa fa-info-circle" style={{ margin: "2%" }}></i>
                            Are you sure you want to mark "<b>Approve</b>" for this cycle ?
                        </p>
                        
                        <div className="text-right">
                            <Button color="success" onClick={() => { this.onSave(cycleData) }}>
                                Confirm
                            </Button>{' '}
                            <Button color="danger" onClick={closeModal}>
                                Cancel
                            </Button>
                        </div>
                    </Col>
                </Row>
            </ModalWindow>
        );
    }
}

export default EmployeeSnapshotWorkflowModal;
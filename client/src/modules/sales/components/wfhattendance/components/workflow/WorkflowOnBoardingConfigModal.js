import React, { useState } from 'react';
import { get, isEmpty } from 'lodash';
import moment from 'moment';

import ModalWindow from 'components/modalWindow';
import { FormBuilder, Checkbox } from 'components/form';
import { callApi } from 'store/middleware/api';

const WorkflowOnBoardingConfigModal = (props) => {
    const attendanceDate = get(props, 'workflowData.date');
    const workflowData = get(props, 'workflowData', {});
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [newBdtsOnBoarded, setNewBdtsOnboarded] = useState(false);
    const [newPreSalesEmployeesOnboarded, setNewPreSalesEmployeesOnboarded] = useState(false);
    let editFormRef = "";

    const updateWorkflowStatus = () => {
        let formValues = editFormRef && editFormRef.validateFormAndGetValues();

        if (newBdtsOnBoarded) {
            formValues.bdtTrainingStatus = "initiated";
            formValues.bdtTrainingEndDate = getUTCDate(formValues.bdtTrainingEndDate, true);
            formValues.bdtTrainingStartDate = getUTCDate(attendanceDate, true);
        }

        if (newPreSalesEmployeesOnboarded) {
            formValues.preSalesTrainingStatus = "initiated";
            formValues.preSalesTrainingEndDate = getUTCDate(formValues.preSalesTrainingEndDate, true);
            formValues.preSalesTrainingStartDate = getUTCDate(attendanceDate, true);
        }

        if (!newBdtsOnBoarded) delete formValues.bdtTrainingEndDate;
        if (!newPreSalesEmployeesOnboarded) delete formValues.preSalesTrainingEndDate;

        setLoading(true);
        callApi(`/usermanagement/wfhattendanceworkflow/updateStatus`, 'POST', {
            date: workflowData.date,
            ...formValues
        }, null, null, true)
            .then((response) => {
                setLoading(false);
                props.byjusGridRef && props.byjusGridRef.onClickRefresh();
                props.closeModal();
            })
            .catch(error => {
                setLoading(false);
                setError(error);
            })
    }

    const onChangeNewBDTsJoining = (event) => {
        const { checked } = event.target;
        setNewBdtsOnboarded(checked);
    }
    const onChangeNewPreSalesJoining = (event) => {
        const { checked } = event.target;
        setNewPreSalesEmployeesOnboarded(checked);
    }

    const fields = []

    if (workflowData.bdtTrainingStatus || newBdtsOnBoarded) {
        fields.push(
            {
                type: 'reactDate',
                name: 'bdtTrainingEndDate',
                label: 'Training End Date (Sales)',
                disabled: new Date(workflowData.bdtTrainingEndDate) < new Date()
            }
        );
    }

    if (workflowData.preSalesTrainingStatus || newPreSalesEmployeesOnboarded) {
        fields.push(
            {
                type: 'reactDate',
                name: 'preSalesTrainingEndDate',
                label: 'Training End Date (Pre Sales)',
                disabled: new Date(workflowData.preSalesTrainingEndDate) < new Date()
            }
        );
    }

    const getUTCDate = (dateString, addOffset) => {
        let date = dateString ? new Date(dateString) : new Date();
        if (!addOffset) {
            date.setMinutes(date.getMinutes() + date.getTimezoneOffset());
        } else {
            date.setMinutes(date.getMinutes() - date.getTimezoneOffset());
        }
        return new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate(), date.getUTCHours(), date.getUTCMinutes(), date.getUTCSeconds()))
    }
    return (
        <ModalWindow
            heading={`${moment(attendanceDate).format('DD-MM-YYYY')} - Initiate Onboarding`}
            closeModal={props.closeModal}
            showModal={true}
            addOkCancelButtons={true}
            okText="Update"
            loading={loading}
            error={error}
            onClickOk={updateWorkflowStatus}
            size="lg"
            style={{ marginTop: "150px" }}
        >
            {
                <>
                    <Checkbox
                        onChange={onChangeNewBDTsJoining}
                        name='update_order'
                        checked={!isEmpty(workflowData.bdtTrainingStatus) || newBdtsOnBoarded}
                    >Is new BDTs onboarding day?</Checkbox>

                    <Checkbox
                        onChange={onChangeNewPreSalesJoining}
                        name='update_order'
                        checked={!isEmpty(workflowData.preSalesTrainingStatus) || newPreSalesEmployeesOnboarded}
                    >Is new Pre Sales BDAs onboarding day?</Checkbox>

                    <FormBuilder
                        fields={fields}
                        ref={(element) => editFormRef = element}
                        initialValues={{
                            bdtTrainingEndDate: getUTCDate(workflowData.bdtTrainingEndDate),
                            preSalesTrainingEndDate: getUTCDate(workflowData.preSalesTrainingEndDate),
                        }}
                        cols={2}
                    />
                </>
            }
        </ModalWindow>
    )
}

export default WorkflowOnBoardingConfigModal;

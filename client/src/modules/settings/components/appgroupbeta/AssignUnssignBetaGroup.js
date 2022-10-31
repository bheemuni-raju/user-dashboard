import React, { useRef, useState, useEffect } from 'react';
import { connect } from 'react-redux';
import { Button } from 'reactstrap';
import { get, isEmpty } from 'lodash';

import ModalWindow from 'components/modalWindow';
import { FormBuilder } from 'components/form';
import { callApi } from 'store/middleware/api';

const AssignUnassign = (props) => {
    const [showModal, setShowModal] = useState(true);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const { appGroupData, user } = props.appGroupData;
    const refs = useRef({ current: "createMappingForm" });
    const appId = props.appGroupData.appId;
    const buildForm = () => {
        const fields = [
            {
                type: "select",
                isMulti: true,
                name: "userId",
                label: "User Name",
                model: "AppUser",
                filter: { 'appId': appId },
                displayKey: "email",
                valueKey: "id",
                required: true,
                dbType: 'pg'
            }];

        return (
            <>
                <FormBuilder
                    ref={refs.current}
                    fields={fields}
                />
            </>
        )
    }

    const onClickSave = () => {
        const createMappingForm = refs.current.current;
        const formValues = createMappingForm ? createMappingForm.validateFormAndGetValues() : null;

        if (formValues) {
            setLoading(true);
            const body = {
                userId: formValues.userId,
                appGroupId: props.appGroupData.id
            };
            try {
                const method = "POST";
                const uri = `/usermanagement/v1/appgroup/assign`;
                const userKey = "createdBy";
                body[userKey] = get(props.user, 'email', "");
                callApi(uri, method, body, null, null, true)
                    .then(response => {
                        setLoading(false);
                        props.refreshGrid();
                        props.closeModal("save");
                    })
                    .catch(error => {
                        if (error.status == 403) {
                            setError(error.errorMessage);
                            setLoading(false);
                            return false;
                        }
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
            heading={isEmpty(appGroupData) ? "Assign User" : `Secret : ${get(appGroupData, 'name', '')}`}
            showModal={showModal}
            closeModal={props.closeModal}
            loading={loading}
            error={error}
            size={'lg'}
        >
            {buildForm()}
            <div className="text-right">
                <Button type="button" color="success" onClick={() => onClickSave()}>Save</Button>
                {'   '}
                <Button type="button" color="danger" onClick={props.closeModal}>Close</Button>
            </div>
        </ModalWindow>
    )
}
const mapStateToProps = (state) => ({
    user: get(state, 'auth.user')
});

export default connect(mapStateToProps)(AssignUnassign);

import React from 'react';
import { Table, Button } from 'antd';
import { camelCase, cloneDeep, isEqual, map, omit, startCase } from 'lodash';
import Notify from 'react-s-alert';

import ModalWindow from 'components/modalWindow';
import { FormBuilder } from 'components/form';
import { callApi } from 'store/middleware/api';
import Confirm from 'components/confirm';

class ViewCoveringUsers extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            loading: false,
            error: null,
            picDetails: cloneDeep(props.picData, true)
        }
    }

    coveringUsersView = () => {
        const fields = [{
            name: 'coveringUserEmail',
            type: 'select',
            model: 'Employee',
            displayKey: 'email',
            valueKey: 'email',
            filter: { role: { "$in": ["avp", "senior_manager", "gm", "agm", "senior_bdtm"] }, status : "active" },
            label: 'Covering User Email',
            required: true
        }, {
            name: 'scope',
            label: 'Scope',
            type: "select",
            isMulti: true,
            required: true,
            options: [
                { label: "Attendance", value: "attendance" },
                { label: "ICR", value: "icr" },
                { label: "Manage SOP", value: "manage_sop" },
                { label: "Order", value: "order" },
                { label: "Team Performace", value: "team_performance" },
            ]
        },
        {
            type: 'button',
            text: 'Add',
            onClick: () => this.onClickAddCoveringUser(),
            style: { marginTop: '13%' }
        }];

        return (
            <>
                <FormBuilder
                    fields={fields}
                    ref="picForm"
                    cols={3}
                />
                {this.getCoveringUsersGrid()}
            </>
        );
    }

    onClickAddCoveringUser = () => {
        const { picForm } = this.refs;
        const { picDetails } = this.state;
        const { coveringUsers } = picDetails;
        const formValues = picForm.validateFormAndGetValues();
        const { coveringUserEmail, scope } = formValues;
        let coveringUsersEmail = map(coveringUsers, 'emailId');

        if (!coveringUsersEmail.includes(coveringUserEmail)) {
            picDetails.coveringUsers.push({
                scopes: scope,
                emailId: coveringUserEmail,
                role: ''
            });
            this.setState({ picDetails });
        }
        picForm.emptyFormValues();
    }

    getCoveringUsersGrid = () => {
        const { picDetails } = this.state;
        const { coveringUsers } = picDetails;
        const dataSource = coveringUsers.map((tm, index) => {
            return {
                key: index + 1,
                ...tm
            }
        })

        const columns = [{
            title: 'Email Id',
            dataIndex: 'emailId',
            key: 'emailId'
        }, {
            title: 'Scopes',
            dataIndex: 'scopes',
            key: 'scopes',
            render: (text, record) => {
                let formattedScopes = text.map(scope => startCase(camelCase(scope)));
                return formattedScopes.join(", ")
            }
        }, {
            title: 'Action',
            dataIndex: '',
            key: 'rowKey',
            render: (text, record) => {
                return <Button type="danger" icon="delete" onClick={() => this.removePicCoveringUser(record)} >Remove</Button>
            }
        }];

        return (
            dataSource.length > 0 &&
            <Table style={{ maxHeight: '300px', overflow: 'auto' }}
                columns={columns}
                dataSource={dataSource}
            />
        )
    }

    removePicCoveringUser = async (selectedUser) => {
        let isConfirm = await Confirm();
        if (isConfirm) {
        const { picDetails } = this.state;
        let { coveringUsers } = picDetails;
        let selectedUserCopy = omit(selectedUser, 'key');
        let coveringUsersAfterRemoval = coveringUsers.filter((coveringUser) => !isEqual(coveringUser, selectedUserCopy));
        picDetails.coveringUsers = coveringUsersAfterRemoval;
        this.setState({ picDetails });
        }
    }

    closeModal = () => {
        const { picData } = this.props;
        this.setState({ picDetails: cloneDeep(picData, true)});
        this.props.closeModal();
    }

    onClickSaveChanges = async () => {
        const { picDetails: payload } = this.state;
        let isConfirm = await Confirm();

        if (isConfirm) {
            try {
                this.setState({ loading: true, error: null })
                callApi('/usermanagement/pic/salespics/editCoveringUsers', "POST", payload, null, null, true)
                    .then(response => {
                        Notify.success(`Changes for pic saved successfully!`);
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

    render() {
        const { loading, error } = this.state;
        const { picData } = this.props;
        const { picEmailId } = picData;

        return (
            <ModalWindow
                showModal={true}
                loading={loading}
                error={error}
                closeModal={this.closeModal}
                addOkCancelButtons={true}
                okText="Save"
                heading={`${picEmailId} : View PIC Covering Users`}
                onClickOk={this.onClickSaveChanges}
            >
                {this.coveringUsersView()}
            </ModalWindow>
        );
    }
}

export default ViewCoveringUsers;

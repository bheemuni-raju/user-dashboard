import React from 'react';
import { Table, Button } from 'antd';
import { get, remove } from 'lodash';

import ModalWindow from 'components/modalWindow';
import { FormBuilder } from 'components/form';
import TabBuilder from '../../../core/components/TabBuilder';

import { callApi } from 'store/middleware/api';
import Notify from 'react-s-alert';

class PicModal extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            loading: false,
            error: null
        }
    }

    bdaView = () => {
        const { bdaRole, bdtRole, bdatRole } = this.props;

        const { coveringBda = [] } = this.state;
        const bdaRoleFormattedName = get(bdaRole, 'formattedName');
        const bdtRoleFormattedName = get(bdtRole, 'formattedName');
        const bdatRoleFormattedName = get(bdatRole, 'formattedName');

        const fields = [{
            type: 'select',
            model: 'Employee',
            displayKey: 'email',
            valueKey: 'email',
            filter: {
                role: { "$in": [bdaRoleFormattedName, bdtRoleFormattedName, bdatRoleFormattedName] }
            },
            name: 'email',
            label: 'Bda Email',
            required: true
        }, {
            type: 'button',
            text: 'Add',
            onClick: this.onClickAddPicBda,
            style: { marginTop: '7%' }
        }];

        return (
            <>
                <FormBuilder
                    fields={fields}
                    ref="picBdaForm"
                    cols={2}
                />
                {this.getBdaGrid(coveringBda)}
            </>
        );
    }

    teamMangerView = () => {
        const { picData = {}, teamManagerRole, bdtmRole } = this.props;
        const { coveringManagers = [] } = this.state;
        const tmRoleFormattedName = get(teamManagerRole, 'formattedName');
        const bdtmRoleFormattedName = get(bdtmRole, 'formattedName');

        const fields = [{
            type: 'select',
            model: 'Employee',
            displayKey: 'email',
            valueKey: 'email',
            filter: { role: { "$in": [tmRoleFormattedName, bdtmRoleFormattedName] } },
            name: 'email',
            label: 'Manager Email',
            required: true
        }, {
            type: 'button',
            text: 'Add',
            onClick: this.onClickAddPicManager,
            style: { marginTop: '7%' }
        }];

        return (
            <>
                <FormBuilder
                    fields={fields}
                    ref="picManagerForm"
                    cols={2}
                />
                {this.getTMGrid(coveringManagers)}
            </>
        );
    }

    buildForm = () => {
        const tabs = [
            { title: "Team Manger View", component: this.teamMangerView() },
            { title: "BDA View", component: this.bdaView() }
        ]

        return (
            <TabBuilder tabs={tabs} />
        )
    }

    getBdaGrid = (coveringBda) => {
        const dataSource = coveringBda.map((tm, index) => {
            return {
                key: index + 1,
                ...tm
            }
        })

        const columns = [{
            title: 'Email Id',
            dataIndex: 'bdaEmailId',
            key: 'bdaEmailId',
        }, {
            title: 'Action',
            dataIndex: '',
            key: 'x',
            render: (text, record) => {
                return <Button type="danger" icon="delete" onClick={() => this.onClickRemovePicBDA(record)} >Remove</Button>
            }
        }];

        return (
            <Table style={{ maxHeight: '300px', overflow: 'auto' }}
                columns={columns}
                dataSource={dataSource}
                pagination={{
                    total: coveringBda.length,
                    showTotal: ((total, range) => `${range[0]}-${range[1]} of ${total} items`),
                    pageSize: 10,
                    position: 'both'
                }}
            />
        )
    }

    getTMGrid = (teamManagers) => {
        const dataSource = teamManagers.map((tm, index) => {
            return {
                key: index + 1,
                ...tm
            }
        })

        const columns = [{
            title: 'Email Id',
            dataIndex: 'team_manager_email_id',
            key: 'team_manager_email_id',
        }, {
            title: 'Tnl Id',
            dataIndex: 'team_manager_tnl_id',
            key: 'team_manager_tnl_id',
        }, {
            title: 'Action',
            dataIndex: '',
            key: 'x',
            render: (text, record) => {
                return <Button type="danger" icon="delete" onClick={() => this.onClickRemovePicManager(record)} >Remove</Button>
            }
        }];

        return (
            <Table style={{ maxHeight: '300px', overflow: 'auto' }}
                columns={columns}
                dataSource={dataSource}
                pagination={{
                    total: teamManagers.length,
                    showTotal: ((total, range) => `${range[0]}-${range[1]} of ${total} items`),
                    pageSize: 10,
                    position: 'both'
                }}
            />
        )
    }

    onClickAddPicBda = () => {
        const { picData } = this.props;
        const { coveringManagers } = this.state;
        const { picBdaForm } = this.refs;
        const formValues = picBdaForm.validateFormAndGetValues();

        if (formValues) {
            const { email, tnlId } = formValues;

            const picEmail = get(picData, 'pic_email_id');
            const payload = { picEmail, email };
            try {
                this.setState({ loading: true, error: null })
                callApi('/paymentmanagement/icrpic/addBda', "POST", payload, null, null, true)
                    .then(response => {
                        Notify.success(`Bda ${email} added successfully under PIC ${picEmail}!`);
                        coveringManagers.push({ team_manager_email_id: email, team_manager_tnl_id: tnlId });
                        this.setState({ coveringManagers });
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

    onClickAddPicManager = () => {
        const { picData } = this.props;
        const { coveringManagers } = this.state;
        const { picManagerForm } = this.refs;
        const formValues = picManagerForm.validateFormAndGetValues();

        if (formValues) {
            const { email, tnlId } = formValues;

            const picEmail = get(picData, 'pic_email_id');
            const payload = { picEmail, email };
            try {
                this.setState({ loading: true, error: null })
                callApi('/paymentmanagement/icrpic/addManager', "POST", payload, null, null, true)
                    .then(response => {
                        Notify.success(`Manager ${email} added successfully under PIC ${picEmail}!`);
                        coveringManagers.push({ team_manager_email_id: email, team_manager_tnl_id: tnlId });
                        this.setState({ coveringManagers });
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

    onClickRemovePicBDA = (bdaData) => {
        const { bdaEmailId } = bdaData;
        const { coveringBda } = this.state;
        const { picData } = this.props;
        const picEmail = get(picData, 'pic_email_id');
        const payload = {
            picEmail,
            email: bdaEmailId
        }
        try {
            this.setState({ loading: true, error: null })
            callApi('/paymentmanagement/icrpic/removeBda', "POST", payload, null, null, true)
                .then(response => {
                    Notify.success(`BDA ${bdaEmailId} removed successfully from PIC ${picEmail}!`);
                    remove(coveringBda, (mgr) => get(mgr, 'bdaEmailId') == bdaEmailId);
                    this.setState({ coveringBda });
                    this.props.closeModal();
                })
                .catch(error => {
                    this.setState({ loading: false, error: error });
                })
        } catch (error) {
            this.setState({ error, loading: false });
        }
    }

    onClickRemovePicManager = (managerData) => {
        const { team_manager_email_id, team_manager_tnl_id } = managerData;
        const { coveringManagers } = this.state;
        const { picData } = this.props;
        const picEmail = get(picData, 'pic_email_id');
        const payload = {
            picEmail,
            email: team_manager_email_id
        }
        try {
            this.setState({ loading: true, error: null })
            callApi('/paymentmanagement/icrpic/removeManager', "POST", payload, null, null, true)
                .then(response => {
                    Notify.success(`Manager ${team_manager_email_id} removed successfully from PIC ${picEmail}!`);
                    remove(coveringManagers, (mgr) => get(mgr, 'team_manager_email_id') == team_manager_email_id);
                    this.setState({ coveringManagers });
                    this.props.closeModal();
                })
                .catch(error => {
                    this.setState({ loading: false, error: error });
                })
        } catch (error) {
            this.setState({ error, loading: false });
        }
    }

    componentDidMount = () => {
        const { picData } = this.props;
        const { assigned_team_manager, assignedBda } = picData;
        this.setState({ coveringManagers: assigned_team_manager, coveringBda: assignedBda });
    }

    render() {
        const { loading, error } = this.state;
        const { picData } = this.props;

        return (
            <ModalWindow
                showModal={true}
                loading={loading}
                error={error}
                closeModal={this.props.closeModal}
                heading={`${get(picData, 'pic_email_id')} : Add/View Pic Managers`}
            >
                {this.buildForm()}
            </ModalWindow>
        );
    }
}

export default PicModal;

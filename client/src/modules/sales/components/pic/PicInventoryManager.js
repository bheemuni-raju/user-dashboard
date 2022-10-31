import React, { Component } from 'react'
import { get, remove } from 'lodash';
import { Table, Button } from 'antd';
import Notify from 'react-s-alert';

import ModalWindow from 'components/modalWindow';
import { FormBuilder } from 'components/form';
import TabBuilder from '../../../core/components/TabBuilder';
import { callApi } from 'store/middleware/api';

class PicInventoryManager extends Component {
    constructor(props) {
        super(props);
        this.state = {
            loading: false,
            error: null
        }
    }

    getTMGrid = teamManagers => {
        const dataSource = teamManagers.map((tm, index) => {
            return {
                key: index + 1,
                ...tm
            }
        })
        const columns = [{
            title: 'Email Id',
            dataIndex: 'team_manager_email_id',
        }, {
            title: 'Tnl Id',
            dataIndex: 'team_manager_tnl_id',
        }, {
            title: 'Action',
            dataIndex: '',
            render: record => {
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
            />)
    }

    teamMangerView = () => {
        const { picData = {}, teamManagerRole } = this.props;
        const roleFormattedName = get(teamManagerRole, 'formattedName');
        const { coveringManagers = [] } = this.state;

        const fields = [{
            type: 'select',
            model: 'Employee',
            displayKey: 'email',
            valueKey: 'email',
            filter: { role: roleFormattedName },
            name: 'email',
            label: 'Manager Email',
            required: true
        }, {
            type: 'button',
            text: 'Add',
            onClick: this.onClickAddPicManager,
            style: { marginTop: '7%' }
        }]
        return (
            <>
                <FormBuilder
                    fields={fields}
                    ref="picManagerForm"
                    cols={2}
                />
                {this.getTMGrid(coveringManagers)}
            </>)
    }

    onClickAddPicManager = async () => {
        const { picData } = this.props;
        const { coveringManagers } = this.state;
        const { picManagerForm } = this.refs;

        if (picManagerForm.validateFormAndGetValues()) {
            const { email, tnlId } = picManagerForm.validateFormAndGetValues();
            const picEmail = get(picData, "pic_email_id");
            const teamManager = get(picData, "team_managers");
            const payload = { email, picEmail, teamManager };

            this.setState({ loading: true, error: null });
            await callApi('/usermanagement/pic/inventory/addManagerPic', 'POST', payload, null, null, true)
                .then(response => {
                    if (response.success) {
                        Notify.success(`Manager ${email} added successfully under PIC ${picEmail}!`);
                        coveringManagers.push({ team_manager_email_id: email, team_manager_tnl_id: tnlId });
                        this.setState({ coveringManagers });
                        this.props.closeModal();
                    } else {
                        Notify.success(`Manager ${email} already under PIC ${picEmail}!`);
                        this.setState({ loading: false, error: null })
                        this.props.closeModal();
                    }
                })
        }
    }

    onClickRemovePicManager = async (manager) => {
        const { coveringManagers } = this.state;
        const { picData } = this.props;
        const picEmail = get(picData, 'pic_email_id');
        const teamManagerEmail = get(manager, "team_manager_email_id");
        const payload = { picEmail, teamManagerEmail }

        this.setState({ loading: false, error: null })
        await callApi('/usermanagement/pic/inventory/removeManagerPic', 'POST', payload, null, null, true)
            .then(response => {
                Notify.success(`Manager ${teamManagerEmail} removed successfully from PIC ${picEmail}!`);
                remove(coveringManagers, (mgr) => get(mgr, 'team_manager_email_id') == teamManagerEmail);
                this.setState({ coveringManagers });
                this.props.closeModal();
            }).catch(error => {
                this.setState({ loading: false, error: error });
            })
    }

    componentDidMount = () => {
        const { picData } = this.props;
        const { team_managers } = picData;
        this.setState({ coveringManagers: team_managers });
    }

    buildForm = () => {
        const tabs = [{
            title: "Team Manger View",
            component: this.teamMangerView()
        }]
        return (
            <TabBuilder tabs={tabs} />
        )
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
        )
    }
}

export default PicInventoryManager;
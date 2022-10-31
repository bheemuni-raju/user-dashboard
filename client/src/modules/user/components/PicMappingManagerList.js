import React, { Component, Fragment } from 'react';
import { Button, Modal, Row, Col, Label } from 'reactstrap';

import { Box, BoxHeader, BoxBody } from 'components/box';
import ByjusGrid from 'modules/core/components/grid/ByjusGrid';
import ModalWindow from 'components/modalWindow';
import FormBuilder from 'components/form/FormBuilder';

import PicMappingManagerModal from './PicMappingManagerModal';

class PicMappingManagerList extends React.Component {
    constructor(props) {
        super(props)
        this.state = {
            picData: null,
            formValues: {},
            picType: [
                {
                    label: 'ICR PIC',
                    value: 'ICR_PIC'
                }, {
                    label: 'INVENTORY PIC',
                    value: 'INVENTORY_PIC'
                }, {
                    label: 'ATTENDANCE PIC',
                    value: 'ATTENDANCE_PIC'
                }
            ],
            loading: false,
        }
    }
    onClickAssignedTeamManagerView = (cell, row) => {
        this.refs.PicMappingManagerView.show();
        this.setState({
            picData: row,
            heading: "Assigned Team Manager's List"
        })
    }
    onClickDownload = () => {
        const byjusGrid = this.refs.byjusGrid
        byjusGrid.onClickExport()
    }
    handleFormValues = (name, selectedValue) => {
        const { formValues } = this.state
        formValues[name] = selectedValue
        this.setState({ formValues })
    }
    buildToolbarItems = () => {
        return (
            <Button className="btn btn-default btn-sm" onClick={() => this.setState({ showModal: true })}>
                <i className="fa fa-plus"></i> {'  '}Create
            </Button>
        )
    }
    buildCreateForm = () => {
        const { picType, loading, formValues } = this.state
        const fields = [{
            name: "picType",
            type: "select",
            label: "PIC Type",
            value: ""
        }, {
            name: "pic",
            type: "select",
            label: "PIC",
            value: ""
        }, {
            name: "pic",
            type: "select",
            label: "PIC",
            value: ""
        }]
        const star = <span style={{ color: 'red' }}>*</span>
        return (
            <Fragment>
                <FormBuilder
                    ref="formBuilder"
                    fields={fields}
                    cols={1}
                />
                <div className="pull-right btn-toolbar">
                    <Button color="success" onClick={this.saveUnit}>Save</Button>
                    <Button color="danger" onClick={this.closeModal}>Cancel</Button>
                </div>
            </Fragment>
        )
    }
    columns = [{
        dataField: 'pic.name',
        text: 'Person In Charge',
    }, {
        dataField: '',
        text: 'Actions',
        formatter: (cell, row) => {
            return (
                <div>
                    {' '}
                    <Button color="primary" size="sm" onClick={() => this.onClickAssignedTeamManagerView(cell, row)}>
                        <i className="fa fa-eye" />
                    </Button> {' '}
                </div>
            )
        }
    }]
    refreshPICgrid = () => {
        const byjusGrid = this.refs.byjusGrid
        byjusGrid.onClickRefresh()
    }
    render() {
        const { picData } = this.state
        return (
            <Box>
                <BoxHeader heading="PIC Mapping Manager" />
                <BoxBody>
                    <ByjusGrid
                        ref="byjusGrid"
                        modelName="pic_manager_mapping"
                        toolbarItems={this.buildToolbarItems()}
                        columns={this.columns}
                    />
                    <ModalWindow
                        showModal={this.state.showModal}
                        closeModal={this.closeModal}
                        heading={'Add PIC'}
                    >
                        {this.buildCreateForm()}
                    </ModalWindow>
                    <PicMappingManagerModal
                        ref="PicMappingManagerView"
                        refreshGrid={this.refreshPICgrid}
                        picData={picData}
                    />
                </BoxBody>
            </Box>
        )
    }
}
export default PicMappingManagerList

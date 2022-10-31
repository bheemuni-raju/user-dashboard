import React, {Component} from 'react';

import { callApi } from 'store/middleware/api';
import ByjusGrid from 'modules/core/components/grid/ByjusGrid';
import ModalWindow from 'components/modalWindow';

class PicMappingManagerModal extends Component {
    constructor(props){
        super(props)
        this.state = {
            picData : null,
            selected: [],
            showModal : false,
        }
    }
    hide = () => {
        this.setState({
            showModal : false
        })
    }
    show = () => {
        this.setState({
            showModal : true
        })
    }
    removeCoveringTeamManager = () => {
        const {refreshPICgrid} = this.props
        const {closeModal} = this.props
        const picId = this.props.picData.pic._id
        const method = 'PUT'
        const url = `/pic_manager_mapping/${picId}`
        const body = {
            removeCoveringTeamManager: true,
            coveringTeamManagers: this.state.selected
        }
        callApi(url, method, body, null, null, true)
            .then(response => {
                refreshPICgrid();
                closeModal();
            })
            .catch(error => {
                console.log(error)
            })
    }
    handleOnSelect = (row, isSelect) => {
        if (isSelect) {
            this.setState(() => ({
                selected: [...this.state.selected, row._id]
            }));
        } else {
            this.setState(() => ({
                selected: this.state.selected.filter(x => x !== row._id)
            }));
        }
    }
    handleOnSelectAll = (isSelect, rows) => {
        const ids = rows.map(r => r._id);
        if (isSelect) {
            this.setState(() => ({
                selected: ids
            }));
        } else {
            this.setState(() => ({
                selected: []
            }));
        }
    }
    getPICDetails = () => {
        const columns = [{
            dataField: 'name',
            text: "Covering Team Manager's",
        }]
        const selectRow = {
            mode: 'checkbox',
            clickToSelect: true,  // click to select, default is false
            clickToExpand: true,  // click to expand row, default is false
            bgColor: '#FFFFE0',
            onSelect: this.handleOnSelect,
            onSelectAll: this.handleOnSelectAll
        };
        let {picData} = this.props
        return <ByjusGrid
            ref="byjusGrid"
            simpleGrid={true}
            columns={columns}
            selectRow={selectRow}/>
    }
    render(){
        const {picData} = this.props
        return(
            <ModalWindow
                showModal={this.state.showModal}
                closeModal={this.hide}
                heading='Assigned Team Manager'>
                {this.getPICDetails()}
            </ModalWindow>
        );
    }
}
export default PicMappingManagerModal
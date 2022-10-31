import React, { Component, Fragment } from 'react';
import { Button } from 'reactstrap';
import Notify from "react-s-alert";
import { SubmissionError } from 'redux-form';

import ModalWindow from 'components/modalWindow';
import FormBuilder from 'components/form/FormBuilder';
import { callApi } from "store/middleware/api";
import { refreshQuickFilter } from "../grid/ByjusGrid";

class FavouriteSearchModal extends Component {
    constructor(props) {
        super(props)
        this.state = {
            formValues: {},
            showModal: false,
            loading: false,
            error: null,
            isQuickFilter: false,
            quickFilterMessage: '',
            isQuickFilter: false
        };
    }

    hide = () => {
        this.setState({
            showModal: false
        })
    }

    show = () => {
        this.setState({
            showModal: true
        })
    }

    createQuickFilter = async () => {
        this.setState({ isQuickFilter: true, loading: true })
        const formBuilder = this.refs.formBuilder
        const formValue = formBuilder.getFormValues()
        const { quick_filter_name } = formValue
        const { searchCriterias, gridId, emailId } = this.props

        const bodyPayload = {
            emailId: emailId,
            searchCriterias,
            gridId,
            quick_filter_name
        }
        await callApi('/usermanagement/common/save/preferences', 'POST', bodyPayload, null, null, true)
            .then(response => {
                Notify.success('Favourite filter saved successfully!!')
                this.setState({ quickFilterMessage: response.quickFilter.message, loading: false })
                this.props.loadFavouriteFilterData() // Updates Favourite Filter options in Byjus Grid
                this.props.updateFavouriteFilter() // Updates Favourite Filter options in Favourite Search View
                this.hide()
            })
            .catch(error => {
                Notify.success('Unable to save Favourite filter.Try again!!')
                this.setState({ columnList: [], isQuickFilter: false, loading: false })
            })
    }

    quickFilterView = () => {
        const { isQuickFilter, quickFilterMessage } = this.state;
        const fields = [{
            name: "quick_filter_name",
            type: "text",
            label: "Quick Filter Name",
            required: true
        }]

        return (
            <Fragment>
                <FormBuilder
                    ref="formBuilder"
                    fields={fields}
                    cols={1}
                />
                <br />

                <div className="pull-right btn-toolbar">
                    {<Button color="success" onClick={this.createQuickFilter}>Create</Button>}
                    <Button color="danger" onClick={this.hide}>Close</Button>
                </div>
            </Fragment>
        )
    }

    render() {
        const { loading } = this.state;
        return (
            <ModalWindow
                showModal={this.state.showModal}
                closeModal={this.hide}
                loading={loading}
                heading='Create Quick Filter'>
                {this.quickFilterView()}
            </ModalWindow>

        );
    }
}
export default FavouriteSearchModal

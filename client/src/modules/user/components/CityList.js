import React, { Component, Fragment } from 'react'
import { connect } from 'react-redux'
import { Button, Row, Col } from 'reactstrap'
import lodash from 'lodash'

import { Box, BoxHeader, BoxBody } from 'components/box'
import ByjusGrid from 'modules/core/components/grid/ByjusGrid'
import ModalWindow from 'components/modalWindow'
import { Error } from 'components/error'
import { FieldGroup } from 'components/form'
import { showConfirmDialog, hideDialog } from 'modules/core/reducers/dialog'
import { callApi } from 'store/middleware/api'
import ConfirmationDialog from 'components/confirmationDialog'
import { hierarchy as hierarchyPermissions, validatePermission } from 'lib/permissionList';

const mapDispatchToProps = dispatch => ({
  showDialog: (cancel, confirm, message) =>
    dispatch(showConfirmDialog(cancel, confirm, message, 'Delete')),
  hideDialog: () => dispatch(hideDialog())
})

class CityList extends Component {
  constructor(props) {
    super(props)
    this.state = {
      showModal: false,
      city: "",
      isValid: null,
      cityData: null,
      loading: false,
      error: null,
      deleteError: null
    }
  }

  buildToolbarItems = () => {
    const { user = {} } = this.props;
    const createFlag = validatePermission(user, hierarchyPermissions.createCity);

    return (
      <Fragment>
        <Button className="btn btn-secondary btn-sm" hidden={!createFlag} onClick={() => this.setState({ showModal: true })}>
          <i className="fa fa-plus"></i> {' '}Create
        </Button> {' '}
        <Button className="btn btn-default btn-sm" onClick={this.onClickDownload}>
          <i className="fa fa-download"></i> {' '}Export
        </Button>{' '}
      </Fragment>
    )
  }

  saveCity = () => {
    const { city, cityData } = this.state
    const isValid = (city != "") ? true : false

    if (isValid) {
      const method = cityData ? "PUT" : "POST"
      const url = method == "POST" ? "/usermanagement/city" : `/usermanagement/city/${cityData._id}`
      const bodyPayload = {
        "city": city
      }
      this.setState({ loading: true })

      callApi(url, method, bodyPayload, null, null, true)
        .then(response => {
          this.refreshGrid()
          this.closeModal()
        })
        .catch(error => {
          this.setState({ loading: false, error })
        })
    }
    else {
      this.setState({ isValid: "error" })
    }
  }

  onClickEdit = (cell, row) => () => {
    const clonedData = lodash.cloneDeep(row)

    this.setState({
      cityData: clonedData,
      city: clonedData.city,
      showModal: true
    })
  }

  onClickDelete = (cell, row) => () => {
    this.setState({
      showDeleteModal: true,
      itemData: row
    });
  }

  onCloseDeleteModal = () => {
    this.setState({ showDeleteModal: false, deleteError: null });
  }

  deleteRecord = (record) => {
    let cityId = record._id

    callApi(`/usermanagement/city/${cityId}`, 'DELETE', null, null, null, true)
      .then(response => {
        const byjusGrid = this.refs.byjusGrid
        byjusGrid.loadData(byjusGrid.state)
        this.setState({ showDeleteModal: false, deleteError: null });
      })
      .catch(error => {
        error && error.message && this.setState({ deleteError: error.message })
      })
  }

  onClickDownload = () => {
    const byjusGrid = this.refs.byjusGrid

    byjusGrid.onClickExport()
  }

  refreshGrid = () => {
    const byjusGrid = this.refs.byjusGrid

    byjusGrid.loadData(byjusGrid.state)
  }

  closeModal = () => {
    this.setState({
      showModal: false,
      city: "",
      cityData: null,
      isValid: null,
      deleteError: null,
      loading: false,
      error: null
    })
  }

  handleFormChanges = (event) => {
    const { name, value } = event.target
    this.setState({
      [name]: value
    })
  }

  buildCreateForm = () => {
    const { city, isValid } = this.state
    return (
      <Fragment>
        <FieldGroup
          name="city"
          type="text"
          label="City"
          value={city}
          valid={isValid}
          required={true}
          onChange={this.handleFormChanges}
        />
        <div className="pull-right btn-toolbar">
          <Button color="success" onClick={this.saveCity}>Save</Button>
          <Button color="danger" onClick={this.closeModal}>Cancel</Button>
        </div>
      </Fragment>
    )
  }

  render() {
    let columns = [{
      dataField: 'city',
      filterType: 'TEXT',
      sort: true,
      text: 'City'
    }, {
      dataField: '',
      text: 'Actions',
      formatter: (cell, row) => {
        const { user = {} } = this.props;
        const editFlag = validatePermission(user, hierarchyPermissions.editCity);
        const deleteFlag = validatePermission(user, hierarchyPermissions.deleteCity);

        return (
          <div>
            {' '}
            <Button color="primary" size="sm" hidden={!editFlag} onClick={this.onClickEdit(cell, row)}>
              <i className="fa fa-pencil" />
            </Button>
            {' '}
            <Button color="danger" size="sm" hidden={!deleteFlag} onClick={this.onClickDelete(cell, row)}>
              <i className="fa fa-trash" />
            </Button>
          </div>
        )
      }
    }]

    const { loading, error, deleteError, showDeleteModal, itemData } = this.state

    return (
      <Box>
        <BoxBody error={deleteError} style={{ padding: 0 }}>
          <ByjusGrid ref="byjusGrid"
            columns={columns}
            toolbarItems={this.buildToolbarItems()}
            modelName="City"
            gridDataUrl={`/usermanagement/city/list`}
          />
          <ModalWindow
            showModal={this.state.showModal}
            closeModal={this.closeModal}
            heading="Create City"
            loading={loading}
            error={error}
          >
            {this.buildCreateForm()}
          </ModalWindow>
          {showDeleteModal && <ConfirmationDialog
            showModal={showDeleteModal}
            closeModal={this.onCloseDeleteModal}
            heading="City will be permanently deleted"
            error={deleteError}
            size="sm"
            onClickConfirm={this.deleteRecord(itemData)}
          >
          </ConfirmationDialog>
          }
        </BoxBody>
      </Box>
    )
  }
}

export default connect(null, mapDispatchToProps)(CityList)

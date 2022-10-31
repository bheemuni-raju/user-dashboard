import React, { Component } from 'react';
import { Box, BoxBody } from 'components/box';
import { get, map } from 'lodash';
import { Button } from 'reactstrap';
import { connect } from 'react-redux';
import Notify from 'react-s-alert';
import moment from 'moment';

import ByjusGrid from 'modules/core/components/grid/ByjusGrid';
import ByjusDropdown from 'components/ByjusDropdown';
import CreatePicModal from './CreatePicModal';
import ViewCoveringUsers from './ViewCoveringUsers';
import { callApi } from 'store/middleware/api';
import Confirm from 'components/confirm';

class SalesPic extends Component {
  constructor() {
    super();
    this.state = {
      loading: false,
      error: null,
      showPicModal: false,
      showCoveringUsersModal: false
    };
  }

  buildToolbarItems = () => {
    return (
      <Button
        className="btn btn-default btn-sm"
        onClick={() => this.setState({ showPicModal: true })}
      >
        <i className="fa fa-plus"></i> {'  '}Create
      </Button>
    );
  };

  onClickViewManagers = picData => {
    this.setState({ showCoveringUsersModal: true, picData });
  };

  onClickChangePicStatus = async picData => {
    const { picEmailId, status } = picData;
    const { byjusGrid } = this.refs;
    const payload = {
      picEmailId,
      status: status === 'active' ? 'inactive' : 'active'
    };
    let isConfirm = await Confirm();

    if (isConfirm) {
      try {
        this.setState({ loading: true, error: null })
        callApi('/usermanagement/pic/salespics/changePicStatus', "POST", payload, null, null, true)
          .then(response => {
            Notify.success(`Pic ${picEmailId} status changed to ${payload.status}!`);
            this.setState({ loading: false, error: null });
            byjusGrid.onClickRefresh();
          })
          .catch(error => {
            this.setState({ loading: false, error: error });
          })
      }
      catch (error) {
        this.setState({ error, loading: false });
      }
    }
  }


  closeModal = () => {
    const { byjusGrid } = this.refs;
    this.setState({
      showPicModal: false,
      showCoveringUsersModal: false,
      picData: null
    });
  };

  onClickSave = () => {
    const { byjusGrid } = this.refs;
    this.setState({
      showPicModal: false,
      showCoveringUsersModal: false,
      picData: null
    });
    byjusGrid.onClickRefresh();
  }

  getColumns = () => {
    const columns = [{
      dataField: 'picEmailId',
      text: 'PIC Email Id',
      width: 100,
      quickFilter: true
    },
    {
      dataField: 'coveringUsers',
      text: 'Covering Users',
      formatter: (cell, row) => {
        const { coveringUsers } = row;
        const coveringUsersEmail = map(coveringUsers, 'emailId', '');
        const formattedEmails = coveringUsersEmail.join(', ');
        return formattedEmails;
      }
    },
    {
      dataField: 'createdAt',
      width: 110,
      text: 'Created At',
      formatter: (cell, row) => {
        return cell ? moment(cell).format('LLL') : '';
      }
    },
    {
      dataField: 'status',
      width: 50,
      text: 'Status'
    }, {
      dataField: 'updatedBy',
      width: 100,
      text: 'Updated By'
    },
    {
      dataField: '',
      text: 'Actions',
      width: 50,
      className: "btn-col-2",
      formatter: (cell, row) => {
        const { status } = row;
        return (
          <ByjusDropdown
            type="simple"
            defaultTitle="Actions"
            titleIcon="fa fa-gear"
            items={[{
              title: 'Edit Covering Users',
              icon: 'fa fa-pencil',
              disabled: status === 'inactive',
              onClick: () => this.onClickViewManagers(row)
            },
            {
              title: status === 'active' ? 'Deactivate Pic' : 'Activate Pic',
              icon: 'fa fa-gear',
              onClick: () => this.onClickChangePicStatus(row)
            }]} />
        );
      }
    }];
    return columns;
  };

  getPills = () => {
    return [{
      title: 'All',
      contextCriterias: []
    },
    {
      title: 'Active PIC',
      contextCriterias: [{
        selectedColumn: 'status',
        selectedOperator: 'equal',
        selectedValue: "active"
    }],
    },
    {
      title: 'Inactive PIC',
      contextCriterias: [{
        selectedColumn: 'status',
        selectedOperator: 'equal',
        selectedValue: "inactive"
    }],
    }
    ];
  };

  render() {
    const {
      loading,
      error,
      showPicModal,
      showCoveringUsersModal,
      picData
    } = this.state;
    
    const pills = this.getPills();

    return (
      <Box>
        <BoxBody loading={loading} error={error}>
          <ByjusGrid
            ref="byjusGrid"
            modelName="SalesPic"
            gridDataUrl={'/usermanagement/pic/salespics/getPicList'}
            toolbarItems={this.buildToolbarItems()}
            columns={this.getColumns()}
            dbName="friendlyPotato"
            sort={{ createdAt: 'desc' }}
            pillOptions={{
              pills,
              defaultPill: 2
          }}
          />
        </BoxBody>
        {showPicModal && <CreatePicModal closeModal={this.closeModal} onClickSave={this.onClickSave} />}
        {showCoveringUsersModal && (
          <ViewCoveringUsers
            picData={picData}
            onClickSave={this.onClickSave}
            closeModal={this.closeModal}
          />
        )}
      </Box>
    );
  }
}

const mapStateToProps = (state) => ({
  user: get(state, 'auth.user')
});

export default connect(mapStateToProps)(SalesPic)

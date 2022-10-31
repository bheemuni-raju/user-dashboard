import React, { Component } from 'react';
import { Box, BoxBody } from 'components/box';
import { callApi } from 'store/middleware/api';
import { find, isEmpty, get } from 'lodash';
import { Button } from 'reactstrap';
import ByjusGrid from 'modules/core/components/grid/ByjusGrid';
import ByjusDropdown from 'components/ByjusDropdown';
import { connect } from 'react-redux';

import UserHistory from '../../../user/components/UserHistory';
import PicModal from './PicModal';
import PicManager from './PicManager';
import { businessDevelopment, validatePermission } from 'lib/permissionList';

class PicICR extends Component {
  constructor() {
    super();
    this.state = {
      loading: false,
      error: null,
      showPicModal: false,
      showManagerModal: false,
      showPICLocationModal: false
    };
  }

  //This is the function is used for creating the toolbar item
  buildToolbarItems = () => {
    let { user = {} } = this.props;
    const createFlag = validatePermission(user, businessDevelopment.createBDEmployees);

    return (
      <Button
        className="btn btn-default btn-sm"
        disabled={!createFlag}
        onClick={() => this.setState({ showPicModal: true })}
      >
        <i className="fa fa-plus"></i> {'  '}Create
      </Button>
    );
  };

  //This is for opening the view manager
  onClickViewManagers = picData => {
    this.setState({ showManagerModal: true, picData });
  };

  onClickAddLocation = picData => {
    this.setState({ showPICLocationModal: true, picData });
  }


  onClickLocationHistory = (selectedRow) => {
    const { locationHistory } = selectedRow;
    const locHistory = locationHistory && locationHistory
      .map(entry => ({ ...entry, changes: { location: entry } }));
    this.setState({ showLocationHistory: true, selectedRow, locHistory })
  }

  //This is for building the close icon
  closeModal = () => {
    const { byjusGrid } = this.refs;

    this.setState({
      showPicModal: false,
      showManagerModal: false,
      picData: null,
      showPICLocationModal: false
    });

    byjusGrid.onClickRefresh();
  };

  //This is the function is used for making the column into dashboard
  getColumns = () => {
    let { user = {} } = this.props;
    const editFlag = validatePermission(user, businessDevelopment.editBDEmployees);

    const columns = [
      {
        dataField: 'pic_email_id',
        text: 'PIC Email Id',
        quickFilter: true
      },
      {
        dataField: 'pic_tnl_id',
        text: 'PIC Tnl Id',
        quickFilter: true
      },
      {
        dataField: 'location',
        text: 'Location',
        quickFilter: false,
        formatter: (cell, row) => {
          const { locations } = row;
          return <>
            <span>{!isEmpty(locations) ? locations.map(location => location).join(',') : ""}</span>
            <Button color="link" size="sm" className="ml-2" onClick={() => this.onClickLocationHistory(row)}>
              <i className="fa fa-history" />
            </Button>
          </>
        }
      },
      {
        dataField: '',
        text: 'Actions',
        className: "btn-col-2",
        formatter: (cell, row) => {
          return (
            <div>
              <ByjusDropdown
                type="simple"
                defaultTitle="Actions"
                titleIcon="fa fa-gear"
                items={[{
                  title: 'View Managers',
                  icon: 'fa fa-eye',
                  onClick: () => this.onClickViewManagers(row)
                }, {
                  title: 'Edit Location',
                  icon: 'fa fa-eye',
                  onClick: () => this.onClickAddLocation(row)
                }]} />

              {/* <Button
                color="primary"
                size="sm"
                disabled={!editFlag}
                onClick={() => this.onClickViewManagers(row)}
              >
                <i className="fa fa-eye" /> View Managers
              </Button>{" "}
              <Button
                color="primary"
                size="sm"
                disabled={!editFlag}
                onClick={() => this.onClickAddLocation(row)}
              >
                <i className="fa fa-eye" /> Edit Location
              </Button> */}
            </div>
          );
        }
      }
    ];

    return columns;
  };

  //this function is used for making API call to the database
  getSalesSubDepartmentDetails = () => {
    //we are declaring the request body
    const bodyPayload = {
      name: 'sales'
    };

    //now we are changing the state
    this.setState({ loading: true, error: null });
    callApi(
      `/usermanagement/hierarchy/subDepartment/details`,
      'POST',
      bodyPayload,
      null,
      null,
      true
    )
      .then(response => {
        const { roles } = response;

        //there we are using find function for only getting the particular role from API
        const teamManagerRole = find(roles, { formattedName: 'team_manager' });
        const bdtmRole = find(roles, { formattedName: 'bdtm' });
        const bdaRole = find(roles, { formattedName: 'bda' });
        const bdtRole = find(roles, { formattedName: 'bdt' });
        const bdatRole = find(roles, { formattedName: 'bdat' });

        //in this we are adding and updating the values to the existing state
        this.setState({
          salesDetails: response,
          teamManagerRole,
          bdtmRole,
          bdaRole,
          bdtRole,
          bdatRole,
          loading: false,
          error: null
        });
      })
      .catch(error => {
        //this is the code for catching the error if some problem is in the server
        this.setState({ loading: false, error });
      });
  };

  //this is the function of the component life cycle which excute when the component is mount
  componentDidMount = async () => {
    await this.getSalesSubDepartmentDetails();
  };

  render() {
    const {
      loading,
      error,
      showPicModal,
      showManagerModal,
      picData,
      teamManagerRole,
      bdtmRole,
      bdaRole,
      bdtRole,
      bdatRole,
      showPICLocationModal,
      showLocationHistory, selectedRow, locHistory
    } = this.state;

    return (
      <>
        <Box>
          <BoxBody loading={loading} error={error}>
            {/* //This is the component which having the lots of functionality  */}
            <ByjusGrid
              ref="byjusGrid"
              modelName="Pic"
              gridDataUrl={'/paymentmanagement/icrpic/list'}
              toolbarItems={this.buildToolbarItems()}
              columns={this.getColumns()}
              dbName="friendlyPotato"
              sort={{ pic_email_id: 'asc' }}
            />
            {showLocationHistory && <UserHistory history={locHistory} userData={selectedRow} closeModal={() => this.setState({ showLocationHistory: false })} />}
          </BoxBody>
        </Box>
        {showPicModal && <PicModal updatedLocation={false} closeModal={this.closeModal} />}
        {showManagerModal && (
          <PicManager
            picData={picData}
            teamManagerRole={teamManagerRole}
            bdtmRole={bdtmRole}
            bdaRole={bdaRole}
            bdtRole={bdtRole}
            bdatRole={bdatRole}
            closeModal={this.closeModal}
          />
        )}
        {showPICLocationModal && <PicModal
          picData={picData}
          closeModal={this.closeModal}
          updatedLocation={true}
        />}
      </>
    );
  }
}

const mapStateToProps = (state) => ({
  user: get(state, 'auth.user')
});

export default connect(mapStateToProps)(PicICR)

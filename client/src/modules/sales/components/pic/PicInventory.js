import React, { Component } from 'react';
import { Button } from 'reactstrap';
import { connect } from "react-redux";
import { find, isEmpty, get } from 'lodash';

import { callApi } from 'store/middleware/api';
import { Box, BoxBody } from 'components/box';
import ByjusGrid from 'modules/core/components/grid/ByjusGrid';
import selectors from '../../../../store/selectors';
import PicInventoryModal from "./PicInventoryModal";
import PicInventoryManager from './PicInventoryManager';
import { businessDevelopment, validatePermission } from 'lib/permissionList';

class PicInventory extends Component {
  constructor(props) {
    super(props);
    this.state = {
      loading: false,
      error: false,
      showPicInventoryModal: false,
      showPicInventoryManagerModal: false,
      userExit: this.props.user.permissions.indexOf("ORDER_INVENTORY_VIEW")
    };
  }

  onClickViewManagers = picData => {
    this.setState({ showPicInventoryManagerModal: true, picData })
  }

  //this is the function is used to create extra toolbar item into exiting toolbar
  buildToolbarItems = () => {
    let { user = {} } = this.props;
    const createFlag = validatePermission(user, businessDevelopment.createBDEmployees);

    return (
      <Button
        className="btn btn-default btn-sm"
        disabled={!createFlag}
        onClick={() => this.setState({ showPicInventoryModal: true })}
      >
        <i className="fa fa-plus"></i> {'  '}Create
      </Button>
    );
  }

  //this is method for making the column 
  getColumns = () => {
    let { user = {} } = this.props;
    const editFlag = validatePermission(user, businessDevelopment.editBDEmployees);

    const column = [{
      dataField: 'pic_email_id',
      text: 'PIC Email Id',
      quickFilter: true
    }, {
      dataField: '',
      text: 'Actions',
      formatter: (cell, row) => {
        return (
          <div>
            <Button
              color="primary"
              size="sm"
              disabled={!editFlag}
              onClick={() => this.onClickViewManagers(row)}
            >
              <i className="fa fa-eye" /> View Managers
            </Button>
          </div>
        );
      }
    }]
    return column;
  }

  //This is for building the close icon
  closeModal = () => {
    const { byjusGrid } = this.refs;

    this.setState({
      showPicInventoryManagerModal: false,
      showPicInventoryModal: false
    });

    byjusGrid.onClickRefresh();
  };

  //this function is used for making API call to the database
  getSalesSubDepartmentDetails = () => {
    //we are declaring the request body
    const bodyPayload = { name: 'sales' };

    //now we are changing the state
    this.setState({ loading: true, error: null });
    callApi(
      `/usermanagement/hierarchy/subDepartment/details`, 'POST', bodyPayload, null, null, true)
      .then(response => {
        const { roles } = response;

        //there we are using find function for only getting the particular role from API
        const teamManagerRole = find(roles, { formattedName: 'team_manager' });
        const bdaRole = find(roles, { formattedName: 'bda' });

        //in this we are adding and updating the values to the existing state
        this.setState({
          salesDetails: response,
          teamManagerRole,
          bdaRole,
          loading: false,
          error: null
        });
      }).catch(error => {
        //this is the code for catching the error if some problem is in the server
        this.setState({ loading: false, error });
      });
  };

  componentDidMount = async () => {
    await this.getSalesSubDepartmentDetails();
  }

  render() {
    const { userExit, picData, showPicInventoryModal, showPicInventoryManagerModal, teamManagerRole, bdaRole } = this.state;
    return (
      <Box>
        <BoxBody >
          {userExit >= 0 && <ByjusGrid
            ref="byjusGrid"
            columns={this.getColumns()}

            //This is operation for hitting initial API from backend 
            dbName="friendlyPotato"
            gridDataUrl={'/usermanagement/pic/inventory/list'}
            toolbarItems={this.buildToolbarItems()}
            modelName="InventoryPic"
            sort={{ pic_email_id: 'asc' }}
          />}
          {showPicInventoryModal && <PicInventoryModal closeModal={this.closeModal} />}
          {showPicInventoryManagerModal && <PicInventoryManager
            closeModal={this.closeModal}
            picData={picData}
            teamManagerRole={teamManagerRole}
            bdaRole={bdaRole}
          />}
        </BoxBody>
      </Box>
    );
  }

}

const mapStateToProps = state => ({ user: selectors.auth.getUser(state) })
export default connect(mapStateToProps)(PicInventory);
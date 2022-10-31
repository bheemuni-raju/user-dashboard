import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { get, isEmpty } from 'lodash';
import { Button, Badge, DropdownItem, DropdownMenu, DropdownToggle, Nav, NavItem } from 'reactstrap';
import axios from 'axios';
import { useSelector } from 'react-redux';
import { AppHeaderDropdown } from '@byjus-orders/uikit-react';

import AppsDropdown from 'components/appdropdown/AppDropdown';
import AppBreadcrumb from 'components/AppBreadcrumbV2';
import { user as userPermission, validatePermission } from 'lib/permissionList';
import { AppConsumer } from '../../Application';
import EnvNavBadge from './EnvNavBadge';
import OrgDrawer from './OrgDrawer';

const DefaultHeader = (props) => {
  const user = useSelector(state => state.auth.user);
  let profileName = user && ((user.name) ? user.name : user.email);
  const [isOrgClicked, setIsOrgClicked] = useState(false);
  const [isButtonHover, setIsButtonHover] = useState(false);
  const clearStorage = () => {
    window.localStorage.clear();
    window.location = window.location.origin;
  }

  const onMouseEnter = () => {
    setIsButtonHover(true);
  }
  const onMouseLeave = () => {
    setIsButtonHover(false);
  }

  const logOutUser = () => {
    return axios({
      url: `${window.NAPI_URL}/usermanagement/employee/logoutUser`,
      method: 'POST',
      headers: {
        Accept: 'application/json, text/plain, */*',
        'Content-Type': 'application/json'
      },
      data: {}
    })
      .then(() => {
        clearStorage();
      })
      .catch(() => {
        clearStorage();
      });
  }

  const canImpersonate = (context) => {
    const { user } = context;
    if (user) {
      return validatePermission(user, userPermission.impersonate);
    }
  }
  const toggleOrgDrawer = () => {
    setIsOrgClicked(!isOrgClicked);
  }

  const closeOrgDrawer = () => {
    if (!isButtonHover) {
      setIsOrgClicked(false);
    }
  }

  return (
    <AppConsumer>{
      context => (
        <>
          <Nav navbar>
            <AppBreadcrumb appRoutes={[]} />
          </Nav>
          <Nav className="ml-auto" navbar>
            <EnvNavBadge />
            {
              <Button color="link" onClick={toggleOrgDrawer} onMouseEnter={onMouseEnter} onMouseLeave={onMouseLeave} className="p-0 ml-2">
                {user && get(user, "orgFormattedName", "").toUpperCase()}
                <i className="fa fa-caret-down ml-1"></i>
              </Button>
            }
            {isOrgClicked && <OrgDrawer close={closeOrgDrawer} />}
            <NavItem className="d-md-down-none">
              <Button className="nav-link">
                <i className="fa fa-bell" />
                <Badge pill color="danger">
                  {get(props, 'applicationAnnouncements', []).length}
                </Badge>
              </Button>
            </NavItem>
            <AppsDropdown appName="ums" />
            <AppHeaderDropdown direction="down" className="pr-5">
              <DropdownToggle nav>{user && profileName}</DropdownToggle>
              <DropdownMenu left="true">
                <DropdownItem header tag="div" className="text-center">
                  <strong>Account</strong>
                </DropdownItem>
                {user && user.appName && <DropdownItem tag={Link} to="/users/profile">
                  <i className="fa fa-user" /> Profile
                </DropdownItem>}
                {canImpersonate(context) && <DropdownItem tag={Link} to="/users/impersonate">
                  <i className="fa fa-user-secret" /> Impersonate
                </DropdownItem>}
                <DropdownItem onClick={logOutUser}>
                  <i className="fa fa-lock" /> Logout
                </DropdownItem>
              </DropdownMenu>
            </AppHeaderDropdown>
          </Nav>
        </>
      )
    }
    </AppConsumer >
  );
}

export default DefaultHeader;

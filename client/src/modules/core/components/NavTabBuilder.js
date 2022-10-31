import React from 'react';
import { connect } from 'react-redux';
import { NavLink as RRNavLink, Route, withRouter, Switch, Redirect } from 'react-router-dom';
import PropTypes from 'prop-types';
import { Nav, NavItem, NavLink, TabContent, TabPane } from 'reactstrap';
import { get, snakeCase, remove, isEmpty } from 'lodash';

class NavTabBuilder extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      selectedTab: null
    }
  }

  handleSelect = (eventkey) => {
    const { onSelect, tabs } = this.props;

    this.setState({ selectedTab: eventkey }, () => {
      onSelect && onSelect(eventkey, tabs);
    });
  }

  componentWillMount = () => {
    const { defaultTab } = this.props;
    const { selectedTab } = this.state;

    defaultTab ? this.handleSelect(defaultTab) : this.handleSelect(selectedTab);
  }

  render() {
    let { tabs, match } = this.props;
    const { selectedTab } = this.state;
    const defaultTabItem = get(tabs, '0');
    const defaultPath = snakeCase(defaultTabItem.path || defaultTabItem.title);

    //Removing hidden tabs
    remove(tabs, t => get(t, 'hidden') || isEmpty(t));

    return (
      <>
        <Nav tabs>
          {tabs.map((tab, idx) => {
            const tabPath = snakeCase(tab.path || tab.title);
            return (
              <NavItem key={idx}>
                <NavLink
                  to={`${match.url}/${tabPath}`}
                  tag={RRNavLink}
                  active={selectedTab === idx + 1}
                  onClick={() => { 
                    this.handleSelect(idx + 1); 
                  }}
                >
                  {tab.title}
                </NavLink>
              </NavItem>
            )
          })}
        </Nav>
         <Switch>
          {tabs.map((tab, idx) => {
            const tabPath = snakeCase(tab.path || tab.title);
            return(
              <Route path={`${match.url}/${tabPath}`} component={() => tab.component}/>      
            );
          }
          )}
          <Redirect to={`${match.url}/${defaultPath}`} />
         </Switch>
      </>
    )
  }
}

NavTabBuilder.propTypes = {
  tabs: PropTypes.array.isRequired,
  onSelect: PropTypes.func,
  defaultTab: PropTypes.number
}

export default withRouter(NavTabBuilder);
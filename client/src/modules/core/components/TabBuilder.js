import React, { useState, useEffect } from 'react';
import { connect } from 'react-redux';
import { get, isEqual, map, remove, isEmpty } from 'lodash';
import PropTypes from 'prop-types';
import { Nav, NavItem, NavLink, TabContent, TabPane } from 'reactstrap';

const TabBuilder = (props) => {
  const [selectedTab, setSelectedTab] = useState(1);

  useEffect(() => {
    const { defaultTab, pathName, tabs } = props;

    defaultTab ? handleSelect(defaultTab) : handleSelect(selectedTab);
  }, [selectedTab]);

  const handleSelect = (eventkey) => {
    const { onSelect, tabs } = props;

    setSelectedTab(eventkey);
    onSelect && onSelect(eventkey, tabs);
  }

  let { tabs } = props;

  //Removing hidden tabs
  remove(tabs, t => get(t, 'hidden') || isEmpty(t));

  return (
    <>
      <Nav tabs>
        {tabs.map((tab, idx) => (
          <NavItem key={idx}>
            <NavLink
              active={selectedTab === idx + 1}
              onClick={() => { handleSelect(idx + 1); }}
            >{tab.icon && <i className={tab.icon}></i>}
              {' '}
              {tab.title}
            </NavLink>
          </NavItem>
        ))}
      </Nav>
      <TabContent activeTab={selectedTab} id="react-tabs">
        {tabs.map((tab, idx) => (
          (selectedTab == idx + 1) && <TabPane tabId={idx + 1} key={idx}>
            {tab.component}
          </TabPane>
        ))}
      </TabContent>
    </>
  );
}

TabBuilder.propTypes = {
  tabs: PropTypes.array.isRequired,
  onSelect: PropTypes.func,
  defaultTab: PropTypes.number
}

export default TabBuilder;

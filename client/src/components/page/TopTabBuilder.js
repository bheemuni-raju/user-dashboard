import React, { Fragment } from 'react';

class TopTabBuilder extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      activeKey: 1
    }
  }

  onClickTab = (tabIndex) => {
    this.setState({
      activeKey: tabIndex
    })
  }

  render = () => {
    const { topTabs } = this.props;
    const { activeKey } = this.state;
    return (
      <div className="top-tabs">
        {topTabs && topTabs.map((tab, idx) => {
          const activeCls = tab.tabIndex == activeKey ? "tab-item active" : "tab-item";
          return (
            <span key={idx} onClick={() => this.onClickTab(tab.tabIndex)} className={activeCls}>
              <span className="filter-menu">{tab.title}</span>
              <span className="separator"></span>
            </span>
          )
        })}
      </div>
    )
  }
}

export default TopTabBuilder

import React from 'react';
import { Box, BoxBody } from 'components/box';

//this is where we are importing the IRC and Inventory List
import PicICR from './PicICR';
import PicInventory from './PicInventory';

//this is for importing the tab component form the component module
import TabBuilder from 'modules/core/components/TabBuilder';

class PicList extends React.Component {
  //this is for declaring the tab inside our PICLIST view
  buildTabList = () => {
    const tabs = [
      { title: 'ICR List', component: <PicICR /> },
      { title: 'Inventory List', component: <PicInventory /> }
    ];
    return tabs;
  };

  render() {
    return (
      <>
        <Box>
          <BoxBody>
            <TabBuilder tabs={this.buildTabList()} />
          </BoxBody>
        </Box>
      </>
    );
  }
}

export default PicList;

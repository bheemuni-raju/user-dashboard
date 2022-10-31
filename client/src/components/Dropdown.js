import React, { useState } from 'react';
import PropTypes from 'prop-types';
import { Dropdown, DropdownToggle, DropdownMenu, DropdownItem } from "reactstrap";

const ByjusDropdown = (props) => {
    const { items, gridTitle, defaultTitle } = props;
    const [ dropdownOpen, setDropdownOpen ] = useState(false);
    const finalDefaultTitle = gridTitle ? `${defaultTitle} ${gridTitle}` : defaultTitle;
    const [ ddTitle, setDdTitle ] = useState(finalDefaultTitle);

    const onClickDropdown = (eventKey, item) => {
        if(gridTitle){
            setDdTitle(`${item.title} ${gridTitle}`);
        }
        else{
            setDdTitle(`${item.title}`);
        }
        
        props.onClick && props.onClick(eventKey, item);
    }

    return(
        <Dropdown 
            isOpen={dropdownOpen} 
            toggle={ () => setDropdownOpen(!dropdownOpen)}
            className="d-inline-block"
        >
            <DropdownToggle caret color="secondary" size="sm">
                { props.titleIcon && <i className={props.titleIcon}/>}
                { ddTitle }
            </DropdownToggle>
            <DropdownMenu>
                { props.header && <DropdownItem header>{props.header}</DropdownItem>  }          
                 <DropdownItem divider/>
                { items.map((item, idx) => {
                    return (
                        <DropdownItem  onClick={(event) => onClickDropdown(idx+1, item)} key={idx}>
                            <i className={item.icon} /> {item.title}
                        </DropdownItem>
                    )
                })}                                      
            </DropdownMenu>
        </Dropdown>
    );
}

ByjusDropdown.propTypes = {
    title: PropTypes.string,
    titleIcon: PropTypes.string,
    items: PropTypes.arrayOf(PropTypes.shape({
     title: PropTypes.string.isRequired,
     icon: PropTypes.string,
     onClick: PropTypes.func
   })).isRequired
};

ByjusDropdown.defaultProps = {
  title: "Actions",
  items: []
};

export default ByjusDropdown;
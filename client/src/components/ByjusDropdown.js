import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import { isEmpty, remove } from 'lodash';
import { Dropdown, DropdownToggle, DropdownMenu, DropdownItem } from "reactstrap";

const ByjusDropdown = (props) => {
    let { items, gridTitle, defaultTitle, type, toggleProps = {} } = props;
    const [dropdownOpen, setDropdownOpen] = useState(false);
    const finalDefaultTitle = gridTitle ? `${defaultTitle} ${gridTitle}` : defaultTitle;
    const [ddTitle, setDdTitle] = useState(finalDefaultTitle);

    remove(items, i => isEmpty(i));

    /**adding isAllowed property to true if not passed */
    items = items.map(item => {
        if (item && !item.hasOwnProperty('isAllowed')) {
            item["isAllowed"] = true;
        }
        return item;
    });

    useEffect(() => {
        setDdTitle(defaultTitle);
    }, [defaultTitle])

    const onClickDropdown = (eventKey, item) => {
        if (gridTitle && type !== "simple") {
            setDdTitle(`${item.title} ${gridTitle}`);
        }
        else if (type !== "simple") {
            setDdTitle(`${item.title}`);
        }

        props.onClick && props.onClick(eventKey, item);
        item.onClick && item.onClick(eventKey, item);
    }

    return (
        <Dropdown
            isOpen={dropdownOpen}
            toggle={() => setDropdownOpen(!dropdownOpen)}
            className="d-inline-block  position-static"
        >
            <DropdownToggle caret color="secondary" size="sm" {...toggleProps}>
                {props.titleIcon && <i className={props.titleIcon} />}{' '}
                {ddTitle}
            </DropdownToggle>
            <DropdownMenu className="pre-scrollable overflow-auto">
                {props.header && <DropdownItem header>{props.header}</DropdownItem>}
                {props.header && <DropdownItem divider />}
                {items.map((item, idx) => {
                    const { isAllowed, disabled = false } = item;
                    return (isAllowed ?
                        <DropdownItem
                            onClick={(event) => onClickDropdown(idx + 1, item)} key={idx}
                            disabled={disabled}
                        >
                            <i className={item.icon} /> {item.title}
                        </DropdownItem>
                        : <div key={idx} />
                    )
                })}
                {props.children}
            </DropdownMenu>
        </Dropdown>
    );
}

ByjusDropdown.propTypes = {
    title: PropTypes.string,
    titleIcon: PropTypes.string,
    items: PropTypes.arrayOf(PropTypes.shape({
        title: PropTypes.string,
        icon: PropTypes.string,
        onClick: PropTypes.func
    })).isRequired
};

ByjusDropdown.defaultProps = {
    title: "Actions",
    items: []
};

export default ByjusDropdown;
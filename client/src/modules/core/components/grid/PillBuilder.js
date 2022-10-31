import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import { Nav, NavItem, NavLink } from 'reactstrap';
import { Link } from "react-router-dom";
import { DropdownItem } from "reactstrap";

import ByjusDropdown from 'components/ByjusDropdown';

const PillBuilder = (props) => {
    const [selectedPill, setSelectedPill] = useState(1);
    const { defaultPill, modelName, gridId, pills, type, gridTitle, dbName } = props;

    useEffect(() => {
        defaultPill ? handleSelect(defaultPill) : handleSelect(selectedPill);
    }, [defaultPill])

    useEffect(() => {
        selectedPill && handleSelect(selectedPill);
    }, [selectedPill])

    const handleDropdownClick = (eventKey) => {
        const { onSelect, pills } = props;

        onSelect && onSelect(eventKey, pills);
    }

    const handleSelect = (eventkey) => {
        const { onSelect, pills } = props;

        setSelectedPill(eventkey);
        onSelect && onSelect(eventkey, pills);
    }

    pills.map(pill => pill.isAllowed = pill.isAllowed || true);

    const component = type === "pill" ?
        <Nav pills>
            {
                pills.map((pill, idx) => (
                    <NavItem key={idx}>
                        <NavLink
                            active={selectedPill === idx + 1}
                            onClick={() => { handleSelect(idx + 1); }}
                        >
                            {pill.title}
                        </NavLink>
                    </NavItem>
                ))
            }
        </Nav>
        : <ByjusDropdown
            items={pills}
            defaultTitle={pills[selectedPill - 1].title}
            gridTitle={gridTitle}
            header="Default Filters"
            onClick={handleDropdownClick}
        >
            <DropdownItem divider />
            <DropdownItem className="text-primary" tag={Link} to={`/custom-views/new?gridId=${gridId}&entityName=${modelName}&namespace=${dbName}`}>
                <i className="fa fa-plus"></i> New Custom View
            </DropdownItem>
        </ByjusDropdown>

    return component;
}

PillBuilder.propTypes = {
    pills: PropTypes.array.isRequired,
    onSelect: PropTypes.func,
    defaultPill: PropTypes.number
}

PillBuilder.defaultProps = {
}

export default PillBuilder;
import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import { Link } from "react-router-dom";
import { DropdownItem } from "reactstrap";
import { findIndex, startCase } from 'lodash';

import ByjusDropdown from 'components/ByjusDropdown';

const existingQueryParams = () => {
    const qParams = new URLSearchParams(window.location.search);
    const qPage = qParams.get('page');
    const qViewName = qParams.get('viewName');
    const qViewId = qParams.get('viewId');
    const qSizePerPage = qParams.get('sizePerPage');

    return {
        qPage: qPage ? Number(qPage) : 1,
        qSizePerPage: qSizePerPage ? Number(qSizePerPage) : 10,
        qViewName: qViewName || 'all',
        qViewId: qViewId
    };
}

const PillBuilderV2 = (props) => {
    const { qViewName, qViewId } = existingQueryParams();
    const [eventKey, setEventKey] = useState(1);
    const { defaultPill, modelName, gridId, pills, type, gridTitle, dbName } = props;
    let defaultTitle = pills[eventKey - 1] && pills[eventKey - 1].title;
    let urlParams = `?gridId=${gridId}&entityName=${modelName}&namespace=${dbName}`;
    let newUrl = `/custom-views/new${urlParams}`;
    let editUrl = `/custom-views/${qViewId}/edit${urlParams}`;

    useEffect(() => {
        if (qViewName) {
            const idx = findIndex(pills, (item) => {
                return item.title.toLowerCase() == startCase(qViewName).toLowerCase()
            });
            handleDropdownClick(idx + 1);
        }
        /*else if (defaultPill) {
            handleSelect(defaultPill);
        }
        else {
            handleSelect(eventKey);
        }*/
    }, [defaultPill, pills])

    const handleDropdownClick = (eventKey) => {
        const { onSelect, pills } = props;

        setEventKey(eventKey);
        onSelect && onSelect(eventKey, pills);
    }

    pills.map(pill => pill.isAllowed = pill.isAllowed || true);

    return (
        <>
            <ByjusDropdown
                items={pills}
                defaultTitle={defaultTitle}
                gridTitle={gridTitle}
                header="Default Filters"
                onClick={handleDropdownClick}
            >
                <DropdownItem divider />
                <DropdownItem className="text-primary" tag={Link} to={newUrl}>
                    <i className="fa fa-plus"></i> New Custom View
            </DropdownItem>
            </ByjusDropdown>
            {qViewId &&
                <span className="customview-edit pl-2" style={{ fontSize: 18 }}>
                    <Link to={editUrl}>
                        <i className="fa fa-pencil"></i>
                    </Link>
                </span>
            }
        </>
    );
}

PillBuilderV2.propTypes = {
    pills: PropTypes.array.isRequired,
    onSelect: PropTypes.func,
    defaultPill: PropTypes.number
};

export default PillBuilderV2;
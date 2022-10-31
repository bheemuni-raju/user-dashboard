import React, { useState } from 'react';
import lodash from 'lodash';
import { Button, Collapse } from 'reactstrap';

import { Box, BoxBody, BoxHeader } from 'components/box';
import FormBuilder from 'components/form/FormBuilder';

const QuickSearch = (props) => {  
    const { columns } = props;
    const { collapseQs, setCollapseQs } = useState(false);
    
    const buildFormFields = () => {
        const filterColumns = lodash.filter(columns, {quickSearch: true});
        const fields = filterColumns.map(column => {
            return {
                label: column.text || "Default Label",
                name: column.dataField|| "default",
                type: column.filterType && column.filterType.toLowerCase() || "text",
                //placeholder: column.text || "Default Placeholder",
            }
        });

        return fields;
    }

    const applyFilters = () => {

    }

    const clearFilters = () => {

    }

    const formFields = buildFormFields();

    /**
     * If no quickSearch fields are there just ignore don't render the component instead render empty fragment
     */
    if(formFields.length === 0) {
        return(
            <></>
        );
    }

    return(
        <div className="search-form">
            <Button onClick={setCollapseQs}>
                Search Filters <span className="caret" />
            </Button>
            <Collapse isOpen={collapseQs}>
                <FormBuilder 
                    fields={formFields} 
                    //initialValues={formValues}
                    cols={4}
                />
                <div className="search-button-group">
                    <Button
                        color="success"
                        onClick={applyFilters}
                        style={{ marginRight: '8px' }}
                    >
                        Apply Filter
                    </Button>
                    <Button color="danger" onClick={clearFilters}>
                        Clear Filter
                    </Button>
                </div>
            </Collapse>
        </div>
    )
}

export default QuickSearch;
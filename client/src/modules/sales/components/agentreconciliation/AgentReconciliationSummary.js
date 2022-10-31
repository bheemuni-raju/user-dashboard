import React from 'react';
import { connect } from 'react-redux';
import moment from 'moment';

import ByjusGrid from "modules/core/components/grid/ByjusGrid";
import { Box, BoxBody } from 'components/box';

class AgentReconciliationSummary extends React.Component {
    constructor(props) {
        super(props);
    }

    getColumns = () => {
        return [{
            dataField: '_id',
            text: 'Group By',
            className: 'td-header-info',
            formatter : (cell, row) => {
                const { reconciledAt = ""} = cell;
                return cell? moment(new Date(reconciledAt)).format("YYYY-MM-DD") : "";
            } 
        }, {
            dataField: 'total',
            text: 'Total',
            className: 'td-header-warning'
        }, {
            dataField: 'agreed',
            text: 'Agreed',
            className: 'td-header-success',

        }, {
            dataField: 'not_agreed',
            text: 'Not Agreed',
            className: 'td-header-success'
        }, {
            dataField: 'pending',
            text: 'Pending',
            className: 'td-header-success'
        }];
    }

    render() {
        const columns = this.getColumns();
        const gridDataUrl = `/usermanagement/agentreconciliation/getReconciliationSummary`;

        return (
            <Box>
                <BoxBody>
                    <ByjusGrid
                        ref="byjusGrid"
                        columns={columns}
                        gridDataUrl={gridDataUrl}
                    />
                </BoxBody>
            </Box>
        )
    }
}

const mapStateToProps = state => ({
    user: state.auth.user
});

export default connect(mapStateToProps)(AgentReconciliationSummary);

import React, { useState } from "react";

import { BoxBody, Box } from "components/box";
import ByjusGrid from "modules/core/components/grid/ByjusGrid";

const SopTracker = (props) => {

    let [byjusGridRef, setByjusGridRef] = useState("");

    const getColumns = () => {
        const columns = [{
            dataField: "date",
            text: "Date",                               
            className: "td-header-success"
        },{
            dataField: "totalCount",
            text: "Total",
            className: "td-header-success"
        }, {
            dataField: "notAvailableCount",
            text: "Not Available",
            className: "td-header-success"
        }, {
            dataField: "qraRiskRatingCount",
            text: "QRA Risk",
            className: "td-header-warning"
        }, {
            dataField: "averageRatingCount",
            text: "Average",
            className: "td-header-warning"
        }, {
            dataField: "goodRatingCount",
            text: "Good",
            className: "td-header-warning"
        }];

        return columns;
    }

    const columns = getColumns();
    const gridDataUrl = "/usermanagement/managesop/getPerformanceRatingSummary";

    return (
        <Box>
            <BoxBody>
                <ByjusGrid
                    ref={element => setByjusGridRef(element)}
                    gridDataUrl={gridDataUrl}
                    columns={columns}
                    sort={{ date: -1 }}
                />
            </BoxBody>
        </Box>
    );
}

export default SopTracker;

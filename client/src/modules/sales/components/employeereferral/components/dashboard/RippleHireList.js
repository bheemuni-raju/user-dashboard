import React, { useState } from 'react';
import moment from 'moment';
import { startCase } from 'lodash';

import { Box, BoxBody } from 'components/box';
import ByjusGrid from 'modules/core/components/grid/ByjusGridV3';

const RippleHireList = () => {

    const formatters = () => ({
        departmentFormatter: (cell) => {
            return cell && startCase(cell);
        },
        roleFormatter: (cell) => {
            return cell && startCase(cell);
        },
        phoneNoFormatter: (cell) => {
            return cell && cell.join();
        },
        dateFormatter: (cell) => {
            return cell && moment(cell).format("YYYY-MM-DD HH:mm:ss");
        }

    })

    return (
        <Box>
            <BoxBody>
                <ByjusGrid
                    isKey="_id"
                    gridId="ums_ripplehire_grid"
                    formatters={formatters()}
                    modelName="UserReferral"
                    gridDataUrl={`/usermanagement/employeereferral/listRhData`}
                />
            </BoxBody>
        </Box>
    );
}

export default RippleHireList;
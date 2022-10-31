import React, { useRef ,useState } from 'react';
import moment from 'moment';
import {isEmpty} from 'lodash'

import ByjusGrid from 'modules/core/components/grid/ByjusGridV3';
import { Box, BoxBody } from 'components/box';

const MigrationList = (props) => {
    let byjusGridRef = useRef();
    const [error, setError] = useState(null);
    const [loading, setLoading] = useState(false);

    const refreshGrid = () => {
        byjusGridRef.current.refreshGrid();
    }

    const formatters = () => ({
        createdAtFormatter: (cell, row) => {
            const createdAt = row.createdAt;
            if (!isEmpty(createdAt)) {
                return createdAt && moment(createdAt).format("MMM D YYYY, h:mm a");
            }
        },
        updatedAtFormatter: (cell, row) => {
            const updatedAt = row.updatedAt;
            if (!isEmpty(updatedAt)) {
                return updatedAt && moment(updatedAt).format("MMM D YYYY, h:mm a");
            }
        }
    })

    return (
        <Box>
            <BoxBody loading={loading} error={error}>
                <ByjusGrid
                    isKey="_id"
                    gridId="ums_npgexemplum_migration_grid"
                    ref={byjusGridRef}
                    formatters={formatters()}
                    gridDataUrl="/usermanagement/analyticsmanagement/databasemigrationRoutes/list"
                />
            </BoxBody>
        </Box>
    )
}

export default MigrationList;


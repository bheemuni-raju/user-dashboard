import React, { useState, useRef } from 'react';
import { Link } from 'react-router-dom';
import { Button } from 'reactstrap';
import { useHistory } from 'react-router-dom';
import { get } from 'lodash';
import { useSelector } from 'react-redux';

import { callApi } from "store/middleware/api";
import Confirm from 'components/confirm';
import ByjusGrid from 'modules/core/components/grid/ByjusGridV2';
import { Box, BoxBody } from 'components/box';
import { maintenance, validatePermission } from 'lib/permissionList';

const GridTemplateList = (props) => {
    const [loading, setLoading] = useState(false);
    const history = useHistory();
    const user = useSelector(state => get(state, 'auth.user'));
    const gridRef = useRef();

    function buildToolbarItems() {
        const canCreateGridConfig = validatePermission(user, [maintenance.createGridConfig])

        return (
            <>
                <Link className="btn btn-secondary btn-sm" hidden={!canCreateGridConfig} to="/settings/grid-configuration/create">
                    <i className="fa fa-plus"></i> {' '}Create
                </Link> {' '}
            </>
        )
    }

    async function deleteGridView({ _id: viewId, viewName }) {
        let result = await Confirm({ "message": `Deleting View ${viewName}?` });

        try {
            if (result) {
                setLoading(true);
                await callApi(`/deleteView`, 'DELETE', { viewId }, null, null, true)
                gridRef.current && gridRef.current.refreshGrid();
                setLoading(false);
            }
        }
        catch (error) {
            setLoading(false);
        }
    }

    const formatters = {
        countFormatter: (cell) => {
            return cell ? cell.length : 0;
        },
        dateFormatter: (cell) => {
            return (
                <span>{new Date(cell).toLocaleString('en-US')}</span>
            )
        }
    };

    const extraColumns = [{
        dataField: "actions",
        width: '120px',
        text: "Actions",
        position: 2,
        formatter: (cell, row) => {
            const canEditGridConfig = validatePermission(user, [maintenance.editGridConfig])
            const canDeleteGridConfig = validatePermission(user, [maintenance.deleteGridConfig])

            return (
                <div>
                    <Link hidden={!canEditGridConfig} to={{
                        pathname: `/settings/grid-configuration/edit`, state: {
                            gridId: row.gridId,
                            viewName: row.viewFormattedName
                        }
                    }} >
                        <Button color="primary" size="sm">
                            <i className="fa fa-pencil" />
                        </Button>
                    </Link>{' '}
                    <Button color="danger" size="sm" hidden={!canDeleteGridConfig} onClick={() => deleteGridView(row)}>
                        <i className="fa fa-trash" />
                    </Button>
                </div>
            );
        }
    }];

    return (
        <Box>
            <BoxBody loading={loading}>
                <ByjusGrid
                    ref={gridRef}
                    extraColumns={extraColumns}
                    formatters={formatters}
                    gridId="grid_template_base_grid"
                    modelName="GridTemplate"
                    sort={{ updatedAt: 'desc' }}
                    toolbarItems={buildToolbarItems()}
                    addOnQfColumns={[
                        { text: 'Grid Id', dataField: 'gridId' },
                        { text: 'View Name', dataField: 'viewName' }
                    ]}
                />
            </BoxBody>
        </Box>
    )
}

export default GridTemplateList

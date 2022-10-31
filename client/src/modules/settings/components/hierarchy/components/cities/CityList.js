import React, { useState, useRef } from 'react';
import { useSelector } from 'react-redux';
import { Button, Row, Col } from 'reactstrap';
import { isEmpty, get } from 'lodash';

import { Box, BoxHeader, BoxBody } from 'components/box';
import ByjusGrid from 'modules/core/components/grid/ByjusGridV3';
import { callApi } from 'store/middleware/api';
import Confirm from 'components/confirm';
import { hierarchy as hierarchyPermissions, validatePermission } from 'lib/permissionList';
import CityModal from './CityModal';

const CityList = () => {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [data, setData] = useState(null);
    const [showCityModal, setShowCityModal] = useState(false);
    const user = useSelector(state => get(state, 'auth.user'));
    let byjusGridRef = useRef();

    const buildToolbarItems = () => {
        const createFlag = validatePermission(user, hierarchyPermissions.createCity);

        return (
            <>
                <Button className="btn btn-secondary btn-sm" hidden={!createFlag} onClick={onClickCreate}>
                    <i className="fa fa-plus"></i> {' '}Create
                </Button> {' '}
            </>
        )
    }

    const onClickDelete = async (data) => {
        let result = await Confirm();
        if (result) {
            deleteRecord(data);
        }
    }

    const deleteRecord = (record) => {
        let cityId = record._id;

        setLoading(true);
        callApi(`/usermanagement/city/${cityId}`, 'DELETE', null, null, null, true)
            .then(response => {
                setLoading(false);
                setError(null);
                byjusGridRef && refreshGrid();
            })
            .catch(error => {
                setLoading(false);
                setError(error);
            })
    }

    const closeCityModal = () => {
        setShowCityModal(false);
        setData(null);
    }

    const onClickCreate = () => {
        setShowCityModal(true);
    }

    const onClickEdit = (data) => {
        setShowCityModal(true);
        setData(data);
    }

    const refreshGrid = () => {
        byjusGridRef.current.refreshGrid();
    }

    const formatters = () => ({
        actionFormatter: (cell, row) => {
            const editFlag = validatePermission(user, hierarchyPermissions.editCity);
            const deleteFlag = validatePermission(user, hierarchyPermissions.deleteCity);

            return (
                <div>
                    <Button color="primary" size="sm" hidden={!editFlag} onClick={() => onClickEdit(row)}>
                        <i className="fa fa-pencil" />
                    </Button>
                    {' '}
                    <Button color="danger" size="sm" hidden={!deleteFlag} onClick={() => onClickDelete(row)}>
                        <i className="fa fa-trash" />
                    </Button>
                </div>
            )
        }
    })

    return (
        <Box>
            <BoxBody loading={loading} error={error}>
                <ByjusGrid
                    isKey="_id"
                    gridId="ums_city_grid"
                    ref={byjusGridRef}
                    toolbarItems={buildToolbarItems()}
                    formatters={formatters()}
                    modelName="City"
                    gridDataUrl="/usermanagement/city/list"
                />
                {showCityModal &&
                    <CityModal
                        closeModal={closeCityModal}
                        refreshGrid={refreshGrid}
                        data={data}
                    />}
            </BoxBody>
        </Box>
    )
}

export default CityList;
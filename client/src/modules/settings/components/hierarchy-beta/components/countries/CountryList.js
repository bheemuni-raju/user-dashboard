import React, { useState, useRef } from 'react';
import { useSelector } from 'react-redux';
import { Button, Row, Col } from 'reactstrap';
import { isEmpty, get } from 'lodash';

import { Box, BoxHeader, BoxBody } from 'components/box';
import ByjusGrid from 'modules/core/components/grid/ByjusGridV3';
import { callApi } from 'store/middleware/api';
import Confirm from 'components/confirm';
import { hierarchy as hierarchyPermissions, validatePermission } from 'lib/permissionList';
import CountryModal from './CountryModal';

const CountryList = () => {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [data, setData] = useState(null);
    const [showCountryModal, setShowCountryModal] = useState(false);
    const user = useSelector(state => get(state, 'auth.user'));
    let byjusGridRef = useRef();

    const buildToolbarItems = () => {
        const createFlag = validatePermission(user, hierarchyPermissions.createCountry);

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
        let countryId = record.id;

        setLoading(true);
        callApi(`/usermanagement/hierarchy-beta/country/${countryId}`, 'DELETE', null, null, null, true)
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
        setShowCountryModal(false);
        setData(null);
    }

    const onClickCreate = () => {
        setShowCountryModal(true);
    }

    const onClickEdit = (data) => {
        
        setShowCountryModal(true);
        setData(data);
      }
      

    const refreshGrid = () => {
        byjusGridRef.current.refreshGrid();
    }

    const formatters = () => ({
        actionFormatter: (cell, row) => {
            const editFlag = validatePermission(user, hierarchyPermissions.editCountry);
            const deleteFlag = validatePermission(user, hierarchyPermissions.deleteCountry);

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
                    gridId="ums_country_beta_grid"
                    ref={byjusGridRef}
                    toolbarItems={buildToolbarItems()}
                    formatters={formatters()}
                    modelName="City"
                    gridDataUrl="/usermanagement/hierarchy-beta/country/list"
                />
                {showCountryModal &&
                    <CountryModal
                        closeModal={closeCityModal}
                        refreshGrid={refreshGrid}
                        data={data}
                    />}
            </BoxBody>
        </Box>
    )
}

export default CountryList;
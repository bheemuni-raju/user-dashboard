import React, { useState, useRef } from 'react';
import { get } from 'lodash';
import moment from 'moment';
import { useSelector } from 'react-redux';
import { Link, useLocation } from 'react-router-dom';
import { Button } from 'reactstrap';

import ByjusGrid from 'modules/core/components/grid/ByjusGridV2';
import { Box, BoxBody } from 'components/box';
import Drawer from 'components/drawer/Drawer';

import EnumForm from './EnumForm';

const EnumList = (props) => {
    const { match } = props;
    const [showForm, setShowForm] = useState(false);
    const [templateData, setTemplateData] = useState(null);

    const gridRef = useRef();
    const { pathname } = useLocation();
    const condensed = match.path !== pathname;

    const buildToolbarItems = () => {
        if (condensed) {
            return <></>
        }

        return (<>
            <div>
                <Button color="success" onClick={onClickCreate}>
                    <i className="fa fa-plus"></i> {' '}Create</Button>
            </div>
        </>)
    }

    const onClickCreate = () => {
        setTemplateData(null);
        setShowForm(true);
    }

    const onCloseForm = () => {
        setTemplateData(null);
        setShowForm(false);
    }

    const formatters = {
        dateFormatter: (cell) => {
            return cell ? moment(cell).format('LLL') : 'NA';
        },
        enumIdFormatter: (cell) => {
            return (
                <Link to={`enum-configuration/${cell}`}>{cell}</Link>
            )
        },
        actionFormatter: (cell, row) => {

            return (
                <div>
                    <Button color="primary" size="sm" onClick={() => onClickEdit(row)}>
                        <i className="fa fa-pencil" />
                    </Button>
                    {' '}
                </div>
            )
        }
    };

    const onClickEdit = (data) => {
        setTemplateData(data);
        setShowForm(true);
    }

    const refreshGrid = () => {
        gridRef && gridRef.current && gridRef.current.refreshGrid()
    }

    return (
        <Box>
            <BoxBody >
                <ByjusGrid
                    ref={gridRef}
                    formatters={formatters}
                    gridId="enum_templates_base_grid"
                    toolbarItems={buildToolbarItems()}
                    modelName="EnumTemplate"
                    sort={{ createdAt: 'desc' }}
                    gridDataUrl="/usermanagement/enum/list"
                />
                {showForm && <Drawer
                    title="Create new Enum"
                    onClose={onCloseForm}
                >
                    <EnumForm
                        refreshGrid={refreshGrid}
                        onClose={onCloseForm}
                        data={templateData}
                    />
                </Drawer>
                }
            </BoxBody>
        </Box>
    )
}

export default EnumList;

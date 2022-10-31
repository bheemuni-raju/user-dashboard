import React, { useState, useEffect } from 'react';
import { Button, Form, FormGroup, Label, Input, Col } from 'reactstrap';
import { get, cloneDeep, find } from 'lodash';
import { useLocation, useHistory, useParams } from 'react-router-dom';

import Confirm from 'components/confirm';
import { callApi } from "store/middleware/api";
import { Box, BoxBody } from 'components/box';
import { addOperators, operatorsMap } from '../advancesearch/AdvanceSearchUtil';

import CriteriaBuilder from 'modules/core/components/customview/CriteriaBuilder';
import ColumnPreferenceBuilder from './ColumnPreferenceBuilder';

import './customview.css';

const CustomView = () => {
    const [columnOptions, setColumnOptions] = useState([]);
    const [loading, setLoading] = useState(false);
    const [viewName, setViewName] = useState("");
    const [isFavorite, setIsFavorite] = useState(false);
    const [shareWith, setShareWith] = useState("everyone");
    const [criteriaMap, setCriteriaMap] = useState({ "1": {} });
    const [availableColumns, setAvailableColumns] = useState([]);
    const [selectedColumns, setSelectedColumns] = useState([]);
    const [viewFormattedName, setViewFormattedName] = useState("")
    const location = useLocation();
    const { viewId } = useParams();
    const history = useHistory();
    const params = new URLSearchParams(location.search);
    const model = params.get('entityName');
    const gridId = params.get('gridId');
    const namespace = params.get('namespace');

    useEffect(() => {
        if (viewId) {
            getViewDetails();
        }
        else {
            getColumns("new");
        }
    }, []);

    useEffect(() => {
        //console.log(selectedColumns, availableColumns, criteriaMap, viewName, isFavorite);
    }, [selectedColumns, availableColumns, criteriaMap, viewName, isFavorite]);

    async function getViewDetails() {
        try {
            setLoading(true);
            const { data } = await callApi(`/getView`, 'POST', {
                viewId,
                gridId,
                model,
                namespace
            }, null, null, true);
            setLoading(false);
            setViewName(data.viewName);
            setViewFormattedName(data.viewFormattedName)
            setIsFavorite(data.isFavorite);
            setSelectedColumns(data.columns);
            getColumns("edit", data.columns);
            setShareWith(data.shareWith);
            let incomingCriteriaMap = {};
            data.contextCriterias.forEach((cc, idx) => {
                const id = String(`${idx + 1}`);
                const dataType = cc.dataType || 'TEXT';
                const operatorOptions = operatorsMap[dataType];

                incomingCriteriaMap[id] = {
                    selectedColumn: {
                        dataField: cc.selectedColumn,
                        value: cc.selectedColumn
                    },
                    selectedOperator: {
                        value: cc.selectedOperator
                    },
                    selectedValue: cc.selectedValue,
                    operatorOptions
                };
            })

            setCriteriaMap(incomingCriteriaMap);
        }
        catch (e) {
            setLoading(false);
        }
    }

    async function getColumns(actionType, selectedColumns) {
        if (!gridId && !model) {
            setColumnOptions([]);
            return;
        }
        try {
            setLoading(true);
            const response = await callApi(`/getFields?gridId=${gridId}&model=${model}&namespace=${namespace}`, 'GET', null, null, null, true);
            setLoading(false);
            const columns = get(response, 'resp', []);
            const columnsWithOperators = addOperators(columns);
            const clonedColumns = cloneDeep(columnsWithOperators);
            setColumnOptions(clonedColumns);
            if (actionType === "new") {
                setAvailableColumns(clonedColumns);
            }
            else {
                let diffColumns = [];
                clonedColumns.forEach(col => {
                    const column = find(selectedColumns, { dataField: col.dataField });
                    if (!column) {
                        diffColumns.push(col);
                    }
                });

                setAvailableColumns(diffColumns);
            }
        }
        catch (error) {
            setColumnOptions([]);
            setLoading(false);
        }
    }

    async function onClickSave(action = "update") {
        const contextCriterias = criteriaAssembler();
        const body = {
            gridId,
            viewName,
            isFavorite,
            selectedColumns,
            shareWith,
            contextCriterias,
            viewFormattedName: action === 'update' ? viewFormattedName : ''
        };
        try {
            setLoading(true);
            await callApi(`/saveView`, 'POST', body, null, null, true)
            setLoading(false);
            history.goBack();
        }
        catch (error) {
            setLoading(false);
        }
    }

    function criteriaAssembler() {
        const keys = Object.keys(criteriaMap);
        const contextCriterias = [];

        keys.forEach(key => {
            const criteria = criteriaMap[key];
            const { selectedValue, selectedValue2 } = criteria || {};
            contextCriterias.push({
                selectedColumn: get(criteria, 'selectedColumn.dataField'),
                selectedOperator: get(criteria, 'selectedOperator.value'),
                selectedValue: selectedValue2 ? `${selectedValue}to${selectedValue2}` : selectedValue
            });
        });
        return contextCriterias;
    }

    function onClickCancel() {
        history.goBack();
    }

    async function onClickDelete() {
        let result = await Confirm({ "message": `Deleting View ${viewName}?` });

        try {
            if (result) {
                setLoading(true);
                await callApi(`/deleteView`, 'DELETE', { viewId }, null, null, true)
                setLoading(false);
                history.goBack();
            }
        }
        catch (error) {
            setLoading(false);
        }
    }

    function onChangeViewName(e) {
        setViewName(e.target.value);
    }

    function onChangeFavorite() {
        setIsFavorite(!isFavorite);
    }

    function onChangeShareWith(e) {
        setShareWith(e.target.value);
    }

    return (
        <Box>
            <BoxBody loading={loading}>
                <Form>
                    <FormGroup row>
                        <Label for="customViewName" lg={1} className="required">Name</Label>
                        <Col lg={6}>
                            <Input type="text"
                                name="customViewName"
                                id="customViewName"
                                onChange={onChangeViewName}
                                value={viewName}
                            />
                        </Col>
                        <Col lg={4} className="align-self-center">
                            <Label check>
                                <Input
                                    type="checkbox"
                                    onChange={onChangeFavorite}
                                    //value={isFavorite}
                                    value="isFavorite"
                                    checked={isFavorite === true}
                                />{' '}
                                Mark as Favorite
                            </Label>
                        </Col>
                    </FormGroup>
                </Form>
                <hr />
                <section>
                    <h4>Define the criteria ( if any )</h4>
                    <CriteriaBuilder options={{
                        columnOptions,
                        criteriaMap,
                        setCriteriaMap
                    }} />
                </section>
                <hr />
                <section>
                    <h4>Columns Preference:</h4>
                    <ColumnPreferenceBuilder options={{
                        availableColumns,
                        selectedColumns,
                        setAvailableColumns,
                        setSelectedColumns
                    }} />
                </section>
                <br />
                <section>
                    <h4>Share this with:</h4>
                    <div className="mb-5">
                        <FormGroup check>
                            <Label check>
                                <Input
                                    type="radio"
                                    name="sharedwith"
                                    value="only_me"
                                    onChange={onChangeShareWith}
                                    checked={shareWith === "only_me"}
                                />{' '}
                                Only me
                            </Label>
                        </FormGroup>
                        {/* Commented as this feature is not implemeted as of now */}
                        {/* <FormGroup check>
                            <Label check>
                                <Input
                                    type="radio"
                                    name="sharedwith"
                                    value="only_selected_users_and_roles"
                                    onChange={onChangeShareWith}
                                    checked={shareWith === "only_selected_users_and_roles"}
                                />{' '}
                                Only selected users & roles
                            </Label>
                        </FormGroup> */}
                        <FormGroup check>
                            <Label check>
                                <Input
                                    type="radio"
                                    name="sharedwith"
                                    value="everyone"
                                    onChange={onChangeShareWith}
                                    checked={shareWith === "everyone"}
                                />{' '}
                                Everyone
                            </Label>
                        </FormGroup>
                    </div>
                </section>
                <div className="btn-toolbar m-1">
                    <Button className="btn-space" onClick={() => onClickSave()} color="success">Save</Button>{'  '}
                    <Button className="btn-space" onClick={() => onClickSave("create")} color="success">Save as New</Button>{'  '}
                    <Button onClick={onClickCancel} color="danger">Cancel</Button>
                    <Button
                        onClick={onClickDelete}
                        className="ml-auto"
                        color="danger"
                    >
                        <i className="fa fa-trash"></i>{' '}
                        Delete
                    </Button>
                </div>
            </BoxBody>
        </Box>
    )
}

export default CustomView;
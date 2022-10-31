import React, { useState } from 'react';
import { Button, Row, Col, Input } from 'reactstrap';
import Select from 'react-select';
import { get } from 'lodash';

const CriteriaBuilder = (props) => {
    const { columnOptions, criteriaMap, setCriteriaMap } = props.options;
    const criteriaMapKeys = Object.keys(criteriaMap || {});

    function onChangeCondition(selectedCondition, mapKey) {
        const currentCriteriaMap = criteriaMap[mapKey];

        currentCriteriaMap["selectedCondition"] = selectedCondition;
        setCriteriaMap({
            ...criteriaMap,
            [mapKey]: currentCriteriaMap
        });
    }

    function onChangeColumn(selectedColumn, mapKey) {
        const currentCriteriaMap = criteriaMap[mapKey];

        if (selectedColumn) {
            currentCriteriaMap["selectedColumn"] = selectedColumn;
            currentCriteriaMap["operatorOptions"] = get(selectedColumn, 'operators');
            setCriteriaMap({
                ...criteriaMap,
                [mapKey]: currentCriteriaMap
            });
        }
    }

    function onChangeOperator(selectedOperator, mapKey) {
        const currentCriteriaMap = criteriaMap[mapKey];

        currentCriteriaMap["selectedOperator"] = selectedOperator;
        setCriteriaMap({
            ...criteriaMap,
            [mapKey]: currentCriteriaMap
        });
    }

    function onChangeValue(event, mapKey, name) {
        const currentCriteriaMap = criteriaMap[mapKey];

        currentCriteriaMap[name || "selectedValue"] = event.target.value;
        setCriteriaMap({
            ...criteriaMap,
            [mapKey]: currentCriteriaMap
        });
    }

    function buildValueSection(mapKey, selectedValue, selectedValue2) {
        const currentCriteriaMap = criteriaMap[mapKey];
        let operator = get(currentCriteriaMap, 'selectedOperator.value');
        let inputDom;

        if (['equal', 'not_equal', 'contains', 'not_contains', 'starts_with', 'ends_with'].includes(operator)) {
            inputDom = <Input
                type="text"
                name="selectedValue"
                value={selectedValue}
                onChange={(event) => onChangeValue(event, mapKey)} />
        }
        else if (['in', 'not_in'].includes(operator)) {
            inputDom = <Input
                type="text"
                name="selectedValue"
                value={selectedValue}
                onChange={(event) => onChangeValue(event, mapKey)} />
        }
        else if (['greater_than', 'lesser_than'].includes(operator)) {
            inputDom = <Input
                type="date"
                name="selectedValue"
                value={selectedValue}
                onChange={(event) => onChangeValue(event, mapKey)} />
        }
        else if (['between'].includes(operator)) {
            inputDom = <div className="d-flex">
                <Input
                    type="date"
                    name="selectedValue"
                    value={selectedValue}
                    style={{ marginRight: '2px' }}
                    onChange={(event) => onChangeValue(event, mapKey, 'selectedValue')}
                />
                <Input
                    type="date"
                    name="selectedValue2"
                    value={selectedValue2}
                    onChange={(event) => onChangeValue(event, mapKey, 'selectedValue2')}
                />
            </div>
        }
        else {
            inputDom = <Input
                type="text"
                name="selectedValue"
                value={selectedValue}
                onChange={(event) => onChangeValue(event, mapKey)} />
        }

        return inputDom;
    }

    function addCriteria() {
        const lastItem = criteriaMapKeys[criteriaMapKeys.length - 1];
        const nextItem = Number(lastItem) + 1;

        setCriteriaMap({
            ...criteriaMap,
            [nextItem]: {}
        })
    }

    function deleteCriteria(mapKey) {
        delete criteriaMap[mapKey];

        setCriteriaMap({
            ...criteriaMap
        });
    }

    return (
        <>
            {criteriaMapKeys && criteriaMapKeys.map((mapKey, idx) => {
                let { selectedCondition, selectedColumn, selectedOperator, selectedValue, selectedValue2, operatorOptions } = criteriaMap[mapKey];
                const selectedOperatorValue = get(selectedOperator, 'value');

                if (selectedOperatorValue === "between" && selectedValue && !selectedValue2) {
                    const valueArray = selectedValue.split('to');

                    selectedValue = valueArray[0];
                    selectedValue2 = valueArray[1];
                }

                return (
                    <Row key={idx}>
                        <Col md={2}>
                            <span className="py-2 float-left">{mapKey}</span>
                            <Select
                                value={idx === 0 ? 'when' : get(selectedCondition, 'value', 'and')}
                                disabled={idx === 0 ? true : false}
                                options={[{
                                    label: 'When',
                                    value: 'when'
                                }, {
                                    label: 'AND',
                                    value: 'and'
                                }, {
                                    label: 'OR',
                                    value: 'or'
                                }]}
                                className="float-right workflow-condition"
                                onChange={(event) => onChangeCondition(event, mapKey)}
                            />
                        </Col>
                        <Col md={2}>
                            <Select
                                value={get(selectedColumn, 'value')}
                                placeholder="Select a column"
                                onChange={(event) => onChangeColumn(event, mapKey)}
                                options={columnOptions}
                            />
                        </Col>
                        <Col md={2}>
                            <Select
                                value={get(selectedOperator, 'value')}
                                placeholder="Select a operator"
                                onChange={(event) => onChangeOperator(event, mapKey)}
                                options={operatorOptions}
                            />
                        </Col>
                        <Col md={4}>
                            {get(selectedOperator, 'value') && buildValueSection(mapKey, selectedValue, selectedValue2)}
                        </Col>
                        <Col md={1}>
                            {mapKey != 1 && <Button color="danger" size="sm" onClick={() => deleteCriteria(mapKey)}>
                                <i className="fa fa-trash"></i>
                            </Button>}
                        </Col>
                    </Row>
                )
            })
            }
            <Button onClick={addCriteria} color="link">
                <i className="fa fa-plus" />{` Add Criteria`}
            </Button>
        </>
    )
}

export default CriteriaBuilder;
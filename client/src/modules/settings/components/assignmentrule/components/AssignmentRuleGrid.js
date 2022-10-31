import React, { Component, Fragment, useState, useRef } from 'react';
import { Link, useHistory } from 'react-router-dom';
import { Button } from 'reactstrap';
import { useSelector } from 'react-redux';
import { get, startCase } from 'lodash';
import ToggleButton from 'react-toggle-button'
import { useParams } from 'react-router'

import { callApi } from 'store/middleware/api';
import ByjusDropdown from 'components/ByjusDropdown';
import ByjusGrid from 'modules/core/components/grid/ByjusGridV3';
import { Box, BoxHeader, BoxBody } from 'components/box';
import Confirm from 'components/confirm';
import { assignmentRule, validatePermission } from 'lib/permissionList';

const AssignmentRuleGrid = (props) => {
    const { contextCriterias } = props;
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const user = useSelector(state => get(state, 'auth.user'));
    const history = useHistory();
    let byjusGridRef = useRef();

    function onClickEdit(row) {
        const ruleFormattedName = row && row.formattedName;
        history.push(`assignment-rules/${ruleFormattedName}/edit`);
    }

    async function onClickDelete(data) {
        let result = await Confirm();
        if (result) {
            deleteRecord(data);
        }
    }

    function deleteRecord(record) {
        let groupFormattedName = record.formattedName;

        setLoading(true);
        callApi(`/usermanagement/assignmentrule/${groupFormattedName}`, 'DELETE', null, null, null, true)
            .then(response => {
                byjusGridRef && byjusGridRef.current.refreshGrid();
                setLoading(false);
                setError(null);
            })
            .catch(error => {
                setLoading(false);
                setError(error);
            })
    }

    function buildToolbarItems() {
        const canCreateAssignmentRule = validatePermission(user, [assignmentRule.createAssignmentRule])

        return (
            <Fragment>
                <Link className="btn btn-secondary btn-sm"
                    hidden={!canCreateAssignmentRule}
                    style={{ paddingTop: '3%' }}
                    to="assignment-rules/create">
                    <i className="fa fa-plus"></i> {' '}Create
                </Link> {" "}
            </Fragment>
        )
    }

    const onClickToggle = async (record, value) => {
        let ruleFormattedName = record.formattedName;
        let appName = record.appName;
        let method = 'PUT';

        await updateAssignmentRuleStatus(ruleFormattedName, appName, value, method);
    }

    const updateAssignmentRuleStatus = async (ruleFormattedName, appName, status, method) => {
        const body = {
            formattedName: ruleFormattedName,
            appName,
            status
        }

        let url = `/usermanagement/assignmentrule/${ruleFormattedName}`;
        callApi(url, method, body, null, null, true)
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

    const refreshGrid = () => {
        byjusGridRef.current.refreshGrid();
    }

    const formatters = () => ({
        actionFormatter: (cell, row) => {
            const canEditAssignmentRule = validatePermission(user, [assignmentRule.createAssignmentRule])
            const canDeleteAssignmentRule = validatePermission(user, [assignmentRule.deleteAssignmentRule])

            if (canEditAssignmentRule || canDeleteAssignmentRule) {
                return (
                    <ByjusDropdown
                        type="simple"
                        defaultTitle=""
                        titleIcon="fa fa-gear"
                        items={
                            [{
                                title: 'Edit',
                                icon: 'fa fa-pencil',
                                onClick: () => onClickEdit(row),
                                isAllowed: canEditAssignmentRule
                            }, {
                                title: 'Delete',
                                icon: 'fa fa-trash',
                                onClick: () => onClickDelete(row),
                                isAllowed: canDeleteAssignmentRule
                            }
                            ]} />
                )
            }
        },
        nameFormatter: (cell, row) => {
            let description = get(row, "description", "");

            return (
                <>
                    <Fragment>
                        <div>
                            <b>{startCase(cell)}</b> <br />
                            <div style={{ width: "100%" }}>
                                <div style={{ float: "left" }}>{description}</div>
                            </div>
                        </div>
                    </Fragment>
                </>
            );
        },
        statusFormatter: (cell, row) => {
            const canDeleteAssignmentRule = validatePermission(user, [assignmentRule.deleteAssignmentRule])
            let toggleValue = cell;

            return (
                <ToggleButton
                    inactiveLabel={''}
                    activeLabel={''}
                    colors={{
                        activeThumb: {
                            base: 'green',
                        },
                        active: {
                            base: 'green',
                            hover: 'rgb(177, 191, 215)',
                        },
                        inactiveThumb: {
                            base: 'blue',
                        },
                        inactive: {
                            base: 'blue',
                            hover: 'rgb(177, 191, 215)',
                        }
                    }}
                    hidden={!canDeleteAssignmentRule}
                    value={toggleValue}
                    onToggle={(value) => onClickToggle(row, value)} />
            )
        },
    })

    return (
        <Box>
            <BoxHeader heading="Assignment Rules" closeBtn={true} />
            <BoxBody loading={loading} error={error}>
                <ByjusGrid
                    isKey="_id"
                    gridId="ums_assignment_rule_grid"
                    ref={byjusGridRef}
                    toolbarItems={buildToolbarItems()}
                    formatters={formatters()}
                    modelName="AssignmentRule"
                    gridDataUrl={`/usermanagement/assignmentrule/list`}
                />
            </BoxBody>
        </Box>
    )
}

export default AssignmentRuleGrid;

import React, { useState, useRef } from 'react';
import { connect } from 'react-redux';
import { Link, useLocation } from 'react-router-dom';
import { Button, Badge } from 'reactstrap';

import { callApi } from 'store/middleware/api';
import { Box, BoxBody } from 'components/box';
import ByjusGrid from 'modules/core/components/grid/ByjusGridV3';
import ByjusDropdown from 'components/ByjusDropdown';
import ToggleButton from 'react-toggle-button'
import { validatePermission, security } from 'lib/permissionList';

import SecurityReportForm from './Form';


const SecurityReportList = (props) => {
    const { user, match } = props;
    const [showCreateForm, setShowCreateForm] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [actionType, setActionType] = useState("");
    const [securityReportData, setSecurityReportData] = useState("");
    const { pathname } = useLocation();
    let byjusGridRef = useRef();

    const condensed = match.path !== pathname;

    const onClickCreate = () => {
        setShowCreateForm(true);
        setActionType('CREATE');
    }

    const onClickClose = () => {
        setShowCreateForm(false);
    }

    const refreshGrid = () => {
        byjusGridRef && byjusGridRef.current && byjusGridRef.current.refreshGrid();
    }

    const buildToolbarItems = () => {
        const canCreateDr = validatePermission(user, [security.createReport]);

        if (condensed) {
            return <></>
        }

        return (<>{canCreateDr &&
            <Button color="success" onClick={onClickCreate}>
                <i className="fa fa-plus"></i> {' '}Create
            </Button>}
        </>)
    }
    
    const onClickToggle = async (record, value) => {
        let userStatus = (value) ? "inactive" : "active";
        await updateSecurityReport(record, userStatus);
    }

    const updateSecurityReport = async (record, status) => {
        const body = {
            ...record,
            status
        }

        let url = `/usermanagement/analyticsmanagement/securitymanagement/report`;
        let method = (status === "active") ? 'PUT' : 'DELETE';

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

    const onClickEdit = (data) => {
        setShowCreateForm(true);
        setActionType('UPDATE');
        setSecurityReportData(data);
    }

    const formatters = () =>{
        return {
            statusFormatter: (cell, row) => {
                const canDeleteSecurityReport = validatePermission(user, [security.deleteReport])
                let toggleValue = (cell === "active") ? true : false;
    
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
                                base: 'cyan',
                            },
                            inactive: {
                                base: 'cyan',
                                hover: 'rgb(177, 191, 215)',
                            }
                        }}
                        hidden={!canDeleteSecurityReport}
                        value={toggleValue}
                        onToggle={(value) => onClickToggle(row, value)} />
                )
            },
            actionFormatter: (cell, row) => {
                const canEditSecurityReport = row.status === "active" && validatePermission(user, [security.editReport])
                if (canEditSecurityReport) {
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
                                    isAllowed: canEditSecurityReport
                                }]} />
                    )
                }
            },
            reportUrlFormatter: (cell, row) => {
                return (
                    <div className="mb-1" key={cell}>
                        {
                            cell && <>
                                <a
                                    target="_blank"
                                    className="text-nowrap btn-link"
                                    href={`${cell}`}>
                                    Report <i className="fa fa-external-link" />
                                </a>
                            </>
                        }
                    </div>
                )
            }
        }
    }

    return (
        <Box>
            <BoxBody>
                <ByjusGrid
                    ref={byjusGridRef}
                    gridId={`security_report_grid`}
                    modelName="SecurityReport"
                    gridDataUrl={`/usermanagement/analyticsmanagement/securitymanagement/list`}
                    toolbarItems={buildToolbarItems()}
                    formatters={formatters()}
                    condensed={condensed}
                    sort={{ 'createdAt': 'DESC', 'status': 'ASC' }}
                >
                </ByjusGrid>
                {showCreateForm &&
                    < SecurityReportForm
                        onClose={onClickClose}
                        refreshGrid={refreshGrid}
                        actionType={actionType}
                        securityReportData={securityReportData}
                    />}
            </BoxBody>
        </Box>
    )
}

const mapStateToProps = state => ({
    user: state.auth.user
});

export default connect(mapStateToProps)(SecurityReportList);
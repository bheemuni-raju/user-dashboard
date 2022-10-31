import React, { useState, useRef, useEffect } from 'react';
import { Button, Badge } from 'reactstrap';
import { get, startCase, upperCase } from 'lodash';
import { useSelector } from 'react-redux';
import { Link, useLocation } from 'react-router-dom';
import moment from 'moment';

import { callApi } from "store/middleware/api";
import Confirm from 'components/confirm';
import ByjusGrid from 'modules/core/components/grid/ByjusGridV3';
import ByjusDropdown from 'components/ByjusDropdown';
import SplitViewContainer from 'modules/core/components/grid/SplitViewContainer';
import { smsTemplateStatusColourMap } from 'utils/componentUtil';

import { Box, BoxBody } from 'components/box';
import { communication, validatePermission } from 'lib/permissionList';

import SmsTemplateDetails from './SmsTemplateDetails';
import SmsTemplateModal from './SmsTemplateModal';
import AssociateSenderModal from './AssociateSenderModal';
import MarkApprovedModal from './MarkApprovedModal';
import MarkRejectedModal from './MarkRejectedModal';
import SendSmsModal from './SendSmsModal';

const SmsTemplateList = (props) => {
    const [showSmsTemplateModal, setShowSmsTemplateModal] = useState(false);
    const [showAssociateSenderModal, setShowAssociateSenderModal] = useState(false);
    const [showMarkApprovedModal, setShowMarkApprovedModal] = useState(false);
    const [showMarkRejectedModal, setShowMarkRejectedModal] = useState(false);
    const [showSendSmsModal, setShowSendSmsModal] = useState(false);
    const [maximized, setMaximized] = useState(false);

    const [actionType, setActionType] = useState("");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [smsTemplateData, setSmsTemplateData] = useState("");
    const user = useSelector(state => get(state, 'auth.user'));
    const { pathname } = useLocation();
    const byjusGridRef = useRef();
    const smsTemplateDetailsRef = useRef();

    const { match } = props;
    const condensed = match.path !== pathname;
    const selectedTemplateId = pathname.split("/")[3];

    useEffect(() => {
        !condensed && setMaximized(false);
    }, [condensed])

    const condensedColumns = [{
        dataField: 'templateId',
        text: 'Template Id',
        type: 'String',
        columnClassName: (col) => col === selectedTemplateId ? "bg-highlight" : "",
        quickFilter: true,
        formatter: (cell, row) => {
            return (
                <Link to={{ pathname: `${cell}` }}>
                    {`${cell} - ${upperCase(row.application)}`}
                    <span className="text-truncate text-dark float-right">
                        <Badge color={smsTemplateStatusColourMap[row.status]}>{upperCase(row.status)}</Badge>
                    </span>
                    <div className="d-flex justify-content-between">
                        <div className="text-secondary">
                            <small>{moment(row.createdAt).format("lll")}</small>
                        </div>
                    </div>
                </Link>
            )
        }
    }];

    const onClickCreate = () => {
        setShowSmsTemplateModal(true);
        setActionType('CREATE');
        setSmsTemplateData({});
    }

    const onClickEdit = (data) => {
        setShowSmsTemplateModal(true);
        setActionType('UPDATE');
        setSmsTemplateData(data);
    }

    const onClickSendDLTApproval = (data) => {
        let templateId = data.templateId;
        setLoading(true);
        setError(null);

        callApi(`/usermanagement/smstemplate/dltApproval/${templateId}`, 'PUT', null, null, null, true)
            .then(response => {
                byjusGridRef && byjusGridRef.current.refreshGrid();
                smsTemplateDetailsRef && smsTemplateDetailsRef.current && smsTemplateDetailsRef.current.refreshSmsTemplate();
                setLoading(false);
                setError(null);
            })
            .catch(error => {
                setLoading(false);
                setError(error);
            })
    }

    const onClickMarkApproved = (data) => {
        setShowMarkApprovedModal(true);
        setSmsTemplateData(data);
    }

    const onClickMarkRejected = (data) => {
        setShowMarkRejectedModal(true);
        setSmsTemplateData(data);
    }

    const onClickSendSms = (data) => {
        setShowSendSmsModal(true);
        setSmsTemplateData(data);
    }

    const onClickAssociateSender = (data) => {
        setShowAssociateSenderModal(true);
        setSmsTemplateData(data);
    }

    const onClickDelete = async (data) => {
        let result = await Confirm();
        if (result) {
            deleteRecord(data);
            setSmsTemplateData({});
        }
    }

    const onClickActivate = async (data) => {
        let result = await Confirm();
        if (result) {
            activateRecord(data);
            setSmsTemplateData(data);
        }
    }

    const deleteRecord = (record) => {
        let smsTemplateId = record.templateId;

        setLoading(true);
        setError(null);
        callApi(`/usermanagement/smstemplate/${smsTemplateId}`, 'DELETE', null, null, null, true)
            .then(response => {
                byjusGridRef && byjusGridRef.current.refreshGrid();
                smsTemplateDetailsRef && smsTemplateDetailsRef.current && smsTemplateDetailsRef.current.refreshSmsTemplate();
                setLoading(false);
                setError(null);
            })
            .catch(error => {
                setLoading(false);
                setError(error);
            })
    }

    const activateRecord = (record) => {
        let smsTemplateId = record.templateId;

        setLoading(true);
        setError(null);
        callApi(`/usermanagement/smstemplate/${smsTemplateId}`, 'PUT', { ...record }, null, null, true)
            .then(response => {
                byjusGridRef && byjusGridRef.current.refreshGrid();
                smsTemplateDetailsRef && smsTemplateDetailsRef.current && smsTemplateDetailsRef.current.refreshSmsTemplate();
                setLoading(false);
                setError(null);
            })
            .catch(error => {
                setLoading(false);
                setError(error);
            })
    }


    const onCloseModal = (type) => {
        setShowSmsTemplateModal(false);
        setShowAssociateSenderModal(false);
        setShowMarkApprovedModal(false);
        setShowMarkRejectedModal(false);
        setShowSendSmsModal(false);

        byjusGridRef.current.refreshGrid();
    }

    function buildToolbarItems() {
        const canCreateSmsTemplate = validatePermission(user, [communication.createSmsTemplates])
        return (
            <>{canCreateSmsTemplate &&
                <Button color="secondary" size="sm" onClick={onClickCreate}>
                    <i className="fa fa-plus"></i> {' '}Create
                </Button>}
            </>
        )
    }

    const formatters = {
        templateIdFormatter: (cell, row) => {
            return <Link to={{ pathname: `sms-templates/${row.templateId}` }}>{cell}</Link>
        },
        actionFormatter: (cell, row) => {
            const canEditSmsTemplate = validatePermission(user, [communication.editSmsTemplates])
            const canDeleteSmsTemplate = validatePermission(user, [communication.deleteSmsTemplates])

            if (canEditSmsTemplate || canDeleteSmsTemplate) {
                let items = fetchActionItemsBasedOnStatus(row);
                return (
                    <ByjusDropdown
                        type="simple"
                        defaultTitle=""
                        titleIcon="fa fa-gear"
                        items={items}
                    />
                )
            }
        },
        dateFormatter: (cell) => {
            return cell && moment(cell).format("YYYY-MM-DD HH:mm:ss");
        },
        languageFormatter: (cell) => {
            return startCase(cell);
        },
        smsProviderFormatter: (cell) => {
            let providerArray = cell;
            let formattedProviderArray = providerArray.map(value => {
                return startCase(value);
            });

            formattedProviderArray = formattedProviderArray.filter(x => x != null);
            return formattedProviderArray;
        },
        statusFormatter: (cell) => {
            return <Badge color={smsTemplateStatusColourMap[cell]}>{upperCase(cell)}</Badge>
        },
        contentFormatter: (cell) => <span className="text-wrap">{cell}</span>

    };

    const refreshGrid = () => {
        byjusGridRef && byjusGridRef.current && byjusGridRef.current.refreshGrid();
    }

    const fetchActionItemsBasedOnStatus = (row) => {
        let items = [];
        const canEditSmsTemplate = validatePermission(user, [communication.editSmsTemplates])
        const canDeleteSmsTemplate = validatePermission(user, [communication.deleteSmsTemplates])

        if (row.status === "created") {
            items = [{
                title: 'Edit',
                icon: 'fa fa-pencil',
                onClick: () => onClickEdit(row),
                isAllowed: canEditSmsTemplate
            }, {
                title: 'Associate Sender',
                icon: 'fa fa-link',
                onClick: () => onClickAssociateSender(row),
                isAllowed: canEditSmsTemplate
            }, {
                title: 'Delete',
                icon: 'fa fa-trash',
                onClick: () => onClickDelete(row),
                isAllowed: canDeleteSmsTemplate
            }]
        }
        else if (row.status === "pending") {
            items = [{
                title: 'Edit',
                icon: 'fa fa-pencil',
                onClick: () => onClickEdit(row),
                isAllowed: canEditSmsTemplate
            }, {
                title: 'Associate Sender',
                icon: 'fa fa-link',
                onClick: () => onClickAssociateSender(row),
                isAllowed: canEditSmsTemplate
            }, {
                title: 'Send For DLT Approval',
                icon: 'fa fa-send',
                onClick: () => onClickSendDLTApproval(row),
                isAllowed: canEditSmsTemplate
            }, {
                title: 'Delete',
                icon: 'fa fa-trash',
                onClick: () => onClickDelete(row),
                isAllowed: canDeleteSmsTemplate
            }]
        }
        else if (row.status === "sent_for_approval") {
            items = [{
                title: 'Mark Approved',
                icon: 'fa fa-check',
                onClick: () => onClickMarkApproved(row),
                isAllowed: canEditSmsTemplate
            }, {
                title: 'Mark Rejected',
                icon: 'fa fa-close',
                onClick: () => onClickMarkRejected(row),
                isAllowed: canEditSmsTemplate
            }, {
                title: 'Delete',
                icon: 'fa fa-trash',
                onClick: () => onClickDelete(row),
                isAllowed: canDeleteSmsTemplate
            }]
        }
        else if (row.status === "approved") {
            items = [{
                title: 'Send SMS',
                icon: 'fa fa-mobile',
                onClick: () => onClickSendSms(row),
                isAllowed: canEditSmsTemplate
            }, {
                title: 'Delete',
                icon: 'fa fa-trash',
                onClick: () => onClickDelete(row),
                isAllowed: canDeleteSmsTemplate
            }]
        }
        else if (row.status === "rejected") {
            items = [{
                title: 'Edit',
                icon: 'fa fa-pencil',
                onClick: () => onClickEdit(row),
                isAllowed: canEditSmsTemplate
            }, {
                title: 'Delete',
                icon: 'fa fa-trash',
                onClick: () => onClickDelete(row),
                isAllowed: canDeleteSmsTemplate
            }]
        }
        else if (row.status === "deactivated") {
            items = [{
                title: 'Activate',
                icon: 'fa fa-bomb',
                onClick: () => onClickActivate(row),
                isAllowed: canDeleteSmsTemplate
            }]
        }

        return items;
    }

    return (
        <Box>
            <BoxBody loading={loading} error={error}>
                <SplitViewContainer
                    ref={byjusGridRef}
                    gridId={`ums_sms_templates_grid`}
                    modelName="UmsSmsTemplate"
                    gridDataUrl={`/usermanagement/smstemplate/list`}
                    toolbarItems={!condensed && buildToolbarItems()}
                    formatters={formatters}
                    sort={{ 'createdAt': 'desc' }}
                    addOnQfColumns={[
                        { text: 'Name', dataField: 'name' },
                        { text: 'Template Id', dataField: 'templateId' },
                        { text: 'Organization', dataField: 'orgFormattedName' },
                        { text: 'Status', dataField: 'status' }
                    ]}
                    compactView={condensed}
                    condensed={condensed}
                    bodyContainerClass={condensed ? "order-split-table custom-scrollbar" : ""}
                    condensedColumns={condensedColumns}
                    maximized={maximized}
                >

                    <SmsTemplateDetails
                        ref={smsTemplateDetailsRef}
                        refreshGrid={refreshGrid}
                        resize={() => setMaximized(maximized => !maximized)}
                        maximized={maximized}
                        fetchActionItemsBasedOnStatus={fetchActionItemsBasedOnStatus}
                    />
                </SplitViewContainer>
                {showSmsTemplateModal &&
                    <SmsTemplateModal
                        actionType={actionType}
                        closeModal={onCloseModal}
                        refreshGrid={() => {
                            byjusGridRef && byjusGridRef.current.refreshGrid();
                            smsTemplateDetailsRef && smsTemplateDetailsRef.current && smsTemplateDetailsRef.current.refreshSmsTemplate();
                        }}
                        smsTemplateData={smsTemplateData}
                    />
                }
                {showAssociateSenderModal &&
                    <AssociateSenderModal
                        closeModal={onCloseModal}
                        refreshGrid={() => {
                            byjusGridRef && byjusGridRef.current.refreshGrid();
                            smsTemplateDetailsRef && smsTemplateDetailsRef.current && smsTemplateDetailsRef.current.refreshSmsTemplate();
                        }}
                        smsTemplateData={smsTemplateData}
                    />
                }
                {showMarkApprovedModal &&
                    <MarkApprovedModal
                        closeModal={onCloseModal}
                        refreshGrid={() => {
                            byjusGridRef && byjusGridRef.current.refreshGrid();
                            smsTemplateDetailsRef && smsTemplateDetailsRef.current && smsTemplateDetailsRef.current.refreshSmsTemplate();
                        }}
                        smsTemplateData={smsTemplateData}
                    />
                }
                {showMarkRejectedModal &&
                    <MarkRejectedModal
                        closeModal={onCloseModal}
                        refreshGrid={() => {
                            byjusGridRef && byjusGridRef.current.refreshGrid();
                            smsTemplateDetailsRef && smsTemplateDetailsRef.current && smsTemplateDetailsRef.current.refreshSmsTemplate();
                        }}
                        smsTemplateData={smsTemplateData}
                    />
                }
                {showSendSmsModal &&
                    <SendSmsModal
                        closeModal={onCloseModal}
                        refreshGrid={() => {
                            byjusGridRef && byjusGridRef.current.refreshGrid();
                            smsTemplateDetailsRef && smsTemplateDetailsRef.current && smsTemplateDetailsRef.current.refreshSmsTemplate();
                        }}
                        smsTemplateData={smsTemplateData}
                    />
                }
            </BoxBody>
        </Box>
    )
}

export default SmsTemplateList

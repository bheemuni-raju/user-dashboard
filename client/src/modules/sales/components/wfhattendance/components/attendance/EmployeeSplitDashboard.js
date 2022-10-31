import React, { useState, useEffect, useRef } from 'react'
import { connect } from 'react-redux';
import { useHistory, useParams } from 'react-router'
import { Link } from 'react-router-dom';
import { Badge, Button, ButtonGroup, Col, Container, Row } from 'reactstrap';
import { get, startCase, isEmpty, upperCase } from 'lodash';
import Notify from 'react-s-alert';
import moment from 'moment';

import { BoxBody } from 'components/box';
import Confirm from 'components/confirm';
import { callApi } from 'store/middleware/api';
import TabBuilder from 'modules/core/components/TabBuilder';
import ByjusDropdown from 'components/ByjusDropdown';
import ByjusGridV2 from 'modules/core/components/grid/ByjusGridV2';
import MarkAttendanceModal from './MarkAttendanceModal';

const EmployeeSplitDashboard = (props) => {
    const { email, maximized = "", resize = "" } = useParams();
    const [data, setData] = useState({});
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState();
    const { goBack, push } = useHistory();
    const history = useHistory();
    const gridRef = useRef();
    const [ showMarkAttendanceModal, setShowMarkAttendanceModal ] = useState(false);

    useEffect(() => {
        getDetails();
    }, [email])

    const getDetails = () => {
        setLoading(true);
        callApi(`/usermanagement/wfhattendance/employeelist?email=${email}`, 'POST', {}, null, null, true)
            .then(data => {
                setLoading(false);
                setData(data)
            })
    }

    const refreshGrid = () => {
        gridRef.current && gridRef.current.refreshGrid();
    }

    const getColumns = () => {
        return [{
            dataField: 'date',
            width: '100',
            text: 'Date'
        },
        {
            dataField: 'finalAttendance',
            width: '100',
            text: 'Status'
        }]
    }

    const { tnlId = "", role = "", status = "", doj = "", vertical = "", department = "", unit = "", subDepartment = "" } = get(data, "docs[0]", "");

    const closeAttendanceModal = () => {
        setShowMarkAttendanceModal(false)
    }

    const renderDetails = () => (
        <Container className="p-0" fluid>
            <Row>
                <Col md="12">
                    <div className="mb-2 font-weight-bold">
                        <span className="text-muted">Employee Details&nbsp;</span>
                        <Badge className="bg-light text-primary">{}</Badge>

                    </div>
                    <Row>
                        <Col md={6}>
                            <div className="mb-2">
                                <span className="text-muted">TnlId:&nbsp;</span>{tnlId ? upperCase(tnlId) : 'N/A'}
                            </div>
                        </Col>
                        <Col md={6}>
                            <div className="mb-2">
                                <span className="text-muted">Role: </span>{role ? startCase(role) : 'N/A'}
                            </div>
                        </Col>
                        <Col md={6}>
                            <div className="mb-2">
                                <span className="text-muted">Status: </span>{status ? startCase(status) : 'N/A'}
                            </div>
                        </Col>
                        <Col md={6}>
                            <div className="mb-2">
                                <span className="text-muted">Vertical: </span>{vertical ? startCase(vertical) : 'N/A'}
                            </div>
                        </Col>
                        <Col md={6}>
                            <div className="mb-2">
                                <span className="text-muted">DOJ: </span>{doj ? moment(doj).format("DD-MM-YYYY") : "N/A"}
                            </div>
                        </Col>
                        <Col md={6}>
                            <div className="mb-2">
                                <span className="text-muted">Unit: </span>{unit ? startCase(unit) : 'N/A'}
                            </div>
                        </Col>
                        <Col md={6}>
                            <div className="mb-2">
                                <span className="text-muted">department: </span> {department ? startCase(department) : 'N/A'}
                            </div>
                        </Col>
                        <Col md={6}>
                            <div className="mb-2">
                                <span className="text-muted">Sub Department: </span>{subDepartment ? startCase(subDepartment) : 'N/A'}
                            </div>
                        </Col>
                    </Row>
                </Col>
            </Row>
        </Container>
    )

    const renderAttendanceDetails = () => (
        <Container className="p-0" fluid>
            <Row>
                <Col md="6">
                    <ByjusGridV2
                        ref={gridRef}
                        modelName="attendance"
                        columns={getColumns}
                        gridDataUrl={`/usermanagement/wfhattendance/employeeAttendanceData?email=${email}`}
                        sort={{ date: '-1' }}
                        compactView={true}
                        sizePerPage={5}
                    />  
                </Col>
            </Row>
        </Container>
    )

    return (
        <>
            <div className="pane-right card mb-0">
                <BoxBody loading={loading} error={error}>
                    <div className="order-details-header clearfix">
                        <i className="fa fa-arrow-left btn-link fa-lg mr-1" aria-hidden="true" onClick={goBack} />
                        <span>{`${email || ""}`} </span>{" "}
                        <div className="d-inline-block float-right">
                            <ByjusDropdown defaultTitle="Action" type="simple"
                                items={[{
                                    title: 'Mark Attendance',
                                    onClick: () => {setShowMarkAttendanceModal(true)},
                                }]}
                            />{" "}
                            <ButtonGroup>
                                <Button color="danger" className="ml-1" onClick={() => history.replace({pathname: '/',})}><i className="fa fa-times"></i></Button>
                            </ButtonGroup>
                        </div>
                    </div>
                    <div className="order-details-body custom-scrollbar">
                        <TabBuilder tabs={[
                            {
                                title: 'Details',
                                component: renderDetails()
                            }, {
                                title: 'Attendance',
                                component: renderAttendanceDetails()
                            }
                        ]} />
                    </div>
                </BoxBody>
            </div>
            { showMarkAttendanceModal && <MarkAttendanceModal
                attendanceData={data.docs[0]}
                closeModal={() => setShowMarkAttendanceModal(false)}
                selectedEmail={email}
                refreshGrid={refreshGrid}
            />
            }
        </>
    )
}

const mapStateToProps = state => ({
    user: state.auth.user
});

export default connect(mapStateToProps)(EmployeeSplitDashboard);

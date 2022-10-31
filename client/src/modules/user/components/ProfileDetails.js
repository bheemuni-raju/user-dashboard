import React from 'react';
import { connect } from 'react-redux';
import { Row, Col } from 'reactstrap';
import { startCase } from 'lodash';

import { alphabetColorCoding } from 'utils/componentUtil';
import { Box, BoxBody } from 'components/box';

const ProfileDetails = (props) => {
    const { user } = props;
    let { name, email, appName, skill, appRoleName, orgId, orgFormattedName, picture } = user || {};
    const firstLetter = name && name.charAt(0);
    const altFirstLetter = firstLetter && firstLetter.toUpperCase();
    const alphabetStyling = alphabetColorCoding(firstLetter);
    const formattedAppName = appName && appName.toUpperCase();

    return (
        <>
            <Box>
                <BoxBody>
                    <Row>
                        <Col md={1}>
                            <div >
                                {picture ?
                                    <img style={{ borderRadius: '50%' }} src={picture} alt={altFirstLetter}></img> :
                                    <div style={{ borderRadius: '50%', width: '100px', height: '100px', textAlign: 'center', ...alphabetStyling }}>
                                        <p style={{ position: 'relative', top: '25%', fontSize: 'xx-large' }}>{altFirstLetter}</p>
                                    </div>
                                }
                            </div>
                        </Col>
                        <Col >
                            <div style={{ marginLeft: '30px' }}>
                                <p style={{ fontSize: 'x-large' }}>{startCase(name)}</p>
                                <p> {formattedAppName}</p>
                                <p><i className="fa fa-envelope-o" aria-hidden="true"></i> {" "} {email}</p>
                                <p> {skill}</p>
                                <p> {startCase(appRoleName)}</p>
                                <p> {orgId}</p>
                                <p> {startCase(orgFormattedName)}</p>
                            </div>
                        </Col>
                    </Row>
                </BoxBody>
            </Box>
        </>
    )
}

const mapStateToProps = state => ({
    user: state.auth.user
});

export default connect(mapStateToProps)(ProfileDetails);
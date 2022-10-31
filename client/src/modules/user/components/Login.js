import React, { Component } from 'react';
import { Link } from 'react-router-dom';
import { Button, Card, CardBody, CardGroup, Col, Container, Form, Input, InputGroup, InputGroupAddon, InputGroupText, Row } from 'reactstrap';

class Login extends Component {
  render() {
    return (
      <div className="app flex-row align-items-center">
        <Container>
          <Row className="justify-content-center">
            <Col md="8">
              <CardGroup>
                <Card className="p-4">
                  <CardBody className="text-center">
                    <Form>
                      <h2>Login to OMS</h2>
                      <p className="text-muted">Sign In to your account</p>
                      <Row>
                        <Col xs="12">
                          <a className="btn btn-danger px-4" href="/api/auth/google">
                           <i className="fa fa-google"></i> Sign In with Google
                          </a>
                        </Col>
                      </Row>
                    </Form>
                  </CardBody>
                </Card>
                <Card className="text-white bg-primary py-5 d-md-down-none" style={{ width: '44%' }}>
                  <CardBody className="text-center">
                    <div>
                      <h2>Features</h2>
                      <p>Application used for managing Sales Orders, Loan Applications, NACH Transactions, Debit Transactions and for scheduling Jobs, Reports for the applications</p>
                    </div>
                  </CardBody>
                </Card>
              </CardGroup>
            </Col>
          </Row>
        </Container>
      </div>
    );
  }
}

export default Login;

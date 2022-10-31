import React, { Component, Fragment } from 'react'
import PropTypes from 'prop-types'
import { Field, reduxForm } from 'redux-form'
import { compose, setPropTypes } from 'recompose'
import {
  Col, Row, Button,
  FormGroup, Input, Label,
  FormText,
  Alert } from 'reactstrap'
//import withConfirmNavigation from '../../../components/withConfirmNavigation'
import { RFFieldGroup, FieldGroup } from '../../../../components/form'
import { Link } from 'react-router-dom'

const enhance = compose(
    reduxForm({
        form: 'uploadWizard',
        destroyOnUnmount: false
    })
)

class UploadWizard extends Component{
    render(){
      const { onChangeFile, onClickUpload, onClickNext, uploadSummary, file } = this.props

      console.log(file)

      return (
        <Fragment>
          <Row>
            <Col lg={12}>
              <p>Download a <a href="https://s3-ap-southeast-1.amazonaws.com/byjus-oms/Invntry.csv">sample file</a> 
                and compare it to your import file to ensure you have the file perfect for the import.</p>
            </Col>
          </Row>
          {file && <Row>
            <Col lg={10}>
              <Alert color="success" >
              You have selected the file : <strong>{file.name}</strong>
              </Alert>
            </Col>
          </Row>}
          <Row>
          <Col lg={3}>
            <FormGroup>
              <Label>Upload File *</Label>
              <Input onChange={onChangeFile} type="file" files={file} accept=".csv"></Input>
              <FormText>File Format: CSV</FormText>
            </FormGroup>
          </Col>
        </Row>
        <Row>
          <Col lg={3}>
            <FormGroup>
              <Label>File Delimiter *</Label>
              <Input componentClass="select" placeholder="select">
                <option value="comma">Comma(,)</option>
                <option value="semicolon">SemiColon(;)</option>
              </Input>
            </FormGroup>
          </Col>
        </Row>
        <div className="text-left">
          <Button name = "upload" onClick={onClickUpload} disabled = {file?false:true} color="success">Upload</Button>
        </div>
        <div className="text-right">
          <Button onClick={onClickNext} disabled = {uploadSummary?false:true} color="primary">Next</Button>{' '}
        </div>
      </Fragment>
      )
    }
  }

  export default enhance(UploadWizard)

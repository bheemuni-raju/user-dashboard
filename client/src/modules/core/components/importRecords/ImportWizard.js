import React, { Component, Fragment } from 'react'
import { reduxForm } from 'redux-form'
import { compose } from 'recompose'
import { Col, Row, Button, Card } from 'reactstrap'

import ByjusGrid from '../../../core/components/grid/ByjusGrid'

import _, { chunk } from 'lodash'

const enhance = compose(
  reduxForm({
    form: 'uploadWizard',
    destroyOnUnmount: false
  })
)

class ImportWizard extends Component {
  render() {
    const { onClickImport, onClickPrevious, uploadSummary, isImported } = this.props

    if (uploadSummary) {
      const { newRecords, existingRecords, invalidRecords: invalidRecs } = uploadSummary
      const displayRecs = _.chunk(invalidRecs, 10)[0]
      const columns = [{
        dataField: 'index',
        text: 'Row No.'
      }, {
        dataField: 'identifier',
        text: 'Identifier'
      }, {
        dataField: 'err',
        text: 'Error'
      }]

      return (
        <Fragment>
          <Row>
            <Col lg={10}>
              <div>
                <Card color="success" header={`No. of New Records : ${newRecords.length}`} eventKey='1' />
                <Card color="warning" header={`No. of  Existing Records : ${existingRecords.length}`} eventKey='2' />
                <Card color="danger" header={`No. of  Invalid Records : ${uploadSummary.invalidRecords.length}`} eventKey={3}>
                  <Row>
                    {displayRecs && displayRecs.length > 0 &&
                      <Col lg={10}>
                        <ByjusGrid
                          simpleGrid={true}
                          data={displayRecs}
                          columns={columns}
                        />
                      </Col>
                    }
                  </Row>
                </Card>
              </div>
            </Col>
          </Row>
          <div className="text-right">
            <Button name="previous" onClick={onClickPrevious} color="success">Previous</Button>
            {' '}
            <Button name="import" onClick={onClickImport} disabled={(invalidRecs.length > 0 || isImported) ? true : false}
              color="primary">Import</Button>
            {' '}
          </div>
        </Fragment>
      )
    }
    else {
      return ('')
    }
  }
}

export default enhance(ImportWizard)

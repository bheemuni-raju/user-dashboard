import React from 'react';
import { Button, Row, Col } from 'reactstrap';
import Notify from 'react-s-alert';
import { FormBuilder } from 'components/form';
import { Box, BoxBody } from 'components/box';
import { callApi } from 'store/middleware/api';
import { cycleNameFormatter } from 'utils/componentUtil';

class DownloadReport extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      loading: false,
      error: null,
      showModal: true,
      formValues: {
        step: "step1",
        cycleStart: "",
        cycleEnd: ""
      },
      cycleList: []
    };
  }

  getFields = (cycleList) => {
    return [{
      name: 'reportName',
      type: 'text',
      label: 'Report Name',
      required: true
    }, {
      name: 'startDate',
      type: 'date',
      label: 'Start Date'
    }, {
      name: 'endDate',
      type: 'date',
      label: 'End Date'
    }]
  }

  onScheduleReport = async () => {
    const editRevenueForm = this.refs.downloadReportRef;
    let formValues = editRevenueForm.validateFormAndGetValues();

    if (formValues) {
      callApi(`/achievemanagement/incentive/generateIncentiveReports`, 'POST', formValues, null, null, true)
        .then(response => {
          Notify.success('Report scheduled successfully. You will get the mail once the report generated.');
          this.props.refreshGrid();
          this.props.onClose();
        })
    }
  }

  render() {
    const { loading, formValues, cycleList } = this.state;
    const fields = this.getFields(cycleList);

    return (
      <Box>
        <BoxBody loading={loading} >
          <Row>
            <Col md={12}>
              <FormBuilder
                ref="downloadReportRef"
                fields={fields}
                cols={3}
                initialValues={formValues}
              />
              <div className="text-right">
                <Button color="success" onClick={this.onScheduleReport}>
                  Schedule Report
                </Button>{' '}
              </div>
            </Col>
          </Row>
        </BoxBody>
      </Box>
    );
  }
}

export default DownloadReport;

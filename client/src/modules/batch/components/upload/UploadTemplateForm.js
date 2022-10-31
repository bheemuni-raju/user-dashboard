import React, { Component } from 'react';
import { connect } from 'react-redux';
import { Button } from 'reactstrap';
import { get } from 'lodash';
import Notify from 'react-s-alert';

import { Page, PageBody, PageHeader } from 'components/page';
import { Box, BoxBody } from 'components/box';
import FormBuilder from 'components/form/FormBuilder';
import { callApi } from 'store/middleware/api';
import { apps, modules } from 'lib/appsAndModules';

const mapStateToProps = (state) => ({
  user: get(state, 'auth.user')
})

class UploadTemplateForm extends Component {
  constructor(props) {
    super(props);
    this.state = {
      loading: false,
      error: null,
      reportTemplate: null,
      comboLoading: false
    }
  }

  onClickSave = () => {
    const { templateId } = this.props.match.params;
    const templateForm = this.refs.templateForm;
    const formValues = templateForm.validateFormAndGetValues();

    if (formValues) {
      const payload = {
        ...formValues
      };

      if (templateId) {
        this.updateTemplate(payload, templateId);
      }
      else {
        this.createTemplate(payload);
      }
    }
    else {
      Notify.error(`Atleast one column is required to create a template.`);
    }
  }

  createTemplate = (payload) => {
    const { user } = this.props;

    payload["createdBy"] = get(user, 'email');
    this.setState({ loading: true })
    return callApi(`/batchmanagement/upload`, "POST", payload, null, null, true)
      .then(res => {
        this.setState({ loading: false, reportTemplate: res });
        this.props.history.goBack();
      })
      .catch(error => {
        this.setState({ loading: false });
        this.setState({error:error.message})
      });
  }

  updateTemplate = (payload, templateId) => {
    const { user } = this.props;

    payload["updatedBy"] = get(user, 'email');

    this.setState({ loading: true })
    return callApi(`/batchmanagement/upload/${templateId}`, "PUT", payload, null, null, true)
      .then(res => {
        this.setState({ loading: false, reportTemplate: res });
        this.props.history.goBack();
      })
      .catch(error => {
        this.setState({ loading: false });
      });
  }

  buildTemplateDetailsForm = () => {
    const { template } = this.state;

    const fields = [{
      type: "text",
      name: "name",
      required: true,
      label: "Template Name"
    }, {
      type: "select",
      name: "appCategory",
      required: true,
      label: "App Category",
      options: apps
    }, {
      type: "select",
      name: "moduleCategory",
      required: true,
      label: "Module Category",
      options: modules
    }, {
      type: "textarea",
      name: "csvHeaders",
      required: true,
      label: "CSV Headers(commas seperated)"
    }];

    return (<>
      <FormBuilder
        ref="templateForm"
        initialValues={template}
        fields={fields}
        cols={1}
      />
    </>)
  }

  componentDidMount = () => {
    const { templateId } = this.props.match.params;

    if (templateId) {
      this.setState({ loading: true })
      return callApi(`/batchmanagement/upload/${templateId}`, "GET", null, null, null, true)
        .then(res => {
          this.setState({ loading: false, template: res });
        })
        .catch(error => {
          this.setState({ loading: false });
        })
    }
  }

  render() {
    const { template, loading, error } = this.state;
    const type = template ? "Edit" : "New";
    return (
      <Page>
        <PageHeader heading={`${type} Upload Template`} />
        <PageBody >
          <Box>
            <BoxBody loading={loading} error={error}>
              {this.buildTemplateDetailsForm()}
              <div className="text-right">
                <Button type="button" color="success" onClick={() => this.onClickSave()}>Save</Button>
                {'   '}
                <Button type="button" color="danger" onClick={() => this.props.history.goBack()}>Cancel</Button>
              </div>
            </BoxBody>
          </Box>
        </PageBody>
      </Page>
    )
  }
}


export default connect(mapStateToProps)(UploadTemplateForm);

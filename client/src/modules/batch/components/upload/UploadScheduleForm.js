import React from 'react';
import { connect } from 'react-redux';
import { Button } from 'reactstrap';
import axios from 'axios';
import Notify from "react-s-alert";

import FormBuilder from 'components/form/FormBuilder';
import { Page, PageBody, PageHeader } from 'components/page';
import { callApi } from 'store/middleware/api';

class UploadScheduleForm extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            loading: false,
            error: null,
            template: {}
        };
    }

    componentDidMount = () => {
        const { templateId } = this.props.match.params;

        this.setState({ loading: true, error: null });
        return callApi(`/batchmanagement/upload/${templateId}`, "GET", null, null, null, true)
            .then(res => {
                this.setState({ loading: false, template: res });
            })
            .catch(error => {
                this.setState({ loading: false, error });
            })
    }

    onClickUpload = async () => {
        const templateForm = this.refs.templateForm;
        const formValues = templateForm.validateFormAndGetValues();
        const { uploadFile, formattedName, jobName } = formValues;

        const formData = new FormData();
        formData.append('uploadedFileType', formattedName);
        formData.append('uploadedFile', uploadFile);
        formData.append('jobName', jobName);
        this.setState({ loading: true });

        try {
            await axios({
                method: 'post',
                url: `${window.NAPI_URL}/batchmanagement/upload/uploaddata`,
                data: formData
            });
            this.props.history.goBack();
            this.setState({ loading: false, error: null });
            Notify.success("Uploaded successfully!");
        }
        catch (error) {
            this.setState({ loading: false, error: error });
            Notify.error("Uploaded failed!");
        }
    }

    renderTemplate = (template) => {
        const formFields = [{
            type: "text",
            name: "name",
            disabled: true,
            required: true,
            label: "Template Name",
            md: 6
        }, {
            type: "readonly",
            name: "formattedName",
            required: true,
            label: "Formatted Name",
            md: 6
        }, {
            type: "textarea",
            name: "csvHeaders",
            required: true,
            disabled: true,
            label: "CSV Headers(commas seperated)",
            md: 6
        }, {
            type: "text",
            name: "jobName",
            required: true,
            label: "Job Name",
            md: 6
        }, {
            type: "button",
            icon: 'fa fa-download',
            name: "sampleFileBtn",
            text: "Download sample file",
            onClick: this.onClickDownloadSampleFile,
            md: 6
        }, {
            type: 'file',
            name: 'uploadFile',
            required: true,
            label: 'Upload File',
            md: 6
        }]

        return (
            <FormBuilder
                ref="templateForm"
                initialValues={template}
                fields={formFields}
                cols={1}
            />
        )
    }

    onClickDownloadSampleFile = () => {
        const { template = {} } = this.state;
        let { csvHeaders = [], formattedName } = template;

        csvHeaders = csvHeaders[0].split(',');
        csvHeaders = csvHeaders.map(header => header.replace(/[\n,",']/ig, ''));
        csvHeaders = `${csvHeaders}\n`;

        let uri = URL.createObjectURL(new Blob([csvHeaders], { type: "data:text/csv;charset=utf-8," }));
        let downloadLink = document.createElement("a");
        downloadLink.href = uri;
        downloadLink.download = `${formattedName}.csv`;
        document.body.appendChild(downloadLink);
        downloadLink.click();
        document.body.removeChild(downloadLink);

    }

    render() {
        const { template, loading, error } = this.state;

        return (
            <Page loading={loading}>
                <PageHeader heading={`Schedule Job - ${template && template.name}`} />
                <PageBody error={error}>
                    {template && this.renderTemplate(template)}
                    <br />
                    <div className="text-right">
                        <Button type="button" color="success" onClick={this.onClickUpload}>Upload</Button>
                        {'  '}
                        <Button type="button" color="danger" onClick={() => this.props.history.goBack()}>Cancel</Button>
                    </div>
                </PageBody>
            </Page>

        )
    }
}

const mapStateToProps = state => ({
    user: state.auth.user
});

export default connect(mapStateToProps)(UploadScheduleForm);

import React, { Component } from 'react';
import { Button, Alert } from 'reactstrap';
import axios from 'axios';
import Notify from "react-s-alert";
import { isEmpty } from 'lodash';

import FormBuilder from 'components/form/FormBuilder';
import { Page, PageBody } from 'components/page';

class TalktimeUpload extends Component {
    state = {
        loading: false,
        error: null,
        talktimeProvider: "",
        csvHeaders: {
            wfhTalktimeKnowlarityWeb: ["CALL_ID", "PHONE", "DURATION", "DATE",
                "CALL_STATUS"],
            wfhTalktimeAmeyoIvr: ["CALL_ID", "PHONE", "DURATION", "DATE",
                "CALL_STATUS"],
            wfhTalktimeAmeyoWeb: ["CALL_ID", "EMAIL", "DURATION", "DATE",
                "CALL_STATUS"],
            customerDemoSession: ["MEETING_ID", "EMAIL", "DATE", "TOPIC", "MEETING_URL", "SCHEDULE", "HOST",
                "NUMBER_OF_ATTENDEES", "SCHEDULED_DURATION", "RECORDING_SHARE_URL",
                "ACTUAL_DURATION", "MEETING_START_TIME", "MEETING_END_TIME", "STATUS", "MEETING_PROVIDER"]
        },
        showWarning:false
    }

    handleTalktimeProvider = (value) => {
        this.setState({
            talktimeProvider: value,
        });
    }

    onClickDownloadSampleFile = () => {
        const { talktimeProvider, csvHeaders: selectedCsvHeaders } = this.state;
        if (isEmpty(talktimeProvider)) {
            Notify.error("Please select Talktime Provider!");
            return;
        }
        let csvHeaders = selectedCsvHeaders[talktimeProvider];

        csvHeaders = csvHeaders.map(header => header.replace(/[\n,",']/ig, ''));
        csvHeaders = `${csvHeaders}\n`;

        let uri = URL.createObjectURL(new Blob([csvHeaders], { type: "data:text/csv;charset=utf-8," }));
        let downloadLink = document.createElement("a");
        downloadLink.href = uri;
        downloadLink.download = `${talktimeProvider}.csv`;
        document.body.appendChild(downloadLink);
        downloadLink.click();
        document.body.removeChild(downloadLink);
    }

    renderForm = () => {
        const { talktimeProvider, csvHeaders } = this.state;
        const formFields = [{
            type: "select",
            name: "talktimeProvider",
            required: true,
            label: "Talktime Provider",
            options: [{
                "value": "wfhTalktimeAmeyoIvr",
                "label": "Ameyo IVR"
            }, {
                "value": "wfhTalktimeAmeyoWeb",
                "label": "Ameyo Web"
            }, {
                "value": "wfhTalktimeKnowlarityWeb",
                "label": "Knowlarity Web"
            }, {
                "value": "customerDemoSession",
                "label": "Demo Sessions"
            }],
            onChange: this.handleTalktimeProvider,
            md: 6
        }, {
            type: "textarea",
            name: "csvHeaders",
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
                ref={"formBuilderRef"}
                initialValues={{
                    talktimeProvider,
                    csvHeaders: csvHeaders[talktimeProvider]
                }}
                fields={formFields}
                cols={1}
            />
        )
    }

    handleUploadFile = async () => {
        const uploadForm = this.refs.formBuilderRef.validateFormAndGetValues();
        if (uploadForm === null) return;

        const { talktimeProvider, uploadFile, jobName } = uploadForm;

        const formData = new FormData();
        formData.append('uploadedFileType', talktimeProvider);
        formData.append('uploadedFile', uploadFile);
        formData.append('jobName', jobName);

        const isValidJobName = /^[a-zA-Z0-9- ,_]*$/.test(formData.get('jobName'));
        if(!isValidJobName){
            this.setState({showWarning:true})
        }
        else if(isValidJobName){
        try {
            this.setState({ loading: true, showWarning:false });
            await axios({
                method: 'post',
                url: `${window.NAPI_URL}/batchmanagement/upload/uploaddata`,
                data: formData
            });
            this.setState({ loading: false, error: null, talktimeProvider: "" });
            Notify.success("Uploaded successfully!");
        }
        catch (error) {
            this.setState({ loading: false, error: error });
            Notify.error("Uploaded failed!");
            }
        }
    }

    render() {
        const { loading, error, showWarning } = this.state;

        return (
            <Page loading={loading} >
                <PageBody error={error}>
                    <Alert color="info">
                        <strong>Note:</strong> Please make sure every call has a unique ID to be captured in the talktime.<br />
                        - Ameyo (IVR, WEB), Knowlarity (WEB) : CALL_ID<br />
                        - Demo sessions: MEETING_ID
                    </Alert>
                    {showWarning && 
                        <Alert className="alert alert-warning" style={{width:"49%"}}>
                            <i className="fa fa-info-circle"></i>{" "}
                            Job Name shouldn't contains special characters
                        </Alert>
                    }
                    {this.renderForm()}
                    <br />
                    <div className="text-right">
                        <Button type="button" color="success" onClick={this.handleUploadFile}>Upload</Button>
                        {'  '}
                        <Button type="button" color="danger" onClick={() => this.props.history.goBack()}>Cancel</Button>
                    </div>
                </PageBody>
            </Page>
        );
    }
}

export default TalktimeUpload;

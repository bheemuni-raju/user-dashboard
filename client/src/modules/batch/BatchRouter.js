import React from "react";
import { Route } from "react-router-dom";
import requireRole from "components/router/requireRole";
import { batch } from 'lib/permissionList';
import SwitchWithNotFound from 'components/router/SwitchWithNotFound';
import { concat } from 'lodash';

import BatchLandingPage from './BatchLandingPage'
import BatchDashboard from './components/BatchDashboard';
import CreateJobDefinition from './components/CreateJobDefinition';
import JobInstanceList from './components/JobInstanceList';
import JobDetailView from './components/JobDetailView';
import JobDefinitionList from './components/JobDefinitionList';
import JobQueueList from './components/JobQueueList';
import ComputeEnvironmentList from './components/ComputeEvironmentList';
import ReportTemplatesGrid from './components/report/ReportTemplatesGrid';
import ReportTemplateForm from './components/report/ReportTemplateForm';
import ReportScheduleForm from './components/report/ReportScheduleForm';
import UploadTemplateForm from './components/upload/UploadTemplateForm';
import UploadTemplatesGrid from "./components/upload/UploadTemplatesGrid";
import UploadScheduleForm from "./components/upload/UploadScheduleForm";

const viewReport = [
    batch.viewReports
];
const viewUpload = [
    batch.viewUploads
];
const viewJob = [
    batch.viewJobs
];
const viewBatch = concat(viewReport, viewUpload, viewJob);
const canViewBatchLandingPage = requireRole(viewBatch);
const canViewBatch = requireRole(batch.viewJobs);

const canViewReports = requireRole(batch.viewReports);
const canCreateReports = requireRole(batch.createReport);
const canEditReports = requireRole(batch.editReport);
const canScheduleReports = requireRole(batch.scheduleReport);

const canViewUploads = requireRole(batch.viewUploads);
const canCreateUploads = requireRole(batch.createUpload);
const canEditUploads = requireRole(batch.editUpload);
const canScheduleUploads = requireRole(batch.scheduleUpload);

const BatchRouter = ({ match }) => (
    <SwitchWithNotFound>
        {/* Batch Dashboard */}

        <Route
            path={`${match.url}`}
            exact
            component={canViewBatchLandingPage(BatchLandingPage)}
        />
        <Route
            path={`${match.url}/dashboard`}
            exact
            component={canViewBatch(BatchDashboard)}
        />
        <Route
            path={`${match.url}/job-definitions`}
            exact
            component={canViewBatch(JobDefinitionList)}
        />
        <Route
            path={`${match.url}/job-queues`}
            exact
            component={canViewBatch(JobQueueList)}
        />
        <Route
            path={`${match.url}/compute-environments`}
            exact
            component={canViewBatch(ComputeEnvironmentList)}
        />
        <Route
            path={`${match.url}/jobdefinition/create`}
            exact
            component={canViewBatch(CreateJobDefinition)}
        />
        <Route
            path={`${match.url}/job/instances`}
            exact
            component={canViewBatch(JobInstanceList)}
        />
        <Route
            path={`${match.url}/job/instances/view/:jobId`}
            exact
            component={canViewBatch(JobDetailView)}
        />
        { /* Report Templates */}
        <Route
            path={`${match.url}/reports`}
            exact
            component={canViewReports(ReportTemplatesGrid)}
        />
        <Route
            path={`${match.url}/report/create`}
            exact
            component={canCreateReports(ReportTemplateForm)}
        />
        <Route
            path={`${match.url}/report/edit/:reportId`}
            exact
            component={canEditReports(ReportTemplateForm)}
        />
        <Route
            path={`${match.url}/report/schedule/:reportId`}
            exact
            component={canScheduleReports(ReportScheduleForm)}
        />
        { /* Upload Templates */}
        <Route
            path={`${match.url}/uploads`}
            exact
            component={canViewUploads(UploadTemplatesGrid)}
        />
        <Route
            path={`${match.url}/upload/create`}
            exact
            component={canCreateUploads(UploadTemplateForm)}
        />
        <Route
            path={`${match.url}/upload/edit/:templateId`}
            exact
            component={canEditUploads(UploadTemplateForm)}
        />
        <Route
            path={`${match.url}/upload/schedule/:templateId`}
            exact
            component={canScheduleUploads(UploadScheduleForm)}
        />
    </SwitchWithNotFound>
);

export default BatchRouter;

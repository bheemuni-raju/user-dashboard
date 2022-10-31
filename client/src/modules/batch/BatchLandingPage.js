import React, { Component, Fragment } from "react";
import { connect } from 'react-redux';
import { Link } from 'react-router-dom';
import { get } from 'lodash';

import CardLayout from "components/CardLayout";
import { batch, validatePermission } from 'lib/permissionList';

const BatchLandingPage = (props) => {
    const viewReports = validatePermission(props.user, get(batch, 'viewReports', ''));
    const viewJobs = validatePermission(props.user, get(batch, 'viewJobs'));
    const viewUploads = validatePermission(props.user, get(batch, 'viewUploads'));
    const viewJobInstances = viewReports || viewUploads || false;

    const cards = [{
        title: 'Batch Setup',
        items: [{
            icon: "bjs-job-defintions",
            title: 'Job Definitions',
            url: '/batch/job-definitions',
            isAllowed: viewJobs
        }, {
            icon: "bjs-job-queus",
            title: 'Job Queues',
            url: '/batch/job-queues',
            isAllowed: viewJobs
        }, {
            icon: "bjs-compute-environment",
            title: 'Compute Environments',
            url: '/batch/compute-environments',
            isAllowed: viewJobs
        }]
    }, {
        title: 'Templates and Instances',
        items: [{
            title: 'Report Templates',
            url: '/batch/reports',
            icon: 'bjs-report-template-icon',
            isAllowed: viewReports
        }, {
            title: 'Upload Templates',
            url: '/batch/uploads',
            icon: 'bjs-upload-template-icon',
            isAllowed: viewUploads
        }, {
            title: 'Job Instances',
            url: '/batch/job/instances',
            icon: 'bjs-job-instance-icon',
            isAllowed: viewJobInstances
        }]
    }];

    return (
        <CardLayout cards={cards} heading="Reports and Jobs" />
    );
}

const mapStatetoProps = state => ({
    user: state.auth.user
});

export default connect(mapStatetoProps)(BatchLandingPage)

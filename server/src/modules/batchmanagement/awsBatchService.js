const AWS = require("aws-sdk");

const config = require("../../config");

AWS.config.update({
  accessKeyId: config.awsBatch.accessKeyId,
  secretAccessKey: config.awsBatch.secretAccessKey,
  region: "ap-south-1",
});

AWS.config.setPromisesDependency(Promise);

const batch = new AWS.Batch();
// Create CloudWatchEvents service object
const cwevents = new AWS.CloudWatchEvents({});
const cloudwatchlogs = new AWS.CloudWatchLogs();

/**
 * AWS Batch submit job
 * @param {*} jobName
 * @param {*} jobQueue
 * @param {*} jobDefinition
 * @param {*} environment
 */
const submitJob = async (jobName, jobQueue, jobDefinition, environment) => {
  const params = {
    jobName,
    jobQueue,
    jobDefinition,
    containerOverrides: {
      environment,
    },
  };
  return new Promise((resolve, reject) => {
    batch.submitJob(params, (err, data) => {
      if (err) return reject(err);
      return resolve({ data });
    });
  });
};

const getCloudWatchLogs = async (logStreamName, nextToken = "") => {
  const params = {
    logGroupName: "/aws/batch/job",
    logStreamName,
    limit: 500,
    // endTime: 0,
    // startTime: 0,
    startFromHead: true,
  };

  if (nextToken) {
    params.nextToken = nextToken;
  }

  return new Promise((resolve, reject) => {
    cloudwatchlogs.getLogEvents(params, function (err, data) {
      if (err) return reject(err);
      return resolve({ data });
    });
  });
};

/**
 * Create Cloudwatch rule
 **************************
 Sample Params for putRule
 **************************
 {
    "Name": "sample-rule",
    "Description": "",
    "ScheduleExpression": "rate(5 hours)" or "cron(0 20 * * ? *)",
    "EventPattern": "",
    "State": "ENABLED"
}
*/
const cwPutRule = async (ruleName, scheduleExpression) => {
  const params = {
    Name: ruleName,
    ScheduleExpression: scheduleExpression,
    State: "ENABLED",
  };

  return new Promise((resolve, reject) => {
    cwevents.putRule(params, (err, data) => {
      if (err) return reject(err);
      return resolve({ data });
    });
  });
};

/**
 * Cloudwatch put various AWS Services as targets
 *************************************************
 Sample Params for Targets
 *************************************************
 {
   "Rule": "test",
   "Targets": [
    {
      "Id": "Id2836158743893",
      "Arn": "arn:aws:batch:ap-south-1:644062857332:job-queue/iifl-job-queue",
      "BatchParameters": {
        "JobDefinition": "iifl-loanstatus-job",
        "JobName": "iifl-loanstatus-job-repeat",
        "ArrayProperties": null,
        "RetryStrategy": null
      },
      "RoleArn": "arn:aws:iam::644062857332:role/service-role/AWS_Events_Invoke_Batch_Job_Queue_1495779564"
    }
  ]
 }
 */
const cwPutTargets = async () => {
  const params = {
    Rule: "test",
    Targets: [
      {
        Id: "Id2836158743893",
        Arn: "arn:aws:batch:ap-south-1:644062857332:job-queue/iifl-job-queue",
        BatchParameters: {
          JobDefinition: "iifl-loanstatus-job",
          JobName: "iifl-loanstatus-job-repeat",
        },
      },
    ],
  };

  return new Promise((resolve, reject) => {
    cwevents.putRule(params, (err, data) => {
      if (err) return reject(err);
      return resolve({ data });
    });
  });
};

const listJobDefinitions = async () => {
  const params = {
    status: "ACTIVE",
    maxResults: 1000,
  };

  return new Promise((resolve, reject) => {
    batch.describeJobDefinitions(params, function (err, data) {
      if (err) return reject(err);
      return resolve({ data });
    });
  });
};

const listJobQueues = async () => {
  const params = {
    maxResults: 1000,
  };

  return new Promise((resolve, reject) => {
    batch.describeJobQueues(params, function (err, data) {
      if (err) return reject(err);
      return resolve({ data });
    });
  });
};

const listComputeEnvironments = async () => {
  const params = {
    maxResults: 1000,
  };

  return new Promise((resolve, reject) => {
    batch.describeComputeEnvironments(params, function (err, data) {
      if (err) return reject(err);
      return resolve({ data });
    });
  });
};

const registerJobDefinition = ({
  environment,
  image,
  memory,
  vcpus,
  jobDefinitionName,
}) => {
  const params = {
    type: "container",
    containerProperties: {
      environment: environment || [],
      image,
      memory: memory || 512,
      vcpus: vcpus || 2,
    },
    jobDefinitionName,
  };

  return new Promise((resolve, reject) => {
    batch.registerJobDefinition(params, function (err, data) {
      if (err) return reject(err);
      return resolve({ data });
    });
  });
};

const deRegisterJobDefinition = ({ jobDefinition }) => {
  const params = {
    jobDefinition,
  };

  return new Promise((resolve, reject) => {
    batch.deregisterJobDefinition(params, function (err, data) {
      if (err) return reject(err);
      return resolve({ data });
    });
  });
};

module.exports = {
  submitJob,
  registerJobDefinition,
  deRegisterJobDefinition,
  cwPutRule,
  cwPutTargets,
  getCloudWatchLogs,
  listJobDefinitions,
  listJobQueues,
  listComputeEnvironments,
};

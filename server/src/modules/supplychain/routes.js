'use strict';

const express = require('express');

const attendanceRoutes = require('./attendance/attendanceRoutes');
const attendanceWorkflowRoutes = require('./attendanceworkflow/attendanceWorkflowRoutes');
const talktimeRoutes = require('./talktime/talktimeRoutes');
const dayOffRoutes = require('./dayoff/dayOffRoutes');

const apiRouter = express.Router();

module.exports = () =>
    apiRouter
        .use("/attendance", attendanceRoutes())
        .use("/attendanceworkflow", attendanceWorkflowRoutes())
        .use("/talktime", talktimeRoutes())
        .use("/dayoff", dayOffRoutes())
const Router = require('express-promise-router')

const controller = require('./attendanceController')

module.exports = () => {
    const router = Router({ mergeParams: true })

    router.route(`/list`)
        .post(controller.listData);
    router.route(`/summary`)
        .post(controller.getSummary);
    router.route(`/updateAttendance`)
        .put(controller.updateAttendance);
    router.route(`/updateMeetingAttendanceStatus`)
        .put(controller.updateMeetingAttendanceStatus);

    return router
}
const Router = require('express-promise-router')

const controller = require('./wfhAttendanceController')

module.exports = () => {
    const router = Router({ mergeParams: true })

    router.route(`/list`)
        .post(controller.listData);
    router.route(`/employeeList`)
        .post(controller.employeeList);
    router.route(`/employeeAttendanceData`)
        .post(controller.employeeAttendanceData);
    router.route(`/seedBulkAttendance`)
        .post(controller.seedBulkAttendance);
    router.route(`/summary`)
        .post(controller.getSummary);
    router.route(`/updateAttendance`)
        .put(controller.updateAttendance);
    router.route(`/updateMeetingAttendanceStatus`)
        .put(controller.updateMeetingAttendanceStatus);
    router.route('/employeeRoster')
        .post(controller.employeeRosterList);

    return router
}

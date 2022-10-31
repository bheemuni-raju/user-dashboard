const Router = require('express-promise-router');

const controller = require('./attendanceController');

module.exports = () => {
    const router = Router({ mergeParams: true });

    router.route('/listAttendance').post(controller.listAttendance);
    router.route('/storeAttendance').post(controller.updateAttendance);
    router.route('/summary').post(controller.getSummary);

    return router;
}
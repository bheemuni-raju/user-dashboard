const Router = require('express-promise-router')

const controller = require('./employeeSnapshotController')

module.exports = () => {
    const router = Router({ mergeParams: true })

    router.route(`/list`)
        .post(controller.listData);

    router.route(`/getCycle`)
        .post(controller.getCycle);

    router.route('/getSnapshotSummary')
        .post(controller.getSnapshotSummary);

    router.route('/updateEmployeeSnapshot')
        .post(controller.updateEmployeeSnapshot);

    router.route('/bulkUpdateEmployeeSnapshot')
        .post(controller.bulkUpdateEmployeeSnapshot);

    router.route('/getSnapshotWorkflow')
        .post(controller.getSnapshotWorkflow);
    router.route('/updateSnapshotWorkflow')
        .post(controller.updateSnapshotWorkflow);

    router.route('/getWorkflowHistory')
        .post(controller.getWorkflowHistory);

    router.route('/downloadReport')
        .post(controller.downloadReport);

    router.route('/getNewUsersList')
        .post(controller.getNewUsersList);

    router.route('/addNewSnapshotRecords')
        .post(controller.addNewSnapshotRecords);

    return router
}
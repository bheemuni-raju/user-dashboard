const Router = require('express-promise-router')

const controller = require('./wfhAttendanceWorkflowController')

module.exports = () => {
    const router = Router({ mergeParams: true })

    router.route(`/list`)
        .post(controller.listData);

    router.route(`/getDetails`)
        .post(controller.getWorkflowDetail);

    router.route(`/updateStatus`)
        .post(controller.updateWorkflowStatus);

    router.route(`/moveWorkflowStage`)
        .post(controller.moveWorkflowStage);

    router.route(`/updateTalktimeStatus`)
        .post(controller.updateTalktimeStatus);

    return router
}
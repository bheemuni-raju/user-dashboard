'use strict';

const Router = require('express-promise-router');
const controller = require('./smsTemplateController');

const defaultRoutes = (routeName, ctrl) => {
    const router = Router({
        mergeParams: true
    });

    router.route(`/${routeName}/list`).post(ctrl.listData);

    router.route(`/${routeName}`)
        .post(ctrl.createData)

    router.route(`/${routeName}/associateSender`)
        .put(ctrl.associateSender)

    router.route(`/${routeName}/dltApproval/:templateId`)
        .put(ctrl.sendForDLTApproval)

    router.route(`/${routeName}/markApproved`)
        .put(ctrl.markApproved)

    router.route(`/${routeName}/markRejected`)
        .put(ctrl.markRejected)

    router.route(`/${routeName}/listAll`)
        .get(ctrl.listAll)

    router.route(`/${routeName}/:smsTemplateId`)
        .get(ctrl.readData)
        .put(ctrl.updateData)
        .delete(ctrl.deleteData)

    // Finish by binding the team middleware
    router.param('smsTemplateId', ctrl.smsTemplateById)

    return router;
};

module.exports = () => {
    const router = defaultRoutes('smstemplate', controller);
    return router
}
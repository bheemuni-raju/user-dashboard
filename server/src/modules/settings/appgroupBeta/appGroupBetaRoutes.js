'use strict';

const Router = require('express-promise-router');
const appGroupBetaController = require('./appGroupBetaController');

module.exports = () => {
    const router = Router({ mergeParams: true });
    router.route('/list').post(appGroupBetaController.listData);
    router.route('/userList').post(appGroupBetaController.getUserListByAppGroupId);
    router.route('/appDetails').post(appGroupBetaController.getAppDetailsByAppName);
    router.route('/create').post(appGroupBetaController.createAppGroup);
    router.route('/update').put(appGroupBetaController.updateAppGroup);
    router.route('/update').delete(appGroupBetaController.updateAppGroupStatus);
    router.route('/assign').post(appGroupBetaController.AssignUser);
    router.route('/unAssign').delete(appGroupBetaController.unAssignUser);

    return router;
};
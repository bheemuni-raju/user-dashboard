const Router = require('express-promise-router');

const controller = require('./employeeReferralController');

module.exports = () => {
    const router = Router({ mergeParams: true });

    router.route('/listRhData').post(controller.listRhData);
    router.route('/updateRhUser').post(controller.updateRhUser);

    return router;
}
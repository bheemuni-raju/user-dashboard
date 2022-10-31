const Router = require('express-promise-router');
const controller = require('./dashboardController');

module.exports = () => {
    const router = Router({ mergeParams: true });

    router.route('/getUserOverview')
        .post(controller.getUserOverview);

    return router;
}

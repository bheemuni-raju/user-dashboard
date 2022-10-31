const Router = require('express-promise-router');

const controller = require('./attritionController');

module.exports = () => {
    const router = Router({ mergeParams: true });

    router.route('/listAttrition').post(controller.listAttrition);
    router.route('/storeAttrition').post(controller.storeAttrition);

    return router;
}
const Router = require('express-promise-router');
const controller = require('./applicationTypeController');

module.exports = () => {
    const router = Router({ mergeParams: true });
    router.route('/list').post(controller.applicationTypeList)
    router.route('/create').post(controller.createApplicationType)
    router.route('/create/:id').put(controller.updateApplicationType)
    router.route('/delete').put(controller.deleteApplicationType)
    
    return router;
};
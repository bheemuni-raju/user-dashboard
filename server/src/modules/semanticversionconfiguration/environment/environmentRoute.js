const Router = require('express-promise-router');
const controller = require('./environmentController');

module.exports = () => {
    const router = Router({ mergeParams: true });
    router.route('/list').post(controller.enviornmentList)
    router.route('/create').post(controller.createEnviornment)
    router.route('/create/:id').put(controller.updateEnvironment)
    router.route('/delete').put(controller.deleteEnvironment)
    
    return router;
};
const Router = require('express-promise-router');

const controller = require('./secretpoolController');

module.exports = () => {
    const router = Router({ mergeParams: true });

    router.route('/list').post(controller.listSecretPool);
    router.route('/create').post(controller.createSecretPool);
    router.route('/update').put(controller.updateSecretPool);
    router.route('/delete').delete(controller.deleteSecretPool);

    return router;
}
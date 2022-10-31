const Router = require('express-promise-router');

const controller = require('./vaultAndSecretpoolMappingController');

module.exports = () => {
    const router = Router({ mergeParams: true });
    router.route('/list').post(controller.vaultMappingList);
    router.route('/create').post(controller.createMapping);
    router.route('/update').delete(controller.deleteMapping);

    return router;
};

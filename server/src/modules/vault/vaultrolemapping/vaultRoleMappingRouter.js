const Router = require('express-promise-router');

const controller = require('./vaultRoleMappingController');

module.exports = () => {
    const router = Router({ mergeParams: true });

    router.route('/list').post(controller.listVaultRoleMapping);
    router.route('/create').post(controller.createVaultRoleMapping);
    router.route('/update')
        .put(controller.updateVaultRoleMapping)
        .patch(controller.updateVaultRoleMappingStatus);
    router.route('/delete').delete(controller.deleteMapping);

    return router;
}
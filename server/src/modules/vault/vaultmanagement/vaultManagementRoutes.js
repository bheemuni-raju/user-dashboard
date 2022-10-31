const Router = require('express-promise-router');

const controller = require('./vaultManagementController');

module.exports = () => {
    const router = Router({ mergeParams: true });
    router.route('/list').post(controller.vaultList);
    router.route('/create').post(controller.createVault);
    router.route('/update')
        .put(controller.updateVault)
        .delete(controller.deleteVault);
    router.route('/environmentSecretByVaultUuid').post(controller.environmentSecretByVaultUuid);
    router.route('/secretKeyByVaultUuid').post(controller.secretKeyByVaultUuid);
    router.route('/logList').post(controller.vaultLogList);
    router.route('/auditList').post(controller.vaultAuditLogList); 
    router.route('/logListByEmail').post(controller.getVaultLogListByEmail); 
    router.route('/logListByVaultUid').post(controller.getVaultLogListByVaultUid); 
    router.route('/vaultDetailsById').post(controller.getVaultDetailsById); 

    return router;
};
const Router = require('express-promise-router');
const controller = require('./semanticController');

module.exports = () => {
    const router = Router({ mergeParams: true });
    router.route('/create').post(controller.createSemanticConfiguration)
    router.route('/list/:dns').get(controller.getSemanticConfigurationByDNS)
    router.route('/list').post(controller.SemanticConfigurations)
    router.route('/create/:id').put(controller.updateSemanticConfiguration)
    router.route('/delete').put(controller.deleteSemanticConfiguration)
    
    return router;
};
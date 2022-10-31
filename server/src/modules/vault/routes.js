const express = require('express');
const secretPoolRoutes = require('./secretspool/secretpoolRouter');
const secretRoutes = require('./secret/secretRoutes');
const vaultRoleMappingRouter = require('./vaultrolemapping/vaultRoleMappingRouter');
const vaultManagementRoutes = require('./vaultmanagement/vaultManagementRoutes')
const vaultAndSecretpoolMappingRoutes = require('./vaultandsecretpoolmapping/vaultAndSecretpoolMappingRoutes')
const apiRouter = express.Router()

module.exports = () =>
    apiRouter.use("/secretpool", secretPoolRoutes())
apiRouter.use("/secret", secretRoutes())
apiRouter.use("/vaultmanagement", vaultManagementRoutes())
apiRouter.use("/vaultsecretpoolmapping", vaultAndSecretpoolMappingRoutes())
apiRouter.use("/vaultrolemapping", vaultRoleMappingRouter())



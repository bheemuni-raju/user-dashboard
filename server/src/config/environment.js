require("dotenv").config();

module.exports = {
  port: process.env.PORT || 3000,
  db: process.env.MONGODB_NUCLEUS_URI || "MONGODB_NUCLEUS_URI",
  pgDb: process.env.PG_NUCLEUS_URI || "PG_NUCLEUS_URI",
  dbUrl: process.env.MONGO_DB_URI || "MONGO_DB_URI",
  leadoDb: process.env.MONGODB_LEADO_URI || "MONGODB_LEADO_URI",
  friendlyPotato:
    process.env.MONGODB_FRIENDLY_POTATO_URI || "MONGODB_FRIENDLY_POTATO_URI",
  scAchieveDb: process.env.MONGODB_SCACHIEVE_URI || "MONGODB_SCACHIEVE_URI",
  mkmsDb: process.env.MONGODB_MKMS_URI || "MONGODB_MKMS_URI",
  redisUri: process.env.REDIS_URI || "REDIS_URI",
  sessionSecret: process.env.SESSION_SECRET || "SESSTION_SECRET",
  awsS3: {
    accessKeyId: process.env.AWS_S3_CLIENT_ID || "AWS_S3_CLIENT_ID",
    secretAccessKey: process.env.AWS_S3_CLIENT_SECRET || "AWS_S3_CLIENT_SECRET",
  },
  awsBatch: {
    accessKeyId: process.env.AWS_BATCH_CLIENT_ID || "AWS_BATCH_CLIENT_ID",
    secretAccessKey:
      process.env.AWS_BATCH_CLIENT_SECRET || "AWS_BATCH_CLIENT_SECRET",
  },
  sessionCollection: "sessions",
  sessionIdleTimeout: 3600000,
  validateOnly: ["achieve.byjus.com"],
  signSecret: "BYJUS Nucleus",
  defaultAppRedirectURI: "dashboard",
  paymentAppRedirectURI: "",
  omsAppRedirectURI: "oms/dashboard",
  achieveAppRedirectURI: "#!/",
  notification: {
    key: process.env.NOTIFICATION_KEY || "ThinkAndLearn@56009",
    salt: process.env.NOTIFICATION_SALT || "xc9k1ZpabbK6tFmkHJmH",
    serviceUrl:
      process.env.NOTIFICATION_URL ||
      "https://byjus-notification-hub.herokuapp.com/api/v1/notification",
    slackUrl: process.env.SLACK_DR_WORKFLOW_URL || "SLACK_DR_WORKFLOW_URL",
  },
  orders: {
    OH_BASE_URL: process.env.OH_BASE_URL,
    OH_TOKEN_ID: process.env.OH_TOKEN_ID,
    MIDDLEWARE_DEBUG_API: process.env.MIDDLEWARE_DEBUG_API,
    MIDDLEWARE_DEBUG_TOKEN: process.env.MIDDLEWARE_DEBUG_TOKEN,
  },
  isTyrionPlugInChangesApplicable: {
    IS_TYRION_PLUG_IN_APPLICABLE: process.env.IS_TYRION_PLUG_IN_APPLICABLE,
  },
  mfaStrategy: {
    enforceMfa: ["cxms"],
  },
  vaultApiKey: "R@#$789^FDSsdvf#$%",
  enableVaultCache: process.env.ENABLE_VAULT_CACHE,
  cryptoIvRandomBytes: process.env.CRYPTO_IV_RANDOM_BYTES,
  vaultEncryptionSecret: process.env.VAULT_ENCRYPTION_SECRET,
};

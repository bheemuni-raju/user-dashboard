/* eslint-disable */
const whitelistEslintDirectory = [
  "src/common/**",
  "src/config/**",
  "src/lib/**",
  "src/modules/businessdevelopment/**",
  "src/modules/businessdevelopment/employeesnapshot",
  "src/modules/byjusconfigmanagement/**",
  "src/modules/core/**",
  "src/modules/dashboardmanagement/**",
  "src/modules/finance/**",
  "src/modules/semanticversionconfiguration/**",
  "src/modules/settings/**",
  "src/modules/supplychain/**",
  "src/modules/supportmanagement/**",
  "src/modules/userexperience/**",
  "src/modules/vault/**",
  "src/notificationhub/**",
  "src/utils/**",
  "src/modules/routes.js",
  "src/*.js",
  "*newrelic.js",
]

module.exports = {
  extends: ["plugin:@byjus-orders/node"],
  ignorePatterns: [
    ...whitelistEslintDirectory,
    "*.json",
    "Dockerfile",
    "envplaceholder",
    "README.md",
    "*.sh",
  ],
};

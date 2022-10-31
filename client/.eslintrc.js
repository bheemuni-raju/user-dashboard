/* eslint-disable */

const whitelistEslintDirectory = [
  "public/**",
  "src/assets/**",
  "src/components/**",
  "src/containers/**",
  "src/lib/toggleClasses/**",
  "src/modules/**",
  "src/scss/**",
  "src/store/**",
  "src/utils/**",
  "src/*.js",
];
module.exports = {
  extends: ["plugin:@byjus-orders/react"],
  ignorePatterns: [
    ...whitelistEslintDirectory,
    "*.json",
    "Dockerfile",
    "*.scss",
    "*.sh",
    "*.lock",
  ],
};

/* eslint-env node */
const { getDefaultConfig } = require('expo/metro-config');
const { isSubsetBuild } = require('./scripts/lib/subset-build-profile');

const config = getDefaultConfig(__dirname);
if (isSubsetBuild()) {
  const { configureSubsetMetro } = require('./scripts/lib/subset-bundle');
  configureSubsetMetro(config, __dirname);
}
module.exports = config;

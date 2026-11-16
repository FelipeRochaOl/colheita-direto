const path = require('path');
const { getDefaultConfig } = require('expo/metro-config');
const { withNativeWind } = require('nativewind/metro');

const config = getDefaultConfig(__dirname);

/**
 * Pacotes que precisam existir em uma única cópia no app. Os pacotes do monorepo
 * (ex.: @colheita/api-client) passam a usar a cópia do app, e não a sua própria.
 */
const SINGLETON_PACKAGES = ['react', 'react-native', '@tanstack/react-query'];
const appEntryPath = path.join(__dirname, 'index.ts');

config.resolver.resolveRequest = (context, moduleName, platform) => {
  const isSingleton = SINGLETON_PACKAGES.some((name) => moduleName === name || moduleName.startsWith(`${name}/`));
  const resolutionContext = isSingleton ? { ...context, originModulePath: appEntryPath } : context;
  return context.resolveRequest(resolutionContext, moduleName, platform);
};

module.exports = withNativeWind(config, { input: './global.css' });

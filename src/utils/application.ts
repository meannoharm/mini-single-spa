import { AppStatus, Application } from 'src/types';
import { isFunction, nextTick } from './utils';
import { originalWindow } from './originalEnv';

export const appMaps = new Map<string, Application>();
let currentAppName: null | string = null;

export function getCurrentAppName() {
  return currentAppName;
}

export function getCurrentApp() {
  return (currentAppName && appMaps.get(currentAppName)) || null;
}

export function temporarySetCurrentAppName(name: string | null) {
  if (currentAppName !== name) {
    currentAppName = name;
    nextTick(() => {
      currentAppName = null;
    });
  }
}

export function setCurrentAppName(name: string | null) {
  currentAppName = name;
}

export function getApp(name: string) {
  return appMaps.get(name);
}

export function triggerAppHook<K extends keyof Application>(app: Application, hook: K, status: AppStatus) {
  app.status = status;
  if (isFunction(app[hook])) {
    // @ts-ignore
    app[hook]();
  }
}

export function isSandboxEnable(app: Application) {
  return app.sandboxConfig.enabled;
}

export function isActive(app: Application) {
  return isFunction(app.activeRule) && app.activeRule(originalWindow.location);
}

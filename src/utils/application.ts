import { Application } from 'src/types';
import { nextTick } from './utils';

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

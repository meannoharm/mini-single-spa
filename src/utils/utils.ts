import { originalDocument, originalWindow } from './originalEnv';

export const isPromise = (value: any) => {
  return (typeof value === 'object' || typeof value === 'function') && typeof value.then === 'function';
};

export const $ = (selector: string) => document.getElementById(selector);

export function nextTick(callback: () => void) {
  Promise.resolve().then(callback);
}

export function isFunction(fn: any) {
  return typeof fn === 'function';
}

export function isObject(obj: any) {
  return typeof obj === 'object' && obj !== null;
}

export function isInBrowser() {
  return typeof originalWindow === 'object' && typeof originalDocument === 'object';
}

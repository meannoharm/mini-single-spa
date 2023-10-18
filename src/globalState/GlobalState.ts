import { AnyObject, AppStatus } from 'src/types';
import { getApp, getCurrentAppName, isActive } from 'src/utils/application';
import EventBus from './EventBus';

type Callback = (state: AnyObject, operator: string, key?: string) => void;

export default class GlobalState extends EventBus {
  private state: AnyObject = {};
  private stateChangeCallbacksMap: Map<string, Callback[]> = new Map();

  set(key: string, value: any) {
    this.state[key] = value;
    this.emitChange('set', key);
  }

  get(key: string) {
    return this.state[key];
  }

  getAll() {
    return this.state;
  }

  delete(key: string) {
    delete this.state[key];
    this.emitChange('delete', key);
  }

  clear() {
    this.state = {};
    this.stateChangeCallbacksMap.clear();
    this.emitChange('clear');
  }

  onChange(callback: Callback) {
    const appName = getCurrentAppName();
    if (!appName) return;

    const { stateChangeCallbacksMap } = this;
    if (!stateChangeCallbacksMap.has(appName)) {
      stateChangeCallbacksMap.set(appName, []);
    }

    stateChangeCallbacksMap.get(appName)?.push(callback);
  }

  emitChange(operator: string, key?: string) {
    this.stateChangeCallbacksMap.forEach((callbacks, appName) => {
      const app = getApp(appName);
      if (app) {
        if (!isActive(app) && app.status === AppStatus.MOUNTED) {
          callbacks.forEach((callback) => {
            callback(this.state, operator, key);
          });
        }
      }
    });
  }

  clearGlobalStateByAppName(appName: string) {
    this.stateChangeCallbacksMap.delete(appName);
    this.clearEventsByAppName(appName);
  }
}

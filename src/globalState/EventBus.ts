import { getApp, getCurrentAppName, isActive } from 'src/utils/application';
import { isFunction } from 'src/utils/utils';
import { Application, AppStatus } from 'src/types';

type Callback = (...args: any) => any;

export default class EventBus {
  private eventsMap: Map<string, Record<string, Callback[]>> = new Map();

  on(event: string, callback: Callback) {
    if (!isFunction(callback)) {
      throw Error(`callback must be a function, but got ${typeof callback}`);
    }

    const appName = getCurrentAppName() || 'parent';

    const { eventsMap } = this;
    if (!eventsMap.get(appName)) {
      eventsMap.set(appName, {});
    }

    const events = eventsMap.get(appName)!;

    if (!events[event]) {
      events[event] = [];
    }

    events[event].push(callback);
  }

  off(event: string, callback?: Callback) {
    const appName = getCurrentAppName() || 'parent';

    const { eventsMap } = this;
    const events = eventsMap.get(appName);
    if (!events) return;
    if (!events[event]) return;

    if (callback) {
      const callbacks = events[event];
      let index = callbacks.length;
      while (index--) {
        if (callbacks[index] === callback) {
          callbacks.splice(index, 1);
          break;
        }
      }
    } else {
      events[event] = [];
    }
  }

  emit(event: string, ...args: any) {
    // 如果是点击其他子应用或父应用触发全局数据变更，则当前打开的子应用获取到的 app 为 null
    // 所以需要改成用 activeRule 来判断当前子应用是否运行
    this.eventsMap.forEach((events, appName) => {
      const app = getApp(appName);
      if (app) {
        if (appName === 'parent' || (isActive(app) && app.status === AppStatus.MOUNTED)) {
          if (events[event].length) {
            for (const callback of events[event]) {
              callback.apply(this, args);
            }
          }
        }
      }
    });
  }

  once(event: string, callback: Callback) {
    const self = this;
    function wrap(...args: any) {
      callback.apply(self, args);
      self.off(event, wrap);
    }
    this.on(event, wrap);
  }

  clearEventsByAppName(appName: string) {
    this.eventsMap.delete(appName);
  }
}

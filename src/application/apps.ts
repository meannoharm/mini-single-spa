import { appMaps } from 'src/utils/application';
import bootstrapApp from '../lifeCycles/bootstrap';
import mountApp from '../lifeCycles/mount';
import unMountApp from '../lifeCycles/unMount';
import { Application, AppStatus } from '../types';

export const apps: Application[] = [];

export async function loadApps() {
  // 先卸载所有失活的子应用
  const toUnMountApp = getAppsWithStatus(AppStatus.MOUNTED);
  const unMountPromise = toUnMountApp.map(unMountApp);

  // 初始化所有刚注册的子应用
  const toLoadApp = getAppsWithStatus(AppStatus.BEFORE_BOOTSTRAP);
  const loadPromise = toLoadApp.map(bootstrapApp);

  await Promise.all([...unMountPromise, ...loadPromise]);

  // 加载所有符合条件的子应用
  const toMountApp = [...getAppsWithStatus(AppStatus.BOOTSTRAPPED), ...getAppsWithStatus(AppStatus.UNMOUNTED)];
  await toMountApp.map(mountApp);
}

export function getAppsWithStatus(status: AppStatus) {
  const result: Application[] = [];
  appMaps.forEach((app) => {
    if (isActive(app) && app.status === status) {
      switch (app.status) {
        case AppStatus.BEFORE_BOOTSTRAP:
        case AppStatus.BOOTSTRAPPED:
        case AppStatus.UNMOUNTED:
          result.push(app);
          break;
      }
    } else if (app.status === AppStatus.MOUNTED && status === AppStatus.MOUNTED) {
      result.push(app);
    }
  });
  return result;
}

const isActive = (app: Application) => {
  return typeof app.activeRule === 'function' && app.activeRule(window.location);
};

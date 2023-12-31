import { AppStatus, Application, ApplicationInit } from 'src/types';
import { appMaps } from 'src/utils/application';

export default function registerApplication(app: ApplicationInit) {
  if (typeof app.activeRule === 'string') {
    const path = app.activeRule;
    app.activeRule = (location: Location = window.location) => location.pathname === path;
  }

  app = {
    ...app,
    status: AppStatus.BEFORE_BOOTSTRAP,
    pageBody: '',
    loadedURLs: [],
    scripts: [],
    styles: [],
    isFirstLoad: true,
  } as Application;

  if (!app.sandboxConfig) {
    app.sandboxConfig = { enabled: true, css: false };
  }

  appMaps.set(app.name, app);
}

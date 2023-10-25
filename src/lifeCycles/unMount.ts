import { removeStyles } from 'src/utils/dom';
import { Application, AppStatus } from 'src/types';
import { isSandboxEnable, triggerAppHook } from 'src/utils/application';
import { originalWindow } from 'src/utils/originalEnv';

export default function unMountApp(app: Application): Promise<any> {
  triggerAppHook(app, 'beforeUnMount', AppStatus.BEFORE_UNMOUNT);
  const result = (app as any).unMount({ props: app.props, container: app.container });
  return Promise.resolve(result)
    .then(() => {
      if (isSandboxEnable(app)) {
        app.sandbox.stop();
      }
      app.styles = removeStyles(app.name);
      originalWindow.spaGlobalState.clearGlobalStateByAppName(app.name);
      triggerAppHook(app, 'unMounted', AppStatus.UNMOUNTED);
    })
    .catch((err: any) => {
      app.status = AppStatus.UNMOUNT_ERROR;
      console.log(err);
    });
}

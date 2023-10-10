import { isPromise } from 'src/utils/utils';
import { Application, AppStatus } from '../types';
import { triggerAppHook } from 'src/utils/application';

export default function mountApp(app: Application): Promise<any> {
  triggerAppHook(app, 'beforeMount', AppStatus.BEFORE_MOUNT);

  if (!app.isFirstLoad) {
    // 重新加载子应用时恢复快照
    app.sandbox.restoreWindowSnapshot();
    app.sandbox.start();
    app.container.innerHTML = app.pageBody;
  } else {
    app.isFirstLoad = false;
  }

  const result = (app as any).mount({ props: app.props, container: app.container });

  return Promise.resolve(result)
    .then(() => {
      triggerAppHook(app, 'mounted', AppStatus.MOUNTED);
    })
    .catch((err: any) => {
      app.status = AppStatus.MOUNT_ERROR;
      console.log(err);
    });
}

import { removeStyles } from 'src/utils/dom';
import { Application, AppStatus } from 'src/types';
import { triggerAppHook } from 'src/utils/application';

export default function unMountApp(app: Application): Promise<any> {
  triggerAppHook(app, 'beforeUnMount', AppStatus.BEFORE_UNMOUNT);

  let result = (app as any).unMount({ props: app.props, container: app.container });

  return Promise.resolve(result)
    .then(() => {
      app.sandbox.stop();
      app.styles = removeStyles(app.name);
      triggerAppHook(app, 'unMounted', AppStatus.UNMOUNTED);
    })
    .catch((err: any) => {
      app.status = AppStatus.UNMOUNT_ERROR;
      console.log(err);
    });
}

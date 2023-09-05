import { isPromise } from "src/utils/utils";
import { Application, AppStatus } from "src/types";

export default function unMountApp(app: Application): Promise<any> {
  app.status = AppStatus.BEFORE_UNMOUNT;

  let result = (app as any).unMount(app.props);
  if (!isPromise(result)) {
    result = Promise.resolve(result);
  }

  return result
    .then(() => {
      app.status = AppStatus.UNMOUNTED;
    })
    .catch((err: any) => {
      app.status = AppStatus.UNMOUNT_ERROR;
      console.log(err);
    });
}

import { isPromise } from "src/utils/utils";
import { AnyObject, Application, AppStatus } from "../types";
import parseHTMLandLoadSources from "src/utils/parseHtmlAndLoadSources";

declare const window: any;

export default async function bootstrapApp(app: Application) {
  try {
    await parseHTMLandLoadSources(app);
  } catch (error) {
    throw error
  }

  const { bootstrap, mount, unMount } = await getLifeCycleFuncs(app.name);

  validateLifeCycleFunc("bootstrap", bootstrap);
  validateLifeCycleFunc("mount", mount);
  validateLifeCycleFunc("unMount", unMount);

  app.bootstrap = bootstrap;
  app.mount = mount;
  app.unMount = unMount;

  try {
    app.props = await getProps(app.props);
  } catch (err) {
    app.status = AppStatus.BOOTSTRAP_ERROR;
    console.log(err);
  }

  let result = (app as any).bootstrap(app.props);
  if (!isPromise(result)) {
    result = Promise.resolve(result);
  }

  return result
    .then(() => {
      app.status = AppStatus.BOOTSTRAPPED;
    })
    .catch((err: Error) => {
      app.status = AppStatus.BOOTSTRAP_ERROR;
      console.log(err);
    });
}

async function getProps(props: Function | AnyObject) {
  if (typeof props === "function") {
    return await props();
  }
  if (typeof props === "object") return props;
  return {};
}

function validateLifeCycleFunc(name: string, fn: any) {
  if (typeof fn !== "function") {
    throw Error(`The "${name}" must be a function`);
  }
}

async function getLifeCycleFuncs(name: string) {
  const result = window[`mini-single-spa-${name}`]
  if (typeof result === 'function') {
    return result();
  }

  if (typeof result === 'object') {
    return result;
  }

  throw Error(`The micro app must inject the lifecycle("bootstrap" "mount" "unmount") into window['mini-single-spa-${name}']`)
}
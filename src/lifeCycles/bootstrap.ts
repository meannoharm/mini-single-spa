import Sandbox from '../sandbox/Sandbox';
import { isFunction, isObject } from 'src/utils/utils';
import { AnyObject, Application, AppStatus } from '../types';
import parseHTMLandLoadSources, { addStyles, executeScripts } from 'src/utils/source';
import { triggerAppHook } from '../utils/application';

declare const window: any;

export default async function bootstrapApp(app: Application) {
  triggerAppHook(app, 'beforeBootstrap', AppStatus.BEFORE_BOOTSTRAP);

  try {
    // 加载页面的 script css
    await parseHTMLandLoadSources(app);
  } catch (error) {
    throw error;
  }

  app.sandbox = new Sandbox(app);
  app.sandbox.start();
  app.container.innerHTML = app.pageBody;

  addStyles(app.styles);
  executeScripts(app.scripts, app);

  const { mount, unMount } = await getLifeCycleFuncs(app);

  validateLifeCycleFunc('mount', mount);
  validateLifeCycleFunc('unMount', unMount);

  app.mount = mount;
  app.unMount = unMount;

  try {
    app.props = await getProps(app.props);
  } catch (err) {
    app.status = AppStatus.BOOTSTRAP_ERROR;
    console.log(err);
  }

  app.scripts.length = 0;
  app.sandbox.recordWindowSnapshot();

  triggerAppHook(app, 'bootstrapped', AppStatus.BOOTSTRAPPED);
}

async function getProps(props: Function | AnyObject) {
  if (typeof props === 'function') {
    return await props();
  }
  if (typeof props === 'object') return props;
  return {};
}

function validateLifeCycleFunc(name: string, fn: any) {
  if (typeof fn !== 'function') {
    throw Error(`The "${name}" must be a function`);
  }
}

async function getLifeCycleFuncs(app: Application) {
  const result = app.sandbox.proxyWindow.__IS_SINGLE_SPA__;
  if (isFunction(result)) {
    return result();
  }

  if (isObject(result)) {
    return result;
  }

  throw Error(
    `The micro app must inject the lifecycle("bootstrap" "mount" "unmount") into window['mini-single-spa-${name}']`,
  );
}

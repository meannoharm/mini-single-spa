import { getCurrentAppName } from 'src/utils/application';
import {
  originalDocument,
  originalDocumentAddEventListener,
  originalDocumentRemoveEventListener,
} from 'src/utils/originalEnv';
import { isBoundFunction } from './Sandbox';

type eventMap = Map<string, { listener: any; options: any }[]>;

// 子应用绑定到document上的事件
export const documentEventMap = new Map<string, eventMap>();

// 记录每个子应用绑定到document上的事件
// 在子应用卸载的时候清空他绑定的事件
export function patchDocumentEvents() {
  originalDocument.addEventListener = function addEventListener(
    type: string,
    listener: EventListenerOrEventListenerObject,
    options?: boolean | AddEventListenerOptions,
  ) {
    const appName = getCurrentAppName();
    // react 16 会在第一次 mount() 时绑定 "bound dispatchDiscreteEvent()" 事件到 document 上，后续 mount() 不会重新绑定
    // 所以无需记录这种事件，也不需要移除，以免程序运行不正常
    if (appName && !isBoundFunction(listener as Function)) {
      let currentMap = documentEventMap.get(appName);
      if (!currentMap) {
        currentMap = new Map();
        documentEventMap.set(appName, currentMap);
      }
      if (!currentMap.get(type)) {
        currentMap.set(type, []);
      }
      currentMap.get(type)?.push({ listener, options });
    }

    return originalDocumentAddEventListener.call(originalDocument, type, listener, options);
  };

  originalDocument.removeEventListener = function removeEventListener(
    type: string,
    listener: EventListenerOrEventListenerObject,
    options?: boolean | AddEventListenerOptions,
  ) {
    const appName = getCurrentAppName();
    if (appName && !isBoundFunction(listener as Function)) {
      const currentMap = documentEventMap.get(appName);
      const arr = currentMap?.get(type) || [];
      for (let i = 0, len = arr.length; i < len; i++) {
        if (arr[i].listener === listener) {
          arr.splice(i, 1);
          break;
        }
      }
    }
    return originalDocumentRemoveEventListener.call(originalDocument, type, listener, options);
  };
}

export function releaseAppDocumentEvents(appName: string) {
  const currentMap = documentEventMap.get(appName);
  if (currentMap) {
    for (const [type, arr] of currentMap) {
      for (const item of arr) {
        originalDocumentRemoveEventListener.call(originalDocument, type, item.listener, item.options);
      }
    }
    currentMap.clear();
  }
}

export function releaseDocumentEvents() {
  originalDocument.addEventListener = originalDocumentAddEventListener;
  originalDocument.removeEventListener = originalDocumentRemoveEventListener;
}

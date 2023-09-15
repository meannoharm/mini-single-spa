import { AnyObject } from 'src/types';
import { originalWindow } from 'src/utils/originalEnv';

export function createElement(tag: string, attrs?: AnyObject) {
  const node = document.createElement(tag);
  attrs &&
    Object.keys(attrs).forEach((key) => {
      node.setAttribute(key, attrs[key]);
    });
  return node;
}

export function removeNode(node: Element) {
  node.parentNode?.removeChild(node);
}

let onEventTypes: string[] = [];
export function getEventTypes() {
  if (onEventTypes.length) return onEventTypes;

  for (const key of Object.keys(originalWindow)) {
    if (typeof key === 'string' && key.startsWith('on')) {
      onEventTypes.push(key.slice(2));
    }
  }

  return onEventTypes;
}

export function isUniqueElement(key: string): boolean {
  return /^body$/i.test(key) || /^head$/i.test(key) || /^html$/i.test(key);
}

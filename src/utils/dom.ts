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

const head = document.head;
export function addStyles(styles: string[] | HTMLStyleElement[]) {
  styles.forEach((item) => {
    if (typeof item === 'string') {
      const node = createElement('style', {
        type: 'text/css',
        innerContent: item,
      });
      head.appendChild(node);
    } else {
      head.appendChild(item);
    }
  });
}

export function removeStyles(name: string) {
  const styles = document.querySelectorAll(`style[single-spa-name=${name}]`);
  styles.forEach((style) => {
    removeNode(style);
  });
  return Array.from(styles) as HTMLStyleElement[];
}

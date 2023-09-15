import { getCurrentAppName, getCurrentApp, setCurrentAppName, getApp } from 'src/utils/application';
import { isUniqueElement } from 'src/utils/dom';
import {
  originalAppendChild,
  originalCreateElement,
  originalDocument,
  originalGetElementById,
  originalGetElementsByClassName,
  originalGetElementsByName,
  originalGetElementsByTagName,
  originalInsertBefore,
  originalQuerySelector,
  originalQuerySelectorAll,
} from 'src/utils/originalEnv';

export function patchDocument() {
  Element.prototype.appendChild = function appendChild<T extends Node>(node: T): any {
    return patchAddChild(this, node, null, 'append');
  };

  Element.prototype.insertBefore = function insertBefore<T extends Node>(newNode: T, referenceNode: Node | null): any {
    return patchAddChild(this, newNode, referenceNode, 'insert');
  };

  Document.prototype.createElement = function createElement(
    tagName: string,
    options: ElementCreationOptions,
  ): HTMLElement {
    const appName = getCurrentAppName();
    const element = originalCreateElement.call(this, tagName, options);
    if (appName) {
      element.setAttribute('single-spa-name', appName);
    }
    return element;
  };

  // 将所有查询 dom 的范围限制在子应用挂载的 dom 容器上
  Document.prototype.querySelector = function querySelector(this: Document, selector: string) {
    const app = getCurrentApp();
    if (!app || !selector || isUniqueElement(selector)) {
      return originalQuerySelector.call(this, selector);
    }
    return app.container.querySelector(selector);
  };

  Document.prototype.querySelectorAll = function querySelectorAll(this: Document, selector: string) {
    const app = getCurrentApp();
    if (!app || !selector || isUniqueElement(selector)) {
      return originalQuerySelectorAll.call(this, selector);
    }

    return app.container.querySelectorAll(selector);
  };

  // Element 上没有 getElementById， 只有 document 上有 getElementById 方法
  Document.prototype.getElementById = function getElementById(id: string) {
    return getElementHelper(this, originalGetElementById, 'querySelector', id, `#${id}`);
  };

  Document.prototype.getElementsByClassName = function getElementsByClassName(className: string) {
    return getElementHelper(this, originalGetElementsByClassName, 'getElementsByClassName', className, className);
  };

  // 同上
  Document.prototype.getElementsByName = function getElementsByName(elementName: string) {
    return getElementHelper(this, originalGetElementsByName, 'querySelectorAll', elementName, `[name=${elementName}]`);
  };

  Document.prototype.getElementsByTagName = function getElementsByTagName(tagName: string) {
    return getElementHelper(this, originalGetElementsByTagName, 'getElementsByTagName', tagName, tagName);
  };
}

function getElementHelper(
  parent: Document,
  originFunc: Function,
  funcName: string,
  originSelector: string,
  newSelector: string,
) {
  const app = getCurrentApp();
  if (!app || !originSelector) {
    return originFunc.call(parent, originSelector);
  }
  return (app.container as any)[funcName](newSelector);
}

export function releaseDocument() {
  setCurrentAppName(null);
  Document.prototype.createElement = originalCreateElement;
  Document.prototype.appendChild = originalAppendChild;
  Document.prototype.insertBefore = originalInsertBefore;
  Document.prototype.getElementById = originalGetElementById;
  Document.prototype.getElementsByClassName = originalGetElementsByClassName;
  Document.prototype.getElementsByName = originalGetElementsByName;
  Document.prototype.getElementsByTagName = originalGetElementsByTagName;
  Document.prototype.querySelector = originalQuerySelector;
  Document.prototype.querySelectorAll = originalQuerySelectorAll;
}

const head = originalDocument.head;
const tags = ['STYLE', 'LINK', 'SCRIPT'];
function patchAddChild(parent: Node, child: any, referenceNode: Node | null, type: 'append' | 'insert') {
  const tagName = child.tagName;
  if (!tags.includes(tagName)) {
    return addChild(parent, child, referenceNode, type);
  }

  const appName = child.getAttribute('single-spa-name');
  const app = getApp(appName);
  if (!appName || !app) return addChild(parent, child, referenceNode, type);
}

function addChild(parent: Node, child: any, referenceNode: Node | null, type: 'append' | 'insert') {
  if (type === 'append') {
    return originalAppendChild.call(parent, child);
  }

  return originalInsertBefore.call(parent, child, referenceNode);
}

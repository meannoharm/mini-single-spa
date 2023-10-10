import { Application, Source } from 'src/types';
import { createElement, removeNode } from './dom';
import { isFunction } from './utils';

const urlReg = /^http(s)?:\/\//;
function isCorrectURL(url = '') {
  return urlReg.test(url);
}

export function parseHTMLandLoadSources(app: Application) {
  return new Promise(async (resolve, reject) => {
    const pageEntry = app.pageEntry;
    if (!isCorrectURL(pageEntry)) {
      return reject(`${pageEntry} is not a valid url`);
    }

    let html = '';
    try {
      html = await loadSourceText(pageEntry);
    } catch (err) {
      return reject(err);
    }

    const domParser = new DOMParser();
    const doc = domParser.parseFromString(html, 'text/html');
    const { scripts, styles } = extractScriptsAndStyle(doc, app);

    app.pageBody = doc.body.innerHTML;

    let isStylesDone = false;
    let isScriptsDone = false;

    Promise.all(loadStyles(styles))
      .then((data) => {
        isStylesDone = true;
        app.styles = data;
        if (isScriptsDone && isStylesDone) {
          resolve(app);
        }
      })
      .catch((err) => {
        reject(err);
      });

    Promise.all(loadScripts(scripts))
      .then((data) => {
        isScriptsDone = true;
        app.scripts = data;
        if (isScriptsDone && isStylesDone) {
          resolve(app);
        }
      })
      .catch((err) => {
        reject(err);
      });
  });
}

export const globalLoadedURLs: string[] = [];
function extractScriptsAndStyle(node: Document | Element, app: Application) {
  if (!node.children.length) return { scripts: [], styles: [] };

  let styles: Source[] = [];
  let scripts: Source[] = [];
  for (const child of Array.from(node.children)) {
    const isGlobal = Boolean(child.getAttribute('global'));
    const tagName = child.tagName;

    if (tagName === 'STYLE') {
      removeNode(child);
      styles.push({
        isGlobal,
        value: child.textContent || '',
      });
    } else if (tagName === 'SCRIPT') {
      removeNode(child);
      const src = child.getAttribute('src') || '';
      if (app.loadedURLs.includes(src) || globalLoadedURLs.includes(src)) {
        continue;
      }
      const config: Source = {
        isGlobal,
        type: child.getAttribute('type'),
        value: child.textContent || '',
      };
      if (src) {
        config.url = src;
        if (isGlobal) {
          globalLoadedURLs.push(src);
        } else {
          app.loadedURLs.push(src);
        }
      }

      scripts.push(config);
    } else if (tagName === 'LINK') {
      removeNode(child);
      const href = child.getAttribute('href') || '';
      if (app.loadedURLs.includes(href) || globalLoadedURLs.includes(href)) {
        continue;
      }

      if (child.getAttribute('rel') === 'stylesheet' && href) {
        styles.push({
          url: href,
          isGlobal,
          value: '',
        });
        if (isGlobal) {
          globalLoadedURLs.push(href);
        } else {
          app.loadedURLs.push(href);
        }
      }
    } else {
      const result = extractScriptsAndStyle(child, app);
      scripts = scripts.concat(result.scripts);
      styles = styles.concat(result.styles);
    }
  }

  return { scripts, styles };
}

export function loadSourceText(url: string) {
  return new Promise<string>((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    xhr.onload = (res: any) => {
      resolve(res.target.response);
    };

    xhr.onerror = reject;
    xhr.onabort = reject;
    xhr.open('get', url);
    xhr.send();
  });
}

const head = document.head;
function loadStyles(styles: Source[]) {
  if (!styles.length) return [];
  return styles
    .map((item) => {
      if (item.isGlobal) {
        if (item.url) {
          const link = createElement('link', {
            global: item.isGlobal,
            href: item.url,
            ref: 'stylesheet',
          });

          head.appendChild(link);
        } else {
          const style = createElement('style', {
            global: item.isGlobal,
            type: 'text/css',
            innerContent: item.value,
          });

          head.appendChild(style);
        }
      }
      if (item.url) return loadSourceText(item.url);
      return Promise.resolve(item.value);
    })
    .filter(Boolean);
}

function loadScripts(scripts: Source[]) {
  if (!scripts.length) return [];
  return scripts
    .map((item) => {
      const type = item.type || 'text/javascript';
      if (item.isGlobal) {
        const script = createElement('script', {
          type,
          global: item.isGlobal,
        });

        if (item.url) {
          script.setAttribute('src', item.url);
        } else {
          script.textContent = item.value;
        }

        head.appendChild(script);
      }
      if (item.url) return loadSourceText(item.url);
      return Promise.resolve(item.value);
    })
    .filter(Boolean);
}

export function executeScripts(scripts: string[], app: Application) {
  try {
    scripts.forEach((code) => {
      if (isFunction(app.loader)) {
        // @ts-ignore
        code = app.loader(code);
      }

      const warpCode = `
        ;(function(proxyWindow) {
          with(proxyWindow) {
            (function(window){${code}\n}).call(proxyWindow, proxyWindow)
          }
        })(this);
      `;

      new Function(warpCode).call(app.sandbox.proxyWindow);
    });
  } catch (error) {
    throw error;
  }
}

export async function fetchStyleAndReplaceStyleContent(style: Node, url: string) {
  const content = await loadSourceText(url);
  style.textContent = content;
}

export async function fetchScriptAndExecute(url: string, app: Application) {
  const content = await loadSourceText(url);
  executeScripts([content], app);
}

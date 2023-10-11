import { Application } from 'src/types';
import { nextTick } from 'src/utils/utils';

/**
 * 给每一条 css 选择符添加对应的子应用作用域
 * 1. a {} -> a[single-spa-name=${app.name}] {}
 * 2. a b c {} -> a[single-spa-name=${app.name}] b c {}
 * 3. a, b {} -> a[single-spa-name=${app.name}], b[single-spa-name=${app.name}] {}
 * 4. body {} -> #${子应用挂载容器的 id}[single-spa-name=${app.name}] {}
 * 5. @media @supports 特殊处理，其他规则直接返回 cssText
 */
export default function addCSSScope(style: HTMLStyleElement, app: Application) {
  // 等 style 标签挂载到页面上，给子应用的 style 内容添加作用域
  nextTick(() => {
    // 禁止 style 生效
    (style as any).disabled = true;
    if (style.sheet?.cssRules) {
      style.textContent = handleCSSRules(style.sheet.cssRules, app);
    }

    // 使 style 生效
    (style as any).disabled = false;
  });
}

function handleCSSRules(cssRules: CSSRuleList, app: Application) {
  let result = '';
  Array.from(cssRules).forEach((cssRule) => {
    result += handleCSSRUleHelper(cssRule, app);
  });

  return result;
}

function handleCSSRUleHelper(cssRule: CSSRule, app: Application) {
  let result = '';
  const cssText = cssRule.cssText;
  const selectorText = (cssRule as any).selectorText;
}

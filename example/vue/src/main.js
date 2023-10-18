import Vue from 'vue';
import VueRouter from 'vue-router';
import App from './App.vue';
import routes from './router';
import store from './store';
import '@/styles/reset.css';

Vue.config.productionTip = false;

let router = null;
let app = null;
function render(options = {}) {
  const { container } = options;
  router = new VueRouter({
    base: window.__IS_SINGLE_SPA__ ? '/vue' : '/',
    mode: 'history',
    routes,
  });

  app = new Vue({
    router,
    store,
    render: (h) => h(App),
  }).$mount(container ? container.querySelector('#app') : '#app');
}
export async function mount(options) {
  console.log('[vue] options from main framework', options);
  render(options);
}

export async function unMount() {
  app.$destroy();
  app.$el.innerHTML = '';
  app = null;
  router = null;
}

if (window.__IS_SINGLE_SPA__) {
  window.__SINGLE_SPA__ = {
    mount,
    unMount,
  };

  window.addEventListener('click', () => {
    console.log('window click: vue');
  });

  window.onclick = () => {
    console.log('window onclick: vue');
  };

  document.addEventListener('click', () => {
    console.log('document click: vue');
  });

  document.onclick = () => {
    console.log('document onclick: vue');
  };

  setTimeout(() => {
    console.log('setTimeout');
  }, 3000);

  console.log('vue querySelect: ', document.querySelector('div'));

  window.spaGlobalState.onChange((state, operator, key) => {
    alert(`vue 子应用监听到 spa 全局状态发生了变化: ${JSON.stringify(state)}，操作: ${operator}，变化的属性: ${key}`);
  });

  window.spaGlobalState.onChange((state, operator, key) => {
    alert(
      `第二个 onChange: vue 子应用监听到 spa 全局状态发生了变化: ${JSON.stringify(
        state,
      )}，操作: ${operator}，变化的属性: ${key}`,
    );
  });

  window.spaGlobalState.on('testEvent', () => alert('vue 子应用监听到父应用发送了一个全局事件: testEvent'));
} else {
  render();
}

window.name = 'vue';

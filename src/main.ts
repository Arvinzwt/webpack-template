import Vue from "vue";
import Main from "./Main.vue";
import router from "./router";
import store from "./store";
import '@/assets/style/common.scss';
import '@/plugins/axios';

import ElementUI from 'element-ui';
import 'element-ui/lib/theme-chalk/index.css';
Vue.use(ElementUI);

import Splash from './plugins/Splash';
Vue.use(Splash);

import VueSocketIO from 'vue-socket.io'
Vue.use(new VueSocketIO({
  debug: true,
  connection: 'wss://sit-si.51uuabc.com',
  vuex: {
    store,
    actionPrefix: 'SOCKET_',
    mutationPrefix: 'SOCKET_'
  },
  // @ts-ignore
  options: {
    path: "/socket.io",
    secure: true,
    transports: ['websocket'],        // ['websocket', 'polling']
    reconnection: true,               //启动自动连接
    reconnectionAttempts: 5,          //最大重试连接次数
    reconnectionDelay: 2000,          //最初尝试新的重新连接等待时间
    reconnectionDelayMax: 10000,      //最大等待重新连接,之前的2倍增长
    timeout: 20000
  }
}))

import i18n from './plugins/i18n';
Vue.config.productionTip = false;
new Vue({ router, store, i18n, render: h => h(Main) }).$mount("body");

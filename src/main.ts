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
import md5 from 'js-md5';

Vue.use(new VueSocketIO({
    debug: false,
    connection: (() => {
        let host = process.env.VUE_APP_SOCKET_BASEURL;
        let company_code = "uuabc";
        let timestamp = (new Date()).getTime();
        let company_secret = "13Yy83Aiz5f23h6U57VUBzHEiufwfMnuSpL8VGf4mAYuTnmdrq1iwEBjjxwRuFGH";
        let token = md5(company_code + timestamp + company_secret);
        return `${host}?company_code=${company_code}&timestamp=${timestamp}&token=${token}`
    })(),
    vuex: {
        store,
        actionPrefix: 'SOCKET_',
        mutationPrefix: 'SOCKET_'
    },
    // @ts-ignore
    options: {
        path: "/socket.io",
        autoConnect: true,                //启动自从自动连接
        secure: true,
        transports: ['websocket'],        // ['websocket', 'polling']
        reconnection: true,               //启动重新连接
        reconnectionAttempts: 5,          //最大重试连接次数
        reconnectionDelay: 2000,          //最初尝试新的重新连接等待时间
        reconnectionDelayMax: 10000,      //最大等待重新连接,之前的2倍增长
        timeout: 20000
    }
}))

import {VideoStream, VideoClient} from '@/plugins/WebVideoClient'
Vue.prototype.$videoStream = new VideoStream();
Vue.prototype.$videoClient = new VideoClient();

import MyConsole from '@/plugins/MyConsole.ts'
window.MyConsole = new MyConsole();

import * as main from '@/utils/constants'

window && Object.assign(window, main)

import api from '@/api/index'
Vue.use(api)


import i18n from './plugins/i18n';
Vue.config.productionTip = false;
new Vue({router, store, i18n, render: h => h(Main)}).$mount("#app");

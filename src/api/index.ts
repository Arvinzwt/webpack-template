import Vue from 'vue';
import * as room from '@/api/room'
import * as chat from '@/api/chat.ts'
import * as setting from '@/api/setting'

let api = {};
Object.assign(api, room, chat, setting)

export default {
    api,
    install() {
        Vue.prototype.$api = api;
    }
};
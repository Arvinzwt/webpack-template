<template>

    <body>
        <el-container>
            <el-header v-if="isDev">
                <router-link to="/">{{ $t('home') }}</router-link> |
                <router-link to="/about">{{ $t('about') }}</router-link> |
                <router-link to="/1v1">1v1</router-link> |
                <router-link to="/1v4">1v4</router-link>
            </el-header>
            <router-view />
        </el-container>
        <DebuggerPopover v-if="isDev"
                         class="debug"
                         @locale="localeChangeHandler"></DebuggerPopover>
        <Splash></Splash>
    </body>
</template>
<script lang="ts">
import { Component, Vue } from 'vue-property-decorator';
import { State, Mutation, namespace } from 'vuex-class';

import Splash from './components/Splash.vue';
import DebuggerPopover from './components/DebuggerPopover.vue';

const VuexSocket = namespace('socket');
@Component({
    name: "Main",
    components: { Splash, DebuggerPopover }
})
export default class Main extends Vue {
    private isDev: boolean = true;

    private localeChangeHandler(lang: any) {
        if (this.$i18n) {
            this.$i18n.locale = lang || process.env.VUE_APP_I18N_LOCALE;
        }
    }

    private socketConnected(data: any) {
        this.splash.progress(5, "开始连接");
        console.log('Main subscribe - connected', this.$socket.id, data);
        this.$socket.emit('authenticate', 'token');
    }

    private socketAuthenticated(data: any) {
        console.log('Main subscribe - authenticated', data);
        const joinData: any = {
            room_id: 'td6666',
            user_id: Date.now(),
            role: [1, 2, 3, 4][Math.floor(Math.random() * 4)],
            info: {}
        };
        console.log('join', joinData);
        //join加入房间
        this.$socket.emit('join', joinData);
        setTimeout(() => {
            this.splash.complete('进入成功');
        }, 3000);
        // this.$message({ type: 'success', message: "连接数据" + JSON.stringify(joinData) });
    }

    beforeCreate() {
        console.log("beforeCreate", this.$t('splash'));
    }

    private created() {
        console.log("created", this.$t('splash'));
        this.splash.init(15);
        this.isDev = process.env.NODE_ENV !== 'production';
    }

    private mounted() {
        this.sockets.subscribe('connected', this.socketConnected);
        this.sockets.subscribe('authenticated', this.socketAuthenticated);
    }
}
</script>
<style lang="scss">
html,
body,
body > section {
    padding: 0;
    margin: 0;
    width: 100%;
    height: 100%;

    .el-header {
        text-align: center;
        background: rgb(179, 216, 255);
        line-height: 60px;
    }

    .debug {
        position: fixed;
        right: 10px;
        top: 10px;
    }
}
</style>

<template>
    <el-container id="app" class="jr">
        <!--主体-->
        <router-view/>
        <!--加载进度-->
        <!--<splash-template/>-->
    </el-container>
</template>
<script lang="ts">
import {Component, Vue} from 'vue-property-decorator';
import SplashTemplate from './components/Splash.vue';
import DetectBrowser from '@/utils/detectBrowser';

@Component({
    name: "Main",
    components: {SplashTemplate}
})

export default class Main extends Vue {
    /**
     * @desc 检测浏览器
     * @return true能使用，false不使用
     */
    private static _detectClient() {
        const browser = new DetectBrowser();
        return (browser.supporter() === "chrome") && (browser.compareVersion(browser.supporterVs(), "59") === 1)
    }

    /**
     * @desc 检测浏览器
     */
    private mounted() {
        // 检测浏览器能否使用
        let canUse = Main._detectClient();

        if (canUse) {
            // 连接socket
            this.connectedSocket();
        } else {
            //提示下载
            this.$confirm('您当前使用的是 safari:14.0 浏览器，不符合设备要求，请使用59版以上谷歌浏览器上课', '提示', {
                confirmButtonText: '去下载',
                cancelButtonText: '返回上一页',
                type: 'warning',
                closeOnClickModal: false,
                closeOnPressEscape: false,
                closeOnHashChange: false,
                showClose: false,
            }).then(() => {
                window.open('https://www.uuabc.com/download.html', '_self')
            }).catch(() => {
                this.$router.back()
            });
        }
    }

    /**
     * @desc 连接socket
     */
    private connectedSocket() {
        //初始化进度条
        this.splash.init(15);
        // 连接socket
        this.sockets.subscribe('connected', (data: any) => {
            this.splash.progress(5, "开始连接");
            this.$socket.emit('authenticate', 'token');
        });
        this.sockets.subscribe('authenticated', (data: any) => {
            let {room_id, user_id, role, name, avatar} = this.$route.query;
            const joinData = {
                room_id,
                user_id,
                role,
                info: {
                    name,
                    avatar,
                },
            };
            //join加入房间
            this.$socket.emit('join', joinData);
            setTimeout(() => {
                this.splash.complete('进入成功');
            }, 3000);
        });
    }
}

</script>
<style lang="scss">

</style>

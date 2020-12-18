<template>
    <el-container id="app" class="jr">
        <!--主体-->
        <router-view/>
        <!--加载进度-->
        <splash-template/>
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
        const version = browser.supporterVs();//当前版本号
        const supporter = browser.supporter();//当前载体
        return (supporter === "chrome") && (browser.compareVersion(version, "59") === 1)
    }

    /**
     * @desc 检测浏览器
     */
    private mounted() {
        // 检测浏览器能否使用
        let canUse = Main._detectClient();

        if (!canUse) {
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
}
</script>
<style lang="scss">

</style>

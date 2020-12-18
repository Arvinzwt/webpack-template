<template>
    <el-main ref="whiteboard"
             class="courseware-main"
             style="background: #409EFF">
        <slot>
        </slot>
    </el-main>
</template>
<script lang='ts'>
import { Component, Ref, Vue } from 'vue-property-decorator';
//@ts-ignore
import { DrawType, EventType, SDK } from './../plugins/whiteboard-oriole-sdk.js';
import { namespace } from 'vuex-class';

const VuexTeacher = namespace('Teacher');
@Component({ name: 'WhiteBoard' })
export default class WhiteBoard extends Vue {
    @Ref() private whiteboard: any;
    private orioleSdk: SDK = null;

    public prevPage() {
        this.orioleSdk.prevPage();
    }

    public nextPage() {
        this.orioleSdk.nextPage();
    }

    public changeDrawingMode(drawing: boolean) {
        this.orioleSdk.changeDrawingMode(drawing);
    }

    public clear() {
        this.orioleSdk.clear();
    }

    private mounted() {
        console.log('whiteboard-oriole-this.orioleSdk.min.js', DrawType, EventType);
        console.log(this.whiteboard.$el);
        this.orioleSdk = new SDK(this.whiteboard.$el);

        this.orioleSdk.on(EventType.ACTION, (value: any) => {
            console.log('白板指令', value);
        });

        this.orioleSdk.on(EventType.COURSE_COMPLETE, (url: string) => {
            console.log('>>> this.orioleSdk -a 课件加载完成', url);
            //翻到指定页面
            this.orioleSdk.changePage(12);
        });

        this.orioleSdk.on(EventType.PAGE_CHANGE, (_page: number, _total: number) => {
            console.log('>>> 课件开始翻页', _page, _total);
        });

        this.orioleSdk.on(EventType.PAGE_COMPLETE, (_page: number, _total: number) => {
            console.log('>>> 课件加载完成', _page, _total);

            this.$emit('pageChange', _page, _total);
        });

        this.orioleSdk.on(EventType.PAGE_TIPS, (data: any, _page: number) => {
            console.log('>>> 页面教学提示', data, _page);
            this.$emit('tips', data['msg'], _page);
        });

        this.orioleSdk.on(EventType.CHANGE_DRAWING_MODE, (enabled: boolean) => {
            console.log("模式切换", enabled ? '画图模式' : '课件模式');
        });

        this.orioleSdk.on(EventType.CHANGE_WRITE_MODE, (enabled: boolean, value: any) => {
            console.log("画图权限", enabled);
        });

        this.orioleSdk.on(EventType.CHANGE_AUTH_MODE, (enabled: boolean, value: any) => {
            console.log("互动权限", enabled);
        });

        this.orioleSdk.on(EventType.ERROR, (_type: string, _message: string) => {
            console.log('>>> 错误', _type, _message);
        });

        this.orioleSdk.load("//courseware.uuabc.com/coursewares-uc/b024ab86-14a5-4e48-af14-f2d617e58b4c/v6/index.html");
    }
}
</script>
<style lang='scss' scoped>

</style>
<template>
    <!-- 摄像头或录音设备未授权，谈出提示窗 -->
    <div class='jr-device-forbid'>
        <el-dialog title="未授权设备提示" :visible.sync="dialogVisible" width="30%" :before-close="handleClose" append-to-body>
            <div class="jr-forbid-tip">
                <p>摄像头或麦克风访问被<font color="red">拒绝</font>，请检查浏览器设置... </p>
                <p>摄像头和麦克风同时【允许】后，才可以正常上课~</p>
            </div>

            <div class="jr-forbid-help">
                如需帮助，请联系您的班主任或拨打<font color="#76b4f7">400-163-6161</font>热线电话。
            </div>

            <div slot="footer" class="jr-forbid-footer">
                <el-button type="primary" @click="onConcatUs">联系我们</el-button>
                <el-button type="danger" @click="refresh">刷 新</el-button>
            </div>
        </el-dialog>
    </div>
</template>
<script lang="ts">
import { Component, Vue, Prop } from "vue-property-decorator";
@Component({
    name: "DeviceForbid",
})
export default class DeviceForbid extends Vue {
    @Prop() private isDeviceForbid: boolean = false;
    
    get dialogVisible() {
        return this.isDeviceForbid;
    }

    /**
     * @desc 刷新
     */
    private refresh() {
        window.location.reload();
        this.$emit('close');
    }


    /**
     * @desc 客服
     */
    private customerService() {
        let easemobim = (window as any).easemobim || {};
        easemobim.config = {
            hide: true,
            autoConnect: true,
            // user: {
            //     username: classRoom.user.uuid,
            //     password: classRoom.user.uuid
            // },
            visitor: {
                trueName: this.$route.query.name,
                userNickname: this.$route.query.name,
            }
        }

        if (easemobim.bind) {
            easemobim.bind({configId: '472e0fec-c18c-4b10-b9f2-8254195f1301'});
        } else {
            console.warn('Waiting for easemob.js loading to completed!');
        }
    }

    /** 
     * 联系我们
    */
    private onConcatUs() {
        this.customerService();
        this.handleClose();
    }

    /**
     * 关闭当前弹窗
     */
    private handleClose() {
        this.$emit('close');
    }
    
}
</script>
<style lang='scss'>
.jr-forbid-tip, .jr-forbid-help {
    text-align: center;
    font-size: 19px;
    margin-bottom: 26px;
    & p:first-child {
        margin-bottom: 12px;
    }
}
.jr-forbid-footer {
    text-align: center;
    .el-button {
        margin-right: 20px;
    }
}
</style>
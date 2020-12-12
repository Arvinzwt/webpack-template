<template>
    <div class="jr-setting-wrap">
        <span class="ml-2 icon-btn iconfont iconshezhi" @click="openSetting"></span>


        <el-dialog
            title=""
            :visible.sync="dialogVisible"
            width="40%"
            append-to-body
            :before-close="onCloseSetting">
            <div class="jr-setting-wrap">
                <div class="jr-setting-camera">
                    <video id="jr-setting-video" playsinline autoplay muted></video>
                </div>

                <div class="jr-setting-devices">
                    <div class="title">摄像头</div>
                    <el-select v-model="selectCamera"  placeholder="请选择摄像头">
                        <el-option
                            v-for="item in cameraOptions"
                            :key="item.value"
                            :label="item.label"
                            :value="item.deviceId">
                        </el-option>
                    </el-select>

                    <div class="title">音频</div>
                    <el-select v-model="selectMic"  placeholder="请选择音频" @change="onChangeMic">
                        <el-option
                            v-for="item in micOptions"
                            :key="item.value"
                            :label="item.label"
                            :value="item.deviceId">
                        </el-option>
                    </el-select>
                </div>
                
            </div>
            <span slot="footer" class="dialog-footer">
                <el-button @click="onCloseSetting">取 消</el-button>
                <el-button type="primary" @click="onCloseSetting">确 定</el-button>
            </span>
        </el-dialog>
    </div>
</template>
<script lang="ts">
import {Component, Vue} from "vue-property-decorator";
interface IOption {
    label: string;
    deviceId: number;
}
@Component({
    name: "Setting",
})
export default class Setting extends Vue {
    private dialogVisible: boolean = false;
    private cameraOptions: Array<IOption> = [{
        label: '',
        deviceId: 0
    }];

    private micOptions: Array<IOption> = [{
        label: '',
        deviceId: 0
    }];;
    private selectCamera: string = '';
    private selectMic: string = '';

    /** 
     * 修改音频设备
    */
    private onChangeMic(val:any) {
        this.$videoStream.close();
        this.$videoStream.microphoneId = val;

        this.$videoStream.createStream().then((stream:any) => {
            this.$videoStream.display();
        }).catch((error:any) => {
            console.error(error)
            // that.camera_error = that.$t("video_change_error");
        });
    }



    private onCloseSetting() {
        this.$videoStream.close();
        this.dialogVisible = false;
    }

    private openSetting() {
        this.dialogVisible = true;
        this.init();
    }

    private init() {
        let videoStream = this.$videoStream;
        

        this.$nextTick(() => {
            videoStream.videoElement = document.querySelector("#jr-setting-video");
        })

        videoStream.init().then((list:any) => {
            this.cameraOptions = videoStream.cameras;
            this.micOptions = videoStream.microphones;
            this.selectCamera = videoStream.cameraId;
            this.selectMic = videoStream.microphoneId;
            videoStream.createStream().then((stream:any) => {
                videoStream.display();
            }).catch((err:any) => {
                console.error(err)
            });
        });
        
        
    }   
}
</script>
<style lang="scss">
.jr-setting-wrap {
    display: flex;
}
.jr-setting-camera {
    width: 200px;
    height: 200px;
    #jr-setting-video {
        width: 100%;
    }
}

</style>
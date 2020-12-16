<template>
    <!-- 设备切换组件，使用element, dialog -->
    <div class="jr-setting-wrap">
        <span class="ml-2 icon-btn iconfont iconshezhi" @click="openSetting"></span>

        <el-dialog :visible.sync="dialogVisible" width="35%" append-to-body :before-close="onCloseSetting">
            <div class="jr-setting-wrap">
                <!-- 视频挂载id -->
                <div class="jr-setting-camera">
                    <video id="jr-setting-video" playsinline autoplay muted></video>
                </div>

                <div class="jr-setting-devices">
                    <div class="title">摄像头</div>
                    <el-select v-model="selectCamera" placeholder="请选择摄像头" @click="onChangeCameras">
                        <el-option v-for="item in cameraOptions" :key="item.value" :label="item.label" :value="item.deviceId">
                        </el-option>
                    </el-select>

                    <div class="voice-title">音频</div>
                    <el-select v-model="selectMic" placeholder="请选择音频" @change="onChangeMic">
                        <el-option v-for="item in micOptions" :key="item.value" :label="item.label" :value="item.deviceId">
                        </el-option>
                    </el-select>

                    <!--声音状态-->
                    <ul class="jr-video-item-icon icon4">
                        <li v-for="(item, idx) in 10" :key="idx" :class="{'active': idx < level }"></li>
                    </ul>
                </div>

            </div>

            <span slot="footer" class="dialog-footer">
                <el-button @click="onCloseSetting">取 消</el-button>
                <el-button type="primary" @click="onSureSet">确 定</el-button>
            </span>
        </el-dialog>
    </div>
</template>
<script lang="ts">
import { VideoStream } from "@/plugins/WebVideoClient";
import { Component, Vue, Watch } from "vue-property-decorator";
interface IOption {
    label: string;
    deviceId: number;
}
@Component({
    name: "Setting",
})
export default class Setting extends Vue {
    private setStream: any; // 设置组件里的视频流
    private intervalId: any;
    private level: number = 0;
    private dialogVisible: boolean = false;

    private micOptions: Array<IOption> = [];
    private cameraOptions: Array<IOption> = [];

    private selectCamera: string = "";
    private selectMic: string = "";

    /**
     * 修改音频设备
     */
    private onChangeMic(val: any) {
        console.log(val);

        this.setStream.close();
        this.setStream.microphoneId = val;

        this.setStream
            .createStream()
            .then((stream: any) => {
                this.setStream.display();
                clearInterval(this.intervalId);
                this.intervalId = setInterval(() => {
                    this.level = Math.round(stream.getAudioLevel() * 10);
                }, 100);
            })
            .catch((error: any) => {
                console.error(error);
                // that.camera_error = that.$t("video_change_error");
            });
    }

    /**
     * 修改摄像头
     */
    private onChangeCameras(val: any) {
        this.setStream.close();
        this.setStream.cameraId = val;

        this.setStream
            .createStream()
            .then((stream: any) => {
                this.setStream.display();
                clearInterval(this.intervalId);
                this.intervalId = setInterval(() => {
                    this.level = Math.round(stream.getAudioLevel() * 10);
                }, 100);
            })
            .catch((error: any) => {
                console.error(error);
                // that.camera_error = that.$t("video_change_error");
            });
    }
    /**
     * 用户点击确定
     * 将重新选择的新的设备id，赋值给videoStream实例重新发布
     */
    private onSureSet() {
        if (!this.setStream) {
            console.error("no setStream");
        }
        this.$videoStream.cameraId = this.setStream.cameraId;
        this.$videoStream.microphoneId = this.setStream.microphoneId;

        this.$videoClient.stop(this.$videoStream.localStream);
        this.$videoStream.close();

        this.$videoStream.createStream().then((stream: any) => {
            this.$videoStream.display();
            this.$videoClient.publish(stream);

            this.$api.saveDevice(this.$videoStream.cameraId, this.$videoStream.cameraId)
                .then((res:any) => {
                    console.log(res);
                })

            this.onCloseSetting();
        });
    }

    /**
     * 关闭按钮，弹窗关闭
     * 将设置里的视频流关闭；
     */
    private onCloseSetting() {
        this.setStream.close();
        this.dialogVisible = false;
    }

    private openSetting() {
        this.dialogVisible = true;
        this.init();
    }

    /**
     * new VideoStream给新的id挂载；
     * 作为两个独立的摄像头元素
     */
    private init() {
        this.setStream = new VideoStream();

        this.$nextTick(() => {
            this.setStream.videoElement = document.querySelector(
                "#jr-setting-video"
            );
        });

        this.setStream.init().then((list: any) => {
            this.cameraOptions = this.setStream.cameras;
            this.micOptions = this.setStream.microphones;

            this.setStream
                .createStream()
                .then((stream: any) => {
                    this.setStream.cameraId = this.$videoStream.cameraId;
                    this.setStream.microphoneId = this.$videoStream.microphoneId;

                    this.setStream.display();
                    this.selectCamera = this.setStream.cameraId;
                    this.selectMic = this.setStream.microphoneId;

                    // 定时器获取音量
                    clearInterval(this.intervalId);
                    this.intervalId = setInterval(() => {
                        this.level = Math.round(stream.getAudioLevel() * 10);
                    }, 200);
                })
                .catch((err: any) => {
                    console.error(err);
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
    margin-right: 20px;
    border: 1px solid #ccc;
    background-color: #ccc;
    #jr-setting-video {
        width: 100%;
    }
}
.jr-setting-devices {
    .title {
        margin-bottom: 16px;
    }
    .voice-title {
        line-height: 40px;
    }
}
.jr-video-item-icon {
    display: flex;
    align-items: center;
    justify-content: center;
    color: #fff;
    &.icon4 {
        display: flex;
        flex-direction: column;
        transform: rotate(-90deg);
        margin-left: -90px;
        li {
            display: block;
            width: 6px;
            height: 8px;
            border-radius: 2px;
            background-color: #999;

            &.active {
                background-color: #42b983;
            }
        }
    }
}
</style>
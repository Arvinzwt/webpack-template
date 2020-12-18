<template>
    <!-- 本地视频窗口 -->
    <div class='local-camera' >

        <div class="local-video_wrap" v-show="isShowCamera">
            <div class="video-wrap">
                <video id="local-video" playsinline autoplay muted>浏览器不支持video播放</video>
            </div>

            <!--声音状态-->
            <Volume></Volume>

            <div class="video-item-placeholder type1"></div>

            <!-- 画笔/禁言 -->
            <div class="video-item-icon opera-list opera-student" v-if="urlQuery.role == UserType.STUDENT">
                <span class="iconfont" :class="studentLimit.isPen ? 'iconhuabi' : 'iconjinyonghuabi'"></span>
                <span class="iconfont" :class="studentLimit.isMagic ? 'iconzhizhen' : 'iconcursor-'"></span>
                <span class="iconfont" :class="studentLimit.isTalk ? 'iconhuatong' : 'iconjinyan'"></span>
            </div>


        </div>

        <!-- 缺省图 -->
        <div class="video-item" v-show='!isShowCamera'>
            <div class="video-item-placeholder type2"></div>
        </div>

        <!-- 本地流姓名 -->
        <div class="video-item-icon icon2" v-show="urlQuery.name">
            <span class="text-ellipsis">{{ urlQuery.name }}</span>
        </div>
    </div>

</template>
<script lang="ts">
import { Component, Prop, Vue } from "vue-property-decorator";

import Volume from "@/components/boxs/volumeBox.vue";

import MyConsole from "@/plugins/MyConsole";
@Component({
    name: "cameraLocal",
    components: {
        Volume,
    },
})
export default class Local extends Vue {
    @Prop() private device?: any;

    private intervalId?: any;
    private level: number = 0;
    private isShowCamera: string | number = 0;
    private studentLimit: any = {
        isPen: true,
        isMagic: true,
        isTalk: true,
    };

    get microphones() {
        return this.$videoStream ? this.$videoStream.microphones : [];
    }

    get cameras() {
        return this.$videoStream ? this.$videoStream.cameras : [];
    }

    get urlQuery() {
        return this.$route.query;
    }

    // 用户类型；
    get UserType() {
        return window.UserType;
    }

    private mounted() {
        // this.appToken = decodeURI(this.token).replace(/\s/g, '+');
        // console.log(this.token)
    }

    private createLocalStream(token: string) {
        let videoStream = this.$videoStream;
        if (this.device) {
            this.$videoStream.cameraId = this.device.camera;
            this.$videoStream.microphoneId = this.device.microphone;
        }

        videoStream.videoElement = document.querySelector("#local-video");
        videoStream.createStream().then((stream: any) => {
            videoStream.display();
            this.$emit("complate", stream);

            this.isShowCamera = videoStream.options.streamID;
        })
        .catch((err: any) => {
            this.$emit("error", err);
        });
    }

    public init(token: string = "") {
        let videoStream = this.$videoStream;
        videoStream.init().then(() => {
            if (!this.microphones.length) {
                console.error("NOT FOUND microphones");
            }

            if (!this.cameras.length) {
                console.error("NOT FOUND cameras");
            }

            this.createLocalStream(token);
        })
        .catch((err: any) => {
            console.error(err);
        });
    }
}
</script>
<style lang='scss'>
$localHeight: 294px;

.local-camera {
    position: relative;
    display: flex;
    margin-top: 15px;
    width: $localHeight;

    .local-video_wrap {
        position: relative;
        width: 100%;
        height: $localHeight;
        border-radius: 20px;
        overflow: hidden;
        #local-video {
            position: absolute;
            z-index: -1;
            width: 100%;
            height: 100%;
        }
    }
}




.video-item {
    height: $localHeight;
}

</style>
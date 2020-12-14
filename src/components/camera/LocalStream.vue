<template>
    <!-- 本地视频窗口 -->
    <div class='jr-local-camera'>

        <div class="jr-local-video_wrap" v-show="cameraId">
            <div class="video-wrap">
                <video id="jr-local-video" playsinline autoplay muted>浏览器不支持video播放</video>
            </div>

            <!--声音状态-->
            <ul class="jr-video-item-icon icon4">
                <li v-for="(item, idx) in 10" :key="idx" :class="{'active': idx < level }"></li>
            </ul>

            <div class="jr-video-item-placeholder type1"></div>
            
            <!-- 画笔/禁言 -->
            <div class="jr-video-item-icon jr-opera-list jr-opera-student" v-if="urlQuery.role == UserType.STUDENT">
                <span class="iconfont" :class="studentLimit.isPen ? 'iconhuabi' : 'iconjinyonghuabi'"></span>
                <span class="iconfont" :class="studentLimit.isMagic ? 'iconmofabang' : 'iconmofabang'"></span>
                <span class="iconfont" :class="studentLimit.isTalk ? 'iconhuatong' : 'iconjinyan'"></span>
            </div>


        </div>

        <!-- 缺省图 -->
        <div class="jr-video-item mt-3" v-show='!cameraId' >
            <div class="jr-video-item-placeholder type2"></div>
        </div>
        
        <!-- 本地流姓名 -->
        <div class="jr-video-item-icon icon2" v-show="urlQuery.name">
            <span class="text-ellipsis">{{ urlQuery.name }}</span>
        </div>
    </div>

</template>
<script lang="ts">
import { Component, Prop, Vue } from "vue-property-decorator";
// import teacher from "@/components/camera/teacher.vue";

import MyConsole from "@/plugins/MyConsole";
@Component({
    name: "cameraLocal",
    components: {},
})
export default class Local extends Vue {
    @Prop() private device?: any;

    private intervalId?: any;
    private level: number = 0;
    private cameraId: string | number = 0;
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

        videoStream.videoElement = document.querySelector("#jr-local-video");
        videoStream.createStream().then((stream: any) => {
            this.cameraId = videoStream.cameraId;
            
            videoStream.display();
            this.$emit("complate", stream);

            clearInterval(this.intervalId);
            this.intervalId = setInterval(() => {
                this.level = Math.round(stream.getAudioLevel() * 10);
            }, 220);

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
$localHeight: 270px;

.jr-local-camera {
    position: relative;
    display: flex;
    margin-top: 15px;
    width: $localHeight;

    .jr-local-video_wrap {
        position: relative;
        width: 100%;
        height: $localHeight;
        border-radius: 20px;
        overflow: hidden;
        #jr-local-video {
            position: absolute;
            z-index: -1; 
            width: 100%;
            height: 100%;
        }
    }
}




.jr-video-item {
    height: $localHeight;
}

</style>
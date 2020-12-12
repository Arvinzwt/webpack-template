<template>
    <div class="jr-stream-wrap">
        <cameraRemote ref="remote"></cameraRemote>

        <cameraLocal ref="LocalStream" @complate="localVideoComplate" @error="localVideoError"></cameraLocal>

    </div>
</template>
<script lang="ts">
import { Component, Vue } from "vue-property-decorator";
import cameraLocal from "@/components/camera/LocalStream.vue";
import cameraRemote from "@/components/camera/Remote.vue";
import { State, Mutation, namespace } from "vuex-class";

// import hasAudioPlay from "@/utils/hasAudioPlay";
// @ts-ignore
import autoplay from "@/assets/autoplay/autoplay.mp3";
const VuexUser = namespace("Teacher");
@Component({
    name: "cameraHome",
    components: {
        cameraLocal,
        cameraRemote,
    },
})
export default class Index extends Vue {
    // private appToken: string = "";
    // private channel: any = this.$route.query.channel;
    // private token: any = this.$route.query.token;
    // private uid: any = this.$route.query.uid;
    // private query: any = this.$route.query;
    private appid: string = "82dc0c2602d24cb9b5098c2c7f8ce76f";

    @VuexUser.State("nickname") private nickname: string | undefined;

    get urlQuery():any {
        return this.$route.query;
    }

    private mounted() {
        this.init(this.appid);
    }

    private handleError(err: any) {
        console.error(err);
    }

    private localVideoError(err: any) {
        console.error(err);
    }

    private localVideoComplate() {
        const that = this;
        var audio = document.createElement("audio");
        audio.src = autoplay;
        var promise = audio.play();
        audio.volume = 0.01;
        console.log(promise);

        if (promise) {
            promise
                .then( () => {
                    this.initVideoClient(this.urlQuery.channel, this.urlQuery.appToken, this.urlQuery.uid);
                })
                .catch((err) => {
                    this.$alert("是否开始学习", "标题名称", {
                        confirmButtonText: "确定",
                        callback: (action) => {
                            audio.play();
                        },
                    });
                    console.log("autoplay 策略检查:不可用");
                });
        }
        // this.initVideoClient(this.channel, this.appToken, this.uid);
    }

    private joinClient(videoClient: any) {
        videoClient
            .connect(this.urlQuery.channel, this.urlQuery.token, this.urlQuery.user_id)
            .then((token: string, id: number, type: string) => {
                console.log("connect success");
                this.$videoClient.publish(this.$videoStream.localStream);
            })
            .catch((req: any) => {
                console.warn("conect fail" + req);
            });
    }

    // 初始化本地client
    private initVideoClient(channel: string, appToken: string, uid: string) {
        let videoClient = this.$videoClient;
        videoClient
            .init(this.appid)
            .then(() => {
                console.warn("client init success");
                this.$nextTick(() => {
                    // @ts-ignore
                    this.$refs["remote"].init(videoClient);
                });
                this.joinClient(videoClient);
            })
            .catch((err: any) => {
                console.error("初始化本地client" + err);
            });
    }

    private init(appid: string = ""): void | boolean {
        this.appid = appid;
        if (!this.urlQuery.token || !this.urlQuery.channel) {
            console.warn("url 缺少参数，无法获取视频流");
            return false;
        }
        if (+this.urlQuery.is) {
            // @ts-ignore
            this.$refs["LocalStream"].init(this.token);
        }
    }
}
</script>
<style lang="scss">
.jr-stream-wrap {
    // position: relative;
    // height: 100%;
    display: flex;
    flex-direction: column;
    align-items: center;
}
</style>
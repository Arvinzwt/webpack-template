<template>
    <el-main class="jr-stream-wrap video-main">
        <template v-if="urlQuery.member_type == undefined || !roleRank">
            <cameraRemote :ref="'remote' + user_id" :userId='user_id'></cameraRemote>
            <cameraLocal ref="LocalStream" @complate="localVideoComplate" @error="localVideoError"></cameraLocal>
        </template>

        <template v-if="urlQuery.member_type == UserType.PARENT || urlQuery.member_type == UserType.ADMIN">
            <cameraRemote style="margin-bottom: 10px" :ref="'remote' + item" :userId="item" v-for="(item, idx) in enterUids" :key="idx">
            </cameraRemote>
        </template>

        <DeviceForbid :isDeviceForbid='isDeviceForbid' @close="onCloseDevice" />

    </el-main>
</template>
<script lang="ts">
import { Component, Vue } from "vue-property-decorator";
import cameraLocal from "@/components/camera/LocalStream.vue";
import cameraRemote from "@/components/camera/Remote.vue";
import DeviceForbid from "@/components/Dialog/DeviceForbid.vue";
import { namespace } from "vuex-class";

// @ts-ignore
import autoplay from "@/assets/autoplay/autoplay.mp3";
const VuexUser = namespace("Teacher");
@Component({
    name: "cameraHome",
    components: {
        cameraLocal,
        cameraRemote,
        DeviceForbid,
    },
})
export default class Index extends Vue {
    private appid: string = "82dc0c2602d24cb9b5098c2c7f8ce76f";
    private user_id: string = "";
    private enterUids: any = ["", ""];
    private isDeviceForbid: boolean = false;
    @VuexUser.State("nickname") private nickname: string | undefined;

    get urlQuery(): any {
        return this.$route.query;
    }

    get UserType(): any {
        return window.UserType;
    }

    get v1(): any {
        return this.$store.state.Socket.v1;
    }

    /**
     * url中的老师，学生  -> 0
     * 管理员, 家长      -> 1
     */
    get roleRank(): number {
        let temp = this.urlQuery.member_type == this.UserType.PARENT || this.urlQuery.member_type == this.UserType.ADMIN ? 1 : 0;
        return temp;
    }

    private mounted() {
        this.init(this.appid);
        this.bindStream();
    }

    private onCloseDevice() {
        this.isDeviceForbid = false;
    }

    private handleError(err: any) {
        console.error(err);
    }

    // 本地视频错误；
    private localVideoError(err: any) {
        console.error(err);
        if (err === "NotAllowedError") {
            this.isDeviceForbid = true;
        }
    }

    private localVideoComplate() {
        const that = this;
        var audio = document.createElement("audio");
        audio.src = autoplay;
        var promise = audio.play();
        audio.volume = 0.01;

        if (promise) {
            promise
                .then(() => {
                    this.initVideoClient();
                })
                .catch((err) => {
                    this.$alert("是否开始学习", "标题名称", {
                        confirmButtonText: "确定",
                        callback: (action) => {
                            audio.play();
                            this.initVideoClient();
                        },
                    });
                    console.log("autoplay 策略检查:不可用");
                });
        }
    }

    private bindStream() {
        let videoClient = this.$videoClient;

        videoClient.on("stream", (id: number, type: number, token: string) => {
            this.user_id = token;

            if (!this.enterUids.includes(token)) {
                this.enterUids = this.enterUids.filter((ele: any) => ele);
                this.enterUids.push(token);

                if (this.enterUids.length == 1) this.enterUids.push("");
            }

            this.$nextTick(() => {
                let refDom: any = this.$refs[`remote${token}`];
                refDom = [refDom].flat(3);
                refDom[0].bind(id, type, !this.roleRank);
            });
        });

        videoClient.on("removed", (id: number, type: number, token: string) => {
            console.log("STREAM REMOVED :::", id, type, token);
            let refDom: any = this.$refs[`remote${token}`];

            if (this.roleRank) {
                refDom[0].removeLeaveClass(token);
            } else {
                refDom.removeLeaveClass(token);
            }

            videoClient.stopPlayer(token);
        });
    }

    private joinClient(videoClient: any) {
        // token member_type+user_id,声网的token可以获取权限和user_id;
        let token = this.urlQuery.member_type + this.urlQuery.user_id;

        videoClient
            .connect(this.urlQuery.room_id, this.urlQuery.token, token)
            .then((token: string, id: number, type: string) => {
                if (!this.roleRank) {
                    this.$videoClient.publish(this.$videoStream.localStream);
                }
            })
            .catch((req: any) => {
                console.warn("conect fail" + req);
            });
    }

    // 初始化本地client
    private initVideoClient() {
        let videoClient = this.$videoClient;
        videoClient
            .init(this.appid)
            .then(() => {
                this.joinClient(videoClient);
            })
            .catch((err: any) => {
                console.error("初始化本地client error" + err);
            });
    }

    private async init(appid: string = "") {
        this.appid = appid;

        if (!this.urlQuery.token || !this.urlQuery.room_id || !this.urlQuery.member_type) {
            console.warn("url 缺少参数，无法获取视频流");
            return false;
        }
        if (+this.urlQuery.is) {
            if (this.roleRank) {
                console.warn("家长/管理员不创建流，直接订阅");
                this.localVideoComplate();
                return false;
            }
            let { data } = await this.$api.getDevice();

            // @ts-ignore
            this.$refs["LocalStream"].init(this.token);
        }
    }
}
</script>
<style lang="scss">
</style>
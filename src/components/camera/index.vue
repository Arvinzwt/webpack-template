<template>
    <div class="jr-stream-wrap">
        <template v-if="urlQuery.role == undefined || (urlQuery.role == UserType.STUDENT || urlQuery.role == UserType.TEACHER)">
            <cameraRemote ref="remote"></cameraRemote>
            <cameraLocal ref="LocalStream" @complate="localVideoComplate" @error="localVideoError"></cameraLocal>
        </template>

        <template v-if="urlQuery.role == UserType.PARENT">
            <cameraRemote style="margin-bottom: 10px" :ref="'remote' + item.user_id" :userId="item.user_id" v-for="(item, idx) in v1.usrList" :key="idx"></cameraRemote>
        </template>

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
    private appid: string = "82dc0c2602d24cb9b5098c2c7f8ce76f";
    @VuexUser.State("nickname") private nickname: string | undefined;

    get urlQuery():any {
        return this.$route.query;
    }

    get UserType():any {
        return window.UserType
    }

    get v1():any {        
        return this.$store.state.Socket.v1;
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
        // this.initVideoClient(this.channel, this.appToken, this.uid);
    }

    private joinClient(videoClient: any) {
        videoClient
            .connect(this.urlQuery.channel, this.urlQuery.token, this.urlQuery.user_id)
            .then((token: string, id: number, type: string) => {
                console.log("connect success");
                if(this.urlQuery.role == this.UserType.STUDENT || this.urlQuery.role == this.UserType.TEACHER) { 
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
                console.warn("client init success");
                this.$nextTick(() => {
                    
                    if(this.urlQuery.role == this.UserType.STUDENT || this.urlQuery.role == this.UserType.TEACHER) {
                        // @ts-ignore
                        this.$refs[`remote`].init(videoClient);
                    } else {
                        
                        for (let index = 0; index < this.v1.usrList.length; index++) {
                            let ele = this.v1.usrList[index];                           
                            this.$nextTick(() => {
                                // @ts-ignore
                                this.$refs[`remote${ele.user_id}`][0].init(videoClient);
                            })
                        }
                    }



 
                    
                });
                this.joinClient(videoClient);
            })
            .catch((err: any) => {
                console.error("初始化本地client" + err);
            });
    }

    private init(appid: string = ""): void | boolean {
        this.appid = appid;
        console.log(this.urlQuery.role);
        
        if (!this.urlQuery.token || !this.urlQuery.channel || !this.urlQuery.role) {
            console.warn("url 缺少参数，无法获取视频流");
            return false;
        }
        if (+this.urlQuery.is ) {
            if(this.urlQuery.role == this.UserType.PARENT || this.urlQuery.role == this.UserType.ADMIN) {
                console.warn('家长/管理员不创建流，直接订阅');
                this.localVideoComplate();
                return false;
            }
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
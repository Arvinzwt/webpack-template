<template>
    <div class="jr-stream-wrap">
        <template v-if="urlQuery.role == undefined || !roleRank">
            <cameraRemote :ref="'remote' + user_id" :userId='user_id'></cameraRemote>
            <cameraLocal ref="LocalStream" @complate="localVideoComplate" @error="localVideoError"></cameraLocal>
        </template>

        <template v-if="urlQuery.role == UserType.PARENT || urlQuery.role == UserType.ADMIN">
            <cameraRemote style="margin-bottom: 10px" 
                :ref="'remote' + item" 
                :userId="item" 
                v-for="(item, idx) in enterUids" 
                :key="idx">
            </cameraRemote>
        </template>

        <DeviceForbid :isDeviceForbid='isDeviceForbid' @close="onCloseDevice" />

    </div>
</template>
<script lang="ts">
import { Component, Vue } from "vue-property-decorator";
import cameraLocal from "@/components/camera/LocalStream.vue";
import cameraRemote from "@/components/camera/Remote.vue";
import DeviceForbid from "@/components/Dialog/DeviceForbid.vue";
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
        DeviceForbid
    },
})
export default class Index extends Vue {
    private appid: string = "82dc0c2602d24cb9b5098c2c7f8ce76f";
    private user_id: string = '';
    private enterUids: any = [];
    private isDeviceForbid:boolean = false;
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

    
    /** 
     * url中的老师，学生  -> 0
     * 管理员, 家长      -> 1
    */
    get roleRank(): number {
        let temp = this.urlQuery.role == this.UserType.PARENT || this.urlQuery.role == this.UserType.ADMIN
            ? 1 : 0;
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
        if(err === 'NotAllowedError') {
            this.isDeviceForbid = true;
        }
    }

    private bindStream() {
        let videoClient = this.$videoClient;

        videoClient.on("stream", (id:number, type:number, token:string) => {
            this.user_id = token;
            if(!this.enterUids.includes(token)) {
                this.enterUids.push(token);
            }

            

            this.$nextTick(() => {
                let refDom:any = this.$refs[`remote${token}`];
                refDom = [refDom].flat(3);
                console.log(refDom);

                if(this.roleRank) {
                    refDom[0].bind(token);
                } else {
                    refDom[0].bind(token, 1);
                }
            })
            
        })

        videoClient.on("removed", (id:number, type:number, token:string) => {
            console.log("STREAM REMOVED :::", id, type, token);

            let refDom:any = this.$refs[`remote${token}`];
            
            if(this.roleRank) {
                refDom[0].removeLeaveClass(token);
            } else {
                refDom.removeLeaveClass(token);
            }

            videoClient.stopPlayer(token);
        });
    }

    private localVideoComplate() {
        const that = this;
        var audio = document.createElement("audio");
        audio.src = autoplay;
        var promise = audio.play();
        audio.volume = 0.01;
        
        if (promise) {
            this.$alert("是否开始学习", "提示", {
                confirmButtonText: "确定",
                callback: (action) => {
                    audio.play();
                    this.initVideoClient();
                },
            });
            return false;
            promise.then( () => {
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

    private joinClient(videoClient: any) {
        videoClient
            .connect(this.urlQuery.channel, this.urlQuery.token, this.urlQuery.user_id)
            .then((token: string, id: number, type: string) => {
                if(!this.roleRank) { 
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

    private init(appid: string = ""): void | boolean {
        this.appid = appid;
        
        if (!this.urlQuery.token || !this.urlQuery.channel || !this.urlQuery.role) {
            console.warn("url 缺少参数，无法获取视频流");
            return false;
        }
        if (+this.urlQuery.is ) {
            if(this.roleRank) {
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
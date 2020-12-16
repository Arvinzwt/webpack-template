<template>
    <div class='jr-camera-teacher' @mouseenter="onMouseenter" @mouseleave="onMouseLeave">
        <!-- 远程视频流容器 -->
        <video class="remotevideo" :id=" 'remotevideo' + userId" playsinline autoplay muted v-show="isRemote"></video>
        

        <!-- 视频未接入/未显示，显示的缺省画面 -->
        <div class="jr-video-item" v-show="!isRemote">
            <div class="jr-video-item-placeholder" :class="urlQuery.role == 1 ? 'type1' : 'type2'"></div>        
        </div>

        <!-- 右上角wifi信号，钻石数目 -->
        <div class="jr-video-item-icon icon1">
            <div class="jr-remote-wifi-wrap">
                <img :src="require('@/assets/img/icon/signal_'+ levelClass +'.png')" alt="">
            </div>
            
            <span class="zuanshi-wrap" v-if="urlQuery.role == UserType.TEACHER && remoteInfo.info && remoteInfo.info.name && isRemote" @click="addDiamond">
                <span class="iconfont iconlv_zuanshi_fill"></span>
                <span>{{ v1.diamond }}</span>
            </span>
        </div>

        <!-- 左下角用户名 -->
        <div class="jr-video-item-icon icon2" v-show="remoteInfo.user_id">
            <span class="text-ellipsis">{{ remoteInfo.info && remoteInfo.info.name }}</span>
        </div>

        <!-- private -->
        <!-- 老师，可以控制学生，魔法棒，禁言，画笔 -->
        <div class="jr-video-item-icon jr-opera-list jr-opera-teacher"  v-if="isRemote && urlQuery.role == UserType.TEACHER">
            <span class="iconfont" :class="studentLimit.isPen ? 'iconhuabi' : 'iconjinyonghuabi'" @click="changePen"></span>

            <span class="iconfont" :class="studentLimit.isMagic ? 'iconzhizhen' : 'iconcursor-'" @click="changeMagic"></span>

            <span class="iconfont" :class="studentLimit.isTalk ? 'iconhuatong' : 'iconjinyan'" @click="changeTalk"></span>
        </div>

        <!-- 管理员，老师，显示私聊 -->
        <div class="jr-parent-limit" v-show="urlQuery.role == UserType.ADMIN && isShowChat">
            <private-chat/>
            <div class="jr-parent-block jr-local-refresh" @click="refreshTeacher">刷新</div>
        </div>

        <!-- 家长，学生弹窗 -->
        <div class="jr-parent-limit" v-if="urlQuery.role == UserType.ADMIN && isShowStudent">
            <div class="jr-opera-list jr-opera-student">
                <span class="iconfont" :class="studentLimit.isMagic ? 'iconmaikefeng-tianchong' : 'iconmaikefeng-jingyin-tianchongsvg'" @click="changeMagic"></span>
                <span class="iconfont" style="margin-left: 20px;" :class="studentLimit.isTalk ? 'iconshipin' : 'iconshipinjinzhi'" @click="changeTalk"></span>
            </div>

            <div class="jr-parent-block jr-local-refresh" @click="refreshStudent">刷新</div>
        </div>

        <!-- 家长， 学生，右下角画笔/禁言 -->
        <div class="jr-video-item-icon jr-opera-list jr-opera-student" v-if="urlQuery.role == UserType.PARENT && remoteInfo.role == UserType.STUDENT">
            <span class="iconfont" :class="studentLimit.isPen ? 'iconhuabi' : 'iconjinyonghuabi'"></span>
            <span class="iconfont" :class="studentLimit.isMagic ? 'iconzhizhen' : 'iconcursor-'"></span>
            <span class="iconfont" :class="studentLimit.isTalk ? 'iconhuatong' : 'iconjinyan'"></span>
        </div>

        

    </div>
</template>
<script lang="ts">
import { Component, Vue, Prop } from "vue-property-decorator";
import { namespace } from "vuex-class";
import animation from '@/utils/animation';
import PrivateChat from '@/components/Dialog/PrivateChat.vue';
import { Logger } from "agora-rtc-sdk";

const VuexSocket = namespace("Socket");

@Component({
    name: "Remote",
    components: {
        PrivateChat
    }
})
export default class Teacher extends Vue {
    private isRemote: boolean = false;      //  远程数据流创建成功
    private levelClass: number = 3;         //  信号级别
    private isShowChat: boolean = false;    //  判断是否显示私聊框
    private isShowStudent: boolean = false;
    private remoteInfo: any = {
        user_id: '',
        info: {}
    };
    private studentLimit: any = {
        isPen: true,
        isMagic: true,
        isTalk: true,
    };
    @VuexSocket.State("v1") private v1: any;

    @Prop() private userId:any;

    get urlQuery() {
        // @ts-ignore
        return this.$route.query;
    }

    get UserType() {
        return window.UserType
    }

    private mounted() {
        this.onNetworkLevel();
    }

    /**
     * 管理员刷新老师
     */
    refreshTeacher() {
        // 发给数据端
        this.$socket.emit('share', {
            event: 'refresh',
            data: {
                type: 2
            }
        });
    }

    /**
     * 管理员刷新学生
     */
    refreshStudent() {
        // 发给数据端
        this.$socket.emit('share', {
            event: 'refresh',
            data: {
                type: 1
            }
        });
    }

    /** 
     * 将mouse事件放在最外层
     * #remotevideo 的zindex为-1；其他定位样式才能在video上
    */
    private onMouseenter() {        
        if(this.isRemote && this.urlQuery.role == this.UserType.ADMIN ){
            console.log(this.remoteInfo);
            
            if(this.remoteInfo.role == this.UserType.TEACHER) {
                this.isShowChat = true
            }

            if(this.remoteInfo.role == this.UserType.STUDENT) {
                this.isShowStudent = true;
            }
            
        }
    }

    private onMouseLeave() {
        if(this.isRemote && this.urlQuery.role == this.UserType.ADMIN ){
            if(this.remoteInfo.role == this.UserType.TEACHER) {
                this.isShowChat = false
            }

            if(this.remoteInfo.role == this.UserType.STUDENT) {
                this.isShowStudent = false;
            }
        }
    }

    /** 
     * 私聊
     * role为4(UserType.ADMIN)才能点击私聊；
     * 私聊对象为老师
    */
    private chatPrivateHandle() {
        if(this.urlQuery.role !== this.UserType.ADMIN) return;
        // @ts-ignore
        // 获取的id 为 dispaly + userid;
        // var userId: any = document.getElementById(`remotevideo${this.userId}`).querySelector("div").id;
        // console.log(userId);
    }



    /** 
     * 老师修改学生权限
    */
    private changePen() {
        this.studentLimit['isPen'] = !this.studentLimit['isPen'];

    }

    private changeMagic() {
        this.studentLimit['isMagic'] = !this.studentLimit['isMagic'];
    }

    private changeTalk() {
        this.studentLimit['isTalk'] = !this.studentLimit['isTalk'];
    }

    /** 
     * 
    */

    /**
     * @desc 添加钻石
     */
    private addDiamond() {
        animation.diamond().then((res:any) => {
            // 发给数据端
            let total = this.v1.diamond + 1;
            this.$socket.emit('share', {
                event: 'flower',
                data: {
                    id: this.$route.query.p,
                    total,
                    value: 1,
                }
            });
            // 修改自己
            this.$store.commit('Socket/SOCKET_v1_diamond', total)
        })
    }


    /** 
     * 移除离开用户
     * token为用户id,与display组成当前用户id
    */
    private removeLeaveClass(token:string) {
        // var parent:any = document.getElementById(`remotevideo${this.userId}`);
        // var child:any = document.getElementById(`display${token}`);
        // parent.removeChild(child);
        this.isRemote = false;
    }

    /** 
     * 监听视频流信号
    */
    private onNetworkLevel() {
        let videoClient = this.$videoClient;
        videoClient.on('lostlevel', (user: any, audio:number, video:any) => {
            let level = video.level;
            let levelClass = 2;
            if (level == 1) {
                levelClass = 3;
            } else if (level == 2 || level == 3) {
                levelClass = 2;
            } else {
                levelClass = 1;
            }

            this.levelClass = levelClass;
        })
    }

    /** 
     * 
    */
    private getUserInfo(uid: string) {
        console.log(uid);
        if(!uid) {
            console.error('远程流未传入user_id');
            return false;
        }

        if(!this.v1.usrList.length && uid) {
            console.error('获取不到身份信息，请检查socket是否有问题');
            return false;
        }
        
        this.remoteInfo = this.v1.usrList.filter((item:any)=> item.user_id == uid)[0];
        console.log(this.remoteInfo);
    }

    bind(user_id:any = '', role?: number) {
        let videoClient = this.$videoClient;
    
        this.isRemote = true;
        this.getUserInfo(user_id);

        console.log(user_id);
        let temp =  user_id;
        console.log(document.querySelector(`#remotevideo${temp}`));
        
        
        videoClient.display(document.querySelector(`#remotevideo${temp}`), user_id);
    }

    public init(videoClient:any) {
      const that = this;    
    //   videoClient.display(document.querySelector(`#remotevideo${temp}`), token);
    //   videoClient.on("stream", (id:number, type:number, token:string) => {
    //     console.warn("STREAM ADD :::", id, type, token);
    //     this.$emit('newStream', token)
    //     that.isRemote = true;
    //     that.getUserInfo(token);

    //     let temp = that.userId ? that.userId : '';
    //     videoClient.display(document.querySelector(`#remotevideo${temp}`), token);
    //     if (type == 2) {
    //       // that.status = "加载中...";
    //     };
    //     // that.getUserId();

    //   });

      
    }
}
</script>
<style lang='scss'>
$localHeight: 270px;

.jr-camera-teacher {
    position: relative;
    width: $localHeight;
    height: $localHeight;
    border-radius: 20px;
    overflow: hidden;
    .remotevideo {
        position: relative;
        width: 100%;
        height: 100%;
        z-index: -1;
    }
    .jr-remote-wifi-wrap {
        img {
            width: 14px;
        }
    }
    .zuanshi-wrap {
        user-select: none;
        cursor: pointer;
        margin-left: 8px;
        & span:first-child {
            margin-right: 4px;
        }
    }
    .jr-parent-limit {
        position: absolute;
        top: 0;
        width: 100%;
        z-index: 9;
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        height: 100%;
        background-color: rgba(0, 0, 0, .2);
        border-radius: 10px;
        .jr-opera-list {
            margin-bottom: 16px;
        }
        
        .jr-parent-block {
            display: inline-block;
            width: 70px;
            line-height: 26px;
            text-align: center;
            background-color: #3e72e0;
            border-radius: 15px;
            cursor: pointer;
            &:first-child {
                margin-bottom: 30px;;
            }
        }
    }
    
}
</style>
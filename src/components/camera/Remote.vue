<template>
    <div class='jr-camera-teacher' @mouseenter="onMouseenter" @mouseleave="onMouseLeave">
        <!-- 远程视频流容器 -->
        <video class="remotevideo" :id=" userId ? 'remotevideo' + userId : 'remotevideo'" playsinline autoplay muted v-show="isRemote"></video>
        

        <!-- 视频未接入/未显示，显示的缺省画面 -->
        <div class="jr-video-item" v-show="!isRemote">
            <div class="jr-video-item-placeholder" :class="urlQuery.role == 1 ? 'type1' : 'type2'"></div>        
        </div>

        <!-- 右上角wifi信号，钻石数目 -->
        <div class="jr-video-item-icon icon1">
            <div class="jr-remote-wifi-wrap">
                <img :src="require('@/assets/img/icon/signal_'+ levelClass +'.png')" alt="">
            </div>
            
            <span class="zuanshi-wrap" v-if="urlQuery.role == UserType.TEACHER && remoteInfo.name && isRemote" @click="addDiamond">
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

            <span class="iconfont" :class="studentLimit.isMagic ? 'iconmofabang' : 'iconmofabang'" @click="changeMagic"></span>

            <span class="iconfont" :class="studentLimit.isTalk ? 'iconhuatong' : 'iconjinyan'" @click="changeTalk"></span>
        </div>

        <!-- 管理员，显示私聊 -->
        <div class="jr-parent-limit" v-if="urlQuery.role == UserType.ADMIN && isShowChat">
            <div class="jr-parent-block jr-local-chat" @click="chatPrivateHandle">私聊</div>
            <div class="jr-parent-block jr-local-refresh">刷新</div>
        </div>

        

    </div>
</template>
<script lang="ts">
import { Component, Vue, Prop } from "vue-property-decorator";
import { namespace } from "vuex-class";
import animation from '@/utils/animation';

const VuexSocket = namespace("Socket");

@Component({
    name: "Remote",
    components: {
    }
})
export default class Teacher extends Vue {
    private isRemote: boolean = false;      //  远程数据流创建成功
    private levelClass: number = 3;         //  信号级别
    private isShowChat: boolean = false;    //  判断是否显示私聊框

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
     * 将mouse事件放在最外层
     * #remotevideo 的zindex为-1；其他定位样式才能在video上
    */
    private onMouseenter() {        
        if(this.isRemote && this.urlQuery.role == this.UserType.ADMIN ){
            this.isShowChat = true
        }
    }

    private onMouseLeave() {
        if(this.isRemote && this.urlQuery.role == this.UserType.ADMIN ){
            this.isShowChat = false;
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
                    id: this.$route.query.user_id,
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

    private getUserInfo() {
        console.log(!this.userId || !this.v1.usrList.length);
        
        if(!this.userId || !this.v1.usrList.length) {
            // this.remoteInfo = this.v1.usrList[0]
            return ;
        }
        console.log('------');
        
        console.log(this.v1.usrList);
        
        this.remoteInfo = this.v1.usrList.filter((item:any)=> item.user_id == this.userId)[0];
        console.log(this.remoteInfo);
        
    }

    public init(videoClient:any) {
      const that = this;      
      videoClient.on("stream", function (id:number, type:number, token:string) {
        console.log("STREAM ADD :::", id, type, token);
        that.isRemote = true;
        that.getUserInfo();
        let temp = that.userId ? that.userId : '';
        videoClient.display(document.querySelector(`#remotevideo${temp}`), token);
        if (type == 2) {
          // that.status = "加载中...";
        };
        // that.getUserId();

      });

      videoClient.on("removed", function (id:number, type:number, token:string) {
        console.log("STREAM REMOVED :::", id, type, token);
        that.removeLeaveClass(token);

        if (type == 2) {
          // that.status = "老师正在积攒能量";
          videoClient.stopPlayer(token);
        };
      });
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
        .jr-parent-block {
            display: inline-block;
            width: 70px;
            line-height: 26px;
            text-align: center;
            background-color: #b53c36;
            border-radius: 15px;
            cursor: pointer;
            &:first-child {
                margin-bottom: 30px;;
            }
        }
    }
    
}
</style>
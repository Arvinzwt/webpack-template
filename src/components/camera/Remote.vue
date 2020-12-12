<template>
    <div class='jr-camera-teacher'>
        <div id="remotevideo" v-show="isRemote"></div>
        <div class="jr-video-item" v-show="!isRemote">
            <div class="jr-video-item-placeholder type1"></div>
            <div class="jr-video-item-icon icon1">
                <span class="iconfont iconwifi"></span>
                <span class="iconfont iconlv_zuanshi_fill"></span>
            </div>
            
        </div>

        <!-- 当前角色老师，可以控制学生，魔法棒，禁言，画笔 -->
        <div class="jr-video-item-icon remote-huabi"  v-if="isRemote && urlQuery.role == UserType.TEACHER">
            <span class="iconfont" :class="studentLimit.isPen ? 'iconhuabi' : 'iconjinyonghuabi'" @click="changePen"></span>

            <span class="iconfont" :class="studentLimit.isMagic ? 'iconmofabang' : 'iconmofabang'" @click="changeMagic"></span>

            <span class="iconfont" :class="studentLimit.isTalk ? 'iconhuatong' : 'iconjinyan'" @click="changeTalk"></span>
        </div>


        <div class="jr-video-item-icon icon2" v-show="userInfo.name">
            <span class="text-ellipsis">{{ userInfo.name }}</span>
        </div>

    </div>
</template>
<script lang="ts">
import { Component, Vue } from "vue-property-decorator";
import { namespace } from "vuex-class";
const VuexSocket = namespace("Socket");

@Component({
    name: "Remote",
    components: {
    }
})
export default class Teacher extends Vue {
    private isRemote: boolean = false;
    private studentLimit: any = {
        isPen: true,
        isMagic: true,
        isTalk: true,
    };
    @VuexSocket.State("v1") private v1: any;

    get userInfo() {
        let userInfo = this.v1.usrList.length ? this.v1.usrList[0].info : {}
        return userInfo;
    }

    get urlQuery() {
        return this.$route.query;
    }

    get UserType() {
        return window.UserType
    }


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
     * 移除离开用户
     * token为用户id,与display组成当前用户id
    */
    private removeLeaveClass(token:string) {
        var parent:any = document.getElementById("remotevideo");
        var child:any = document.getElementById(`display${token}`);
        parent.removeChild(child);
        this.isRemote = false;
    }

    public init(videoClient:any) {
      const that = this;
      videoClient.on("stream", function (id:number, type:number, token:string) {
        console.log("STREAM ADD :::", id, type, token);
        that.isRemote = true;
        videoClient.player(token, document.querySelector('#remotevideo'));
        if (type == 2) {
          // that.status = "加载中...";
        };
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
    #remotevideo {
        position: relative;
        width: 100%;
        height: 100%;
        z-index: -1;
    }
    .remote-huabi {
        display: flex;
        flex-direction: column;
        bottom: 50px;
        left: 8px;
        span {
            padding: 5px;
            border-radius: 50%;
            background-color: #3e72e0;
            margin-bottom: 8px;
            cursor: pointer;
        }
    }
    
}
</style>
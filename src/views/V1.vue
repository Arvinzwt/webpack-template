<template>
    <!--1v1-->
    <el-container class="jr-page jr-v1" :style="jrStyle" direction="vertical">
        <!--头-->
        <header-template></header-template>
        <!--主干-->
        <el-container class="jr-main">
            <!--视频-->
            <el-aside class="jr-video" width="294px">
                <!--视频流-->
                <el-main class="jr-video-main">
                    <cameraHome></cameraHome>
                </el-main>
                <!--教师按钮-->
                <el-footer v-if="user_type==='2'" class="jr-video-footer" height="80px">
                    <el-button type="danger" @click="addHeart">
                        <span class="mr-2 iconfont iconxin"></span>
                        <span>Heart</span>
                    </el-button>
                    <el-button type="primary" @click="addDiamond">
                        <span class="mr-2 iconfont iconlv_zuanshi_fill"></span>
                        <span>Diamond</span>
                    </el-button>
                </el-footer>
            </el-aside>
            <!--课件-->
            <el-container class="jr-courseware">
                <!--画板-->
                <el-main class="jr-courseware-main">
                    heart:{{ v1.heart }}
                    <ul>
                        <li v-for="(item,index) in v1.usrList" :key="index">{{ item }}</li>
                    </ul>
                </el-main>
                <!--教师按钮-画板案板-->
                <el-footer v-if="user_type==='2'&&!showHeart" class="jr-courseware-footer type1" height="80px">
                    <el-button-group>
                        <el-button type="primary" icon="el-icon-message"></el-button>
                        <el-button type="primary" icon="el-icon-message"></el-button>
                        <el-button type="primary" icon="el-icon-message"></el-button>
                        <el-button type="primary" icon="el-icon-message"></el-button>
                    </el-button-group>
                    <el-pagination
                            background
                            layout="prev, pager, next"
                            :total="1000">
                    </el-pagination>
                </el-footer>
                <!--教师按钮-激励案板-->
                <el-footer v-if="user_type==='2'&&showHeart" class="jr-courseware-footer type2" height="80px">
                    <el-button-group>
                        <el-button v-for="(item,index) in heartList"
                                   :key="index"
                                   type="primary" icon=""
                                   @click="heartHandle(item,index)">{{ item.name }}
                        </el-button>
                    </el-button-group>
                </el-footer>
                <!--学生按钮-->
                <el-footer v-if="user_type==='1'" class="jr-courseware-footer type2" height="80px">
                    <el-button-group>
                        <el-button type="primary" icon="el-icon-message"></el-button>
                        <el-button type="primary" icon="el-icon-message"></el-button>
                        <el-button type="primary" icon="el-icon-message"></el-button>
                        <el-button type="primary" icon="el-icon-message"></el-button>
                    </el-button-group>
                </el-footer>
            </el-container>
            <!--聊天-->
            <el-aside class="jr-chat" width="216px">
                <!--教师tips-->
                <el-header v-if="user_type==='2'" class="jr-chat-tips mb-3" height="200px">
                    <!--no tips-->
                    <div class="jr-chat-tips-placeholder"></div>
                    <!--标题-->
                    <div class="jr-chat-tips-icon">Teaching Tips</div>
                </el-header>
                <!--聊天内容-->
                <el-container class="jr-chat-main">
                    <el-main class="jr-chat-main-wrap">
                        <!--icon1-->
                        <div class="jr-chat-main-icon icon1">Message</div>

                        <!--禁止发送消息-老师才有-->
                        <div v-if="user_type==='2'" class="jr-chat-main-icon icon2" @click="muteHandle">
                            <el-tooltip effect="dark" content="disabled chatting" placement="right-start">
                                <span class="iconfont iconicon_message" :class="v1.mute?'':'active'"></span>
                            </el-tooltip>
                        </div>

                        <!--聊天内容-->
                        <ul class="jr-chat-main-scroll" ref="scrollRef">
                            <li class="jr-chat-main-item" v-for="(item,index) in v1.chat" :key="index">
                                <h6 class="name" :class="item.type==='2'?'self':''">{{ item.name }}</h6>
                                <p class="txt" :class="item.type==='2'?'self':''">{{ item.data }}</p>
                            </li>
                        </ul>
                    </el-main>
                    <!--发送聊天-->
                    <el-footer class="jr-chat-footer" height="160px" v-if="user_type==='2'">
                        <div class="wrap">
                            <el-input v-model="chat" @keyup.enter.native="sendChat" type="textarea"
                                      placeholder="请输入"></el-input>
                            <el-button size="mini" type="primary" round @click="sendChat">立刻发送</el-button>
                        </div>
                    </el-footer>
                    <el-footer class="jr-chat-footer" height="160px" v-if="user_type==='1'">
                        <div class="wrap" v-if="!v1.mute">
                            <el-input v-model="chat" @keyup.enter.native="sendChat" type="textarea"
                                      placeholder="请输入"></el-input>
                            <el-button size="mini" type="primary" round @click="sendChat">立刻发送</el-button>
                        </div>
                        <div class="wrap disabled" v-if="v1.mute">老师已开启禁用</div>
                    </el-footer>
                </el-container>
            </el-aside>
        </el-container>
    </el-container>
</template>
<script lang="ts">
import {Component, Vue, Watch} from "vue-property-decorator";
import HeaderTemplate from '@/components/Header.vue';
import cameraHome from '@/components/camera/index.vue';
import animation from '@/utils/animation';
import {namespace} from 'vuex-class';

const VuexTeacher = namespace('Teacher');

@Component({
    name: "V1",
    components: {
        cameraHome,
        HeaderTemplate
    }
})
export default class V1 extends Vue {
    private chat: string = '';//聊天输入值
    private showHeart: boolean = false;//是否显示激励面板
    private heartList = [//激励动画列表
        {name: 'Good job', src: '/assets/goodjob/goodjob.html', delay: '2000'},
        {name: 'Bingo', src: '/assets/bingo/bingo.html', delay: '2000'},
        {name: 'You can do it', src: '/assets/youcandoit/youcandoit.html', delay: '2000'},
        {name: 'Congratulation', src: '/assets/congratulations/congratulations.html', delay: '2000'},
        {name: 'Keep it up', src: '/assets/keepitup/keepitup.html', delay: '2000'},
        {name: 'Amazing', src: '/assets/amazing/amazing.html', delay: '2000'},
    ]
    @VuexTeacher.Action('setTime') public setTime: any;
    @VuexTeacher.State('time') public keepTime: any;            // 上课时长

    // 计算页面缩放比例-参数
    private jrStyle = {
        width: '1340px',
        height: '735px',
        transform: 'scale(1) translate(-50%,-50%)'
    }

    // v1 Socket参数
    get v1(): any {
        return this.$store.state.Socket.v1
    }

    // 用户身份-1:学生, 2:老师, 3:家长, 4:管理员
    get user_type(): string | (string | null)[] {
        return this.$route.query.role
    }

    /**
     * @desc 监听聊天列表，将列表滚动到底部
     */
    @Watch("v1.chat")
    private chatChange() {
        this.$nextTick(() => {
            const scrollRef: any = this.$refs['scrollRef']
            scrollRef.scrollTop = scrollRef.scrollHeight;
            console.log(this.v1)
        })
    }

    /**
     * @desc 监听钻石动画参数，同步各个客户端
     */
    @Watch("v1.diamond")
    private diamondChange(val: number) {
        animation.diamond().then(res => {
        })
    }

    /**
     * @desc 监听激励动画参数，同步各个客户端
     */
    @Watch("v1.heart")
    private heartChange(val: number) {
        let item = this.heartList[val - 1];
        animation.heart(item.name).then(res => {
        })
    }

    /**
     * @desc 监听连接状态，如果断线，显示断线
     */
    @Watch("v1.connection")
    private connectionChange(val: number) {
        if (val === 3) {
            this.$confirm('您已在其他设备上登录，当前客户端已下线', '下线', {
                confirmButtonText: '离开教室',
                cancelButtonText: '取消',
                showCancelButton: false,
                type: 'warning',
                closeOnClickModal: false,
                closeOnPressEscape: false,
                closeOnHashChange: false,
                showClose: false,
            }).then(() => {
                window.open('https://uat-member-frontend.51uuabc.com/#/login?redirect=%2F', '_self')
            }).catch(() => {

            });
        }
    }

    /**
     * @desc 计算页面缩放比例--触发
     */
    private mounted() {
        if (!this.keepTime) {
            this.setTime();
        }

        this.pageResize()
        window.onresize = () => {
            this.pageResize()
        }
    }

    /**
     * @desc 计算页面缩放比例-算法
     */
    private pageResize() {
        //当前显示窗口宽高
        let clientWidth = document.body.clientWidth;
        let clientHeight = document.body.clientHeight;
        //主干部分宽高
        let wrapWidth = parseFloat(this.jrStyle.width.substr(0, this.jrStyle.width.length - 2));
        let wrapHeight = parseFloat(this.jrStyle.height.substr(0, this.jrStyle.height.length - 2));

        //计算缩放比例
        let scale = clientWidth / clientHeight < wrapWidth / wrapHeight ? clientWidth / wrapWidth : clientHeight / wrapHeight;
        Object.assign(this.jrStyle, {
            transform: `scale(${scale}) translate(-50%,-50%)`
        })
    }

    /**
     * @desc 发送聊天数据
     */
    private sendChat() {
        if (this.chat) {
            let chat = this.chat;//聊天内容
            let {room_id, user_id, role, name, avatar} = this.$route.query;

            // 发给数据端
            this.$socket.emit('share', {
                event: 'chat',
                data: chat
            });

            // 修改自己
            this.$store.commit('Socket/SOCKET_v1_chat', {
                room_id,
                user_id,
                role,
                name,
                avatar,
                type: role,
                data: this.chat,
                event: "chat",
            })

            //清空聊天内容
            this.chat = '';
        } else {
            this.$message.error('请输入聊天内容');
        }
    }

    /**
     * @desc 禁言
     */
    private muteHandle() {
        // 发给数据端
        this.$socket.emit('share', {
            event: 'chatting',
            data: {"enabled": !this.v1.mute}
        });

        // 修改自己
        this.$store.commit('Socket/SOCKET_v1_mute', !this.v1.mute)
    }

    /**
     * @desc 添加钻石
     */
    private addDiamond() {
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
    }

    /**
     * @desc 调用激励面板
     */
    private addHeart() {
        this.showHeart = !this.showHeart;
    }

    /**
     * @desc 触发激励
     */
    private heartHandle(item: any, index: number) {
        // 发给数据端
        let ind = index + 1;
        this.$socket.emit('share', {
            event: 'excit',
            data: {
                delay: item.delay,
                index: ind,
                src: item.src
            }
        });

        // 修改自己
        this.$store.commit('Socket/SOCKET_v1_heart', ind)
    }

    /**
     * @desc 禁用/启用画笔
     */
    private disableBrush() {

    }

    /**
     * @desc marker一下
     */
    private markerHandle() {

    }

}

</script>
<style lang="scss">
</style>

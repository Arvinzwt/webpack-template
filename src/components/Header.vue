<template>
    <!--公用头部-->
    <el-header class="jr-header" height="58px">
        <div class="jr-header-left">
            <img class="jr-header-logo" src="/image/zh_CH_logo.png" alt="精锐在线|少儿">
            <div v-if="user_type!=='2'&&user_type!=='4'" class="jr-header-tag ml-4">
                <span class="text-color-brand iconfont iconlv_zuanshi_fill"></span>
                <b class="ml-2">{{ v1.diamond }}</b>
            </div>
        </div>
        <div class="jr-header-right">
            <span class="ml-2">课程编号：134117992</span>
            <span class="ml-2">课程时长:30 分</span>
            <span class="ml-4 jr-header-tag">
                <!-- <i class="text-color-success iconfont" :class="levelClass"></i> -->
                <img :src="require('@/assets/img/icon/signal_'+ levelClass +'.png')" alt="">
                <b class="ml-2">{{ keepTime }}</b>
            </span>
            <span v-if="user_type==='4'" @click="showUserList" class="ml-5 icon-btn iconfont iconLC_icon_user_group_fill"></span>
            <span v-if="user_type==='2'||user_type==='1'" @click="courseTips" class="ml-2 icon-btn iconfont iconlingdang"></span>
            <SettingDialog v-if="user_type==='2'||user_type==='1'"></SettingDialog>
            <span v-if="user_type==='2'||user_type==='1'" @click="customerService" class="ml-2 icon-btn iconfont iconerji"></span>
            <span @click="refresh" class="ml-2 icon-btn iconfont iconshuaxin1"></span>
            <span @click="logout" class="ml-2 icon-btn iconfont icontuichu"></span>
            <debugger-popover v-if="isDev" class="ml-3" @locale="localeChangeHandler"></debugger-popover>
        </div>

        <!--用户列表/消息提示-->
        <el-dialog class="" :visible.sync="dialog.show"
                   :close-on-click-modal="false"
                   :append-to-body="true"
                   custom-class="jr-dialog" width="500px">
            <!--用户列表-->
            <div v-if="dialog.type===1">
                <el-table :data="v1.usrList" style="width: 100%">
                    <el-table-column prop="role" label="类型">
                        <template v-slot="scope">
                            <span v-if="scope.row.role==='1'">学生</span>
                            <span v-if="scope.row.role==='2'">教师</span>
                            <span v-if="scope.row.role==='3'">家长</span>
                            <span v-if="scope.row.role==='4'">管理员</span>
                        </template>
                    </el-table-column>
                    <el-table-column prop="user_id" label="ID"/>
                    <el-table-column prop="info.name" label="名称"/>
                    <el-table-column prop="" label="平台"/>
                    <el-table-column prop="" label="地址"/>
                </el-table>
            </div>
            <!--消息提示-->
            <div class="dialog.type===2">
                请阅读提示
            </div>
            <!--弹窗尾部-->
            <div slot="footer" class="dialog-footer">
                <el-button size="mini" @click="dialog.show=false" type="primary">确 定</el-button>
            </div>
        </el-dialog>
    </el-header>
</template>

<script lang="ts">
import {Component, Vue} from "vue-property-decorator";
import DebuggerPopover from '@/components/DebuggerPopover.vue';
import SettingDialog from '@/components/Dialog/SettingDialog.vue';
import { namespace } from 'vuex-class';
const VuexTeacher = namespace('Teacher');

@Component({
    name: "Header",
    components: {
        SettingDialog,
        DebuggerPopover
    }
})

export default class Header extends Vue {
    private isDev: boolean = true;//当前环境是否为开发环境
    private dialog: any = {
        show: false,
        type: null,
    }
    private levelClass: number = 2;
    @VuexTeacher.State('time') public keepTime: any;            // 上课时长

    // v1 Socket参数
    get v1(): any {
        return this.$store.state.Socket.v1
    }

    // 用户身份-1:学生, 2:老师, 3:家长, 4:管理员
    get user_type(): string | (string | null)[] {
        return this.$route.query.role
    }

    /**
     * @desc 初始判定当前环境
     */
    private created() {
        let that = this;
        this.isDev = process.env.NODE_ENV !== 'production';
        this.networkStatus();
    }

    private networkStatus() {
        let videoClient = this.$videoClient;
        //本地网络质量
        videoClient.on('network', (uplink:any, downlink:any) => {
            var levelClass = 2;         // 3 信号最好；1 信号最差
            if([1,2].includes(uplink) && [1,2].includes(downlink)) {
                levelClass = 3;
            } else if((uplink <= 5 && uplink > 2) || (downlink <= 5 && downlink > 2)) {
                levelClass = 2;
            }  else {
                levelClass = 1;
            }
            this.levelClass = levelClass;
        });
    }

    /**
     * @desc 判定当前语言
     * @param lang[any]
     */
    private localeChangeHandler(lang: any) {
        if (this.$i18n) {
            this.$i18n.locale = lang || process.env.VUE_APP_I18N_LOCALE;
        }
    }

    /**
     * @desc 刷新
     */
    private refresh() {
        this.$confirm('刷新教室会重新进教室页面奥', '刷新教室', {
            confirmButtonText: '刷新',
            cancelButtonText: '取消',
            type: 'warning',
            closeOnClickModal: false,
            closeOnPressEscape: false,
            closeOnHashChange: false,
            showClose: false,
        }).then(() => {
            window.location.reload();
        }).catch(() => {
        });
    }

    /**
     * @desc 下课
     */
    private logout() {
        // TODO 添加课时是否超时判定
        if (this.user_type === '2') {
            this.$confirm('这堂课还有时间，请不要离开教室', '课时结束', {
                confirmButtonText: '确定',
                showCancelButton: false,
                type: 'warning',
                closeOnClickModal: false,
                closeOnPressEscape: false,
                closeOnHashChange: false,
                showClose: false,
            }).then(() => {
            }).catch(() => {
            });
        } else {
            this.$confirm('确认要退出教室吗？退出后还可以再次进入哦~', '离开教室', {
                confirmButtonText: '退出',
                cancelButtonText: '取消',
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
     * @desc 用户列表
     */
    private showUserList() {
        this.dialog.type = 1;
        this.dialog.show = true;
    }

    /**
     * @desc 课程提示
     */
    private courseTips() {
        // TODO 接口条用提示
        this.dialog.type = 2;
        this.dialog.show = true;
    }

    /**
     * @desc 客服
     */
    private customerService() {
        let easemobim = (window as any).easemobim || {};
        easemobim.config = {
            hide: true,
            autoConnect: true,
            // user: {
            //     username: classRoom.user.uuid,
            //     password: classRoom.user.uuid
            // },
            visitor: {
                trueName: this.$route.query.name,
                userNickname: this.$route.query.name,
            }
        }

        if (easemobim.bind) {
            easemobim.bind({configId: '472e0fec-c18c-4b10-b9f2-8254195f1301'});
        } else {
            console.warn('Waiting for easemob.js loading to completed!');
        }
    }
}
</script>

<style lang="scss">
.jr-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    color: #FFFFFF;
    font-size: 12px;

    .jr-header-left, .jr-header-right {
        display: flex;
        align-items: center;

        .jr-header-logo {
            height: 40px;
            width: 300px;
        }

        .jr-header-tag {
            background: rgba(255, 255, 255, .25);
            padding: 4px 8px;
            border-radius: 15px;
            display: flex;
            align-items: center;
            font-size: 14px;
        }

        .iconfont {
            font-size: 20px;
        }

        .icon-btn {
            border-radius: 50%;
            background: #3e71e0;
            width: 30px;
            height: 30px;
            cursor: pointer;

            &:hover {
                opacity: 0.8;
            }
        }
    }
}
</style>

<template>
    <!--教师/管理员-私聊-->
    <div class="jr-private-chat">
        <slot>
            <!--<el-link @click="openDialog">私聊</el-link>
                        <el-link @click="refreshStudent">刷新1</el-link>
                        <el-link @click="refreshTeacher">刷新2</el-link>-->
        </slot>
        <!--弹窗-->
        <el-dialog :visible.sync="dialog.show"
                   :close-on-click-modal="false"
                   title="UUABC Support"
                   :append-to-body="true"
                   width="450px" class="jr-private-chat">
            <div class="jr-private-chat-main" ref="talkScrollRef">
                <ul class="">
                    <li class="jr-private-chat-item"
                        v-for="(item,index) in v1.talk"
                        :key="index"
                        :class="item.role==='2'?'self':''">
                        <h6 class="chat-name">{{ item.name }}</h6>
                        <p class="chat-txt">
                            <span>{{ item.chat }}</span>
                        </p>
                    </li>
                </ul>
            </div>

            <!--弹窗尾部-->
            <div slot="footer" class="dialog-footer">
                <el-row :gutter="15">
                    <el-col :span="20">
                        <el-input size="small" @keyup.enter.native="submitChat" v-model="dialog.chat"/>
                    </el-col>
                    <el-col :span="4">
                        <el-button size="small" @click="submitChat" type="primary">提 交</el-button>
                    </el-col>
                </el-row>
            </div>
        </el-dialog>
    </div>
</template>

<script>

export default {
    data() {
        return {
            dialog: {
                show: false,
                chat: '',
            }
        }
    },

    computed: {
        v1() {
            return this.$store.state.Socket.v1
        },
        user_type() {
            return this.$route.query.role
        },
    },
    watch: {
        'v1.talk'() {
            if (this.user_type === '2' || this.user_type === '4') {
                this.dialog.show = true;
                this.$nextTick(() => {
                    const scrollRef = this.$refs['talkScrollRef']
                    scrollRef.scrollTop = scrollRef.scrollHeight;
                })
            }
        }
    },
    methods: {
        /**
         * 打开弹窗
         */
        openDialog() {
            this.dialog.show = true;
        },

        /**
         * 提交私聊
         */
        submitChat() {
            if (this.dialog.chat) {
                let {room_id, user_id, role, name, avatar} = this.$route.query;

                // 发给数据端
                this.$socket.emit('share', {
                    event: 'talk',
                    data: {
                        room_id,
                        user_id,
                        role,
                        name,
                        avatar,
                        chat: this.dialog.chat
                    }
                });

                // 发给自己
                this.$store.commit('Socket/SOCKET_v1_talk', {
                    room_id,
                    user_id,
                    role,
                    name,
                    avatar,
                    chat: this.dialog.chat
                })

                this.dialog.chat = '';
            } else {
                this.$message.error('输入内容不能为空')
            }
        },

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
        },

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
    }
}
</script>

<style lang="scss">
.jr-private-chat {
    .jr-dialog {
        border-radius: 5px;
    }

    .el-dialog__body {
        padding-top: 0;
        padding-bottom: 0;
    }

    .jr-private-chat-main {
        height: 400px;
        overflow-y: auto;
        scroll-behavior: smooth;
        -webkit-overflow-scrolling: touch;

        .jr-private-chat-item {
            margin-bottom: 15px;
            padding: 0 20px;

            .chat-name {
                font-size: 12px;
                padding: 6px 0;
            }

            .chat-txt {
                position: relative;
                text-align: left;

                span {
                    display: inline-block;
                    padding: 7px 10px;
                    font-size: 13px;
                    line-height: 17px;
                    border-radius: 7px;
                    background: #497DE7;
                    color: #FFFFFF;
                }

                &:after {
                    content: '';
                    position: absolute;
                    z-index: 7;
                    top: 10px;
                    right: auto;
                    left: -8px;
                    border-top: 4px solid transparent;
                    border-bottom: 4px solid transparent;
                    border-right: 8px solid #497DE7;
                    border-left: 0 solid transparent;
                }
            }

            &.self {
                .chat-name {
                    text-align: right;
                }

                .chat-txt {
                    text-align: right;

                    &:after {
                        right: -8px;
                        left: auto;
                        border-top: 4px solid transparent;
                        border-bottom: 4px solid transparent;
                        border-left: 8px solid #497DE7;
                        border-right: 0 solid transparent;
                    }
                }
            }
        }
    }

}
</style>
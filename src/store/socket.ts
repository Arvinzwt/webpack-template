export default {
    namespaced: true,
    state: {
        v1: {
            chat: [],//聊天内容
            mute: false,//学生是否禁言
            usrList: [],//为已在线用户集合（不包括"我"自己）
            diamond: 0,//学生钻石数目
            connection: 0,//当前连接状态 0未连接 1正常进入，2拒绝进入，3多端进入被踢，4学生被管理员刷新，5老师被管理员刷新
            heart: 0,//激励动画
            talk: [],//教师和管理员私聊
        }
    },
    actions: {
        /**
         * @desc 进入成功
         * @param commit[object]
         * @param data 为已在线用户集合（不包括"我"自己）
         */
        SOCKET_enterSuccess({commit}: any, data: any) {
            commit("SOCKET_v1_usrList", data)
            commit("SOCKET_connection", 1)
        },

        /**
         * @desc 拒绝进入
         * @param commit[object]
         * @param data[code]错误码
         * @param data[message] 错误原因
         */
        SOCKET_enterReject({commit}: any, data: any) {
            commit("SOCKET_connection", 2)
        },

        /**
         * @desc 多客户端登陆, 被踢下线
         * @param commit[object]
         * @param data[message] 错误原因
         */
        SOCKET_offline({commit}: any, data: any) {
            commit("SOCKET_connection", 3)
        },

        /**
         * @desc 用户进入
         */
        SOCKET_userEnter({commit, state}: any, data: any) {
            commit("SOCKET_v1_usrList", state.v1.usrList.concat(data))
        },

        /**
         * @desc 用户退出
         */
        SOCKET_userQuit({commit, state}: any, data: any) {
            commit("SOCKET_v1_userQui", data)
        },

        /**
         * @desc 其它用户共享的数据
         * @param commit[object]
         * @param digital
         */
        SOCKET_share({commit}: any, digital: [any, any]) {
            let [data = {}, usr = {}] = digital
            // 聊天
            if (data['event'] === 'chat') {
                commit('SOCKET_v1_chat', Object.assign(data, usr))
            }

            // 禁言
            if (data['event'] === 'chatting') {
                commit('SOCKET_v1_mute', data.data.enabled)
            }

            // 钻石
            if (data['event'] === 'flower') {
                commit('SOCKET_v1_diamond', data.data.total)
            }

            // 激励动画
            if (data['event'] === 'excit') {
                commit('SOCKET_v1_heart', data.data.index)
            }

            // 激励动画
            if (data['event'] === 'talk') {
                commit('SOCKET_v1_talk', data.data)
            }

            // 被管理员刷新
            if (data['event'] === 'refresh') {
                if (data.data.type === 1) {
                    commit('SOCKET_connection', 4)
                }
                if (data.data.type === 2) {
                    commit('SOCKET_connection', 5)
                }
            }
        },
    },
    mutations: {
        /**
         * @desc 存储连接状态
         */
        SOCKET_connection(state: any, data: number) {
            state.v1.connection = data
        },

        /**
         * @desc 存储聊天内容
         */
        SOCKET_v1_chat(state: any, data: object) {
            state.v1.chat.push(data)
        },

        /**
         * @desc 存储禁言状态
         */
        SOCKET_v1_mute(state: any, data: boolean) {
            state.v1.mute = data
        },

        /**
         * @desc 存储用户列表
         */
        SOCKET_v1_usrList(state: any, data: boolean) {
            state.v1.usrList = data
        },

        /**
         * @desc 删除退出用户
         */
        SOCKET_v1_userQui(state: any, data: any) {
            state.v1.usrList.forEach((item: any, index: number) => {
                if (item.user_id === data.user_id) {
                    state.v1.usrList.splice(index, 1)
                    return false;
                }
            })
        },

        /**
         * @desc 存储钻石数据
         */
        SOCKET_v1_diamond(state: any, data: number) {
            state.v1.diamond = data
        },

        /**
         * @desc 计算激励动画
         */
        SOCKET_v1_heart(state: any, data: number) {
            state.v1.heart = data
        },

        /**
         * @desc 教师和管理员私聊
         */
        SOCKET_v1_talk(state: any, data: any) {
            state.v1.talk.push(data)
        }

    },
    getters: {}
}

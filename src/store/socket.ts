export default {
    namespaced: true,
    state: {
        
    },
    actions: {
        /**
         * @desc 进入成功
         * @param commit[object]
         * @param data 为已在线用户集合
         */
        SOCKET_enterSuccess({commit}: any, data: any) {
            console.log('actions--Socket--enterSuccess', data);
        },

        /**
         * @desc 拒绝进入
         * @param commit[object]
         * @param data[code]错误码
         * @param data[message] 错误原因
         */
        SOCKET_enterReject({commit}: any, data: any) {
            console.log('actions--Socket--enterReject', data);
        },

        /**
         * @desc 多客户端登陆, 被踢下线
         * @param commit[object]
         * @param data[message] 错误原因
         */
        SOCKET_offline({commit}: any, data: any) {
            console.log('actions--Socket--offline', data);
        },

        /**
         * @desc 用户进入
         * @param commit[object]
         * @param data[userid] 用户id
         * @param data[userType] 用户类型
         * @param data[info]  info为扩展数据, 包含不限于 name、avatar
         */
        SOCKET_userEnter({commit}: any, data: any) {
            console.log('actions--Socket--userEnter', data);
        },

        /**
         * @desc 用户退出
         * @param commit[object]
         * @param data[userid] 用户id
         * @param data[userType] 用户类型
         * @param data[info]  info为扩展数据, 包含不限于 name、avatar
         */
        SOCKET_userQuit({commit}: any, data: any) {
            console.log('actions--Socket--userQuit', data);
        },

        /**
         * @desc 其它用户共享的数据
         * @param commit[object]
         * @param data
         */
        SOCKET_share({commit}: any, data: any) {
            console.log('actions--Socket--share', data);
        },
    },
    mutations: {
        /**
         * @desc 存储用户信息
         * @param state[object]
         * @param data[array]
         */
        SOCKET_list(state: any, data: any) {
            console.log('mutations----SOCKET_list', data);
        },

        /**
         * @desc 存储连接状态
         * @param state[object]
         * @param data[boolean]
         */
        SOCKET_connection(state: any, data: boolean) {
            console.log('mutations----SOCKET_connection', data);
        }
    },
    getters: {}
}

import io from "socket.io-client";
import md5 from "js-md5";

export default class Sockets {
    socket = null;

    constructor() {
        /* this.socket.on('chat', function (msg) {
             console.log('后端给我-' + msg)
         });*/
    }

    install(Vue) {
        Vue.prototype.$socket = {

            login(){
                this.socket = io('https://uat-tcsi.51uuabc.com/', {
                    path: "/socket.io",
                    reconnection: false,               //启动自动连接
                    reconnectionAttempts: 5,          //最大重试连接次数
                    reconnectionDelayMax: 10000,      //最大等待重新连接,之前的2倍增长
                    timeout: 20000,                   //error发出事件之前的连接超时
                    reconnectionDelay: 2000,          //最初尝试新的重新连接等待时间
                    transports: ['websocket'],        // ['websocket', 'polling']
                    query: {
                        company_code: 1,//公司code
                        timestamp: 1,//时间戳毫秒
                        token: md5('123123123123'),//md5(company_code + timestamp + company_secret)
                    },
                });

                this.socket.emit('joinRoom', {
                    "event_name": "joinRoom",//事件名称
                    "company_code": "uuabc",//公司code
                    "member_id": "12345",//用户ID
                    "room_id": "123456",//教室id
                    "member_type": 1,//用户角色 1:学员, 2:老师, 3:家长, 4:管理员
                    "group_id": 1,//group_id
                    "alias_room_id": 1,
                    "data": {
                        "name": "allen",//姓名
                        "avatar": "",//头像地址
                    }
                })

            },




            // 加入房间
            joinRoom() {
                this.socket.emit('joinRoom', {
                    "event_name": "joinRoom",//事件名称
                    "company_code": "uuabc",//公司code
                    "member_id": "12345",//用户ID
                    "room_id": "123456",//教室id
                    "member_type": 1,//用户角色 1:学员, 2:老师, 3:家长, 4:管理员
                    "group_id": 1,//group_id
                    "alias_room_id": 1,
                    "data": {
                        "name": "allen",//姓名
                        "avatar": "",//头像地址
                    }
                })
            },

            // 单播请求参数
            toOne() {
                this.socket.emit('toOne', {
                    "event_name": "toOne",
                    "data": {
                        "to_member_company_code": "1",//接收方公司编码
                        "to_member_id": "1",//接收方用户ID
                        "to_member_role": "1"//接收方用户角色
                    }
                })
            },

            // 统一广播请求参数
            toAll() {

            },

            // 聊天广播请求参数（存）
            chat() {
                this.socket.emit('chat', {
                    "eventName": "chat",
                    "data": {
                        "member_id": 1,
                        "value": "聊天内容"
                    }
                })
            },

            // 静音广播请求参数（存）
            muted() {
                this.socket.emit('muted', {
                    "eventName": "muted",
                    "data": {
                        "member_id": 1,
                        "value": 0
                    }
                })
            },

            // 奖励广播请求参数（存）
            reward() {
                this.socket.emit('reward', {
                    "eventName": "reward",
                    "data": {
                        "list": [
                            {
                                "member_id": 1,
                                "value": 100
                            }
                        ]
                    }
                })
            },

            // 上、下台广播请求参数（存）
            platform() {
                this.socket.emit('platform', {
                    "eventName": "platform",
                    "data": {
                        "member_id": 1,
                        "value": 100,
                        "extend": ""
                    }
                })
            },

            // 下课广播请求参数
            complete() {
                this.socket.emit('complete', {
                    "eventName": "complete",
                    "data": {}
                })
            },

            // 刷新教室广播请求参数
            refresh() {
                this.socket.emit('refresh', {
                    "eventName": "refresh",
                    "data": {
                        "member_id": 1,
                        "value": 1,
                    }
                })
            },

            // 监控切换指定用户的摄像头广播请求参数
            camera() {
                this.socket.emit('refresh', {
                    "eventName": "camera",
                    "data": {
                        "member_id": 1,
                        "value": {
                            "device_id": "11",
                            "label": "aaa"
                        }
                    }
                })
            },

            // 监控切换指定用户的麦克风广播请求参数
            micphone() {
                this.socket.emit('refresh', {
                    "eventName": "micphone",
                    "data": {
                        "member_id": 1,
                        "value": {
                            "device_id": "11",
                            "label": "aaa"
                        }
                    }
                })
            },

            // 画图广播请求参数（存）
            draw() {
                this.socket.emit('refresh', {
                    "eventName": "draw",
                    "data": {}
                })
            },

            // 互动开关广播请求参数（存）
            interaction() {
                this.socket.emit('interaction', {
                    "eventName": "interaction",
                    "data": {}
                })
            },

            // 翻页广播请求参数（存）
            page() {
                this.socket.emit('interaction', {
                    "eventName": "page",
                    "data": {
                        "value": 1
                    }
                })
            },

            // 互动广播请求参数（存）
            action() {
                this.socket.emit('action', {
                    "eventName": "action",
                    "data": {}
                })
            },

            // 清屏广播请求参数（存）
            clean() {
                this.socket.emit('action', {
                    "eventName": "clean",
                    "data": {}
                })
            }

        };
    }
}
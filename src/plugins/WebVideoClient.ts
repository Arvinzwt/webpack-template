import AgoraRTC from 'agora-rtc-sdk'
import BaseEvent from '@/utils/BaseEvent'

console.log('设备检测', AgoraRTC.VERSION, AgoraRTC.checkSystemRequirements());
/*******************************************************************
 * 本地视频
 *******************************************************************/
class VideoStream extends BaseEvent {
    element: any = ""
    cameras = []; //视频输入列表
    microphones = []; //音频输入列表
    audios = []; //音频输出列表
    camera:any = null; //当前使用的视频输入设备
    microphone = null; //当前使用的音频输入设备
    localStream:any = null; //本地视频流
    videoProfile:any = null; //视频规格
    videoElement:any  = null; //本地流video播放容器
    streamID:any;
    access: boolean = false;
    constructor() {
        super();
    }

    /**
     * 获取视频采集约束数据
     */
    get options() {
        let that = this;
        var data = {
            streamID: parseInt(that.streamID || Math.round(Math.random() * 10000)),
            screen: false,
            video: false,
            audio: false,
            cameraId: '',
            microphoneId: '',
        };
        if (this.cameraId) {
            data.video = true;
            data.cameraId = this.cameraId;
        } else {
            if (this.cameras.length) {
                data.video = true; //使用默认设备
            } else {
                console.warn('没有视频设备, 无视频信号');
            }
        }
        if (this.microphoneId) {
            data.audio = true;
            data.microphoneId = this.microphoneId;
        } else {
            if (this.microphones.length) {
                data.audio = true;
            } else {
                console.warn('没有麦克风设备, 无音频信号');
            }
        }
        return data;
    }

    init() {
        return new Promise((resolve, reject) => {
            AgoraRTC.getDevices((devices) => {
                this.audios = [];
                this.cameras = [];
                this.microphones = [];
                if (devices && devices.length > 0) {
                    devices.forEach((device) => {
                        devices = JSON.parse(JSON.stringify(device));
                        if (device['kind'] == 'videoinput') {
                            // @ts-ignore
                            devices.label = device.label || 'Camera ' + (this.cameras.length + 1);
                            // @ts-ignore
                            this.cameras.push(devices);
                        } else if (device['kind'] == 'audioinput') {
                            // @ts-ignore
                            devices.label = device.label || 'Microphone ' + (this.microphones.length + 1);
                            // @ts-ignore
                            this.microphones.push(devices);
                        } else if (device['kind'] == 'audiooutput') {
                            // @ts-ignore
                            devices.label = device.label || 'Audio ' + (this.audios.length + 1);
                            // @ts-ignore
                            this.audios.push(devices);
                        }
                        // @ts-ignore
                        delete devices['groupId'];
                        // @ts-ignore
                        delete devices['kind'];
                    });
                    resolve([this.cameras, this.microphones, this.audios]);
                } else {
                    reject("DEVICES_NOT_FOUND");
                }
            });
        });
    }

    set cameraId(deviceId) {
        const list = this.cameras || [];
        list.forEach((element: any) => {
            if (element.deviceId == deviceId) {
                this.camera = element;
            }
        });
    }

    get cameraId() {
        if (this.camera) {
            return this.camera.deviceId;
        }
        if (this.cameras.length > 0) {
            // @ts-ignore
            return this.cameras[0].deviceId;
        }
        return null;
    }

    set microphoneId(deviceId) {
        const list = this.microphones || [];
        list.forEach(element => {
            // @ts-ignore
            if (element.deviceId == deviceId) {
                this.microphone = element;
            }
        });
    }

    get microphoneId() {
        if (this.microphone) {
            // @ts-ignore
            return this.microphone.deviceId;
        }
        if (this.microphones.length > 0) {
            // @ts-ignore
            return this.microphones[0].deviceId;
        }
        return null;
    }

    /** 弃用:
     * 显示播放本地视频流
     * vue项目推荐使用 :srcObject.prop="stream" 
     *  */
    display(videoElement: any) {
        const video = videoElement || this.videoElement;
        if (this.localStream) {
            this.localStream.isPlaying() && this.localStream.stop();
            video.autoplay = true;
            video.srcObject = this.localStream.stream;
            video.play().catch((err:any) => {
                console.warn('localStream 播放视频流失败', err);
            });

            //TODO getSates计算清晰度
        }
    }

    createStream(options:any) {
        options = options || this.options;
        this.videoProfile = this.videoProfile || '240P_3';
        console.log('Create Stream', this.element, this.videoProfile, options);
        return new Promise((resolve, reject) => {
            this.localStream = AgoraRTC.createStream(options);
            this.localStream.setVideoProfile(this.videoProfile);
            this.localStream.on("accessAllowed", () => {
                this.access = true;
                console.log("localStream # accessAllowed");
            });
            this.localStream.on("accessDenied", () => {
                this.access = false;
                console.warn("localStream # accessDenied");
            });
            this.localStream.init(() => {
                console.log("getUserMedia successfully");
                resolve(this.localStream);
            }, (err:any) => {
                console.log("getUserMedia failed", err);
                reject(err.msg);
            });
        });
    }

    switchDevice(type:any, deviceId:any) {
        return new Promise((resolve, reject) => {
            this.localStream.switchDevice(type, deviceId, resolve, reject);
        });
    }

    /** 关闭本地视频流 */
    close() {
        if (this.localStream != null) {
            this.localStream.close();
        }
    }
}

/*******************************************************************
 * 视频流服务
 *******************************************************************/
class VideoClient extends BaseEvent {
    token = null;
    channel:any = null;
    streamList:any = {};
    client:any = null;
    appid:any = null;
    constructor() {
        super();
        // @ts-ignore
        AgoraRTC.Logger.setLogLevel(AgoraRTC.Logger.INFO);
        AgoraRTC.Logger.enableLogUpload();
        AgoraRTC.getSupportedCodec().then(function(result) {
            console.log(`Supported video codec: ${result.video.join(", ")}`);
            console.log(`Supported audio codec: ${result.audio.join(", ")}`);
        });
        // @ts-ignore
        this.client = AgoraRTC.createClient({ mode: 'live' });
        this.client.enableAudioVolumeIndicator = false; //禁用说话者音量提示
        this.addEventListener(this.client);
    }

    /**
     * 监听视频流对象
     * @param {Object} client 
     */
    addEventListener(client:any):void {
        const that = this;
        //远程音视频流已添加回调事件(stream-added)
        client.on('stream-added', (evt:any) => {
            const stream = evt.stream;
            const uid = stream.getId();
            console.warn("New stream added: ", uid);
            console.log("Subscribe ", stream);
            client.subscribe(stream, function(err:any) {
            console.log("Subscribe stream failed", uid, err);
            });
        });
        //远程音视频流已订阅回调事件(stream-subscribed)
        client.on('stream-subscribed', (evt:any) => {
            const stream = evt.stream;
            const uid = stream.getId();
            that.streamList[uid] = stream;
            console.log("Subscribe remote stream successfully: ", stream.getId(), stream.hasVideo(), stream.hasAudio(), stream.getAttributes());
            var user:any = that.getToken(uid);
            that.emit('stream', user.id, user.type, user.token);
            
            stream.getStats((data:any) => {
                var apl = data.audioReceivePacketsLost / (data.audioReceivePackets - data.audioReceivePacketsLost);
                var vpl = data.videoReceivePacketsLost / (data.videoReceivePackets - data.videoReceivePacketsLost);
                // that.emit('lostlevel', user, {
                //     value: (apl * 100).toFixed(3),
                //     // @ts-ignore
                //     level: AgoraRTC.netWorkLostLevel(apl)
                // }, {
                //     value: (vpl * 100).toFixed(3),
                //     // @ts-ignore
                //     level: AgoraRTC.netWorkLostLevel(vpl)
                // });
            })
        });
        //远程音视频流已删除回调事件(stream-removed)
        client.on('stream-removed', (evt:any) => {
            const stream = evt.stream;
            const uid = stream.getId();
            const data:any = that.getToken(uid);
            that.emit('removed', data.id, data.type, data.token);
            stream.stop();
            delete that.streamList[uid];
            console.log("Remote stream is removed " + stream.getId());
        });

        //对方用户已离开会议室回调事件(peer-leave)
        client.on('peer-leave', (evt:any) => {
            const stream = evt.stream;
            if (stream) {
                const uid = evt.uid;
                const data:any = that.getToken(uid);
                that.emit('removed', data.id, data.type, data.token);
                stream.stop();
                delete that.streamList[uid];
                console.log(uid, " leaved from this channel");
            }
        });

        //用户已取消视频通话静音
        client.on('unmute-video', (evt:any) => {
            const uid = evt.uid;
            const data = that.getToken(uid);
            console.log("unmute video:", uid, data);
        });

        //用户已被踢且被封禁
        client.on('client-banned', (evt:any) => {
            const uid = evt.uid;
            const attr = evt.attr;
            that.emit('rejected', uid, attr);
            console.warn(" user banned:" + uid + ", banntype:" + attr);
        });

        client.on('active-speaker', (evt:any) => {
            const uid = evt.uid;
            const data = that.getToken(uid);
            console.log("update active speaker: client", uid, data);
        });

        //token 失效前30s提示
        client.on('onTokenPrivilegeWillExpire', () => {
            that.emit('tokenExpire');
        });

        var channelKey = "";
        client.on('error', function(err:any) {
            console.log("Got error msg:", err.reason);
            that.emit('error', err.reason);
            if (err.reason === 'DYNAMIC_KEY_TIMEOUT') {
                client.renewChannelKey(channelKey, function() {
                    console.log("Renew channel key successfully");
                }, function(err:any) {
                    console.warn("Renew channel key failed: ", err);
                });
            }
        });

        //摄像头被添加或移除
        client.on("camera-changed", function (evt: { state: any; device: any; }) {
            console.log("Camera Changed", evt.state, evt.device);
        });

        //报告本地用户的上下行网络质量
        client.on("network-quality", function (stats:any) {
            // console.warn("downlinkNetworkQuality", stats.downlinkNetworkQuality);
            // console.log("uplinkNetworkQuality", stats.uplinkNetworkQuality);
            that.emit('network', stats.uplinkNetworkQuality, stats.downlinkNetworkQuality);
        });
    }

    /**
     * 解析token，获取解析token结果对象
     * @param {String} token 
     */
    getToken(token: any) {
        token = token + "";
        var result = {
            token: token,
            type: 0,
            id: 0,
        };
        if (token && token.length >= 2) {
            result = {
                token: token,
                type: Number(token.substr(0, 1)),
                id: Number(token.substr(1, token.length - 1))
            };
        } else {
            console.warn('无效token', token);
        }
        return result;
    }

    //更新App token
    renewToken(appToken:any) {
        this.client.renewToken(appToken);
    }

    /**
     * 初始化
     */
    init(appid: string) {
        let that = this;
        this.appid = appid;
        // console.log("AgoraRTC.BUILD", AgoraRTC.BUILD, "VIDEO CLIENT::", appid);
        return new Promise((resolve, reject) => {
            if (!this.appid) {
                console.warn("AgoraRTC appid must not be empty", this.appid);
                reject("AgoraRTC appid must not be empty" + this.appid);
            } else {
                //初始化
                this.client.init(this.appid, function() {
                    console.log("INIT::", that.appid);
                    resolve();
                }, function(info:any) {
                    var err = info;
                    console.warn("INIT ERROR::", err);
                    switch (err) {
                        case 'SERVICE_NOT_AVAILABLE':
                            err = '服务不可用, APPID:' + that.appid;
                            break;
                        case 'CONNECT_GATEWAY_ERROR':
                            err = '无法连接 Web 服务器';
                            break;
                        case 'INVALID_OPERATION':
                            err = '请联系技术支持!';
                            break;
                        case 'INVALID_KEY':
                        case 'INVALID_DYNAMIC_KEY':
                        case 'DYNAMIC_KEY_TIMEOUT':
                            err = '请联系技术支持,续费视频服务!';
                            break;
                    }
                    // @ts-ignore
                    reject(err, info);
                });
            }
        });
    }

    /**
     * 连接声网服务器
     * @param {String} classid 
     * @param {String} appToken  
     * @param {Int32} token 
     */
    connect(classid: any, appToken:any, token: string | number) {
        var channel = "td" + classid; //强制转换为字符串
        var that = this;
        token = Number(token) || 0;
        return new Promise(function(resolve, reject) {
            //加入频道
            that.client.join(appToken, channel, token, function(uid:any) {
                that.token = uid;
                that.channel = channel;
                var data:any = that.getToken(uid);
                console.log("JOIN 成功", that.appid, channel, uid, data.id, data.type, data.token);
                // @ts-ignore
                resolve(data.token, data.id, data.type);
            }, function(info:any) {
                var err = info;
                console.warn("JOIN ERROR::", err);
                switch (err) {
                    case 'INVALID_PARAMETER':
                        err = '无效 Token#' + appToken;
                        break;
                    case 101:
                        err = '视频服务ID无效 <br> APPID:' + that.appid;
                        break;
                    case 102:
                        err = '课程ID无效 <br> ID:' + classid;
                        break;
                    case 2002:
                        err = '进入教室失败,刷新重试';
                        break;
                    case 109:
                    case 110:
                        err = '请联系技术支持,续费视频服务!';
                        break;
                }
                // @ts-ignore
                reject(err, info);
            });
        });
    }

    /**
     * 发布视频流
     * @param {*} stream 
     */
    publish(stream: any) {
        return new Promise((resolve, reject) => {
            var data = this.getToken(stream.getId());
            this.client.publish(stream, function(err:any) {
                // console.warn("Publish local stream error: ", err);
                reject(err);
            });

            //本地音视频已上传回调事件(stream-published)
            resolve();
        });
    }

    /**
     * 查询指定用户的视频流
     * @param {int32} token 
     */
    getStream(token: string) {
        var stream = this.streamList[token];
        if (stream) {
            return stream;
        } else {
            console.warn('指定token的媒体流已经丢失', token);
        }
        return null;
    }

    player(token:any, element:any) {
        var stream = this.getStream(token);
        console.log('----');
        
        console.log(stream);
        
        if (stream) {
            stream.isPlaying() && stream.stop();

            //清空之前的videodisplay
            if (document.querySelector('#display' + token)) {
                element.removeChild(document.querySelector('#display' + token));
            }

            //容器videodisplay
            let display = document.createElement('div');
            display.setAttribute('id', "display" + token);
            display.setAttribute('style', 'position:absolute; width:100%;height:100%; background:#000');
            element.appendChild(display);

            //视频dom
            let video = document.createElement('video');
            display.appendChild(video);
            video.setAttribute('id', 'remote' + token);
            // @ts-ignore
            video.setAttribute('playsinline', true);
            video.setAttribute('style', 'height: 100%; width: 100%; object-fit: cover;');
            video.autoplay = true;
            video.srcObject = stream.stream;
            video.play().catch(err => {
                console.error(token, 'stream 播放视频流失败', err);
            });
        } else {
            console.warn('指定token的媒体流已经丢失或未获取...', token, element);
        }
    }

    /**
     * 开关视频流
     * @param {int32} token 
     * @param {Boolean} enabled 
     */
    toggleVideo(token: string, enabled:boolean) {
        var stream = this.getStream(token);
        if (stream) {
            console.log(token, "toggleVideo # Video Track", stream.getVideoTrack(), 'Audio Track', stream.getAudioTrack());
            if (enabled) {
                stream.unmuteVideo();
            } else {
                stream.muteVideo();
                console.log('视频图像已经关闭', token);
            }
        }
    }

    /**
     * 开关音频流
     * @param {int32} token 
     * @param {Boolean} muted 
     */
    toggleAudio(token: string, muted: boolean) {
        const stream = this.getStream(token);
        if (stream) {
            console.log(token, "toggleAudio # Video Track", stream.getVideoTrack(), 'Audio Track', stream.getAudioTrack());
            if (muted) {
                stream.muteAudio();
                console.log('视频声音已经关闭 ', token);
            } else {
                stream.unmuteAudio();
            }
        }
    }

    /**
     * 停止视频流
     * @param {Object} stream 
     */
    stop(stream:any) {
        if (stream) {
            const data = this.getToken(stream.getId());
            this.client.unpublish(stream, (err:any) => {
                console.warn("Unpublish local stream failed", data, err);
            });
        }
    }

    /**
     * 离开，退出
     */
    exit() {
        let that = this;
        return new Promise(function(resolve, reject) {
            Object.keys(that.streamList).map(key => {
                // that.stopPlayer(key);
            });

            that.streamList = {};
            that.client.leave(function() {
                console.log("Leavel channel successfully");
                resolve();
            }, function(err:any) {
                console.warn("Leave channel failed");
                reject(err);
            });
        });
    }
}

export { VideoStream, VideoClient }
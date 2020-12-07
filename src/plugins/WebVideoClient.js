import AgoraRTC from 'agora-rtc-sdk'
import BaseEvent from '@/utils/BaseEvent'

console.log('设备检测', AgoraRTC.VERSION, AgoraRTC.checkSystemRequirements());
/*******************************************************************
 * 本地视频
 *******************************************************************/
class VideoStream extends BaseEvent {
    cameras = []; //视频输入列表
    microphones = []; //音频输入列表
    audios = []; //音频输出列表
    camera = null; //当前使用的视频输入设备
    microphone = null; //当前使用的音频输入设备
    localStream = null; //本地视频流
    videoProfile = null; //视频规格
    videoElement = null; //本地流video播放容器
    streamID = null;
    constructor() {
        super();
    }

    /**
     * 获取视频采集约束数据
     */
    get options() {
        var data = {
            streamID: parseInt(that.streamID || Math.round(Math.random() * 10000)),
            screen: false,
            video: false,
            audio: false,
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
                        device = JSON.parse(JSON.stringify(device));
                        if (device['kind'] == 'videoinput') {
                            device.label = device.label || 'Camera ' + (this.cameras.length + 1);
                            this.cameras.push(device);
                        } else if (device['kind'] == 'audioinput') {
                            device.label = device.label || 'Microphone ' + (this.microphones.length + 1);
                            this.microphones.push(device);
                        } else if (device['kind'] == 'audiooutput') {
                            device.label = device.label || 'Audio ' + (this.audios.length + 1);
                            this.audios.push(device);
                        }
                        delete device['groupId'];
                        delete device['kind'];
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
        list.forEach(element => {
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
            return this.cameras[0].deviceId;
        }
        return null;
    }

    set microphoneId(deviceId) {
        const list = this.microphones || [];
        list.forEach(element => {
            if (element.deviceId == deviceId) {
                this.microphone = element;
            }
        });
    }

    get microphoneId() {
        if (this.microphone) {
            return this.microphone.deviceId;
        }
        if (this.microphones.length > 0) {
            return this.microphones[0].deviceId;
        }
        return null;
    }

    /** 弃用:
     * 显示播放本地视频流
     * vue项目推荐使用 :srcObject.prop="stream" 
     *  */
    display(videoElement) {
        const video = videoElement || this.videoElement;
        if (this.localStream) {
            this.localStream.isPlaying() && this.localStream.stop();
            video.autoplay = true;
            video.srcObject = this.localStream.stream;
            video.play().catch(err => {
                console.warn('localStream 播放视频流失败', err);
            });

            //TODO getSates计算清晰度
        }
    }

    createStream(options) {
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
            }, (err) => {
                console.log("getUserMedia failed", err);
                reject(err.msg);
            });
        });
    }

    switchDevice(type, deviceId) {
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
    channel = null;
    streamList = {};
    clinet = null;
    appid = null;
    constructor() {
        super();
        AgoraRTC.Logger.setLogLevel(AgoraRTC.Logger.INFO);
        AgoraRTC.Logger.enableLogUpload();
        AgoraRTC.getSupportedCodec().then(function(result) {
            console.log(`Supported video codec: ${result.video.join(", ")}`);
            console.log(`Supported audio codec: ${result.audio.join(", ")}`);
        });
        this.client = AgoraRTC.createClient({ mode: 'live' });
        this.client.enableAudioVolumeIndicator = false; //禁用说话者音量提示
        this.addListener(this.client);
    }

    /**
     * 监听视频流对象
     * @param {Object} client 
     */
    addListener(client) {
        const that = this;
        //远程音视频流已添加回调事件(stream-added)
        client.on('stream-added', (evt) => {
            const stream = evt.stream;
            const uid = stream.getId();
            console.log("New stream added: ", uid);
            console.log("Subscribe ", stream);
            client.subscribe(stream, function(err) {
                console.log("Subscribe stream failed", uid, err);
            });
        });
        //远程音视频流已订阅回调事件(stream-subscribed)
        client.on('stream-subscribed', (evt) => {
            const stream = evt.stream;
            const uid = stream.getId();
            that.streamList[uid] = stream;
            console.log("Subscribe remote stream successfully: ", stream.getId(), stream.hasVideo(), stream.hasAudio(), stream.getAttributes());
            var data = that.getToken(uid);
            that.emit('stream', data.id, data.type, data.token);
        });
        //远程音视频流已删除回调事件(stream-removed)
        client.on('stream-removed', (evt) => {
            const stream = evt.stream;
            const uid = stream.getId();
            const data = that.getToken(uid);
            that.emit('removed', data.id, data.type, data.token);
            stream.stop();
            delete that.streamList[uid];
            console.log("Remote stream is removed " + stream.getId());
        });

        //对方用户已离开会议室回调事件(peer-leave)
        client.on('peer-leave', (evt) => {
            const stream = evt.stream;
            if (stream) {
                const uid = evt.uid;
                const data = that.getToken(uid);
                that.emit('removed', data.id, data.type, data.token);
                stream.stop();
                delete that.streamList[uid];
                console.log(uid, " leaved from this channel");
            }
        });

        //用户已取消视频通话静音
        client.on('unmute-video', (evt) => {
            const uid = evt.uid;
            const data = that.getToken(uid);
            console.log("unmute video:", uid, data);
        });

        //用户已被踢且被封禁
        client.on('client-banned', (evt) => {
            const uid = evt.uid;
            const attr = evt.attr;
            that.emit('rejected', uid, attr);
            console.warn(" user banned:" + uid + ", banntype:" + attr);
        });

        client.on('active-speaker', (evt) => {
            const uid = evt.uid;
            const data = that.getToken(uid);
            console.log("update active speaker: client", uid, data);
        });

        //token 失效前30s提示
        client.on('onTokenPrivilegeWillExpire', () => {
            that.emit('tokenExpire');
        });

        var channelKey = "";
        client.on('error', function(err) {
            console.log("Got error msg:", err.reason);
            that.emit('error', err.reason);
            if (err.reason === 'DYNAMIC_KEY_TIMEOUT') {
                client.renewChannelKey(channelKey, function() {
                    console.log("Renew channel key successfully");
                }, function(err) {
                    console.warn("Renew channel key failed: ", err);
                });
            }
        });
    }

    /**
     * 解析token，获取解析token结果对象
     * @param {String} token 
     */
    getToken(token) {
        token = token + "";
        var result = {
            token: token
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
    renewToken(appToken) {
        this.client.renewToken(appToken);
    }

    /**
     * 初始化
     */
    init(appid) {
        this.appid = appid;
        console.log("AgoraRTC.BUILD", AgoraRTC.BUILD, "VIDEO CLIENT::", appid);
        return new Promise((resolve, reject) => {
            if (!this.appid) {
                console.warn("AgoraRTC appid must not be empty", this.appid);
                reject("AgoraRTC appid must not be empty" + this.appid);
            } else {
                //初始化
                this.client.init(this.appid, function() {
                    console.log("INIT::", this.appid);
                    resolve();
                }, function(info) {
                    var err = info;
                    console.warn("INIT ERROR::", err);
                    switch (err) {
                        case 'SERVICE_NOT_AVAILABLE':
                            err = '服务不可用, APPID:' + this.appid;
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
    connect(classid, appToken, token) {
        var channel = "td" + classid; //强制转换为字符串
        token = Number(token) || 0;
        return new Promise(function(resolve, reject) {
            //加入频道
            this.client.join(appToken, channel, token, function(uid) {
                this.token = uid;
                this.channel = channel;
                var data = this.getToken(uid);
                console.log("JOIN 成功", this.appid, channel, uid, data.id, data.type, data.token);
                resolve(data.token, data.id, data.type);
            }, function(info) {
                var err = info;
                console.warn("JOIN ERROR::", err);
                switch (err) {
                    case 'INVALID_PARAMETER':
                        err = '无效 Token#' + appToken;
                        break;
                    case 101:
                        err = '视频服务ID无效 <br> APPID:' + this.appid;
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
                reject(err, info);
            });
        });
    }

    /**
     * 发布视频流
     * @param {*} stream 
     */
    publish(stream) {
        return new Promise((resolve, reject) => {
            var data = this.getToken(stream.getId());
            this.client.publish(stream, function(err) {
                console.warn("Publish local stream error: ", err);
                reject(err);
            });

            //本地音视频已上传回调事件(stream-published)
            this.client.on('stream-published', function(evt) {
                console.log("Publish local stream successfully");
                resolve();
            });
        });
    }

    /**
     * 查询指定用户的视频流
     * @param {int32} token 
     */
    getStream(token) {
        var stream = this.streamList[token];
        if (stream) {
            return stream;
        } else {
            console.warn('指定token的媒体流已经丢失', token);
        }
        return null;
    }

    /**
     * 开关视频流
     * @param {int32} token 
     * @param {Boolean} enabled 
     */
    toggleVideo(token, enabled) {
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
    toggleAudio(token, muted) {
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
    stop(stream) {
        if (stream) {
            const data = this.getToken(stream.getId());
            this.client.unpublish(stream, (err) => {
                console.warn("Unpublish local stream failed", data, err);
            });
        }
    }

    /**
     * 离开，退出
     */
    exit() {
        return new Promise(function(resolve, reject) {
            Object.keys(this.streamList).map(key => {
                this.stopPlayer(key);
            });

            this.streamList = {};
            this.client.leave(function() {
                console.log("Leavel channel successfully");
                resolve();
            }, function(err) {
                console.warn("Leave channel failed");
                reject(err);
            });
        });
    }
}

export { VideoStream, VideoClient }
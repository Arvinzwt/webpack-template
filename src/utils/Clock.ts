
/********************************************************
 *      时钟计算
 *********************************************************/

var formatTimeValue = function (value:number) {
    var tag = "-";
    if (value >= 0) {
        tag = "";
    }
    // default format: hours:minutes:seconds
    value = Math.round(Math.abs(value));
    var hours = Math.floor(value / 3600) % 24;
    var minutes = Math.floor(value / 60) % 60;
    var seconds = value % 60;
    var result = "";

    if (hours != 0)
        result = hours + ":";

    if (result && minutes < 10)
        result += "0" + minutes + "";
    else
        result += minutes + "";

    if (seconds < 10)
        result += ":0" + seconds;
    else
        result += ":" + seconds;

    return tag + result;
};

function formatTimeToString(time: number, fmt?: string) {
    var date = new Date();
    date.setTime(time * 1000);

    fmt = fmt || "yyyy-MM-dd HH:mm:ss";
    var o:any = {
        "M+": date.getMonth() + 1, //月份
        "d+": date.getDate(), //日
        "h+": date.getHours() % 12 == 0 ? 12 : date.getHours() % 12, //小时
        "H+": date.getHours(), //小时
        "m+": date.getMinutes(), //分
        "s+": date.getSeconds(), //秒
        "q+": Math.floor((date.getMonth() + 3) / 3), //季度
        "S": date.getMilliseconds() //毫秒
    };
    var week:any = {
        "0": "/u65e5",
        "1": "/u4e00",
        "2": "/u4e8c",
        "3": "/u4e09",
        "4": "/u56db",
        "5": "/u4e94",
        "6": "/u516d"
    };
    if (/(y+)/.test(fmt)) {
        fmt = fmt.replace(RegExp.$1, (date.getFullYear() + "").substr(4 - RegExp.$1.length));
    }
    if (/(E+)/.test(fmt)) {
        fmt = fmt.replace(RegExp.$1, ((RegExp.$1.length > 1) ? (RegExp.$1.length > 2 ? "/u661f/u671f" : "/u5468") : "") + week[date.getDay() + ""]);
    }
    for (var k in o) {
        if (new RegExp("(" + k + ")").test(fmt)) {
            fmt = fmt.replace(RegExp.$1, (RegExp.$1.length == 1) ? (o[k]) : (("00" + o[k]).substr(("" + o[k]).length)));
        }
    }
    return fmt;
};

/********************************************************
 *  时钟
 ********************************************************/
import BaseEvent from '@/utils/BaseEvent'
class ClockTime extends BaseEvent {
    //课堂开始时间戳
    startTime = 0;
    //课堂结束时间戳
    endTime = 0;
    formatTimeValue?: (value: number) => string;
    formatTimeToString?: (time: number, fmt?: string | undefined) => string;
    constructor() {
        super();
    }

    //服务器时间戳
    _serverTime = 0;
    //服务器对应的客户端时间戳

    _clientTime = 0;
    //服务器对应的客户端上课时间戳
    _clientStartTime = 0;
    //对应客户端下课的时间戳
    _clientEndTime = 0;
    //客户端当前的时间戳
    _time = 0;
    //和上课的时间差距
    _startTimeDifference = 0;
    //和下课的时间差
    _endTimeDifference = 0;
    private sid:any;

    set serverTime(value) {
        this._clientTime = parseInt(Date.now() / 1000 + '');
        this._serverTime = value;
    }

    get serverTime() {
        return this._serverTime;
    }

    get clientTime() {
        return this._clientTime;
    }

    get clientStartTime() {
        return this._clientStartTime;
    }
    get clientEndTime() {
        return this._clientEndTime;
    }
    get time() {
        return this._time;
    }
    get startTimeDifference() {
        return this._startTimeDifference;
    }
    get endTimeDifference() {
        return this._endTimeDifference;
    }

    start() {
        const that = this;
        this._clientStartTime = this._clientTime - (this._serverTime - that.startTime);
        this._clientEndTime = this._clientTime - (this._serverTime - that.endTime);
        this.sid = setInterval(function () {
            that._time = parseInt(Date.now() / 1000 + '');
            that._startTimeDifference = that._time - that._clientStartTime;
            that._endTimeDifference = that._time - that._clientEndTime;
            that.emit('change', that._time);
        }, 1000);
    };

    stop() {
        clearInterval(this.sid);
    };

    toString() {
        let that = this;
        return "ClockTime Date: " +
            "\n 课程时长 : " + formatTimeValue(that.endTime - that.startTime) +
            "\n 开始时间 : " + formatTimeToString(that.startTime) +
            "\n 结束时间 : " + formatTimeToString(that.endTime) +
            "\n 服务器时间 : " + formatTimeToString(that.serverTime) +
            "\n 客户端时间 : " + formatTimeToString(that.clientTime) +
            "\n 客户端上课时间 : " + formatTimeToString(that.clientStartTime) +
            "\n 客户端结束时间 : " + formatTimeToString(that.clientEndTime) +
            "\n 当前时间 : " + formatTimeToString(that.time) +
            "\n 距上课时间 : " + formatTimeValue(that.startTimeDifference) +
            "\n 距下课时间 : " + formatTimeValue(that.endTimeDifference);
    }
}

/**
 * 格式化时间
 *@param value:Number 单位是秒
 * */
ClockTime.prototype.formatTimeValue = formatTimeValue;

ClockTime.prototype.formatTimeToString = formatTimeToString;

export {
    ClockTime,
    formatTimeValue,
    formatTimeToString
}
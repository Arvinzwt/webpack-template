import axios from '@/plugins/axios'
const Fingerprint = require('fingerprintjs');

const prefix = `/classroom-soa/api/v1/`
interface IEventData {
    value: string,
    member_id: number,
}
interface IRoomEntry {
    company_code: string,
    room_id: number,
    external_id: string,      // 业务用户id
    member_type: number,
    nickname: string,
    avatar: string,
    pathway: number,          // integer, 途径 1: TV
}

interface ITeacher {
    commpanyCode: string,
    roomId: number,
    externalId: string,         // 业务方用户ID
    memberType: number,         // 固定值2 老师
    nickname?: string,
    avatar?: string,
}
/**
 * 新建教室
 * @param param 
 */
export const creatClassRoom = (param:any) => {
    return axios.post(`${prefix}classroom/save`, param)
}

/**
 * 获取教室信息
 * @param company_code 
 * @param room_id 
 */
export const getClassRoomInfo = (company_code: string, room_id: number) => {
    return axios.post(`${prefix}classroom/info`, {
        room_id,
        company_code
    })
}

/**
 * 获取教室列表
 */
export const getClassRoomList = (page:number, size: number, company_code?:string, room_name?:string, start_date?: string, ) => {
    return axios.post(`${prefix}classroom/list`, {
        page,
        size,
        room_name,
        start_date,
        company_code,
    })
}


/**
 * 取消教室
 * @param room_id 
 */
export const cancelClassRoom = (room_id:string) => {
    return axios.post(`${prefix}classroom/list`, {
        room_id
    })
}

/**
 * 教室增加课件
 * @param room_id                   教室id
 * @param courseware_url            课件地址
 * @param courseware_name           课件名称
 * @param channel                   渠道
 * @param type                      类型:1 互动课件
 * @param sort                      排序，越小越靠前
 */
export const addRoomCourse = (room_id:string, courseware_url: string, courseware_name: string, type: number, channel?: string,  sort?:number) => {
    return axios.post(`${prefix}classroom/courseware/add`, {
        sort,
        type,
        channel,
        room_id,
        courseware_url,
        courseware_name,
    })
}

/**
 * 删除教室课件
 */
export const delRoomCourse = (room_id: number, courseware_id: string|number) => {
    return axios.post(`${prefix}classroom/courseware/del`, {
        room_id,
        courseware_id,
    })
}

/**
 * 发送钻石
 */
export const sendStage = (roomId: number, users: any[]) => {
    return axios.post(`${prefix}classroom/courseware/del`, {
        users,
        roomId,
    })
}

/**
 * 保存互动数据
 * @param event 事件类型
 * @param data  事件数据
 */
export const saveStageInteract = (room_id: number, company_code: string, event:any, data: IEventData) => {
    return axios.post(`${prefix}classroom/courseware/del`, {
        data,
        event,
        room_id,
        company_code,
    })
}

/**
 * 读取互动数据
 */
export const getStageInteract = (room_id: number, company_code: string) => {
    return axios.post(`${prefix}stage/load`, {
        room_id,
        company_code,
    })
}

/**
 * 保存用户设备接口
 * @param hash              浏览器hash值
 * @param camera            摄像头
 * @param microphone        麦克风
 */
export const saveDevice = (camera: string, microphone: string) => {
    return axios.post(`${prefix}device/save`, {
        hash: new Fingerprint({ canvas: true, screen_resolution: true }).get(),
        camera,
        microphone
    })
}


/** 
 * 读取用户设备接口
*/
export const getDevice = () => {
    return axios.post(`${prefix}device/info`, {
        hash: new Fingerprint({ canvas: true, screen_resolution: true }).get(),
    })
}

/**
 * 进入教室
 * @param param 
 */
export const enterClassRoom = (param: IRoomEntry) => {
    return axios.get(`${prefix}room_member/entry`, {
        params: param
    })
}

/**
 * 离开教室
 * @param companyCode 
 * @param roomId 
 * @param memberId 
 * @param memberType        用户类型 1:学生，2:老师，3:家长，4:管理员
 * @param leaveType         老师离开类型：0:下课 , 1:离开教室
 */
export const leaveClassRoom = (companyCode: string,  roomId: number, memberId: number, memberType:number, leaveType	: number) => {
    return axios.post(`${prefix}room_member/leave`, {
        roomId,
        memberId,
        leaveType,
        memberType,
        companyCode,
    })
}

/**
 * 获取用户信息
 */
export const getUserInfo = (room_id: number, member_id: number, member_type: number) => {
    return axios.post(`${prefix}room_member/member_info`, {
        room_id,
        member_id,
        member_type,
    })
}


/**
 * 更换老师
 * @param param 
 */
export const changeTeacher = (param: ITeacher) => {
    return axios.post(`classroom-soa/room_member/change_teacher`, param)
}


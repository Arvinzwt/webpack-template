import axios from '@/plugins/axios';
const prefix = `/classroom-soa/api/v1/`;

/**
 * 保存组聊(学生vs管理)
 * @param company_code 
 * @param room_id            教室id
 * @param message 
 * @param member_id          发送消息的用户id
 * @param main_member_id     学员ID 
 */
export const saveGroupStudentChat = (company_code: string, room_id: number, message: string, member_id:number, main_member_id:number) => {
    return axios.post(`${prefix}chat/group/student/save`, {
        message,
        room_id,
        member_id,
        company_code,
        main_member_id,
    })
}


/**
 * 读取组聊(学生vs管理)
 */
export const getGroupStudentChat = (company_code:string, room_id:string, main_member_id: number, page:number, size: number) => {
    return axios.post(`${prefix}chat/group/student/list`, {
        page,
        size,
        room_id,
        company_code,
        main_member_id,
        
    })
}

/**
 * 发送组聊(老师vs管理)
 */
export const saveGroupTeacherChat = (company_code: string, room_id: number, message: string, member_id:number, main_member_id:number) => {
    return axios.post(`${prefix}chat/group/teacher/save`, {
        message,
        room_id,
        member_id,
        company_code,
        main_member_id,
    })
}

/**
 * 读取组聊记录接口(老师与管理员)
 */
export const getGroupTeacherChat = (company_code:string, room_id:number, main_member_id: number, page:number, size: number) => {
    return axios.post(`${prefix}chat/group/teacher/list`, {
        page,
        size,
        room_id,
        company_code,
        main_member_id,
        
    })
}

/**
 * 发送聊天
 */
export const saveChat = (company_code:string, room_id:number, message: string, member_id: number) => {
    return axios.post(`${prefix}chat/save`, {
        message,
        room_id,
        member_id,
        company_code,
    })
}


/**
 * 读取聊天记录接口
 */
export const getChatList = (company_code:string, room_id:number, page: number, size: number) => {
    return axios.post(`${prefix}chat/save`, {
        page,
        size,
        room_id,
        company_code,
    })
}

/**
 * 获取表情包
 * @param company_code 
 */
export const getEmojiList = (company_code: string) => {
    return axios.post(`${prefix}emoticon/list`, {
        company_code,
    })
}
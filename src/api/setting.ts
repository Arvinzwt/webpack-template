import axios from '@/plugins/axios'

const prefix = `/classroom-soa/api/v1/`

/**
 * 读取所有默认配置
 */
export const getSetAllList = () => {
    return axios.post(`${prefix}setting/default/list/all`)
}

/**
 * 保存默认配置
 * @param setting_key 配置key
 * @param setting_value 配置value
 */
export const saveDefaultSet = (setting_key:string, setting_value: string) => {
    return axios.post(`${prefix}setting/default/save`, {
        setting_key,
        setting_value,
    })
}

/**
 * 默认配置项-删除
 * @param id 
 */
export const delDefaultSet = (id: number) => {
    return axios.post(`${prefix}setting/default/delete/${id}`)
}

/**
 * 保存企业配置
 * @param setting_key 
 * @param company_code 
 * @param setting_value 
 */
export const saveCompanySet = (setting_key: string, company_code: string, setting_value: string) => {
    return axios.post(`${prefix}setting/company/save`, {
        setting_key,
        company_code,
        setting_value,
    })
}


/**
 * 企业配置-列出所有
 * @param company_code 
 */
export const getCompanyAllSet = (company_code: string) => {
    return axios.post(`${prefix}setting/default/list/all`, {
        company_code
    })
}

/**
 * 教室配置-保存
 */
export const saveRoomSet = (room_id: string ,company_code: string, setting_key: string, setting_value: string) => {
    return axios.post(`${prefix}setting/room/save`, {
        room_id,
        setting_key,
        company_code,
        setting_value,
    })
}

/**
 * 仅获取教室配置表中的数据
 * @param company_code 
 * @param room_id 
 */
export const getRoomSetList = (company_code: string, room_id: number) => {
    return axios.post(`${prefix}setting/room/list`, {
        room_id,
        company_code,
    })
}

/**
 * 获取配置 - 包括默认配置，公司配置与 - 教室配置。
 * 若有相同setting_key, 优先级为 教室 > 公司 > 默认
 * @param company_code 
 * @param room_id 
 */
export const getSettingAll = (company_code: string, room_id: number) => {
    return axios.post(`${prefix}setting/room/get`, {
        room_id,
        company_code,
    })
}
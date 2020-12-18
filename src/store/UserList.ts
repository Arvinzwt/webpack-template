interface IUser {
    avatar: string;
    user_id: number;
    nickname: string;
    user_type: number;
    external_id: number;
}

/**
 * 此模块维护整个系统对用户属性
 */
export default {
    namespaced: true,
    state: {
        avatar: null,
        nickname: "UU-Teacher",
        id: "",
        time: null,
        uuid: ''
    },
    mutations: {

    },
    actions: {
        
    },
    getters: {

    }
}
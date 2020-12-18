enum Types {
    SET_USER = 'setUser',
    MERGER_TEACHER = 'mergerTeacher',
    TIMER_CHANGE = 'timerChange'
}
export { Types };

interface IUser {
    avatar: string;
    user_id: number;
    nickname: string;
    user_type: number;
    external_id: number;
}

/**
 * 此模块维护当前用户的属性
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
        [Types.SET_USER](state: any, teacher: IUser) {
            state.uuid = teacher.external_id;
            state.photo = teacher.avatar;
            state.name = teacher.nickname;
            state.id = teacher.user_id;
            state.type = teacher.user_type;
        },

        [Types.TIMER_CHANGE](state: any, time: any) {
            state.time = time;
        }
    },
    actions: {
        setUser({ commit }: any, teacher: IUser) {
            commit(Types.SET_USER, teacher);
        }
    },
    getters: {

    }
}
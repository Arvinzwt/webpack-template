import types from './mutation-types';
import { ClockTime, formatTimeValue } from '@/utils/Clock'

interface ITeacher {
    avatar: string;
    user_id: number;
    nickname: string;
    user_type: number;
    external_id: number;
}
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
        [types.SETTEACHER](state:any, teacher:ITeacher) {
            state.uuid = teacher.external_id;
            state.photo = teacher.avatar;
            state.name = teacher.nickname;
            state.id = teacher.user_id;
            state.type = teacher.user_type;
        },

        [types.TIMER_CHANGE](state:any, time:any) {
            state.time = time;
        }
    },
    actions: {
        setTeacher({ commit }:any, teacher: ITeacher) {
            commit(types.SETTEACHER, teacher);
        },

        setTime({ commit }:any) {
            //时钟计时器，模拟
            const clock = new ClockTime();
            if(clock.startTimeDifference) return false;
            clock.startTime = parseInt(new Date().getTime() - 20 + '');
            clock.serverTime = parseInt(new Date().getTime() - 10 + '');
            clock.on('change', data => {
                commit(types.TIMER_CHANGE, formatTimeValue(clock.startTimeDifference));
            });
            clock.start();
        }
    },
    getters: {

    }
}
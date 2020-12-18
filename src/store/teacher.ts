import { ClockTime, formatTimeValue } from '@/utils/Clock'

enum Types {
    SET_TEACHER = 'setTeacher',
    MERGER_TEACHER = 'mergerTeacher',
    TIMER_CHANGE = 'timerChange'
}

interface ITeacher {
    avatar: string;
    user_id: number;
    nickname: string;
    user_type: number;
    external_id: number;
}

/**
 * 此模块维护当前教室老师的属性
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
        [Types.SET_TEACHER](state:any, teacher:ITeacher) {
            state.uuid = teacher.external_id;
            state.photo = teacher.avatar;
            state.name = teacher.nickname;
            state.id = teacher.user_id;
            state.type = teacher.user_type;
        },

        [Types.TIMER_CHANGE](state:any, time:any) {
            state.time = time;
        }
    },
    actions: {
        setTeacher({ commit }:any, teacher: ITeacher) {
            commit(Types.SET_TEACHER, teacher);
        },

        setTime({ commit }:any) {
            //时钟计时器，模拟
            const clock = new ClockTime();
            if(clock.startTimeDifference) return false;
            clock.startTime = parseInt(new Date().getTime() - 20 + '');
            clock.serverTime = parseInt(new Date().getTime() - 10 + '');
            clock.on('change', data => {
                commit(Types.TIMER_CHANGE, formatTimeValue(clock.startTimeDifference));
            });
            clock.start();
        }
    },
    getters: {

    }
}
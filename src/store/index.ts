import Vue from 'vue'
import Vuex from 'vuex'
import Socket from './socket'
import User from './User';
import UserList from './UserList';
import Teacher from './teacher'
// vuex-persistedstate默认持久化所有state，指定需要持久化的state
import createPersistedState from "vuex-persistedstate"

Vue.use(Vuex)
export default new Vuex.Store({
    modules: {
        Socket,
        User,
        UserList,
        Teacher,
    }
})

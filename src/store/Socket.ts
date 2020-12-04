export default {
    namespaced: true,
    state: {

    },
    actions: {
        SOCKET_enterSuccess({ commit }: any, data: any) {
            console.log('actions--Socket--enterSuccess', data);
        },
        SOCKET_offline({ commit }: any, data: any) {
            console.log('actions--Socket--offline', data);
        },
        SOCKET_enterReject({ commit }: any, data: any) {
            console.log('actions--Socket--enterReject', data);
        }
    },
    mutations: {
        SOCKET_list(state: any, data: any) {
            console.log('mutations----SOCKET_list', data);
        }
    },
    getters: {

    }
}

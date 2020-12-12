import Vue from 'vue';

class Api {
    // @ts-ignore
    getClassInfo = (options = {}) => Vue.axios.post('info', options).then((res: { data: any; }) => res.data).catch((err: any) => err);
}

export default new Api();
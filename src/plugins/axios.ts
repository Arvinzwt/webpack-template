"use strict";

import axios from "axios";
import { Message } from 'element-ui';

let config = {
    baseURL: process.env.VUE_APP_API_BASEURL || "",
    timeout: 60 * 1000, // Timeout
    headers: {
        'company-code' : 'uuabc',
    }
    // withCredentials: true, // Check cross-site Access-Control
};

const _axios = axios.create(config);

_axios.interceptors.request.use(
    function (config) {
        return config;
    },
    function (error) {
        return Promise.reject(error);
    }
);


_axios.interceptors.response.use(
    (response:any): any => {
        const { status, data } = response;
        if(data.code == 200) {
            return Promise.resolve(response.data);
        } else {
            Message.error(data.msg);
            return Promise.reject(data);
        }
    },
    (error) => {
        if (error) {
            console.log(error);
            
            const { response } = error;
            errorHandle(response);

            return Promise.reject(response);
        } else {
            Message.error('请检查检查网络')
        }
    }
);

/**
 * 请求失败后的错误统一处理
 * @param response 
 */
const errorHandle = (response: any) => {
    console.error(response);
    Message.error(`error`)
}

export default _axios;

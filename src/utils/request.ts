// api.js

// 引入 axios
import axios from "axios";
// 引入 element-ui 信息
import { Message } from "element-ui";
import router from "@/router";

// 创建 axios 实例
const httptool = axios.create({
    timeout: 300000,
});

// 传送 json 格式的 post 请求
export const postRequest = (url: string, params: any) => {
    return httptool.post(`${url}`, params);
}

// 传送 json 格式的 put 请求
export const putRequest = (url: string, params: any) => {
    return httptool.put(`${url}`, params);
}

// 传送 json 格式的 get 请求
export const getRequest = (url: string) => {
    return httptool.get(`${url}`);
}

// 传送 json 格式的 delete 请求
export const deleteRequest = (url: string, params: any) => {
    return httptool.delete(`${url}`, { data: params });
}

// 请求拦截器
httptool.interceptors.request.use(config => {
    const token = window.localStorage.getItem('token') || window.sessionStorage.getItem('token');
    if (token) {
        config.headers['token'] = token;
    }
    return config;
}, error => {
    console.log(error);
    return Promise.reject(error);
});

// 报错响应
httptool.interceptors.response.use(
    response => {
        // 对响应数据做处理
        return response;
    },
    error => {
        if (error.response && error.response.status === 401) {
            Message({
                type: 'warning',
                message: '尚未登录，请登录！',
                offset: 54
            });
            router.push('/login');
        } else {
            Message.error('网络好像有点问题');
            return Promise.reject(error);
        }
    }
);

// 导出请求方法
export default {
    postRequest,
    putRequest,
    getRequest,
    deleteRequest,
};

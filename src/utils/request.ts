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
// 传送表单格式的 post 请求
export const postRequestForm = (url: string, params: { [key: string]: any }) => {
    const formData = new FormData();
    for (const key in params) {
        // eslint-disable-next-line no-prototype-builtins
        if (params.hasOwnProperty(key)) {
            formData.append(key, params[key]);
        }
    }

    return httptool.post(`${url}`, formData, {
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded' // 或者 'multipart/form-data'
        }
    });
}


// 传送 json 格式的 put 请求
export const putRequest = (url: string, params: any) => {
    return httptool.put(`${url}`,{}, {params});
}

// 传送 json 格式的 put 请求
export const putRequestJson = (url: string, data: any) => {
    return httptool.put(`${url}`, data);
}

// 传送 json 格式的 get 请求
export const getRequest = (url: string) => {
    return httptool.get(`${url}`);
}

// 传送表单格式的 get 请求
export const getRequestForm = (url: string, params: { [key: string]: any }) => {
    const queryString = new URLSearchParams(params).toString();
    return httptool.get(`${url}?${queryString}`);
}

// 传送 json 格式的 delete 请求
export const deleteRequest = (url: string, data: any) => {
    return httptool.delete(`${url}`, { data: data });
}

// 传送 查询 格式的 delete 请求
export const deleteRequestForm = (url: string, params: any) => {
    return httptool.delete(`${url}`, { params: params });
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
        }
        return new Promise(() => {console.log(error.response)});// 返回一个未完成的 Promise，阻止外部继续处理
    }
);

// 导出请求方法
export default {
    postRequest,
    putRequest,
    putRequestJson,
    getRequest,
    deleteRequest,
};

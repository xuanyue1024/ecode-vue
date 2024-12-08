import {
    deleteRequest,
    deleteRequestForm,
    getRequest,
    getRequestForm,
    postRequestForm,
    putRequest
} from "@/utils/request";

/*
* 老师
*
* */

// 添加班级
export const addClass = (name: any) =>
    postRequestForm('/api/teacher/class',name)

//班级分页查询

export const pageClass = ( data: any) =>
    getRequestForm("/api/teacher/class/page", data)

//批量删除班级
export const deleteBatchClass = (ids:string) =>
    deleteRequestForm("/api/teacher/class", {"ids": ids})

//修改班级名称
export const updateClassName = (id: string, name: string) =>
    putRequest("/api/teacher/class", { "id": id, "name": name });

/*
* 学生
*
* */
//班级分页查询

export const pageClassForStudent = ( data: any) =>
    getRequestForm("/api/student/class/page", data)

//加入班级
export const joinClass = ( invitationCode: string) =>
    getRequestForm("/api/student/class", {"invitationCode": invitationCode})

//批量退出班级
export const exitBatchClass = (ids:string) =>
    deleteRequestForm("/api/student/class", {"ids": ids})
import {deleteRequest, deleteRequestForm, getRequest, getRequestForm, postRequestForm} from "@/utils/request";

// 添加班级
export const addClass = (name: any) =>
    postRequestForm('/api/teacher/class',name)

//班级分页查询

export const pageClass = ( data: any) =>
    getRequestForm("/api/teacher/class/page", data)

//批量删除班级
export const deleteBatchClass = (ids:string) =>
    deleteRequestForm("/api/teacher/class", {"ids": ids})

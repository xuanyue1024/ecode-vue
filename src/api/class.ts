import {postRequestForm} from "@/utils/request";

// 添加班级
export const addClass = (name: any) =>
    postRequestForm('/api/teacher/addClass',name)
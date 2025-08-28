
import 'element-plus/dist/index.css'
import axios from 'axios'
import { ElMessage } from 'element-plus'

const request = axios.create({
    baseURL: '/api',
    timeout: 10000
})

// 請求攔截器
request.interceptors.request.use(
    config => {
        // 可以在這裡添加 token
        const token = localStorage.getItem('token')
        if (token) {
            config.headers.Authorization = `Bearer ${token}`
        }
        return config
    },
    error => {
        return Promise.reject(error)
    }
)

// 響應攔截器
request.interceptors.response.use(
    response => {
        const res = response.data
        if (res.success) {
            return res.data
        } else {
            ElMessage.error(res.message || '請求失敗')
            return Promise.reject(new Error(res.message || '請求失敗'))
        }
    },
    error => {
        ElMessage.error(error.message || '網絡錯誤')
        return Promise.reject(error)
    }
)

// API 方法
export const studentAPI = {
    getList: () => request.get('/students'),
    getById: (id) => request.get(`/students/${id}`),
    create: (data) => request.post('/students', data),
    update: (id, data) => request.put(`/students/${id}`, data),
    delete: (id) => request.delete(`/students/${id}`),
    search: (keyword) => request.get('/students/search', { params: { keyword } })
}

export const courseAPI = {
    getList: () => request.get('/courses'),
    getById: (id) => request.get(`/courses/${id}`),
    getBySemester: (semester) => request.get(`/courses/semester/${semester}`),
    getAvailable: () => request.get('/courses/available'),
    create: (data) => request.post('/courses', data),
    update: (id, data) => request.put(`/courses/${id}`, data),
    delete: (id) => request.delete(`/courses/${id}`)
}

export const enrollmentAPI = {
    enroll: (data) => request.post('/enrollments', data),
    updateGrade: (id, score) => request.put(`/enrollments/${id}/grade`, null, { params: { score } }),
    dropCourse: (id) => request.put(`/enrollments/${id}/drop`),
    getByStudent: (studentId) => request.get(`/enrollments/student/${studentId}`),
    getByCourse: (courseId) => request.get(`/enrollments/course/${courseId}`)
}

export const teacherAPI = {
    getList: () => request.get('/teachers'),
    getById: (id) => request.get(`/teachers/${id}`),
    create: (data) => request.post('/teachers', data),
    update: (id, data) => request.put(`/teachers/${id}`, data),
    delete: (id) => request.delete(`/teachers/${id}`)
}

export default request
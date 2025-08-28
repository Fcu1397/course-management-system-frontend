import { defineStore } from 'pinia'
import { studentAPI, courseAPI, enrollmentAPI, teacherAPI } from '@/api'

export const useCourseStore = defineStore('course', {
    state: () => ({
        students: [],
        courses: [],
        enrollments: [],
        teachers: [],
        loading: false
    }),

    getters: {
        availableCourses: (state) => {
            return state.courses.filter(course =>
                course.status === 'OPEN' &&
                course.currentEnrollment < course.maxStudents
            )
        },

        getStudentById: (state) => (id) => {
            return state.students.find(s => s.studentId === id)
        },

        getCourseById: (state) => (id) => {
            return state.courses.find(c => c.courseId === id)
        }
    },

    actions: {
        async fetchStudents() {
            this.loading = true
            try {
                this.students = await studentAPI.getList()
            } finally {
                this.loading = false
            }
        },

        async fetchCourses() {
            this.loading = true
            try {
                this.courses = await courseAPI.getList()
            } finally {
                this.loading = false
            }
        },

        async fetchEnrollments() {
            this.loading = true
            try {
                this.enrollments = await enrollmentAPI.getList()
            } finally {
                this.loading = false
            }
        },

        async fetchTeachers() {
            this.loading = true
            try {
                this.teachers = await teacherAPI.getList()
            } finally {
                this.loading = false
            }
        },

        async createStudent(data) {
            const result = await studentAPI.create(data)
            await this.fetchStudents()
            return result
        },

        async updateStudent(id, data) {
            const result = await studentAPI.update(id, data)
            await this.fetchStudents()
            return result
        },

        async deleteStudent(id) {
            await studentAPI.delete(id)
            await this.fetchStudents()
        },

        async createCourse(data) {
            const result = await courseAPI.create(data)
            await this.fetchCourses()
            return result
        },

        async enrollStudent(data) {
            const result = await enrollmentAPI.enroll(data)
            await this.fetchEnrollments()
            return result
        },

        async updateGrade(enrollmentId, score) {
            const result = await enrollmentAPI.updateGrade(enrollmentId, score)
            await this.fetchEnrollments()
            return result
        }
    }
})
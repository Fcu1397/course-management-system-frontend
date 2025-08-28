<template>
  <div class="student-management">
    <el-card>
      <template #header>
        <div class="card-header">
          <span>學生管理</span>
          <el-button type="primary" @click="handleAdd">
            <el-icon><Plus /></el-icon>
            新增學生
          </el-button>
        </div>
      </template>

      <el-row :gutter="20" class="mb-4">
        <el-col :span="8">
          <el-input
              v-model="searchText"
              placeholder="搜尋學生姓名或學號"
              clearable
              @clear="handleSearch"
              @keyup.enter="handleSearch"
          >
            <template #prefix>
              <el-icon><Search /></el-icon>
            </template>
          </el-input>
        </el-col>
        <el-col :span="2">
          <el-button @click="handleSearch">搜尋</el-button>
        </el-col>
      </el-row>

      <el-table
          :data="filteredStudents"
          v-loading="store.loading"
          stripe
          style="width: 100%"
      >
        <el-table-column prop="studentCode" label="學號" width="120" />
        <el-table-column label="姓名">
          <template #default="{ row }">
            {{ row.firstName }}{{ row.lastName }}
          </template>
        </el-table-column>
        <el-table-column prop="email" label="Email" />
        <el-table-column prop="phone" label="電話" />
        <el-table-column label="狀態" width="100">
          <template #default="{ row }">
            <el-tag :type="getStatusType(row.status)">
              {{ row.status }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column label="操作" width="200" fixed="right">
          <template #default="{ row }">
            <el-button type="primary" link @click="handleView(row)">
              查看
            </el-button>
            <el-button type="primary" link @click="handleEdit(row)">
              編輯
            </el-button>
            <el-button type="danger" link @click="handleDelete(row)">
              刪除
            </el-button>
          </template>
        </el-table-column>
      </el-table>

      <el-pagination
          v-model:current-page="currentPage"
          v-model:page-size="pageSize"
          :page-sizes="[10, 20, 50]"
          :total="filteredStudents.length"
          layout="total, sizes, prev, pager, next, jumper"
          class="mt-4"
      />
    </el-card>

    <!-- 新增/編輯對話框 -->
    <el-dialog
        v-model="dialogVisible"
        :title="isEdit ? '編輯學生' : '新增學生'"
        width="500px"
    >
      <el-form :model="form" :rules="rules" ref="formRef" label-width="100px">
        <el-form-item label="學號" prop="studentCode">
          <el-input v-model="form.studentCode" :disabled="isEdit" />
        </el-form-item>
        <el-form-item label="姓" prop="firstName">
          <el-input v-model="form.firstName" />
        </el-form-item>
        <el-form-item label="名" prop="lastName">
          <el-input v-model="form.lastName" />
        </el-form-item>
        <el-form-item label="Email" prop="email">
          <el-input v-model="form.email" />
        </el-form-item>
        <el-form-item label="電話" prop="phone">
          <el-input v-model="form.phone" />
        </el-form-item>
        <el-form-item label="生日" prop="dateOfBirth">
          <el-date-picker
              v-model="form.dateOfBirth"
              type="date"
              placeholder="選擇日期"
              format="YYYY-MM-DD"
              value-format="YYYY-MM-DD"
          />
        </el-form-item>
        <el-form-item label="地址" prop="address">
          <el-input v-model="form.address" type="textarea" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="dialogVisible = false">取消</el-button>
        <el-button type="primary" @click="handleSubmit">確認</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { useCourseStore } from '@/stores/course'

const store = useCourseStore()
const formRef = ref()
const dialogVisible = ref(false)
const isEdit = ref(false)
const searchText = ref('')
const currentPage = ref(1)
const pageSize = ref(10)

const form = reactive({
  studentCode: '',
  firstName: '',
  lastName: '',
  email: '',
  phone: '',
  dateOfBirth: '',
  address: ''
})

const rules = reactive({
  studentCode: [{ required: true, message: '請輸入學號', trigger: 'blur' }],
  firstName: [{ required: true, message: '請輸入姓', trigger: 'blur' }],
  lastName: [{ required: true, message: '請輸入名', trigger: 'blur' }],
  email: [
    { required: true, message: '請輸入Email', trigger: 'blur' },
    { type: 'email', message: '請輸入正確的Email格式', trigger: 'blur' }
  ]
})

const filteredStudents = computed(() => {
  let result = store.students
  if (searchText.value) {
    result = result.filter(s =>
        s.firstName.includes(searchText.value) ||
        s.lastName.includes(searchText.value) ||
        s.studentCode.includes(searchText.value)
    )
  }
  return result
})

const getStatusType = (status) => {
  const map = {
    'ACTIVE': 'success',
    'INACTIVE': 'warning',
    'GRADUATED': 'info',
    'SUSPENDED': 'danger'
  }
  return map[status] || 'info'
}

const handleAdd = () => {
  isEdit.value = false
  resetForm()
  dialogVisible.value = true
}

const handleEdit = (row) => {
  isEdit.value = true
  Object.assign(form, row)
  dialogVisible.value = true
}

const handleView = (row) => {
  ElMessageBox.alert(
      `<div>
      <p><strong>學號：</strong>${row.studentCode}</p>
      <p><strong>姓名：</strong>${row.firstName}${row.lastName}</p>
      <p><strong>Email：</strong>${row.email}</p>
      <p><strong>電話：</strong>${row.phone || '未填寫'}</p>
      <p><strong>地址：</strong>${row.address || '未填寫'}</p>
      <p><strong>狀態：</strong>${row.status}</p>
    </div>`,
      '學生詳情',
      {
        dangerouslyUseHTMLString: true,
        confirmButtonText: '確定'
      }
  )
}

const handleDelete = async (row) => {
  try {
    await ElMessageBox.confirm(
        `確定要刪除學生 ${row.firstName}${row.lastName} 嗎？`,
        '警告',
        {
          confirmButtonText: '確定',
          cancelButtonText: '取消',
          type: 'warning'
        }
    )
    await store.deleteStudent(row.studentId)
    ElMessage.success('刪除成功')
  } catch (e) {
    if (e !== 'cancel') {
      ElMessage.error('刪除失敗')
    }
  }
}

const handleSubmit = async () => {
  const valid = await formRef.value.validate()
  if (!valid) return

  try {
    if (isEdit.value) {
      await store.updateStudent(form.studentId, form)
      ElMessage.success('更新成功')
    } else {
      await store.createStudent(form)
      ElMessage.success('新增成功')
    }
    dialogVisible.value = false
  } catch (error) {
    ElMessage.error(isEdit.value ? '更新失敗' : '新增失敗')
  }
}

const handleSearch = () => {
  currentPage.value = 1
}

const resetForm = () => {
  Object.keys(form).forEach(key => {
    form[key] = ''
  })
}

onMounted(() => {
  store.fetchStudents()
})
</script>

<style scoped>
.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}
.mb-4 {
  margin-bottom: 16px;
}
.mt-4 {
  margin-top: 16px;
}
</style>
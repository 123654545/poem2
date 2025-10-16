<template>
  <div class="register-page">
    <div class="register-container">
      <el-card class="register-card">
        <template #header>
          <h2 class="register-title">注册账号</h2>
        </template>

        <el-form :model="registerForm" :rules="registerRules" ref="registerFormRef">
          <el-form-item prop="username">
            <el-input
              v-model="registerForm.username"
              placeholder="用户名"
              size="large"
              :prefix-icon="User"
            />
          </el-form-item>

          <el-form-item prop="email">
            <el-input
              v-model="registerForm.email"
              placeholder="邮箱"
              size="large"
              :prefix-icon="Message"
            />
          </el-form-item>

          <el-form-item prop="password">
            <el-input
              v-model="registerForm.password"
              type="password"
              placeholder="密码"
              size="large"
              :prefix-icon="Lock"
              show-password
            />
          </el-form-item>

          <el-form-item prop="confirmPassword">
            <el-input
              v-model="registerForm.confirmPassword"
              type="password"
              placeholder="确认密码"
              size="large"
              :prefix-icon="Lock"
              show-password
            />
          </el-form-item>

          <el-form-item>
            <el-checkbox v-model="agreeTerms">
              我已阅读并同意 <el-link type="primary">服务条款</el-link>
            </el-checkbox>
          </el-form-item>

          <el-form-item>
            <el-button 
              type="primary" 
              size="large" 
              class="register-btn"
              :loading="loading"
              @click="handleRegister"
            >
              注册
            </el-button>
          </el-form-item>
        </el-form>

        <div class="register-footer">
          <p>已有账号? <el-link type="primary" @click="goToLogin">立即登录</el-link></p>
        </div>
      </el-card>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useStore } from 'vuex'
import { User, Lock, Message } from '@element-plus/icons-vue'
import { ElMessage } from 'element-plus'

const router = useRouter()
const store = useStore()

const registerFormRef = ref()
const loading = ref(false)
const agreeTerms = ref(false)

const registerForm = ref({
  username: '',
  email: '',
  password: '',
  confirmPassword: ''
})

const validateConfirmPassword = (rule, value, callback) => {
  if (value !== registerForm.value.password) {
    callback(new Error('两次输入的密码不一致'))
  } else {
    callback()
  }
}

const registerRules = {
  username: [
    { required: true, message: '请输入用户名', trigger: 'blur' },
    { min: 3, max: 20, message: '用户名长度在 3 到 20 个字符', trigger: 'blur' }
  ],
  email: [
    { required: true, message: '请输入邮箱地址', trigger: 'blur' },
    { type: 'email', message: '请输入正确的邮箱地址', trigger: 'blur' }
  ],
  password: [
    { required: true, message: '请输入密码', trigger: 'blur' },
    { min: 6, message: '密码长度不能少于6位', trigger: 'blur' }
  ],
  confirmPassword: [
    { required: true, message: '请再次输入密码', trigger: 'blur' },
    { validator: validateConfirmPassword, trigger: 'blur' }
  ]
}

const handleRegister = async () => {
  if (!registerFormRef.value) return

  if (!agreeTerms.value) {
    ElMessage.error('请同意服务条款')
    return
  }

  try {
    await registerFormRef.value.validate()
    loading.value = true

    // 调用Supabase注册API
    const result = await store.dispatch('register', {
      email: registerForm.value.email,
      password: registerForm.value.password,
      userData: {
        username: registerForm.value.username
      }
    })

    if (result.success) {
      ElMessage.success('注册成功，请检查您的邮箱确认账户')
      router.push('/login')
    } else {
      ElMessage.error(result.error || '注册失败')
    }
  } catch (error) {
    console.log('表单验证失败:', error)
    ElMessage.error('表单验证失败')
  } finally {
    loading.value = false
  }
}

const goToLogin = () => {
  router.push('/login')
}
</script>

<style scoped>
.register-page {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
}

.register-container {
  width: 100%;
  max-width: 450px;
  padding: 20px;
}

.register-card {
  border-radius: 8px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
}

.register-title {
  text-align: center;
  color: #333;
  margin: 0;
}

.register-btn {
  width: 100%;
}

.register-footer {
  text-align: center;
  margin-top: 1rem;
  color: #666;
}
</style>
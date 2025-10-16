<template>
  <div class="login-page">
    <div class="login-container">
      <el-card class="login-card">
        <template #header>
          <h2 class="login-title">登录</h2>
        </template>

        <el-form :model="loginForm" :rules="loginRules" ref="loginFormRef">
          <el-form-item prop="username">
            <el-input
              v-model="loginForm.username"
              placeholder="用户名或邮箱"
              size="large"
              :prefix-icon="User"
            />
          </el-form-item>

          <el-form-item prop="password">
            <el-input
              v-model="loginForm.password"
              type="password"
              placeholder="密码"
              size="large"
              :prefix-icon="Lock"
              show-password
            />
          </el-form-item>

          <el-form-item>
            <el-checkbox v-model="rememberMe">记住我</el-checkbox>
            <el-link type="primary" class="forgot-link">忘记密码?</el-link>
          </el-form-item>

          <el-form-item>
            <el-button 
              type="primary" 
              size="large" 
              class="login-btn"
              :loading="loading"
              @click="handleLogin"
            >
              登录
            </el-button>
          </el-form-item>
        </el-form>

        <div class="login-footer">
          <p>还没有账号? <el-link type="primary" @click="goToRegister">立即注册</el-link></p>
        </div>
      </el-card>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useStore } from 'vuex'
import { User, Lock } from '@element-plus/icons-vue'
import { ElMessage } from 'element-plus'

const router = useRouter()
const store = useStore()

const loginFormRef = ref()
const loading = ref(false)
const rememberMe = ref(false)

const loginForm = ref({
  username: '',
  password: ''
})

const loginRules = {
  username: [
    { required: true, message: '请输入用户名或邮箱', trigger: 'blur' }
  ],
  password: [
    { required: true, message: '请输入密码', trigger: 'blur' },
    { min: 6, message: '密码长度不能少于6位', trigger: 'blur' }
  ]
}

const handleLogin = async () => {
  if (!loginFormRef.value) return

  try {
    await loginFormRef.value.validate()
    loading.value = true

    // 调用Supabase登录API
    const result = await store.dispatch('login', {
      email: loginForm.value.username,
      password: loginForm.value.password
    })

    if (result.success) {
      ElMessage.success('登录成功')
      router.push('/')
    } else {
      if (result.error === 'Email not confirmed') {
        ElMessage.warning('请先检查您的邮箱并确认账户')
      } else {
        ElMessage.error(result.error || '登录失败')
      }
    }
  } catch (error) {
    console.log('表单验证失败:', error)
    ElMessage.error('表单验证失败')
  } finally {
    loading.value = false
  }
}

const goToRegister = () => {
  router.push('/register')
}
</script>

<style scoped>
.login-page {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
}

.login-container {
  width: 100%;
  max-width: 400px;
  padding: 20px;
}

.login-card {
  border-radius: 8px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
}

.login-title {
  text-align: center;
  color: #333;
  margin: 0;
}

.forgot-link {
  float: right;
}

.login-btn {
  width: 100%;
}

.login-footer {
  text-align: center;
  margin-top: 1rem;
  color: #666;
}
</style>
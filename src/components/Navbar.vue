<template>
  <el-header class="navbar">
    <div class="container">
      <div class="navbar-content">
        <!-- Logo -->
        <router-link to="/" class="logo">
          <span class="logo-text">古诗词鉴赏</span>
        </router-link>

        <!-- 导航菜单 -->
        <el-menu
          :default-active="activeIndex"
          class="nav-menu"
          mode="horizontal"
          :ellipsis="false"
          @select="handleSelect"
        >
          <el-menu-item index="/">首页</el-menu-item>
          <el-menu-item index="/poems">诗词库</el-menu-item>
          <el-menu-item index="/authors">诗人词人</el-menu-item>
          <el-menu-item index="/search">搜索</el-menu-item>
        </el-menu>

        <!-- 用户操作区 -->
        <div class="user-actions">
          <template v-if="isAuthenticated">
            <el-dropdown>
              <span class="user-info">
                <el-avatar :size="32" :src="user.avatar" />
                <span class="username">{{ user.username }}</span>
              </span>
              <template #dropdown>
                <el-dropdown-menu>
                  <el-dropdown-item @click="goToProfile">
                    <el-icon><User /></el-icon>个人中心
                  </el-dropdown-item>
                  <el-dropdown-item @click="goToFavorites">
                    <el-icon><Star /></el-icon>我的收藏
                  </el-dropdown-item>
                  <el-dropdown-item @click="logout">
                    <el-icon><SwitchButton /></el-icon>退出登录
                  </el-dropdown-item>
                </el-dropdown-menu>
              </template>
            </el-dropdown>
          </template>
          <template v-else>
            <el-button type="primary" link @click="goToLogin">登录</el-button>
            <el-button type="primary" link @click="goToRegister">注册</el-button>
          </template>
          

        </div>
      </div>
    </div>
  </el-header>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useStore } from 'vuex'
import { User, SwitchButton, Star } from '@element-plus/icons-vue'

const router = useRouter()
const route = useRoute()
const store = useStore()

const activeIndex = ref('/')

const isAuthenticated = computed(() => store.getters.isAuthenticated)
const user = computed(() => store.state.user || { username: '用户', avatar: '' })

const handleSelect = (index) => {
  router.push(index)
}

const goToLogin = () => {
  router.push('/login')
}

const goToRegister = () => {
  router.push('/register')
}

const goToProfile = () => {
  router.push('/profile')
}

const goToFavorites = () => {
  router.push('/favorites')
}

const goToAdmin = () => {
  router.push('/admin')
}

const logout = () => {
  store.dispatch('logout')
  router.push('/')
}

// 监听路由变化更新激活菜单
import { watch } from 'vue'
watch(() => route.path, (newPath) => {
  activeIndex.value = newPath
}, { immediate: true })
</script>

<style scoped>
.navbar {
  background: white;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.1);
  position: sticky;
  top: 0;
  z-index: 1000;
}

.navbar-content {
  display: flex;
  align-items: center;
  justify-content: space-between;
  height: 60px;
}

.logo {
  text-decoration: none;
  font-size: 1.5rem;
  font-weight: bold;
  color: #409EFF;
}

.logo-text {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
}

.nav-menu {
  border-bottom: none;
  flex: 1;
  justify-content: center;
}

.user-actions {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.user-info {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  cursor: pointer;
  padding: 0.5rem;
  border-radius: 4px;
}

.user-info:hover {
  background: #f5f7fa;
}

.username {
  font-weight: 500;
  color: #333;
}
</style>
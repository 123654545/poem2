<template>
  <div class="profile-page">
    <header class="page-header">
      <div class="container">
        <h1 class="page-title">个人中心</h1>
      </div>
    </header>

    <main class="container">
      <div v-if="isLoading" class="loading-container">
        <el-skeleton :rows="6" animated />
      </div>
      
      <div v-else class="profile-content">
        <!-- 个人信息 -->
        <section class="profile-section">
          <el-card>
            <template #header>
              <h3>个人信息</h3>
            </template>
            
            <div class="profile-info">
              <div class="avatar-section">
                <el-avatar :size="100" :src="userInfo.avatar" />
                <el-button type="primary" link>更换头像</el-button>
              </div>
              
              <div class="info-section">
                <el-form :model="userInfo" label-width="80px">
                  <el-form-item label="用户名">
                    <el-input v-model="userInfo.username" />
                  </el-form-item>
                  <el-form-item label="邮箱">
                    <el-input v-model="userInfo.email" />
                  </el-form-item>
                  <el-form-item label="个人简介">
                    <el-input 
                      v-model="userInfo.bio" 
                      type="textarea" 
                      :rows="3"
                      placeholder="介绍一下自己..."
                    />
                  </el-form-item>
                  <el-form-item>
                    <el-button type="primary" @click="updateProfile">保存修改</el-button>
                  </el-form-item>
                </el-form>
              </div>
            </div>
          </el-card>
        </section>

        <!-- 统计数据 -->
        <section class="stats-section">
          <el-row :gutter="20">
            <el-col :span="6">
              <el-statistic title="收藏诗词" :value="userStats.favorites" />
            </el-col>
            <el-col :span="6">
              <el-statistic title="发表评论" :value="userStats.comments" />
            </el-col>
            <el-col :span="6">
              <el-statistic title="发布鉴赏" :value="userStats.appreciations" />
            </el-col>
            <el-col :span="6">
              <el-statistic title="关注用户" :value="userStats.following" />
            </el-col>
          </el-row>
        </section>

        <!-- 我的收藏 -->
        <section class="favorites-section">
          <el-card>
            <template #header>
              <h3>我的收藏</h3>
            </template>
            
            <el-table :data="favoritePoems" empty-text="暂无收藏">
              <el-table-column prop="title" label="诗词标题" />
              <el-table-column prop="author" label="作者" width="120" />
              <el-table-column prop="dynasty" label="朝代" width="80" />
              <el-table-column label="操作" width="120">
                <template #default="scope">
                  <el-button link type="primary" @click="viewPoem(scope.row.id)">
                    查看
                  </el-button>
                  <el-button link type="danger" @click="removeFavorite(scope.row.id)">
                    取消收藏
                  </el-button>
                </template>
              </el-table-column>
            </el-table>
          </el-card>
        </section>

        <!-- 我的评论 -->
        <section class="comments-section">
          <el-card>
            <template #header>
              <h3>我的评论</h3>
            </template>
            
            <div v-for="comment in userComments" :key="comment.id" class="comment-item">
              <div class="comment-header">
                <span class="poem-title">{{ comment.poemTitle }}</span>
                <span class="comment-time">{{ comment.time }}</span>
              </div>
              <div class="comment-content">{{ comment.content }}</div>
              <div class="comment-actions">
                <el-button link type="primary" @click="viewPoem(comment.poemId)">
                  查看诗词
                </el-button>
                <el-button link type="danger" @click="deleteComment(comment.id)">
                  删除
                </el-button>
              </div>
            </div>
          </el-card>
        </section>
      </div>
    </main>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useStore } from 'vuex'
import { ElMessage, ElSkeleton } from 'element-plus'
import { supabase } from '@/utils/supabase'

const router = useRouter()
const store = useStore()

const userInfo = ref({
  username: '',
  email: '',
  bio: '',
  avatar: ''
})

const userStats = ref({
  favorites: 0,
  comments: 0,
  appreciations: 0,
  following: 0
})

const favoritePoems = ref([])
const userComments = ref([])
const isLoading = ref(true)

// 获取用户数据
const fetchUserData = async () => {
  try {
    const currentUser = store.state.user
    if (!currentUser) return
    
    // 获取用户基本信息
    const { data: userData, error: userError } = await supabase
      .from('users')
      .select('*')
      .eq('id', currentUser.id)
      .single()
    
    if (userError) throw userError
    
    if (userData) {
      userInfo.value = {
        username: userData.username || currentUser.email?.split('@')[0] || '用户',
        email: currentUser.email || '',
        bio: userData.bio || '',
        avatar: userData.avatar || ''
      }
    }
    
    // 获取收藏统计
    const { count: favoritesCount, error: favoritesError } = await supabase
      .from('favorites')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', currentUser.id)
    
    if (!favoritesError) {
      userStats.value.favorites = favoritesCount || 0
    }
    
    // 获取评论统计
    const { count: commentsCount, error: commentsError } = await supabase
      .from('comments')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', currentUser.id)
    
    if (!commentsError) {
      userStats.value.comments = commentsCount || 0
    }
    
    // 获取用户收藏的诗词
    const { data: favoritesData, error: favoritesDataError } = await supabase
      .from('favorites')
      .select('poem_id')
      .eq('user_id', currentUser.id)
    
    if (!favoritesDataError && favoritesData && favoritesData.length > 0) {
      // 获取诗词详情
      const poemIds = favoritesData.map(fav => fav.poem_id)
      const { data: poemsData, error: poemsError } = await supabase
        .from('poems')
        .select('id, title, author, dynasty')
        .in('id', poemIds)
      
      if (!poemsError && poemsData) {
        favoritePoems.value = poemsData
      }
    }
    
    // 获取用户评论
    const { data: commentsData, error: commentsDataError } = await supabase
      .from('comments')
      .select(`
        id,
        content,
        created_at,
        poems (
          id,
          title
        )
      `)
      .eq('user_id', currentUser.id)
      .order('created_at', { ascending: false })
    
    if (!commentsDataError && commentsData) {
      userComments.value = commentsData.map(comment => ({
        id: comment.id,
        poemId: comment.poems.id,
        poemTitle: comment.poems.title,
        content: comment.content,
        time: new Date(comment.created_at).toLocaleDateString()
      }))
    }
    
  } catch (error) {
    console.error('获取用户数据失败:', error)
    ElMessage.error('获取用户数据失败')
  } finally {
    isLoading.value = false
  }
}

const updateProfile = async () => {
  try {
    const currentUser = store.state.user
    if (!currentUser) return
    
    const { error } = await supabase
      .from('users')
      .upsert({
        id: currentUser.id,
        username: userInfo.value.username,
        bio: userInfo.value.bio,
        avatar: userInfo.value.avatar,
        updated_at: new Date().toISOString()
      })
    
    if (error) throw error
    
    ElMessage.success('个人信息更新成功')
  } catch (error) {
    console.error('更新个人信息失败:', error)
    ElMessage.error('更新失败，请重试')
  }
}

const viewPoem = (poemId) => {
  router.push({ name: 'PoemDetail', params: { id: poemId } })
}

const removeFavorite = async (poemId) => {
  try {
    const currentUser = store.state.user
    if (!currentUser) return
    
    const { error } = await supabase
      .from('favorites')
      .delete()
      .eq('user_id', currentUser.id)
      .eq('poem_id', poemId)
    
    if (error) throw error
    
    // 从列表中移除
    favoritePoems.value = favoritePoems.value.filter(poem => poem.id !== poemId)
    userStats.value.favorites = favoritePoems.value.length
    
    ElMessage.success('取消收藏成功')
  } catch (error) {
    console.error('取消收藏失败:', error)
    ElMessage.error('取消收藏失败，请重试')
  }
}

const deleteComment = async (commentId) => {
  try {
    const { error } = await supabase
      .from('comments')
      .delete()
      .eq('id', commentId)
    
    if (error) throw error
    
    // 从列表中移除
    userComments.value = userComments.value.filter(comment => comment.id !== commentId)
    userStats.value.comments = userComments.value.length
    
    ElMessage.success('评论删除成功')
  } catch (error) {
    console.error('删除评论失败:', error)
    ElMessage.error('删除失败，请重试')
  }
}

onMounted(async () => {
  // 等待Vuex store初始化完成
  await new Promise(resolve => setTimeout(resolve, 100))
  fetchUserData()
})
</script>

<style scoped>
.loading-container {
  max-width: 1000px;
  margin: 0 auto;
  padding: 2rem;
}

.profile-content {
  max-width: 1000px;
  margin: 0 auto;
}

.profile-section,
.stats-section,
.favorites-section,
.comments-section {
  margin-bottom: 2rem;
}

.profile-info {
  display: flex;
  gap: 2rem;
}

.avatar-section {
  text-align: center;
  flex-shrink: 0;
}

.info-section {
  flex: 1;
}

.comment-item {
  border-bottom: 1px solid #eee;
  padding: 1rem 0;
}

.comment-item:last-child {
  border-bottom: none;
}

.comment-header {
  display: flex;
  justify-content: space-between;
  margin-bottom: 0.5rem;
}

.poem-title {
  font-weight: bold;
  color: #333;
}

.comment-time {
  color: #999;
  font-size: 0.9rem;
}

.comment-content {
  line-height: 1.5;
  color: #666;
  margin-bottom: 0.5rem;
}

.comment-actions {
  text-align: right;
}
</style>
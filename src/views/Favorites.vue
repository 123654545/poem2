<template>
  <div class="favorites-page">
    <header class="page-header">
      <div class="container">
        <h1 class="page-title">我的收藏</h1>
        <p class="page-subtitle">您收藏的诗词作品</p>
      </div>
    </header>

    <main class="container">
      <div class="favorites-content">
        <!-- 收藏列表 -->
        <section class="favorites-section">
          <div v-if="favorites.length === 0" class="empty-state">
            <el-empty description="暂无收藏的诗词">
              <el-button type="primary" @click="$router.push('/')">去发现诗词</el-button>
            </el-empty>
          </div>

          <div v-else class="favorites-list">
            <div v-for="favorite in favorites" :key="favorite.id" class="favorite-item">
              <div class="poem-card">
                <div class="poem-header">
                  <h3 class="poem-title" @click="goToPoemDetail(favorite.poem_id)">
                    {{ favorite.poems?.title || '未知标题' }}
                  </h3>
                  <el-button 
                    type="danger" 
                    size="small" 
                    @click="removeFavorite(favorite.id)"
                  >
                    取消收藏
                  </el-button>
                </div>
                
                <div class="poem-info">
                  <span class="author">{{ favorite.poems?.authors?.name || '未知作者' }}</span>
                  <span class="dynasty">{{ favorite.poems?.authors?.dynasty || '未知朝代' }}</span>
                </div>
                
                <div class="poem-preview">
                  <pre>{{ getPoemPreview(favorite.poems?.content) }}</pre>
                </div>
                
                <div class="poem-actions">
                  <span class="favorite-time">
                    收藏于 {{ formatDate(favorite.created_at) }}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </section>
      </div>
    </main>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useStore } from 'vuex'
import { ElMessage, ElMessageBox } from 'element-plus'
import { supabase } from '@/utils/supabase'

const router = useRouter()
const store = useStore()

const favorites = ref([])
const loading = ref(false)

// 获取用户收藏列表
const fetchFavorites = async () => {
  try {
    loading.value = true
    const currentUser = store.state.user
    if (!currentUser) {
      ElMessage.warning('请先登录')
      router.push('/login')
      return
    }

    const { data, error } = await supabase
      .from('favorites')
      .select(`
        *,
        poems (
          *,
          authors (*)
        )
      `)
      .eq('user_id', currentUser.id)
      .order('created_at', { ascending: false })

    if (error) throw error
    
    favorites.value = data || []
  } catch (error) {
    console.error('获取收藏列表失败:', error)
    ElMessage.error('获取收藏列表失败')
  } finally {
    loading.value = false
  }
}

// 取消收藏
const removeFavorite = async (favoriteId) => {
  try {
    const result = await ElMessageBox.confirm(
      '确定要取消收藏吗？',
      '取消收藏',
      {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }
    )

    if (result) {
      const { error } = await supabase
        .from('favorites')
        .delete()
        .eq('id', favoriteId)

      if (error) throw error
      
      ElMessage.success('取消收藏成功')
      // 重新加载收藏列表
      await fetchFavorites()
    }
  } catch (error) {
    if (error !== 'cancel') {
      console.error('取消收藏失败:', error)
      ElMessage.error('取消收藏失败')
    }
  }
}

// 跳转到诗词详情
const goToPoemDetail = (poemId) => {
  router.push(`/poem/${poemId}`)
}

// 获取诗词预览（前两行）
const getPoemPreview = (content) => {
  if (!content) return '暂无内容'
  const lines = content.split('\n').slice(0, 2)
  return lines.join('\n')
}

// 格式化日期
const formatDate = (dateString) => {
  if (!dateString) return ''
  return new Date(dateString).toLocaleDateString('zh-CN')
}

onMounted(() => {
  fetchFavorites()
})
</script>

<style scoped>
.favorites-content {
  max-width: 1000px;
  margin: 0 auto;
}

.favorites-section {
  margin-bottom: 2rem;
}

.empty-state {
  text-align: center;
  padding: 4rem 0;
}

.favorites-list {
  display: grid;
  gap: 1.5rem;
  grid-template-columns: repeat(auto-fill, minmax(350px, 1fr));
}

.favorite-item {
  background: white;
  border-radius: 8px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.1);
  transition: transform 0.2s, box-shadow 0.2s;
}

.favorite-item:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.15);
}

.poem-card {
  padding: 1.5rem;
}

.poem-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 1rem;
}

.poem-title {
  margin: 0;
  font-size: 1.2rem;
  font-weight: bold;
  color: #333;
  cursor: pointer;
  transition: color 0.2s;
}

.poem-title:hover {
  color: #409eff;
}

.poem-info {
  margin-bottom: 1rem;
}

.author {
  font-weight: bold;
  color: #666;
  margin-right: 1rem;
}

.dynasty {
  color: #999;
  font-size: 0.9rem;
}

.poem-preview pre {
  font-family: 'SimSun', serif;
  font-size: 1rem;
  line-height: 1.6;
  color: #666;
  white-space: pre-wrap;
  margin: 0;
  max-height: 4rem;
  overflow: hidden;
}

.poem-actions {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: 1rem;
  padding-top: 1rem;
  border-top: 1px solid #eee;
}

.favorite-time {
  color: #999;
  font-size: 0.8rem;
}
</style>
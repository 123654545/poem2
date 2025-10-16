<template>
  <div class="poem-detail-page" v-if="poem">
    <header class="page-header">
      <div class="container">
        <h1 class="page-title">{{ poem.title }}</h1>
        <p class="page-subtitle">{{ poem.author }} · {{ poem.dynasty }}</p>
      </div>
    </header>

    <main class="container">
      <div class="poem-content">
        <!-- 诗词内容 -->
        <section class="poem-section">
          <div class="poem-text">
            <pre>{{ poem.content }}</pre>
          </div>
          <div class="poem-actions">
            <el-button type="primary" :icon="Star" @click="toggleFavorite">
              {{ isFavorite ? '已收藏' : '收藏' }}
            </el-button>
            <el-button :icon="Share">分享</el-button>
          </div>
        </section>

        <!-- 注释和译文 -->
        <section class="annotation-section">
          <el-tabs v-model="activeTab">
            <el-tab-pane label="注释" name="annotation">
              <div class="annotation-content">
                <p v-for="(note, index) in annotations" :key="index">
                  <strong>{{ note.word }}：</strong>{{ note.explanation }}
                </p>
              </div>
            </el-tab-pane>
            <el-tab-pane label="译文" name="translation">
              <div class="translation-content">
                <p>{{ translation }}</p>
              </div>
            </el-tab-pane>
            <el-tab-pane label="赏析" name="appreciation">
              <div class="appreciation-content">
                <p>{{ appreciation }}</p>
              </div>
            </el-tab-pane>
          </el-tabs>
        </section>

        <!-- 评论区域 -->
        <section class="comments-section">
          <h3>评论</h3>
          <div class="comment-form">
            <el-input
              v-model="newComment"
              type="textarea"
              :rows="3"
              placeholder="写下您的评论..."
              maxlength="500"
              show-word-limit
            />
            <div class="comment-actions">
              <el-button type="primary" @click="submitComment">发表评论</el-button>
            </div>
          </div>

          <div class="comments-list">
            <div v-for="comment in comments" :key="comment.id" class="comment-item">
              <div class="comment-header">
                <span class="user-name">{{ comment.userName }}</span>
                <span class="comment-time">{{ comment.time }}</span>
              </div>
              <div class="comment-content">
                {{ comment.content }}
              </div>
              <div class="comment-actions">
                <el-button link type="primary" @click="likeComment(comment.id)">
                  点赞 ({{ comment.likes }})
                </el-button>
                <el-button link type="primary" @click="replyComment(comment.id)">
                  回复
                </el-button>
              </div>
            </div>
          </div>
        </section>
      </div>
    </main>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import { useStore } from 'vuex'
import { Star, Share } from '@element-plus/icons-vue'
import { ElMessage } from 'element-plus'
import { supabase } from '@/utils/supabase'

const route = useRoute()
const store = useStore()

const poemId = route.params.id
const poem = ref(null)
const isFavorite = ref(false)
const activeTab = ref('annotation')
const newComment = ref('')
const comments = ref([])
const userFavorites = ref([])
const annotations = ref([])
const translation = ref('')
const appreciation = ref('')

// 获取诗词详情
const fetchPoemDetail = async () => {
  try {
    // 并行获取诗词详情、注释、译文、赏析
    const [poemData, annotationsData, translationData, appreciationData] = await Promise.all([
      // 获取诗词详情
      supabase
        .from('poems')
        .select(`
          *,
          authors (name, dynasty)
        `)
        .eq('id', poemId)
        .single(),
      
      // 获取注释数据
      supabase
        .from('poem_annotations')
        .select('*')
        .eq('poem_id', poemId)
        .order('created_at'),
      
      // 获取译文数据
      supabase
        .from('poem_translations')
        .select('*')
        .eq('poem_id', poemId),
      
      // 获取赏析数据
      supabase
        .from('poem_appreciations')
        .select('*')
        .eq('poem_id', poemId)
    ])
    
    // 处理诗词详情
    if (poemData.error) throw poemData.error
    const authorInfo = poemData.data.authors || {}
    poem.value = {
      ...poemData.data,
      author: authorInfo.name || '未知作者',
      dynasty: authorInfo.dynasty || '未知朝代'
    }
    
    // 处理注释数据
    if (!annotationsData.error && annotationsData.data) {
      annotations.value = annotationsData.data.map(item => ({
        word: item.word,
        explanation: item.explanation
      }))
    } else {
      // 如果没有注释数据，使用默认值
      annotations.value = [
        { word: '床前', explanation: '床铺前面' },
        { word: '明月光', explanation: '明亮的月光' },
        { word: '疑是', explanation: '怀疑是' },
        { word: '地上霜', explanation: '地上的霜' }
      ]
    }
    
    // 处理译文数据
    if (!translationData.error && translationData.data && translationData.data.length > 0) {
      translation.value = translationData.data[0].translation
    } else {
      translation.value = '暂无译文数据'
    }
    
    // 处理赏析数据
    if (!appreciationData.error && appreciationData.data && appreciationData.data.length > 0) {
      appreciation.value = appreciationData.data[0].appreciation
    } else {
      appreciation.value = '暂无赏析数据'
    }
    
  } catch (error) {
    console.error('获取诗词详情失败:', error)
  }
}

// 获取评论列表
const fetchComments = async () => {
  try {
    const { data, error } = await supabase
      .from('comments')
      .select(`
        *,
        users (username)
      `)
      .eq('poem_id', poemId)
      .order('created_at', { ascending: false })
    
    if (error) throw error
    comments.value = data.map(comment => ({
      id: comment.id,
      userName: comment.users?.username || '匿名用户',
      time: new Date(comment.created_at).toLocaleDateString(),
      content: comment.content,
      likes: comment.likes_count
    }))
  } catch (error) {
    console.error('获取评论失败:', error)
  }
}

// 检查用户是否已收藏
const checkFavorite = async () => {
  try {
    const currentUser = store.state.user
    if (!currentUser || !currentUser.id) return
    
    // 验证ID格式
    if (!poemId || typeof poemId !== 'string') {
      console.warn('诗词ID格式不正确:', poemId)
      return
    }
    
    const { data, error } = await supabase
      .from('favorites')
      .select('id')
      .eq('user_id', currentUser.id)
      .eq('poem_id', poemId)
    
    if (error) {
      console.error('检查收藏状态失败:', error)
      return
    }
    
    // 如果找到记录，设置收藏状态
    isFavorite.value = data && data.length > 0
  } catch (error) {
    console.error('检查收藏状态异常:', error)
  }
}

const toggleFavorite = async () => {
  try {
    const currentUser = store.state.user
    if (!currentUser) {
      ElMessage.warning('请先登录后再收藏')
      return
    }

    if (isFavorite.value) {
      // 取消收藏
      const { error } = await supabase
        .from('favorites')
        .delete()
        .eq('user_id', currentUser.id)
        .eq('poem_id', poemId)
      
      if (error) throw error
      isFavorite.value = false
      ElMessage.success('已取消收藏')
    } else {
      // 添加收藏
      const { error } = await supabase
        .from('favorites')
        .insert({
          user_id: currentUser.id,
          poem_id: poemId
        })
      
      if (error) throw error
      isFavorite.value = true
      ElMessage.success('收藏成功')
    }
  } catch (error) {
    console.error('收藏操作失败:', error)
    ElMessage.error('操作失败，请重试')
  }
}

const submitComment = async () => {
  if (!newComment.value.trim()) {
    ElMessage.warning('请输入评论内容')
    return
  }

  try {
    const currentUser = store.state.user
    if (!currentUser) {
      ElMessage.warning('请先登录后再发表评论')
      return
    }

    const { error } = await supabase
      .from('comments')
      .insert({
        poem_id: poemId,
        user_id: currentUser.id,
        content: newComment.value.trim()
      })

    if (error) throw error
    
    ElMessage.success('评论发表成功')
    newComment.value = ''
    // 重新加载评论列表
    await fetchComments()
  } catch (error) {
    console.error('发表评论失败:', error)
    ElMessage.error('评论发表失败，请重试')
  }
}

const likeComment = async (commentId) => {
  try {
    const currentUser = store.state.user
    if (!currentUser) {
      ElMessage.warning('请先登录后再点赞')
      return
    }

    const { error } = await supabase
      .from('comments')
      .update({ likes_count: supabase.sql`likes_count + 1` })
      .eq('id', commentId)

    if (error) throw error
    
    ElMessage.success('点赞成功')
    // 重新加载评论列表
    await fetchComments()
  } catch (error) {
    console.error('点赞失败:', error)
    ElMessage.error('点赞失败，请重试')
  }
}

const replyComment = (commentId) => {
  // 回复功能实现
  console.log('回复评论:', commentId)
}

onMounted(async () => {
  // 获取诗词详情
  await fetchPoemDetail()
  // 获取评论列表
  await fetchComments()
  // 检查收藏状态
  await checkFavorite()
})
</script>

<style scoped>
.poem-content {
  max-width: 800px;
  margin: 0 auto;
}

.poem-section {
  text-align: center;
  margin-bottom: 3rem;
  padding: 2rem;
  background: white;
  border-radius: 8px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.1);
}

.poem-text pre {
  font-family: 'SimSun', serif;
  font-size: 1.4rem;
  line-height: 2;
  white-space: pre-wrap;
  margin-bottom: 2rem;
}

.poem-actions {
  margin-top: 1rem;
}

.annotation-section,
.comments-section {
  margin-bottom: 2rem;
  background: white;
  border-radius: 8px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.1);
  padding: 1.5rem;
}

.annotation-content p,
.translation-content p,
.appreciation-content p {
  line-height: 1.8;
  margin-bottom: 1rem;
  color: #333;
}

.comment-form {
  margin-bottom: 2rem;
}

.comment-actions {
  margin-top: 1rem;
  text-align: right;
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
  justify-content: between;
  align-items: center;
  margin-bottom: 0.5rem;
}

.user-name {
  font-weight: bold;
  color: #333;
}

.comment-time {
  color: #999;
  font-size: 0.9rem;
}

.comment-content {
  line-height: 1.6;
  color: #666;
  margin-bottom: 0.5rem;
}
</style>
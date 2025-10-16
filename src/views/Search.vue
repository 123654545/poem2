<template>
  <div class="search-page">
    <header class="page-header">
      <div class="container">
        <h1 class="page-title">搜索</h1>
        <p class="page-subtitle">找到您感兴趣的诗词</p>
      </div>
    </header>

    <main class="container">
      <!-- 搜索框 -->
      <section class="search-box">
        <el-input
          v-model="searchQuery"
          placeholder="输入诗词名、作者、内容或关键词..."
          size="large"
          @keyup.enter="performSearch"
        >
          <template #append>
            <el-button @click="performSearch" :icon="Search">搜索</el-button>
          </template>
        </el-input>
      </section>

      <!-- 搜索结果 -->
      <section v-if="searchResults.length > 0" class="search-results">
        <h2>找到 {{ searchResults.length }} 个结果</h2>
        
        <div class="results-tabs">
          <el-tabs v-model="activeTab">
            <el-tab-pane label="诗词" name="poems">
              <div class="poems-results">
                <el-card 
                  v-for="poem in poemResults" 
                  :key="poem.id"
                  class="result-card"
                >
                  <div class="result-content">
                    <h3>{{ poem.title }}</h3>
                    <p class="meta">{{ poem.author }} · {{ poem.dynasty }}</p>
                    <p class="content">{{ highlightKeywords(poem.content) }}</p>
                    <el-button 
                      type="primary" 
                      link 
                      @click="viewPoemDetail(poem.id)"
                    >
                      查看详情
                    </el-button>
                  </div>
                </el-card>
              </div>
            </el-tab-pane>
            
            <el-tab-pane label="作者" name="authors">
              <div class="authors-results">
                <el-card 
                  v-for="author in authorResults" 
                  :key="author.id"
                  class="result-card"
                >
                  <div class="result-content">
                    <h3>{{ author.name }}</h3>
                    <p class="meta">{{ author.dynasty }}代 · {{ author.worksCount }} 首作品</p>
                    <p class="intro">{{ highlightKeywords(author.intro) }}</p>
                    <el-button 
                      type="primary" 
                      link 
                      @click="viewAuthorDetail(author.id)"
                    >
                      查看详情
                    </el-button>
                  </div>
                </el-card>
              </div>
            </el-tab-pane>
          </el-tabs>
        </div>
      </section>

      <!-- 无结果提示 -->
      <section v-else-if="hasSearched" class="no-results">
        <el-empty description="没有找到相关结果" />
      </section>

      <!-- 搜索提示 -->
      <section v-else class="search-tips">
        <el-card>
          <h3>搜索提示</h3>
          <ul>
            <li>可以搜索诗词标题，如"静夜思"</li>
            <li>可以搜索作者姓名，如"李白"</li>
            <li>可以搜索诗词内容，如"明月光"</li>
            <li>可以搜索关键词，如"思乡"、"春天"</li>
          </ul>
        </el-card>
      </section>
    </main>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useStore } from 'vuex'
import { Search } from '@element-plus/icons-vue'

const route = useRoute()
const router = useRouter()
const store = useStore()

const searchQuery = ref(route.query.q || '')
const activeTab = ref('poems')
const hasSearched = ref(false)

// 模拟搜索结果
const searchResults = ref([])

const poemResults = computed(() => 
  searchResults.value.filter(item => item.type === 'poem')
)

const authorResults = computed(() => 
  searchResults.value.filter(item => item.type === 'author')
)

const performSearch = () => {
  if (!searchQuery.value.trim()) return

  hasSearched.value = true
  
  // 模拟搜索逻辑
  const mockResults = [
    {
      id: 1,
      type: 'poem',
      title: '静夜思',
      author: '李白',
      dynasty: '唐',
      content: '床前明月光，疑是地上霜。举头望明月，低头思故乡。'
    },
    {
      id: 2,
      type: 'author',
      name: '李白',
      dynasty: '唐',
      worksCount: 1000,
      intro: '李白（701年－762年），字太白，号青莲居士，唐朝浪漫主义诗人。'
    }
  ]

  searchResults.value = mockResults.filter(item => 
    JSON.stringify(item).toLowerCase().includes(searchQuery.value.toLowerCase())
  )
}

const highlightKeywords = (text) => {
  if (!searchQuery.value) return text
  
  const regex = new RegExp(`(${searchQuery.value})`, 'gi')
  return text.replace(regex, '<mark>$1</mark>')
}

const viewPoemDetail = (poemId) => {
  router.push({ name: 'PoemDetail', params: { id: poemId } })
}

const viewAuthorDetail = (authorId) => {
  router.push({ name: 'AuthorDetail', params: { id: authorId } })
}

onMounted(() => {
  if (searchQuery.value) {
    performSearch()
  }
})
</script>

<style scoped>
.search-box {
  max-width: 600px;
  margin: 0 auto 3rem;
}

.search-results h2 {
  margin-bottom: 1.5rem;
  color: #333;
}

.results-tabs {
  background: white;
  border-radius: 8px;
  overflow: hidden;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.1);
}

.result-card {
  margin-bottom: 1rem;
}

.result-card:last-child {
  margin-bottom: 0;
}

.result-content h3 {
  color: #333;
  margin-bottom: 0.5rem;
}

.meta {
  color: #666;
  font-size: 0.9rem;
  margin-bottom: 0.5rem;
}

.content, .intro {
  color: #888;
  line-height: 1.5;
  margin-bottom: 1rem;
}

mark {
  background-color: yellow;
  padding: 0 2px;
}

.search-tips {
  max-width: 500px;
  margin: 0 auto;
}

.search-tips h3 {
  margin-bottom: 1rem;
}

.search-tips ul {
  padding-left: 1.5rem;
}

.search-tips li {
  margin-bottom: 0.5rem;
  color: #666;
}
</style>
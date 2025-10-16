<template>
  <div class="home">
    <header class="page-header">
      <div class="container">
        <h1 class="page-title">古诗词鉴赏</h1>
        <p class="page-subtitle">传承千年文化，品味诗词之美</p>
      </div>
    </header>

    <main class="container">
      <!-- 搜索区域 -->
      <section class="search-section">
        <el-input
          v-model="searchQuery"
          placeholder="搜索诗词、作者或关键词..."
          size="large"
          @keyup.enter="handleSearch"
        >
          <template #append>
            <el-button @click="handleSearch" :icon="Search">搜索</el-button>
          </template>
        </el-input>
      </section>

      <!-- 分类导航 -->
      <section class="categories-section">
        <h2 class="section-title">诗词分类</h2>
        <div class="categories-grid">
          <el-card 
            v-for="category in categories" 
            :key="category.id"
            class="category-card"
            shadow="hover"
            @click="handleCategoryClick(category)"
          >
            <div class="category-content">
              <el-icon :size="40" :color="category.color">
                <component :is="category.icon" />
              </el-icon>
              <h3>{{ category.name }}</h3>
              <p>{{ category.description }}</p>
            </div>
          </el-card>
        </div>
      </section>

      <!-- 推荐诗词 -->
      <section class="featured-section">
        <h2 class="section-title">今日推荐</h2>
        <div class="poems-grid">
          <el-card 
            v-for="poem in featuredPoems" 
            :key="poem.id"
            class="poem-card"
            shadow="hover"
          >
            <div class="poem-content">
              <h3>{{ poem.title }}</h3>
              <p class="author">{{ poem.author }} · {{ poem.dynasty }}</p>
              <p class="excerpt">{{ poem.content.substring(0, 50) }}...</p>
              <div class="tags">
                <el-tag 
                  v-for="tag in poem.tags" 
                  :key="tag"
                  size="small"
                  type="info"
                >
                  {{ tag }}
                </el-tag>
              </div>
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
      </section>
    </main>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import { useStore } from 'vuex'
import { Search } from '@element-plus/icons-vue'

const router = useRouter()
const store = useStore()

const searchQuery = ref('')

const categories = ref([
  { id: 1, name: '唐诗', icon: 'Reading', color: '#409EFF', description: '唐代诗歌精选' },
  { id: 2, name: '宋词', icon: 'Notebook', color: '#67C23A', description: '宋代词作经典' },
  { id: 3, name: '元曲', icon: 'Headset', color: '#E6A23C', description: '元代戏曲佳作' },
  { id: 4, name: '诗经', icon: 'Collection', color: '#F56C6C', description: '古代诗歌总集' }
])

const featuredPoems = computed(() => store.getters.featuredPoems)

const handleSearch = () => {
  if (searchQuery.value.trim()) {
    router.push({ name: 'Search', query: { q: searchQuery.value } })
  }
}

const handleCategoryClick = (category) => {
  router.push({ name: 'Poems', query: { category: category.name } })
}

const viewPoemDetail = (poemId) => {
  router.push({ name: 'PoemDetail', params: { id: poemId } })
}

// 初始化数据
store.dispatch('fetchPoems')
</script>

<style scoped>
.search-section {
  margin-bottom: 3rem;
  max-width: 600px;
  margin-left: auto;
  margin-right: auto;
}

.section-title {
  font-size: 1.8rem;
  margin-bottom: 1.5rem;
  color: #333;
  text-align: center;
}

.categories-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 1.5rem;
  margin-bottom: 3rem;
}

.category-card {
  cursor: pointer;
  transition: transform 0.3s ease;
}

.category-card:hover {
  transform: translateY(-5px);
}

.category-content {
  text-align: center;
  padding: 1.5rem;
}

.category-content h3 {
  margin: 1rem 0 0.5rem;
  font-size: 1.3rem;
}

.category-content p {
  color: #666;
  font-size: 0.9rem;
}

.poems-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 1.5rem;
}

.poem-card {
  height: 100%;
}

.poem-content h3 {
  font-size: 1.2rem;
  margin-bottom: 0.5rem;
  color: #333;
}

.author {
  color: #666;
  font-size: 0.9rem;
  margin-bottom: 0.5rem;
}

.excerpt {
  color: #888;
  font-size: 0.9rem;
  margin-bottom: 1rem;
  line-height: 1.5;
}

.tags {
  margin-bottom: 1rem;
}

.tags .el-tag {
  margin-right: 0.5rem;
  margin-bottom: 0.5rem;
}
</style>
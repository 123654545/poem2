<template>
  <div class="authors-page">
    <header class="page-header">
      <div class="container">
        <h1 class="page-title">诗人词人</h1>
        <p class="page-subtitle">了解诗词背后的文人墨客</p>
      </div>
    </header>

    <main class="container">
      <!-- 朝代筛选 -->
      <section class="dynasty-filter">
        <el-radio-group v-model="selectedDynasty">
          <el-radio-button label="全部" />
          <el-radio-button label="唐" />
          <el-radio-button label="宋" />
          <el-radio-button label="元" />
          <el-radio-button label="明" />
          <el-radio-button label="清" />
        </el-radio-group>
      </section>

      <!-- 作者列表 -->
      <section class="authors-grid">
        <el-card 
          v-for="author in filteredAuthors" 
          :key="author.id"
          class="author-card"
          shadow="hover"
        >
          <div class="author-content">
            <div class="author-avatar">
              <el-avatar :size="80" :src="author.avatar" />
            </div>
            <div class="author-info">
              <h3>{{ author.name }}</h3>
              <p class="dynasty">{{ author.dynasty }}代</p>
              <p class="intro">{{ author.intro.substring(0, 100) }}...</p>
              <div class="stats">
                <span>作品: {{ author.worksCount }}</span>
                <span>收藏: {{ author.followers }}</span>
              </div>
              <el-button 
                type="primary" 
                link 
                @click="viewAuthorDetail(author.id)"
              >
                查看详情
              </el-button>
            </div>
          </div>
        </el-card>
      </section>
    </main>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'

const router = useRouter()
const selectedDynasty = ref('全部')

// 模拟作者数据
const authors = ref([
  {
    id: 1,
    name: '李白',
    dynasty: '唐',
    intro: '李白（701年－762年），字太白，号青莲居士，唐朝浪漫主义诗人，被后人誉为"诗仙"。',
    worksCount: 1000,
    followers: 5000,
    avatar: ''
  },
  {
    id: 2,
    name: '杜甫',
    dynasty: '唐',
    intro: '杜甫（712年－770年），字子美，自号少陵野老，唐代伟大的现实主义诗人。',
    worksCount: 1400,
    followers: 4500,
    avatar: ''
  },
  {
    id: 3,
    name: '苏轼',
    dynasty: '宋',
    intro: '苏轼（1037年－1101年），字子瞻，号东坡居士，北宋文学家、书画家。',
    worksCount: 2700,
    followers: 3800,
    avatar: ''
  }
])

const filteredAuthors = computed(() => {
  if (selectedDynasty.value === '全部') {
    return authors.value
  }
  return authors.value.filter(author => author.dynasty === selectedDynasty.value)
})

const viewAuthorDetail = (authorId) => {
  router.push({ name: 'AuthorDetail', params: { id: authorId } })
}
</script>

<style scoped>
.dynasty-filter {
  margin-bottom: 2rem;
  text-align: center;
}

.authors-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(350px, 1fr));
  gap: 1.5rem;
}

.author-card {
  height: 100%;
}

.author-content {
  display: flex;
  gap: 1.5rem;
  padding: 1rem;
}

.author-avatar {
  flex-shrink: 0;
}

.author-info {
  flex: 1;
}

.author-info h3 {
  font-size: 1.3rem;
  margin-bottom: 0.5rem;
  color: #333;
}

.dynasty {
  color: #666;
  font-size: 0.9rem;
  margin-bottom: 0.5rem;
}

.intro {
  color: #888;
  line-height: 1.5;
  margin-bottom: 1rem;
}

.stats {
  display: flex;
  gap: 1rem;
  margin-bottom: 1rem;
  font-size: 0.9rem;
  color: #666;
}
</style>
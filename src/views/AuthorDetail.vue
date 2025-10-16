<template>
  <div class="author-detail-page" v-if="author">
    <header class="page-header">
      <div class="container">
        <h1 class="page-title">{{ author.name }}</h1>
        <p class="page-subtitle">{{ author.dynasty }}代诗人</p>
      </div>
    </header>

    <main class="container">
      <div class="author-content">
        <!-- 作者信息 -->
        <section class="author-info">
          <el-row :gutter="30">
            <el-col :span="6">
              <div class="author-avatar">
                <el-avatar :size="150" :src="author.avatar" />
              </div>
            </el-col>
            <el-col :span="18">
              <div class="author-details">
                <h2>{{ author.name }}</h2>
                <p class="dynasty">{{ author.dynasty }}代</p>
                <p class="lifespan">{{ author.birthYear }} - {{ author.deathYear }}</p>
                <div class="stats">
                  <el-statistic title="作品数量" :value="author.worksCount" />
                  <el-statistic title="被收藏" :value="author.followers" />
                </div>
                <el-button type="primary" :icon="Star">
                  关注作者
                </el-button>
              </div>
            </el-col>
          </el-row>
        </section>

        <!-- 作者简介 -->
        <section class="biography">
          <el-card>
            <template #header>
              <h3>作者简介</h3>
            </template>
            <div class="biography-content">
              <p v-for="(paragraph, index) in author.biography.split('\n')" :key="index">
                {{ paragraph }}
              </p>
            </div>
          </el-card>
        </section>

        <!-- 代表作品 -->
        <section class="works">
          <el-card>
            <template #header>
              <h3>代表作品</h3>
            </template>
            
            <div class="works-list">
              <el-card 
                v-for="poem in authorWorks" 
                :key="poem.id"
                class="work-card"
                shadow="hover"
              >
                <div class="work-content">
                  <h4>{{ poem.title }}</h4>
                  <p class="poem-excerpt">{{ poem.content.substring(0, 100) }}...</p>
                  <div class="work-actions">
                    <el-button 
                      type="primary" 
                      link 
                      @click="viewPoemDetail(poem.id)"
                    >
                      阅读全文
                    </el-button>
                  </div>
                </div>
              </el-card>
            </div>
          </el-card>
        </section>
      </div>
    </main>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { Star } from '@element-plus/icons-vue'

const route = useRoute()
const router = useRouter()

const author = ref(null)
const authorWorks = ref([])

onMounted(() => {
  // 模拟获取作者详情
  const authorId = route.params.id
  author.value = {
    id: authorId,
    name: '李白',
    dynasty: '唐',
    birthYear: '701',
    deathYear: '762',
    worksCount: 1000,
    followers: 5000,
    avatar: '',
    biography: `李白（701年－762年），字太白，号青莲居士，唐朝浪漫主义诗人，被后人誉为"诗仙"。祖籍陇西成纪（待考），出生于西域碎叶城，4岁再随父迁至剑南道绵州。李白存世诗文千余篇，有《李太白集》传世。762年病逝，享年61岁。其墓在今安徽当涂，四川江油、湖北安陆有纪念馆。

李白深受黄老列庄思想影响，有《李太白集》传世，诗作中多以醉时写的，代表作有《望庐山瀑布》《行路难》《蜀道难》《将进酒》《明堂赋》《早发白帝城》等多首。`
  }

  // 模拟获取作者作品
  authorWorks.value = [
    {
      id: 1,
      title: '静夜思',
      content: '床前明月光，疑是地上霜。举头望明月，低头思故乡。'
    },
    {
      id: 2,
      title: '望庐山瀑布',
      content: '日照香炉生紫烟，遥看瀑布挂前川。飞流直下三千尺，疑是银河落九天。'
    }
  ]
})

const viewPoemDetail = (poemId) => {
  router.push({ name: 'PoemDetail', params: { id: poemId } })
}
</script>

<style scoped>
.author-content {
  max-width: 1000px;
  margin: 0 auto;
}

.author-info {
  background: white;
  padding: 2rem;
  border-radius: 8px;
  margin-bottom: 2rem;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.1);
}

.author-avatar {
  text-align: center;
}

.author-details h2 {
  font-size: 2rem;
  margin-bottom: 0.5rem;
  color: #333;
}

.dynasty {
  font-size: 1.2rem;
  color: #666;
  margin-bottom: 0.5rem;
}

.lifespan {
  color: #888;
  margin-bottom: 1rem;
}

.stats {
  display: flex;
  gap: 2rem;
  margin-bottom: 1.5rem;
}

.biography,
.works {
  margin-bottom: 2rem;
}

.biography-content p {
  line-height: 1.8;
  margin-bottom: 1rem;
  text-indent: 2em;
}

.works-list {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 1rem;
}

.work-card {
  height: 100%;
}

.work-content h4 {
  color: #333;
  margin-bottom: 0.5rem;
}

.poem-excerpt {
  color: #666;
  line-height: 1.5;
  margin-bottom: 1rem;
}
</style>
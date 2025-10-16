<template>
  <div class="poems-page">
    <header class="page-header">
      <div class="container">
        <h1 class="page-title">诗词库</h1>
        <p class="page-subtitle">探索千年诗词文化</p>
      </div>
    </header>

    <main class="container">
      <!-- 筛选条件 -->
      <section class="filters-section">
        <el-row :gutter="20">
          <el-col :span="6">
            <el-select v-model="filters.dynasty" placeholder="选择朝代" clearable>
              <el-option label="唐代" value="唐" />
              <el-option label="宋代" value="宋" />
              <el-option label="元代" value="元" />
              <el-option label="明代" value="明" />
              <el-option label="清代" value="清" />
            </el-select>
          </el-col>
          <el-col :span="6">
            <el-select v-model="filters.type" placeholder="选择体裁" clearable>
              <el-option label="绝句" value="绝句" />
              <el-option label="律诗" value="律诗" />
              <el-option label="词" value="词" />
              <el-option label="曲" value="曲" />
            </el-select>
          </el-col>
          <el-col :span="6">
            <el-select v-model="filters.author" placeholder="选择作者" clearable>
              <el-option v-for="author in authors" :key="author.id" :label="author.name" :value="author.name" />
            </el-select>
          </el-col>
          <el-col :span="6">
            <el-button type="primary" @click="applyFilters">筛选</el-button>
            <el-button @click="resetFilters">重置</el-button>
          </el-col>
        </el-row>
      </section>

      <!-- 诗词列表 -->
      <section class="poems-list">
        <el-table :data="filteredPoems" style="width: 100%">
          <el-table-column prop="title" label="诗词标题" width="200">
            <template #default="scope">
              <router-link :to="`/poems/${scope.row.id}`" class="poem-link">
                {{ scope.row.title }}
              </router-link>
            </template>
          </el-table-column>
          <el-table-column prop="author" label="作者" width="120" />
          <el-table-column prop="dynasty" label="朝代" width="80" />
          <el-table-column prop="content" label="内容">
            <template #default="scope">
              <div class="poem-content">
                {{ scope.row.content.substring(0, 100) }}...
              </div>
            </template>
          </el-table-column>
          <el-table-column label="操作" width="120">
            <template #default="scope">
              <el-button link type="primary" @click="viewPoemDetail(scope.row.id)">
                查看详情
              </el-button>
            </template>
          </el-table-column>
        </el-table>

        <!-- 分页 -->
        <div class="pagination">
          <el-pagination
            v-model:current-page="currentPage"
            v-model:page-size="pageSize"
            :page-sizes="[10, 20, 50, 100]"
            :total="totalPoems"
            layout="total, sizes, prev, pager, next, jumper"
          />
        </div>
      </section>
    </main>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useStore } from 'vuex'

const router = useRouter()
const store = useStore()

const filters = ref({
  dynasty: '',
  type: '',
  author: ''
})

const currentPage = ref(1)
const pageSize = ref(20)

const poems = computed(() => store.state.poems)
const authors = computed(() => store.state.authors)

const filteredPoems = computed(() => {
  let result = poems.value
  
  if (filters.value.dynasty) {
    result = result.filter(poem => poem.dynasty === filters.value.dynasty)
  }
  if (filters.value.author) {
    result = result.filter(poem => poem.author === filters.value.author)
  }
  
  return result
})

const totalPoems = computed(() => filteredPoems.value.length)

const applyFilters = () => {
  currentPage.value = 1
}

const resetFilters = () => {
  filters.value = {
    dynasty: '',
    type: '',
    author: ''
  }
  currentPage.value = 1
}

const viewPoemDetail = (poemId) => {
  router.push({ name: 'PoemDetail', params: { id: poemId } })
}

onMounted(() => {
  store.dispatch('fetchPoems')
})
</script>

<style scoped>
.filters-section {
  margin-bottom: 2rem;
  padding: 1.5rem;
  background: white;
  border-radius: 8px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.1);
}

.poems-list {
  background: white;
  border-radius: 8px;
  overflow: hidden;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.1);
}

.poem-link {
  color: #409EFF;
  text-decoration: none;
}

.poem-link:hover {
  text-decoration: underline;
}

.poem-content {
  line-height: 1.6;
  color: #666;
}

.pagination {
  padding: 1.5rem;
  text-align: center;
  background: white;
}
</style>
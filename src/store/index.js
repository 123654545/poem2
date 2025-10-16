import { createStore } from 'vuex'
import { authAPI, poemAPI, authorAPI, commentAPI } from '@/utils/supabase'

export default createStore({
  state: {
    user: null,
    session: null,
    poems: [],
    authors: [],
    searchResults: [],
    isLoading: false
  },
  mutations: {
    SET_USER(state, user) {
      state.user = user
    },
    SET_SESSION(state, session) {
      state.session = session
      if (session?.access_token) {
        localStorage.setItem('supabase_token', session.access_token)
      } else {
        localStorage.removeItem('supabase_token')
      }
    },
    SET_POEMS(state, poems) {
      state.poems = poems
    },
    SET_AUTHORS(state, authors) {
      state.authors = authors
    },
    SET_SEARCH_RESULTS(state, results) {
      state.searchResults = results
    },
    SET_LOADING(state, loading) {
      state.isLoading = loading
    },
    ADD_POEM(state, poem) {
      state.poems.unshift(poem)
    },
    UPDATE_POEM(state, updatedPoem) {
      const index = state.poems.findIndex(p => p.id === updatedPoem.id)
      if (index !== -1) {
        state.poems.splice(index, 1, updatedPoem)
      }
    }
  },
  actions: {
    async initializeAuth({ commit }) {
      try {
        const { data } = await authAPI.getCurrentUser()
        if (data.user) {
          commit('SET_USER', data.user)
        }
      } catch (error) {
        console.error('初始化认证失败:', error)
      }
    },

    async login({ commit }, { email, password }) {
      commit('SET_LOADING', true)
      try {
        const { data, error } = await authAPI.signIn(email, password)
        if (error) throw error
        
        commit('SET_USER', data.user)
        commit('SET_SESSION', data.session)
        return { success: true }
      } catch (error) {
        console.error('登录失败:', error)
        return { success: false, error: error.message }
      } finally {
        commit('SET_LOADING', false)
      }
    },

    async register({ commit }, { email, password, userData }) {
      commit('SET_LOADING', true)
      try {
        const { data, error } = await authAPI.signUp(email, password, userData)
        if (error) throw error
        
        commit('SET_USER', data.user)
        commit('SET_SESSION', data.session)
        return { success: true }
      } catch (error) {
        console.error('注册失败:', error)
        return { success: false, error: error.message }
      } finally {
        commit('SET_LOADING', false)
      }
    },

    async logout({ commit }) {
      try {
        await authAPI.signOut()
        commit('SET_USER', null)
        commit('SET_SESSION', null)
      } catch (error) {
        console.error('退出登录失败:', error)
      }
    },

    async fetchPoems({ commit }, filters = {}) {
      commit('SET_LOADING', true)
      try {
        const { data, error } = await poemAPI.getPoems(filters)
        if (error) throw error
        
        commit('SET_POEMS', data || [])
        return { success: true, data }
      } catch (error) {
        console.error('获取诗词列表失败:', error)
        return { success: false, error: error.message }
      } finally {
        commit('SET_LOADING', false)
      }
    },

    async fetchAuthors({ commit }, filters = {}) {
      commit('SET_LOADING', true)
      try {
        const { data, error } = await authorAPI.getAuthors(filters)
        if (error) throw error
        
        commit('SET_AUTHORS', data || [])
        return { success: true, data }
      } catch (error) {
        console.error('获取作者列表失败:', error)
        return { success: false, error: error.message }
      } finally {
        commit('SET_LOADING', false)
      }
    },

    async searchPoems({ commit }, query) {
      commit('SET_LOADING', true)
      try {
        const { data, error } = await poemAPI.searchPoems(query)
        if (error) throw error
        
        commit('SET_SEARCH_RESULTS', data || [])
        return { success: true, data }
      } catch (error) {
        console.error('搜索诗词失败:', error)
        return { success: false, error: error.message }
      } finally {
        commit('SET_LOADING', false)
      }
    },

    async favoritePoem({ commit }, poemId) {
      try {
        const { error } = await poemAPI.favoritePoem(poemId)
        if (error) throw error
        return { success: true }
      } catch (error) {
        console.error('收藏诗词失败:', error)
        return { success: false, error: error.message }
      }
    },

    async unfavoritePoem({ commit }, poemId) {
      try {
        const { error } = await poemAPI.unfavoritePoem(poemId)
        if (error) throw error
        return { success: true }
      } catch (error) {
        console.error('取消收藏失败:', error)
        return { success: false, error: error.message }
      }
    }
  },
  getters: {
    isAuthenticated: state => !!state.user,
    currentUser: state => state.user,
    isLoading: state => state.isLoading,
    featuredPoems: state => state.poems.slice(0, 6),
    recentPoems: state => state.poems.slice().reverse().slice(0, 10),
    poemsByDynasty: state => dynasty => state.poems.filter(p => p.dynasty === dynasty),
    poemsByAuthor: state => authorId => state.poems.filter(p => p.author_id === authorId)
  }
})
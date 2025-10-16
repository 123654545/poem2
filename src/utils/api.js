import axios from 'axios'

// 创建axios实例
const api = axios.create({
  baseURL: process.env.VITE_API_BASE_URL || 'http://localhost:3001/api',
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json'
  }
})

// 请求拦截器
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token')
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  (error) => {
    return Promise.reject(error)
  }
)

// 响应拦截器
api.interceptors.response.use(
  (response) => {
    return response.data
  },
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token')
      window.location.href = '/login'
    }
    return Promise.reject(error)
  }
)

// API接口定义
export const poemAPI = {
  // 获取诗词列表
  getPoems: (params) => api.get('/poems', { params }),
  
  // 获取诗词详情
  getPoem: (id) => api.get(`/poems/${id}`),
  
  // 搜索诗词
  searchPoems: (query) => api.get('/poems/search', { params: { q: query } }),
  
  // 收藏诗词
  favoritePoem: (id) => api.post(`/poems/${id}/favorite`),
  
  // 取消收藏
  unfavoritePoem: (id) => api.delete(`/poems/${id}/favorite`)
}

export const authorAPI = {
  // 获取作者列表
  getAuthors: (params) => api.get('/authors', { params }),
  
  // 获取作者详情
  getAuthor: (id) => api.get(`/authors/${id}`),
  
  // 获取作者作品
  getAuthorWorks: (id) => api.get(`/authors/${id}/works`)
}

export const userAPI = {
  // 用户登录
  login: (credentials) => api.post('/auth/login', credentials),
  
  // 用户注册
  register: (userData) => api.post('/auth/register', userData),
  
  // 获取用户信息
  getProfile: () => api.get('/user/profile'),
  
  // 更新用户信息
  updateProfile: (userData) => api.put('/user/profile', userData),
  
  // 获取用户收藏
  getFavorites: () => api.get('/user/favorites')
}

export default api
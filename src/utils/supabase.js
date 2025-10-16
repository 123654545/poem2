import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// 用户认证相关方法
export const authAPI = {
  // 注册用户
  async signUp(email, password, userData) {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: userData,
        emailRedirectTo: window.location.origin
      }
    })
    
    // 如果注册成功，在users表中创建对应的用户记录
    if (data && !error && data.user) {
      try {
        await supabase
          .from('users')
          .insert({
            id: data.user.id,
            username: userData?.username || email.split('@')[0],
            email: email,
            created_at: new Date().toISOString()
          })
      } catch (dbError) {
        console.error('创建用户记录失败:', dbError)
      }
    }
    
    // 如果注册成功但需要邮箱确认，提供友好的提示
    if (data && !error) {
      console.log('注册成功，请检查您的邮箱确认账户')
    }
    
    return { data, error }
  },

  // 登录
  async signIn(email, password) {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password
    })
    
    // 处理邮箱未确认错误
    if (error && error.message === 'Email not confirmed') {
      // 对于开发环境，我们可以创建一个测试用户或使用其他方式绕过
      console.warn('邮箱未确认，请检查您的邮箱并确认账户')
    }
    
    return { data, error }
  },

  // 退出登录
  async signOut() {
    const { error } = await supabase.auth.signOut()
    return { error }
  },

  // 获取当前用户
  getCurrentUser() {
    return supabase.auth.getUser()
  },

  // 监听认证状态变化
  onAuthStateChange(callback) {
    return supabase.auth.onAuthStateChange(callback)
  }
}

// 诗词相关API
export const poemAPI = {
  // 获取诗词列表
  async getPoems(filters = {}) {
    let query = supabase
      .from('poems')
      .select(`
        *,
        authors (*)
      `)
    
    if (filters.dynasty) {
      query = query.eq('dynasty', filters.dynasty)
    }
    if (filters.type) {
      query = query.eq('type', filters.type)
    }
    if (filters.author) {
      query = query.eq('author_id', filters.author)
    }

    const { data, error } = await query.order('created_at', { ascending: false })
    return { data, error }
  },

  // 获取诗词详情
  async getPoem(id) {
    const { data, error } = await supabase
      .from('poems')
      .select(`
        *,
        authors (*),
        comments (*)
      `)
      .eq('id', id)
      .single()
    return { data, error }
  },

  // 搜索诗词
  async searchPoems(query) {
    const { data, error } = await supabase
      .from('poems')
      .select(`
        *,
        authors (*)
      `)
      .or(`title.ilike.%${query}%,content.ilike.%${query}%`)
    return { data, error }
  },

  // 收藏诗词
  async favoritePoem(poemId) {
    const user = await authAPI.getCurrentUser()
    if (!user.data.user) throw new Error('用户未登录')
    
    const { data, error } = await supabase
      .from('favorites')
      .insert({
        user_id: user.data.user.id,
        poem_id: poemId
      })
    return { data, error }
  },

  // 取消收藏
  async unfavoritePoem(poemId) {
    const user = await authAPI.getCurrentUser()
    if (!user.data.user) throw new Error('用户未登录')
    
    const { error } = await supabase
      .from('favorites')
      .delete()
      .eq('user_id', user.data.user.id)
      .eq('poem_id', poemId)
    return { error }
  },

  // 获取用户收藏
  async getUserFavorites() {
    const user = await authAPI.getCurrentUser()
    if (!user.data.user) throw new Error('用户未登录')
    
    const { data, error } = await supabase
      .from('favorites')
      .select(`
        *,
        poems (*, authors (*))
      `)
      .eq('user_id', user.data.user.id)
    return { data, error }
  }
}

// 作者相关API
export const authorAPI = {
  // 获取作者列表
  async getAuthors(filters = {}) {
    let query = supabase.from('authors')
    
    if (filters.dynasty) {
      query = query.eq('dynasty', filters.dynasty)
    }

    const { data, error } = await query.order('name')
    return { data, error }
  },

  // 获取作者详情
  async getAuthor(id) {
    const { data, error } = await supabase
      .from('authors')
      .select('*')
      .eq('id', id)
      .single()
    return { data, error }
  },

  // 获取作者作品
  async getAuthorWorks(authorId) {
    const { data, error } = await supabase
      .from('poems')
      .select('*')
      .eq('author_id', authorId)
      .order('created_at', { ascending: false })
    return { data, error }
  }
}

// 评论相关API
export const commentAPI = {
  // 获取诗词评论
  async getPoemComments(poemId) {
    const { data, error } = await supabase
      .from('comments')
      .select(`
        *,
        users (username, avatar_url)
      `)
      .eq('poem_id', poemId)
      .is('parent_id', null)
      .order('created_at', { ascending: false })
    return { data, error }
  },

  // 发表评论
  async createComment(poemId, content, parentId = null) {
    const user = await authAPI.getCurrentUser()
    if (!user.data.user) throw new Error('用户未登录')
    
    const { data, error } = await supabase
      .from('comments')
      .insert({
        poem_id: poemId,
        user_id: user.data.user.id,
        content,
        parent_id: parentId
      })
      .select()
    return { data, error }
  },

  // 点赞评论
  async likeComment(commentId) {
    const { error } = await supabase
      .from('comments')
      .update({ likes_count: supabase.sql('likes_count + 1') })
      .eq('id', commentId)
    return { error }
  }
}

export default supabase
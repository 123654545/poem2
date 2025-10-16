# 古诗词鉴赏网站

基于Vue 3 + Element Plus构建的古诗词鉴赏平台，提供诗词浏览、搜索、收藏、评论等功能。

## 功能特性

- 📚 **海量诗词库** - 包含唐诗、宋词、元曲等经典作品
- 🔍 **智能搜索** - 支持按标题、作者、内容、关键词搜索
- 👥 **用户系统** - 注册登录、个人中心、收藏管理
- 💬 **社区互动** - 评论交流、鉴赏分享
- 📱 **响应式设计** - 完美适配PC和移动设备
- 🎨 **优雅界面** - 现代化UI设计，良好用户体验

## 技术栈

- **前端框架**: Vue 3 + Composition API
- **UI组件库**: Element Plus
- **路由管理**: Vue Router 4
- **状态管理**: Vuex 4
- **构建工具**: Vite
- **开发语言**: JavaScript/TypeScript

## 项目结构

```
src/
├── views/           # 页面组件
│   ├── Home.vue     # 首页
│   ├── Poems.vue    # 诗词列表页
│   ├── PoemDetail.vue # 诗词详情页
│   ├── Authors.vue  # 作者列表页
│   ├── AuthorDetail.vue # 作者详情页
│   ├── Search.vue   # 搜索页
│   ├── Login.vue    # 登录页
│   ├── Register.vue # 注册页
│   └── Profile.vue # 个人中心页
├── router/          # 路由配置
├── store/           # 状态管理
└── main.js          # 应用入口
```

## 快速开始

### 环境要求

- Node.js >= 16.0.0
- npm >= 7.0.0

### 安装依赖

```bash
npm install
```

### 开发模式

```bash
npm run dev
```

访问 http://localhost:3000

### 构建生产版本

```bash
npm run build
```

### 预览生产版本

```bash
npm run preview
```

## 功能模块

### 1. 用户管理模块
- 用户注册/登录
- 个人信息管理
- 收藏管理
- 评论管理

### 2. 诗词浏览模块
- 诗词分类浏览（按朝代、体裁、主题）
- 诗词详情展示（原文、注释、译文、赏析）
- 作者信息展示

### 3. 搜索模块
- 全文搜索
- 高级筛选
- 搜索结果高亮

### 4. 社区互动模块
- 评论系统
- 用户鉴赏发布
- 点赞收藏功能

## 开发计划

### 第一阶段（已完成）
- [x] 项目基础架构搭建
- [x] 核心页面组件开发
- [x] 路由和状态管理配置

### 第二阶段（进行中）
- [ ] 后端API接口对接
- [ ] 数据库设计实现
- [ ] 用户认证系统完善

### 第三阶段（规划中）
- [ ] 移动端优化
- [ ] 性能优化
- [ ] SEO优化

## 贡献指南

1. Fork 本项目
2. 创建特性分支 (`git checkout -b feature/AmazingFeature`)
3. 提交更改 (`git commit -m 'Add some AmazingFeature'`)
4. 推送到分支 (`git push origin feature/AmazingFeature`)
5. 打开 Pull Request

## 许可证

本项目采用 MIT 许可证 - 查看 [LICENSE](LICENSE) 文件了解详情

## 联系方式

- 项目主页: [GitHub Repository]
- 问题反馈: [Issues]
- 邮箱: contact@example.com

---

**传承中华文化，品味诗词之美**
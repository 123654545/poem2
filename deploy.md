# 部署指南

## 环境要求

- Node.js >= 16.0.0
- npm >= 7.0.0
- 现代浏览器支持

## 开发环境部署

### 1. 克隆项目

```bash
git clone <repository-url>
cd poem-website
```

### 2. 安装依赖

```bash
npm install
```

### 3. 配置环境变量

复制环境变量示例文件：

```bash
cp .env.example .env
```

编辑 `.env` 文件，配置相应的环境变量。

### 4. 启动开发服务器

```bash
npm run dev
```

访问 http://localhost:3000

## 生产环境部署

### 1. 构建项目

```bash
npm run build
```

构建产物将生成在 `dist` 目录。

### 2. 部署到静态文件服务器

#### Nginx 配置示例

```nginx
server {
    listen 80;
    server_name your-domain.com;
    root /path/to/poem-website/dist;
    index index.html;

    location / {
        try_files $uri $uri/ /index.html;
    }

    # 静态资源缓存
    location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg)$ {
        expires 1y;
        add_header Cache-Control "public, immutable";
    }

    # API代理（如果有后端服务）
    location /api/ {
        proxy_pass http://backend-server:3001;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    }
}
```

#### Apache 配置示例

```apache
<VirtualHost *:80>
    ServerName your-domain.com
    DocumentRoot /path/to/poem-website/dist

    <Directory "/path/to/poem-website/dist">
        Options Indexes FollowSymLinks
        AllowOverride All
        Require all granted
        
        RewriteEngine On
        RewriteBase /
        RewriteRule ^index\.html$ - [L]
        RewriteCond %{REQUEST_FILENAME} !-f
        RewriteCond %{REQUEST_FILENAME} !-d
        RewriteRule . /index.html [L]
    </Directory>
</VirtualHost>
```

### 3. Docker 部署

创建 `Dockerfile`：

```dockerfile
# 构建阶段
FROM node:16-alpine as build-stage
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
RUN npm run build

# 生产阶段
FROM nginx:alpine as production-stage
COPY --from=build-stage /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/nginx.conf
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
```

创建 `docker-compose.yml`：

```yaml
version: '3.8'
services:
  poem-website:
    build: .
    ports:
      - "80:80"
    restart: unless-stopped
```

部署命令：

```bash
docker-compose up -d
```

## 性能优化建议

### 1. 代码分割

项目已配置Vite的自动代码分割，确保按需加载。

### 2. 图片优化

- 使用WebP格式图片
- 实现懒加载
- 压缩图片资源

### 3. CDN加速

将静态资源部署到CDN，提高访问速度。

### 4. 缓存策略

- 静态资源设置长期缓存
- API响应合理设置缓存头

## 监控和维护

### 1. 错误监控

集成Sentry等错误监控工具：

```bash
npm install @sentry/vue @sentry/tracing
```

### 2. 性能监控

使用Google Analytics或百度统计跟踪用户行为。

### 3. 日志管理

配置日志收集和分析系统。

## 安全注意事项

1. **HTTPS部署**：生产环境必须使用HTTPS
2. **CSP配置**：配置内容安全策略
3. **XSS防护**：对用户输入进行严格过滤
4. **CSRF防护**：实现CSRF令牌验证

## 故障排除

### 常见问题

1. **白屏问题**：检查路由配置和静态资源路径
2. **API请求失败**：确认后端服务状态和CORS配置
3. **构建失败**：检查Node.js版本和依赖兼容性

### 日志查看

```bash
# 查看构建日志
npm run build --verbose

# 查看运行日志
tail -f /var/log/nginx/error.log
```

## 更新部署

当有新版本发布时：

1. 拉取最新代码
2. 重新构建项目
3. 重启服务
4. 清除浏览器缓存测试
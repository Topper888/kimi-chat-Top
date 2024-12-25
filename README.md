# AI Teaching Assistant

## 运行要求
- Node.js 版本: 20.20.1
- npm (Node Package Manager)

## 安装和运行步骤

### 1. 确保 Node.js 版本正确 
```bash
node -v # 应显示 v20.20.1   
```

### 2. 安装项目依赖 
```bash
npm install
```

### 3. 运行项目
```bash
npm run dev
```

服务器将启动，支持 js、ejs、json、css 文件的热更新。

### 4. 访问应用
打开浏览器访问：`http://localhost:3000`

## 开发说明
- 使用 `npm run dev` 启动开发服务器，支持文件更改的自动重载
- 项目使用 nodemon 进行热更新，监视的文件扩展包括：
  - JavaScript (.js)
  - EJS 模板 (.ejs)
  - JSON 配置文件 (.json)
  - CSS 样式文件 (.css)

## 注意事项
- 确保所有环境变量都已正确配置
- 如遇到依赖安装问题，可以尝试删除 node_modules 文件夹和 package-lock.json，然后重新运行 `npm install` 






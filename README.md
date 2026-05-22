# 项目管理系统 (Project Management Assistant)

基于 Tauri 2.0 + Vue 3 + TypeScript 开发的跨平台桌面项目管理应用。

## ✨ 特性

- 🚀 **高性能**: 基于 Tauri 2.0，相比 Electron 更轻量、更快速
- 💻 **跨平台**: 支持 macOS、Windows、Linux
- 📊 **项目管理**: 完整的项目生命周期管理
- 📝 **工时记录**: 详细的工作日志和时间追踪
- 💰 **费用报销**: 多类别费用统计和发票管理
- 📈 **数据报表**: 智能统计分析和可视化图表
- 🔒 **本地存储**: SQLite 数据库，数据安全可控

---

## 🚀 快速开始

### 前置要求

- **Node.js** >= 18.0.0
- **npm** >= 8.0.0
- **Rust** >= 1.70（通过 rustup 安装）
- **macOS**: Xcode Command Line Tools
- **Linux**: 相关系统依赖库

### 一键安装与启动

```bash
# 1. 克隆项目
git clone <repository-url>
cd assistant

# 2. 安装依赖
npm install
cd web && npm install --legacy-peer-deps && cd ..

# 3. 注入测试数据
./scripts/inject-test-data.sh

# 4. 启动开发环境
./scripts/dev.sh
```

### 生产构建

```bash
# 构建并发布
./scripts/build-release.sh

# 产物位置: src-tauri/target/release/bundle/macos/
```

---

## 📁 项目结构

```
assistant/
├── scripts/                    # 自动化脚本
│   ├── dev.sh                 # 开发调试脚本
│   ├── build-release.sh       # 生产构建脚本
│   ├── inject-base-data.sh    # 基础数据注入
│   ├── inject-test-data.sh    # 测试数据注入
│   └── reset-and-inject.sh    # 重置并注入数据
├── src-tauri/                 # Rust 后端
│   ├── src/
│   │   ├── main.rs           # 主入口
│   │   ├── lib.rs            # 库配置
│   │   ├── commands/         # Tauri 命令接口
│   │   ├── services/         # 业务逻辑层
│   │   ├── models/           # 数据模型
│   │   └── database.rs       # 数据库连接
│   ├── schema.sql            # 数据库模式
│   └── tauri.conf.json       # Tauri 配置
├── web/                       # Vue 前端
│   ├── src/
│   │   ├── components/       # Vue 组件
│   │   ├── utils/            # 工具函数
│   │   ├── composables/      # 组合式函数
│   │   └── main.ts           # 入口文件
│   ├── package.json          # 前端依赖
│   └── vite.config.ts        # Vite 配置
├── package.json              # 项目配置
└── README.md                 # 本文档
```

---

## 🛠️ 开发指南

### 开发模式

```bash
# 方式1: 使用脚本（推荐）
./scripts/dev.sh

# 方式2: 使用 npm 命令
npm run dev

# 方式3: 单独启动
npm run tauri:dev     # 后端 Tauri 开发模式
npm run web:dev       # 仅前端开发服务器
```

**访问地址：**
- 前端开发服务器: http://localhost:1420
- 后端 API: 自动代理到 Tauri IPC

### 生产构建

```bash
# 使用脚本
./scripts/build-release.sh

# 或使用 cargo 命令
cargo tauri build

# 输出位置:
# - macOS: src-tauri/target/release/bundle/macos/
# - Linux: src-tauri/target/release/bundle/deb/
# - Windows: src-tauri/target/release/bundle/nsis/
```

### 数据库管理

#### 注入基础数据
```bash
./scripts/inject-base-data.sh
# 或
npm run inject:base
```

#### 注入完整测试数据
```bash
./scripts/inject-test-data.sh
# 或
npm run inject:test
```

#### 重置所有数据
```bash
./scripts/reset-and-inject.sh
# 或
npm run reset:data
```

#### 手动查看数据库
```bash
sqlite3 ~/Library/Application\ Support/project-management-app/database.sqlite \
  ".tables"
```

---

## 📚 功能模块

### 1. 项目管理
- 创建、编辑、删除项目
- 项目状态跟踪（进行中/已结束）
- 项目成员管理
- 项目时间轴展示

### 2. 工作日志
- 按日期记录工作内容
- 天气、地点、执行人等多维度信息
- 日志搜索和筛选
- 时间轴可视化展示

### 3. 费用管理
- 多类别费用记录（交通、伙食、住宿等）
- 发票状态跟踪
- 分类统计和报表
- 费用趋势分析

### 4. 数据导出
- 项目数据导出
- 费用报表生成
- 工作日志导出
- 文件附件管理

### 5. 系统设置
- 人员信息管理
- 费用类别配置
- 凭证类型设置
- 系统参数配置

---

## 🔧 技术栈

### 后端
- **框架**: Tauri 2.0
- **语言**: Rust
- **数据库**: SQLite (sqlite3)
- **ORM**: SQLx
- **IPC**: Tauri Events

### 前端
- **框架**: Vue 3 (Composition API)
- **语言**: TypeScript
- **构建工具**: Vite 5
- **UI 库**: 自定义组件 + Tailwind CSS
- **状态管理**: reactive/ref
- **路由**: 单页应用

### 开发工具
- **包管理**: npm
- **类型检查**: vue-tsc
- **代码格式**: Prettier + ESLint
- **打包**: electron-builder (可选)

---

## 📖 API 文档

### 后端命令接口

#### 项目管理
- `get_projects()` - 获取所有项目
- `create_project(data)` - 创建项目
- `update_project(id, data)` - 更新项目
- `delete_project(id)` - 删除项目

#### 工作日志
- `get_work_logs(project_id)` - 获取项目日志
- `create_work_log(data)` - 创建日志
- `update_work_log(id, data)` - 更新日志
- `delete_work_log(id)` - 删除日志

#### 费用管理
- `get_expenses(project_id)` - 获取费用列表
- `create_expense(data)` - 创建费用记录
- `update_expense(id, data)` - 更新费用
- `delete_expense(id)` - 删除费用

#### 报表统计
- `get_project_statistics(project_id)` - 获取项目统计数据
- `get_expense_summary(project_id)` - 获取费用汇总统计

详细 API 文档见 [`docs/API.md`](docs/API.md)

---

## 🗄️ 数据库设计

### 主要表结构

```sql
-- 项目表
projects (id, name, description, start_date, end_date, status, created_by)

-- 工作日志表
work_logs (id, project_id, log_date, author, executor, weather, location, content)

-- 费用记录表
expense_records (id, project_id, category_id, voucher_type_id, amount, expense_date)

-- 费用类别表
expense_categories (id, name, parent_id)

-- 凭证类型表
voucher_types (id, name, description)

-- 项目成员关系表
project_members (project_id, user_id, role)
```

完整 Schema 见 [`src-tauri/schema.sql`](src-tauri/schema.sql)

---

## 🧪 测试

### 运行测试
```bash
# 前端测试
cd web && npm test

# 后端测试
cd src-tauri && cargo test
```

### 类型检查
```bash
# TypeScript 类型检查
cd web && npm run type-check

# Rust 代码检查
cd src-tauri && cargo check
```

---

## 📦 发布

### macOS
```bash
cargo tauri build
# 产物: src-tauri/target/release/bundle/macos/
```

### Windows
```bash
# 需要安装 Windows 特定依赖
cargo tauri build
# 产物: src-tauri/target/release/bundle/nsis/
```

### Linux
```bash
# 需要安装 GTK 相关依赖
cargo tauri build
# 产物: src-tauri/target/release/bundle/deb/
```

---

## 🐛 故障排查

### 常见问题

**Q: 数据库找不到**
```bash
# 解决方案: 先启动一次应用创建数据库
npm run dev
# Ctrl+C 退出后重新注入数据
npm run inject:test
```

**Q: 前端依赖安装失败**
```bash
# 清除缓存重装
cd web
rm -rf node_modules package-lock.json
npm cache clean --force
npm install --legacy-peer-deps
```

**Q: Rust 编译失败**
```bash
# 更新 Rust
rustup update

# 清理重新编译
cd src-tauri
cargo clean
cargo build
```

**Q: 构建产物找不到**
```bash
# 查找所有构建产物
find src-tauri/target/release/bundle -type f \( -name "*.dmg" -o -name "*.app" -o -name "*.exe" \)
```

---

## 🤝 贡献指南

欢迎提交 Issue 和 Pull Request！

### 开发流程
1. Fork 本仓库
2. 创建特性分支 (`git checkout -b feature/AmazingFeature`)
3. 提交更改 (`git commit -m 'Add some AmazingFeature'`)
4. 推送到分支 (`git push origin feature/AmazingFeature`)
5. 开启 Pull Request

### 代码规范
- Rust: 使用 `cargo fmt` 和 `cargo clippy`
- TypeScript: 遵循 ESLint + Prettier 配置
- 提交信息: 使用语义化提交 (Conventional Commits)

---

## 📄 许可证

ISC License

---

## 📞 联系方式

- 项目维护者: Project Team
- Email: team@example.com
- GitHub Issues: [提交问题](https://github.com/your-repo/issues)

---

## 🙏 致谢

感谢以下开源项目：
- [Tauri](https://tauri.app/) - 跨平台应用框架
- [Vue.js](https://vuejs.org/) - 渐进式 JavaScript 框架
- [TypeScript](https://www.typescriptlang.org/) - 类型安全 JavaScript
- [SQLite](https://www.sqlite.org/) - 轻量级数据库

---

**最后更新**: 2026-05-22  
**版本**: v2.0.0  
**状态**: ✅ Stable

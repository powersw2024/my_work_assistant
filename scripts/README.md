# 项目脚本使用指南

本目录包含项目的自动化脚本，用于构建、调试和数据注入。

## 📁 脚本列表

### 🔧 开发调试

#### `dev.sh` - 启动开发环境
一键启动前后端开发服务器，适合日常开发调试。

```bash
# 直接使用
./scripts/dev.sh

# 或使用 npm 命令
npm run dev
```

**功能：**
- ✅ 自动安装前端依赖（首次）
- ✅ 启动 Tauri 开发模式（包含前端热重载）
- ✅ 实时错误反馈
- ✅ 支持断点调试

**访问地址：**
- 前端开发服务器: http://localhost:1420
- 后端会自动在前端启动后加载

---

### 📦 生产构建

#### `build-release.sh` - 生产环境打包
一键编译前后端，生成可分发包。

```bash
# 直接使用
./scripts/build-release.sh

# 或使用 npm 命令
npm run build
```

**流程：**
1. 检查开发环境（Node.js, npm, Rust）
2. 安装前端依赖
3. TypeScript 类型检查
4. Vite 生产构建
5. Rust Release 编译
6. Electron/macOS 打包

**输出位置：**
```
src-tauri/target/release/bundle/macos/
├── project-management-app-1.0.0.dmg
└── project-management-app_1.0.0_amd64.deb (Linux)
└── project-management-app_1.0.0_x64.exe (Windows)
```

**系统要求：**
- Node.js >= 18
- Rust/Cargo >= 1.70
- macOS: Xcode Command Line Tools
- Linux: 相关依赖库
- Windows: Visual C++ Redistributable

---

### 💾 数据库注入

#### `inject-base-data.sh` - 注入基础数据
初始化系统中的基础配置数据。

```bash
# 直接使用
./scripts/inject-base-data.sh

# 或使用 npm 命令
npm run inject:base
```

**注入内容：**
- ✅ 4种凭证类型（增值税发票、收据、报销单等）
- ✅ 7个费用类别（交通费、伙食费、住宿费等）

**适用场景：**
- 新环境初始化
- 重置分类数据
- 修复数据异常

---

#### `inject-test-data.sh` - 注入测试数据
注入完整的测试数据，用于功能测试和演示。

```bash
# 直接使用
./scripts/inject-test-data.sh

# 或使用 npm 命令
npm run inject:test
```

**注入内容：**
- ✅ 4个项目（3个进行中，1个已结束）
- ✅ 10条项目成员关系
- ✅ 11条工作日志
- ✅ 12条费用记录（多种类别和状态）

**数据详情：**
| 项目 | 日志数 | 费用数 | 总费用 |
|------|--------|--------|---------|
| 智慧城市交通管理平台 | 5 | 4 | ~2,636元 |
| 乡村振兴数字乡村建设 | 3 | 4 | ~1,770元 |
| 企业ERP系统升级 | 2 | 2 | ~2,670元 |
| 医疗健康数据中心 | 2 | 3 | ~650元 |

**提示：** 运行前会询问是否清空现有测试数据

---

#### `reset-and-inject.sh` - 重置并注入
清空所有业务数据后重新注入完整测试数据。

```bash
# 直接使用
./scripts/reset-and-inject.sh

# 或使用 npm 命令
npm run reset:data
```

**操作流程：**
1. ⚠️ 警告并确认
2. 清空所有业务表
3. 重置自增ID
4. 注入基础数据
5. 注入测试数据

**适用场景：**
- 快速重置测试环境
- 清除测试产生的脏数据
- 确保数据一致性

---

## 🚀 快速开始

### 首次安装

```bash
# 1. 克隆项目
git clone <repository-url>
cd assistant

# 2. 安装依赖
npm install
cd web && npm install --legacy-peer-deps && cd ..

# 3. 初始化数据库（选择其一）

# 方式A: 仅基础数据
npm run inject:base

# 方式B: 完整测试数据
npm run inject:test

# 4. 启动开发环境
npm run dev
```

### 日常开发

```bash
# 启动开发服务器
npm run dev

# 或单独启动前端
npm run web:dev

# 或单独启动Tauri
npm run tauri:dev
```

### 构建发布

```bash
# 生产环境构建
npm run build

# 或使用 cargo 命令
cargo tauri build
```

---

## 🛠️ 高级用法

### 直接操作数据库

如果需要手动查看或修改数据库：

```bash
# macOS 数据库位置
sqlite3 ~/Library/Application\ Support/project-management-app/database.sqlite

# SQLite 常用命令
.headers on        # 显示列名
.mode column       # 列对齐
.tables            # 查看所有表
.schema            # 查看表结构
SELECT COUNT(*) FROM projects;  # 统计项目数
```

### 清理重建

如果数据库出现问题需要彻底重建：

```bash
# 1. 删除数据库
rm ~/Library/Application\ Support/project-management-app/database.sqlite

# 2. 重新初始化（启动Tauri时会自动创建）
npm run dev

# 3. 注入测试数据
npm run inject:test
```

### 多环境数据隔离

可以设置不同的数据库路径用于不同环境：

```bash
# 开发环境
export APP_DATA_DIR="$HOME/Library/Application Support/project-management-app-dev"
npm run dev

# 测试环境
export APP_DATA_DIR="$HOME/Library/Application Support/project-management-app-test"
npm run dev
```

---

## 📊 环境变量

脚本支持以下环境变量：

| 变量 | 说明 | 默认值 |
|------|------|--------|
| `APP_DATA_DIR` | 应用数据目录 | `~/Library/Application Support/project-management-app` |
| `DB_NAME` | 数据库文件名 | `database.sqlite` |
| `SKIP_CONFIRM` | 跳过确认提示 | `false` |

示例：
```bash
# 跳过所有确认提示
SKIP_CONFIRM=1 ./scripts/reset-and-inject.sh

# 指定自定义数据库路径
APP_DATA_DIR="/tmp/test-db" ./scripts/inject-test-data.sh
```

---

## ❓ 常见问题

### Q: 脚本提示 "command not found"
**A:** 确保脚本有可执行权限：
```bash
chmod +x scripts/*.sh
```

### Q: 数据库文件找不到
**A:** 先启动一次 Tauri 应用，它会自动创建数据库：
```bash
npm run dev
# 按 Ctrl+C 退出后即可注入数据
```

### Q: 前端依赖安装失败
**A:** 尝试清除缓存后重装：
```bash
cd web
rm -rf node_modules package-lock.json
npm cache clean --force
npm install --legacy-peer-deps
```

### Q: Rust 编译报错
**A:** 更新 Rust 到最新版本：
```bash
rustup update
rustup component add rustc rust-preview clippy
```

### Q: 构建完成后找不到产物
**A:** 检查输出目录：
```bash
# macOS
open src-tauri/target/release/bundle/macos/

# 列出所有包
find src-tauri/target/release/bundle -type f -name "*.dmg" -o -name "*.app"
```

---

## 🔍 故障排查

### 查看详细日志

```bash
# 开发模式详细日志
RUST_LOG=debug npm run dev

# 前端详细日志
cd web && VERBOSE=true npm run dev
```

### 检查环境版本

```bash
# 一键检查所有环境
echo "Node: $(node --version)"
echo "npm: $(npm --version)"
echo "Rust: $(cargo --version)"
echo "SQLite: $(sqlite3 --version || echo 'not installed')"
```

### 验证数据库连接

```bash
# 测试数据库是否可读可写
sqlite3 ~/Library/Application\ Support/project-management-app/database.sqlite \
  "SELECT name FROM sqlite_master WHERE type='table';"
```

---

## 📞 技术支持

如遇问题，请：
1. 查看本文档的常见问题部分
2. 检查脚本执行日志
3. 确认环境和依赖版本
4. 联系开发团队

---

**最后更新**: 2026-05-22  
**维护者**: Project Team

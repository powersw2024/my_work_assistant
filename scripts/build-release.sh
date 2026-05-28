#!/bin/bash

# 生产构建脚本
# 一键编译前端和后端，生成可分发包

set -e

echo "🚀 开始生产构建..."
echo ""

# 获取脚本所在目录
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(dirname "$SCRIPT_DIR")"

# 切换到项目根目录
cd "$PROJECT_ROOT"

echo "📍 项目目录: $PROJECT_ROOT"
echo ""

# 1. 检查环境
echo "=========================================="
echo "📋 Step 1/5: 检查开发环境"
echo "=========================================="

if ! command -v node &> /dev/null; then
    echo "❌ Node.js 未安装，请先安装 Node.js >= 18"
    exit 1
fi

NODE_VERSION=$(node --version | cut -d'v' -f2 | cut -d'.' -f1)
if [ "$NODE_VERSION" -lt 18 ]; then
    echo "❌ Node.js 版本过低，需要 >= 18，当前版本: $(node --version)"
    exit 1
fi
echo "✅ Node.js: $(node --version)"

if ! command -v npm &> /dev/null; then
    echo "❌ npm 未安装"
    exit 1
fi
echo "✅ npm: $(npm --version)"

if ! command -v cargo &> /dev/null; then
    echo "❌ Rust/Cargo 未安装，请先安装 Rust"
    exit 1
fi
echo "✅ Cargo/Rust: $(cargo --version | cut -d' ' -f2)"

if ! command -v tauri-cli &> /dev/null; then
    echo "⚠️  tauri-cli 未全局安装，将使用本地版本"
    echo "    建议: cargo install tauri-cli @latest"
else
    echo "✅ Tauri CLI: $(tauri --version 2>/dev/null || echo 'installed')"
fi

echo ""

# 2. 安装前端依赖
echo "=========================================="
echo "📦 Step 2/5: 安装前端依赖"
echo "=========================================="

cd "$PROJECT_ROOT/web"

if [ ! -d "node_modules" ]; then
    echo "📥 首次安装前端依赖..."
    npm install --legacy-peer-deps
else
    echo "✅ 前端依赖已存在"
fi

echo ""

# 3. 构建前端
echo "=========================================="
echo "🎨 Step 3/5: 构建前端资源"
echo "=========================================="

echo "🔨 执行 TypeScript 类型检查..."
npm run type-check

echo "🔨 执行 Vite 生产构建..."
npm run build

echo "✅ 前端构建完成"
echo "   输出目录: web/dist/"
echo ""

# 4. 安装后端依赖并构建Rust
echo "=========================================="
echo "🔧 Step 4/5: 构建后端服务"
echo "=========================================="

cd "$PROJECT_ROOT/src-tauri"

echo "🔨 清理旧构建产物..."
cargo clean -q

echo "🔨 编译 Release 版本..."
cargo build --release

echo "✅ 后端构建完成"
echo "   输出目录: src-tauri/target/release/"
echo ""

# 5. 打包应用
echo "=========================================="
echo "📦 Step 5/5: 打包应用"
echo "=========================================="

echo "🔨 使用 tauri build 打包..."
cd "$PROJECT_ROOT"
npm run tauri:build

echo ""
echo "=========================================="
echo "✅ 生产构建完成！"
echo "=========================================="
echo ""
echo "📁 产物位置:"
echo "   - src-tauri/target/release/bundle/macos/"
echo ""
echo "🎉 可以分发应用程序了！"
echo ""

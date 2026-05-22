#!/bin/bash

# 开发调试脚本
# 一键启动前后端开发服务器，便于实时测试

set -e

echo "🚀 启动开发调试环境..."
echo ""

# 获取脚本所在目录
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(dirname "$SCRIPT_DIR")"

# 切换到项目根目录
cd "$PROJECT_ROOT"

echo "📍 项目目录: $PROJECT_ROOT"
echo ""
echo "📱 将同时启动:"
echo "   - 前端 Vue 开发服务器 (http://localhost:1420)"
echo "   - 后端 Tauri 开发模式"
echo ""

# 检查是否已安装依赖
if [ ! -d "$PROJECT_ROOT/web/node_modules" ]; then
    echo "📦 首次运行，正在安装前端依赖..."
    cd "$PROJECT_ROOT/web"
    npm install --legacy-peer-deps
    cd "$PROJECT_ROOT"
fi

# 检查 Rust 环境
if ! command -v cargo &> /dev/null; then
    echo "❌ Cargo 未安装，请先安装 Rust: https://rustup.rs/"
    exit 1
fi

echo "✅ 环境检查通过"
echo ""

# 使用 cargo tauri dev 启动（推荐方式）
echo "=========================================="
echo "🎯 启动 Tauri 开发模式"
echo "=========================================="
echo ""
echo "提示: 按 Ctrl+C 停止服务"
echo ""

cargo tauri dev

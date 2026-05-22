#!/bin/bash

# 重置并注入完整数据脚本
# 清空所有业务数据后，重新注入基础数据和测试数据

set -e

echo "⚠️  警告：此操作将清空所有现有数据！"
echo ""

# 询问是否继续
read -p "确定要继续吗？(y/n): " CONFIRM
if [[ ! "$CONFIRM" =~ ^[Yy]$ ]]; then
    echo "❌ 操作已取消"
    exit 0
fi

APP_DATA_DIR="$HOME/Library/Application Support/project-management-app"
DB_PATH="$APP_DATA_DIR/database.sqlite"

if [ ! -f "$DB_PATH" ]; then
    echo "❌ 数据库文件不存在，请先初始化数据库"
    exit 1
fi

echo "🗑️  清空所有业务数据..."
sqlite3 "$DB_PATH" <<'EOF'
-- 删除所有业务表数据
DELETE FROM expense_files;
DELETE FROM work_logs;
DELETE FROM expense_records;
DELETE FROM project_members;
DELETE FROM projects;
DELETE FROM expense_categories;
DELETE FROM voucher_types;

-- 重置自增ID
DELETE FROM sqlite_sequence WHERE name IN ('expense_files', 'expense_records', 'work_logs', 'projects', 'expense_categories', 'voucher_types');

-- 保留系统配置表（如users等）
EOF

echo "✅ 数据清空完成"
echo ""

echo "🔄 开始注入基础数据..."
./scripts/inject-base-data.sh

echo ""
echo "🔄 开始注入测试数据..."
./scripts/inject-test-data.sh

echo ""
echo "=========================================="
echo "✅ 数据重置并注入完成！"
echo "=========================================="

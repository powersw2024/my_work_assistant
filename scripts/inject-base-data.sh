#!/bin/bash

# 基础数据注入脚本
# 用于初始化系统中的基础配置数据（类别、凭证类型等）

set -e

echo "🚀 开始注入基础数据..."

# 获取应用数据目录
APP_DATA_DIR="$HOME/Library/Application Support/project-management-app"
DB_PATH="$APP_DATA_DIR/database.sqlite"

# 创建应用数据目录（如果不存在）
if [ ! -d "$APP_DATA_DIR" ]; then
    echo "📁 创建应用数据目录: $APP_DATA_DIR"
    mkdir -p "$APP_DATA_DIR"
fi

# 检查数据库文件是否存在
if [ ! -f "$DB_PATH" ]; then
    echo "❌ 数据库文件不存在: $DB_PATH"
    echo "请先运行 'npm run init-db' 或 'cargo tauri dev' 初始化数据库"
    exit 1
fi

echo "📍 数据库路径: $DB_PATH"

# 执行基础数据SQL
echo "📝 插入费用类别..."
sqlite3 "$DB_PATH" <<'EOF'
-- 清空现有数据（可选）
DELETE FROM voucher_types;
DELETE FROM expense_categories;

-- 插入凭证类型
INSERT INTO voucher_types (name, description) VALUES 
('增值税发票', '增值税专用/普通发票'),
('收据', '官方收据'),
('报销单', '公司内部报销单'),
('其他', '其他凭证');

-- 插入费用类别
INSERT INTO expense_categories (id, name, parent_id) VALUES 
(1, '交通费', NULL),
(2, '伙食费', NULL),
(3, '住宿费', NULL),
(4, '办公用品', NULL),
(5, '零星材料', NULL),
(6, '通讯费', NULL),
(7, '差旅补贴', NULL);

EOF

echo "✅ 基础数据注入完成！"
echo ""
echo "已插入数据："
echo "  - 4种凭证类型"
echo "  - 7个费用类别"
echo ""
echo "可以使用 './scripts/inject-test-data.sh' 注入测试数据"

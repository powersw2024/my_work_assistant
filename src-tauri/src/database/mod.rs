use log::{error, info};
use sqlx::{sqlite::SqliteConnectOptions, SqlitePool};
use std::path::PathBuf;
use std::str::FromStr;

pub struct Database {
    pub pool: SqlitePool,
}

impl Database {
    pub async fn new(db_path: &PathBuf) -> Result<Self, sqlx::Error> {
        // 确保父目录存在
        if let Some(parent) = db_path.parent() {
            std::fs::create_dir_all(parent).expect("无法创建数据库目录");
        }

        let db_url = format!("sqlite://{}", db_path.to_str().unwrap());

        info!("连接到数据库: {}", db_url);

        // 使用 SqliteConnectOptions 配置连接
        let options = SqliteConnectOptions::from_str(&db_url)
            .unwrap()
            .create_if_missing(true)
            .foreign_keys(true);

        // 使用 connect_with 创建连接池
        let pool = SqlitePool::connect_with(options).await?;

        Ok(Self { pool })
    }

    pub async fn init_schema(&self) -> Result<(), sqlx::Error> {
        info!("初始化数据库schema");

        // schema.sql位于 src-tauri/ 目录下
        // 当前文件在 src-tauri/src/database/ 目录下
        // 所以需要使用 ../../schema.sql
        let schema = include_str!("../../schema.sql");

        // 执行schema
        sqlx::query(schema).execute(&self.pool).await?;

        self.run_migrations().await?;

        info!("数据库schema初始化完成");

        // 插入默认数据
        self.insert_default_data().await?;

        Ok(())
    }

    /// 插入默认数据
    async fn insert_default_data(&self) -> Result<(), sqlx::Error> {
        info!("开始检查并插入默认数据...");

        // 1. 插入默认人员
        self.insert_default_person().await?;

        // 2. 插入默认费用类别
        self.insert_default_expense_categories().await?;

        // 3. 插入默认凭证类型
        self.insert_default_voucher_types().await?;

        info!("默认数据检查和插入完成");
        Ok(())
    }

    async fn run_migrations(&self) -> Result<(), sqlx::Error> {
        let expense_files_columns =
            sqlx::query_scalar::<_, String>("SELECT name FROM pragma_table_info('expense_files')")
                .fetch_all(&self.pool)
                .await
                .unwrap_or_default();

        if !expense_files_columns
            .iter()
            .any(|column| column == "voucher_type_id")
        {
            info!("为 expense_files 表补充 voucher_type_id 字段");
            sqlx::query("ALTER TABLE expense_files ADD COLUMN voucher_type_id INTEGER REFERENCES voucher_types(id)")
                .execute(&self.pool)
                .await?;
        }

        Ok(())
    }

    /// 插入默认人员
    async fn insert_default_person(&self) -> Result<(), sqlx::Error> {
        // 检查是否已经有默认人员
        let count: (i64,) = sqlx::query_as("SELECT COUNT(*) as count FROM person WHERE name = ?")
            .bind("刘林焜")
            .fetch_one(&self.pool)
            .await?;

        if count.0 == 0 {
            match sqlx::query("INSERT INTO person (name) VALUES (?)")
                .bind("刘林焜")
                .execute(&self.pool)
                .await
            {
                Ok(_) => info!("默认人员插入完成"),
                Err(e) => error!("插入默认人员失败: {}", e),
            }
        } else {
            info!("默认人员已存在，跳过插入");
        }

        Ok(())
    }

    /// 插入默认费用类别
    async fn insert_default_expense_categories(&self) -> Result<(), sqlx::Error> {
        // 检查是否已经有默认费用类别
        let count: (i64,) = sqlx::query_as(
            "SELECT COUNT(*) as count FROM expense_categories WHERE name = ? AND parent_id IS NULL",
        )
        .bind("长途交通")
        .fetch_one(&self.pool)
        .await?;

        if count.0 == 0 {
            info!("开始插入默认费用类别...");

            let default_main_categories = vec![
                "长途交通",
                "市内车费",
                "车辆费",
                "邮电费",
                "餐费",
                "住宿费",
                "其他费",
                "零星材料费",
            ];

            let default_sub_categories: Vec<(&str, Vec<&str>)> = vec![
                ("长途交通", vec!["火车票", "机票"]),
                ("市内车费", vec!["出租车费", "公交费", "打车费", "客车费"]),
                ("车辆费", vec!["加油费", "租车费", "通行费"]),
                ("邮电费", vec!["快递费", "流量费"]),
                ("餐费", vec!["餐费"]),
                ("住宿费", vec!["住宿费"]),
                ("其他费", vec!["体检费", "税点", "临时占地费"]),
                ("零星材料费", vec!["打印费", "工具费"]),
            ];

            // 首先插入所有主类别
            let mut main_category_ids: std::collections::HashMap<String, i64> =
                std::collections::HashMap::new();

            for main_cat in default_main_categories {
                // 尝试插入
                match sqlx::query(
                    "INSERT INTO expense_categories (name, parent_id) VALUES (?, NULL)",
                )
                .bind(main_cat)
                .execute(&self.pool)
                .await
                {
                    Ok(_) => {
                        // 获取插入的ID
                        let category: (i64,) = sqlx::query_as(
                            "SELECT id FROM expense_categories WHERE name = ? AND parent_id IS NULL"
                        )
                        .bind(main_cat)
                        .fetch_one(&self.pool)
                        .await?;
                        main_category_ids.insert(main_cat.to_string(), category.0);
                    }
                    Err(e) => {
                        error!("插入主类别 \"{}\" 时出错: {}", main_cat, e);
                    }
                }
            }

            // 然后插入子类别
            for (parent_name, children) in default_sub_categories {
                if let Some(parent_id) = main_category_ids.get(parent_name) {
                    for child in children {
                        match sqlx::query(
                            "INSERT INTO expense_categories (name, parent_id) VALUES (?, ?)",
                        )
                        .bind(child)
                        .bind(parent_id)
                        .execute(&self.pool)
                        .await
                        {
                            Ok(_) => {}
                            Err(e) => {
                                error!(
                                    "插入子类别 \"{}\" 到 \"{}\" 时出错: {}",
                                    child, parent_name, e
                                );
                            }
                        }
                    }
                }
            }

            info!("默认费用类别插入完成");
        } else {
            info!("默认费用类别已存在，跳过插入");
        }

        Ok(())
    }

    /// 插入默认凭证类型
    async fn insert_default_voucher_types(&self) -> Result<(), sqlx::Error> {
        // 检查是否已经有默认凭证类型
        let count: (i64,) =
            sqlx::query_as("SELECT COUNT(*) as count FROM voucher_types WHERE name = ?")
                .bind("发票")
                .fetch_one(&self.pool)
                .await?;

        if count.0 == 0 {
            info!("开始插入默认凭证类型...");

            let default_voucher_types = vec![
                ("发票", "发票类型"),
                ("收据", "收据类型"),
                ("付款记录", "付款记录类型"),
                ("详单", "详单类型"),
            ];

            for (name, description) in default_voucher_types {
                match sqlx::query("INSERT INTO voucher_types (name, description) VALUES (?, ?)")
                    .bind(name)
                    .bind(description)
                    .execute(&self.pool)
                    .await
                {
                    Ok(_) => {}
                    Err(e) => {
                        error!("插入凭证类型 \"{}\" 时出错: {}", name, e);
                    }
                }
            }

            info!("默认凭证类型插入完成");
        } else {
            info!("默认凭证类型已存在，跳过插入");
        }

        Ok(())
    }
}

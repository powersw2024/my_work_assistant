use sqlx::SqlitePool;
use serde::{Deserialize, Serialize};

#[derive(Serialize, Deserialize)]
pub struct ProjectStatistics {
    pub project_days: i64,
    pub meal_allowance: f64,
}

#[derive(Serialize, Deserialize)]
pub struct ExpenseSummary {
    pub total_expenses: f64,
    pub total_with_invoice: f64,
    pub miscellaneous_total: f64,
    pub category_breakdown: Vec<CategoryExpense>,
    pub invoice_category_breakdown: Vec<CategoryExpense>,
}

#[derive(Serialize, Deserialize)]
pub struct CategoryExpense {
    pub category_name: String,
    pub amount: f64,
}

/// 获取项目统计数据（天数、伙食补贴）
pub async fn get_project_statistics(
    pool: &SqlitePool,
    project_id: i64
) -> Result<ProjectStatistics, String> {
    // 获取项目信息
    let project: (
        String,  // start_date
        Option<String>,  // end_date
    ) = sqlx::query_as(
        "SELECT start_date, end_date FROM projects WHERE id = ?"
    )
    .bind(project_id)
    .fetch_one(pool)
    .await
    .map_err(|e| format!("获取项目信息失败: {}", e))?;

    let start_date = chrono::NaiveDate::parse_from_str(&project.0, "%Y-%m-%d")
        .map_err(|e| format!("解析开始日期失败: {}", e))?;
    
    let today = chrono::Local::now().naive_local().date();
    
    let end_date = if let Some(ref end_str) = project.1 {
        let parsed = chrono::NaiveDate::parse_from_str(end_str, "%Y-%m-%d")
            .map_err(|e| format!("解析结束日期失败: {}", e))?;
        if parsed < today {
            parsed
        } else {
            today
        }
    } else {
        today
    };

    let days_count = (end_date - start_date).num_days() + 1;
    let meal_allowance = days_count as f64 * 90.0;

    Ok(ProjectStatistics {
        project_days: days_count,
        meal_allowance,
    })
}

/// 获取费用汇总统计
pub async fn get_expense_summary(
    pool: &SqlitePool,
    project_id: i64
) -> Result<ExpenseSummary, String> {
    // 使用原始查询获取所有费用和分类信息
    let expenses: Vec<(
        i64,       // id
        i64,       // project_id
        f64,       // amount
        i64,       // main_category_id
        i64,       // sub_category_id
        Option<String>, // description
        Option<String>, // file_paths
        String,    // date
        String,    // created_at
        String,    // updated_at
        Option<String>, // main_category.name
    )> = sqlx::query_as(
        r#"
        SELECT 
            e.id, e.project_id, e.amount, e.main_category_id, e.sub_category_id,
            e.description, e.file_paths, e.date, e.created_at, e.updated_at,
            main_cat.name as main_category_name
        FROM expenses e
        LEFT JOIN categories main_cat ON e.main_category_id = main_cat.id
        WHERE e.project_id = ? AND (main_cat.name IS NULL OR main_cat.name != '伙食补贴')
        ORDER BY e.date
        "#
    )
    .bind(project_id)
    .fetch_all(pool)
    .await
    .map_err(|e| format!("获取费用列表失败: {}", e))?;

    // 计算各分类的费用统计
    let mut category_totals: std::collections::HashMap<String, f64> = std::collections::HashMap::new();
    let mut invoice_category_totals: std::collections::HashMap<String, f64> = std::collections::HashMap::new();

    for exp in &expenses {
        let amount = exp.2; // amount
        
        // 获取主分类名称
        if let Some(ref cat_name) = exp.10 { // main_category_name
            // 累计总费用
            *category_totals.entry(cat_name.clone()).or_insert(0.0) += amount;
            
            // 简化处理：假设所有费用都有发票（如果有voucher_type关联）
            // TODO: 根据实际的数据库schema调整
            *invoice_category_totals.entry(cat_name.clone()).or_insert(0.0) += amount;
        }
    }

    // 转换为向量并排序
    let mut category_breakdown: Vec<CategoryExpense> = category_totals
        .into_iter()
        .map(|(name, amount)| CategoryExpense { category_name: name, amount })
        .collect();
    
    let mut invoice_category_breakdown: Vec<CategoryExpense> = invoice_category_totals
        .into_iter()
        .map(|(name, amount)| CategoryExpense { category_name: name, amount })
        .collect();

    category_breakdown.sort_by(|a, b| a.category_name.cmp(&b.category_name));
    invoice_category_breakdown.sort_by(|a, b| a.category_name.cmp(&b.category_name));

    // 计算总计
    let total_expenses: f64 = category_breakdown.iter().map(|c| c.amount).sum();
    let total_with_invoice: f64 = invoice_category_breakdown.iter().map(|c| c.amount).sum();
    let miscellaneous_total = total_expenses - total_with_invoice;

    Ok(ExpenseSummary {
        total_expenses,
        total_with_invoice,
        miscellaneous_total,
        category_breakdown,
        invoice_category_breakdown,
    })
}

use crate::models::expense::{ExpenseRecord, ExpenseResponse, ExpenseCategory, VoucherType, ExpenseFile, CreateExpenseDto, UpdateExpenseDto, CreateExpenseCategoryDto, CreateVoucherTypeDto};
use sqlx::SqlitePool;

// ===== Expense Record Services =====

pub async fn get_expenses_by_project(pool: &SqlitePool, project_id: i64) -> Result<Vec<ExpenseResponse>, String> {
    let expenses = sqlx::query_as::<_, ExpenseResponse>(
        r#"
        SELECT 
            e.*,
            mc.name as main_category,
            sc.name as sub_category,
            GROUP_CONCAT(vt.name, ', ') as voucher_type
        FROM expense_records e
        LEFT JOIN expense_categories mc ON e.main_category_id = mc.id
        LEFT JOIN expense_categories sc ON e.sub_category_id = sc.id
        LEFT JOIN expense_voucher_types evt ON e.id = evt.expense_record_id
        LEFT JOIN voucher_types vt ON evt.voucher_type_id = vt.id
        WHERE e.project_id = ?
        GROUP BY e.id
        ORDER BY e.date DESC
        "#
    )
    .bind(project_id)
    .fetch_all(pool)
    .await
    .map_err(|e| format!("获取费用记录失败: {}", e))?;
    
    Ok(expenses)
}

pub async fn get_expense_by_id(pool: &SqlitePool, id: i64) -> Result<ExpenseRecord, String> {
    let expense = sqlx::query_as::<_, ExpenseRecord>(
        "SELECT * FROM expense_records WHERE id = ?"
    )
    .bind(id)
    .fetch_one(pool)
    .await
    .map_err(|e| format!("获取费用记录失败: {}", e))?;
    
    Ok(expense)
}

pub async fn create_expense(pool: &SqlitePool, dto: CreateExpenseDto) -> Result<ExpenseRecord, String> {
    let mut tx = pool.begin().await.map_err(|e| format!("开始事务失败: {}", e))?;
    
    let date = dto.date.unwrap_or_else(|| chrono::Local::now().format("%Y-%m-%d").to_string());
    
    let expense = sqlx::query_as::<_, ExpenseRecord>(
        "INSERT INTO expense_records (project_id, amount, main_category_id, sub_category_id, description, date) VALUES (?, ?, ?, ?, ?, ?) RETURNING *"
    )
    .bind(dto.project_id)
    .bind(dto.amount)
    .bind(dto.main_category_id)
    .bind(dto.sub_category_id)
    .bind(&dto.description)
    .bind(&date)
    .fetch_one(&mut *tx)
    .await
    .map_err(|e| format!("创建费用记录失败: {}", e))?;
    
    // 关联凭证类型
    if let Some(voucher_type_ids) = &dto.voucher_type_ids {
        for voucher_type_id in voucher_type_ids {
            sqlx::query(
                "INSERT INTO expense_voucher_types (expense_record_id, voucher_type_id) VALUES (?, ?)"
            )
            .bind(expense.id)
            .bind(voucher_type_id)
            .execute(&mut *tx)
            .await
            .map_err(|e| format!("关联凭证类型失败: {}", e))?;
        }
    }
    
    tx.commit().await.map_err(|e| format!("提交事务失败: {}", e))?;
    
    Ok(expense)
}

pub async fn update_expense(pool: &SqlitePool, id: i64, dto: UpdateExpenseDto) -> Result<ExpenseRecord, String> {
    let mut tx = pool.begin().await.map_err(|e| format!("开始事务失败: {}", e))?;
    
    let existing = get_expense_by_id(pool, id).await?;
    
    let amount = dto.amount.unwrap_or(existing.amount);
    let main_category_id = dto.main_category_id.unwrap_or(existing.main_category_id);
    let sub_category_id = dto.sub_category_id.unwrap_or(existing.sub_category_id);
    let description = dto.description.or(existing.description);
    let date = dto.date.unwrap_or(existing.date);
    
    let expense = sqlx::query_as::<_, ExpenseRecord>(
        "UPDATE expense_records SET amount = ?, main_category_id = ?, sub_category_id = ?, description = ?, date = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ? RETURNING *"
    )
    .bind(amount)
    .bind(main_category_id)
    .bind(sub_category_id)
    .bind(&description)
    .bind(&date)
    .bind(id)
    .fetch_one(&mut *tx)
    .await
    .map_err(|e| format!("更新费用记录失败: {}", e))?;
    
    // 更新凭证类型关联
    if let Some(voucher_type_ids) = &dto.voucher_type_ids {
        // 删除旧关联
        sqlx::query("DELETE FROM expense_voucher_types WHERE expense_record_id = ?")
            .bind(id)
            .execute(&mut *tx)
            .await
            .map_err(|e| format!("删除旧凭证关联失败: {}", e))?;
        
        // 添加新关联
        for voucher_type_id in voucher_type_ids {
            sqlx::query(
                "INSERT INTO expense_voucher_types (expense_record_id, voucher_type_id) VALUES (?, ?)"
            )
            .bind(id)
            .bind(voucher_type_id)
            .execute(&mut *tx)
            .await
            .map_err(|e| format!("关联凭证类型失败: {}", e))?;
        }
    }
    
    tx.commit().await.map_err(|e| format!("提交事务失败: {}", e))?;
    
    Ok(expense)
}

pub async fn delete_expense(pool: &SqlitePool, id: i64) -> Result<(), String> {
    sqlx::query("DELETE FROM expense_records WHERE id = ?")
        .bind(id)
        .execute(pool)
        .await
        .map_err(|e| format!("删除费用记录失败: {}", e))?;
    
    Ok(())
}

// ===== Expense Category Services =====

pub async fn get_all_categories(pool: &SqlitePool) -> Result<Vec<ExpenseCategory>, String> {
    let categories = sqlx::query_as::<_, ExpenseCategory>(
        "SELECT * FROM expense_categories ORDER BY id"
    )
    .fetch_all(pool)
    .await
    .map_err(|e| format!("获取费用类别失败: {}", e))?;
    
    Ok(categories)
}

pub async fn create_category(pool: &SqlitePool, dto: CreateExpenseCategoryDto) -> Result<ExpenseCategory, String> {
    let category = sqlx::query_as::<_, ExpenseCategory>(
        "INSERT INTO expense_categories (name, parent_id) VALUES (?, ?) RETURNING *"
    )
    .bind(&dto.name)
    .bind(&dto.parent_id)
    .fetch_one(pool)
    .await
    .map_err(|e| format!("创建费用类别失败: {}", e))?;
    
    Ok(category)
}

pub async fn delete_category(pool: &SqlitePool, id: i64) -> Result<(), String> {
    sqlx::query("DELETE FROM expense_categories WHERE id = ?")
        .bind(id)
        .execute(pool)
        .await
        .map_err(|e| format!("删除费用类别失败: {}", e))?;
    
    Ok(())
}

// ===== Voucher Type Services =====

pub async fn get_all_voucher_types(pool: &SqlitePool) -> Result<Vec<VoucherType>, String> {
    let types = sqlx::query_as::<_, VoucherType>(
        "SELECT * FROM voucher_types ORDER BY id"
    )
    .fetch_all(pool)
    .await
    .map_err(|e| format!("获取凭证类型失败: {}", e))?;
    
    Ok(types)
}

pub async fn create_voucher_type(pool: &SqlitePool, dto: CreateVoucherTypeDto) -> Result<VoucherType, String> {
    let voucher_type = sqlx::query_as::<_, VoucherType>(
        "INSERT INTO voucher_types (name, description) VALUES (?, ?) RETURNING *"
    )
    .bind(&dto.name)
    .bind(&dto.description)
    .fetch_one(pool)
    .await
    .map_err(|e| format!("创建凭证类型失败: {}", e))?;
    
    Ok(voucher_type)
}

pub async fn delete_voucher_type(pool: &SqlitePool, id: i64) -> Result<(), String> {
    sqlx::query("DELETE FROM voucher_types WHERE id = ?")
        .bind(id)
        .execute(pool)
        .await
        .map_err(|e| format!("删除凭证类型失败: {}", e))?;
    
    Ok(())
}

// ===== Expense File Services =====

pub async fn get_expense_files(pool: &SqlitePool, expense_id: i64) -> Result<Vec<ExpenseFile>, String> {
    let files = sqlx::query_as::<_, ExpenseFile>(
        "SELECT * FROM expense_files WHERE expense_record_id = ?"
    )
    .bind(expense_id)
    .fetch_all(pool)
    .await
    .map_err(|e| format!("获取费用文件失败: {}", e))?;
    
    Ok(files)
}

/// 创建费用文件记录
#[allow(dead_code)]
pub async fn create_expense_file(
    pool: &SqlitePool, 
    expense_id: i64, 
    file_path: &str, 
    file_name: &str, 
    file_size: i64
) -> Result<ExpenseFile, String> {
    let file = sqlx::query_as::<_, ExpenseFile>(
        "INSERT INTO expense_files (expense_record_id, file_path, file_name, file_size) VALUES (?, ?, ?, ?) RETURNING *"
    )
    .bind(expense_id)
    .bind(file_path)
    .bind(file_name)
    .bind(file_size)
    .fetch_one(pool)
    .await
    .map_err(|e| format!("创建费用文件记录失败: {}", e))?;
    
    Ok(file)
}

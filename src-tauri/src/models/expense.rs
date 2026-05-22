use serde::{Deserialize, Serialize};
use sqlx::FromRow;

#[derive(Debug, Clone, Serialize, Deserialize, FromRow)]
pub struct ExpenseCategory {
    pub id: i64,
    pub name: String,
    pub parent_id: Option<i64>,
    pub created_at: String,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct CreateExpenseCategoryDto {
    pub name: String,
    pub parent_id: Option<i64>,
}

#[derive(Debug, Clone, Serialize, Deserialize, FromRow)]
pub struct VoucherType {
    pub id: i64,
    pub name: String,
    pub description: Option<String>,
    pub created_at: String,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct CreateVoucherTypeDto {
    pub name: String,
    pub description: Option<String>,
}

#[derive(Debug, Clone, Serialize, Deserialize, FromRow)]
pub struct ExpenseRecord {
    pub id: i64,
    pub project_id: i64,
    pub amount: f64,
    pub main_category_id: i64,
    pub sub_category_id: i64,
    pub description: Option<String>,
    pub file_paths: Option<String>,
    pub date: String,
    pub created_at: String,
    pub updated_at: String,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct CreateExpenseDto {
    pub project_id: i64,
    pub amount: f64,
    pub main_category_id: i64,
    pub sub_category_id: i64,
    pub description: Option<String>,
    pub date: Option<String>,
    pub voucher_type_ids: Option<Vec<i64>>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct UpdateExpenseDto {
    pub amount: Option<f64>,
    pub main_category_id: Option<i64>,
    pub sub_category_id: Option<i64>,
    pub description: Option<String>,
    pub date: Option<String>,
    pub voucher_type_ids: Option<Vec<i64>>,
}

#[derive(Debug, Clone, Serialize, Deserialize, FromRow)]
pub struct ExpenseFile {
    pub id: i64,
    pub expense_record_id: i64,
    pub file_path: String,
    pub file_name: String,
    pub file_size: Option<i64>,
    pub created_at: String,
}

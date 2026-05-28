use tauri::State;
use crate::database::Database;
use crate::models::expense::{
    ExpenseRecord, ExpenseResponse, ExpenseCategory, VoucherType, ExpenseFile,
    CreateExpenseDto, UpdateExpenseDto, CreateExpenseCategoryDto, CreateVoucherTypeDto
};
use crate::services::expense_service;

// ===== Expense Record Commands =====

#[tauri::command]
pub async fn get_expenses(db: State<'_, Database>, project_id: i64) -> Result<Vec<ExpenseResponse>, String> {
    expense_service::get_expenses_by_project(&db.pool, project_id).await
}

#[tauri::command]
pub async fn get_expense(db: State<'_, Database>, id: i64) -> Result<ExpenseRecord, String> {
    expense_service::get_expense_by_id(&db.pool, id).await
}

#[tauri::command]
pub async fn create_expense(
    db: State<'_, Database>,
    dto: CreateExpenseDto
) -> Result<ExpenseRecord, String> {
    expense_service::create_expense(&db.pool, dto).await
}

#[tauri::command]
pub async fn update_expense(
    db: State<'_, Database>,
    id: i64,
    dto: UpdateExpenseDto
) -> Result<ExpenseRecord, String> {
    expense_service::update_expense(&db.pool, id, dto).await
}

#[tauri::command]
pub async fn delete_expense(db: State<'_, Database>, id: i64) -> Result<(), String> {
    expense_service::delete_expense(&db.pool, id).await
}

// ===== Expense Category Commands =====

#[tauri::command]
pub async fn get_categories(db: State<'_, Database>) -> Result<Vec<ExpenseCategory>, String> {
    expense_service::get_all_categories(&db.pool).await
}

#[tauri::command]
pub async fn create_category(
    db: State<'_, Database>,
    dto: CreateExpenseCategoryDto
) -> Result<ExpenseCategory, String> {
    expense_service::create_category(&db.pool, dto).await
}

#[tauri::command]
pub async fn delete_category(db: State<'_, Database>, id: i64) -> Result<(), String> {
    expense_service::delete_category(&db.pool, id).await
}

// ===== Voucher Type Commands =====

#[tauri::command]
pub async fn get_voucher_types(db: State<'_, Database>) -> Result<Vec<VoucherType>, String> {
    expense_service::get_all_voucher_types(&db.pool).await
}

#[tauri::command]
pub async fn create_voucher_type(
    db: State<'_, Database>,
    dto: CreateVoucherTypeDto
) -> Result<VoucherType, String> {
    expense_service::create_voucher_type(&db.pool, dto).await
}

#[tauri::command]
pub async fn delete_voucher_type(db: State<'_, Database>, id: i64) -> Result<(), String> {
    expense_service::delete_voucher_type(&db.pool, id).await
}

// ===== Expense File Commands =====

#[tauri::command]
pub async fn get_expense_files(db: State<'_, Database>, expense_id: i64) -> Result<Vec<ExpenseFile>, String> {
    expense_service::get_expense_files(&db.pool, expense_id).await
}

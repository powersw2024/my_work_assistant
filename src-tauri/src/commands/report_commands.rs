use tauri::State;
use crate::database::Database;
use crate::services::report_service;

#[tauri::command]
pub async fn get_project_statistics(
    db: State<'_, Database>,
    project_id: i64
) -> Result<report_service::ProjectStatistics, String> {
    report_service::get_project_statistics(&db.pool, project_id).await
}

#[tauri::command]
pub async fn get_expense_summary(
    db: State<'_, Database>,
    project_id: i64
) -> Result<report_service::ExpenseSummary, String> {
    report_service::get_expense_summary(&db.pool, project_id).await
}

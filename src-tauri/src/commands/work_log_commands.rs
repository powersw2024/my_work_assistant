use tauri::State;
use crate::database::Database;
use crate::models::work_log::{WorkLog, CreateWorkLogDto, UpdateWorkLogDto};
use crate::services::work_log_service;

#[tauri::command]
pub async fn get_work_logs(db: State<'_, Database>, project_id: i64) -> Result<Vec<WorkLog>, String> {
    work_log_service::get_work_logs_by_project(&db.pool, project_id).await
}

#[tauri::command]
pub async fn get_work_log(db: State<'_, Database>, id: i64) -> Result<WorkLog, String> {
    work_log_service::get_work_log_by_id(&db.pool, id).await
}

#[tauri::command]
pub async fn create_work_log(
    db: State<'_, Database>,
    dto: CreateWorkLogDto
) -> Result<WorkLog, String> {
    work_log_service::create_work_log(&db.pool, dto).await
}

#[tauri::command]
pub async fn update_work_log(
    db: State<'_, Database>,
    id: i64,
    dto: UpdateWorkLogDto
) -> Result<WorkLog, String> {
    work_log_service::update_work_log(&db.pool, id, dto).await
}

#[tauri::command]
pub async fn delete_work_log(db: State<'_, Database>, id: i64) -> Result<(), String> {
    work_log_service::delete_work_log(&db.pool, id).await
}

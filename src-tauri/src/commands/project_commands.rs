use tauri::State;
use crate::database::Database;
use crate::models::project::{Project, CreateProjectDto, UpdateProjectDto};
use crate::services::project_service;

#[tauri::command]
pub async fn get_projects(db: State<'_, Database>) -> Result<Vec<Project>, String> {
    project_service::get_all_projects(&db.pool).await
}

#[tauri::command]
pub async fn get_project(db: State<'_, Database>, id: i64) -> Result<Project, String> {
    project_service::get_project_by_id(&db.pool, id).await
}

#[tauri::command]
pub async fn create_project(
    db: State<'_, Database>,
    dto: CreateProjectDto
) -> Result<Project, String> {
    project_service::create_project(&db.pool, dto).await
}

#[tauri::command]
pub async fn update_project(
    db: State<'_, Database>,
    id: i64,
    dto: UpdateProjectDto
) -> Result<Project, String> {
    project_service::update_project(&db.pool, id, dto).await
}

#[tauri::command]
pub async fn delete_project(db: State<'_, Database>, id: i64) -> Result<(), String> {
    project_service::delete_project(&db.pool, id).await
}

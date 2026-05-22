use tauri::State;
use crate::database::Database;
use crate::models::person::{Person, CreatePersonDto};
use crate::models::setting::{SystemSetting, UpdateSettingDto};
use crate::services::person_setting_service;

// ===== Person Commands =====

#[tauri::command]
pub async fn get_persons(db: State<'_, Database>) -> Result<Vec<Person>, String> {
    person_setting_service::get_all_persons(&db.pool).await
}

#[tauri::command]
pub async fn create_person(
    db: State<'_, Database>,
    dto: CreatePersonDto
) -> Result<Person, String> {
    person_setting_service::create_person(&db.pool, dto).await
}

#[tauri::command]
pub async fn delete_person(db: State<'_, Database>, id: i64) -> Result<(), String> {
    person_setting_service::delete_person(&db.pool, id).await
}

// ===== Settings Commands =====

#[tauri::command]
pub async fn get_settings(db: State<'_, Database>) -> Result<Option<SystemSetting>, String> {
    person_setting_service::get_settings(&db.pool).await
}

#[tauri::command]
pub async fn update_settings(
    db: State<'_, Database>,
    dto: UpdateSettingDto
) -> Result<SystemSetting, String> {
    person_setting_service::update_settings(&db.pool, dto).await
}
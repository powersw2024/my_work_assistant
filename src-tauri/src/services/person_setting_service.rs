use crate::models::person::{Person, CreatePersonDto};
use crate::models::setting::{SystemSetting, UpdateSettingDto};
use sqlx::SqlitePool;

// ===== Person Services =====

pub async fn get_all_persons(pool: &SqlitePool) -> Result<Vec<Person>, String> {
    let persons: Vec<Person> = sqlx::query_as::<_, Person>(
        "SELECT * FROM person ORDER BY name"
    )
    .fetch_all(pool)
    .await
    .map_err(|e| format!("获取人员列表失败: {}", e))?;
    
    Ok(persons)
}

pub async fn create_person(pool: &SqlitePool, dto: CreatePersonDto) -> Result<Person, String> {
    let person: Person = sqlx::query_as::<_, Person>(
        "INSERT INTO person (name) VALUES (?) RETURNING *"
    )
    .bind(&dto.name)
    .fetch_one(pool)
    .await
    .map_err(|e| format!("创建人员失败: {}", e))?;
    
    Ok(person)
}

pub async fn delete_person(pool: &SqlitePool, id: i64) -> Result<(), String> {
    sqlx::query("DELETE FROM person WHERE id = ?")
        .bind(id)
        .execute(pool)
        .await
        .map_err(|e| format!("删除人员失败: {}", e))?;
    
    Ok(())
}

// ===== Setting Services =====

pub async fn get_settings(pool: &SqlitePool) -> Result<Option<SystemSetting>, String> {
    let setting: Option<SystemSetting> = sqlx::query_as::<_, SystemSetting>(
        "SELECT * FROM system_settings WHERE id = 1"
    )
    .fetch_optional(pool)
    .await
    .map_err(|e| format!("获取系统设置失败: {}", e))?;
    
    Ok(setting)
}

pub async fn update_settings(pool: &SqlitePool, dto: UpdateSettingDto) -> Result<SystemSetting, String> {
    let existing = get_settings(pool).await?;
    
    if let Some(setting) = existing {
        let db_location = dto.db_location.or(setting.db_location);
        let upload_folder = dto.upload_folder.or(setting.upload_folder);
        
        let setting: SystemSetting = sqlx::query_as::<_, SystemSetting>(
            "UPDATE system_settings SET db_location = ?, upload_folder = ?, updated_at = CURRENT_TIMESTAMP WHERE id = 1 RETURNING *"
        )
        .bind(&db_location)
        .bind(&upload_folder)
        .fetch_one(pool)
        .await
        .map_err(|e| format!("更新系统设置失败: {}", e))?;
        
        Ok(setting)
    } else {
        let db_location = dto.db_location;
        let upload_folder = dto.upload_folder;
        
        let setting: SystemSetting = sqlx::query_as::<_, SystemSetting>(
            "INSERT INTO system_settings (id, db_location, upload_folder) VALUES (1, ?, ?) RETURNING *"
        )
        .bind(&db_location)
        .bind(&upload_folder)
        .fetch_one(pool)
        .await
        .map_err(|e| format!("创建系统设置失败: {}", e))?;
        
        Ok(setting)
    }
}
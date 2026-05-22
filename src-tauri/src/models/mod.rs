pub mod project;
pub mod work_log;
pub mod expense;
pub mod person;
pub mod setting;

use serde::{Deserialize, Serialize};
use sqlx::FromRow;

#[derive(Debug, Clone, Serialize, Deserialize, FromRow)]
#[allow(dead_code)]
pub struct Person {
    pub id: i64,
    pub name: String,
    pub created_at: String,
}

/// 创建人员DTO
#[derive(Debug, Clone, Serialize, Deserialize)]
#[allow(dead_code)]
pub struct CreatePersonDto {
    pub name: String,
}

/// 系统设置
#[derive(Debug, Clone, Serialize, Deserialize, FromRow)]
#[allow(dead_code)]
pub struct SystemSetting {
    pub id: i64,
    pub db_location: Option<String>,
    pub upload_folder: Option<String>,
    pub created_at: String,
    pub updated_at: String,
}

/// 更新设置DTO
#[derive(Debug, Clone, Serialize, Deserialize)]
#[allow(dead_code)]
pub struct UpdateSettingDto {
    pub db_location: Option<String>,
    pub upload_folder: Option<String>,
}

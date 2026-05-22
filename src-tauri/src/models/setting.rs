use serde::{Deserialize, Serialize};
use sqlx::FromRow;

#[derive(Debug, Clone, Serialize, Deserialize, FromRow)]
pub struct SystemSetting {
    pub id: i64,
    pub db_location: Option<String>,
    pub upload_folder: Option<String>,
    pub created_at: String,
    pub updated_at: String,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct UpdateSettingDto {
    pub db_location: Option<String>,
    pub upload_folder: Option<String>,
}

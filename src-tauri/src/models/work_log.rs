use serde::{Deserialize, Serialize};
use sqlx::FromRow;

#[derive(Debug, Clone, Serialize, Deserialize, FromRow)]
pub struct WorkLog {
    pub id: i64,
    pub project_id: i64,
    pub log_date: String,
    pub author: String,
    pub executor: Option<String>,
    pub weather: String,
    pub location: Option<String>,
    pub content: String,
    pub next_day_plan: Option<String>,
    pub created_at: String,
    pub updated_at: String,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct CreateWorkLogDto {
    pub project_id: i64,
    pub log_date: String,
    pub author: String,
    pub executor: Option<String>,
    pub weather: Option<String>,
    pub location: Option<String>,
    pub content: String,
    pub next_day_plan: Option<String>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct UpdateWorkLogDto {
    pub log_date: Option<String>,
    pub author: Option<String>,
    pub executor: Option<String>,
    pub weather: Option<String>,
    pub location: Option<String>,
    pub content: Option<String>,
    pub next_day_plan: Option<String>,
}

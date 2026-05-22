use crate::models::work_log::{WorkLog, CreateWorkLogDto, UpdateWorkLogDto};
use sqlx::SqlitePool;

pub async fn get_work_logs_by_project(pool: &SqlitePool, project_id: i64) -> Result<Vec<WorkLog>, String> {
    let logs = sqlx::query_as::<_, WorkLog>(
        "SELECT * FROM work_logs WHERE project_id = ? ORDER BY log_date DESC"
    )
    .bind(project_id)
    .fetch_all(pool)
    .await
    .map_err(|e| format!("获取工作日志失败: {}", e))?;
    
    Ok(logs)
}

pub async fn get_work_log_by_id(pool: &SqlitePool, id: i64) -> Result<WorkLog, String> {
    let log = sqlx::query_as::<_, WorkLog>(
        "SELECT * FROM work_logs WHERE id = ?"
    )
    .bind(id)
    .fetch_one(pool)
    .await
    .map_err(|e| format!("获取工作日志失败: {}", e))?;
    
    Ok(log)
}

pub async fn create_work_log(pool: &SqlitePool, dto: CreateWorkLogDto) -> Result<WorkLog, String> {
    let weather = dto.weather.unwrap_or_else(|| "晴".to_string());
    
    let log = sqlx::query_as::<_, WorkLog>(
        "INSERT INTO work_logs (project_id, log_date, author, executor, weather, location, content, next_day_plan) VALUES (?, ?, ?, ?, ?, ?, ?, ?) RETURNING *"
    )
    .bind(dto.project_id)
    .bind(&dto.log_date)
    .bind(&dto.author)
    .bind(&dto.executor)
    .bind(&weather)
    .bind(&dto.location)
    .bind(&dto.content)
    .bind(&dto.next_day_plan)
    .fetch_one(pool)
    .await
    .map_err(|e| format!("创建工作日志失败: {}", e))?;
    
    Ok(log)
}

pub async fn update_work_log(pool: &SqlitePool, id: i64, dto: UpdateWorkLogDto) -> Result<WorkLog, String> {
    let existing = get_work_log_by_id(pool, id).await?;
    
    let log_date = dto.log_date.unwrap_or(existing.log_date);
    let author = dto.author.unwrap_or(existing.author);
    let executor = dto.executor.or(existing.executor);
    let weather = dto.weather.unwrap_or(existing.weather);
    let location = dto.location.or(existing.location);
    let content = dto.content.unwrap_or(existing.content);
    let next_day_plan = dto.next_day_plan.or(existing.next_day_plan);
    
    let log = sqlx::query_as::<_, WorkLog>(
        "UPDATE work_logs SET log_date = ?, author = ?, executor = ?, weather = ?, location = ?, content = ?, next_day_plan = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ? RETURNING *"
    )
    .bind(&log_date)
    .bind(&author)
    .bind(&executor)
    .bind(&weather)
    .bind(&location)
    .bind(&content)
    .bind(&next_day_plan)
    .bind(id)
    .fetch_one(pool)
    .await
    .map_err(|e| format!("更新工作日志失败: {}", e))?;
    
    Ok(log)
}

pub async fn delete_work_log(pool: &SqlitePool, id: i64) -> Result<(), String> {
    sqlx::query("DELETE FROM work_logs WHERE id = ?")
        .bind(id)
        .execute(pool)
        .await
        .map_err(|e| format!("删除工作日志失败: {}", e))?;
    
    Ok(())
}

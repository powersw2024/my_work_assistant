use crate::models::project::{Project, CreateProjectDto, UpdateProjectDto};
use sqlx::SqlitePool;

pub async fn get_all_projects(pool: &SqlitePool) -> Result<Vec<Project>, String> {
    let projects = sqlx::query_as::<_, Project>(
        "SELECT * FROM projects ORDER BY created_at DESC"
    )
    .fetch_all(pool)
    .await
    .map_err(|e| format!("获取项目列表失败: {}", e))?;
    
    Ok(projects)
}

pub async fn get_project_by_id(pool: &SqlitePool, id: i64) -> Result<Project, String> {
    let project = sqlx::query_as::<_, Project>(
        "SELECT * FROM projects WHERE id = ?"
    )
    .bind(id)
    .fetch_one(pool)
    .await
    .map_err(|e| format!("获取项目失败: {}", e))?;
    
    Ok(project)
}

pub async fn create_project(pool: &SqlitePool, dto: CreateProjectDto) -> Result<Project, String> {
    let status = dto.status.unwrap_or_else(|| "进行中".to_string());
    
    let project = sqlx::query_as::<_, Project>(
        "INSERT INTO projects (name, description, start_date, end_date, status) VALUES (?, ?, ?, ?, ?) RETURNING *"
    )
    .bind(&dto.name)
    .bind(&dto.description)
    .bind(&dto.start_date)
    .bind(&dto.end_date)
    .bind(&status)
    .fetch_one(pool)
    .await
    .map_err(|e| format!("创建项目失败: {}", e))?;
    
    Ok(project)
}

pub async fn update_project(pool: &SqlitePool, id: i64, dto: UpdateProjectDto) -> Result<Project, String> {
    // 先获取现有项目
    let existing = get_project_by_id(pool, id).await?;
    
    let name = dto.name.unwrap_or(existing.name);
    let description = dto.description.or(existing.description);
    let start_date = dto.start_date.unwrap_or(existing.start_date);
    let end_date = dto.end_date.or(existing.end_date);
    let status = dto.status.unwrap_or(existing.status);
    
    let project = sqlx::query_as::<_, Project>(
        "UPDATE projects SET name = ?, description = ?, start_date = ?, end_date = ?, status = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ? RETURNING *"
    )
    .bind(&name)
    .bind(&description)
    .bind(&start_date)
    .bind(&end_date)
    .bind(&status)
    .bind(id)
    .fetch_one(pool)
    .await
    .map_err(|e| format!("更新项目失败: {}", e))?;
    
    Ok(project)
}

pub async fn delete_project(pool: &SqlitePool, id: i64) -> Result<(), String> {
    sqlx::query("DELETE FROM projects WHERE id = ?")
        .bind(id)
        .execute(pool)
        .await
        .map_err(|e| format!("删除项目失败: {}", e))?;
    
    Ok(())
}

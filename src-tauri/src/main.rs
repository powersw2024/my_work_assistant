// Prevents additional console window on Windows in release, DO NOT REMOVE!!
#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

mod commands;
mod database;
mod models;
mod services;

use commands::{
    expense_commands, person_setting_commands, project_commands, report_commands, work_log_commands,
};
use database::Database;
use std::path::PathBuf;
use tauri::Manager;

fn main() {
    // 获取当前运行目录作为应用数据目录
    let app_data_dir = std::env::current_dir().unwrap_or_else(|_| PathBuf::from("."));

    // 数据库路径
    let db_path = app_data_dir.join("database.sqlite");

    // 创建Tauri应用
    tauri::Builder::default()
        .plugin(tauri_plugin_log::Builder::new().build())
        .plugin(tauri_plugin_fs::init())
        .plugin(tauri_plugin_dialog::init())
        .setup(move |app| {
            // 异步初始化数据库
            let app_handle = app.handle().clone();
            let db_path = db_path.clone();

            tauri::async_runtime::spawn(async move {
                match Database::new(&db_path).await {
                    Ok(db) => {
                        if let Err(e) = db.init_schema().await {
                            log::error!("数据库schema初始化失败: {}", e);
                        }

                        // 将数据库管理到状态中
                        app_handle.manage(db);
                        log::info!("数据库初始化完成");
                    }
                    Err(e) => {
                        log::error!("数据库连接失败: {}", e);
                    }
                }
            });

            Ok(())
        })
        // 注册所有命令
        .invoke_handler(tauri::generate_handler![
            // 项目命令
            project_commands::get_projects,
            project_commands::get_project,
            project_commands::create_project,
            project_commands::update_project,
            project_commands::delete_project,
            // 工作日志命令
            work_log_commands::get_work_logs,
            work_log_commands::get_work_log,
            work_log_commands::create_work_log,
            work_log_commands::update_work_log,
            work_log_commands::delete_work_log,
            // 费用命令
            expense_commands::get_expenses,
            expense_commands::get_expense,
            expense_commands::create_expense,
            expense_commands::update_expense,
            expense_commands::delete_expense,
            expense_commands::get_categories,
            expense_commands::create_category,
            expense_commands::delete_category,
            expense_commands::get_voucher_types,
            expense_commands::create_voucher_type,
            expense_commands::delete_voucher_type,
            expense_commands::get_expense_files,
            // 人员和设置命令
            person_setting_commands::get_persons,
            person_setting_commands::create_person,
            person_setting_commands::delete_person,
            person_setting_commands::get_settings,
            person_setting_commands::update_settings,
            // 报表命令
            report_commands::get_project_statistics,
            report_commands::get_expense_summary,
            report_commands::get_template_file,
        ])
        .run(tauri::generate_context!())
        .expect("运行Tauri应用时出错");
}

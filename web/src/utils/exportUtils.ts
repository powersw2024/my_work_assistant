import ExcelJS from 'exceljs';
import JSZip from 'jszip';
import { saveAs } from 'file-saver';
import { reportApi, projectApi, workLogApi, expenseApi } from './tauriApi';
import type { Expense, WorkLog, Project } from './tauriApi';
import { readFile } from '@tauri-apps/plugin-fs';

// 格式化日期为 YYYY-MM-DD
function formatDate(dateString: string | undefined): string {
  if (!dateString) return '';
  return new Date(dateString).toISOString().split('T')[0];
}

// 导出报销数据
export async function exportExpensesFile(projectId: number) {
  // 1. 获取数据
  const project = await projectApi.getProject(projectId);
  const expenses = await expenseApi.getExpenses(projectId);

  // 2. 获取模板
  const templateBytes = await reportApi.getTemplateFile('11.xlsx');

  // 3. 提取模板格式与布局
  const templateWb = new ExcelJS.Workbook();
  await templateWb.xlsx.load(new Uint8Array(templateBytes).buffer);
  const templateWs = templateWb.worksheets[0];

  const layoutAndFormat = {
    name: templateWs.name,
    properties: templateWs.properties,
    pageSetup: templateWs.pageSetup,
    views: templateWs.views,
    columns: templateWs.columns.map(c => ({
      width: c.width,
      hidden: c.hidden,
      style: c.style
    })),
    merges: templateWs.model.merges || [],
    rows: [] as any[]
  };

  templateWs.eachRow({ includeEmpty: true }, (row, rowNumber) => {
    const rowInfo = {
      height: row.height,
      hidden: row.hidden,
      cells: [] as any[]
    };
    row.eachCell({ includeEmpty: true }, (cell, colNumber) => {
      rowInfo.cells.push({
        colNumber,
        value: cell.value,
        style: cell.style,
        type: cell.type
      });
    });
    layoutAndFormat.rows[rowNumber] = rowInfo;
  });

  // 4. 创建全新的工作簿，应用提取到的格式与布局
  const workbook = new ExcelJS.Workbook();
  const worksheet = workbook.addWorksheet(layoutAndFormat.name, {
    properties: layoutAndFormat.properties,
    pageSetup: layoutAndFormat.pageSetup,
    views: layoutAndFormat.views
  });

  worksheet.columns = layoutAndFormat.columns;

  for (let r = 1; r < layoutAndFormat.rows.length; r++) {
    const rowInfo = layoutAndFormat.rows[r];
    if (!rowInfo) continue;
    const newRow = worksheet.getRow(r);
    newRow.height = rowInfo.height;
    newRow.hidden = rowInfo.hidden;
    for (const cellInfo of rowInfo.cells) {
      const newCell = newRow.getCell(cellInfo.colNumber);
      newCell.value = cellInfo.value;
      newCell.style = cellInfo.style;
    }
  }

  for (const merge of layoutAndFormat.merges) {
    worksheet.mergeCells(merge);
  }

  // 5. 写入报销业务数据
  // row 1, col 2-7 merged? Just set A1 or B1
  const titleCell = worksheet.getCell('B1');
  if (titleCell.value && typeof titleCell.value === 'string') {
    titleCell.value = `${project.name}出差决算单`;
  }

  // 5. 整理数据
  // "伙食补贴置后且无分类，各大类间空行分隔"

  const groups: Record<string, Expense[]> = {};
  const mealExpensesByDate: Record<string, Expense[]> = {};

  for (const exp of expenses) {
    const cat = exp.main_category || '其他';
    if (!groups[cat]) groups[cat] = [];
    groups[cat].push(exp);

    if (cat === '餐费' && exp.expense_date) {
      const dateStr = formatDate(exp.expense_date);
      if (!mealExpensesByDate[dateStr]) mealExpensesByDate[dateStr] = [];
      mealExpensesByDate[dateStr].push(exp);
    }
  }

  // 生成伙食补贴记录 (每天一条)
  const subsidyRecords = [];
  if (project.start_date) {
    const start = new Date(project.start_date + 'T00:00:00');
    let endStr = project.end_date;
    if (!endStr) {
      const today = new Date();
      const y = today.getFullYear();
      const m = String(today.getMonth() + 1).padStart(2, '0');
      const d = String(today.getDate()).padStart(2, '0');
      endStr = `${y}-${m}-${d}`;
    }
    const end = new Date(endStr + 'T00:00:00');

    let curr = new Date(start);
    while (curr <= end) {
      const dateStr = formatDate(curr.toISOString());
      let daySubsidy = 90; // 每天基础90元

      const dayMeals = mealExpensesByDate[dateStr] || [];
      for (const meal of dayMeals) {
        const desc = meal.description || '';
        if (desc.includes('早')) {
          daySubsidy -= 20;
        } else if (desc.includes('午') || desc.includes('中')) {
          daySubsidy -= 35;
        } else if (desc.includes('晚')) {
          daySubsidy -= 35;
        } else {
          daySubsidy -= 35;
        }
      }

      if (daySubsidy < 0) daySubsidy = 0;

      if (daySubsidy > 0) {
        subsidyRecords.push({
          date: new Date(curr),
          amount: daySubsidy
        });
      }
      curr.setDate(curr.getDate() + 1);
    }
  }

  // 将 template 的样式行缓存 (第三行)
  const templateRow = worksheet.getRow(3);
  const styles = [];
  for (let c = 1; c <= 8; c++) {
    styles[c] = templateRow.getCell(c).style;
  }

  let currentRowNum = 3;
  let index = 1;

  // 写入常规费用大类
  const mainCategories = Object.keys(groups).sort();
  for (let i = 0; i < mainCategories.length; i++) {
    const cat = mainCategories[i];
    const catExpenses = groups[cat];

    // 按日期排序
    catExpenses.sort((a, b) => new Date(a.expense_date || '').getTime() - new Date(b.expense_date || '').getTime());

    for (const exp of catExpenses) {
      const row = worksheet.getRow(currentRowNum);

      row.getCell(2).value = index++; // 序号
      row.getCell(3).value = exp.sub_category || ''; // 详细项目
      row.getCell(4).value = exp.expense_date ? new Date(exp.expense_date) : ''; // 日期

      const isReceipt = (exp.voucher_type || '').includes('收据');
      if (!isReceipt) {
        row.getCell(5).value = Number(exp.amount) || 0; // 发票
        row.getCell(6).value = ''; // 收据
      } else {
        row.getCell(5).value = ''; // 发票
        row.getCell(6).value = Number(exp.amount) || 0; // 收据
      }

      row.getCell(7).value = ''; // 伙食补贴
      row.getCell(8).value = exp.description || ''; // 备注

      // 应用样式
      for (let c = 1; c <= 8; c++) {
        row.getCell(c).style = styles[c];
      }

      currentRowNum++;
    }

    // 如果不是最后一个大类，或者后面还有伙食补贴，则加一个空行
    if (i < mainCategories.length - 1 || subsidyRecords.length > 0) {
      const row = worksheet.getRow(currentRowNum);
      for (let c = 1; c <= 8; c++) {
        row.getCell(c).style = styles[c];
      }
      currentRowNum++;
    }
  }

  // 写入伙食补贴
  if (subsidyRecords.length > 0) {
    subsidyRecords.sort((a, b) => a.date.getTime() - b.date.getTime());
    for (const record of subsidyRecords) {
      const row = worksheet.getRow(currentRowNum);

      row.getCell(2).value = index++; // 序号
      row.getCell(3).value = ''; // 详细项目 (无分类)
      row.getCell(4).value = record.date; // 日期
      row.getCell(5).value = ''; // 发票
      row.getCell(6).value = ''; // 收据
      row.getCell(7).value = record.amount; // 伙食补贴
      row.getCell(8).value = ''; // 备注

      for (let c = 1; c <= 8; c++) {
        row.getCell(c).style = styles[c];
      }

      currentRowNum++;
    }
  }

  // 下载文件改为生成 buffer 并存入 zip
  const outBuffer = await workbook.xlsx.writeBuffer();

  const zip = new JSZip();
  const baseName = project.name ? project.name.replace(/[/\\?%*:|"<>]/g, '_') : 'Project';
  zip.file(`${baseName}_报销数据.xlsx`, outBuffer);

  // 收集附件
  const attachmentsFolder = zip.folder('附件');
  if (attachmentsFolder) {
    for (const exp of expenses) {
      if (!exp.id) continue;
      try {
        // 尝试从 getExpenseFiles 获取附件
        const files = await expenseApi.getExpenseFiles(exp.id);
        if (files && files.length > 0) {
          for (const f of files) {
            if (f.file_path) {
              try {
                const fileData = await readFile(f.file_path);
                const safeName = f.file_name || f.file_path.split(/[/\\]/).pop() || `file_${f.id}`;
                attachmentsFolder.file(`记录${exp.id}_${safeName}`, fileData);
              } catch (e) {
                console.error(`无法读取文件 ${f.file_path}`, e);
              }
            }
          }
        } else if (exp.file_paths) {
          // 兼容之前的 JSON 数组
          let paths: string[] = [];
          try {
            paths = typeof exp.file_paths === 'string' ? JSON.parse(exp.file_paths) : exp.file_paths;
          } catch (e) {
            if (typeof exp.file_paths === 'string') {
              paths = [exp.file_paths];
            }
          }
          if (Array.isArray(paths)) {
            for (let i = 0; i < paths.length; i++) {
              const path = paths[i];
              try {
                const fileData = await readFile(path);
                const safeName = path.split(/[/\\]/).pop() || `file_${i}`;
                attachmentsFolder.file(`记录${exp.id}_${safeName}`, fileData);
              } catch (e) {
                console.error(`无法读取文件 ${path}`, e);
              }
            }
          }
        }
      } catch (err) {
        console.error(`获取费用 ${exp.id} 的附件失败`, err);
      }
    }
  }

  const zipBlob = await zip.generateAsync({ type: 'blob' });
  saveAs(zipBlob, `${baseName}_报销数据及附件.zip`);
}

// 导出日志数据
export async function exportLogsFile(projectId: number) {
  const project = await projectApi.getProject(projectId);
  const logs = await workLogApi.getWorkLogs(projectId);

  const templateBytes = await reportApi.getTemplateFile('22.xlsx');

  const templateWb = new ExcelJS.Workbook();
  await templateWb.xlsx.load(new Uint8Array(templateBytes).buffer);
  const templateWs = templateWb.worksheets[0];

  const layoutAndFormat = {
    name: templateWs.name,
    properties: templateWs.properties,
    pageSetup: templateWs.pageSetup,
    views: templateWs.views,
    columns: templateWs.columns.map(c => ({
      width: c.width,
      hidden: c.hidden,
      style: c.style
    })),
    merges: templateWs.model.merges || [],
    rows: [] as any[]
  };

  templateWs.eachRow({ includeEmpty: true }, (row, rowNumber) => {
    const rowInfo = {
      height: row.height,
      hidden: row.hidden,
      cells: [] as any[]
    };
    row.eachCell({ includeEmpty: true }, (cell, colNumber) => {
      rowInfo.cells.push({
        colNumber,
        value: cell.value,
        style: cell.style,
        type: cell.type
      });
    });
    layoutAndFormat.rows[rowNumber] = rowInfo;
  });

  const workbook = new ExcelJS.Workbook();
  const worksheet = workbook.addWorksheet(layoutAndFormat.name, {
    properties: layoutAndFormat.properties,
    pageSetup: layoutAndFormat.pageSetup,
    views: layoutAndFormat.views
  });

  worksheet.columns = layoutAndFormat.columns;

  for (let r = 1; r < layoutAndFormat.rows.length; r++) {
    const rowInfo = layoutAndFormat.rows[r];
    if (!rowInfo) continue;
    const newRow = worksheet.getRow(r);
    newRow.height = rowInfo.height;
    newRow.hidden = rowInfo.hidden;
    for (const cellInfo of rowInfo.cells) {
      const newCell = newRow.getCell(cellInfo.colNumber);
      newCell.value = cellInfo.value;
      newCell.style = cellInfo.style;
    }
  }

  for (const merge of layoutAndFormat.merges) {
    worksheet.mergeCells(merge);
  }

  // 设置基本信息
  worksheet.getCell('B2').value = `项目名称：${project.name}`;
  // B4 项目执行人
  // 从日志里找出唯一的作者
  const authors = Array.from(new Set(logs.map(l => l.author).filter(Boolean)));
  worksheet.getCell('B4').value = `项目执行人：${authors.join(', ')}`;
  worksheet.getCell('B5').value = `项目进程：${project.status || '进行中'}`;

  // 数据从第7行开始
  const templateRow = worksheet.getRow(7);
  const styles = [];
  for (let c = 1; c <= 5; c++) {
    styles[c] = templateRow.getCell(c).style;
  }

  let currentRowNum = 7;
  let index = 1;

  logs.sort((a, b) => new Date(a.log_date).getTime() - new Date(b.log_date).getTime());

  for (const log of logs) {
    const row = worksheet.getRow(currentRowNum);
    row.getCell(2).value = index++;
    row.getCell(3).value = log.log_date ? new Date(log.log_date) : '';
    row.getCell(4).value = log.content || '';
    row.getCell(5).value = log.next_day_plan ? `明日计划：${log.next_day_plan}` : '';

    for (let c = 1; c <= 5; c++) {
      row.getCell(c).style = styles[c];
    }

    currentRowNum++;
  }

  const outBuffer = await workbook.xlsx.writeBuffer();
  downloadBlob(new Blob([outBuffer]), `${project.name}_工作日志.xlsx`);
}

function downloadBlob(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}
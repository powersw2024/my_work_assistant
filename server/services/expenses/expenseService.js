// services/expenses/expenseService.js - 费用服务
import { ExpenseRecord } from '../../models/index.js';

const ExpenseService = {
  /**
   * 根据项目ID获取费用记录
   * @param {object} db - 数据库连接对象
   * @param {number} projectId - 项目ID
   * @returns {Promise} - 返回查询结果的Promise
   */
  getExpensesByProjectId: async (db, projectId) => {
    try {
      return await ExpenseRecord.findByProjectId(db, projectId);
    } catch (error) {
      console.error(`获取项目 ${projectId} 的费用记录失败:`, error);
      throw error;
    }
  },

  /**
   * 根据ID获取费用记录
   * @param {object} db - 数据库连接对象
   * @param {number} id - 记录ID
   * @returns {Promise} - 返回查询结果的Promise
   */
  getExpenseById: async (db, id) => {
    try {
      return await ExpenseRecord.findById(db, id);
    } catch (error) {
      console.error(`获取费用记录 ${id} 失败:`, error);
      throw error;
    }
  },

  /**
   * 创建费用记录
   * @param {object} db - 数据库连接对象
   * @param {object} expenseData - 费用数据
   * @returns {Promise} - 返回创建结果的Promise
   */
  createExpense: async (db, expenseData) => {
    try {
      // 验证必要字段
      if (!expenseData.project_id || !expenseData.amount || !expenseData.main_category_id ||
        !expenseData.sub_category_id ||
        !(expenseData.voucher_type_id || (expenseData.voucher_type_ids && Array.isArray(expenseData.voucher_type_ids) && expenseData.voucher_type_ids.length > 0))) {
        throw new Error('缺少必要的费用记录字段');
      }

      // 创建费用记录，expenseRecord模型内部会处理文件保存
      const expenseId = await ExpenseRecord.create(db, expenseData);

      return await ExpenseRecord.findById(db, expenseId);
    } catch (error) {
      console.error('创建费用记录失败:', error);
      throw error;
    }
  },

  /**
   * 更新费用记录
   * @param {object} db - 数据库连接对象
   * @param {number} id - 记录ID
   * @param {object} expenseData - 费用数据
   * @returns {Promise} - 返回更新结果的Promise
   */
  updateExpense: async (db, id, expenseData) => {
    try {
      // 检查费用记录是否存在
      const existingRecord = await ExpenseRecord.findById(db, id);
      if (!existingRecord) {
        throw new Error(`费用记录 ${id} 不存在`);
      }

      // 如果有提供任何必填字段，则进行验证；否则使用现有值
      const hasRequiredFields = expenseData.amount !== undefined ||
        expenseData.main_category_id !== undefined ||
        expenseData.sub_category_id !== undefined ||
        expenseData.voucher_type_id !== undefined ||
        expenseData.voucher_type_ids !== undefined;

      if (hasRequiredFields) {
        // 如果提供了任何必填字段，则必须全部提供
        if ((expenseData.amount === undefined || expenseData.amount === null || expenseData.amount <= 0) ||
          !expenseData.main_category_id ||
          !expenseData.sub_category_id ||
          !(expenseData.voucher_type_id || (expenseData.voucher_type_ids && Array.isArray(expenseData.voucher_type_ids) && expenseData.voucher_type_ids.length > 0))) {
          throw new Error('如果更新费用记录，请确保提供所有必要的费用记录字段');
        }
      }

      // 更新费用记录，expenseRecord模型内部会处理文件保存
      const changes = await ExpenseRecord.update(db, id, expenseData);
      if (changes === 0) {
        throw new Error(`费用记录 ${id} 不存在`);
      }

      return await ExpenseRecord.findById(db, id);
    } catch (error) {
      console.error(`更新费用记录 ${id} 失败:`, error);
      throw error;
    }
  },

  /**
   * 删除费用记录
   * @param {object} db - 数据库连接对象
   * @param {number} id - 记录ID
   * @returns {Promise} - 返回删除结果的Promise
   */
  deleteExpense: async (db, id) => {
    try {
      const changes = await ExpenseRecord.delete(db, id);
      if (changes === 0) {
        throw new Error(`费用记录 ${id} 不存在`);
      }
      return { message: '费用记录删除成功' };
    } catch (error) {
      console.error(`删除费用记录 ${id} 失败:`, error);
      throw error;
    }
  },

  /**
   * 导出项目报销数据为Excel并打包相关文件
   * @param {object} db - 数据库连接对象
   * @param {number} projectId - 项目ID
   * @returns {Buffer} - 返回ZIP文件的buffer（包含Excel和相关文件）
   */
  exportExpensesToExcel: async (db, projectId) => {
    try {
      // 获取项目信息
      const project = await db.get('SELECT name FROM projects WHERE id = ?', projectId);
      if (!project) {
        throw new Error(`项目 ${projectId} 不存在`);
      }

      // 获取项目的所有费用记录（包含文件信息）
      const expenses = await ExpenseRecord.findByProjectId(db, projectId);

      // 获取所有费用类别信息
      const categories = await db.all(`
        SELECT c.id, c.name as category_name, sc.id as sub_id, sc.name as sub_name
        FROM expense_categories c
        LEFT JOIN expense_categories sc ON c.id = sc.parent_id
        WHERE c.parent_id IS NULL
      `);

      // 获取所有凭证类型信息
      const voucherTypes = await db.all('SELECT id, name FROM voucher_types');

      // 将类别和凭证类型转换为映射表，方便查找
      const categoryMap = {};
      const subCategoryMap = {};
      categories.forEach(cat => {
        categoryMap[cat.id] = cat.category_name;
        if (cat.sub_id) {
          subCategoryMap[cat.sub_id] = cat.sub_name;
        }
      });

      const voucherTypeMap = {};
      voucherTypes.forEach(vt => {
        voucherTypeMap[vt.id] = vt.name;
      });

      // 引入xlsx和archiver库
      const XLSX = await import('xlsx');
      const { default: archiver } = await import('archiver');
      const fs = await import('fs');
      const path = await import('path');

      // 准备Excel数据
      const workbook = XLSX.utils.book_new();

      // 准备工作表数据
      const sheetData = [];

      // 添加表头 - 修改为用户要求的格式
      sheetData.push([
        '序号', '日期', '费用大类', '费用子类', '凭证类型', '发票', '收据', '伙食补贴', '附件数量', '备注（费用说明）'
      ]);

      // 收集所有需要打包的文件路径
      const filesToInclude = [];

      // 添加费用数据
      for (const [index, expense] of expenses.entries()) {
        // 获取关联的凭证类型
        const dbVoucherTypes = await db.all(`
          SELECT vt.name 
          FROM voucher_types vt
          JOIN expense_voucher_types evt ON vt.id = evt.voucher_type_id
          WHERE evt.expense_record_id = ?
        `, expense.id);

        const voucherTypeNames = dbVoucherTypes.map(vt => vt.name).join(', ');

        // 解析附件路径
        let attachments = 0;
        let filePaths = [];

        if (expense.files && expense.files.length > 0) {
          // 使用files数组（来自ExpenseFile模型）- 这些是绝对路径
          filePaths = expense.files;
          attachments = filePaths.length;

          // 添加文件到打包列表
          filePaths.forEach(filePath => {
            if (filePath && fs.existsSync(filePath)) {
              filesToInclude.push({
                sourcePath: filePath,
                archivePath: `attachments/${path.basename(filePath)}`
              });
            }
          });
        } else if (expense.file_paths) {
          // 兼容旧的file_paths字段
          try {
            const paths = JSON.parse(expense.file_paths);
            if (Array.isArray(paths)) {
              filePaths = paths;
              attachments = paths.length;

              // 添加文件到打包列表
              paths.forEach(filePath => {
                if (filePath) {
                  let absolutePath = filePath;
                  if (filePath.startsWith('..')) {
                    // 处理相对路径 ../uploads/...
                    absolutePath = path.resolve(process.cwd(), filePath);
                  } else if (!path.isAbsolute(filePath)) {
                    // 处理相对路径 uploads/...
                    absolutePath = path.resolve(process.cwd(), filePath);
                  }

                  if (fs.existsSync(absolutePath)) {
                    filesToInclude.push({
                      sourcePath: absolutePath,
                      archivePath: `attachments/${path.basename(filePath)}`
                    });
                  }
                }
              });
            }
          } catch (e) {
            console.error("解析附件路径失败:", e);
          }
        }

        // 获取费用大类和费用子类名称
        const mainCategoryName = (expense.main_category_id && categoryMap[expense.main_category_id]) ? categoryMap[expense.main_category_id] : '';
        const subCategoryName = (expense.sub_category_id && subCategoryMap[expense.sub_category_id]) ? subCategoryMap[expense.sub_category_id] : '';

        // 判断是否为伙食补贴（餐费 -> 餐费）
        const isMealSubsidy = (mainCategoryName === '餐费' && subCategoryName === '餐费');

        // 根据凭证类型确定发票金额和收据金额
        const hasInvoice = dbVoucherTypes && Array.isArray(dbVoucherTypes) ? dbVoucherTypes.some(vt => vt.name === '发票') : false;
        const hasReceipt = dbVoucherTypes && Array.isArray(dbVoucherTypes) ? dbVoucherTypes.some(vt => vt.name === '收据') : false;

        let invoiceAmount = 0;
        let receiptAmount = 0;
        let mealSubsidyAmount = 0;

        if (isMealSubsidy) {
          // 伙食补贴：在伙食补贴列显示金额，其他金额列为0
          mealSubsidyAmount = expense.amount || 0;
        } else {
          // 普通费用：根据凭证类型分配金额
          if (hasInvoice) {
            invoiceAmount = expense.amount || 0;
          } else if (hasReceipt) {
            receiptAmount = expense.amount || 0;
          } else {
            // 如果既没有发票也没有收据，放在收据金额列（因为用户要求收据金额是无发票的）
            receiptAmount = expense.amount || 0;
          }
        }

        // 对于伙食补贴，费用大类和费用子类应该为空
        const displayMainCategory = isMealSubsidy ? '' : mainCategoryName;
        const displaySubCategory = isMealSubsidy ? '' : subCategoryName;

        sheetData.push([
          index + 1,
          expense.date || '',
          displayMainCategory,
          displaySubCategory,
          voucherTypeNames || '',
          invoiceAmount,
          receiptAmount,
          mealSubsidyAmount,
          attachments,
          expense.description || ''  // 备注使用description字段
        ]);
      }

      // 创建工作表
      const worksheet = XLSX.utils.aoa_to_sheet(sheetData);

      // 设置列宽
      worksheet['!cols'] = [
        { wch: 8 },   // 序号
        { wch: 12 },  // 日期
        { wch: 12 },  // 费用大类
        { wch: 12 },  // 费用子类
        { wch: 15 },  // 凭证类型
        { wch: 15 },  // 发票金额（有发票的）
        { wch: 15 },  // 收据金额（无发票的）
        { wch: 12 },  // 伙食补贴
        { wch: 12 },  // 附件数量
        { wch: 25 }   // 备注（费用说明）
      ];

      // 添加工作表到工作簿
      XLSX.utils.book_append_sheet(workbook, worksheet, '报销明细');

      // 生成Excel buffer
      const excelBuffer = XLSX.write(workbook, { bookType: 'xlsx', type: 'buffer' });

      // 创建ZIP存档
      const zip = archiver('zip', {
        zlib: { level: 9 } // 最佳压缩
      });

      // 将Excel文件添加到ZIP
      zip.append(excelBuffer, { name: `Project_${projectId}_Expenses.xlsx` });

      // 将所有附件文件添加到ZIP
      for (const file of filesToInclude) {
        zip.file(file.sourcePath, { name: file.archivePath });
      }

      // 完成ZIP创建
      const zipBuffers = [];
      zip.on('data', (chunk) => zipBuffers.push(chunk));
      zip.on('end', () => { });

      await zip.finalize();

      return Buffer.concat(zipBuffers);
    } catch (error) {
      console.error(`导出费用记录失败:`, error);
      throw error;
    }
  }
};

export default ExpenseService;
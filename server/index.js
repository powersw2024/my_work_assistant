import express from 'express';
import cors from 'cors';
import path from 'path';
import multer from 'multer';
import fs from 'fs/promises';
import { fileURLToPath } from 'url';
import { initDatabase } from './db/init.js'; // 使用正确的数据库初始化
import { migrateVoucherTypes } from './db/migrate-voucher-types.js'; // 导入迁移脚本
import apiRoutes from './routes/index.js'; // 使用新的路由结构
import expenseRoutes from './routes/expenses.js'; // 单独引入费用路由
import categoryRoutes from './routes/categories.js'; // 单独引入分类路由

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// 获取用户数据目录（Electron环境或普通Node.js环境）
const getUserDataDir = () => {
  // 检查是否在Electron环境中
  if (typeof process !== 'undefined' && process.versions && process.versions.electron) {
    // Electron环境中，使用app.getPath('userData')
    // 但由于这是后端代码，我们需要通过环境变量获取
    if (process.env.ELECTRON_USER_DATA_DIR) {
      return process.env.ELECTRON_USER_DATA_DIR;
    }
  }
  
  // 默认使用项目根目录下的data文件夹
  return path.join(__dirname, '../data');
};

const app = express();
const PORT = process.env.PORT || 3000;

// 创建用户数据目录
const userDataDir = getUserDataDir();

// 中间件
app.use(cors());
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// 文件上传配置
const storage = multer.diskStorage({
  destination: async (req, file, cb) => {
    try {
      // 从请求体或查询参数中获取项目ID，然后查询项目名称
      const projectId = req.body.projectId || req.query.projectId || 
                       (req.body.expenseData ? (typeof req.body.expenseData === 'string' ? JSON.parse(req.body.expenseData) : req.body.expenseData).project_id : null);
      let projectName = 'default';
      
      if (projectId && req.db) {
        // 查询项目名称
        const project = await req.db.get('SELECT name FROM projects WHERE id = ?', projectId);
        if (project) {
          projectName = project.name.replace(/[<>:"/\\|?*]/g, '_'); // 替换非法字符
        }
      }
      
      const uploadDir = path.join(userDataDir, 'uploads', projectName);
      await fs.mkdir(uploadDir, { recursive: true });
      cb(null, uploadDir);
    } catch (err) {
      console.error('设置上传目录失败:', err);
      cb(err);
    }
  },
  filename: async (req, file, cb) => {
    try {
      // 解析请求体
      const ext = path.extname(file.originalname);
      const timestamp = Date.now();
      cb(null, `expense_${timestamp}${ext}`);
    } catch (err) {
      console.error('生成文件名失败:', err);
      const ext = path.extname(file.originalname);
      const timestamp = Date.now();
      cb(null, `expense_${timestamp}${ext}`);
    }
  }
});

const upload = multer({ storage });

// 将数据库实例附加到请求对象
let dbInstance = null;

// 检查环境变量是否要求包含测试数据
const includeTestData = process.env.INCLUDE_TEST_DATA === 'true';

// 使用用户数据目录中的数据库文件
const dbPath = path.join(userDataDir, 'database.sqlite');

// 确保用户数据目录存在，然后初始化数据库
fs.mkdir(userDataDir, { recursive: true })
  .then(() => {
    return initDatabase(dbPath, includeTestData);
  })
  .then(async db => {
    dbInstance = db;
    
    // 运行凭证类型迁移
    try {
      await migrateVoucherTypes(dbPath);
    } catch (migrationError) {
      console.error('凭证类型迁移失败:', migrationError);
    }
    
    // 启动服务器
    app.listen(PORT, 'localhost', () => {
      console.log(`🚀 服务器运行在 http://localhost:${PORT}`);
    });
  })
  .catch(err => {
    console.error('数据库初始化失败:', err);
    process.exit(1);
  });

// 自定义中间件，将数据库实例添加到请求对象
app.use((req, res, next) => {
  req.db = dbInstance;
  next();
});

// 为费用相关的路由添加文件上传中间件
app.use('/api/expenses', upload.array('files', 10), expenseRoutes);

// 为其他API路由使用通用路由
app.use('/api', apiRoutes);

// 上传文件服务 - 支持所有项目名称，并对特殊字符进行处理
app.use('/api/uploads', (req, res, next) => {
  try {
    // 解码路径参数以处理包含特殊字符的情况
    const decodedPath = decodeURIComponent(req.url);
    const uploadsDir = path.join(userDataDir, 'uploads');
    
    // 确保请求路径在安全范围内
    const requestedPath = path.join(uploadsDir, decodedPath);
    
    // 检查路径是否在允许的上传目录内（防止路径遍历攻击）
    if (requestedPath.indexOf(uploadsDir) !== 0) {
      return res.status(403).send('Forbidden');
    }
    
    // 使用安全的路径提供静态文件服务
    express.static(uploadsDir)(req, res, next);
  } catch (err) {
    // 如果解码失败，回退到原来的处理方式
    const uploadsDir = path.join(userDataDir, 'uploads');
    express.static(uploadsDir)(req, res, next);
  }
});

// 处理静态文件
app.use(express.static(path.join(__dirname, '../web')));

// 处理前端路由 - 对于非API请求，返回index.html
app.get(/^(?!\/api).*$/, (req, res) => {
  res.sendFile(path.join(__dirname, '../web/index.html'));
});
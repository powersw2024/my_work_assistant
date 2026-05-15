import { app, BrowserWindow, ipcMain } from 'electron';
import path from 'path';
import { fileURLToPath } from 'url';
import { spawn } from 'child_process';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// 获取应用根目录（生产环境和开发环境不同）
const getAppRootDir = () => {
  if (app.isPackaged) {
    // 生产环境：应用被打包，根目录是Resources/app的父级
    return path.join(process.resourcesPath, 'app');
  } else {
    // 开发环境：根目录是项目根目录
    return path.join(__dirname, '..');
  }
};

// 保持对窗口对象的全局引用，如果不这样做，当JavaScript垃圾回收时，
// 窗口将自动关闭
let mainWindow;
let serverProcess;

// 后端服务器端口
const SERVER_PORT = 3000;

function createWindow() {
  // 创建浏览器窗口
  mainWindow = new BrowserWindow({
    width: 1200,
    height: 800,
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      preload: path.join(__dirname, 'preload.js')
    }
  });

  const appRootDir = getAppRootDir();

  // 开发环境或生产环境加载不同的URL
  if (app.isPackaged) {
    // 生产环境：启动后端服务器并加载本地前端文件
    startBackendServer(appRootDir);
    // 等待服务器启动后再加载前端
    setTimeout(() => {
      mainWindow.loadFile(path.join(appRootDir, 'web/dist/index.html'));
    }, 3000); // 给服务器3秒启动时间
  } else {
    // 开发环境：加载Vite开发服务器
    mainWindow.loadURL('http://localhost:5173');
  }

  // 打开开发者工具（仅在开发环境中）
  if (!app.isPackaged) {
    mainWindow.webContents.openDevTools();
  }

  // 当窗口关闭时，取消引用窗口对象
  mainWindow.on('closed', () => {
    mainWindow = null;
  });
}

// 当Electron完成初始化时调用此方法
app.whenReady().then(() => {
  // 开发环境启动后端服务器已在createWindow中处理
  // 生产环境也在createWindow中处理
  createWindow();

  app.on('activate', () => {
    // 在macOS上，当点击dock图标并且没有其他窗口打开时，
    // 通常在应用程序中重新创建一个窗口。
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();
    }
  });
});

// 除了macOS外，当所有窗口关闭时退出程序
app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

// 启动后端服务器
function startBackendServer(appRootDir) {
  const serverScript = path.join(appRootDir, 'start-dev.js');
  serverProcess = spawn('node', [serverScript], {
    cwd: appRootDir,
    stdio: 'inherit',
    env: {
      ...process.env,
      PORT: SERVER_PORT.toString(),
      ELECTRON_USER_DATA_DIR: app.getPath('userData')
    }
  });

  serverProcess.on('error', (err) => {
    console.error('Failed to start backend server:', err);
  });

  serverProcess.on('close', (code) => {
    console.log(`Backend server exited with code ${code}`);
  });
}

// 应用退出时清理资源
app.on('will-quit', () => {
  if (serverProcess) {
    serverProcess.kill();
  }
});
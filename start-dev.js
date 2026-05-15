#!/usr/bin/env node

import { spawn } from 'child_process';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

console.log('🚀 Starting Project Management App in development mode...');

// 启动后端服务器
console.log('🔌 Starting backend server...');
const backend = spawn('node', ['server/index.js'], {
  cwd: __dirname,
  stdio: 'inherit'
});

backend.on('error', (err) => {
  console.error('❌ Failed to start backend:', err.message);
});

// 等待后端启动后再启动前端
setTimeout(() => {
  console.log('🌐 Starting frontend server...');
  const frontend = spawn('npx', ['vite', '--port', '5173'], {
    cwd: path.join(__dirname, 'web'),
    stdio: 'inherit'
  });

  frontend.on('error', (err) => {
    console.error('❌ Failed to start frontend:', err.message);
  });

  // 当主进程退出时，也结束子进程
  process.on('exit', () => {
    backend.kill();
    frontend.kill();
  });

  process.on('SIGINT', () => process.exit());
  process.on('SIGTERM', () => process.exit());
}, 1000); // 等待1秒确保后端先启动

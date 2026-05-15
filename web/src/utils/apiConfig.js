// utils/apiConfig.js - API配置
const isElectron = () => {
  // 检查是否在Electron环境中
  return window && window.process && window.process.type === 'renderer';
};

// 根据环境确定API基础URL
export const getApiBaseUrl = () => {
  if (isElectron()) {
    // Electron环境中，后端服务器运行在localhost:3000
    return 'http://localhost:3000';
  } else if (import.meta.env.MODE === 'development') {
    // 开发环境中，Vite会代理到后端
    return '';
  } else {
    // 生产环境（Web部署）
    return '';
  }
};

// 构建完整的API URL
export const buildApiUrl = (endpoint) => {
  const baseUrl = getApiBaseUrl();
  if (baseUrl) {
    return `${baseUrl}${endpoint.startsWith('/') ? endpoint : `/${endpoint}`}`;
  }
  return endpoint.startsWith('/') ? endpoint : `/${endpoint}`;
};
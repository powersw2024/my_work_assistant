// utils/apiConfig.ts - API配置

// 检查是否在 Tauri 环境中
const isTauri = (): boolean => {
  return window && '__TAURI__' in window;
};

// 根据环境确定 API 基础 URL
export const getApiBaseUrl = (): string => {
  if (isTauri()) {
    // Tauri 环境中，使用 Tauri API 调用后端
    return '';
  } else if (import.meta.env.MODE === 'development') {
    // 开发环境中，Vite 会代理到后端
    return '';
  } else {
    // 生产环境（Web 部署）
    return '';
  }
};

// 构建完整的 API URL
export const buildApiUrl = (endpoint: string): string => {
  const baseUrl = getApiBaseUrl();
  if (baseUrl) {
    return `${baseUrl}${endpoint.startsWith('/') ? endpoint : `/${endpoint}`}`;
  }
  return endpoint.startsWith('/') ? endpoint : `/${endpoint}`;
};

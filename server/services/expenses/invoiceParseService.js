/**
 * 发票解析服务
 * 提供发票图像解析功能（使用模拟实现，因为真实库不可用）
 */

const InvoiceParseService = {
  /**
   * 解析电子发票（模拟实现）
   * @param {string} imagePath - 图像路径
   * @returns {Promise<Object>} - 解析结果
   */
  parseInvoice: async (imagePath) => {
    console.log(`模拟解析电子发票: ${imagePath}`);
    
    // 注意：由于无法找到 'einvoice' 包，我们暂时使用模拟实现
    // 实际部署时应替换为真实的发票解析API或库
    
    // 模拟随机返回一些数据以演示功能
    return new Promise((resolve) => {
      setTimeout(() => {
        // 模拟识别到金额的情况
        const simulatedAmount = Math.floor(Math.random() * 100000) / 100; // 0到1000元之间的随机金额
        
        resolve({
          success: true,
          amount: simulatedAmount,
          invoiceCode: `CODE${Math.floor(Math.random() * 100000000)}`,
          invoiceNumber: `${Math.floor(Math.random() * 100000000)}`,
          date: new Date().toISOString().split('T')[0],
          errorMessage: null
        });
      }, 1000); // 模拟网络延迟
    });
  },
  
  /**
   * 识别发票金额
   * @param {string} imagePath - 图像路径
   * @returns {Promise<number|null>} - 识别到的金额
   */
  extractAmount: async (imagePath) => {
    try {
      const result = await InvoiceParseService.parseInvoice(imagePath);
      if (result.success && result.amount) {
        return parseFloat(result.amount);
      }
      return null;
    } catch (error) {
      console.error('提取发票金额时出错:', error);
      return null;
    }
  }
};

export default InvoiceParseService;
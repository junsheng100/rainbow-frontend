import { ElMessage, ElMessageBox } from 'element-plus'

// 错误去重机制
const errorHistory = new Set<string>()
const ERROR_DISPLAY_TIMEOUT = 3000 // 3秒内相同错误不重复显示

/**
 * 生成错误的唯一标识
 */
const generateErrorId = (error: any): string => {
  if (typeof error === 'string') {
    return error
  }

  // 尝试从错误对象中提取关键信息生成ID
  const message = error?.message || error?.response?.data?.message || 'unknown'
  const status = error?.response?.status || 'nostatus'
  const url = error?.config?.url || error?.response?.config?.url || 'nourl'

  return `${message}-${status}-${url.split('?')[0]}` // 去掉查询参数
}

/**
 * 检查错误是否已经显示过
 */
const isDuplicateError = (errorId: string): boolean => {
  if (errorHistory.has(errorId)) {
    return true
  }

  // 添加到历史记录
  errorHistory.add(errorId)

  // 设置定时器清除记录
  setTimeout(() => {
    errorHistory.delete(errorId)
  }, ERROR_DISPLAY_TIMEOUT)

  return false
}

/**
 * 全局错误消息处理函数
 * 统一处理各种来源的错误，确保显示用户友好的消息
 * @param error 任何类型的错误
 * @returns 用户友好的错误消息
 */
export const normalizeErrorMessage = (error: any): string => {
  // 如果是字符串，直接处理
  if (typeof error === 'string') {
    // 处理各种 "Request failed with status" 变体
    let statusCodeMatch = error.match(/Request failed with status code (\d+)/)
    if (!statusCodeMatch) {
      statusCodeMatch = error.match(/Request failed with status (\d+)/)
    }
    if (!statusCodeMatch) {
      statusCodeMatch = error.match(/status code (\d+)/)
    }
    if (!statusCodeMatch) {
      statusCodeMatch = error.match(/status (\d+)/)
    }

    if (statusCodeMatch) {
      const statusCode = parseInt(statusCodeMatch[1])
      const statusMessages: Record<number, string> = {
        400: '请求参数错误',
        401: '身份验证失败，请重新登录',
        403: '没有权限访问此资源',
        404: '请求的资源不存在',
        500: '服务器内部错误',
        502: '网关错误',
        503: '服务暂时不可用'
      }

      return statusMessages[statusCode] || (statusCode >= 500 ? `服务器错误 (${statusCode})` : `客户端错误 (${statusCode})`)
    }

    // 处理其他常见错误消息
    if (error.toLowerCase().includes('request failed')) {
      return '请求失败，请稍后重试'
    }
    if (error.includes('Network Error')) {
      return '网络连接失败，请检查网络状态'
    }
    if (error.includes('timeout')) {
      return '请求超时，请稍后重试'
    }

    return error
  }

  // 使用现有的 extractErrorMessage 函数
  return extractErrorMessage(error)
}

/**
 * 从错误对象中提取错误消息
 * @param error 错误对象
 * @returns 错误消息字符串
 */
export const extractErrorMessage = (error: any): string => {
  // 处理服务端返回的错误格式
  if (error?.response?.data) {
    const responseData = error.response.data;
    // 优先使用 data 字段中的错误信息
    if (typeof responseData.data === 'string' && responseData.data.trim()) {
      return responseData.data;
    }
    // 其次使用 msg 字段
    if (typeof responseData.msg === 'string' && responseData.msg.trim()) {
      return responseData.msg;
    }
    // 再次使用 message 字段
    if (typeof responseData.message === 'string' && responseData.message.trim()) {
      return responseData.message;
    }
  }

  // 处理网络错误
  if (error?.message) {
    if (error.message.includes('Network Error')) {
      return '网络连接失败，请检查网络';
    }
    if (error.message.includes('timeout')) {
      return '请求超时，请稍后重试';
    }
    }

  // 默认错误消息
  return '操作失败';
}

/**
 * 显示错误消息（带去重）
 * @param error 任何类型的错误
 * @param skipDuplicateCheck 是否跳过重复检查
 * @returns 是否显示了消息
 */
export const showErrorMessage = (error: any, skipDuplicateCheck = false): boolean => {
  const errorMessage = extractErrorMessage(error);

  // 如果不跳过重复检查，则检查是否是重复错误
  if (!skipDuplicateCheck) {
    const errorId = generateErrorId(error);
    if (isDuplicateError(errorId)) {
      return false;
    }
  }

  ElMessage.error(errorMessage);
  return true;
}

/**
 * 显示错误消息（向后兼容）
 * @param error 错误对象或字符串
 * @param title 可选的标题
 */
export const showError = (error: any, title?: string) => {
  const message = normalizeErrorMessage(error)

  if (title) {
    ElMessageBox.alert(message, title, {
      type: 'error',
      confirmButtonText: '确定'
    })
  } else {
    // 使用去重的错误显示
    showErrorMessage(error)
  }
}

/**
 * 显示成功消息
 * @param message 成功消息
 */
export const showSuccess = (message: string) => {
  ElMessage.success(message)
}

/**
 * 显示警告消息
 * @param message 警告消息
 */
export const showWarning = (message: string) => {
  ElMessage.warning(message)
}

/**
 * 显示信息消息
 * @param message 信息消息
 */
export const showInfo = (message: string) => {
  ElMessage.info(message)
}

/**
 * 异步操作的错误处理包装器
 * @param asyncFn 异步函数
 * @param errorTitle 错误标题
 * @param successMessage 成功消息
 * @returns 包装后的异步函数
 */
export const withErrorHandling = <T extends any[], R>(
  asyncFn: (...args: T) => Promise<R>,
  successMessage?: string
) => {
  return async (...args: T): Promise<R | undefined> => {
    try {
      const result = await asyncFn(...args)

      if (successMessage) {
        showSuccess(successMessage)
      }

      return result
    } catch (error) {
      // console.error('操作失败:', error)
      showErrorMessage(error, true)
      return undefined
    }
  }
}

/**
 * 表单提交的错误处理
 * @param submitFn 提交函数
 * @param successMessage 成功消息
 * @param errorTitle 错误标题
 */
export const handleFormSubmit = async <T>(
  submitFn: () => Promise<T>,
  successMessage: string = '操作成功'
): Promise<T | undefined> => {
  try {
    const result = await submitFn()
    showSuccess(successMessage)
    return result
  } catch (error) {
    // console.error('表单提交失败:', error)
    showErrorMessage(error, true)
    return undefined
  }
}

/**
 * 确认操作的错误处理
 * @param confirmMessage 确认消息
 * @param action 要执行的操作
 * @param successMessage 成功消息
 * @param errorTitle 错误标题
 */
export const handleConfirmAction = async (
  confirmMessage: string,
  action: () => Promise<any>,
  successMessage: string = '操作成功'
): Promise<boolean> => {
  try {
    await ElMessageBox.confirm(confirmMessage, '确认操作', {
      type: 'warning',
      confirmButtonText: '确定',
      cancelButtonText: '取消'
    })

    await action()
    showSuccess(successMessage)
    return true
  } catch (error) {
    if (error === 'cancel') {
      // 用户取消操作
      return false
    }

    // console.error('确认操作失败:', error)
    showErrorMessage(error, true)
    return false
  }
}

/**
 * 统一的日志记录函数
 */
const logError = (error: any, context?: string) => {
  // 开发环境才输出详细日志
  if (import.meta.env.DEV) {
    console.group(`错误日志${context ? ` - ${context}` : ''}`)
    console.error('错误详情:', error)
    if (error?.response) {
      console.error('响应数据:', error.response)
    }
    if (error?.config) {
      console.error('请求配置:', error.config)
    }
    console.groupEnd()
  }
}

/**
 * 统一的错误处理函数
 * @param error 错误对象
 * @param context 错误上下文
 * @param skipDuplicateCheck 是否跳过重复检查
 */
export const handleError = (error: any, operation: string) => {
  showErrorMessage(error);
  logError(error, operation);
};

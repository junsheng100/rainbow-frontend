/**
 * 查询参数接口
 */
export interface QueryParams {
  title?: string;
  stage?: number;
  startTime?: string;
  endTime?: string;
  pageNum: number;
  pageSize: number;
}

/**
 * 反馈数据接口
 */
export interface FeedbackData {
  id: string;
  title: string;
  content: string;
  stage: number;
  reply?: string;
  createTime: string;
  replyTime?: string;
  createBy?: string;
  replyBy?: string;
}

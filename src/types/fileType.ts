// 文件类型实体
export interface FileType {
  id: number;
  typeName: string;          // 类型名称
  extension: string;     // 文件扩展名
  mimeType: string;      // MIME 类型
  refuse?: number;
  approve?: number;
  description?: string;  // 描述
  icon?: string;         // 图标
  logo?: string;         // 图标
  status: number;        // 状态：0-禁用 1-启用
}

// 查询参数
export interface FileTypeQuery {
  typeName?: string;
  mimeType?:string;
  extension?: string;
  refuse?: number;
  approve?: number;
  status?: number;
  pageNum: number;
  pageSize: number;
}

// 分页响应
export interface FileTypePageResult {
  total: number;
  list: FileType[];
}

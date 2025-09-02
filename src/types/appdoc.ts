/**
 * 接口目录类型定义
 */
export interface AppCategory {
  id?: string;
  className: string;
  description?: string;
  orderNum?: number;
  requestUrl: string;
  simpleName: string;
  status?: string;
  disabled?: number;
  fcd?: string;
  fcu?: string;
  lcd?: string;
  lcu?: string;
}

/**
 * 接口方法类型定义
 */
export interface AppInterface {
  id?: string;
  categoryId: string;
  methodName: string;
  requestMethod?: string;
  requestUrl?: string;
  description?: string;
  orderNum?: number;
  status?: string;
  disabled?: number;
  consumes?: string;
  produces?: string;
  headers?: string;
  fcd?: string;
  fcu?: string;
  lcd?: string;
  lcu?: string;
}

// 接口数据结构
export interface MenuInterface {
  requestUrl: string;
  interfaceId: string;
  description: string;
  interfaceModelList: InterfaceModel[];
}

export interface InterfaceModel {
  requestUrl: string;
  id: string;
  requestMethod: string;
  description: string;
}

/**
 * 分页查询参数
 */
export interface PageQuery {
  pageNum: number;
  pageSize: number;
  [key: string]: any;
}

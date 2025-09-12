import request from '@/utils/request.ts';
import type {BaseVo} from "@/types/common.ts";

export interface MenuItem {
  menuId?: number;
  parentId?: number | null;
  menuName: string;
  parentName?: string; // 用于显示完整的父级菜单路径
  icon?: string;
  path: string;
  component: string;
  query?: string;
  requestUrl?: string;
  requestMethod?: string;
  interfaceId?: string;
  redirect?: string;
  visible?: string;//0显示 1隐藏
  isFrame?: string; //是否为外链
  isCache?: string; //是否缓存
  routeName: string;
  orderNum: number;
  menuType: 'C' | 'M' | 'F';  // 菜单类型：目录、菜单、按钮
  perms?: string;  // 权限标识
  disabled: string;
  className?:string;
  methodName?:string;
  children?: MenuItem[];
}

export interface MenuQuery {
  menuName?: string;
  disabled?: string;
}



// 获取菜单树形列表
export function getMenuList(params?: MenuQuery) {
  const vo: BaseVo<MenuItem> = {
    data: {
      menuName: params?.menuName,
      disabled: params?.disabled
    }
  }
  return request.post<MenuItem[]>( '/menu/tree/view',  vo);
}

// 获取菜单类型
export function getMenuType(menuType: string) {
  return request.get<MenuItem[]>( `/menu/tree/type/${menuType}` );
}
// 获取菜单类型
export function getChildList(menuId: number) {
  return request.get<MenuItem[]>( `/menu/child/${menuId}` );
}
// 获取单个菜单详情
export function getMenuDetail(id: number) {
  return request.get<MenuItem>( `/menu/${id}` );
}

// 创建菜单
export function createMenu(data: MenuItem) {
  return request.post<MenuItem>(  '/menu', data  );
}

// 更新菜单
export function updateMenu(data: MenuItem) {
  return request.post<MenuItem>(  '/menu', data  );
}

// 删除菜单
export function deleteMenu(id: number) {
  return request.delete<boolean>(  `/menu/${id}`);
}

// 获取菜单选择器数据（不包含按钮）
export function getMenuSelectList() {
  const vo: BaseVo<MenuItem> = {
    data: {
    }
  }
  return request.post<MenuItem[]>( '/menu/list',vo);
}
// 获取菜单选择器数据
export function getTreeList() {
  return request.get<MenuItem[]>( '/menu/tree/list');
}

// 获取菜单详情
export function getMenuInfo(menuId: number) {
  return request.get<MenuItem>(`/menu/${menuId}`);
}

import request from '@/utils/request'

export interface RouteItem {
  id: number;          
  parentId: number;    
  name: string;        
  path: string;        
  hidden: boolean;     
  component: string;   
  alwaysShow?: boolean; 
  meta: {
    title: string;     
    icon?: string;      
    noCache?: boolean;  
    link?: string;      
  };
  orderNum: number;    
  children?: RouteItem[]; 
}

interface RouterResponse {
  code: number;
  msg: string;
  data: RouteItem[];
}

export const getRouters = () => {
  return request.get<RouterResponse>('/auth/routers');
};

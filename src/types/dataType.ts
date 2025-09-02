export interface DataType {
  id?: number | string
  fcd?: string
  fcu?: string
  lcd?: string
  lcu?: string
  status?: string
  columnType: string
  dataDescribe: string
  dataRange: string
  dataType: string
  dbName: string
  javaType: string
}

export interface DataTypeQuery {
  pageNum: number
  pageSize: number
  dbName?: string
  dataType?: string
  columnType?: string
  status?: string
}


export interface Enums {
  code?: string
  message: string
}

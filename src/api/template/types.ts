

export interface TemplateEntity  {
  id?: string
  tableName: string
  entityName: string
  dbType:  string
  idType: string
  packageName: string
  entityComment: string
  author: string
  dbCatalog: string
  dbSchema: string
  orderNum: number
  status: string
  fcd?: Date
}

export interface TemplateConfig {
  id: string
  name: string
  suffix: string
  isEntity: boolean
  content: string
  description: string
  orderNum: number
  status?: string
  fcd?: Date
  fcu?: string
  lcd?: Date
  lcu?: string
}

export interface TemplateData {
  id?: string
  fileName: string
  packageName: string
  entityId: string
  configId: string
  description: string
  srcContent: string
  content: string
  status: string
  fcd?: Date
  fcu?: string
  lcd?: Date
  lcu?: string
}

export interface TemplateField {
  id?: string
  entityId: string
  fieldName: string
  fieldType: string
  fieldLength: number
  fieldScale: number
  fieldComment: string
  fieldFkFieldComment: string
  isPk: boolean
  isAuto: boolean
  isNull: boolean
  isRel: boolean
  isUnique: boolean
  orderNum: number
  relEntity: string
  relField: string
  relType: string
  columnType: string
  status: string
  fcd?: Date
  fcu?: string
  lcd?: Date
  lcu?: string
}

export interface TemplateQueryParams {
  pageNum: number
  pageSize: number
  name?: string
}

export interface PageResponse<T> {
  content: T[]
  total: number
  pageNum: number
  pageSize: number
}

export interface Enums {
  code: string
  message: string
}

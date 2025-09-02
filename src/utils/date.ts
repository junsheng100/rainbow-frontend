/**
 * 格式化日期为指定格式
 * @param date Date对象或日期字符串
 * @param format 格式字符串，默认为 'yyyy-MM-dd HH:mm:ss'
 * @returns 格式化后的日期字符串
 */
export function formatDate(date: Date | string, format: string = 'yyyy-MM-dd HH:mm:ss'): string {
  const d = typeof date === 'string' ? new Date(date) : date

  const year = d.getFullYear()
  const month = d.getMonth() + 1
  const day = d.getDate()
  const hours = d.getHours()
  const minutes = d.getMinutes()
  const seconds = d.getSeconds()

  const formatMap: { [key: string]: number } = {
    'yyyy': year,
    'MM': month,
    'dd': day,
    'HH': hours,
    'mm': minutes,
    'ss': seconds
  }

  let result = format
  Object.entries(formatMap).forEach(([key, value]) => {
    result = result.replace(key, value.toString().padStart(2, '0'))
  })

  return result
}

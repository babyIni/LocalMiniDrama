import request from '@/utils/request'

export const logsAPI = {
  /** 查询日志列表 */
  list(params) {
    return request.get('/logs', { params })
  },
  /** 日志统计 */
  stats() {
    return request.get('/logs/stats')
  },
  /** 清理旧日志 */
  clean(days = 30) {
    return request.delete('/logs', { params: { days } })
  },
}

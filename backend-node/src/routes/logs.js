const express = require('express');
const response = require('../response');
const logService = require('../services/logService');

function logsRoutes(db, log) {
  const router = express.Router();

  /**
   * GET /api/v1/logs
   * 查询日志列表（分页）
   * Query params: log_type, level, entity_type, keyword, start_date, end_date, page, page_size
   */
  router.get('/', (req, res) => {
    try {
      const result = logService.queryLogs(db, req.query || {});
      // 为前端展示统一字段：operation（操作日志）或 method+path（API日志）
      const items = result.items.map((row) => ({
        id: row.id,
        log_type: row.log_type,
        level: row.level,
        operation: row.user_operation,
        entity_type: row.entity_type,
        entity_id: row.entity_id,
        entity_name: row.entity_name,
        method: row.method,
        path: row.path,
        status_code: row.status_code,
        duration_ms: row.duration_ms,
        error_message: row.error_message,
        ip: row.ip,
        model_name: row.model_name,
        provider_name: row.provider_name,
        request_summary: row.request_summary,
        tokens_used: row.tokens_used,
        request_detail: row.request_detail,
        response_detail: row.response_detail,
        created_at: row.created_at,
      }));
      response.successWithPagination(res, items, result.total, result.page, result.page_size);
    } catch (err) {
      log.error('GET /logs', { error: err.message });
      response.internalError(res, err.message);
    }
  });

  /**
   * GET /api/v1/logs/stats
   * 日志统计概览
   */
  router.get('/stats', (req, res) => {
    try {
      const stats = logService.getLogStats(db);
      response.success(res, stats);
    } catch (err) {
      log.error('GET /logs/stats', { error: err.message });
      response.internalError(res, err.message);
    }
  });

  /**
   * DELETE /api/v1/logs
   * 清理日志（保留最近 N 天）
   * Query param: days（默认 30）
   */
  router.delete('/', (req, res) => {
    try {
      const days = parseInt(req.query.days, 10) || 30;
      logService.cleanOldLogs(db, log, days);
      response.success(res, { message: `已清理 ${days} 天前的日志` });
    } catch (err) {
      log.error('DELETE /logs', { error: err.message });
      response.internalError(res, err.message);
    }
  });

  return router;
}

module.exports = logsRoutes;

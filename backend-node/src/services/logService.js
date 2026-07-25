/**
 * 日志管理服务
 * 提供写入与查询操作日志、API 请求日志和 AI 模型调用日志的统一接口，
 * 数据存储在 SQLite api_logs 表中。
 */

/**
 * 写入一条操作日志。
 */
function logOperation(database, logger, params) {
  const { operation, entity_type, entity_id, entity_name, level, error_message, ip } = params;
  const now = new Date().toISOString();
  const lvl = (level || 'info').toLowerCase();
  try {
    database.prepare(`
      INSERT INTO api_logs (log_type, level, user_operation, entity_type, entity_id, entity_name, error_message, ip, created_at)
      VALUES ('operation', ?, ?, ?, ?, ?, ?, ?, ?)
    `).run(lvl, operation || '', entity_type || '', entity_id != null ? String(entity_id) : '', entity_name || '', error_message || '', ip || '', now);
  } catch (err) {
    logger.warn('logService.logOperation failed:', err.message);
  }
}

/**
 * 写入一条 API 请求日志（带请求/响应详情）。
 * @param {object} database
 * @param {object} logger
 * @param {object} params
 * @param {string} params.method
 * @param {string} params.path
 * @param {string} [params.query] - URL 查询参数
 * @param {number} params.status_code
 * @param {number} params.duration_ms
 * @param {string} [params.level]
 * @param {string} [params.error_message]
 * @param {string} [params.ip]
 * @param {string} [params.request_body] - 请求体摘要（截断）
 * @param {string} [params.response_body] - 响应体摘要（截断）
 */
function logApiRequest(database, logger, params) {
  const { method, path, query, status_code, duration_ms, level, error_message, ip, request_body, response_body } = params;
  const now = new Date().toISOString();
  const lvl = (level || 'info').toLowerCase();
  let requestDetail = null;
  let responseDetail = null;
  try {
    requestDetail = JSON.stringify({ method, path, query: query || null, body: request_body || null });
    responseDetail = JSON.stringify({ status_code, body: response_body || null });
  } catch (_) {}
  try {
    database.prepare(`
      INSERT INTO api_logs (log_type, level, method, path, status_code, duration_ms, error_message, ip, request_detail, response_detail, created_at)
      VALUES ('api_request', ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).run(lvl, method || '', path || '', status_code || 0, duration_ms || 0, error_message || '', ip || '', requestDetail, responseDetail, now);
  } catch (err) {
    logger.warn('logService.logApiRequest failed:', err.message);
  }
}

/**
 * 写入一条 AI 模型调用日志（带请求/响应详情）。
 */
function logAiModelCall(database, logger, params) {
  const { service_type, model, provider, prompt_summary, status, error_message, duration_ms, tokens_used, entity_type, entity_id, ip, request_detail, response_detail } = params;
  const now = new Date().toISOString();
  const level = status === 'failed' ? 'error' : 'info';
  const summary = (prompt_summary || '').slice(0, 120);
  let reqDetailJson = null;
  let respDetailJson = null;
  try {
    if (request_detail) reqDetailJson = typeof request_detail === 'string' ? request_detail : JSON.stringify(request_detail);
    if (response_detail) respDetailJson = typeof response_detail === 'string' ? response_detail : JSON.stringify(response_detail);
  } catch (_) {}
  try {
    database.prepare(`
      INSERT INTO api_logs (log_type, level, user_operation, entity_type, entity_id, entity_name, model_name, provider_name, request_summary, tokens_used, error_message, ip, request_detail, response_detail, created_at)
      VALUES ('ai_model_call', ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).run(
      level,
      `AI ${service_type || 'unknown'}: ${status === 'failed' ? '失败' : '完成'}`,
      entity_type || '',
      entity_id != null ? String(entity_id) : '',
      model || '',
      model || '',
      provider || '',
      summary,
      tokens_used || 0,
      error_message || '',
      ip || '',
      reqDetailJson,
      respDetailJson,
      now
    );
    const elapsed = duration_ms != null ? ` ${duration_ms}ms` : '';
    const errSuffix = error_message ? ` ERROR: ${error_message}` : '';
    const tokenInfo = tokens_used ? ` [${tokens_used} tokens]` : '';
    logger.info(`[AI Call] ${service_type} | ${model} | ${provider || '?'}${elapsed}${tokenInfo}${errSuffix}`);
  } catch (err) {
    logger.warn('logService.logAiModelCall failed:', err.message);
  }
}

function parseIp(req) {
  const forwarded = req.headers['x-forwarded-for'];
  if (forwarded) {
    return forwarded.split(',')[0].trim();
  }
  return req.socket?.remoteAddress || req.connection?.remoteAddress || '';
}

/**
 * 查询日志列表（分页）。
 */
function queryLogs(database, filters = {}) {
  const { log_type, level, entity_type, keyword, start_date, end_date } = filters;
  const page = Math.max(1, parseInt(filters.page, 10) || 1);
  const page_size = Math.min(500, Math.max(1, parseInt(filters.page_size, 10) || 50));
  const offset = (page - 1) * page_size;

  const conditions = [];
  const params = [];

  if (log_type) {
    conditions.push('log_type = ?');
    params.push(log_type);
  }
  if (level) {
    conditions.push('level = ?');
    params.push(level);
  }
  if (entity_type && log_type === 'operation') {
    conditions.push('entity_type = ?');
    params.push(entity_type);
  }
  if (keyword) {
    conditions.push('(user_operation LIKE ? OR path LIKE ? OR error_message LIKE ? OR model_name LIKE ? OR request_summary LIKE ?)');
    const kw = `%${keyword}%`;
    params.push(kw, kw, kw, kw, kw);
  }
  if (start_date) {
    conditions.push('created_at >= ?');
    params.push(start_date);
  }
  if (end_date) {
    conditions.push('created_at <= ?');
    params.push(end_date);
  }

  const where = conditions.length ? 'WHERE ' + conditions.join(' AND ') : '';

  try {
    const totalRow = database.prepare(`SELECT COUNT(*) AS cnt FROM api_logs ${where}`).get(...params);
    const total = totalRow?.cnt || 0;

    const items = database.prepare(
      `SELECT * FROM api_logs ${where} ORDER BY id DESC LIMIT ? OFFSET ?`
    ).all(...params, page_size, offset);

    return { items, total, page, page_size };
  } catch (err) {
    return { items: [], total: 0, page, page_size };
  }
}

function getLogStats(database) {
  try {
    const total = database.prepare('SELECT COUNT(*) AS cnt FROM api_logs').get()?.cnt || 0;
    const operationCount = database.prepare("SELECT COUNT(*) AS cnt FROM api_logs WHERE log_type='operation'").get()?.cnt || 0;
    const apiRequestCount = database.prepare("SELECT COUNT(*) AS cnt FROM api_logs WHERE log_type='api_request'").get()?.cnt || 0;
    const aiCallCount = database.prepare("SELECT COUNT(*) AS cnt FROM api_logs WHERE log_type='ai_model_call'").get()?.cnt || 0;
    const errorCount = database.prepare("SELECT COUNT(*) AS cnt FROM api_logs WHERE level='error'").get()?.cnt || 0;
    const warnCount = database.prepare("SELECT COUNT(*) AS cnt FROM api_logs WHERE level='warn'").get()?.cnt || 0;
    const latest = database.prepare('SELECT MAX(created_at) AS t FROM api_logs').get()?.t || null;

    return { total, operation_count: operationCount, api_request_count: apiRequestCount, ai_model_call_count: aiCallCount, error_count: errorCount, warn_count: warnCount, latest_at: latest };
  } catch (_) {
    return { total: 0, operation_count: 0, api_request_count: 0, ai_model_call_count: 0, error_count: 0, warn_count: 0, latest_at: null };
  }
}

function cleanOldLogs(database, logger, days = 30) {
  try {
    const cutoff = new Date(Date.now() - days * 24 * 60 * 60 * 1000).toISOString();
    const result = database.prepare('DELETE FROM api_logs WHERE created_at < ?').run(cutoff);
    if (result.changes > 0) {
      logger.info(`logService: cleaned ${result.changes} old log entries (before ${cutoff})`);
    }
  } catch (err) {
    logger.warn('logService.cleanOldLogs failed:', err.message);
  }
}

module.exports = { logOperation, logApiRequest, logAiModelCall, parseIp, queryLogs, getLogStats, cleanOldLogs };

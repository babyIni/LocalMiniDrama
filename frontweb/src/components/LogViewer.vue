<template>
  <div class="log-viewer">
    <!-- 工具栏 -->
    <div class="log-toolbar">
      <div class="toolbar-left">
        <el-select v-model="filters.log_type" placeholder="日志类型" clearable style="width:140px" @change="onSearch">
          <el-option label="全部" value="" />
          <el-option label="操作日志" value="operation" />
          <el-option label="AI 模型调用" value="ai_model_call" />
          <el-option label="API 请求" value="api_request" />
        </el-select>
        <el-select v-model="filters.level" placeholder="级别" clearable style="width:100px" @change="onSearch">
          <el-option label="全部" value="" />
          <el-option label="信息" value="info" />
          <el-option label="警告" value="warn" />
          <el-option label="错误" value="error" />
        </el-select>
        <el-select v-if="filters.log_type === 'operation'" v-model="filters.entity_type" placeholder="实体类型" clearable style="width:120px" @change="onSearch">
          <el-option label="全部" value="" />
          <el-option label="剧集" value="drama" />
          <el-option label="角色" value="character" />
          <el-option label="场景" value="scene" />
          <el-option label="道具" value="prop" />
          <el-option label="分镜" value="storyboard" />
          <el-option label="AI配置" value="ai_config" />
          <el-option label="视频" value="video" />
        </el-select>
        <el-input v-model="filters.keyword" placeholder="搜索关键字" clearable style="width:180px" @clear="onSearch" @keyup.enter="onSearch">
          <template #prefix><el-icon><Search /></el-icon></template>
        </el-input>
        <el-date-picker
          v-model="dateRange"
          type="daterange"
          range-separator="至"
          start-placeholder="开始日期"
          end-placeholder="结束日期"
          value-format="YYYY-MM-DD"
          style="width:240px"
          @change="onDateChange"
        />
        <el-button type="primary" @click="onSearch"><el-icon><Search /></el-icon> 查询</el-button>
        <el-button @click="onReset">重置</el-button>
      </div>
      <div class="toolbar-right">
        <el-button :loading="refreshing" @click="loadData"><el-icon><Refresh /></el-icon> 刷新</el-button>
        <el-popconfirm title="确定清理 30 天前的旧日志？" @confirm="onClean">
          <template #reference>
            <el-button type="danger" plain><el-icon><Delete /></el-icon> 清理旧日志</el-button>
          </template>
        </el-popconfirm>
      </div>
    </div>

    <!-- 统计卡片 -->
    <div class="log-stats">
      <div class="stat-item">
        <span class="stat-value">{{ stats.total }}</span>
        <span class="stat-label">总计</span>
      </div>
      <div class="stat-item stat-operation">
        <span class="stat-value">{{ stats.operation_count }}</span>
        <span class="stat-label">操作日志</span>
      </div>
      <div class="stat-item stat-api">
        <span class="stat-value">{{ stats.api_request_count }}</span>
        <span class="stat-label">API 请求</span>
      </div>
      <div class="stat-item stat-ai">
        <span class="stat-value">{{ stats.ai_model_call_count || 0 }}</span>
        <span class="stat-label">模型调用</span>
      </div>
      <div class="stat-item stat-warn">
        <span class="stat-value">{{ stats.warn_count }}</span>
        <span class="stat-label">警告</span>
      </div>
      <div class="stat-item stat-error">
        <span class="stat-value">{{ stats.error_count }}</span>
        <span class="stat-label">错误</span>
      </div>
      <div class="stat-item" style="flex:1;text-align:right;font-size:12px;color:#888">
        最新：{{ stats.latest_at ? new Date(stats.latest_at).toLocaleString() : '—' }}
      </div>
    </div>

    <!-- 日志表格 -->
    <el-table
      v-loading="loading"
      :data="items"
      stripe
      style="width:100%"
      :max-height="tableMaxHeight"
      @sort-change="onSortChange"
      @row-click="onRowClick"
      :highlight-current-row="true"
    >
      <el-table-column prop="created_at" label="时间" width="170" sortable="custom">
        <template #default="{ row }">
          <span class="log-time">{{ formatTime(row.created_at) }}</span>
        </template>
      </el-table-column>
      <el-table-column prop="log_type" label="类型" width="100">
        <template #default="{ row }">
          <el-tag v-if="row.log_type === 'operation'" type="primary" size="small">操作</el-tag>
          <el-tag v-else-if="row.log_type === 'ai_model_call'" type="warning" size="small">模型</el-tag>
          <el-tag v-else type="success" size="small">API</el-tag>
        </template>
      </el-table-column>
      <el-table-column prop="level" label="级别" width="70">
        <template #default="{ row }">
          <el-tag v-if="row.level === 'error'" type="danger" size="small">错误</el-tag>
          <el-tag v-else-if="row.level === 'warn'" type="warning" size="small">警告</el-tag>
          <el-tag v-else type="info" size="small" effect="plain">信息</el-tag>
        </template>
      </el-table-column>
      <el-table-column label="内容" min-width="320">
        <template #default="{ row }">
          <!-- AI 模型调用日志 -->
          <template v-if="row.log_type === 'ai_model_call'">
            <div class="log-content">
              <span class="log-model-tag">{{ row.model_name || row.entity_name }}</span>
              <span v-if="row.provider_name" class="log-provider">{{ row.provider_name }}</span>
              <span v-if="row.duration_ms != null && row.duration_ms > 0" class="log-duration">{{ row.duration_ms }}ms</span>
              <span v-if="row.tokens_used" class="log-tokens">{{ row.tokens_used }} tokens</span>
              <span v-if="row.request_summary" class="log-summary" :title="row.request_summary">{{ row.request_summary.slice(0, 60) }}<span v-if="row.request_summary.length > 60">…</span></span>
            </div>
          </template>
          <!-- 操作日志 -->
          <template v-else-if="row.log_type === 'operation'">
            <div class="log-content">
              <span class="log-op">{{ row.operation }}</span>
              <span v-if="row.entity_name" class="log-entity">（{{ row.entity_type }}: {{ row.entity_name }}）</span>
              <span v-if="row.entity_id && !row.entity_name" class="log-entity-id">#{{ row.entity_id }}</span>
            </div>
          </template>
          <!-- API 请求日志 -->
          <template v-else>
            <div class="log-content">
              <el-tag :type="row.status_code >= 500 ? 'danger' : row.status_code >= 400 ? 'warning' : ''" size="small" effect="dark" class="log-method-tag">{{ row.method }}</el-tag>
              <span class="log-path">{{ row.path }}</span>
              <span class="log-status" :class="statusClass(row.status_code)">{{ row.status_code }}</span>
              <span class="log-duration">{{ row.duration_ms }}ms</span>
            </div>
          </template>
        </template>
      </el-table-column>
      <el-table-column label="错误信息" min-width="180" show-overflow-tooltip>
        <template #default="{ row }">
          <span v-if="row.error_message" class="log-error-text">{{ row.error_message }}</span>
          <span v-else class="log-no-error">—</span>
        </template>
      </el-table-column>
      <el-table-column prop="ip" label="IP" width="140" show-overflow-tooltip />
    </el-table>

    <!-- 分页 -->
    <div class="log-pagination">
      <el-pagination
        v-model:current-page="page"
        v-model:page-size="pageSize"
        :page-sizes="[20, 50, 100, 200]"
        :total="total"
        layout="total, sizes, prev, pager, next, jumper"
        @size-change="loadData"
        @current-change="loadData"
      />
    </div>

    <!-- 日志详情弹窗 -->
    <el-dialog
      v-model="detailVisible"
      title="日志详情"
      width="780px"
      top="5vh"
      :close-on-click-modal="true"
    >
      <template v-if="detailRow">
        <!-- 基本信息 -->
        <div class="detail-section">
          <div class="detail-header">
            <el-tag v-if="detailRow.log_type === 'operation'" type="primary" size="small">操作日志</el-tag>
            <el-tag v-else-if="detailRow.log_type === 'ai_model_call'" type="warning" size="small">AI 模型调用</el-tag>
            <el-tag v-else type="success" size="small">API 请求</el-tag>
            <el-tag v-if="detailRow.level === 'error'" type="danger" size="small" style="margin-left:8px">错误</el-tag>
            <el-tag v-else-if="detailRow.level === 'warn'" type="warning" size="small" style="margin-left:8px">警告</el-tag>
            <span class="detail-time">{{ formatTime(detailRow.created_at) }}</span>
          </div>
        </div>

        <!-- 操作日志 -->
        <template v-if="detailRow.log_type === 'operation'">
          <div class="detail-section">
            <div class="detail-label">操作内容</div>
            <div class="detail-value">{{ detailRow.operation }}</div>
          </div>
          <div class="detail-grid">
            <div class="detail-section">
              <div class="detail-label">实体类型</div>
              <div class="detail-value">{{ detailRow.entity_type || '—' }}</div>
            </div>
            <div class="detail-section">
              <div class="detail-label">实体 ID</div>
              <div class="detail-value">{{ detailRow.entity_id || '—' }}</div>
            </div>
            <div class="detail-section">
              <div class="detail-label">实体名称</div>
              <div class="detail-value">{{ detailRow.entity_name || '—' }}</div>
            </div>
            <div class="detail-section">
              <div class="detail-label">IP</div>
              <div class="detail-value">{{ detailRow.ip || '—' }}</div>
            </div>
          </div>
          <div v-if="detailRow.error_message" class="detail-section">
            <div class="detail-label">错误信息</div>
            <div class="detail-value detail-error">{{ detailRow.error_message }}</div>
          </div>
        </template>

        <!-- AI 模型调用 -->
        <template v-if="detailRow.log_type === 'ai_model_call'">
          <div class="detail-grid">
            <div class="detail-section">
              <div class="detail-label">模型</div>
              <div class="detail-value">{{ detailRow.model_name || detailRow.entity_name || '—' }}</div>
            </div>
            <div class="detail-section">
              <div class="detail-label">服务商</div>
              <div class="detail-value">{{ detailRow.provider_name || '—' }}</div>
            </div>
            <div class="detail-section">
              <div class="detail-label">耗时</div>
              <div class="detail-value">{{ detailRow.duration_ms ? detailRow.duration_ms + 'ms' : '—' }}</div>
            </div>
            <div class="detail-section">
              <div class="detail-label">Token</div>
              <div class="detail-value">{{ detailRow.tokens_used || '—' }}</div>
            </div>
          </div>
          <div v-if="detailRow.error_message" class="detail-section">
            <div class="detail-label">错误信息</div>
            <div class="detail-value detail-error">{{ detailRow.error_message }}</div>
          </div>
          <div class="detail-section">
            <div class="detail-label">提示词</div>
            <pre class="detail-pre">{{ detailRow.request_summary || '—' }}</pre>
          </div>
        </template>

        <!-- API 请求 -->
        <template v-if="detailRow.log_type === 'api_request'">
          <div class="detail-grid">
            <div class="detail-section">
              <div class="detail-label">方法</div>
              <div class="detail-value"><el-tag size="small" effect="dark">{{ detailRow.method }}</el-tag></div>
            </div>
            <div class="detail-section">
              <div class="detail-label">路径</div>
              <div class="detail-value">{{ detailRow.path }}</div>
            </div>
            <div class="detail-section">
              <div class="detail-label">状态码</div>
              <div class="detail-value">{{ detailRow.status_code }}</div>
            </div>
            <div class="detail-section">
              <div class="detail-label">耗时</div>
              <div class="detail-value">{{ detailRow.duration_ms ? detailRow.duration_ms + 'ms' : '—' }}</div>
            </div>
          </div>
          <div v-if="detailRow.error_message" class="detail-section">
            <div class="detail-label">错误信息</div>
            <div class="detail-value detail-error">{{ detailRow.error_message }}</div>
          </div>
        </template>

        <!-- 请求详情（AI 模型 + API 通用） -->
        <template v-if="detailRow.request_detail && ['ai_model_call', 'api_request'].includes(detailRow.log_type)">
          <div class="detail-section-title">📤 请求详情</div>
          <div class="detail-json-box">
            <pre class="detail-pre">{{ formatJson(detailRow.request_detail) }}</pre>
          </div>
        </template>

        <!-- 响应详情 -->
        <template v-if="detailRow.response_detail && ['ai_model_call', 'api_request'].includes(detailRow.log_type)">
          <div class="detail-section-title">📥 响应详情</div>
          <div class="detail-json-box">
            <pre class="detail-pre">{{ formatJson(detailRow.response_detail) }}</pre>
          </div>
        </template>
      </template>
      <template #footer>
        <el-button @click="detailVisible = false">关闭</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted } from 'vue'
import { Search, Refresh, Delete } from '@element-plus/icons-vue'
import { logsAPI } from '@/api/logs'
import { ElMessage } from 'element-plus'
import { ElMessageBox } from 'element-plus'

const loading = ref(false)
const refreshing = ref(false)
const items = ref([])
const total = ref(0)
const page = ref(1)
const pageSize = ref(50)
const stats = ref({ total: 0, operation_count: 0, api_request_count: 0, error_count: 0, warn_count: 0, latest_at: null })
const detailVisible = ref(false)
const detailRow = ref(null)

function onRowClick(row) {
  detailRow.value = row
  detailVisible.value = true
}

function formatJson(jsonStr) {
  if (!jsonStr) return '—'
  try {
    const parsed = typeof jsonStr === 'string' ? JSON.parse(jsonStr) : jsonStr
    return JSON.stringify(parsed, null, 2)
  } catch (_) {
    return jsonStr
  }
}

const dateRange = ref(null)

const filters = reactive({
  log_type: '',
  level: '',
  entity_type: '',
  keyword: '',
  start_date: '',
  end_date: '',
})

const tableMaxHeight = computed(() => {
  // 根据视口高度动态计算，保留底部分页空间
  return Math.max(300, window.innerHeight - 350) + 'px'
})

function formatTime(iso) {
  if (!iso) return '—'
  const d = new Date(iso)
  return d.toLocaleString('zh-CN', {
    year: 'numeric', month: '2-digit', day: '2-digit',
    hour: '2-digit', minute: '2-digit', second: '2-digit',
  })
}

function statusClass(code) {
  if (code >= 500) return 'status-error'
  if (code >= 400) return 'status-warn'
  if (code >= 200 && code < 300) return 'status-ok'
  return ''
}

async function loadData() {
  loading.value = true
  try {
    const params = { page: page.value, page_size: pageSize.value }
    if (filters.log_type) params.log_type = filters.log_type
    if (filters.level) params.level = filters.level
    if (filters.entity_type && filters.log_type === 'operation') params.entity_type = filters.entity_type
    if (filters.keyword) params.keyword = filters.keyword
    if (filters.start_date) params.start_date = filters.start_date
    if (filters.end_date) params.end_date = filters.end_date
    const res = await logsAPI.list(params)
    items.value = res?.items || []
    total.value = res?.pagination?.total || 0
    page.value = res?.pagination?.page || 1
  } catch (_) {
    items.value = []
    total.value = 0
  } finally {
    loading.value = false
    refreshing.value = false
  }
}

async function loadStats() {
  try {
    const s = await logsAPI.stats()
    stats.value = s || stats.value
  } catch (_) {}
}

function onSearch() {
  page.value = 1
  loadData()
}

function onReset() {
  filters.log_type = ''
  filters.level = ''
  filters.entity_type = ''
  filters.keyword = ''
  filters.start_date = ''
  filters.end_date = ''
  dateRange.value = null
  page.value = 1
  loadData()
}

function onDateChange(val) {
  if (val && val.length === 2) {
    filters.start_date = val[0] + 'T00:00:00'
    filters.end_date = val[1] + 'T23:59:59'
  } else {
    filters.start_date = ''
    filters.end_date = ''
  }
  page.value = 1
  loadData()
}

function onSortChange({ prop, order }) {
  // 简单排序：时间正序/倒序由后端 ORDER BY id DESC 控制
  // 这里预留，可由后端扩展排序支持
}

async function onClean() {
  try {
    await logsAPI.clean(30)
    ElMessage.success('已清理 30 天前的日志')
    loadData()
    loadStats()
  } catch (_) {}
}

onMounted(() => {
  loadData()
  loadStats()
})
</script>

<style scoped>
.log-viewer {
  font-size: 13px;
}
.log-toolbar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  flex-wrap: wrap;
  gap: 8px;
  margin-bottom: 12px;
}
.toolbar-left {
  display: flex;
  align-items: center;
  gap: 8px;
  flex-wrap: wrap;
}
.toolbar-right {
  display: flex;
  align-items: center;
  gap: 8px;
}
.log-stats {
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 10px 14px;
  background: rgba(255,255,255,0.05);
  border-radius: 8px;
  margin-bottom: 12px;
  border: 1px solid rgba(255,255,255,0.08);
}
html.light .log-stats {
  background: rgba(0,0,0,0.02);
  border-color: rgba(0,0,0,0.06);
}
.stat-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 2px;
}
.stat-value {
  font-size: 20px;
  font-weight: 700;
  color: #e4e4e7;
}
html.light .stat-value { color: #18181b; }
.stat-label {
  font-size: 11px;
  color: #888;
}
.stat-operation .stat-value { color: #60a5fa; }
.stat-api .stat-value { color: #34d399; }
.stat-ai .stat-value { color: #f59e0b; }
.stat-warn .stat-value { color: #fbbf24; }
.stat-error .stat-value { color: #f87171; }
.log-time {
  font-size: 12px;
  font-family: monospace;
  white-space: nowrap;
}
.log-content {
  display: flex;
  align-items: center;
  gap: 6px;
  flex-wrap: wrap;
}
.log-op {
  font-weight: 500;
}
.log-model-tag {
  font-family: monospace;
  font-size: 12px;
  font-weight: 600;
  color: #f59e0b;
  background: rgba(245,158,11,0.12);
  padding: 1px 6px;
  border-radius: 4px;
}
html.light .log-model-tag {
  background: rgba(245,158,11,0.1);
}
.log-provider {
  font-size: 11px;
  color: #888;
}
.log-summary {
  font-size: 11px;
  color: #a1a1aa;
  max-width: 200px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
html.light .log-summary { color: #6b7280; }
.log-tokens {
  font-size: 11px;
  color: #60a5fa;
  font-family: monospace;
}
.log-entity {
  color: #888;
  font-size: 12px;
}
.log-entity-id {
  color: #888;
  font-size: 12px;
}
.log-method-tag {
  font-family: monospace;
  min-width: 48px;
  text-align: center;
}
.log-path {
  font-family: monospace;
  font-size: 12px;
  color: #a1a1aa;
}
html.light .log-path { color: #52525b; }
.log-status {
  font-family: monospace;
  font-size: 12px;
  font-weight: 600;
  min-width: 32px;
}
.log-duration {
  font-family: monospace;
  font-size: 11px;
  color: #888;
}
.status-ok { color: #34d399; }
.status-warn { color: #fbbf24; }
.status-error { color: #f87171; }
.log-error-text {
  color: #f87171;
  font-size: 12px;
}
.log-no-error { color: #52525b; font-size: 12px; }
.log-pagination {
  display: flex;
  justify-content: flex-end;
  margin-top: 12px;
}

/* 详情弹窗 */
.detail-section {
  margin-bottom: 12px;
}
.detail-section-title {
  font-size: 14px;
  font-weight: 600;
  color: #e4e4e7;
  margin: 16px 0 8px 0;
  padding-bottom: 4px;
  border-bottom: 1px solid rgba(255,255,255,0.08);
}
html.light .detail-section-title {
  color: #18181b;
  border-bottom-color: rgba(0,0,0,0.08);
}
.detail-header {
  display: flex;
  align-items: center;
  gap: 6px;
  margin-bottom: 8px;
}
.detail-time {
  font-size: 12px;
  color: #888;
  margin-left: auto;
}
.detail-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 8px 16px;
}
.detail-label {
  font-size: 11px;
  color: #888;
  margin-bottom: 2px;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}
.detail-value {
  font-size: 13px;
  color: #e4e4e7;
  word-break: break-all;
}
html.light .detail-value { color: #18181b; }
.detail-error {
  color: #f87171;
}
.detail-json-box {
  background: rgba(0,0,0,0.15);
  border-radius: 8px;
  padding: 12px;
  max-height: 300px;
  overflow: auto;
  border: 1px solid rgba(255,255,255,0.06);
}
html.light .detail-json-box {
  background: rgba(0,0,0,0.03);
  border-color: rgba(0,0,0,0.06);
}
.detail-pre {
  margin: 0;
  font-size: 12px;
  font-family: 'SF Mono', 'Fira Code', monospace;
  line-height: 1.5;
  white-space: pre-wrap;
  word-break: break-all;
  color: #d4d4d8;
}
html.light .detail-pre { color: #3f3f46; }
</style>

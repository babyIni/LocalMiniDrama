# 🎬 本地短剧助手 (LocalMiniDrama) — 项目文件完整汇编

> **版本：** v1.2.8  
> **作者：** xuanyustudio  
> **许可证：** MIT  
> **仓库：** [GitHub](https://github.com/xuanyustudio/LocalMiniDrama) | [Gitee](https://gitee.com/bi_shang_a/localminidrama)  
> **整理日期：** 2026-07-25

---

## 目录

1. [项目总览](#1-项目总览)
2. [项目架构](#2-项目架构)
3. [根目录文件](#3-根目录文件)
4. [后端 (backend-node)](#4-后端-backend-node)
5. [前端 (frontweb)](#5-前端-frontweb)
6. [桌面端 (desktop)](#6-桌面端-desktop)
7. [文档 (docs)](#7-文档-docs)
8. [配置与中转站](#8-配置与中转站)
9. [其他目录](#9-其他目录)
10. [快速参考](#10-快速参考)

---

## 1. 项目总览

### 1.1 项目简介

**本地短剧助手（LocalMiniDrama）** 是一个完全本地运行的 AI 短剧 & 漫剧生成工具。基于纯 JavaScript（Vue 3 + Node.js + Electron）从零搭建，接入用户自己的 AI API，即可生成完整 AI 短剧。

**核心理念：** 下载即用、数据不出本机、完全开源、无订阅费。

### 1.2 核心功能

| 步骤 | 功能 | 说明 |
|:----:|------|------|
| 1 | **故事生成** | 输入梗概 + 风格，AI 自动生成多集剧本 |
| 2 | **剧本编辑** | 分集管理，剧本文本可自由编辑 |
| 3 | **角色生成** | AI 提取角色列表，逐个生成角色形象图 |
| 4 | **场景生成** | 从剧本自动提取场景，生成场景背景图 |
| 5 | **道具生成** | 从剧本提取/手动添加道具，生成道具图 |
| 6 | **分镜生成** | 按集自动生成分镜脚本（含景别/运镜/台词） |
| 7 | **图片/视频生成** | 逐镜生成静帧图与视频片段 |
| 8 | **合成视频** | 所有分镜视频自动合成为完整剧集文件 |

### 1.3 支持的服务商

| 服务商 | 文本 | 图片 | 视频 |
|--------|:----:|:----:|:----:|
| 阿里云 DashScope（通义） | ✅ | ✅ | ✅ |
| 火山引擎 Volcengine（豆包 / Seedance 2.0） | ✅ | ✅ | ✅ |
| 可灵 Kling AI（含 Omni） | — | ✅ | ✅ |
| Agnes AI | ✅ | ✅ | ✅ |
| Google Gemini（Imagen / Veo） | — | ✅ | ✅ |
| Vidu 生数科技 | — | — | ✅ |
| NanoBanana（含代理） | — | ✅ | — |
| 本地 Ollama 等 OpenAI 兼容 | ✅ | — | — |
| 其他 OpenAI 兼容接口 | ✅ | ✅ | — |

### 1.4 更新历史（v1.2.8 最新亮点）

- **Agnes AI 接入**：一个 Key 覆盖文本/图片/视频
- **画布模式增强**：剧本节点、右键菜单、浮动工具栏、画布内 CRUD
- **ModelArk 私有资产库**：SD2 角色认证对接火山方舟
- **图床配置项化**：`upload_url` / 超时 / 重试次数可配置
- **提示词优化** · **分镜图片数量上限修复**

---

## 2. 项目架构

```
LocalMiniDrama/
├── backend-node/          # Express + SQLite 后端（端口 5679）
│   ├── src/app.js         # Express 应用（路由注册、中间件）
│   ├── src/server.js      # HTTP 服务入口
│   ├── src/routes/        # REST API 路由
│   ├── src/services/      # 业务逻辑（生成、导出/导入等）
│   ├── src/db/            # SQLite 连接与迁移
│   ├── src/config/        # YAML 配置加载
│   ├── migrations/        # 22 个 SQL 迁移文件
│   └── configs/           # config.yaml 配置
├── frontweb/              # Vue 3 + Element Plus 前端（端口 3013）
│   ├── src/views/         # 页面组件
│   ├── src/components/    # 通用/画布组件
│   ├── src/composables/   # 组合式 API
│   ├── src/stores/        # Pinia 状态管理
│   ├── src/api/           # 后端 API 封装
│   └── src/utils/         # 工具函数
├── desktop/               # Electron 桌面壳
│   ├── main.js            # 主进程（后端启动、窗口创建）
│   └── scripts/           # 构建脚本
├── docs/                  # 文档
│   ├── en.md              # 英文文档
│   ├── quickstart.md      # 快速开始/开发指南
│   ├── configuration.md   # AI 配置指南
│   └── plans/             # 实施计划文档
├── example_drama/         # 示例项目
├── openclaw-skill/        # OpenClaw 技能定义
├── 各大平台中转站配置/     # 中转站 JSON 示例
└── 项目截图/              # 界面截图
```

| 层 | 技术 |
|----|------|
| 前端 | Vue 3 · Vite · Element Plus · Pinia · @vue-flow/core · Axios |
| 后端 | Node.js · Express · SQLite (better-sqlite3) |
| 桌面 | Electron 28 · electron-builder |
| 语言 | 纯 JavaScript（无 TypeScript） |

---

## 3. 根目录文件

### 3.1 README.md（主文档）

**路径：** `/README.md`  
**内容：** 项目主页 README，包含：
- 项目介绍与徽章
- 界面预览（8 张截图 + 3 段演示视频）
- 核心功能列表（8 步完整流程 + 画布工作流 + AI 配置）
- 快速开始（下载 exe / 源码开发）
- AI 服务商支持表格
- 项目架构图
- 后续计划 Roadmap
- 适合人群、贡献指南、联系方式

### 3.2 AGENTS.md（AI 代理说明）

**路径：** `/AGENTS.md`  
**内容：** Cursor Cloud / AI 代理专用的项目说明：
- 服务端口映射（后端 5679，前端 3013）
- 测试命令（`node --test`）
- 构建命令（`npm run build`）
- 关键开发说明（纯 JS、SQLite、Migrations 自动运行等）

### 3.3 CHANGELOG.md（变更日志）

**路径：** `/CHANGELOG.md`  
**内容：** 完整的版本历史（从 v1.0.x 到 v1.2.8），按 [Keep a Changelog](https://keepachangelog.com/) 格式，每个版本包含：
- **新增**（Features）
- **优化**（Improvements）
- **修复**（Bug Fixes）
- **文档**（Documentation）
- **架构**（Architecture）

### 3.4 CODE_OF_CONDUCT.md（行为准则）

**路径：** `/CODE_OF_CONDUCT.md`  
**内容：** 基于 Contributor Covenant v1.4 的社区行为准则（中英双语）。

### 3.5 CONTRIBUTING.md（贡献指南）

**路径：** `/CONTRIBUTING.md`  
**内容：** 详细的贡献流程（中英双语）：
- 报告 Bug、功能建议流程
- 贡献代码基本流程（Fork → Branch → Commit → PR）
- PR 要求
- 开发环境搭建
- 代码风格（纯 JS、camelCase、kebab-case）
- 提交规范（Conventional Commits）

### 3.6 LICENSE（许可证）

**路径：** `/LICENSE`  
**内容：** MIT 开源许可证全文。

### 3.7 SECURITY.md（安全政策）

**路径：** `/SECURITY.md`  
**内容：** 安全漏洞报告流程（中英双语），建议通过 GitHub Security Advisory 或微信私下联系。

### 3.8 index.html（发布页）

**路径：** `/index.html`  
**内容：** 项目发布/宣传页面（独立 HTML），包含：
- 导航栏（Logo + 功能特点/快速开始/AI与中转/下载/GitHub）
- Hero 区域（项目简介 + CTA 按钮 + B 站视频教程）
- 功能特点展示（6 大功能卡片）
- 快速开始四步骤
- AI 与各大平台中转站（配置说明 + 直链）
- 下载区域（Windows、macOS 版下载链接）
- 技术栈展示
- 页脚

### 3.9 run_dev.bat（Windows 开发启动）

**路径：** `/run_dev.bat`  
**内容：** Windows 批处理脚本，一键启动开发环境：
1. 杀死端口 5679 上旧进程
2. 启动后端（`backend-node`，`npm run dev`）
3. 启动前端（`frontweb`，`npm run dev`）
4. 3 秒后打开 `http://127.0.0.1:3013`

### 3.10 run_dev.ps1（PowerShell 开发启动）

**路径：** `/run_dev.ps1`  
**内容：** PowerShell 版本的一键启动脚本。

### 3.11 .gitignore

**路径：** `/.gitignore`  
**内容：** 忽略 `node_modules/`、`.env`、`*.log`、`data/` 目录、`dist/` 等。

### 3.12 .gitattributes

**路径：** `/.gitattributes`  
**内容：** Git 属性配置。

---

## 4. 后端 (backend-node)

### 4.1 配置文件

#### config.yaml（后端配置）

**路径：** `/backend-node/configs/config.yaml`

```yaml
app:
  name: LocalMiniDrama API
  version: 1.0.0
  debug: true
  language: zh
server:
  port: 5679
  host: 0.0.0.0
  cors_origins:
    - http://localhost:3012
  read_timeout: 600
  write_timeout: 600
  insecure_tls: true
database:
  type: sqlite
  path: ./data/drama_generator.db
  max_idle: 10
  max_open: 100
storage:
  type: local
  local_path: ./data/storage
  base_url: http://localhost:5679/static
video:
  generation_timeout_minutes: 30
ai:
  default_text_provider: openai
  default_image_provider: openai
  default_video_provider: doubao
style:
  default_style: ''
  default_role_style: full body and face clearly visible, character centered...
  default_scene_style: wide establishing shot, highly detailed environment...
  default_prop_style: object centered, clean simple background...
  default_image_ratio: '16:9'
  default_video_ratio: '16:9'
  default_prop_ratio: '1:1'
vendor_lock:
  enabled: false
  config_file: ai-configs-qudao.json
image_proxy:
  expire_hours: 2
  use_for_video: true
  upload_timeout_seconds: 180
  upload_max_attempts: 2
```

#### package.json

**路径：** `/backend-node/package.json`  
**版本：** 1.2.8  
**主要依赖：**
- `express` ^4.21.0 — Web 框架
- `better-sqlite3` ^11.6.0 — SQLite 数据库
- `cors` ^2.8.5 — 跨域支持
- `js-yaml` ^4.1.0 — YAML 配置解析
- `jsonrepair` ^3.13.3 — JSON 修复
- `jsonwebtoken` ^9.0.3 — JWT
- `multer` ^1.4.5-lts.1 — 文件上传
- `sharp` ^0.34.5 — 图片处理（四宫格拆分）
- `uuid` ^10.0.0 — UUID 生成
- `adm-zip` ^0.5.16 — ZIP 导入导出
- `@volcengine/openapi` ^1.36.1 — 火山引擎 SDK

### 4.2 核心源码 (src/)

#### app.js

**路径：** `/backend-node/src/app.js`  
**功能：** Express 应用工厂函数 `createApp()`：
- 加载配置、连接数据库
- 运行数据库迁移
- 应用厂商锁定策略
- 清理孤儿异步任务
- 恢复处理中的视频任务
- 注册中间件（CORS、日志、JSON 解析）
- 挂载静态文件目录（`/static`）
- 注册 API 路由（`/api/v1`）
- 提供前端静态文件服务
- 统一错误处理

#### server.js

**路径：** `/backend-node/src/server.js`  
**功能：** HTTP 服务入口，创建并启动服务器。

#### logger.js

**路径：** `/backend-node/src/logger.js`  
**功能：** 日志模块。

#### response.js

**路径：** `/backend-node/src/response.js`  
**功能：** 统一响应格式工具：
- 成功：`{ success: true, data: {...}, timestamp: "..." }`
- 错误：`{ success: false, error: { code, message }, timestamp: "..." }`

### 4.3 配置模块 (src/config/)

#### config/index.js

**路径：** `/backend-node/src/config/index.js`  
**功能：** YAML 配置加载器。

#### videoGeneration.js

**路径：** `/backend-node/src/config/videoGeneration.js`  
**功能：** 视频生成相关配置。

### 4.4 数据库模块 (src/db/)

#### db/index.js

**路径：** `/backend-node/src/db/index.js`  
**功能：** better-sqlite3 连接管理。

#### db/migrate.js

**路径：** `/backend-node/src/db/migrate.js`  
**功能：** 数据库迁移：
- 启动时自动执行 `ensureColumns()` 补列
- 支持 `npm run migrate` 手动运行
- 自动执行 `migrations/` 目录下的 SQL 文件

### 4.5 路由模块 (src/routes/)

| 文件 | 路径 | 功能 |
|------|------|------|
| `index.js` | — | 路由总入口，注册所有子路由 |
| `drama.js` | `/dramas` | 剧集 CRUD、导出/导入 |
| `characters.js` | `/characters` | 角色 CRUD、图片生成 |
| `scenes.js` | `/scenes` | 场景 CRUD |
| `images.js` | `/images` | 图片生成任务 |
| `videos.js` | `/videos` | 视频生成任务 |
| `storyboards.js` | `/storyboards` | 分镜 CRUD |
| `aiConfig.js` | `/ai-configs` | AI 服务商配置 CRUD |
| `audio.js` | `/audio` | 音频合成 |
| `assets.js` | `/assets` | 资产管理 |
| `prop.js` | `/props` | 道具管理 |
| `propLibrary.js` | `/prop-library` | 道具库 CRUD |
| `sceneLibrary.js` | `/scene-library` | 场景库 CRUD |
| `characterLibrary.js` | `/character-library` | 角色库 CRUD |
| `sceneModelMap.js` | `/scene-model-map` | 场景模型映射 |
| `settings.js` | `/settings` | 全局设置 |
| `task.js` | `/tasks` | 异步任务查询 |
| `upload.js` | `/upload` | 文件上传 |
| `logs.js` | `/logs` | 操作日志 & API 请求日志查询（分页、统计、清理） |
| `videoMerges.js` | `/video-merges` | 视频合并 |
| `stub.js` | — | 桩模块 |
| `promptOverrides.js` | `/prompts` | 提示词覆盖 |
| `storyboards_tail_link.js` | — | 尾帧衔接 |

### 4.6 服务模块 (src/services/)

| 文件 | 功能 |
|------|------|
| `dramaService.js` | 剧集 CRUD 与数据组装，含首尾帧字段 |
| `episodeStoryboardService.js` | 分镜生成核心逻辑 |
| `storyboardService.js` | 分镜服务 |
| `storyboardFrameBinding.js` | 分镜帧绑定 |
| `imageService.js` | 图片生成任务处理（含四宫格拆分） |
| `videoService.js` | 视频生成任务处理 |
| `videoMergeService.js` | 视频合并（ffmpeg） |
| `videoClient.js` | 视频 API 调用（Volcengine、Kling、Gemini 等） |
| `imageClient.js` | 图片 API 调用（DashScope、Volcengine、Gemini 等） |
| `aiClient.js` | AI 文本生成客户端 |
| `aiConfigService.js` | AI 配置服务（含厂商锁定） |
| `characterGenerationService.js` | 角色提取与生成 |
| `characterLibraryService.js` | 角色库管理 |
| `backgroundExtractionService.js` | 场景背景提取 |
| `propExtractionService.js` | 道具提取 |
| `propImageGenerationService.js` | 道具图片生成 |
| `propService.js` | 道具服务 |
| `framePromptService.js` | 首/尾帧提示词生成 |
| `dramaExportService.js` | 工程导出为 ZIP |
| `dramaImportService.js` | ZIP 工程导入 |
| `novelImportService.js` | 小说导入 |
| `promptI18n.js` | 多语言提示词模板（中/英） |
| `promptOverridesService.js` | 提示词覆盖服务 |
| `uploadService.js` | 文件存储管理 |
| `taskService.js` | 异步任务管理 |
| `settingsService.js` | 全局设置 KV 读写 |
| `angleService.js` | 镜头角度定义（8×4×3 = 96 种组合） |
| `assetService.js` | 资产管理 |
| `modelArkAssetConfigService.js` | ModelArk 资产库配置 |
| `modelArkAssetProxyService.js` | ModelArk 资产代理 |
| `seedance2AssetGuards.js` | Seedance 2.0 角色素材守护 |
| `jimengMaterialHubService.js` | 即梦素材中心 |
| `mediaAspectRatioSpec.js` | 媒体画幅规格统一 |
| `libraryDedup.js` | 素材库去重 |
| `deepseekConfig.js` | DeepSeek 配置 |
| `storageLayout.js` | 存储布局 |
| `mergedEpisodePostProcess.js` | 合并后处理 |
| `narrationVideoPostProcess.js` | 旁白视频后处理 |
| `storyGenerationService.js` | 故事/剧本生成 |
| `tailFrameLinkService.js` | 尾帧衔接服务 |
| `sceneService.js` | 场景服务 |
| `sceneLibraryService.js` | 场景库服务 |
| `propLibraryService.js` | 道具库服务 |
| `ttsService.js` | TTS 语音合成 |
| `universalOmniMultiBeatFormat.js` | 全能模式多拍格式 |
| `universalSegmentDurationNormalize.js` | 全能片段时长归一 |
| `universalSegmentPromptBundle.js` | 全能片段提示词包 |

### 4.7 工具模块 (src/utils/)

| 文件 | 功能 |
|------|------|
| `dramaStyleMerge.js` | 样式合并 |
| `ffmpegPath.js` | FFmpeg 路径查找 |
| `framePromptSanitize.js` | 帧提示词清洗 |
| `safeJson.js` | JSON 安全解析（集成 jsonrepair） |
| `seedance2AssetGuards.js` | Seedance 2 asset 守卫 |

### 4.8 数据迁移 (migrations/)

共 22 个 SQL 迁移文件，覆盖数据库演进：

| 文件 | 说明 |
|------|------|
| `01_init.sql` | 初始建表 |
| `02_add_default_model.sql` | 添加默认模型 |
| `03_add_props_episode_id.sql` | 道具集数 ID |
| `04_async_tasks_columns.sql` | 异步任务列 |
| `05_add_image_generations_completed_at.sql` | 图片完成时间 |
| `06_add_characters_local_path.sql` | 角色本地路径 |
| `07_add_scenes_image_columns.sql` | 场景图片列 |
| `08_add_video_generations_completed_at.sql` | 视频完成时间 |
| `09_scene_prop_libraries.sql` | 场景道具库 |
| `10_prompt_overrides.sql` | 提示词覆盖 |
| `11_add_api_protocol.sql` | API 接口协议 |
| `12_image_proxy_cache.sql` | 图床缓存 |
| `13_character_identity_anchors.sql` | 角色身份锚点 |
| `14_storyboard_segments_and_model_map.sql` | 分镜段落与模型映射 |
| `15_storyboard_angle_structured.sql` | 结构化角度 |
| `16_character_polished_prompt.sql` | 角色润色提示词 |
| `17_character_stages.sql` | 角色阶段 |
| `18_storyboard_narration.sql` | 分镜旁白 |
| `19_storyboard_universal_mode.sql` | 分镜全能模式 |
| `20_character_seedance2_asset.sql` | 角色 Seedance 2 资产 |
| `21_asset_negative_prompt.sql` | 资产负面提示词 |
| `22_library_source_id.sql` | 素材库来源 ID |

### 4.9 测试 (test/)

| 文件 | 说明 |
|------|------|
| `agnesImageSize.test.js` | Agnes 图片尺寸测试 |
| `agnesVideoBody.test.js` | Agnes 视频请求体测试 |
| `agnesVideoPoll.test.js` | Agnes 视频轮询测试 |
| `deepseekConfig.test.js` | DeepSeek 配置测试 |
| `imageProxyCache.test.js` | 图床缓存测试 |
| `jimengMaterialHub.test.js` | 即梦素材中心测试 |
| `libraryDedup.test.js` | 素材库去重测试 |
| `modelArkAssetConfig.test.js` | ModelArk 资产配置测试 |
| `taskService.test.js` | 任务服务测试 |

---

## 5. 前端 (frontweb)

### 5.1 package.json

**路径：** `/frontweb/package.json`  
**版本：** 1.2.8（type: module）  
**主要依赖：**
- `vue` ^3.4.0
- `vue-router` ^4.2.0
- `pinia` ^2.1.0
- `element-plus` ^2.5.0 + `@element-plus/icons-vue` ^2.3.0
- `@vue-flow/core` ^1.48.2 + 插件
- `axios` ^1.6.0
- **Dev：** `vite` ^5.0.0 + `@vitejs/plugin-vue` ^5.0.0

### 5.2 视图组件 (src/views/)

| 组件 | 路由 | 功能 |
|------|------|------|
| `FilmList.vue` | `/` | 首页 · 项目卡片一览，新建/导入项目 |
| `DramaDetail.vue` | `/drama/:id` | 剧集管理 · 分集 + 资源库 |
| `FilmCreate.vue` | `/film/:id` | 制作页 · 剧本/角色/场景/道具/分镜 |
| `DramaCanvas.vue` | `/film/:id/canvas` | 画布工作流 · 无限画布编排 |
| `AiConfig.vue` | `/ai-config` | AI 配置页面 |
| `FreeCreate.vue` | — | 自由创作（功能待完善，已隐藏） |
| `MediaLibrary.vue` | — | 素材库（功能待完善，已隐藏） |

### 5.3 API 层 (src/api/)

| 文件 | 功能 |
|------|------|
| `drama.js` | 剧集 API |
| `characters.js` | 角色 API |
| `scenes.js` | 场景 API |
| `props.js` | 道具 API |
| `storyboards.js` | 分镜 API |
| `images.js` | 图片 API |
| `videos.js` | 视频 API |
| `generation.js` | 生成 API |
| `ai.js` | AI 配置 API |
| `prompts.js` | 提示词 API |
| `characterLibrary.js` | 角色库 API |
| `sceneLibrary.js` | 场景库 API |
| `propLibrary.js` | 道具库 API |
| `sceneModelMap.js` | 场景模型映射 API |
| `task.js` | 任务 API |
| `upload.js` | 上传 API |

### 5.4 组件 (src/components/)

#### 核心组件
| 文件 | 功能 |
|------|------|
| `AIConfigContent.vue` | AI 配置面板（含生成设置 Tab） |
| `PromptEditor.vue` | 提示词编辑器 |
| `SceneModelMap.vue` | 场景模型映射 |
| `StylePickerButton.vue` | 可视化风格选择器 |
| `Sd2AssetManagement.vue` | Seedance 2 资产管理 |
| `EpisodeBatchImportDialog.vue` | 批量导入对话框 |
| `UniversalSegmentOmniAtEditor.vue` | 全能模式编辑 |

#### 画布组件 (dramaCanvas/)
| 文件 | 功能 |
|------|------|
| `CanvasAddButtonNode.vue` | 添加按钮节点 |
| `CanvasAssetNode.vue` | 素材节点（角色/场景/道具） |
| `CanvasAssetPanel.vue` | 素材操作面板 |
| `CanvasContextMenu.vue` | 右键菜单 |
| `CanvasCreateDialog.vue` | 新建对话框 |
| `CanvasDramaHeaderNode.vue` | 项目标题节点 |
| `CanvasEpisodeNode.vue` | 集标题节点 |
| `CanvasFloatingToolbar.vue` | 浮动工具栏 |
| `CanvasFlowAligner.vue` | 流程对齐器 |
| `CanvasLabelNode.vue` | 标签节点 |
| `CanvasMediaNode.vue` | 媒体节点（图片/视频） |
| `CanvasMediaPanel.vue` | 媒体操作面板 |
| `CanvasNodeStatusOverlay.vue` | 节点状态遮罩 |
| `CanvasScriptNode.vue` | 剧本节点 |
| `CanvasScriptPanel.vue` | 剧本操作面板 |
| `CanvasStoryboardNode.vue` | 分镜节点 |
| `CanvasStoryboardPanel.vue` | 分镜操作面板 |

### 5.5 组合式函数 (src/composables/)

| 文件 | 功能 |
|------|------|
| `useCanvasContext.js` | 画布上下文（provide/inject） |
| `useCanvasCrud.js` | 画布 CRUD 操作 |
| `useCanvasScript.js` | 画布剧本管理 |
| `useCanvasStoryboardMedia.js` | 画布分镜媒体加载 |
| `useCanvasWorkflowRunner.js` | 画布工作流执行 |
| `useCanvasAssetGenerate.js` | 画布素材生成 |
| `useCanvasEpisodeGenerate.js` | 画布整集生成 |
| `useCanvasNodeStatus.js` | 画布节点状态 |
| `useGenerationTaskSync.js` | 生成任务同步 |
| `useStoryGeneration.js` | 故事生成 |
| `useTheme.js` | 主题切换 |
| `filmCreate/useCharacters.js` | 角色管理（制作页） |
| `filmCreate/useScenes.js` | 场景管理（制作页） |
| `filmCreate/useProps.js` | 道具管理（制作页） |
| `filmCreate/useNavigation.js` | 导航（制作页） |
| `filmCreate/libraryMembership.js` | 素材库隶属 |

### 5.6 状态管理 (src/stores/)

| 文件 | 功能 |
|------|------|
| `film.js` | 剧集状态（Pinia） |
| `generationTaskStore.js` | 生成任务状态 |

### 5.7 工具函数 (src/utils/)

| 文件 | 功能 |
|------|------|
| `canvasEntityIds.js` | 画布节点 ID 规范 |
| `canvasLayout.js` | 画布布局持久化 |
| `canvasWorkflow.js` | 工作流组 CRUD |
| `dramaCanvasAdapter.js` | Drama 数据 → Vue Flow 图 |
| `exportStoryboardSheet.js` | 导出分镜表 HTML |
| `mediaUrl.js` | 媒体 URL 处理 |
| `modelSelection.js` | 模型选择 |
| `storyboardMedia.js` | 分镜媒体解析 |
| `scriptEpisodes.js` | 剧本多集分段 |
| `request.js` | Axios 请求封装 |

### 5.8 其他

| 文件 | 功能 |
|------|------|
| `src/main.js` | Vue 应用入口 |
| `src/router/index.js` | 路由配置 |
| `src/styles/theme.css` | 主题样式 |
| `src/constants/styleOptions.js` | 风格选项常量 |
| `vite.config.js` | Vite 构建配置 |
| `index.html` | 入口 HTML |
| `public/style-thumbs/` | 42 张风格缩略图 |
| `public/wx.jpg` | 微信二维码 |

---

## 6. 桌面端 (desktop)

### 6.1 package.json

**路径：** `/desktop/package.json`  
**版本：** 1.2.8  
**主要依赖：** 与后端相同（Electron 主进程内置后端）  
**构建配置：** electron-builder（Win: NSIS + Portable，Mac: DMG）

### 6.2 main.js（Electron 主进程）

**路径：** `/desktop/main.js`  
**功能：** Electron 主进程入口：
- 固定 `userData` 目录（`localminidrama-desktop`）
- 自动迁移旧路径数据
- 编译/运行时代码加载策略
- 端口自动探测（优先 5679，被占时随机分配）
- 自动复制 FFmpeg（首次启动）
- 创建浏览器窗口（1280×800）
- 后端主进程内运行（不走子进程）
- `vendor_lock` 配置同步

### 6.3 构建脚本

| 文件 | 功能 |
|------|------|
| `scripts/copy-backend.js` | 复制后端代码 |
| `scripts/copy-front.js` | 复制前端产物 |
| `scripts/dist-cn.js` | 国内镜像打包 |
| `scripts/clean-win-unpacked.js` | 清理解包文件 |
| `scripts/initial-migrations/` | 7 个初始迁移 SQL |
| `dist-mac.sh` | macOS 打包脚本 |
| `dist-cn.bat` | 国内镜像打包（Windows） |
| `electron-builder-mac.json` | Mac 构建配置 |
| `electron-builder-mac-lite.json` | Mac Lite 构建配置 |
| `electron-builder-lite.json` | Windows Lite 构建配置 |
| `ffmpeg-mac/` | macOS FFmpeg |

---

## 7. 文档 (docs/)

| 文件 | 说明 |
|------|------|
| `en.md` | 英文版项目文档 |
| `quickstart.md` | 快速开始/开发指南（含 FAQ） |
| `configuration.md` | AI 配置完整指南 |
| `changelog.md` | 指向根目录 CHANGELOG.md |
| `story.md` | 作者故事与开发碎碎念 |
| `comfyui配置.md` | ComfyUI 配置说明 |
| `comfyui资料1.md` | ComfyUI 相关资料 |
| `comfyui原理.txt` | ComfyUI 原理说明 |
| `微信支付.docx` | 微信支付相关文档 |

### 计划文档 (docs/plans/)

| 文件 | 说明 |
|------|------|
| `2026-06-15-drama-canvas-workflow-plan.md` | **画布工作流实施计划**（含阶段 A-D 完整交付物、节点 ID 规范、操作说明、Vue Flow 配置、风险规避） |
| `2026-03-09-storyboard-angle-and-quad-grid.md` | 分镜角度与四宫格计划 |
| `2026-03-09-storyboard-angle-and-quadgrid.md` | 同上（不同拼写） |
| `2026-03-14-storyboard-image-quality.md` | 分镜图片质量计划 |

---

## 8. 配置与中转站

### 8.1 各大平台中转站配置

**路径：** `/各大平台中转站配置/`

| 文件 | 说明 |
|------|------|
| `使用说明.txt` | 配置文件使用说明 |
| `阿里云百炼TokenPlan.json` | 阿里云百炼个人 TokenPlan（千问/万相/HappyHorse） |
| `302ai-302.json` | 302.AI 中转站配置 |
| `云雾ai.json` | 云雾 AI 中转站配置 |
| `向量.json` | 向量平台中转站配置 |
| `n1n.json` | n1n 中转站配置 |
| `飞儿api-ffir.cn.json` | 飞儿 API 中转站配置 |
| `geeknow.json` | GeekNow 中转站配置 |
| `comfyui配置.md` | ComfyUI 配置说明 |
| `官方即梦2.0配置.png` | 即梦 2.0 配置示意图 |
| `调用本地反向代理即梦freeapi的配置.png` | 本地即梦 Free API 配置 |
| `stablediffusion webui接口.png` | SD WebUI 接口 |

### 8.2 OpenClaw 技能 (openclaw-skill/)

**路径：** `/openclaw-skill/`

| 文件 | 说明 |
|------|------|
| `SKILL.md` | 完整技能定义（API 文档 + 工作流教程） |
| `skill.json` | 技能元数据 |
| `tools.json` | 工具定义 |
| `README.md` | 技能说明 |

---

## 9. 其他目录

### 9.1 项目截图

**路径：** `/项目截图/`  
**包含：** 14 个截图文件
- 首页截图、画布模式、武侠剧、武侠分镜、新版本4宫格分镜
- 专业分镜、本剧场景库、角色管理、微信群、微信二维码
- 微信支付、支付宝、阿里、支付宝

### 9.2 示例项目

**路径：** `/example_drama/`  
**说明：** 包含一个完整的示例短剧项目数据。

### 9.3 GitHub 模板

**路径：** `/.github/`

| 文件 | 说明 |
|------|------|
| `FUNDING.yml` | 资助配置 |
| `PULL_REQUEST_TEMPLATE.md` | PR 模板 |
| `ISSUE_TEMPLATE/bug_report.md` | Bug 报告模板 |
| `ISSUE_TEMPLATE/feature_request.md` | 功能建议模板 |
| `ISSUE_TEMPLATE/config.yml` | Issue 配置 |
| `workflows/release.yml` | 发布工作流 |

---

## 10. 快速参考

### 10.1 开发快速启动

```bash
# 后端（终端 1）
cd backend-node && npm install && npm run migrate && npm run dev

# 前端（终端 2）
cd frontweb && npm install && npm run dev
```

### 10.2 测试运行

```bash
# 后端测试
cd backend-node && node --test test/*.test.js

# 前端测试
cd frontweb && node --test test/*.test.js
```

### 10.3 构建打包

```bash
# 构建前端
cd frontweb && npm run build

# 打包桌面（需先构建前端）
cd desktop && npm run dist
```

### 10.4 API 设计

- **基路径：** `/api/v1`
- **响应格式：** `{ success: true, data: {...}, timestamp: "..." }`
- **错误格式：** `{ success: false, error: { code, message }, timestamp: "..." }`
- **异步任务：** 所有生成类任务返回 `{ task_id, status }`，需轮询 `GET /api/v1/tasks/{id}`

### 10.5 数据库表清单

| 表名 | 说明 |
|------|------|
| `dramas` | 剧集基本信息 |
| `episodes` | 集数 |
| `storyboards` | 分镜 |
| `characters` | 角色 |
| `episode_characters` | 角色-集数关联 |
| `scenes` | 场景 |
| `props` | 道具 |
| `image_generations` | 图片生成记录 |
| `video_generations` | 视频生成记录 |
| `video_merges` | 视频合并记录 |
| `ai_service_configs` | AI 服务商配置 |
| `async_tasks` | 异步任务 |
| `character_libraries` | 角色素材库 |
| `scene_libraries` | 场景素材库 |
| `prop_libraries` | 道具素材库 |
| `prompt_overrides` | 提示词覆盖 |
| `storyboard_props` | 分镜-道具关联 |
| `storyboard_characters` | 分镜-角色关联 |
| `global_settings` | 全局设置 |
| `image_proxy_cache` | 图床缓存 |

### 10.6 画布节点 ID 规范

| ID 格式 | 含义 |
|---------|------|
| `char:{id}` | 角色 |
| `scene:{id}` | 场景 |
| `prop:{id}` | 道具 |
| `episode:{id}` | 集标题 |
| `drama:header` | 项目标题 |
| `sb:{id}` | 分镜 |
| `sbtxt:{id}` | 分镜文本摘要 |
| `sbuni:{id}` | 全能分镜词 |
| `sbimg:{id}` | 分镜图 |
| `sbimg-first:{id}` | 首帧图 |
| `sbimg-last:{id}` | 尾帧图 |
| `sbvid:{id}` | 分镜视频 |
| `sbaud:{id}:dialogue` | 对白音频 |

### 10.7 支持的画面比例

16:9（横屏）、9:16（竖屏）、1:1（方形）、3:4（竖版）、4:3

### 10.8 存储路径

```
data/storage/
├── images/        # 分镜生成的图片
├── characters/    # 角色图片
├── scenes/        # 场景图片
├── videos/        # 生成的视频片段
└── merged/        # 合成后的完整视频
```

### 10.9 服务端口

| 服务 | 端口 | 说明 |
|------|------|------|
| 后端 (Node.js) | 5679 | Express + SQLite |
| 前端 (Vite) | 3013 | 开发服务器，代理 /api 到 5679 |

### 10.10 数据库迁移

- **自动迁移：** 服务启动时 `migrate.js:ensureColumns()` 自动补列
- **手动迁移：** `cd backend-node && npm run migrate` 执行 `migrations/` 下 SQL

---

> 本汇编文档由 Claude (Cowork mode) 于 2026-07-25 自动生成，基于 LocalMiniDrama v1.2.8 仓库全部源文件整理。

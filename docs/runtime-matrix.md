# Runtime Matrix

## 环境变量清单

| 变量 | 必填 | 影响 | 未配置时表现 |
| --- | --- | --- | --- |
| `PORT` | 否 | Node 服务监听端口 | 默认 `4173` |
| `APP_BASE_URL` | 建议 | 用于 User-Agent、部署文档、自引用 | 默认 `http://localhost:4173` |
| `DEPLOY_TARGET` | 否 | 仅用于元信息和文档 | 默认 `railway` |
| `SOURCE_MODE` | 否 | `mock / hybrid`，决定是否访问真实数据源 | 默认 `hybrid` |
| `DATA_SOURCES` | 否 | 启用哪些 provider | 默认 `arxiv,openreview,openalex` |
| `CONTACT_EMAIL` | 建议 | 供论文源请求使用，尤其是公开 API 联系方式 | 留空也能运行，但不推荐上线留空 |
| `ARXIV_API_URL` | 否 | arXiv API 地址 | 使用官方默认地址 |
| `OPENALEX_API_URL` | 否 | OpenAlex API 地址 | 使用官方默认地址 |
| `OPENALEX_API_KEY` | 否 | 提高 OpenAlex 稳定性/配额 | 无 key 也能查，但更容易受限 |
| `OPENREVIEW_API_URL` | 否 | OpenReview API 地址 | 使用官方默认地址 |
| `DATABASE_URL` | 上线建议必填 | 启用 PostgreSQL 持久化 | 不落库，系统继续运行 |
| `DATABASE_SSL` | 否 | PostgreSQL SSL 开关 | 默认 `true` |
| `SUMMARY_PROVIDER` | 否 | `mock / openai` 等总结 provider | 默认 `mock` |
| `OPENAI_API_KEY` | 仅切 OpenAI 时必填 | 真实 AI 结构化总结 | 未提供时继续使用 mock summary |
| `OPENAI_MODEL` | 否 | OpenAI 总结模型 | 默认 `gpt-4.1-mini` |

## 典型降级表现

### 没有 `DATABASE_URL`

- 后端：`databaseEnabled=false`
- 搜索和详情仍能返回
- 结果不会持久化到 PostgreSQL
- 前端会显示“当前未配置数据库”

### 没有 `OPENALEX_API_KEY`

- OpenAlex 仍尝试请求公开接口
- 结果可能变慢、受限或不稳定
- 不会拖垮整个搜索；失败时其他源继续返回

### 没有 `OPENAI_API_KEY`

- 详情页继续返回结构化总结
- 但总结来自 mock summary provider
- 不会阻塞详情页

### OpenReview 返回 `403`

- 后端将该源标记为 `providerStatuses[].status = "error"`
- 搜索结果继续使用其他源
- 若 `SOURCE_MODE=hybrid` 且有效结果太少，会补充内置 curated 数据
- 前端会显示“部分数据源暂时不可用”

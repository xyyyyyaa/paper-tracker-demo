# Research Radar

Research Radar 是一个面向科研用户的论文追踪与阅读决策 MVP。当前版本已经包含前端页面和同源后端 API，默认使用多数据源聚合架构和内置 mock repository 打通完整闭环。

- 输入研究方向或关键词
- 查看最近 7 / 30 / 90 天的论文结果
- 使用综合排序或最新优先排序
- 浏览方向趋势摘要
- 查看单篇论文的结构化总结与阅读建议
- 体验空状态、加载状态和异常降级
- 通过 `/api/search` 和 `/api/papers/:id` 提供后端接口
- 通过多数据源聚合层模拟 `arXiv + OpenReview + OpenAlex + Semantic Scholar`

## 运行

```bash
npm install
```

```bash
npm start
```

如果只想先本地演示，不配置数据库也可以直接运行；只有在设置 `DATABASE_URL` 时才会启用 PostgreSQL 持久化。

## 环境变量

参考 [.env.example](/Users/zhangxiaoyu/Documents/Playground/.env.example)：

```bash
cp .env.example .env
```

关键变量：

- `SOURCE_MODE=hybrid`
- `DATA_SOURCES=arxiv,openreview,openalex`
- `DATABASE_URL=...`
- `OPENALEX_API_KEY=...`
- `OPENAI_API_KEY=...`

然后在浏览器打开 [http://localhost:4173](http://localhost:4173)。

## 后端结构

- `server.mjs`: Node 原生 HTTP 服务，同时提供静态文件和 API
- `config.mjs`: 运行环境配置
- `services/source-aggregator.mjs`: 多数据源聚合入口
- `providers/`: 真实论文源 provider
- `db/postgres-adapter.mjs`: PostgreSQL 持久化适配器
- `shared/search-engine.mjs`: 共享数据、排序逻辑、趋势摘要和详情聚合逻辑
- `docs/api.md`: API 说明
- `docs/runtime-matrix.md`: 环境变量与降级行为矩阵
- `docs/persistence-contract.md`: 写库契约与幂等策略
- `docs/acceptance-checklist.md`: 本地 / 数据库 / Railway 验收清单
- `docs/database-schema.sql`: 建议的数据库表结构
- `docs/deployment.md`: 上线建议和部署说明
- `railway.json`: Railway 部署配置

## API

- `GET /api/health`
- `GET /api/search?topic=RAG%20evaluation&range=30&sort=smart`
- `GET /api/papers/ragscore?topic=RAG%20evaluation&range=30&sort=smart`

## 演示说明

- 首页提供示例方向，可一键填充并进入结果页
- 结果页支持切换时间范围和排序方式
- 详情页中 `Failure Cases in Multimodal State Reconstruction Under Missing Sensors` 演示 AI 总结失败降级
- 在结果页输入包含 `error` 的主题可以触发数据源异常态，便于展示容错设计

## 你后续最可能需要确认的东西

- 把 mock provider 换成真实论文源抓取器
- 把缓存和搜索快照落到 PostgreSQL
- 把结构化总结改成真正的 LLM 异步生成流程

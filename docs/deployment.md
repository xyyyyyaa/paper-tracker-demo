# Deployment Notes

## 推荐默认方案

- 应用形态：单个 Node 服务，同时提供前端静态页面和后端 API
- 部署平台：Railway
- 数据库：PostgreSQL
- 第一批数据源：arXiv + OpenReview + OpenAlex
- AI 总结：后续接 OpenAI API，当前保留接口位

这个组合适合你说的目标：部署后给别人一个网址，别人可直接访问完整服务。

## 为什么这样选

- `Railway` 适合同一个 Node 服务直接上线，也能顺手挂 PostgreSQL
- `PostgreSQL` 比 SQLite 更适合多用户访问、后台任务和后续扩展
- 前后端同源部署，能减少 CORS、鉴权和环境变量拆分的复杂度
- 这版先不做过度拆分，保持一个可上线 MVP 服务

## 当前代码已经为上线准备的内容

- 多数据源开关：`.env` 中的 `DATA_SOURCES`
- 真实 provider 入口：[services/source-aggregator.mjs](/Users/zhangxiaoyu/Documents/Playground/services/source-aggregator.mjs)
- arXiv provider：[providers/arxiv-provider.mjs](/Users/zhangxiaoyu/Documents/Playground/providers/arxiv-provider.mjs)
- OpenReview provider：[providers/openreview-provider.mjs](/Users/zhangxiaoyu/Documents/Playground/providers/openreview-provider.mjs)
- OpenAlex provider：[providers/openalex-provider.mjs](/Users/zhangxiaoyu/Documents/Playground/providers/openalex-provider.mjs)
- 统一服务入口：[server.mjs](/Users/zhangxiaoyu/Documents/Playground/server.mjs)
- 数据库目标 schema：[docs/database-schema.sql](/Users/zhangxiaoyu/Documents/Playground/docs/database-schema.sql)
- PostgreSQL 适配器：[db/postgres-adapter.mjs](/Users/zhangxiaoyu/Documents/Playground/db/postgres-adapter.mjs)
- AI 配置入口：`.env.example` 中的 `SUMMARY_PROVIDER`、`OPENAI_API_KEY`
- Summary provider 抽象：[services/summary-provider.mjs](/Users/zhangxiaoyu/Documents/Playground/services/summary-provider.mjs)

## 真正上线前你还需要准备

- 一个 Railway 项目，或你偏好的 Render / Fly.io / 自己服务器
- 一个 PostgreSQL 实例
- OpenAlex API key
- OpenAI API key

## 我建议的下一步

1. 在 Railway 上配置 `DATABASE_URL`、`OPENALEX_API_KEY`、`CONTACT_EMAIL`
2. 跑一次 PostgreSQL schema migration
3. 给 AI 总结做异步任务，避免详情页同步等待
4. 增加最基础的限流和缓存，保证公开访问时不会被刷爆

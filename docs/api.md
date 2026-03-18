# Research Radar API

MVP 后端以同源 API 形式提供检索、详情和健康检查接口。默认由 [server.mjs](/Users/zhangxiaoyu/Documents/Playground/server.mjs) 提供服务。

## Base URL

`http://localhost:4173`

## Endpoints

### `GET /api/health`

用于本地联调或部署探活。

示例响应：

```json
{
  "service": "research-radar-api",
  "status": "ok",
  "date": "2026-03-17",
  "deployTarget": "railway",
  "enabledSources": ["arxiv", "openreview", "openalex"],
  "sourceMode": "hybrid",
  "summaryProvider": "mock",
  "effectiveSummaryProvider": "mock",
  "databaseConfigured": false,
  "databaseEnabled": false
}
```

### `GET /api/search`

按主题检索论文列表，并返回趋势摘要。

查询参数：

- `topic`: 必填，2 到 100 个字符
- `range`: 可选，`7 | 30 | 90`，默认 `30`
- `sort`: 可选，`smart | latest`，默认 `smart`

示例请求：

```http
GET /api/search?topic=RAG%20evaluation&range=30&sort=smart
```

示例响应：

```json
{
  "query": {
    "topic": "RAG evaluation",
    "range": 30,
    "sort": "smart",
    "count": 4
  },
  "digest": {
    "topic": "RAG evaluation",
    "dateRange": 30,
    "paperCount": 4,
    "keyTopics": ["Rag Evaluation", "Benchmark", "Faithfulness"],
    "topPapers": [],
    "suggestedReadingOrder": ["ragscore", "survey-rag", "ragtrace"],
    "summaryText": "..."
  },
  "papers": []
  "meta": {
    "enabledSources": ["arxiv", "openreview", "openalex"],
    "sourceMode": "hybrid",
    "providerStatuses": [],
    "database": {
      "enabled": false,
      "reason": "DATABASE_URL is not set"
    }
  }
}
```

错误返回：

- `400 INVALID_TOPIC`
- `502 DATA_SOURCE_FAILURE`
- `500 INTERNAL_ERROR`

### `GET /api/papers/:id`

获取单篇论文详情和结构化总结。

查询参数：

- `topic`: 可选，用于重新计算与当前方向的相关性
- `range`: 可选，`7 | 30 | 90`，默认 `30`
- `sort`: 可选，`smart | latest`，默认 `smart`

示例请求：

```http
GET /api/papers/ragscore?topic=RAG%20evaluation&range=30&sort=smart
```

示例响应：

```json
{
  "query": {
    "topic": "RAG evaluation",
    "range": 30,
    "sort": "smart"
  },
  "meta": {
    "enabledSources": ["arxiv", "openreview", "openalex"],
    "sourceMode": "hybrid"
  },
  "paper": {
    "id": "ragscore",
    "title": "RAGScore: ...",
    "summary": {
      "problem": "...",
      "method": "...",
      "recommendation": "精读"
    },
    "readPriority": "高优先",
    "relevanceLabel": "高相关"
  }
}
```

错误返回：

- `404 PAPER_NOT_FOUND`
- `500 INTERNAL_ERROR`

## 这版的实现假设

- 数据源优先走 `arXiv + OpenReview + OpenAlex`
- 当真实源失败且 `SOURCE_MODE=hybrid` 时，自动回退到 mock repository
- 排序逻辑为可解释规则，不依赖向量库
- 详情接口直接内联结构化总结，不额外拆出单独 summary endpoint
- PostgreSQL 通过 `DATABASE_URL` 注入，未配置时不阻塞本地运行
- 结构化总结通过 summary provider 抽象输出，当前默认 mock，后续可切 OpenAI

## 你后续最可能要确认的事项

- Railway 环境变量与 PostgreSQL 实例是否已经创建
- OpenAlex API key 是否准备好
- AI 总结是否切到 OpenAI 异步生成

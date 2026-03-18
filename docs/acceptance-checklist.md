# Acceptance Checklist

## 1. 本地验收

### 1.1 安装依赖

命令：

```bash
npm install
```

通过标准：

- 成功安装依赖
- `npm ls pg --depth=0` 能看到 `pg`

### 1.2 复制环境变量

命令：

```bash
cp .env.example .env
```

通过标准：

- `.env` 存在
- 即使 `DATABASE_URL` 为空也可运行

### 1.3 启动服务

命令：

```bash
npm start
```

通过标准：

- 控制台输出 `Research Radar server listening on http://localhost:4173`

### 1.4 健康检查

命令：

```bash
curl -s http://localhost:4173/api/health
```

通过标准：

- 返回 JSON
- `status = "ok"`

### 1.5 搜索接口

命令：

```bash
curl -s "http://localhost:4173/api/search?topic=RAG%20evaluation&range=30&sort=smart"
```

通过标准：

- 返回 `query / digest / papers / meta`
- 单个 provider 失败时，整体接口仍返回 `200`

### 1.6 详情接口

命令：

```bash
curl -s "http://localhost:4173/api/papers/arxiv%3A2603.03541v1?topic=RAG%20evaluation&range=30&sort=smart"
```

通过标准：

- 返回 `paper.summary`
- 即使没有 `OPENAI_API_KEY` 也有 mock summary

### 1.7 前端页面

操作：

- 浏览器打开 `http://localhost:4173`
- 搜索 `RAG evaluation`

通过标准：

- 页面能展示结果
- 如果数据源部分失败，页面会出现降级提示

## 2. 数据库验收

前提：

- 已配置 `DATABASE_URL`

### 2.1 执行 migration

命令：

```bash
npm run migrate
```

通过标准：

- 输出 `Applied migration 001_init.sql` 或直接 `Migrations complete`

### 2.2 migration 幂等

命令：

```bash
npm run migrate
```

通过标准：

- 再次执行不报错
- 不重复建表

### 2.3 搜索写库

命令：

```bash
curl -s "http://localhost:4173/api/search?topic=RAG%20evaluation&range=30&sort=smart" > /tmp/research-radar-search.json
```

通过标准：

- 接口返回 `200`
- `papers`、`search_snapshots`、`search_snapshot_papers` 有数据

### 2.4 详情写库

命令：

```bash
curl -s "http://localhost:4173/api/papers/arxiv%3A2603.03541v1?topic=RAG%20evaluation&range=30&sort=smart" > /tmp/research-radar-detail.json
```

通过标准：

- `paper_summaries` 中能看到对应记录

## 3. Railway 验收

### 3.1 部署成功

通过标准：

- Railway 构建成功
- 部署日志中能看到 `npm start`

### 3.2 健康检查成功

通过标准：

- Railway healthcheck 命中 `/api/health`
- 服务状态 Healthy

### 3.3 Railway 搜索接口

命令：

```bash
curl -s "https://YOUR_DOMAIN/api/search?topic=RAG%20evaluation&range=30&sort=smart"
```

通过标准：

- 返回 `200`
- `meta.providerStatuses` 存在

### 3.4 Railway 页面验收

操作：

- 打开 Railway 域名首页
- 发起一次搜索
- 打开任意详情页

通过标准：

- 首页、结果页、详情页都能正常访问
- 没有白屏

## 4. 接口验收

### 4.1 参数校验

命令：

```bash
curl -s "http://localhost:4173/api/search?topic=a"
```

通过标准：

- 返回 `400`
- `error.code = "INVALID_TOPIC"`

### 4.2 单个源失败不拖垮整体

通过标准：

- `meta.providerStatuses` 中可以出现某个源 `error`
- 但只要还有其他源或 hybrid 补齐，整体接口仍返回结果

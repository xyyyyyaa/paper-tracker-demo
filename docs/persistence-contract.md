# Persistence Contract

## 哪些接口会写库

### `GET /api/search`

写入：

- `papers`
- `paper_authors`
- `paper_keywords`
- `paper_relevance_topics`
- `paper_summaries`（当 summary 已存在时）
- `search_snapshots`
- `search_snapshot_papers`

### `GET /api/papers/:id`

写入：

- `papers`
- `paper_authors`
- `paper_keywords`
- `paper_relevance_topics`
- `paper_summaries`

## 主键与唯一键设计

### `papers`

- 主键：`id`
- 唯一键：`(source, source_paper_id)`，仅当 `source_paper_id IS NOT NULL`

说明：

- `id` 是应用内部主键，例如 `arxiv:2603.03541v1`
- `(source, source_paper_id)` 防止同一源的同一论文被重复写入

### `paper_authors`

- 主键：`(paper_id, author_order)`

### `paper_keywords`

- 主键：`(paper_id, keyword)`

### `paper_relevance_topics`

- 主键：`(paper_id, topic_text)`

### `paper_summaries`

- 主键：`paper_id`

### `search_snapshots`

- 主键：`id`
- 当前快照 id 由 `sha1(topic:range:sort)` 生成

### `search_snapshot_papers`

- 主键：`(snapshot_id, paper_id)`

## 幂等性设计

- `papers` 使用 `INSERT ... ON CONFLICT (id) DO UPDATE`
- `paper_summaries` 使用 `INSERT ... ON CONFLICT (paper_id) DO UPDATE`
- `search_snapshots` 使用 `INSERT ... ON CONFLICT (id) DO UPDATE`
- 关联表在每次写入前先按 `paper_id` 或 `snapshot_id` 删除再重建

这意味着：

- 同一篇论文重复抓取不会产生重复记录
- 同一次 query 重跑会更新同一条 snapshot，而不是无限插新行
- 重复写入是幂等的，结果以最新写入为准

## 当前限制

- 目前未实现按 provider 原始更新时间增量抓取
- 目前 snapshot 主键只按 `topic + range + sort` 计算，不保留每次查询历史版本
- 如果你后续想保留完整查询历史，需要把 snapshot id 改成 UUID，并额外加可选去重键

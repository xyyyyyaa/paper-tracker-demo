CREATE TABLE IF NOT EXISTS schema_migrations (
  version TEXT PRIMARY KEY,
  applied_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS topics (
  id TEXT PRIMARY KEY,
  query_text TEXT NOT NULL,
  normalized_query TEXT NOT NULL,
  default_range_days INTEGER NOT NULL DEFAULT 30,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS papers (
  id TEXT PRIMARY KEY,
  source TEXT NOT NULL,
  source_paper_id TEXT,
  title TEXT NOT NULL,
  abstract TEXT NOT NULL,
  url TEXT NOT NULL,
  published_at TIMESTAMP NOT NULL,
  paper_type TEXT NOT NULL,
  one_line_summary TEXT,
  external_ids_json JSONB NOT NULL DEFAULT '{}'::jsonb,
  matched_sources_json JSONB NOT NULL DEFAULT '[]'::jsonb,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE UNIQUE INDEX IF NOT EXISTS idx_papers_source_source_paper_id
  ON papers(source, source_paper_id)
  WHERE source_paper_id IS NOT NULL;

CREATE TABLE IF NOT EXISTS paper_authors (
  paper_id TEXT NOT NULL REFERENCES papers(id) ON DELETE CASCADE,
  author_order INTEGER NOT NULL,
  author_name TEXT NOT NULL,
  PRIMARY KEY (paper_id, author_order)
);

CREATE TABLE IF NOT EXISTS paper_keywords (
  paper_id TEXT NOT NULL REFERENCES papers(id) ON DELETE CASCADE,
  keyword TEXT NOT NULL,
  PRIMARY KEY (paper_id, keyword)
);

CREATE TABLE IF NOT EXISTS paper_relevance_topics (
  paper_id TEXT NOT NULL REFERENCES papers(id) ON DELETE CASCADE,
  topic_text TEXT NOT NULL,
  PRIMARY KEY (paper_id, topic_text)
);

CREATE TABLE IF NOT EXISTS paper_summaries (
  paper_id TEXT PRIMARY KEY REFERENCES papers(id) ON DELETE CASCADE,
  problem TEXT NOT NULL,
  method TEXT NOT NULL,
  contributions TEXT NOT NULL,
  differences TEXT NOT NULL,
  limitations TEXT NOT NULL,
  target_readers TEXT NOT NULL,
  recommendation TEXT NOT NULL,
  recommendation_reason TEXT NOT NULL,
  provider TEXT NOT NULL DEFAULT 'mock',
  generated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS search_snapshots (
  id TEXT PRIMARY KEY,
  topic_text TEXT NOT NULL,
  range_days INTEGER NOT NULL,
  sort_mode TEXT NOT NULL,
  paper_count INTEGER NOT NULL,
  digest_summary_text TEXT,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS search_snapshot_papers (
  snapshot_id TEXT NOT NULL REFERENCES search_snapshots(id) ON DELETE CASCADE,
  paper_id TEXT NOT NULL REFERENCES papers(id) ON DELETE CASCADE,
  position INTEGER NOT NULL,
  relevance_score REAL NOT NULL,
  recency_score REAL NOT NULL,
  total_score REAL NOT NULL,
  read_priority TEXT NOT NULL,
  PRIMARY KEY (snapshot_id, paper_id)
);

CREATE INDEX IF NOT EXISTS idx_papers_published_at ON papers(published_at DESC);
CREATE INDEX IF NOT EXISTS idx_papers_source ON papers(source);
CREATE INDEX IF NOT EXISTS idx_snapshot_topic_created_at ON search_snapshots(topic_text, created_at DESC);

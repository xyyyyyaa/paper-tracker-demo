export async function createPostgresAdapter(config) {
  if (!config.databaseUrl) {
    return createDisabledAdapter("DATABASE_URL is not set");
  }

  let pgModule;
  try {
    pgModule = await import("pg");
  } catch (error) {
    return createDisabledAdapter("PostgreSQL requested but the `pg` package is not installed");
  }

  const { Pool } = pgModule;
  const pool = new Pool({
    connectionString: config.databaseUrl,
    ssl: config.databaseSsl ? { rejectUnauthorized: false } : undefined
  });

  return {
    enabled: true,
    reason: "configured",
    pool,
    async healthcheck() {
      const result = await pool.query("select 1 as ok");
      return Boolean(result.rows[0]?.ok);
    },
    async savePapers(papers) {
      const client = await pool.connect();
      try {
        await client.query("BEGIN");

        for (const paper of papers) {
          await client.query(
            `
              INSERT INTO papers (
                id, source, source_paper_id, title, abstract, url, published_at, paper_type, one_line_summary, external_ids_json, matched_sources_json
              )
              VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10::jsonb,$11::jsonb)
              ON CONFLICT (id) DO UPDATE SET
                source = EXCLUDED.source,
                source_paper_id = EXCLUDED.source_paper_id,
                title = EXCLUDED.title,
                abstract = EXCLUDED.abstract,
                url = EXCLUDED.url,
                published_at = EXCLUDED.published_at,
                paper_type = EXCLUDED.paper_type,
                one_line_summary = EXCLUDED.one_line_summary,
                external_ids_json = EXCLUDED.external_ids_json,
                matched_sources_json = EXCLUDED.matched_sources_json,
                updated_at = CURRENT_TIMESTAMP
            `,
            [
              paper.id,
              paper.source,
              paper.externalIds?.arxivId || paper.externalIds?.openalexId || paper.externalIds?.openreviewId || null,
              paper.title,
              paper.abstract,
              paper.url,
              paper.publishedAt,
              paper.type,
              paper.oneLineSummary,
              JSON.stringify(paper.externalIds || {}),
              JSON.stringify(paper.matchedSources || [])
            ]
          );

          await client.query("DELETE FROM paper_authors WHERE paper_id = $1", [paper.id]);
          await client.query("DELETE FROM paper_keywords WHERE paper_id = $1", [paper.id]);
          await client.query("DELETE FROM paper_relevance_topics WHERE paper_id = $1", [paper.id]);

          for (const [index, author] of (paper.authors || []).entries()) {
            await client.query(
              "INSERT INTO paper_authors (paper_id, author_order, author_name) VALUES ($1, $2, $3)",
              [paper.id, index, author]
            );
          }

          for (const keyword of paper.keywords || []) {
            await client.query("INSERT INTO paper_keywords (paper_id, keyword) VALUES ($1, $2)", [paper.id, keyword]);
          }

          for (const topic of paper.relevanceTopics || []) {
            await client.query("INSERT INTO paper_relevance_topics (paper_id, topic_text) VALUES ($1, $2)", [paper.id, topic]);
          }

          if (paper.summary) {
            await client.query(
              `
                INSERT INTO paper_summaries (
                  paper_id, problem, method, contributions, differences, limitations, target_readers, recommendation, recommendation_reason, provider
                )
                VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10)
                ON CONFLICT (paper_id) DO UPDATE SET
                  problem = EXCLUDED.problem,
                  method = EXCLUDED.method,
                  contributions = EXCLUDED.contributions,
                  differences = EXCLUDED.differences,
                  limitations = EXCLUDED.limitations,
                  target_readers = EXCLUDED.target_readers,
                  recommendation = EXCLUDED.recommendation,
                  recommendation_reason = EXCLUDED.recommendation_reason,
                  provider = EXCLUDED.provider,
                  generated_at = CURRENT_TIMESTAMP
              `,
              [
                paper.id,
                paper.summary.problem,
                paper.summary.method,
                paper.summary.contributions,
                paper.summary.differences,
                paper.summary.limitations,
                paper.summary.targetReaders,
                paper.summary.recommendation,
                paper.summary.recommendationReason,
                paper.summary.provider || "mock"
              ]
            );
          }
        }

        await client.query("COMMIT");
      } catch (error) {
        await client.query("ROLLBACK");
        throw error;
      } finally {
        client.release();
      }
    },
    async saveSearchSnapshot({ snapshotId, topic, range, sort, digest, papers }) {
      const client = await pool.connect();
      try {
        await client.query("BEGIN");
        await client.query(
          `
            INSERT INTO search_snapshots (id, topic_text, range_days, sort_mode, paper_count, digest_summary_text)
            VALUES ($1, $2, $3, $4, $5, $6)
            ON CONFLICT (id) DO UPDATE SET
              topic_text = EXCLUDED.topic_text,
              range_days = EXCLUDED.range_days,
              sort_mode = EXCLUDED.sort_mode,
              paper_count = EXCLUDED.paper_count,
              digest_summary_text = EXCLUDED.digest_summary_text
          `,
          [snapshotId, topic, range, sort, papers.length, digest.summaryText]
        );

        await client.query("DELETE FROM search_snapshot_papers WHERE snapshot_id = $1", [snapshotId]);

        for (const [index, paper] of papers.entries()) {
          await client.query(
            `
              INSERT INTO search_snapshot_papers (
                snapshot_id, paper_id, position, relevance_score, recency_score, total_score, read_priority
              ) VALUES ($1,$2,$3,$4,$5,$6,$7)
            `,
            [snapshotId, paper.id, index, paper.relevanceScore, paper.recencyScore, paper.totalScore, paper.readPriority]
          );
        }

        await client.query("COMMIT");
      } catch (error) {
        await client.query("ROLLBACK");
        throw error;
      } finally {
        client.release();
      }
    },
    async close() {
      await pool.end();
    }
  };
}

function createDisabledAdapter(reason) {
  return {
    enabled: false,
    reason,
    async healthcheck() {
      return false;
    },
    async savePapers() {},
    async saveSearchSnapshot() {}
  };
}

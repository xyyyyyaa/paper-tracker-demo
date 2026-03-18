import { createServer } from "node:http";
import { readFile } from "node:fs/promises";
import crypto from "node:crypto";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { config } from "./config.mjs";
import { createPostgresAdapter } from "./db/postgres-adapter.mjs";
import { createSummaryService } from "./services/summary-provider.mjs";
import {
  buildSearchResponse,
  getPaperDetail,
  sanitizeRange,
  sanitizeSort
} from "./shared/search-engine.mjs";
import { collectPapersFromSources } from "./services/source-aggregator.mjs";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const port = config.port;
const database = await createPostgresAdapter(config);
const summaryService = createSummaryService(config);

const mimeTypes = {
  ".css": "text/css; charset=utf-8",
  ".html": "text/html; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".md": "text/markdown; charset=utf-8",
  ".mjs": "text/javascript; charset=utf-8",
  ".sql": "text/plain; charset=utf-8"
};

function sendJson(res, statusCode, payload) {
  const body = JSON.stringify(payload, null, 2);
  res.writeHead(statusCode, {
    "Content-Type": "application/json; charset=utf-8",
    "Content-Length": Buffer.byteLength(body)
  });
  res.end(body);
}

function sendText(res, statusCode, contentType, body) {
  res.writeHead(statusCode, {
    "Content-Type": contentType,
    "Content-Length": Buffer.byteLength(body)
  });
  res.end(body);
}

function validateTopic(topic) {
  const value = String(topic || "").trim();
  if (!value) {
    return "请输入研究方向或关键词";
  }
  if (value.length < 2) {
    return "关键词太短，请输入更具体的研究方向";
  }
  if (value.length > 100) {
    return "关键词过长，请缩短后重试";
  }
  return null;
}

async function serveStatic(pathname, res) {
  const requestedPath = pathname === "/" ? "/index.html" : pathname;
  const safePath = path.normalize(requestedPath).replace(/^(\.\.[/\\])+/, "");
  const absolutePath = path.resolve(__dirname, `.${safePath}`);

  if (!absolutePath.startsWith(__dirname)) {
    sendText(res, 403, "text/plain; charset=utf-8", "Forbidden");
    return;
  }

  try {
    const file = await readFile(absolutePath);
    const extension = path.extname(absolutePath).toLowerCase();
    sendText(res, 200, mimeTypes[extension] || "application/octet-stream", file);
  } catch (error) {
    if (error.code === "ENOENT" && !path.extname(absolutePath)) {
      const file = await readFile(path.join(__dirname, "index.html"));
      sendText(res, 200, mimeTypes[".html"], file);
      return;
    }
    sendText(res, 404, "text/plain; charset=utf-8", "Not found");
  }
}

function handleHealth(_, res) {
  sendJson(res, 200, {
    service: "research-radar-api",
    status: "ok",
    date: "2026-03-17",
    deployTarget: config.deployTarget,
    enabledSources: config.enabledSources,
    sourceMode: config.sourceMode,
    summaryProvider: config.summaryProvider,
    effectiveSummaryProvider: summaryService.effectiveProvider,
    databaseConfigured: Boolean(config.databaseUrl),
    databaseEnabled: database.enabled,
    databaseReason: database.reason
  });
}

async function handleSearch(requestUrl, res) {
  const topic = requestUrl.searchParams.get("topic") || "";
  const range = sanitizeRange(requestUrl.searchParams.get("range"));
  const sort = sanitizeSort(requestUrl.searchParams.get("sort"));
  const validationError = validateTopic(topic);

  if (validationError) {
    sendJson(res, 400, {
      error: {
        code: "INVALID_TOPIC",
        message: validationError
      }
    });
    return;
  }

  try {
    const aggregated = await collectPapersFromSources(config, { topic, range, limit: 16 });
    const response = buildSearchResponse(topic, range, sort, aggregated.papers);
    const snapshotId = crypto
      .createHash("sha1")
      .update(`${topic}:${range}:${sort}`)
      .digest("hex");

    await database.savePapers(aggregated.papers);
    await database.saveSearchSnapshot({
      snapshotId,
      topic,
      range,
      sort,
      digest: response.digest,
      papers: response.papers
    });

    response.meta = {
      enabledSources: aggregated.enabledSources,
      totalFetchedEntries: aggregated.totalFetchedEntries,
      dedupedPaperCount: aggregated.papers.length,
      deployTarget: config.deployTarget,
      sourceMode: aggregated.sourceMode,
      supplementedWithMock: aggregated.supplementedWithMock,
      providerStatuses: aggregated.providerStatuses,
      database: {
        enabled: database.enabled,
        reason: database.reason
      }
    };
    sendJson(res, 200, response);
  } catch (error) {
    const statusCode = error.message === "Simulated source failure" ? 502 : 500;
    sendJson(res, statusCode, {
      error: {
        code: statusCode === 502 ? "DATA_SOURCE_FAILURE" : "INTERNAL_ERROR",
        message: statusCode === 502 ? "论文数据加载失败" : "服务器处理请求时出现异常"
      }
    });
  }
}

async function handlePaperDetail(requestUrl, res) {
  const id = decodeURIComponent(requestUrl.pathname.replace("/api/papers/", ""));
  const topic = requestUrl.searchParams.get("topic") || "";
  const range = sanitizeRange(requestUrl.searchParams.get("range"));
  const sort = sanitizeSort(requestUrl.searchParams.get("sort"));

  try {
    const aggregated = await collectPapersFromSources(config, { topic, range, limit: 16 });
    const paper = getPaperDetail(id, topic, range, sort, aggregated.papers);
    if (!paper) {
      sendJson(res, 404, {
        error: {
          code: "PAPER_NOT_FOUND",
          message: "没有找到这篇论文"
        }
      });
      return;
    }

    if (!paper.summary) {
      paper.summary = await summaryService.summarizePaper(paper, topic);
    }

    await database.savePapers(aggregated.papers);

    sendJson(res, 200, {
      query: {
        topic,
        range,
        sort
      },
      meta: {
        enabledSources: aggregated.enabledSources,
        deployTarget: config.deployTarget,
        sourceMode: aggregated.sourceMode,
        supplementedWithMock: aggregated.supplementedWithMock,
        summaryProvider: summaryService.effectiveProvider,
        providerStatuses: aggregated.providerStatuses,
        database: {
          enabled: database.enabled,
          reason: database.reason
        }
      },
      paper
    });
  } catch (error) {
    sendJson(res, 500, {
      error: {
        code: "INTERNAL_ERROR",
        message: "服务器处理详情请求时出现异常"
      }
    });
  }
}

const server = createServer(async (req, res) => {
  const requestUrl = new URL(req.url || "/", `http://${req.headers.host || "localhost"}`);

  if (!["GET", "HEAD"].includes(req.method || "GET")) {
    sendJson(res, 405, {
      error: {
        code: "METHOD_NOT_ALLOWED",
        message: "仅支持 GET / HEAD 请求"
      }
    });
    return;
  }

  if (requestUrl.pathname === "/api/health") {
    handleHealth(requestUrl, res);
    return;
  }

  if (requestUrl.pathname === "/api/search") {
    await handleSearch(requestUrl, res);
    return;
  }

  if (requestUrl.pathname.startsWith("/api/papers/")) {
    await handlePaperDetail(requestUrl, res);
    return;
  }

  await serveStatic(requestUrl.pathname, res);
});

server.listen(port, () => {
  console.log(`Research Radar server listening on http://localhost:${port}`);
});

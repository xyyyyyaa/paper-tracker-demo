import {
  buildTrendDigest,
  formatDate,
  getDaysLabel,
  getPaperDetail as getFallbackPaperDetail,
  sanitizeRange,
  sanitizeSort,
  searchPapers as fallbackSearchPapers,
  sortResults
} from "./shared/search-engine.mjs";

const appRoot = document.querySelector("#app");
const HOME_PREVIEW_STORAGE_KEY = "research-radar:last-search";
const previewTickerMessages = [
  "正在滚动查找相关论文…",
  "匹配标题与摘要中的研究主题…",
  "提取近 30 天新增与优先阅读建议…",
  "组织统一详情框架与代表性预览…"
];
let homePreviewTicker = 0;

const state = {
  topic: "",
  range: 30,
  sort: "smart"
};

let activeResultsRequest = 0;
let activeDetailRequest = 0;

function setRoute(hash) {
  window.location.hash = hash;
}

function parseHash() {
  const raw = window.location.hash || "#home";
  const [routePart, queryString] = raw.slice(1).split("?");
  const params = new URLSearchParams(queryString || "");
  return {
    route: routePart || "home",
    params
  };
}

function escapeHtml(value) {
  return String(value ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}

function createStateCard(title, body, actions = "") {
  return `
    <div class="state-card">
      <h2>${escapeHtml(title)}</h2>
      <p class="state-copy">${escapeHtml(body)}</p>
      ${actions ? `<div class="state-actions">${actions}</div>` : ""}
    </div>
  `;
}

function composeBackendNotice(meta, fallbackMessage = "") {
  const notices = [];
  if (fallbackMessage) {
    notices.push(`API 不可用，当前展示本地回退数据：${fallbackMessage}`);
  }

  if (!meta) {
    return notices;
  }

  if (meta.supplementedWithMock) {
    notices.push("部分实时数据源返回不足，当前结果已自动补充内置演示数据。");
  }

  const failedProviders = (meta.providerStatuses || []).filter((item) => item.status === "error");
  if (failedProviders.length > 0) {
    notices.push(`部分数据源暂时不可用：${failedProviders.map((item) => item.name).join("、")}。系统已自动降级。`);
  }

  if (meta.database?.enabled === false) {
    notices.push("当前未配置数据库，搜索和详情结果不会持久化到 PostgreSQL。");
  }

  if (meta.summaryProvider === "mock") {
    notices.push("当前结构化总结由 mock provider 生成，后续可切换到真实 OpenAI 总结。");
  }

  return notices;
}

function createSkeleton(label) {
  return `
    <div class="skeleton-card">
      <p class="state-copy">${escapeHtml(label)}</p>
      <div class="skeleton-bar long"></div>
      <div class="skeleton-bar medium"></div>
      <div class="skeleton-bar short"></div>
    </div>
  `;
}

function buildApiUrl(path, params = {}) {
  const url = new URL(path, window.location.origin);
  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== "") {
      url.searchParams.set(key, String(value));
    }
  });
  return url;
}

function readStoredHomeSearch() {
  try {
    const raw = window.localStorage.getItem(HOME_PREVIEW_STORAGE_KEY);
    if (!raw) {
      return null;
    }
    const parsed = JSON.parse(raw);
    if (!parsed?.topic) {
      return null;
    }
    return {
      topic: String(parsed.topic),
      range: sanitizeRange(parsed.range),
      sort: sanitizeSort(parsed.sort)
    };
  } catch {
    return null;
  }
}

function writeStoredHomeSearch(topic, range, sort = "smart") {
  try {
    window.localStorage.setItem(
      HOME_PREVIEW_STORAGE_KEY,
      JSON.stringify({
        topic,
        range: sanitizeRange(range),
        sort: sanitizeSort(sort)
      })
    );
  } catch {}
}

async function fetchJson(path, params = {}) {
  const response = await fetch(buildApiUrl(path, params));
  const payload = await response.json().catch(() => null);
  if (!response.ok) {
    throw new Error(payload?.error?.message || `Request failed with ${response.status}`);
  }
  return payload;
}

async function loadSearchData(topic, range, sort) {
  try {
    return await fetchJson("/api/search", { topic, range, sort });
  } catch (error) {
    const papers = sortResults(fallbackSearchPapers(topic, range), sort);
    return {
      query: {
        topic,
        range,
        sort,
        count: papers.length,
        source: "fallback"
      },
      digest: buildTrendDigest(topic, range, papers),
      papers,
      fallbackMessage: error.message
    };
  }
}

async function loadPaperData(id, topic, range, sort) {
  try {
    return await fetchJson(`/api/papers/${encodeURIComponent(id)}`, { topic, range, sort });
  } catch (error) {
    const paper = getFallbackPaperDetail(id, topic, range, sort);
    if (!paper) {
      throw error;
    }
    return {
      query: {
        topic,
        range,
        sort,
        source: "fallback"
      },
      paper,
      fallbackMessage: error.message
    };
  }
}

function renderGuide() {
  const template = document.querySelector("#guide-template");
  appRoot.replaceChildren(template.content.cloneNode(true));
}

function renderHome() {
  const template = document.querySelector("#home-template");
  appRoot.replaceChildren(template.content.cloneNode(true));

  const form = document.querySelector("#search-form");
  const input = document.querySelector("#topic-input");
  const rangeSelect = document.querySelector("#time-range");
  const errorNode = document.querySelector("#form-error");
  const submitButton = document.querySelector("#search-submit");
  const previewTopic = document.querySelector("#preview-topic");
  const previewRangeLabel = document.querySelector("#preview-range-label");
  const previewPaperCount = document.querySelector("#preview-paper-count");
  const previewReadingCount = document.querySelector("#preview-reading-count");
  const previewFrameworkCount = document.querySelector("#preview-framework-count");
  const previewHeading = document.querySelector("#preview-heading");
  const previewPriority = document.querySelector("#preview-priority");
  const previewStack = document.querySelector("#preview-stack");
  const previewScanText = document.querySelector("#preview-scan-text");
  const previewModeLabel = document.querySelector("#preview-mode-label");
  const previewMoreButton = document.querySelector("#preview-more-button");
  const storedSearch = readStoredHomeSearch();
  const initialPreview = storedSearch || { topic: "RAG evaluation", range: 30, sort: "smart" };

  if (storedSearch) {
    input.value = storedSearch.topic;
    rangeSelect.value = String(storedSearch.range);
  }

  window.clearInterval(homePreviewTicker);
  let currentMoreRoute = `#results?topic=${encodeURIComponent(initialPreview.topic)}&range=${encodeURIComponent(initialPreview.range)}&sort=smart`;

  function setPreviewScanMode(mode, message = "") {
    window.clearInterval(homePreviewTicker);

    if (mode === "searching") {
      let previewTickerIndex = 0;
      previewScanText.textContent = previewTickerMessages[previewTickerIndex];
      homePreviewTicker = window.setInterval(() => {
        previewTickerIndex = (previewTickerIndex + 1) % previewTickerMessages.length;
        previewScanText.textContent = previewTickerMessages[previewTickerIndex];
      }, 1400);
      return;
    }

    previewScanText.textContent = message;
  }

  function renderPreviewCards(topic, range, papers) {
    if (papers.length === 0) {
      previewStack.innerHTML = `
        <div class="preview-card subdued">
          <div class="preview-copy">
            <strong>暂时没有足够相关的预览结果</strong>
            <p>试试更通用的关键词，或扩大时间范围到最近 90 天。</p>
          </div>
        </div>
      `;
      currentMoreRoute = `#results?topic=${encodeURIComponent(topic)}&range=${encodeURIComponent(range)}&sort=smart`;
      previewMoreButton.disabled = false;
      return;
    }

    previewStack.innerHTML = papers
      .map((paper) => {
        const recommendation = paper.summary?.recommendation || (paper.readPriority === "高优先" ? "精读" : "快速浏览");
        return `
          <div class="preview-card">
            <div class="preview-copy">
              <strong>${escapeHtml(paper.title)}</strong>
              <p>${escapeHtml(paper.oneLineSummary)}</p>
            </div>
            <div class="preview-card-footer">
              <div class="tag-row">
                <span class="tag ${paper.readPriority === "高优先" ? "priority-high" : "priority-medium"}">${escapeHtml(recommendation)}</span>
                <span class="tag ${paper.relevanceLabel === "高相关" ? "relevance-high" : "relevance-medium"}">${escapeHtml(paper.relevanceLabel)}</span>
              </div>
            </div>
          </div>
        `;
      })
      .join("");

    currentMoreRoute = `#results?topic=${encodeURIComponent(topic)}&range=${encodeURIComponent(range)}&sort=smart`;
    previewMoreButton.disabled = false;
  }

  async function runHomePreviewSearch({ topic, range, modeLabel, searching }) {
    previewTopic.textContent = topic;
    previewRangeLabel.textContent = getDaysLabel(range);
    previewHeading.textContent = topic;
    previewModeLabel.textContent = modeLabel;
    previewMoreButton.disabled = true;

    if (searching) {
      setPreviewScanMode("searching");
      previewStack.innerHTML = `
        <div class="preview-card subdued">
          <div class="preview-copy">
            <strong>正在组织这个方向的代表性预览</strong>
            <p>会提取近 30 天新增、优先阅读建议和统一详情框架。</p>
          </div>
        </div>
      `;
    }

    const payload = await loadSearchData(topic, range, "smart");
    const papers = payload.papers.slice(0, 1);
    previewPaperCount.textContent = String(payload.digest.paperCount || 0);
    previewReadingCount.textContent = String(Math.min(3, payload.digest.topPapers?.length || payload.papers.length));
    previewFrameworkCount.textContent = "6";
    previewPriority.textContent =
      payload.digest.paperCount >= 3 ? "高优先方向" : payload.digest.paperCount >= 1 ? "可追踪方向" : "建议改写关键词";

    if (searching) {
      setPreviewScanMode("idle", `已完成本次追踪，右侧显示 ${getDaysLabel(range)} 的预演结果。`);
    } else if (storedSearch) {
      setPreviewScanMode("idle", "当前显示上一次搜索结果。点击左侧“开始追踪”可更新。");
    } else {
      setPreviewScanMode("idle", "当前显示示例结果。点击左侧“开始追踪”后更新。");
    }

    renderPreviewCards(topic, range, papers);
  }

  document.querySelectorAll("[data-example]").forEach((button) => {
    button.addEventListener("click", () => {
      input.value = button.dataset.example || "";
      errorNode.textContent = "";
      input.focus();
    });
  });

  previewMoreButton.addEventListener("click", () => {
    setRoute(currentMoreRoute);
  });

  runHomePreviewSearch({
    topic: initialPreview.topic,
    range: initialPreview.range,
    modeLabel: storedSearch ? "上次搜索" : "示例状态",
    searching: false
  });

  form.addEventListener("submit", (event) => {
    event.preventDefault();
    const topic = input.value.trim();

    if (!topic) {
      errorNode.textContent = "请输入研究方向或关键词";
      return;
    }

    if (topic.length < 2) {
      errorNode.textContent = "关键词太短，请输入更具体的研究方向";
      return;
    }

    errorNode.textContent = "";
    submitButton.textContent = "正在追踪…";
    submitButton.disabled = true;
    const range = Number(rangeSelect.value || 30);
    writeStoredHomeSearch(topic, range, "smart");

    runHomePreviewSearch({
      topic,
      range,
      modeLabel: "本次追踪",
      searching: true
    })
      .catch(() => {
        setPreviewScanMode("idle", "这次追踪未返回足够结果，请尝试调整关键词。");
      })
      .finally(() => {
        submitButton.textContent = "开始追踪";
        submitButton.disabled = false;
      });
  });
}

function createQueryHeader(topic, range, count, notices = []) {
  return `
    <p class="section-kicker">Results overview</p>
    <h1 class="query-title">${escapeHtml(topic)} 的近期论文进展</h1>
    <p class="query-subline">基于 ${escapeHtml(getDaysLabel(range))} 的相关论文结果，共找到 ${count} 篇相关论文。</p>
    ${notices.map((item) => `<p class="query-subline">${escapeHtml(item)}</p>`).join("")}
    <div class="query-actions">
      <button class="ghost-button" id="back-home">返回首页</button>
      <button class="ghost-button" id="run-example">试试这个方向</button>
    </div>
  `;
}

function createTrendCard(digest) {
  return `
    <div class="trend-grid">
      <div class="trend-metric">
        <p class="trend-metric-label">方向速览</p>
        <strong>${digest.paperCount}</strong>
        <p class="state-copy">${escapeHtml(getDaysLabel(digest.dateRange))} 新增相关论文</p>
      </div>
      <div>
        <p class="section-kicker">近期关注焦点</p>
        <div class="trend-tags">
          ${digest.keyTopics.map((topic) => `<span class="tag">${escapeHtml(topic)}</span>`).join("")}
        </div>
        <p class="section-kicker" style="margin-top: 20px;">建议优先关注</p>
        <ol class="trend-top-list">
          ${digest.topPapers.map((paper) => `<li>${escapeHtml(paper.title)}</li>`).join("")}
        </ol>
        <p class="section-kicker" style="margin-top: 20px;">趋势总结</p>
        <p class="trend-summary">${escapeHtml(digest.summaryText)}</p>
      </div>
    </div>
  `;
}

function createPaperCard(paper, topic, range, sort) {
  const detailHref = `#detail?id=${encodeURIComponent(paper.id)}&topic=${encodeURIComponent(topic)}&range=${encodeURIComponent(range)}&sort=${encodeURIComponent(sort)}`;
  const scoreText = `相关性 ${paper.relevanceScore} · 新近度 ${paper.recencyScore}`;
  const typeClass = `type-${paper.type.toLowerCase()}`;
  const priorityClass =
    paper.readPriority === "高优先"
      ? "priority-high"
      : paper.readPriority === "中优先"
        ? "priority-medium"
        : "priority-low";
  const relevanceClass =
    paper.relevanceLabel === "高相关"
      ? "relevance-high"
      : paper.relevanceLabel === "一般相关"
        ? "relevance-medium"
        : "relevance-low";

  return `
    <article class="paper-card">
      <div>
        <h3>${escapeHtml(paper.title)}</h3>
        <div class="paper-meta">
          <span>${escapeHtml(paper.authors.slice(0, 3).join(", "))}${paper.authors.length > 3 ? " et al." : ""}</span>
          <span>${escapeHtml(paper.source)}</span>
          <span>Published on ${escapeHtml(formatDate(paper.publishedAt))}</span>
        </div>
      </div>
      <p class="paper-summary">${escapeHtml(paper.oneLineSummary)}</p>
      <div class="tag-row">
        <span class="tag ${priorityClass}">${escapeHtml(paper.readPriority)}</span>
        <span class="tag ${relevanceClass}">${escapeHtml(paper.relevanceLabel)}</span>
        <span class="tag ${typeClass}">${escapeHtml(paper.type)}</span>
      </div>
      <div class="paper-footer">
        <span class="paper-score">${escapeHtml(scoreText)}</span>
        <a class="paper-action" href="${detailHref}">查看详情</a>
      </div>
    </article>
  `;
}

function bindResultsControls(topic) {
  document.querySelector("#back-home")?.addEventListener("click", () => setRoute("#home"));
  document.querySelector("#run-example")?.addEventListener("click", () =>
    setRoute(`#results?topic=${encodeURIComponent("AI agent safety")}&range=30&sort=smart`)
  );

  const sortSelect = document.querySelector("#sort-select");
  const rangeSelect = document.querySelector("#range-select");

  sortSelect.value = state.sort;
  rangeSelect.value = String(state.range);

  sortSelect.addEventListener("change", () => {
    setRoute(
      `#results?topic=${encodeURIComponent(topic)}&range=${encodeURIComponent(state.range)}&sort=${encodeURIComponent(sortSelect.value)}`
    );
  });

  rangeSelect.addEventListener("change", () => {
    setRoute(
      `#results?topic=${encodeURIComponent(topic)}&range=${encodeURIComponent(rangeSelect.value)}&sort=${encodeURIComponent(state.sort)}`
    );
  });
}

async function renderResults(topic, range, sort) {
  const template = document.querySelector("#results-template");
  appRoot.replaceChildren(template.content.cloneNode(true));

  const requestId = ++activeResultsRequest;
  const normalizedRange = sanitizeRange(range);
  const normalizedSort = sanitizeSort(sort);
  const headerNode = document.querySelector("#query-header");
  const stateNode = document.querySelector("#results-state");
  const contentNode = document.querySelector("#results-content");
  const trendNode = document.querySelector("#trend-card");
  const toolbarCount = document.querySelector("#toolbar-count");
  const paperGrid = document.querySelector("#paper-grid");

  headerNode.innerHTML = createQueryHeader(topic, normalizedRange, 0);
  stateNode.innerHTML = createSkeleton("正在整理这个方向的最新论文…");

  await new Promise((resolve) => window.setTimeout(resolve, 300));
  if (requestId !== activeResultsRequest) {
    return;
  }

  try {
    const payload = await loadSearchData(topic, normalizedRange, normalizedSort);
    if (requestId !== activeResultsRequest) {
      return;
    }

    state.topic = topic;
    state.range = payload.query.range;
    state.sort = payload.query.sort;

    headerNode.innerHTML = createQueryHeader(
      topic,
      payload.query.range,
      payload.query.count,
      composeBackendNotice(payload.meta, payload.fallbackMessage)
    );
    bindResultsControls(topic);

    if (payload.papers.length === 0) {
      stateNode.innerHTML = createStateCard(
        "暂时没有找到足够相关的论文",
        "试试更通用的关键词，或扩大时间范围。",
        `<button class="ghost-button" id="empty-retry">重新搜索</button>`
      );
      document.querySelector("#empty-retry")?.addEventListener("click", () => setRoute("#home"));
      contentNode.hidden = true;
      return;
    }

    trendNode.innerHTML = createTrendCard(payload.digest);
    toolbarCount.textContent = `显示 ${payload.papers.length} 条结果`;
    paperGrid.innerHTML = payload.papers
      .map((paper) => createPaperCard(paper, topic, payload.query.range, payload.query.sort))
      .join("");

    stateNode.innerHTML = "";
    contentNode.hidden = false;
  } catch (error) {
    headerNode.innerHTML = createQueryHeader(topic, normalizedRange, 0);
    bindResultsControls(topic);
    stateNode.innerHTML = createStateCard(
      "论文数据加载失败",
      `${error.message || "请稍后重试，或更换关键词再试。"} 输入包含 error 时会触发演示异常态。`,
      `<button class="ghost-button" id="reload-button">重新加载</button>`
    );
    document.querySelector("#reload-button")?.addEventListener("click", () =>
      setRoute(`#results?topic=${encodeURIComponent(topic)}&range=${encodeURIComponent(normalizedRange)}&sort=${encodeURIComponent(normalizedSort)}`)
    );
    contentNode.hidden = true;
  }
}

function createDetailHero(paper) {
  return `
    <p class="section-kicker">${escapeHtml(paper.source)}</p>
    <h1 class="detail-title">${escapeHtml(paper.title)}</h1>
    <div class="detail-meta" style="margin-top: 18px;">
      <span class="detail-chip">${escapeHtml(paper.authors.join(", "))}</span>
      <span class="detail-chip">${escapeHtml(formatDate(paper.publishedAt))}</span>
      <span class="detail-chip">${escapeHtml(paper.type)}</span>
      <span class="detail-chip">${escapeHtml(paper.readPriority)}</span>
    </div>
    <p class="detail-subtitle">${escapeHtml(paper.oneLineSummary)}</p>
  `;
}

function getActionAdvice(recommendation) {
  if (recommendation === "精读") {
    return "建议精读";
  }
  if (recommendation === "快速浏览") {
    return "适合快速浏览";
  }
  return "暂不优先";
}

function getActionReason(recommendation) {
  if (recommendation === "精读") {
    return "先看方法设计、实验设置和相关工作，再决定是否延伸阅读引用链。";
  }
  if (recommendation === "快速浏览") {
    return "优先看问题定义和核心结果，用于判断是否值得放入后续阅读队列。";
  }
  return "与当前主题关联较弱，可作为补充材料保留。";
}

function createRecommendationPanel(paper, notices = []) {
  const recommendation = paper.summary?.recommendation || "快速浏览";
  const reason =
    paper.summary?.recommendationReason ||
    "结构化总结暂时不可用，你仍然可以先查看摘要和原文，再决定是否深入阅读。";

  return `
    <p class="section-kicker">阅读建议</p>
    ${notices.map((item) => `<p class="query-subline">${escapeHtml(item)}</p>`).join("")}
    <div class="recommendation-grid">
      <div class="key-value">
        <span class="state-copy">推荐结论</span>
        <strong>${escapeHtml(recommendation)}</strong>
        <p>${escapeHtml(reason)}</p>
      </div>
      <div class="key-value">
        <span class="state-copy">相关性</span>
        <strong>${escapeHtml(paper.relevanceLabel)}</strong>
        <p>与当前方向的语义匹配度和时间新近度综合计算。</p>
      </div>
      <div class="key-value">
        <span class="state-copy">建议怎么读</span>
        <strong>${escapeHtml(getActionAdvice(recommendation))}</strong>
        <p>${escapeHtml(getActionReason(recommendation))}</p>
      </div>
    </div>
  `;
}

function createSummaryPanel(paper) {
  if (!paper.summary) {
    return `
      <p class="section-kicker">AI 结构化总结</p>
      ${createStateCard(
        "结构化总结暂时生成失败",
        "你仍然可以先查看摘要和原文，我们稍后会重试生成。"
      )}
    `;
  }

  const items = [
    ["这篇论文在解决什么问题？", paper.summary.problem],
    ["它的方法大致是什么？", paper.summary.method],
    ["核心创新点有哪些？", paper.summary.contributions],
    ["与已有工作的主要差异是什么？", paper.summary.differences],
    ["有哪些局限或使用风险？", paper.summary.limitations],
    ["适合哪些人阅读？", paper.summary.targetReaders]
  ];

  return `
    <p class="section-kicker">AI 结构化总结</p>
    ${items
      .map(
        ([title, body]) => `
          <section class="summary-item">
            <h3>${escapeHtml(title)}</h3>
            <p>${escapeHtml(body)}</p>
          </section>
        `
      )
      .join("")}
  `;
}

function createAbstractPanel(paper) {
  return `
    <p class="section-kicker">Abstract</p>
    <h3>论文基础信息</h3>
    <div class="summary-item">
      <h3>作者</h3>
      <p>${escapeHtml(paper.authors.join(", "))}</p>
    </div>
    <div class="summary-item">
      <h3>来源与时间</h3>
      <p>${escapeHtml(paper.source)} · ${escapeHtml(formatDate(paper.publishedAt))}</p>
    </div>
    <div class="summary-item">
      <h3>原始摘要</h3>
      <p class="abstract-copy">${escapeHtml(paper.abstract)}</p>
    </div>
  `;
}

async function renderDetail(id, topic, range, sort) {
  const template = document.querySelector("#detail-template");
  appRoot.replaceChildren(template.content.cloneNode(true));

  const requestId = ++activeDetailRequest;
  const normalizedRange = sanitizeRange(range);
  const normalizedSort = sanitizeSort(sort);
  const backButton = document.querySelector("#back-to-results");
  const stateNode = document.querySelector("#detail-state");
  const contentNode = document.querySelector("#detail-content");
  const linkNode = document.querySelector("#paper-link");

  stateNode.innerHTML = createSkeleton("正在生成这篇论文的结构化总结…");
  backButton.addEventListener("click", () =>
    setRoute(`#results?topic=${encodeURIComponent(topic)}&range=${encodeURIComponent(normalizedRange)}&sort=${encodeURIComponent(normalizedSort)}`)
  );

  await new Promise((resolve) => window.setTimeout(resolve, 280));
  if (requestId !== activeDetailRequest) {
    return;
  }

  try {
    const payload = await loadPaperData(id, topic, normalizedRange, normalizedSort);
    if (requestId !== activeDetailRequest) {
      return;
    }

    document.querySelector("#detail-hero").innerHTML = createDetailHero(payload.paper);
    document.querySelector("#recommendation-panel").innerHTML = createRecommendationPanel(
      payload.paper,
      composeBackendNotice(payload.meta, payload.fallbackMessage)
    );
    document.querySelector("#summary-panel").innerHTML = createSummaryPanel(payload.paper);
    document.querySelector("#abstract-panel").innerHTML = createAbstractPanel(payload.paper);
    linkNode.href = payload.paper.url;

    stateNode.innerHTML = "";
    contentNode.hidden = false;
  } catch (error) {
    stateNode.innerHTML = createStateCard(
      "没有找到这篇论文",
      error.message || "结果可能已失效，请返回结果页重新选择。",
      `<button class="ghost-button" id="detail-back-home">返回首页</button>`
    );
    document.querySelector("#detail-back-home")?.addEventListener("click", () => setRoute("#home"));
  }
}

function renderRoute() {
  const { route, params } = parseHash();

  document.querySelectorAll("[data-route-home]").forEach((button) => {
    button.onclick = () => setRoute("#home");
  });

  if (route === "results") {
    const topic = params.get("topic") || "";
    const range = sanitizeRange(params.get("range"));
    const sort = sanitizeSort(params.get("sort"));
    if (!topic) {
      setRoute("#home");
      return;
    }
    renderResults(topic, range, sort);
    return;
  }

  if (route === "detail") {
    const id = params.get("id");
    const topic = params.get("topic") || state.topic;
    const range = sanitizeRange(params.get("range") || state.range);
    const sort = sanitizeSort(params.get("sort") || state.sort);
    if (!id) {
      setRoute("#home");
      return;
    }
    renderDetail(id, topic, range, sort);
    return;
  }

  if (route === "guide") {
    renderGuide();
    return;
  }

  renderHome();
}

window.addEventListener("hashchange", renderRoute);
window.addEventListener("DOMContentLoaded", () => {
  if (!window.location.hash) {
    window.location.hash = "#home";
  }
  renderRoute();
});

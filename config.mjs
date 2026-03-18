function splitCsv(value, fallback) {
  const items = String(value || "")
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean);
  return items.length > 0 ? items : fallback;
}

export const config = {
  port: Number(process.env.PORT || 4173),
  appBaseUrl: process.env.APP_BASE_URL || "http://localhost:4173",
  deployTarget: process.env.DEPLOY_TARGET || "railway",
  databaseUrl: process.env.DATABASE_URL || "",
  databaseSsl: String(process.env.DATABASE_SSL || "true") === "true",
  summaryProvider: process.env.SUMMARY_PROVIDER || "mock",
  openAiApiKey: process.env.OPENAI_API_KEY || "",
  openAiModel: process.env.OPENAI_MODEL || "gpt-4.1-mini",
  enabledSources: splitCsv(process.env.DATA_SOURCES, ["arxiv", "openreview", "openalex"]),
  sourceMode: process.env.SOURCE_MODE || "hybrid",
  contactEmail: process.env.CONTACT_EMAIL || "",
  arxivApiUrl: process.env.ARXIV_API_URL || "https://export.arxiv.org/api/query",
  openAlexApiUrl: process.env.OPENALEX_API_URL || "https://api.openalex.org/works",
  openAlexApiKey: process.env.OPENALEX_API_KEY || "",
  openReviewApiUrl: process.env.OPENREVIEW_API_URL || "https://api2.openreview.net"
};

import { fetchJson } from "../lib/http-client.mjs";
import { buildOneLineSummary, normalizeOpenReviewField, normalizePaperType } from "../lib/paper-normalizers.mjs";

function normalizeOpenReviewNote(note, topic) {
  const title = normalizeOpenReviewField(note.content?.title);
  const abstract = normalizeOpenReviewField(note.content?.abstract);
  const authors = normalizeOpenReviewField(note.content?.authors)
    .split(/\s*,\s*/)
    .map((name) => name.trim())
    .filter(Boolean)
    .slice(0, 8);
  const keywords = normalizeOpenReviewField(note.content?.keywords)
    .split(/\s*,\s*/)
    .map((keyword) => keyword.trim())
    .filter(Boolean);
  const venue = normalizeOpenReviewField(note.content?.venue) || normalizeOpenReviewField(note.content?.venueid);
  const creationDate = note.cdate || note.tcdate || note.tmdate || Date.now();
  const noteDate = new Date(creationDate).toISOString().slice(0, 10);

  return {
    id: `openreview:${note.id}`,
    title,
    authors,
    source: venue || "OpenReview",
    publishedAt: noteDate,
    url: `https://openreview.net/forum?id=${note.forum || note.id}`,
    abstract,
    keywords: [...new Set(keywords)].slice(0, 12),
    type: normalizePaperType("submission", "Submission"),
    oneLineSummary: buildOneLineSummary(abstract, title),
    relevanceTopics: [...new Set(keywords)].slice(0, 6),
    summary: null,
    externalIds: {
      openreviewId: note.id,
      forumId: note.forum || note.id
    },
    fetchedFrom: "openreview",
    matchedSources: ["openreview"]
  };
}

export async function fetchOpenReviewPapers({ topic, config, limit = 12 }) {
  const url = new URL("/notes/search", config.openReviewApiUrl);
  url.searchParams.set("term", topic);
  url.searchParams.set("content", "all");
  url.searchParams.set("source", "forum");
  url.searchParams.set("sort", "tmdate:desc");
  url.searchParams.set("limit", String(Math.min(limit, 20)));
  url.searchParams.set("offset", "0");

  const payload = await fetchJson(url, { config });
  const notes = payload.notes || payload.results || [];
  return notes.map((note) => normalizeOpenReviewNote(note, topic)).filter((paper) => paper.title);
}

export const openreviewProvider = {
  name: "openreview",
  async search(context) {
    return fetchOpenReviewPapers(context);
  },
  docs: "https://docs.openreview.net/reference/api-v2/openapi-definition"
};

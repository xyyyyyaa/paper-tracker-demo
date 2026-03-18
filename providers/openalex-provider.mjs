import { fetchJson } from "../lib/http-client.mjs";
import { buildOneLineSummary, getRangeDates, normalizePaperType } from "../lib/paper-normalizers.mjs";

function reconstructAbstract(abstractInvertedIndex) {
  if (!abstractInvertedIndex || typeof abstractInvertedIndex !== "object") {
    return "";
  }

  const orderedWords = [];
  Object.entries(abstractInvertedIndex).forEach(([word, positions]) => {
    positions.forEach((position) => {
      orderedWords[position] = word;
    });
  });
  return orderedWords.filter(Boolean).join(" ");
}

function normalizeOpenAlexWork(work, topic) {
  const abstract = reconstructAbstract(work.abstract_inverted_index);
  const authors = (work.authorships || [])
    .map((entry) => entry?.author?.display_name)
    .filter(Boolean)
    .slice(0, 8);
  const topics = (work.topics || []).map((entry) => entry?.display_name).filter(Boolean);
  const concepts = (work.concepts || []).map((entry) => entry?.display_name).filter(Boolean);
  const doi = work.doi ? String(work.doi).replace(/^https?:\/\/doi.org\//i, "") : "";

  return {
    id: `openalex:${String(work.id || "").split("/").pop()}`,
    title: work.display_name,
    authors,
    source: work.primary_location?.source?.display_name || "OpenAlex",
    publishedAt: work.publication_date || `${work.publication_year}-01-01`,
    url: work.primary_location?.landing_page_url || work.primary_location?.pdf_url || work.id,
    abstract,
    keywords: [...new Set([...topics, ...concepts])].slice(0, 12),
    type: normalizePaperType(work.type, "Method"),
    oneLineSummary: buildOneLineSummary(abstract, work.display_name),
    relevanceTopics: [...new Set([...(topics || []), ...(concepts || [])])].slice(0, 6),
    summary: null,
    externalIds: {
      doi,
      openalexId: work.id
    },
    fetchedFrom: "openalex",
    matchedSources: ["openalex"]
  };
}

export async function fetchOpenAlexPapers({ topic, range, config, limit = 12 }) {
  const { startDate, endDate } = getRangeDates(range);
  const url = new URL(config.openAlexApiUrl);

  url.searchParams.set("search", topic);
  url.searchParams.set("filter", `from_publication_date:${startDate},to_publication_date:${endDate}`);
  url.searchParams.set("sort", "publication_date:desc");
  url.searchParams.set("per-page", String(Math.min(limit, 25)));
  url.searchParams.set(
    "select",
    "id,doi,display_name,publication_date,publication_year,authorships,abstract_inverted_index,primary_location,type,topics,concepts"
  );

  if (config.openAlexApiKey) {
    url.searchParams.set("api_key", config.openAlexApiKey);
  }

  const payload = await fetchJson(url, { config });
  return (payload.results || []).map((work) => normalizeOpenAlexWork(work, topic));
}

export const openalexProvider = {
  name: "openalex",
  async search(context) {
    return fetchOpenAlexPapers(context);
  },
  docs: "https://docs.openalex.org/api-entities/works/search-works"
};

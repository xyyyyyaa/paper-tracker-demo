import { fetchText } from "../lib/http-client.mjs";
import { buildOneLineSummary, getRangeDates, normalizePaperType } from "../lib/paper-normalizers.mjs";

const ARXIV_XML_NS = "http://www.w3.org/2005/Atom";

function decodeXml(text) {
  return String(text || "")
    .replace(/<!\[CDATA\[([\s\S]*?)\]\]>/g, "$1")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&amp;/g, "&")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'");
}

function extractTagValue(xml, tagName) {
  const match = xml.match(new RegExp(`<${tagName}[^>]*>([\\s\\S]*?)</${tagName}>`, "i"));
  return decodeXml(match?.[1] || "").replace(/\s+/g, " ").trim();
}

function extractAllTagValues(xml, tagName) {
  return [...xml.matchAll(new RegExp(`<${tagName}[^>]*>([\\s\\S]*?)</${tagName}>`, "gi"))].map((match) =>
    decodeXml(match[1]).replace(/\s+/g, " ").trim()
  );
}

function extractCategoryTerms(xml) {
  return [...xml.matchAll(/<category[^>]*term="([^"]+)"[^>]*\/?>/gi)].map((match) => decodeXml(match[1]).trim());
}

function extractPdfUrl(xml) {
  const pdfMatch = xml.match(/<link[^>]*title="pdf"[^>]*href="([^"]+)"[^>]*\/?>/i);
  return pdfMatch?.[1] || "";
}

function parseArxivEntries(feedText, topic) {
  return [...feedText.matchAll(/<entry>([\s\S]*?)<\/entry>/gi)].map((match) => {
    const entryXml = match[1];
    const idUrl = extractTagValue(entryXml, "id");
    const arxivId = idUrl.split("/abs/").pop() || idUrl;
    const title = extractTagValue(entryXml, "title");
    const abstract = extractTagValue(entryXml, "summary");
    const publishedAt = extractTagValue(entryXml, "published") || extractTagValue(entryXml, "updated");
    const authors = extractAllTagValues(entryXml, "name");
    const categories = extractCategoryTerms(entryXml);
    const pdfUrl = extractPdfUrl(entryXml);

    return {
      id: `arxiv:${arxivId}`,
      title,
      authors,
      source: "arXiv",
      publishedAt: publishedAt.slice(0, 10),
      url: pdfUrl || idUrl,
      abstract,
      keywords: [...new Set(categories)].slice(0, 10),
      type: normalizePaperType("preprint"),
      oneLineSummary: buildOneLineSummary(abstract, title),
      relevanceTopics: [...new Set(categories)].slice(0, 6),
      summary: null,
      externalIds: {
        arxivId
      },
      fetchedFrom: "arxiv",
      matchedSources: ["arxiv"]
    };
  });
}

export async function fetchArxivPapers({ topic, range, config, limit = 12 }) {
  const { startDate, endDate } = getRangeDates(range);
  const searchQuery = `all:"${topic}" AND submittedDate:[${startDate.replaceAll("-", "")}0000 TO ${endDate.replaceAll("-", "")}2359]`;
  const url = new URL(config.arxivApiUrl);
  url.searchParams.set("search_query", searchQuery);
  url.searchParams.set("start", "0");
  url.searchParams.set("max_results", String(Math.min(limit, 20)));
  url.searchParams.set("sortBy", "submittedDate");
  url.searchParams.set("sortOrder", "descending");

  const feedText = await fetchText(url, { config });
  return parseArxivEntries(feedText, topic);
}

export const arxivProvider = {
  name: "arxiv",
  async search(context) {
    return fetchArxivPapers(context);
  },
  docs: "https://info.arxiv.org/help/api/user-manual.html"
};

function truncate(text, maxLength = 180) {
  if (!text) {
    return "";
  }

  const cleaned = text.replace(/\s+/g, " ").trim();
  if (cleaned.length <= maxLength) {
    return cleaned;
  }
  return `${cleaned.slice(0, maxLength - 1).trim()}…`;
}

export function getRangeDates(rangeDays, now = new Date()) {
  const end = new Date(now);
  const start = new Date(now);
  start.setUTCDate(start.getUTCDate() - rangeDays);

  return {
    startDate: start.toISOString().slice(0, 10),
    endDate: end.toISOString().slice(0, 10)
  };
}

export function buildOneLineSummary(abstract, title) {
  if (abstract) {
    const sentence = abstract
      .replace(/\s+/g, " ")
      .trim()
      .split(/(?<=[.!?])\s+/)[0];
    return truncate(sentence || abstract, 140);
  }

  return truncate(title, 120);
}

export function normalizePaperType(type, fallback = "Paper") {
  const raw = String(type || "").toLowerCase();
  if (raw.includes("survey") || raw.includes("review")) {
    return "Survey";
  }
  if (raw.includes("benchmark")) {
    return "Benchmark";
  }
  if (raw.includes("dataset")) {
    return "Dataset";
  }
  if (raw.includes("submission")) {
    return "Submission";
  }
  if (raw.includes("article") || raw.includes("preprint") || raw.includes("journal")) {
    return "Method";
  }
  return fallback;
}

export function normalizeTopicTokens(topic) {
  return String(topic || "")
    .toLowerCase()
    .split(/[^a-z0-9\u4e00-\u9fff]+/i)
    .map((token) => token.trim())
    .filter(Boolean)
    .slice(0, 8);
}

export function stablePaperKey(paper) {
  const doi = paper.externalIds?.doi?.toLowerCase();
  if (doi) {
    return `doi:${doi}`;
  }

  return `title:${paper.title.toLowerCase().replace(/[^a-z0-9\u4e00-\u9fff]+/gi, " ").trim()}`;
}

export function mergePaperRecords(basePaper, incomingPaper) {
  return {
    ...basePaper,
    ...incomingPaper,
    abstract:
      incomingPaper.abstract && incomingPaper.abstract.length > (basePaper.abstract || "").length
        ? incomingPaper.abstract
        : basePaper.abstract,
    url: basePaper.url || incomingPaper.url,
    authors: basePaper.authors?.length ? basePaper.authors : incomingPaper.authors,
    keywords: [...new Set([...(basePaper.keywords || []), ...(incomingPaper.keywords || [])])].slice(0, 12),
    relevanceTopics: [...new Set([...(basePaper.relevanceTopics || []), ...(incomingPaper.relevanceTopics || [])])].slice(0, 8),
    matchedSources: [...new Set([...(basePaper.matchedSources || []), ...(incomingPaper.matchedSources || [])])],
    oneLineSummary:
      basePaper.oneLineSummary && basePaper.oneLineSummary.length >= (incomingPaper.oneLineSummary || "").length
        ? basePaper.oneLineSummary
        : incomingPaper.oneLineSummary,
    externalIds: {
      ...(basePaper.externalIds || {}),
      ...(incomingPaper.externalIds || {})
    }
  };
}

export function normalizeOpenReviewField(fieldValue) {
  if (fieldValue === null || fieldValue === undefined) {
    return "";
  }

  if (Array.isArray(fieldValue)) {
    return fieldValue
      .map((item) => normalizeOpenReviewField(item))
      .filter(Boolean)
      .join(", ");
  }

  if (typeof fieldValue === "object") {
    if ("value" in fieldValue) {
      return normalizeOpenReviewField(fieldValue.value);
    }
    return "";
  }

  return String(fieldValue);
}

import { mockPapers } from "../shared/search-engine.mjs";
import { mergePaperRecords, stablePaperKey } from "../lib/paper-normalizers.mjs";
import { arxivProvider } from "../providers/arxiv-provider.mjs";
import { openalexProvider } from "../providers/openalex-provider.mjs";
import { openreviewProvider } from "../providers/openreview-provider.mjs";

const providerRegistry = {
  arxiv: arxivProvider,
  openalex: openalexProvider,
  openreview: openreviewProvider
};

function dedupePapers(papers) {
  const deduped = new Map();

  papers.forEach((paper) => {
    const key = stablePaperKey(paper);
    const existing = deduped.get(key);
    if (!existing) {
      deduped.set(key, paper);
      return;
    }
    deduped.set(key, mergePaperRecords(existing, paper));
  });

  return [...deduped.values()];
}

function createMockPayload(enabledSources) {
  return {
    enabledSources,
    sourceMode: "mock",
    totalFetchedEntries: mockPapers.length,
    papers: mockPapers.map((paper) => ({
      ...paper,
      fetchedFrom: "mock",
      matchedSources: ["mock"]
    })),
    providerStatuses: enabledSources.map((name) => ({
      name,
      status: "mock",
      count: mockPapers.length,
      error: null
      }))
  };
}

function createMockEntries() {
  return mockPapers.map((paper) => ({
    ...paper,
    fetchedFrom: "mock",
    matchedSources: ["mock"]
  }));
}

export async function collectPapersFromSources(config, { topic, range, limit = 12 }) {
  const enabledProviders = config.enabledSources.map((name) => providerRegistry[name]).filter(Boolean);

  if (config.sourceMode === "mock") {
    return createMockPayload(config.enabledSources);
  }

  const providerStatuses = [];
  const fetchedEntries = [];

  await Promise.all(
    enabledProviders.map(async (provider) => {
      try {
        const papers = await provider.search({
          topic,
          range,
          config,
          limit
        });
        providerStatuses.push({
          name: provider.name,
          status: "ok",
          count: papers.length,
          error: null,
          docs: provider.docs
        });
        fetchedEntries.push(...papers);
      } catch (error) {
        providerStatuses.push({
          name: provider.name,
          status: "error",
          count: 0,
          error: error.message,
          docs: provider.docs
        });
      }
    })
  );

  const dedupedPapers = dedupePapers(fetchedEntries);
  const shouldSupplementWithMock =
    config.sourceMode === "hybrid" && (dedupedPapers.length < 3 || providerStatuses.every((item) => item.status === "error"));

  if (shouldSupplementWithMock) {
    const supplementedPapers = dedupePapers([...dedupedPapers, ...createMockEntries()]);
    return {
      enabledSources: enabledProviders.map((provider) => provider.name),
      sourceMode: config.sourceMode,
      totalFetchedEntries: fetchedEntries.length,
      papers: supplementedPapers,
      providerStatuses,
      supplementedWithMock: true
    };
  }

  return {
    enabledSources: enabledProviders.map((provider) => provider.name),
    sourceMode: config.sourceMode,
    totalFetchedEntries: fetchedEntries.length,
    papers: dedupedPapers,
    providerStatuses,
    supplementedWithMock: false
  };
}

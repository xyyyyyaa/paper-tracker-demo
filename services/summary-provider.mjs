function firstSentence(text) {
  return String(text || "")
    .replace(/\s+/g, " ")
    .trim()
    .split(/(?<=[.!?])\s+/)[0];
}

function summarizeType(type) {
  if (type === "Benchmark") {
    return "这篇工作更偏 benchmark / evaluation 基座，适合用来建立方向坐标。";
  }
  if (type === "Survey") {
    return "这篇工作更偏综述，适合快速补齐方向地图和术语框架。";
  }
  if (type === "Dataset") {
    return "这篇工作更偏数据资源建设，适合看数据设定和评测协议。";
  }
  return "这篇工作更偏方法或系统诊断，适合结合实验和应用场景阅读。";
}

function createMockSummary(paper, topic) {
  const abstractSentence = firstSentence(paper.abstract);
  const highRelevance = paper.relevanceLabel === "高相关";

  return {
    problem: abstractSentence || `这篇论文围绕 ${topic || "当前主题"} 讨论了一个具体问题。`,
    method: summarizeType(paper.type),
    contributions: `论文标题和摘要显示，它重点覆盖了 ${topic || "该研究方向"} 中较新的问题设定或评测视角。`,
    differences: "当前为 mock 结构化总结。后续接入 OpenAI 后，这里会替换为更细粒度的差异分析。",
    limitations: "由于还未接入真实 LLM 生成，这里的总结更像规则化提炼，不应替代原文判断。",
    targetReaders: highRelevance ? "已经在该方向做调研或实验设计的研究者。" : "想快速扫一眼相关工作边界的读者。",
    recommendation: highRelevance ? "精读" : "快速浏览",
    recommendationReason: highRelevance
      ? "与当前方向对齐度较高，建议先看问题定义、评测方式和实验结论。"
      : "有一定参考价值，但建议先确认它是否覆盖你的核心子问题。",
    provider: "mock"
  };
}

export function createSummaryService(config) {
  return {
    configuredProvider: config.summaryProvider,
    effectiveProvider: config.summaryProvider === "openai" && config.openAiApiKey ? "mock" : "mock",
    async summarizePaper(paper, topic) {
      return createMockSummary(paper, topic);
    }
  };
}

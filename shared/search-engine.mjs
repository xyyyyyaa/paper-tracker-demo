export const currentDate = new Date("2026-03-17T12:00:00");

export const mockPapers = [
  {
    id: "ragscore",
    title: "RAGScore: A Stress-Test Benchmark for Faithful Retrieval-Augmented Generation Evaluation",
    authors: ["Lena Park", "Arjun Rao", "Mina Chen", "Tobias Hart"],
    source: "arXiv",
    publishedAt: "2026-03-12",
    url: "https://arxiv.org/abs/2603.12001",
    abstract:
      "This paper proposes a benchmark for evaluating faithfulness, retrieval coverage, and attribution quality in retrieval-augmented generation systems across long-form QA settings.",
    keywords: ["rag evaluation", "retrieval augmented generation", "benchmark", "faithfulness", "evaluation"],
    type: "Benchmark",
    oneLineSummary: "针对 RAG 的忠实性、检索覆盖率和引用归因，提出了一套更接近真实使用场景的压力测试基准。",
    relevanceTopics: ["rag evaluation", "retrieval augmented generation", "llm evaluation"],
    summary: {
      problem: "现有 RAG 评测多聚焦最终答案质量，难以暴露检索覆盖不足和引用错配带来的系统性问题。",
      method: "作者构建分层评测集，并把答案质量、证据覆盖、引用归因拆成独立维度，再配合 stress-test 场景验证。",
      contributions: "提供更细粒度的 RAG 评测维度；引入可复现实验协议；揭示多个主流 pipeline 在长上下文下的失真模式。",
      differences: "相比只看 EM 或 Rouge 的基准，这篇工作强调证据链和引用正确性，更适合做系统诊断。",
      limitations: "数据集以英文问答为主，对多语言和高度专业领域的外推仍有限。",
      targetReaders: "做 RAG 系统评估、检索组件设计或想搭建内部 benchmark 的研究者和工程师。",
      recommendation: "精读",
      recommendationReason: "与你的方向高度相关，而且它是 benchmark 型工作，适合作为后续阅读的参照坐标。"
    }
  },
  {
    id: "ragtrace",
    title: "Trace Before You Trust: Diagnosing Retrieval Failures in Production RAG Pipelines",
    authors: ["Kevin Liu", "Yasmin Noor", "Sofia Vega"],
    source: "OpenReview",
    publishedAt: "2026-03-05",
    url: "https://openreview.net/forum?id=ragtrace26",
    abstract:
      "We study retrieval pipeline failures through tracing signals collected from live deployments and show how ranking drift and chunk fragmentation degrade answer faithfulness.",
    keywords: ["rag evaluation", "retrieval failure", "pipeline tracing", "production rag"],
    type: "Method",
    oneLineSummary: "从线上 tracing 信号出发定位 RAG 检索失败来源，重点分析 ranking drift 和 chunk fragmentation。",
    relevanceTopics: ["rag evaluation", "production rag", "agent retrieval"],
    summary: {
      problem: "很多 RAG 系统上线后效果波动，开发者难判断问题到底来自召回、重排还是切块策略。",
      method: "论文定义 tracing schema，记录每一步检索与生成信号，再训练轻量诊断器做根因定位。",
      contributions: "把线上观测数据纳入 RAG 评测；提供 failure taxonomy；给出可落地的诊断 dashboard 指标。",
      differences: "相比离线 benchmark，这篇更偏生产观测和工程诊断，对部署型团队更有参考价值。",
      limitations: "需要较完整的 tracing 数据，纯离线实验环境下复现门槛较高。",
      targetReaders: "正在把 RAG 系统推向生产、或关心系统调优与监控链路的团队。",
      recommendation: "快速浏览",
      recommendationReason: "与方向相关，但偏工程诊断视角；如果你重点做 benchmark 研究，可以次优先阅读。"
    }
  },
  {
    id: "survey-rag",
    title: "From Retrieval to Verification: A Survey of Evaluation Protocols for RAG Systems",
    authors: ["Helena Moss", "Jun Sato", "Ruihan Li"],
    source: "arXiv",
    publishedAt: "2026-02-26",
    url: "https://arxiv.org/abs/2602.26110",
    abstract:
      "We review evaluation settings for retrieval-augmented generation with emphasis on faithfulness, calibration, attribution, and interactive workflows.",
    keywords: ["rag evaluation", "survey", "verification", "faithfulness"],
    type: "Survey",
    oneLineSummary: "系统梳理 RAG 评测协议，从 faithful generation 到 verification workflow 给出结构化综述。",
    relevanceTopics: ["rag evaluation", "survey"],
    summary: {
      problem: "RAG 评测维度分散，术语和协议不统一，初学者很难建立完整地图。",
      method: "作者整理 100+ 篇工作，按任务设定、评测维度、数据形态和人工评审策略构建分类框架。",
      contributions: "给出领域地图；总结常用指标缺口；提出一套评测 protocol checklist。",
      differences: "它不是单一方法论文，而是帮助你快速建立方向全貌的入口。",
      limitations: "结论依赖整理时间窗口，新近的 agentic RAG 论文覆盖还不充分。",
      targetReaders: "刚进入 RAG evaluation、需要快速补全方向地图的人。",
      recommendation: "精读",
      recommendationReason: "如果你还在搭方向框架，这篇综述能显著降低后续阅读成本。"
    }
  },
  {
    id: "mm-si-foundation",
    title: "Foundation Priors for Multimodal System Identification",
    authors: ["Nora Weiss", "Shu Lin", "Aman Khatri"],
    source: "arXiv",
    publishedAt: "2026-03-10",
    url: "https://arxiv.org/abs/2603.10991",
    abstract:
      "We introduce a multimodal system identification framework that aligns visual observations, control signals, and textual context under a shared latent dynamics model.",
    keywords: ["multimodal system identification", "latent dynamics", "control", "vision-language"],
    type: "Method",
    oneLineSummary: "把视觉观测、控制信号和文本上下文映射到统一潜在动力学模型，用于多模态系统辨识。",
    relevanceTopics: ["multimodal system identification", "dynamics modeling", "control foundation models"],
    summary: {
      problem: "复杂系统存在多模态观测和非线性动态，传统 system identification 难以统一吸收图像、文本和控制序列。",
      method: "通过共享 latent dynamics 和 modality-specific encoders，把多模态输入对齐到可解释的状态转移空间。",
      contributions: "提出 multimodal identification 基础框架；在机器人和工业仿真数据上验证更强的样本效率。",
      differences: "相比只用时序或控制信号的工作，它显式利用视觉与文本先验做状态建模。",
      limitations: "模型较大，对标注和算力要求高；跨系统泛化还需要更多真实世界验证。",
      targetReaders: "做多模态动力学、机器人建模或 foundation model for control 的研究者。",
      recommendation: "精读",
      recommendationReason: "这是你示例方向下的核心方法论文，相关性和代表性都很高。"
    }
  },
  {
    id: "mm-si-benchmark",
    title: "MSI-Bench: Evaluating Robustness in Multimodal System Identification",
    authors: ["Felix Romero", "Yiwen Zhao", "Clara Diaz", "Priya Nair"],
    source: "OpenReview",
    publishedAt: "2026-02-19",
    url: "https://openreview.net/forum?id=msibench26",
    abstract:
      "MSI-Bench evaluates multimodal system identification under sensor dropout, asynchronous streams, and out-of-distribution control policies.",
    keywords: ["multimodal system identification", "benchmark", "robustness", "sensor dropout"],
    type: "Benchmark",
    oneLineSummary: "围绕传感器缺失、异步输入和 OOD 控制策略，提出多模态系统辨识鲁棒性 benchmark。",
    relevanceTopics: ["multimodal system identification", "benchmark", "robustness"],
    summary: {
      problem: "多模态 system identification 在理想数据下效果不错，但现实部署经常遭遇模态缺失和时序错位。",
      method: "构建包含多种噪声与缺失设定的数据集，并以统一协议评估模型稳定性。",
      contributions: "补足鲁棒性评测空白；提供可对比的 benchmark 设置；总结不同建模范式的失效模式。",
      differences: "更像评测基座，不是新模型本身，但对后续做方法论文很重要。",
      limitations: "重点关注仿真环境，真实传感器噪声分布仍待补充。",
      targetReaders: "需要设计实验协议、写 related work 或比较模型鲁棒性的研究者。",
      recommendation: "精读",
      recommendationReason: "benchmark 型论文适合作为方向坐标，也能帮你判断后续哪些方法实验更扎实。"
    }
  },
  {
    id: "agent-safety-audit",
    title: "Auditing Goal Drift in Long-Horizon AI Agents",
    authors: ["Elena Brooks", "Rahul Menon", "Xinyi Guo"],
    source: "arXiv",
    publishedAt: "2026-03-11",
    url: "https://arxiv.org/abs/2603.11445",
    abstract:
      "We study goal drift in long-horizon agents and propose audit traces that surface objective mismatch before harmful actions occur.",
    keywords: ["ai agent safety", "goal drift", "audit traces", "long-horizon agents"],
    type: "Method",
    oneLineSummary: "研究长时程 agent 的目标漂移问题，并用 audit traces 在风险动作前暴露目标错位。",
    relevanceTopics: ["ai agent safety", "goal drift", "agent auditing"],
    summary: {
      problem: "长时程 agent 在复杂任务中容易逐步偏离原始目标，但现有评估难以及早发现。",
      method: "作者定义 goal-drift probes，并在 agent 执行链路中插入 audit trace 来检测意图偏移。",
      contributions: "把目标漂移量化为可监测指标；提供审计数据集；展示若干可干预触发点。",
      differences: "相较只关注最终失败，这篇强调过程级审计与早期预警。",
      limitations: "审计成本较高，且当前实验环境还偏受控。",
      targetReaders: "关心 agent 安全评测、红队测试和运行时监控的研究者。",
      recommendation: "精读",
      recommendationReason: "方向匹配度高，而且它回答的是 agent safety 中一个具体且重要的问题。"
    }
  },
  {
    id: "agent-safety-policies",
    title: "Policy Shields for Tool-Using Agents in Open Environments",
    authors: ["Mateo Silva", "Jiawen Hou"],
    source: "arXiv",
    publishedAt: "2026-02-28",
    url: "https://arxiv.org/abs/2602.28202",
    abstract:
      "Policy Shields constrains tool-using agents with executable safety envelopes and improves task completion under adversarial prompts.",
    keywords: ["ai agent safety", "tool use", "safety envelopes", "policy shields"],
    type: "Method",
    oneLineSummary: "给工具型 agent 加上可执行的 safety envelope，在开放环境和对抗提示下提升安全性。",
    relevanceTopics: ["ai agent safety", "tool using agents", "policy control"],
    summary: {
      problem: "开放环境下的工具型 agent 面临 prompt injection 和危险操作链，靠 prompt 约束不够可靠。",
      method: "通过可执行 policy layer 约束 agent 的工具调用、权限边界和回滚策略。",
      contributions: "将安全边界从提示词前移到执行层；展示对抗场景下更稳定的任务完成率。",
      differences: "比 purely prompt-based guardrails 更工程化，强调 enforcement 而不是建议。",
      limitations: "需要精确定义操作边界，对快速变化的工具生态维护成本较高。",
      targetReaders: "做 agent runtime、安全执行框架和 tool sandbox 的研究者。",
      recommendation: "快速浏览",
      recommendationReason: "和 agent safety 相关，但偏系统实现，如果你更关注 evaluation 可次优先。"
    }
  },
  {
    id: "ts-llm-forecast",
    title: "Prompting Seasonal Structure: LLMs for Time Series Forecasting with Sparse Labels",
    authors: ["Iris Chen", "Marco Bell", "Tianyu He"],
    source: "arXiv",
    publishedAt: "2026-03-08",
    url: "https://arxiv.org/abs/2603.08177",
    abstract:
      "We explore whether language models can adapt to seasonal and irregular dynamics in time series forecasting under sparse supervision.",
    keywords: ["time series forecasting with llms", "seasonality", "sparse labels", "forecasting"],
    type: "Method",
    oneLineSummary: "针对稀疏标签时序预测，把 seasonal structure 显式编码进 prompt，提升 LLM 适配不规则动态的能力。",
    relevanceTopics: ["time series forecasting with llms", "llm forecasting"],
    summary: {
      problem: "LLM 做时序预测时容易忽略周期结构和稀疏监督下的动态变化。",
      method: "将周期模板、异常标记和简化统计特征拼接到 prompt，并结合轻量 adapter 学习。",
      contributions: "提出 seasonal prompting 策略；在多数据集上验证 sparse-label 场景下的优势。",
      differences: "与纯 tokenization 路线相比，它强调先把结构信息显式暴露给模型。",
      limitations: "对极长时序和实时场景支持有限，工程成本仍需评估。",
      targetReaders: "关注 LLM for time series、prompt-based forecasting 和低标注学习的研究者。",
      recommendation: "精读",
      recommendationReason: "高度贴合该方向，且方法思路明确，适合优先深入。"
    }
  },
  {
    id: "ts-llm-survey",
    title: "A Practical Survey of Time Series Forecasting with Large Language Models",
    authors: ["Rebecca Ong", "Haoran Xu"],
    source: "arXiv",
    publishedAt: "2026-02-18",
    url: "https://arxiv.org/abs/2602.18118",
    abstract:
      "This survey summarizes design patterns, tokenization strategies, and evaluation pitfalls for time series forecasting with LLMs.",
    keywords: ["time series forecasting with llms", "survey", "evaluation pitfalls"],
    type: "Survey",
    oneLineSummary: "汇总 LLM 时序预测的建模模式、tokenization 策略与常见评测误区。",
    relevanceTopics: ["time series forecasting with llms", "survey", "evaluation"],
    summary: {
      problem: "时序预测 with LLM 的研究路线非常分散，容易重复踩 tokenization 和评测设置的坑。",
      method: "作者从设计模式、数据表示、评测协议和 deployment 视角梳理当前工作。",
      contributions: "形成方向全景；指出常见实验偏差；给出 practical checklist。",
      differences: "偏综述和经验总结，适合建立地图和筛选后续必读论文。",
      limitations: "新近多模态时序工作覆盖不全。",
      targetReaders: "刚进入该方向或需要写综述、做实验设计的人。",
      recommendation: "精读",
      recommendationReason: "如果你需要先建立方向坐标，这篇综述非常合适。"
    }
  },
  {
    id: "rag-chinese",
    title: "Beyond English Corpora: Multilingual Evaluation for Retrieval-Augmented Generation",
    authors: ["Qiao Mei", "Aditi Singh", "Samuel Price"],
    source: "arXiv",
    publishedAt: "2026-01-29",
    url: "https://arxiv.org/abs/2601.29092",
    abstract:
      "We expand RAG evaluation to multilingual corpora and identify how retrieval quality interacts with answer calibration across languages.",
    keywords: ["rag evaluation", "multilingual", "retrieval quality", "calibration"],
    type: "Dataset",
    oneLineSummary: "把 RAG 评测扩展到多语言语料，重点分析检索质量与答案 calibration 的跨语言耦合。",
    relevanceTopics: ["rag evaluation", "multilingual evaluation"],
    summary: {
      problem: "当前 RAG 评测多集中在英文，跨语言检索和回答可信度缺乏系统分析。",
      method: "构建多语言检索问答数据集，并同时测量 retrieval quality、answer calibration 和 attribution。",
      contributions: "补齐多语言评测空白；揭示跨语言场景下常见误差模式。",
      differences: "相对通用 benchmark，它更强调语言迁移与 calibration 问题。",
      limitations: "语种覆盖仍集中在高资源语言。",
      targetReaders: "做 multilingual RAG 或关心 calibration 的研究者。",
      recommendation: "快速浏览",
      recommendationReason: "只有当你涉及多语言或 calibration 议题时，优先级会明显提升。"
    }
  },
  {
    id: "mm-si-failure",
    title: "Failure Cases in Multimodal State Reconstruction Under Missing Sensors",
    authors: ["Dmitri Volkov", "Sana Rahman"],
    source: "Workshop",
    publishedAt: "2026-03-01",
    url: "https://example.com/mm-si-failure",
    abstract:
      "We analyze failure modes of multimodal state reconstruction when sensor channels disappear or become delayed during inference.",
    keywords: ["multimodal system identification", "missing sensors", "failure analysis"],
    type: "Application",
    oneLineSummary: "分析多模态状态重建在传感器缺失和延迟条件下的失效模式，偏经验性观察。",
    relevanceTopics: ["multimodal system identification", "sensor robustness"],
    summary: null
  }
];

const allowedRanges = new Set([7, 30, 90]);
const querySynonyms = {
  rag: ["rag evaluation", "retrieval augmented generation", "retrieval", "verification"],
  evaluation: ["evaluation", "benchmark", "faithfulness", "verification"],
  multimodal: ["multimodal system identification", "vision-language", "dynamics"],
  system: ["system identification", "dynamics", "control"],
  identification: ["system identification", "dynamics", "state reconstruction"],
  safety: ["ai agent safety", "agent auditing", "goal drift"],
  agent: ["ai agent safety", "tool using agents", "agent"],
  time: ["time series forecasting with llms", "forecasting", "seasonality"],
  forecasting: ["time series forecasting with llms", "forecasting", "prediction"],
  llms: ["large language models", "llm forecasting", "rag evaluation"]
};

const queryPhraseSynonyms = {
  "检索增强生成评测": ["rag evaluation", "retrieval augmented generation", "benchmark", "faithfulness"],
  "多模态系统辨识": ["multimodal system identification", "dynamics modeling", "control foundation models"],
  "智能体安全": ["ai agent safety", "goal drift", "agent auditing", "policy control"],
  "时间序列预测": ["time series forecasting with llms", "forecasting", "seasonality"],
  "时间序列预测 llm": ["time series forecasting with llms", "llm forecasting", "seasonality"],
  "多语言 rag": ["rag evaluation", "multilingual evaluation", "calibration"]
};

export function sanitizeRange(range) {
  const parsed = Number(range);
  return allowedRanges.has(parsed) ? parsed : 30;
}

export function sanitizeSort(sort) {
  return sort === "latest" ? "latest" : "smart";
}

export function formatDate(dateString) {
  const formatter = new Intl.DateTimeFormat("zh-CN", {
    year: "numeric",
    month: "long",
    day: "numeric"
  });
  return formatter.format(new Date(dateString));
}

export function daysAgo(dateString) {
  const msPerDay = 1000 * 60 * 60 * 24;
  const diff = currentDate.getTime() - new Date(dateString).getTime();
  return Math.max(0, Math.round(diff / msPerDay));
}

export function normalizeText(value) {
  return String(value || "")
    .toLowerCase()
    .replace(/[^\p{L}\p{N}\s-]/gu, " ");
}

export function expandQuery(topic) {
  const normalizedTopic = normalizeText(topic).trim();
  const baseTokens = normalizedTopic.split(/\s+/).filter(Boolean);
  const expanded = new Set(baseTokens);
  const phraseSynonyms = queryPhraseSynonyms[normalizedTopic];

  if (phraseSynonyms) {
    phraseSynonyms.forEach((item) => expanded.add(item));
  }

  baseTokens.forEach((token) => {
    const synonyms = querySynonyms[token];
    if (synonyms) {
      synonyms.forEach((item) => expanded.add(item));
    }
  });

  expanded.add(normalizedTopic);
  return [...expanded];
}

export function computeRelevanceScore(topic, paper) {
  const expanded = expandQuery(topic);
  const haystack = normalizeText(
    [paper.title, paper.abstract, paper.oneLineSummary, ...paper.keywords, ...paper.relevanceTopics].join(" ")
  );
  const haystackTokens = new Set(haystack.split(/\s+/).filter(Boolean));

  function hasMatch(token) {
    if (!token) {
      return false;
    }

    if (token.includes(" ")) {
      return haystack.includes(token);
    }

    return haystackTokens.has(token);
  }

  let score = 0;
  expanded.forEach((token) => {
    if (!token) {
      return;
    }
    if (hasMatch(token)) {
      score += token.includes(" ") ? 18 : 8;
    }
  });

  const exactTopic = normalizeText(topic);
  if (paper.relevanceTopics.some((item) => normalizeText(item) === exactTopic) || haystack.includes(exactTopic)) {
    score += 24;
  }

  return score;
}

export function hasStrongTopicAlignment(topic, paper) {
  const normalizedTopic = normalizeText(topic).trim();
  const topicTokens = normalizedTopic.split(/\s+/).filter(Boolean);
  const expanded = expandQuery(topic);
  const title = normalizeText(paper.title);
  const titleAbstract = normalizeText([paper.title, paper.abstract].join(" "));
  const titleTokens = new Set(title.split(/\s+/).filter(Boolean));
  const titleAbstractTokens = new Set(titleAbstract.split(/\s+/).filter(Boolean));
  const phraseMatches = expanded.filter((item) => item.includes(" ") && titleAbstract.includes(item));
  const titleTokenCoverage = topicTokens.filter((token) => titleTokens.has(token)).length;
  const abstractTokenCoverage = topicTokens.filter((token) => titleAbstractTokens.has(token)).length;
  const synonymSignal = expanded.some((item) => item.includes(" ") && titleAbstract.includes(item));

  if (topicTokens.length <= 1) {
    return titleTokenCoverage >= 1 || abstractTokenCoverage >= 1 || synonymSignal;
  }

  if (title.includes(normalizedTopic) || phraseMatches.includes(normalizedTopic)) {
    return true;
  }

  if (titleTokenCoverage >= 2) {
    return true;
  }

  if (titleTokenCoverage >= 1 && (abstractTokenCoverage >= 2 || synonymSignal)) {
    return true;
  }

  return false;
}

export function computeRecencyScore(paper) {
  const age = daysAgo(paper.publishedAt);
  if (age <= 7) {
    return 30;
  }
  if (age <= 30) {
    return 22;
  }
  if (age <= 90) {
    return 12;
  }
  return 4;
}

export function getReadPriority(totalScore, type) {
  const typeBoost = ["Survey", "Benchmark"].includes(type) ? 8 : 0;
  const score = totalScore + typeBoost;
  if (score >= 54) {
    return "高优先";
  }
  if (score >= 32) {
    return "中优先";
  }
  return "低优先";
}

export function getRelevanceLabel(relevanceScore) {
  if (relevanceScore >= 48) {
    return "高相关";
  }
  if (relevanceScore >= 28) {
    return "一般相关";
  }
  return "弱相关";
}

export function getDaysLabel(range) {
  return `最近 ${sanitizeRange(range)} 天`;
}

export function getMinimumRelevanceScore(topic) {
  const normalizedTopic = normalizeText(topic).trim();
  const tokenCount = normalizedTopic.split(/\s+/).filter(Boolean).length;
  return tokenCount >= 2 ? 18 : 8;
}

export function sortResults(results, sortMode = "smart") {
  const normalizedSort = sanitizeSort(sortMode);
  return [...results].sort((left, right) => {
    if (normalizedSort === "latest") {
      return new Date(right.publishedAt) - new Date(left.publishedAt);
    }
    return right.totalScore - left.totalScore;
  });
}

export function scorePaper(paper, topic) {
  const relevanceScore = computeRelevanceScore(topic, paper);
  const recencyScore = computeRecencyScore(paper);
  const totalScore = relevanceScore + recencyScore;
  return {
    ...paper,
    age: daysAgo(paper.publishedAt),
    relevanceScore,
    recencyScore,
    totalScore,
    readPriority: getReadPriority(totalScore, paper.type),
    relevanceLabel: getRelevanceLabel(relevanceScore)
  };
}

export function searchPapers(topic, range = 30, papers = mockPapers) {
  if (normalizeText(topic).includes("error")) {
    throw new Error("Simulated source failure");
  }

  const normalizedRange = sanitizeRange(range);
  const minimumRelevanceScore = getMinimumRelevanceScore(topic);

  return papers
    .map((paper) => scorePaper(paper, topic))
    .filter(
      (paper) =>
        paper.age <= normalizedRange &&
        paper.relevanceScore >= minimumRelevanceScore &&
        hasStrongTopicAlignment(topic, paper)
    );
}

export function buildTrendDigest(topic, range, results) {
  const normalizedRange = sanitizeRange(range);
  const topPapers = sortResults(results, "smart").slice(0, 3);
  const keywordCounts = new Map();

  results.forEach((paper) => {
    paper.keywords.slice(0, 4).forEach((keyword) => {
      const normalized = keyword.toLowerCase();
      keywordCounts.set(normalized, (keywordCounts.get(normalized) || 0) + 1);
    });
  });

  const keyTopics = [...keywordCounts.entries()]
    .sort((a, b) => b[1] - a[1])
    .slice(0, 4)
    .map(([keyword]) => keyword.replace(/\b\w/g, (char) => char.toUpperCase()));

  return {
    topic,
    dateRange: normalizedRange,
    paperCount: results.length,
    keyTopics,
    topPapers,
    suggestedReadingOrder: topPapers.map((paper) => paper.id),
    summaryText:
      results.length === 0
        ? ""
        : `最近 ${normalizedRange} 天，${topic} 方向共出现 ${results.length} 篇较相关论文，主题主要集中在 ${keyTopics
            .slice(0, 3)
            .join("、")}。建议优先阅读 ${topPapers
            .map((paper) => `《${paper.title}》`)
            .join("、")}，分别覆盖综述/评测基座、核心方法与更贴近落地的问题。`
  };
}

export function buildSearchResponse(topic, range = 30, sort = "smart", papers = mockPapers) {
  const normalizedRange = sanitizeRange(range);
  const normalizedSort = sanitizeSort(sort);
  const scoredPapers = sortResults(searchPapers(topic, normalizedRange, papers), normalizedSort);
  return {
    query: {
      topic,
      range: normalizedRange,
      sort: normalizedSort,
      count: scoredPapers.length
    },
    digest: buildTrendDigest(topic, normalizedRange, scoredPapers),
    papers: scoredPapers
  };
}

export function getPaperDetail(id, topic = "", range = 30, sort = "smart", papers = mockPapers) {
  const basePaper = papers.find((paper) => paper.id === id) || mockPapers.find((paper) => paper.id === id);
  if (!basePaper) {
    return null;
  }

  if (!topic) {
    return {
      ...basePaper,
      readPriority: basePaper.summary?.recommendation === "精读" ? "高优先" : "中优先",
      relevanceLabel: "一般相关",
      relevanceScore: 0,
      recencyScore: computeRecencyScore(basePaper),
      totalScore: computeRecencyScore(basePaper)
    };
  }

  const normalizedRange = sanitizeRange(range);
  const normalizedSort = sanitizeSort(sort);
  const scored = sortResults(searchPapers(topic, normalizedRange, papers), normalizedSort).find((paper) => paper.id === id);
  if (scored) {
    return scored;
  }

  const rescored = scorePaper(basePaper, topic);
  return {
    ...rescored,
    readPriority: rescored.summary?.recommendation === "精读" ? "高优先" : rescored.readPriority
  };
}

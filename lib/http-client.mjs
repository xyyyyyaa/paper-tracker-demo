function createAbortSignal(timeoutMs) {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), timeoutMs);
  return {
    signal: controller.signal,
    clear: () => clearTimeout(timeout)
  };
}

function buildUserAgent(config) {
  const contactPart = config.contactEmail ? `; mailto:${config.contactEmail}` : "";
  return `ResearchRadar/0.1 (+${config.appBaseUrl}${contactPart})`;
}

export async function fetchJson(url, { config, headers = {}, timeoutMs = 12000 } = {}) {
  const request = createAbortSignal(timeoutMs);

  try {
    const response = await fetch(url, {
      headers: {
        Accept: "application/json",
        "User-Agent": buildUserAgent(config),
        ...headers
      },
      signal: request.signal
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status} for ${url}`);
    }

    return await response.json();
  } finally {
    request.clear();
  }
}

export async function fetchText(url, { config, headers = {}, timeoutMs = 12000 } = {}) {
  const request = createAbortSignal(timeoutMs);

  try {
    const response = await fetch(url, {
      headers: {
        Accept: "text/plain, application/atom+xml, application/xml, text/xml",
        "User-Agent": buildUserAgent(config),
        ...headers
      },
      signal: request.signal
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status} for ${url}`);
    }

    return await response.text();
  } finally {
    request.clear();
  }
}

const http = require("node:http");
const fs = require("node:fs/promises");
const path = require("node:path");

const HOST = process.env.HOST || "127.0.0.1";
const PORT = Number.parseInt(process.env.PORT || "4173", 10);
const ROOT = __dirname;
const CACHE_TTL_MS = 5 * 60 * 1000;
const FEED_TIMEOUT_MS = 8_000;
const MAX_ITEMS_PER_FEED = 20;
const MAX_ARTICLE_AGE_MS = 72 * 60 * 60 * 1000;

const SOURCE_AUTHORITY = {
  ESPN: 9.6,
  "CBS Sports": 8.7,
  "The Guardian": 8.2,
};

const FEEDS = [
  {
    id: "espn-top",
    source: "ESPN",
    label: "ESPN Top",
    sport: null,
    url: "https://www.espn.com/espn/rss/news",
  },
  {
    id: "espn-nfl",
    source: "ESPN",
    label: "ESPN NFL",
    sport: "NFL",
    url: "https://www.espn.com/espn/rss/nfl/news",
  },
  {
    id: "espn-nba",
    source: "ESPN",
    label: "ESPN NBA",
    sport: "NBA",
    url: "https://www.espn.com/espn/rss/nba/news",
  },
  {
    id: "espn-mlb",
    source: "ESPN",
    label: "ESPN MLB",
    sport: "MLB",
    url: "https://www.espn.com/espn/rss/mlb/news",
  },
  {
    id: "espn-nhl",
    source: "ESPN",
    label: "ESPN NHL",
    sport: "NHL",
    url: "https://www.espn.com/espn/rss/nhl/news",
  },
  {
    id: "espn-soccer",
    source: "ESPN",
    label: "ESPN Soccer",
    sport: "Soccer",
    url: "https://www.espn.com/espn/rss/soccer/news",
  },
  {
    id: "cbs-headlines",
    source: "CBS Sports",
    label: "CBS Sports Headlines",
    sport: null,
    url: "https://www.cbssports.com/rss/headlines/",
  },
  {
    id: "guardian-sport",
    source: "The Guardian",
    label: "Guardian Sport",
    sport: null,
    url: "https://www.theguardian.com/sport/rss",
  },
];

const SPORT_PRIORITY = [
  "All",
  "NFL",
  "NBA",
  "WNBA",
  "MLB",
  "NHL",
  "Soccer",
  "NCAA",
  "Tennis",
  "Golf",
  "Boxing",
  "MMA",
  "Racing",
  "Olympics",
  "Other",
];

const STOP_WORDS = new Set([
  "the",
  "and",
  "for",
  "with",
  "that",
  "this",
  "from",
  "into",
  "after",
  "before",
  "over",
  "under",
  "around",
  "about",
  "amid",
  "against",
  "while",
  "what",
  "when",
  "where",
  "which",
  "their",
  "your",
  "have",
  "has",
  "had",
  "his",
  "her",
  "its",
  "our",
  "out",
  "off",
  "but",
  "you",
  "all",
  "new",
  "can",
  "how",
  "why",
  "one",
  "two",
  "three",
  "top",
  "best",
  "latest",
  "live",
  "tracker",
  "trackers",
  "updates",
  "update",
  "report",
  "reports",
  "news",
  "free",
  "agency",
  "agencies",
  "mock",
  "draft",
  "drafts",
  "college",
  "bracket",
  "brackets",
  "tournament",
  "tournaments",
  "march",
  "madness",
  "basketball",
  "football",
  "baseball",
  "hockey",
  "soccer",
  "playoff",
  "playoffs",
  "ranking",
  "rankings",
  "takeaways",
  "analysis",
  "preview",
  "guide",
  "picks",
  "pick",
  "predictions",
  "prediction",
  "odds",
  "watch",
  "season",
  "sports",
  "sport",
  "team",
  "teams",
  "games",
  "game",
  "match",
  "player",
  "players",
  "wins",
  "win",
  "loss",
  "loses",
  "beating",
  "vs",
  "via",
  "still",
  "more",
  "less",
  "says",
  "said",
  "source",
  "sources",
  "round",
  "first",
  "second",
  "final",
  "title",
  "headline",
  "headlines",
  "today",
  "tonight",
  "tomorrow",
]);

const MIME_TYPES = {
  ".css": "text/css; charset=utf-8",
  ".html": "text/html; charset=utf-8",
  ".js": "application/javascript; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".md": "text/markdown; charset=utf-8",
};

const cache = {
  data: null,
  expiresAt: 0,
};

const server = http.createServer(async (request, response) => {
  try {
    const requestUrl = new URL(request.url, `http://${request.headers.host || `${HOST}:${PORT}`}`);

    if (requestUrl.pathname === "/api/stories") {
      await handleStoriesRequest(requestUrl, response);
      return;
    }

    await serveStaticAsset(requestUrl.pathname, response);
  } catch (error) {
    respondJson(response, 500, {
      error: "Internal server error",
      details: error instanceof Error ? error.message : String(error),
    });
  }
});

server.listen(PORT, HOST, () => {
  console.log(`SportsMeme running at http://${HOST}:${PORT}`);
});

async function handleStoriesRequest(requestUrl, response) {
  const forceRefresh = requestUrl.searchParams.get("refresh") === "1";

  try {
    const payload = await getStoriesPayload(forceRefresh);
    respondJson(response, 200, payload);
  } catch (error) {
    respondJson(response, 502, {
      error: "Unable to fetch live feeds",
      details: error instanceof Error ? error.message : String(error),
    });
  }
}

async function serveStaticAsset(requestPath, response) {
  const relativePath = requestPath === "/" ? "/index.html" : requestPath;
  const filePath = path.resolve(ROOT, `.${relativePath}`);

  if (!filePath.startsWith(ROOT)) {
    respondText(response, 403, "Forbidden");
    return;
  }

  try {
    const file = await fs.readFile(filePath);
    const contentType = MIME_TYPES[path.extname(filePath)] || "application/octet-stream";
    response.writeHead(200, {
      "Cache-Control": "no-store",
      "Content-Type": contentType,
    });
    response.end(file);
  } catch (error) {
    if (error && error.code === "ENOENT") {
      respondText(response, 404, "Not found");
      return;
    }
    throw error;
  }
}

async function getStoriesPayload(forceRefresh = false) {
  const now = Date.now();

  if (!forceRefresh && cache.data && cache.expiresAt > now) {
    return cache.data;
  }

  const feedResults = await Promise.all(FEEDS.map((feed) => fetchFeed(feed)));
  const successfulFeeds = feedResults.filter((result) => result.ok);
  const partialFailures = feedResults
    .filter((result) => !result.ok)
    .map((result) => `${result.feed.label}: ${result.error}`);

  const articles = dedupeArticles(
    successfulFeeds
      .flatMap((result) => result.items)
      .filter((item) => isUsefulArticle(item))
      .filter((item) => Date.now() - item.publishedAtMs <= MAX_ARTICLE_AGE_MS),
  );

  if (!articles.length) {
    if (cache.data) {
      return {
        ...cache.data,
        stale: true,
        partialFailures,
        generatedAt: new Date().toISOString(),
      };
    }

    throw new Error(partialFailures.join(" | ") || "All configured feeds returned zero items.");
  }

  const payload = buildPayload({
    articles,
    feedResults,
    generatedAt: new Date().toISOString(),
    stale: false,
    partialFailures,
  });

  cache.data = payload;
  cache.expiresAt = now + CACHE_TTL_MS;

  return payload;
}

async function fetchFeed(feed) {
  try {
    const response = await fetch(feed.url, {
      headers: {
        Accept: "application/rss+xml, application/xml, text/xml;q=0.9, */*;q=0.8",
        "User-Agent": "SportsMeme/1.0 (+local aggregator prototype)",
      },
      signal: AbortSignal.timeout(FEED_TIMEOUT_MS),
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`);
    }

    const xml = await response.text();
    const parsed = parseRssFeed(xml, feed);

    return {
      ok: true,
      feed,
      title: parsed.title,
      lastBuildDate: parsed.lastBuildDate,
      itemCount: parsed.items.length,
      items: parsed.items,
    };
  } catch (error) {
    return {
      ok: false,
      feed,
      title: feed.label,
      lastBuildDate: null,
      itemCount: 0,
      items: [],
      error: error instanceof Error ? error.message : String(error),
    };
  }
}

function parseRssFeed(xml, feed) {
  const items = matchBlocks(xml, "item")
    .slice(0, MAX_ITEMS_PER_FEED)
    .map((block, index) => parseRssItem(block, feed, index))
    .filter(Boolean);

  return {
    title: cleanText(readTag(xml, "title")) || feed.label,
    lastBuildDate: cleanText(readTag(xml, "lastBuildDate")) || cleanText(readTag(xml, "pubDate")),
    items,
  };
}

function parseRssItem(block, feed, index) {
  const rawTitle = readTag(block, "title");
  const rawDescription =
    readTag(block, "description") || readTag(block, "content:encoded") || "";
  const rawLink = readTag(block, "link");
  const rawDate = readTag(block, "pubDate") || readTag(block, "dc:date") || readTag(block, "updated");
  const rawAuthor = readTag(block, "dc:creator") || readTag(block, "author") || "";
  const categories = readTags(block, "category").map(cleanText).filter(Boolean);
  const image =
    readTagAttribute(block, "media:content", "url") ||
    readTagAttribute(block, "enclosure", "url") ||
    null;

  const title = cleanText(rawTitle);
  const summary = summarizeText(rawDescription);
  const url = canonicalizeUrl(cleanText(rawLink));
  const publishedAt = parseFeedDate(rawDate);

  if (!title || !url || !publishedAt) {
    return null;
  }

  const sport = inferSport({
    categories,
    feedSport: feed.sport,
    title,
    summary,
    url,
  });

  return {
    id: `${feed.id}-${index}-${slugify(title).slice(0, 48)}`,
    title,
    summary,
    url,
    source: feed.source,
    feedLabel: feed.label,
    author: cleanText(rawAuthor),
    categories,
    sport,
    image,
    publishedAt,
    publishedAtMs: Date.parse(publishedAt),
    authority: SOURCE_AUTHORITY[feed.source] ?? 7,
  };
}

function buildPayload({ articles, feedResults, generatedAt, stale, partialFailures }) {
  const prepared = enrichArticles(articles);
  const clusters = buildClusters(prepared);
  const sports = getAvailableSports(prepared);
  const visibleSources = [...new Set(prepared.map((article) => article.source))].sort();
  const sourceBreakdown = getSourceBreakdown(prepared);

  return {
    generatedAt,
    stale,
    partialFailures,
    feedCount: FEEDS.length,
    activeFeedCount: feedResults.filter((result) => result.ok).length,
    sourceCount: visibleSources.length,
    articleCount: prepared.length,
    clusterCount: clusters.length,
    availableSports: sports,
    clusters,
    articles: prepared
      .slice()
      .sort((left, right) => right.publishedAtMs - left.publishedAtMs)
      .map(serializeArticle),
    feeds: feedResults.map((result) => ({
      id: result.feed.id,
      source: result.feed.source,
      label: result.feed.label,
      url: result.feed.url,
      ok: result.ok,
      itemCount: result.itemCount,
      lastBuildDate: result.lastBuildDate,
      error: result.ok ? null : result.error,
    })),
    sourceBreakdown,
  };
}

function enrichArticles(articles) {
  const documentFrequency = new Map();
  const prepared = articles.map((article) => {
    const titleTokens = unique(tokenize(article.title));
    const bigrams = makeBigrams(titleTokens);

    for (const token of titleTokens) {
      documentFrequency.set(token, (documentFrequency.get(token) || 0) + 1);
    }

    return {
      ...article,
      normalizedTitle: normalizeTitle(article.title),
      titleTokens,
      bigrams,
    };
  });

  const totalDocuments = prepared.length || 1;

  return prepared.map((article) => ({
    ...article,
    tokenWeights: new Map(
      article.titleTokens.map((token) => [token, getTokenWeight(token, documentFrequency, totalDocuments)]),
    ),
    minutesAgo: Math.max(0, Math.round((Date.now() - article.publishedAtMs) / 60_000)),
  }));
}

function buildClusters(articles) {
  const sorted = articles.slice().sort((left, right) => right.publishedAtMs - left.publishedAtMs);
  const clusters = [];

  for (const article of sorted) {
    let bestCluster = null;
    let bestMatch = null;

    for (const cluster of clusters) {
      if (cluster.sport !== article.sport) {
        continue;
      }

      const match = scoreClusterMatch(article, cluster);
      if (!bestMatch || match.score > bestMatch.score) {
        bestMatch = match;
        bestCluster = cluster;
      }
    }

    if (
      bestCluster &&
      bestMatch &&
      bestMatch.score >= 0.5 &&
      (bestMatch.sharedStrongTokens >= 2 ||
        bestMatch.sharedBigrams >= 1 ||
        bestMatch.overlapWeight >= 3.6)
    ) {
      addArticleToCluster(bestCluster, article);
      continue;
    }

    clusters.push(createCluster(article));
  }

  return clusters
    .map((cluster) => finalizeCluster(cluster))
    .sort((left, right) => right.score - left.score);
}

function createCluster(article) {
  const tokenWeights = new Map();
  for (const [token, weight] of article.tokenWeights.entries()) {
    tokenWeights.set(token, weight);
  }

  return {
    sport: article.sport,
    articles: [article],
    normalizedTitles: new Set([article.normalizedTitle]),
    urls: new Set([article.url]),
    bigrams: new Set(article.bigrams),
    tokenWeights,
    signatureTokens: getTopTokens(tokenWeights, 10),
  };
}

function addArticleToCluster(cluster, article) {
  cluster.articles.push(article);
  cluster.normalizedTitles.add(article.normalizedTitle);
  cluster.urls.add(article.url);

  for (const bigram of article.bigrams) {
    cluster.bigrams.add(bigram);
  }

  for (const [token, weight] of article.tokenWeights.entries()) {
    cluster.tokenWeights.set(token, (cluster.tokenWeights.get(token) || 0) + weight);
  }

  cluster.signatureTokens = getTopTokens(cluster.tokenWeights, 10);
}

function finalizeCluster(cluster) {
  const rankedArticles = cluster.articles
    .slice()
    .sort((left, right) => rankArticle(right) - rankArticle(left));

  const lead = rankedArticles[0];
  const related = rankedArticles
    .slice(1)
    .sort((left, right) => right.publishedAtMs - left.publishedAtMs)
    .map(serializeArticle);
  const uniqueSources = [...new Set(cluster.articles.map((article) => article.source))];
  const freshestMinutes = Math.min(...cluster.articles.map((article) => article.minutesAgo));
  const averageAuthority =
    cluster.articles.reduce((sum, article) => sum + article.authority, 0) / cluster.articles.length;
  const momentum = Math.min(
    100,
    Math.round(
      24 +
        uniqueSources.length * 14 +
        cluster.articles.length * 6 +
        Math.max(0, 60 - freshestMinutes) * 0.5 +
        averageAuthority * 1.4,
    ),
  );
  const score = Math.round(
    Math.max(0, 120 - freshestMinutes) * 0.55 +
      uniqueSources.length * 24 +
      cluster.articles.length * 10 +
      averageAuthority * 3.2,
  );

  return {
    id: slugify(`${lead.sport}-${lead.title}`).slice(0, 72),
    sport: lead.sport,
    score,
    momentum,
    sourceCount: uniqueSources.length,
    articleCount: cluster.articles.length,
    sources: uniqueSources.sort(),
    keywords: cluster.signatureTokens.slice(0, 5),
    lead: serializeArticle(lead),
    related,
    updatedAt: new Date(Math.max(...cluster.articles.map((article) => article.publishedAtMs))).toISOString(),
  };
}

function serializeArticle(article) {
  return {
    id: article.id,
    title: article.title,
    summary: article.summary,
    url: article.url,
    source: article.source,
    feedLabel: article.feedLabel,
    author: article.author,
    sport: article.sport,
    image: article.image,
    publishedAt: article.publishedAt,
    minutesAgo: article.minutesAgo,
  };
}

function scoreClusterMatch(article, cluster) {
  if (cluster.urls.has(article.url) || cluster.normalizedTitles.has(article.normalizedTitle)) {
    return {
      score: 1,
      sharedStrongTokens: 99,
      sharedBigrams: 99,
      overlapWeight: 99,
    };
  }

  const articleWeight = sumWeights(article.tokenWeights);
  const signatureWeights = cluster.signatureTokens.map((token) => cluster.tokenWeights.get(token) || 0);
  const signatureWeightSum = signatureWeights.reduce((sum, weight) => sum + weight, 0) || 1;

  let overlapWeight = 0;
  let sharedStrongTokens = 0;
  for (const token of article.titleTokens) {
    if (!cluster.tokenWeights.has(token)) {
      continue;
    }

    const weight = article.tokenWeights.get(token) || 0;
    overlapWeight += weight;
    if (weight >= 1.6) {
      sharedStrongTokens += 1;
    }
  }

  let sharedBigrams = 0;
  for (const bigram of article.bigrams) {
    if (cluster.bigrams.has(bigram)) {
      sharedBigrams += 1;
    }
  }

  const coverage = overlapWeight / (articleWeight || 1);
  const signatureCoverage = overlapWeight / signatureWeightSum;

  return {
    score: coverage * 0.68 + signatureCoverage * 0.16 + sharedStrongTokens * 0.08 + sharedBigrams * 0.1,
    sharedStrongTokens,
    sharedBigrams,
    overlapWeight,
  };
}

function rankArticle(article) {
  return Math.max(0, 180 - article.minutesAgo) * 0.5 + article.authority * 4;
}

function getAvailableSports(articles) {
  const available = new Set(articles.map((article) => article.sport));
  return SPORT_PRIORITY.filter((sport) => sport === "All" || available.has(sport));
}

function getSourceBreakdown(articles) {
  const counts = new Map();

  for (const article of articles) {
    counts.set(article.source, (counts.get(article.source) || 0) + 1);
  }

  return [...counts.entries()]
    .map(([source, count]) => ({ source, count }))
    .sort((left, right) => right.count - left.count);
}

function dedupeArticles(articles) {
  const byUrl = new Map();

  for (const article of articles) {
    if (!byUrl.has(article.url)) {
      byUrl.set(article.url, article);
      continue;
    }

    const existing = byUrl.get(article.url);
    if (article.publishedAtMs > existing.publishedAtMs) {
      byUrl.set(article.url, article);
    }
  }

  return [...byUrl.values()];
}

function inferSport({ categories, feedSport, title, summary, url }) {
  if (feedSport) {
    return feedSport;
  }

  const haystack = `${categories.join(" ")} ${title} ${summary} ${url}`.toLowerCase();
  const patterns = [
    ["WNBA", ["wnba"]],
    ["NCAA", ["march madness", "ncaa", "college basketball", "college football", "college-football", "college-baseball", "college-basketball", "womens-college-basketball", "mens-college-basketball"]],
    ["Soccer", ["soccer", "usmnt", "fifa", "premier league", "world cup", "/football/", "champions league", "arsenal", "chelsea", "liverpool", "man united"]],
    ["NFL", ["nfl", "/nfl/", "quarterback", "touchdown", "free agency", "broncos", "chiefs", "vikings", "eagles", "dolphins"]],
    ["NBA", ["nba", "/nba/", "lakers", "celtics", "warriors", "knicks", "play-in", "expansion draft"]],
    ["MLB", ["mlb", "/mlb/", "world baseball classic", "opening day", "pitcher", "home run"]],
    ["NHL", ["nhl", "/nhl/", "stanley cup", "wild-card", "wild card"]],
    ["Golf", ["golf", "masters", "pga", "rory"]],
    ["Tennis", ["tennis", "atp", "wta", "grand slam"]],
    ["Boxing", ["boxing", "heavyweight"]],
    ["MMA", ["mma", "ufc", "bellator", "pfl"]],
    ["Racing", ["nascar", "formula 1", "indycar", "f1"]],
    ["Olympics", ["olympic", "paralympic"]],
  ];

  for (const [sport, keywords] of patterns) {
    if (keywords.some((keyword) => haystack.includes(keyword))) {
      return sport;
    }
  }

  return "Other";
}

function isUsefulArticle(article) {
  const haystack = `${article.title} ${article.summary} ${article.url}`.toLowerCase();
  const blockedPhrases = [
    "promo code",
    "bonus bets",
    "sportsline",
    "make your picks now",
    "/betting/",
    "fantasy.espn.com/games/tournament-challenge",
  ];

  return !blockedPhrases.some((phrase) => haystack.includes(phrase));
}

function matchBlocks(xml, tagName) {
  const expression = new RegExp(`<${escapeRegExp(tagName)}\\b[^>]*>[\\s\\S]*?<\\/${escapeRegExp(tagName)}>`, "gi");
  return xml.match(expression) || [];
}

function readTag(xml, tagName) {
  const expression = new RegExp(
    `<${escapeRegExp(tagName)}\\b[^>]*>([\\s\\S]*?)<\\/${escapeRegExp(tagName)}>`,
    "i",
  );
  const match = xml.match(expression);
  return match ? match[1] : "";
}

function readTags(xml, tagName) {
  const expression = new RegExp(
    `<${escapeRegExp(tagName)}\\b[^>]*>([\\s\\S]*?)<\\/${escapeRegExp(tagName)}>`,
    "gi",
  );
  return [...xml.matchAll(expression)].map((match) => match[1]);
}

function readTagAttribute(xml, tagName, attributeName) {
  const expression = new RegExp(
    `<${escapeRegExp(tagName)}\\b[^>]*\\b${escapeRegExp(attributeName)}=(["'])(.*?)\\1[^>]*>`,
    "i",
  );
  const match = xml.match(expression);
  return match ? decodeHtmlEntities(match[2]) : "";
}

function cleanText(value) {
  return stripHtml(decodeHtmlEntities(value || "")).replace(/\s+/g, " ").trim();
}

function summarizeText(value) {
  const text = cleanText(value);
  if (!text) {
    return "No summary available.";
  }

  return text.length > 240 ? `${text.slice(0, 237).trimEnd()}...` : text;
}

function stripHtml(value) {
  return value
    .replace(/<!\[CDATA\[([\s\S]*?)\]\]>/g, "$1")
    .replace(/<[^>]+>/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function decodeHtmlEntities(value) {
  return (value || "")
    .replace(/<!\[CDATA\[([\s\S]*?)\]\]>/g, "$1")
    .replace(/&#(\d+);/g, (_, code) => String.fromCodePoint(Number.parseInt(code, 10)))
    .replace(/&#x([0-9a-f]+);/gi, (_, code) => String.fromCodePoint(Number.parseInt(code, 16)))
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&apos;/g, "'")
    .replace(/&#039;/g, "'")
    .replace(/&nbsp;/g, " ")
    .replace(/&rsquo;/g, "'")
    .replace(/&lsquo;/g, "'")
    .replace(/&ldquo;/g, '"')
    .replace(/&rdquo;/g, '"')
    .replace(/&mdash;/g, "-")
    .replace(/&ndash;/g, "-")
    .replace(/&hellip;/g, "...");
}

function parseFeedDate(value) {
  const timestamp = Date.parse(cleanText(value));
  return Number.isNaN(timestamp) ? null : new Date(timestamp).toISOString();
}

function canonicalizeUrl(rawUrl) {
  try {
    const url = new URL(rawUrl);
    url.hash = "";

    for (const key of [...url.searchParams.keys()]) {
      if (
        key.startsWith("utm_") ||
        ["cmpid", "taid", "soc_src", "soc_trk", "src", "intcmp"].includes(key)
      ) {
        url.searchParams.delete(key);
      }
    }

    if (url.searchParams.size === 0) {
      url.search = "";
    }

    return url.toString();
  } catch {
    return rawUrl;
  }
}

function tokenize(text) {
  return text
    .toLowerCase()
    .replace(/['’]/g, "")
    .split(/[^a-z0-9]+/)
    .filter((token) => token.length >= 3 && !STOP_WORDS.has(token) && !/^\d+$/.test(token));
}

function normalizeTitle(title) {
  return tokenize(title).join(" ");
}

function makeBigrams(tokens) {
  const bigrams = [];

  for (let index = 0; index < tokens.length - 1; index += 1) {
    bigrams.push(`${tokens[index]} ${tokens[index + 1]}`);
  }

  return bigrams;
}

function getTokenWeight(token, documentFrequency, totalDocuments) {
  const frequency = documentFrequency.get(token) || 1;
  return 1 + Math.log((totalDocuments + 1) / frequency);
}

function getTopTokens(tokenWeights, count) {
  return [...tokenWeights.entries()]
    .sort((left, right) => right[1] - left[1])
    .slice(0, count)
    .map(([token]) => token);
}

function sumWeights(tokenWeights) {
  let total = 0;

  for (const weight of tokenWeights.values()) {
    total += weight;
  }

  return total;
}

function unique(values) {
  return [...new Set(values)];
}

function slugify(text) {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function escapeRegExp(value) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function respondJson(response, statusCode, body) {
  response.writeHead(statusCode, {
    "Cache-Control": "no-store",
    "Content-Type": "application/json; charset=utf-8",
  });
  response.end(JSON.stringify(body));
}

function respondText(response, statusCode, body) {
  response.writeHead(statusCode, {
    "Cache-Control": "no-store",
    "Content-Type": "text/plain; charset=utf-8",
  });
  response.end(body);
}

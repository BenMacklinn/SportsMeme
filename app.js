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

const state = {
  activeSport: "All",
  activeView: "frontpage",
  loading: true,
  error: null,
  payload: null,
};

const elements = {
  updatedAt: document.querySelector("#updated-at"),
  clusterCount: document.querySelector("#cluster-count"),
  sourceCount: document.querySelector("#source-count"),
  riverCount: document.querySelector("#river-count"),
  buzzScore: document.querySelector("#buzz-score"),
  filters: document.querySelector("#filters"),
  leadStory: document.querySelector("#lead-story"),
  clusterList: document.querySelector("#cluster-list"),
  riverList: document.querySelector("#river-list"),
  pulseList: document.querySelector("#pulse-list"),
  sourceList: document.querySelector("#source-list"),
  frontpageView: document.querySelector("#frontpage-view"),
  riverView: document.querySelector("#river-view"),
  refreshButton: document.querySelector("#reshuffle-button"),
  alertBanner: document.querySelector("#alert-banner"),
  tabButtons: [...document.querySelectorAll(".tab-button")],
};

async function loadStories(forceRefresh = false) {
  state.loading = true;
  state.error = null;
  renderApp();

  try {
    const response = await fetch(forceRefresh ? "/api/stories?refresh=1" : "/api/stories", {
      cache: "no-store",
    });
    const payload = await response.json();

    if (!response.ok) {
      throw new Error(payload.details || payload.error || "Failed to load live stories.");
    }

    state.payload = payload;

    if (!getSportOrder().includes(state.activeSport)) {
      state.activeSport = "All";
    }
  } catch (error) {
    state.error = error instanceof Error ? error.message : String(error);
  } finally {
    state.loading = false;
    renderApp();
  }
}

function getSportOrder() {
  if (!state.payload?.availableSports?.length) {
    return ["All"];
  }

  return SPORT_PRIORITY.filter((sport) => state.payload.availableSports.includes(sport));
}

function getVisibleClusters() {
  const clusters = state.payload?.clusters || [];
  if (state.activeSport === "All") {
    return clusters;
  }
  return clusters.filter((cluster) => cluster.sport === state.activeSport);
}

function getVisibleArticles() {
  const articles = state.payload?.articles || [];
  if (state.activeSport === "All") {
    return articles;
  }
  return articles.filter((article) => article.sport === state.activeSport);
}

function formatRelativeTime(minutesAgo) {
  if (minutesAgo < 60) {
    return `${minutesAgo}m ago`;
  }

  const hours = Math.floor(minutesAgo / 60);
  const minutes = minutesAgo % 60;
  return minutes ? `${hours}h ${minutes}m ago` : `${hours}h ago`;
}

function formatClock(isoString) {
  if (!isoString) {
    return "Unavailable";
  }

  const date = new Date(isoString);
  return date.toLocaleTimeString([], {
    hour: "numeric",
    minute: "2-digit",
  });
}

function getClusterSourceEntries(cluster) {
  const entries = [];
  const seenSources = new Set();

  for (const article of [cluster.lead, ...cluster.related]) {
    if (seenSources.has(article.source)) {
      continue;
    }

    seenSources.add(article.source);
    entries.push(article);
  }

  return entries;
}

function renderFilters() {
  elements.filters.innerHTML = getSportOrder()
    .map(
      (sport) => `
        <button
          class="filter-button ${sport === state.activeSport ? "active" : ""}"
          data-sport="${sport}"
          type="button"
        >
          ${sport}
        </button>
      `,
    )
    .join("");

  elements.filters.querySelectorAll(".filter-button").forEach((button) => {
    button.addEventListener("click", () => {
      state.activeSport = button.dataset.sport;
      renderApp();
    });
  });
}

function renderTabs() {
  elements.tabButtons.forEach((button) => {
    const isActive = button.dataset.view === state.activeView;
    button.classList.toggle("active", isActive);
    button.setAttribute("aria-selected", String(isActive));
  });

  const showFrontpage = state.activeView === "frontpage";
  elements.frontpageView.hidden = !showFrontpage;
  elements.riverView.hidden = showFrontpage;
  elements.frontpageView.classList.toggle("active", showFrontpage);
  elements.riverView.classList.toggle("active", !showFrontpage);
}

function renderAlert() {
  if (state.error) {
    elements.alertBanner.hidden = false;
    elements.alertBanner.dataset.tone = "error";
    elements.alertBanner.textContent = `Live feed refresh failed: ${state.error}`;
    return;
  }

  if (!state.payload) {
    elements.alertBanner.hidden = true;
    elements.alertBanner.textContent = "";
    return;
  }

  if (state.payload.partialFailures?.length || state.payload.stale) {
    const failures = (state.payload.partialFailures || []).join(" | ");
    elements.alertBanner.hidden = false;
    elements.alertBanner.dataset.tone = "warning";
    elements.alertBanner.textContent = state.payload.stale
      ? `Showing cached results. ${failures}`.trim()
      : `Some feeds failed during this refresh. ${failures}`.trim();
    return;
  }

  elements.alertBanner.hidden = false;
  elements.alertBanner.dataset.tone = "info";
  elements.alertBanner.textContent = `Live feeds active: ${state.payload.activeFeedCount} of ${state.payload.feedCount} sources refreshed.`;
}

function renderLeadStory(cluster) {
  if (state.loading) {
    elements.leadStory.innerHTML = `<div class="empty-state">Loading live sports coverage...</div>`;
    return;
  }

  if (!cluster) {
    elements.leadStory.innerHTML = `<div class="empty-state">No clustered stories match this filter yet.</div>`;
    return;
  }

  const sourceLinks = getClusterSourceEntries(cluster)
    .map(
      (article, index) => `
        <li>
          <a href="${article.url}" target="_blank" rel="noreferrer">
            <strong>${article.source}${index === 0 ? " | Lead" : ""}</strong>
            <span>${article.title}</span>
          </a>
        </li>
      `,
    )
    .join("");

  elements.leadStory.innerHTML = `
    <article class="lead-story">
      <p class="lead-kicker">${cluster.sport} | Lead Story</p>
      <h2>${cluster.lead.title}</h2>
      <p class="lead-summary">${cluster.lead.summary}</p>
      <div class="lead-meta">
        <span class="meta-pill">${cluster.sourceCount} sources</span>
        <span class="meta-pill">${cluster.articleCount} articles</span>
        <span class="meta-pill">Momentum ${cluster.momentum}</span>
        <span class="meta-pill">${formatRelativeTime(cluster.lead.minutesAgo)}</span>
      </div>
      <ul class="lead-links">${sourceLinks || "<li><span>No source coverage available yet.</span></li>"}</ul>
    </article>
  `;
}

function renderClusterList(clusters) {
  if (state.loading) {
    elements.clusterList.innerHTML = "";
    return;
  }

  const remaining = clusters.slice(1);
  if (!remaining.length) {
    elements.clusterList.innerHTML = "";
    return;
  }

  elements.clusterList.innerHTML = remaining
    .map(
      (cluster, index) => {
        const sourceLinks = getClusterSourceEntries(cluster)
          .map(
            (article, sourceIndex) => `
              <li>
                <a href="${article.url}" target="_blank" rel="noreferrer">${article.source}${sourceIndex === 0 ? " | Lead" : ""}</a>
                <span>${article.title}</span>
              </li>
            `,
          )
          .join("");

        return `
        <article class="cluster-card">
          <div>
            <p class="cluster-kicker">${cluster.sport} | Rank ${index + 2}</p>
            <h3>${cluster.lead.title}</h3>
          </div>
          <p class="cluster-summary">${cluster.lead.summary}</p>
          <div class="cluster-meta">
            <span class="meta-label">${cluster.sourceCount} sources</span>
            <span class="meta-label">${cluster.articleCount} articles</span>
            <span class="meta-label">Momentum ${cluster.momentum}</span>
            <span class="meta-label">${formatRelativeTime(cluster.lead.minutesAgo)}</span>
          </div>
          <ul class="cluster-links">${sourceLinks}</ul>
        </article>
      `;
      },
    )
    .join("");
}

function renderRiver(articles) {
  if (state.loading) {
    elements.riverList.innerHTML = `<div class="empty-state">Loading river view...</div>`;
    return;
  }

  if (!articles.length) {
    elements.riverList.innerHTML = `<div class="empty-state">No stories match this filter.</div>`;
    return;
  }

  elements.riverList.innerHTML = articles
    .map(
      (article) => `
        <article class="river-entry">
          <div class="river-entry-main">
            <p class="river-kicker">${article.sport} | ${article.source}</p>
            <h3><a href="${article.url}" target="_blank" rel="noreferrer">${article.title}</a></h3>
            <p class="river-summary">${article.summary}</p>
            <div class="river-meta">
              <span>${article.feedLabel}</span>
              <span>${article.author || "Staff"}</span>
            </div>
          </div>
          <time class="river-timestamp">${formatRelativeTime(article.minutesAgo)}</time>
        </article>
      `,
    )
    .join("");
}

function renderPulse(clusters) {
  if (!clusters.length) {
    elements.pulseList.innerHTML = `<li class="pulse-row"><span>No live story data yet.</span><span>0</span></li>`;
    return;
  }

  elements.pulseList.innerHTML = clusters
    .slice(0, 5)
    .map(
      (cluster) => `
        <li class="pulse-row">
          <a href="${cluster.lead.url}" target="_blank" rel="noreferrer">${cluster.lead.title}</a>
          <span>${cluster.momentum}</span>
        </li>
      `,
    )
    .join("");
}

function renderSources() {
  const feeds = state.payload?.feeds || [];

  if (!feeds.length) {
    elements.sourceList.innerHTML = `<li><span>No feed status available.</span></li>`;
    return;
  }

  elements.sourceList.innerHTML = feeds
    .map(
      (feed) => `
        <li>
          <div class="source-meta">
            <strong>${feed.label}</strong>
            <small>${feed.ok ? "Live" : "Unavailable"}${feed.error ? `: ${feed.error}` : ""}</small>
          </div>
          <span>${feed.itemCount} items</span>
        </li>
      `,
    )
    .join("");
}

function renderScoreboard(clusters, articles) {
  const publishers = new Set(articles.map((article) => article.source));
  const totalMomentum = clusters.reduce((sum, cluster) => sum + cluster.momentum, 0);

  elements.clusterCount.textContent = String(clusters.length);
  elements.sourceCount.textContent = String(publishers.size);
  elements.riverCount.textContent = String(articles.length);
  elements.buzzScore.textContent = String(totalMomentum);
  elements.updatedAt.textContent = state.payload ? formatClock(state.payload.generatedAt) : "Unavailable";
}

function renderApp() {
  const clusters = getVisibleClusters();
  const articles = getVisibleArticles();
  const leadCluster = clusters[0];

  elements.refreshButton.disabled = state.loading;
  elements.refreshButton.textContent = state.loading ? "Refreshing..." : "Refresh Feeds";

  renderFilters();
  renderTabs();
  renderAlert();
  renderLeadStory(leadCluster);
  renderClusterList(clusters);
  renderRiver(articles);
  renderPulse(clusters);
  renderSources();
  renderScoreboard(clusters, articles);
}

elements.tabButtons.forEach((button) => {
  button.addEventListener("click", () => {
    state.activeView = button.dataset.view;
    renderApp();
  });
});

elements.refreshButton.addEventListener("click", () => {
  loadStories(true);
});

renderApp();
loadStories(false);

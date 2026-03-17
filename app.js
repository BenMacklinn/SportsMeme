const sourceAuthority = {
  ESPN: 9.7,
  "The Athletic": 9.4,
  "Yahoo Sports": 8.9,
  "CBS Sports": 8.6,
  "FOX Sports": 8.2,
  "NBC Sports": 8.1,
  "Bleacher Report": 7.5,
  "Associated Press": 9.3,
  Reuters: 9.2,
  "MLB Trade Rumors": 7.9,
  "Sky Sports": 7.8,
  "The Guardian": 8.3,
  "NHL.com": 7.8,
  "ESPN FC": 8.4,
  "Front Office Sports": 7.2,
};

const articles = [
  {
    id: 1,
    title: "Star quarterback agrees to a record-setting extension before free agency opens",
    source: "ESPN",
    sport: "NFL",
    storyKey: "nfl-quarterback-extension",
    summary:
      "Front-office urgency, cap flexibility, and market pressure converged into a pre-free-agency blockbuster.",
    minutesAgo: 28,
    buzz: 92,
    url: "#",
  },
  {
    id: 2,
    title: "Why the new QB extension resets the NFL salary ceiling for contenders",
    source: "The Athletic",
    sport: "NFL",
    storyKey: "nfl-quarterback-extension",
    summary:
      "League insiders see the deal as the new benchmark for elite quarterbacks and roster construction.",
    minutesAgo: 52,
    buzz: 76,
    url: "#",
  },
  {
    id: 3,
    title: "Teams around the league react to the massive quarterback deal",
    source: "Yahoo Sports",
    sport: "NFL",
    storyKey: "nfl-quarterback-extension",
    summary:
      "Executives and coaches immediately began recalculating their offseason priorities after the signing.",
    minutesAgo: 81,
    buzz: 64,
    url: "#",
  },
  {
    id: 4,
    title: "Play-in race tightens after late comeback swings the Western Conference table",
    source: "ESPN",
    sport: "NBA",
    storyKey: "nba-play-in-race",
    summary:
      "A crowded playoff picture tightened again after a fourth-quarter collapse changed seeding projections.",
    minutesAgo: 19,
    buzz: 88,
    url: "#",
  },
  {
    id: 5,
    title: "How one comeback changed the West playoff map overnight",
    source: "CBS Sports",
    sport: "NBA",
    storyKey: "nba-play-in-race",
    summary:
      "Updated projections show a razor-thin gap between home-court advantage and a sudden play-in berth.",
    minutesAgo: 47,
    buzz: 72,
    url: "#",
  },
  {
    id: 6,
    title: "The Western Conference race now feels like a nightly elimination bracket",
    source: "Bleacher Report",
    sport: "NBA",
    storyKey: "nba-play-in-race",
    summary:
      "Volatile standings and a compressed schedule are making each nationally televised game matter more.",
    minutesAgo: 73,
    buzz: 61,
    url: "#",
  },
  {
    id: 7,
    title: "Ace leaves after three innings, raising concern for a rotation already under strain",
    source: "Associated Press",
    sport: "MLB",
    storyKey: "mlb-ace-injury",
    summary:
      "The club is awaiting imaging results after another early-season setback hit the top of the rotation.",
    minutesAgo: 31,
    buzz: 67,
    url: "#",
  },
  {
    id: 8,
    title: "Rotation depth tested again after apparent injury scare for Opening Day starter",
    source: "MLB Trade Rumors",
    sport: "MLB",
    storyKey: "mlb-ace-injury",
    summary:
      "The front office may need to accelerate trade talks if the diagnosis rules the starter out for weeks.",
    minutesAgo: 59,
    buzz: 58,
    url: "#",
  },
  {
    id: 9,
    title: "Managers around baseball are watching the latest ace injury with alarm",
    source: "FOX Sports",
    sport: "MLB",
    storyKey: "mlb-ace-injury",
    summary:
      "Pitching usage trends and calendar pressure are turning one incident into a wider league debate.",
    minutesAgo: 108,
    buzz: 49,
    url: "#",
  },
  {
    id: 10,
    title: "Heavyweight title fight is finalized after weeks of stalled negotiations",
    source: "Yahoo Sports",
    sport: "Boxing",
    storyKey: "boxing-title-fight",
    summary:
      "Two camps that had sparred publicly over venue and purse structure finally aligned on a summer date.",
    minutesAgo: 24,
    buzz: 85,
    url: "#",
  },
  {
    id: 11,
    title: "What the newly announced title fight means for the rest of the division",
    source: "The Guardian",
    sport: "Boxing",
    storyKey: "boxing-title-fight",
    summary:
      "Mandatory challengers and broadcast commitments now face a more defined path.",
    minutesAgo: 63,
    buzz: 57,
    url: "#",
  },
  {
    id: 12,
    title: "College basketball power shifts after a surprise coaching resignation",
    source: "CBS Sports",
    sport: "NCAA",
    storyKey: "ncaa-coach-resignation",
    summary:
      "A major opening has reshaped the transfer portal, booster activity, and next season's pecking order.",
    minutesAgo: 16,
    buzz: 81,
    url: "#",
  },
  {
    id: 13,
    title: "Program insiders detail the abrupt exit that jolted the coaching carousel",
    source: "The Athletic",
    sport: "NCAA",
    storyKey: "ncaa-coach-resignation",
    summary:
      "The resignation landed with little warning, leaving assistants, recruits, and portal targets in limbo.",
    minutesAgo: 44,
    buzz: 70,
    url: "#",
  },
  {
    id: 14,
    title: "How a sudden coaching vacancy can redraw the college hoops map",
    source: "Front Office Sports",
    sport: "NCAA",
    storyKey: "ncaa-coach-resignation",
    summary:
      "The move has immediate business consequences for media rights attention and donor momentum.",
    minutesAgo: 86,
    buzz: 46,
    url: "#",
  },
  {
    id: 15,
    title: "National team fallout grows after a veteran forward is left off the roster",
    source: "ESPN FC",
    sport: "Soccer",
    storyKey: "soccer-roster-snub",
    summary:
      "Selection politics and tactical shifts are dominating the discussion ahead of a major international window.",
    minutesAgo: 21,
    buzz: 77,
    url: "#",
  },
  {
    id: 16,
    title: "Roster omission sparks debate over loyalty, form, and squad evolution",
    source: "Sky Sports",
    sport: "Soccer",
    storyKey: "soccer-roster-snub",
    summary:
      "The coach defended the choice as merit-based, but former players quickly challenged that framing.",
    minutesAgo: 48,
    buzz: 66,
    url: "#",
  },
  {
    id: 17,
    title: "Veteran winger dropped as federation backs a younger core",
    source: "Reuters",
    sport: "Soccer",
    storyKey: "soccer-roster-snub",
    summary:
      "Officials say the decision reflects a longer tournament cycle, not a short-term disagreement.",
    minutesAgo: 79,
    buzz: 53,
    url: "#",
  },
  {
    id: 18,
    title: "Trade chatter intensifies after an All-Star guard changes agencies",
    source: "NBC Sports",
    sport: "NBA",
    storyKey: "nba-guard-agency-change",
    summary:
      "A routine business move quickly turned into a referendum on the franchise's long-term direction.",
    minutesAgo: 35,
    buzz: 68,
    url: "#",
  },
  {
    id: 19,
    title: "Agency change puts fresh attention on an All-Star guard's future",
    source: "The Athletic",
    sport: "NBA",
    storyKey: "nba-guard-agency-change",
    summary:
      "League executives do not see a trade as inevitable, but the timing keeps the story hot.",
    minutesAgo: 72,
    buzz: 59,
    url: "#",
  },
  {
    id: 20,
    title: "Contenders begin early calls after star guard shifts representation",
    source: "Yahoo Sports",
    sport: "NBA",
    storyKey: "nba-guard-agency-change",
    summary:
      "Rival teams are monitoring whether the agent move signals a summer market opening.",
    minutesAgo: 95,
    buzz: 52,
    url: "#",
  },
  {
    id: 21,
    title: "Expansion pressure builds as the league reports another surge in attendance",
    source: "Associated Press",
    sport: "WNBA",
    storyKey: "wnba-expansion-push",
    summary:
      "Ownership groups are lining up as the league's business momentum strengthens the expansion case.",
    minutesAgo: 27,
    buzz: 74,
    url: "#",
  },
  {
    id: 22,
    title: "Why the WNBA's attendance jump changes the expansion timeline",
    source: "ESPN",
    sport: "WNBA",
    storyKey: "wnba-expansion-push",
    summary:
      "Sponsors, media buyers, and prospective owners now have a stronger case for accelerated growth.",
    minutesAgo: 56,
    buzz: 62,
    url: "#",
  },
  {
    id: 23,
    title: "Expansion talk heats up as investors circle new women's basketball markets",
    source: "Front Office Sports",
    sport: "WNBA",
    storyKey: "wnba-expansion-push",
    summary:
      "Business-side optimism is colliding with questions about facilities, ownership groups, and geography.",
    minutesAgo: 91,
    buzz: 55,
    url: "#",
  },
  {
    id: 24,
    title: "Playoff race turns after overtime thriller reshapes the wild-card picture",
    source: "NHL.com",
    sport: "NHL",
    storyKey: "nhl-wild-card-thriller",
    summary:
      "An overtime finish swung postseason odds for multiple teams chasing the final wild-card spots.",
    minutesAgo: 18,
    buzz: 73,
    url: "#",
  },
  {
    id: 25,
    title: "One overtime result changed the math for half the Eastern bubble",
    source: "The Athletic",
    sport: "NHL",
    storyKey: "nhl-wild-card-thriller",
    summary:
      "The result compressed the standings again and kept three fan bases glued to nightly scoreboard watching.",
    minutesAgo: 54,
    buzz: 60,
    url: "#",
  },
];

const sportOrder = ["All", "NFL", "NBA", "MLB", "NHL", "Soccer", "NCAA", "WNBA", "Boxing"];
const state = {
  activeSport: "All",
  activeView: "frontpage",
  randomSeed: 0,
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
  reshuffleButton: document.querySelector("#reshuffle-button"),
  tabButtons: [...document.querySelectorAll(".tab-button")],
};

function formatMinutes(minutesAgo) {
  if (minutesAgo < 60) {
    return `${minutesAgo}m ago`;
  }

  const hours = Math.floor(minutesAgo / 60);
  const minutes = minutesAgo % 60;
  return minutes ? `${hours}h ${minutes}m ago` : `${hours}h ago`;
}

function getAuthorityScore(source) {
  return sourceAuthority[source] ?? 7;
}

function getClusteredStories(activeSport) {
  const visibleArticles =
    activeSport === "All"
      ? articles
      : articles.filter((article) => article.sport === activeSport);

  const clusters = new Map();

  for (const article of visibleArticles) {
    if (!clusters.has(article.storyKey)) {
      clusters.set(article.storyKey, {
        storyKey: article.storyKey,
        sport: article.sport,
        articles: [],
      });
    }

    clusters.get(article.storyKey).articles.push({
      ...article,
      dynamicBuzz: article.buzz + getSignalDrift(article.id),
    });
  }

  return [...clusters.values()]
    .map((cluster) => buildCluster(cluster))
    .sort((a, b) => b.score - a.score);
}

function getSignalDrift(id) {
  const rotation = (state.randomSeed * 17 + id * 11) % 9;
  return rotation - 4;
}

function buildCluster(cluster) {
  const sortedArticles = [...cluster.articles].sort((a, b) => a.minutesAgo - b.minutesAgo);
  const lead = sortedArticles[0];
  const uniqueSources = new Set(sortedArticles.map((article) => article.source));
  const averageBuzz =
    sortedArticles.reduce((sum, article) => sum + article.dynamicBuzz, 0) / sortedArticles.length;
  const averageAuthority =
    sortedArticles.reduce((sum, article) => sum + getAuthorityScore(article.source), 0) /
    sortedArticles.length;
  const freshness = Math.max(0, 120 - lead.minutesAgo);
  const score =
    freshness * 0.46 +
    averageBuzz * 0.34 +
    uniqueSources.size * 8 +
    averageAuthority * 1.8;

  return {
    ...cluster,
    lead,
    related: sortedArticles.slice(1),
    sourceCount: uniqueSources.size,
    averageBuzz: Math.round(averageBuzz),
    score: Math.round(score),
    freshness,
  };
}

function renderFilters() {
  elements.filters.innerHTML = sportOrder
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

function renderLeadStory(cluster) {
  if (!cluster) {
    elements.leadStory.innerHTML = "";
    return;
  }

  const relatedLinks = cluster.related
    .slice(0, 3)
    .map(
      (article) => `
        <li>
          <a href="${article.url}">
            <strong>${article.source}</strong>
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
        <span class="meta-pill">Buzz ${cluster.averageBuzz}</span>
        <span class="meta-pill">Score ${cluster.score}</span>
        <span class="meta-pill">${formatMinutes(cluster.lead.minutesAgo)}</span>
      </div>
      <ul class="lead-links">${relatedLinks}</ul>
    </article>
  `;
}

function renderClusterList(clusters) {
  elements.clusterList.innerHTML = clusters
    .slice(1)
    .map(
      (cluster, index) => `
        <article class="cluster-card">
          <div>
            <p class="cluster-kicker">${cluster.sport} | Rank ${index + 2}</p>
            <h3>${cluster.lead.title}</h3>
          </div>
          <p class="cluster-summary">${cluster.lead.summary}</p>
          <div class="cluster-meta">
            <span class="meta-label">${cluster.sourceCount} sources</span>
            <span class="meta-label">Buzz ${cluster.averageBuzz}</span>
            <span class="meta-label">${formatMinutes(cluster.lead.minutesAgo)}</span>
          </div>
          <ul class="cluster-links">
            ${cluster.related
              .map(
                (article) => `
                  <li>
                    <a href="${article.url}">${article.source}</a>
                    <span>${article.title}</span>
                  </li>
                `,
              )
              .join("")}
          </ul>
        </article>
      `,
    )
    .join("");
}

function renderRiver(activeSport) {
  const visibleArticles =
    activeSport === "All"
      ? [...articles]
      : articles.filter((article) => article.sport === activeSport);

  const sorted = visibleArticles.sort((a, b) => a.minutesAgo - b.minutesAgo);

  elements.riverList.innerHTML = sorted
    .map(
      (article) => `
        <article class="river-entry">
          <div class="river-entry-main">
            <p class="river-kicker">${article.sport} | ${article.source}</p>
            <h3>${article.title}</h3>
            <p class="river-summary">${article.summary}</p>
            <div class="river-meta">
              <span>Cluster ${article.storyKey.replaceAll("-", " ")}</span>
              <span>Buzz ${article.buzz + getSignalDrift(article.id)}</span>
            </div>
          </div>
          <time class="river-timestamp">${formatMinutes(article.minutesAgo)}</time>
        </article>
      `,
    )
    .join("");
}

function renderPulse(clusters) {
  elements.pulseList.innerHTML = clusters
    .slice(0, 5)
    .map(
      (cluster) => `
        <li class="pulse-row">
          <a href="#">${cluster.lead.title}</a>
          <span>${cluster.averageBuzz}</span>
        </li>
      `,
    )
    .join("");
}

function renderSources() {
  const counts = articles.reduce((map, article) => {
    map.set(article.source, (map.get(article.source) ?? 0) + 1);
    return map;
  }, new Map());

  const rows = [...counts.entries()].sort((a, b) => b[1] - a[1]);

  elements.sourceList.innerHTML = rows
    .map(
      ([source, count]) => `
        <li>
          <strong>${source}</strong>
          <span>${count} stories</span>
        </li>
      `,
    )
    .join("");
}

function renderScoreboard(clusters) {
  const visibleArticles =
    state.activeSport === "All"
      ? articles
      : articles.filter((article) => article.sport === state.activeSport);
  const uniqueSources = new Set(visibleArticles.map((article) => article.source));
  const buzz = clusters.reduce((sum, cluster) => sum + cluster.averageBuzz, 0);

  elements.clusterCount.textContent = String(clusters.length);
  elements.sourceCount.textContent = String(uniqueSources.size);
  elements.riverCount.textContent = String(visibleArticles.length);
  elements.buzzScore.textContent = String(buzz);
  elements.updatedAt.textContent = new Date().toLocaleTimeString([], {
    hour: "numeric",
    minute: "2-digit",
  });
}

function renderTabs() {
  elements.tabButtons.forEach((button) => {
    const isActive = button.dataset.view === state.activeView;
    button.classList.toggle("active", isActive);
    button.setAttribute("aria-selected", String(isActive));
  });

  const showFront = state.activeView === "frontpage";
  elements.frontpageView.hidden = !showFront;
  elements.riverView.hidden = showFront;
  elements.frontpageView.classList.toggle("active", showFront);
  elements.riverView.classList.toggle("active", !showFront);
}

function renderApp() {
  const clusters = getClusteredStories(state.activeSport);
  renderFilters();
  renderTabs();
  renderLeadStory(clusters[0]);
  renderClusterList(clusters);
  renderRiver(state.activeSport);
  renderPulse(clusters);
  renderSources();
  renderScoreboard(clusters);
}

elements.tabButtons.forEach((button) => {
  button.addEventListener("click", () => {
    state.activeView = button.dataset.view;
    renderTabs();
  });
});

elements.reshuffleButton.addEventListener("click", () => {
  state.randomSeed += 1;
  renderApp();
});

renderApp();

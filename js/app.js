const fmtM = n => Math.round(n).toLocaleString('th-TH');

// App State
const state = {
  currentPlayer: null,
  isAdmin: false,
  currentView: 'schedule',
  serverBuild: null, // Code.gs BUILD, as reported by the bootstrap response
  gwLoading: null,   // gameweek whose odds are still on the way (no cache to show)
  slipsLoadedGw: null, // gameweek whose slips are loaded — an empty round is still loaded
  gw: null,          // gameweek being viewed — every fetch is scoped to it
  standings: [],     // settled months: one row per player per month
  periodSlips: [],   // every slip of the current unsettled month (summary tab)
  matches: {},
  players: [],
  slips: [],
  allSlips: [],
  pendingSlips: [], // other players' unresolved slips only — cheap fallback when allSlips isn't loaded
  // Lines + odds loaded from Sheet
  ahLines: {},
  ouLines: {},
  ahOddsH: {},
  ahOddsA: {},
  ouOddsO: {},
  ouOddsU: {},
  cornerLines: {},
  cornerOddsO: {},
  cornerOddsU: {},
  cardLines: {},
  cardOddsO: {},
  cardOddsU: {},
  // Outright champion bet: dormant for EPL. getChampionTeams() looks for the WC
  // semi-finals, finds nothing, and renderChampionCard() renders '' — kept (not
  // deleted) so a title-winner bet can be switched back on later.
  championOdds: {},
};

function parsePicks(s) {
  if (s.picks && Array.isArray(s.picks)) return s;
  try { return { ...s, picks: JSON.parse(s.picks_json || '[]') }; } catch (e) { return { ...s, picks: [] }; }
}

function isMatchToday(match) {
  // "วันแข่ง" เริ่มที่ 14:00 ไทย — shift boundary จาก midnight เป็น 14:00
  const THAI = 7 * 3600000;
  const CUT  = 14 * 3600000;
  const matchDay = Math.floor((kickoffUtc(match.date).getTime() + THAI - CUT) / 86400000);
  const nowDay   = Math.floor((Date.now()                     + THAI - CUT) / 86400000);
  return matchDay === nowDay;
}

// Check if match is locked (kickoff passed OR has score OR postponed)
function isMatchLocked(match) {
  const thaiTime = kickoffUtc(match.date);
  const timePassed = new Date() >= new Date(thaiTime.getTime() - 10 * 60 * 1000);
  const result = state.matches[match.id];
  const hasScore = result && typeof result.team1_score === 'number' && typeof result.team2_score === 'number';
  return timePassed || hasScore || isMatchPostponed(match);
}

// เต็ง window override for a gameweek, set from the ราคา tab and stored in
// `bet_state` on that gameweek's matches rows: 'open' / 'closed' beat the time
// rule, anything else means 'auto' (the time rule decides). It only moves the
// OPENING of เต็ง — isMatchLocked above still closes each match on its own
// kickoff in every state — and steps are not on this window at all.
function betStateOfGw(gw) {
  const ms = MATCHES_BY_GW[gw] || [];
  for (let i = 0; i < ms.length; i++) {
    const row = state.matches[ms[i].id];
    const v = row && String(row.bet_state || '').trim().toLowerCase();
    if (v === 'open' || v === 'closed') return v;
  }
  return 'auto';
}

// A postponed EPL match takes no new bets. Slips already holding it stay pending
// (no score = unresolved) and are left out of settlement until it is replayed.
function isMatchPostponed(match) {
  const result = state.matches[match.id];
  return !!(result && result.match_status === 'postponed');
}

// Format AH line: only show on the favorite side (negative = ต่อ)
function formatAhFav(line, isHome) {
  const num = parseFloat(line);
  if (isNaN(num) || num === 0) return '';
  if (num < 0) return isHome ? '' + num : '+' + Math.abs(num);
  return isHome ? '+' + num : '-' + num;
}

function getAllSlips() {
  if (state.allSlips.length) return state.allSlips;
  // Cheap fallback: own full history + everyone else's still-pending slips.
  // Missing other players' settled history — fine for the betting tab, but
  // callers that need full history (summary/insight) lazy-load state.allSlips first.
  const pending = (state.pendingSlips || []).filter(s => s.player !== state.currentPlayer);
  return [...(state.slips || []), ...pending];
}

// Slip source for the summary/insight tabs: the whole current month. Falls back
// to the gameweek in state.allSlips before the month has loaded.
function getPeriodSlips() {
  return state.periodSlips.length ? state.periodSlips : getAllSlips();
}

// What a player carries into a month from `standings` — settled money and the
// win/loss streak they were on. Without this, monthly archiving would silently
// reset every 🔥/🧊 badge and the season total on the 1st.
//
// `beforePeriod` excludes that period's own row, which matters when settling a
// month a second time: the row written by the first run is already in standings,
// and summing it in would double-count the money and re-seed the streak.
function getSeasonCarry(playerId, beforePeriod) {
  const rows = (state.standings || []).filter(r =>
    r.player === playerId && (!beforePeriod || String(r.period) < String(beforePeriod)));
  if (!rows.length) return { money: 0, streakVal: 0, streakDir: 0, hasHistory: false };
  rows.sort((a, b) => String(a.period).localeCompare(String(b.period)));
  const last = rows[rows.length - 1];
  const streak = Number(last.streak) || 0;
  return {
    money: rows.reduce((sum, r) => sum + (Number(r.settled_money) || 0), 0),
    streakVal: Math.abs(streak),
    streakDir: streak > 0 ? 1 : streak < 0 ? -1 : 0,
    hasHistory: true,
  };
}

function getDisplayName(playerId) {
  if (!playerId) return '';
  const p = state.players.find(p => p.player_id === playerId);
  return p ? p.display_name : playerId;
}

const STATUS_CONFIG = {
  pending:   { color: 'var(--secondary)', th: 'รอผล',   en: 'Pending'  },
  approved:  { color: 'var(--accent)',    th: 'อนุมัติ', en: 'Approved' },
  won:       { color: 'var(--accent)',    th: 'ชนะ',    en: 'Won'      },
  lost:      { color: 'var(--secondary)', th: 'แพ้',    en: 'Lost'     },
  cancelled: { color: 'var(--text-muted)',th: 'ยกเลิก', en: 'Cancelled'},
};

function formatPickLabel(p, lang) {
  if (p.type === 'corner') return `⛳ มุม${p.pick === 'over' ? 'สูง' : 'ต่ำ'} ${p.line || ''}`.trim();
  if (p.type === 'card') return `🟨 ใบ${p.pick === 'over' ? 'สูง' : 'ต่ำ'} ${p.line || ''}`.trim();
  if (p.type === 'champion') { const t = TEAMS[p.pick]; return `🏆 ${t ? (lang === 'th' ? t.nameTh : t.name) : p.pick}`; }
  if (p.type === 'ou') return `${p.pick === 'over' ? 'สูง' : 'ต่ำ'} ${p.line || ''}`.trim();
  const m = state.matchById ? state.matchById[p.match_id] : MATCHES.find(x => x.id === p.match_id);
  const isHome = m ? p.pick === m.team1 : false;
  const picked = TEAMS[p.pick];
  const name = picked ? (lang === 'th' ? picked.nameTh : picked.name) : p.pick;
  const line = p.line ? formatAhFav(p.line, isHome) : '';
  return `${name}${line ? ' ' + line : ''}`;
}

// Build lines + odds from matches data (loaded from Sheet)
function buildLinesFromMatches() {
  state.ahLines = {};
  state.ouLines = {};
  state.ahOddsH = {};
  state.ahOddsA = {};
  state.ouOddsO = {};
  state.ouOddsU = {};
  state.cornerLines = {};
  state.cornerOddsO = {};
  state.cornerOddsU = {};
  state.cardLines = {};
  state.cardOddsO = {};
  state.cardOddsU = {};
  state.matchById = {};
  MATCHES.forEach(m => { state.matchById[m.id] = m; });

  Object.values(state.matches).forEach(m => {
    // The Sheet is the fixture source: EPL kickoffs get moved for TV, so a
    // date_th edited there wins over the generated one — even after slips exist
    // on that match.
    const local = state.matchById[m.match_id];
    if (local && m.date_th) local.date = String(m.date_th).slice(0, 16);

    if (m.ah_line != null && m.ah_line !== '') {
      state.ahLines[m.match_id] = String(m.ah_line);
      state.ahOddsH[m.match_id] = parseFloat(m.ah_odds_h) || 1.80;
      state.ahOddsA[m.match_id] = parseFloat(m.ah_odds_a) || 1.90;
    }
    if (m.ou_line != null && m.ou_line !== '') {
      state.ouLines[m.match_id] = String(m.ou_line);
      state.ouOddsO[m.match_id] = parseFloat(m.ou_odds_o) || 1.90;
      state.ouOddsU[m.match_id] = parseFloat(m.ou_odds_u) || 1.90;
    }
    if (m.corner_line != null && m.corner_line !== '') {
      state.cornerLines[m.match_id] = String(m.corner_line);
      state.cornerOddsO[m.match_id] = parseFloat(m.corner_odds_o) || 1.90;
      state.cornerOddsU[m.match_id] = parseFloat(m.corner_odds_u) || 1.90;
    }
    if (m.card_line != null && m.card_line !== '') {
      state.cardLines[m.match_id] = String(m.card_line);
      state.cardOddsO[m.match_id] = parseFloat(m.card_odds_o) || 1.90;
      state.cardOddsU[m.match_id] = parseFloat(m.card_odds_u) || 1.90;
    }
  });
}

// --- Router ---
function navigate(view) {
  state.currentView = view;
  document.querySelectorAll('.view').forEach(v => v.classList.add('hidden'));
  const el = document.getElementById('view-' + view);
  if (el) {
    el.classList.remove('hidden');
    el.classList.remove('view-enter');
    void el.offsetWidth;
    el.classList.add('view-enter');
  }
  document.querySelectorAll('.nav-tab').forEach(t => t.classList.remove('active'));
  const activeTab = document.querySelector(`.nav-tab[href="#${view}"]`);
  if (activeTab) activeTab.classList.add('active');
  document.querySelectorAll('.btm-tab').forEach(t => t.classList.remove('active'));
  const activeBtm = document.querySelector(`.btm-tab[href="#${view}"]`);
  if (activeBtm) activeBtm.classList.add('active');
  renderCurrentView();
  window.scrollTo(0, 0);
}

async function renderCurrentView() {
  switch (state.currentView) {
    case 'schedule': renderSchedule(); break;
    case 'bet': renderBetting(); break;
    case 'summary': await renderSummaryLazy(); break;
    case 'odds': renderOdds(); break;
    case 'insight': renderInsight(); break;
  }
}

// The summary tab's unit is the month, not the gameweek: settled months come
// from `standings` (~10 rows each) and the running month from one `periodslips`
// read — the live slips tab IS the current period, since settled months are
// moved to slips_archive.
async function renderSummaryLazy() {
  const container = document.getElementById('view-summary');
  if (!state.periodSlips.length && API_BASE_URL && !state._fetchingPeriod) {
    state._fetchingPeriod = true;
    let sk = '';
    for (let i = 0; i < 4; i++) {
      sk += `<div class="skeleton-card"><div class="skeleton-line" style="height:18px;width:${40 + i * 10}%"></div><div class="skeleton-line" style="height:12px;width:60%"></div><div class="skeleton-line" style="height:12px;width:80%"></div></div>`;
    }
    container.innerHTML = sk;
    try {
      // This tab resolves a MONTH of slips, but state.matches only holds the 10
      // rows of the viewed gameweek — slips on any other gw would score as
      // pending. It therefore needs the matches of whatever period(s) the slips
      // belong to, which is only known AFTER the slips are read: three round
      // trips that could not even be issued together, on a backend that runs
      // them one at a time. The server does the whole chain in one invocation
      // now; `period` is the month to fall back on when there are no slips yet.
      const fallbackPeriod = GW_PERIOD[state.gw || currentGw()] || '';
      let periodSlips, standings, matchSets;
      const bundle = state._noSummaryBundle ? null : await fetchAPI('summary&period=' + fallbackPeriod);
      if (bundle && !bundle.error && bundle.periodslips !== undefined) {
        periodSlips = bundle.periodslips;
        standings = bundle.standings;
        matchSets = [bundle.matches];
      } else {
        // Older deployment without the summary action — same reads, the slow way
        if (bundle && bundle.error) state._noSummaryBundle = true;
        [periodSlips, standings] = await Promise.all([
          fetchAPI('periodslips'),
          fetchAPI('standings'),
        ]);
        const periods = [...new Set((periodSlips || []).map(s => s.period).filter(Boolean))];
        if (!periods.length) periods.push(fallbackPeriod);
        matchSets = await Promise.all(periods.map(p => fetchAPI('periodmatches&period=' + p)));
      }

      let merged = false;
      matchSets.forEach(ms => {
        if (!ms) return;
        // Merged by match_id — additive, never clobbers the gameweek rows
        ms.forEach(m => { state.matches[m.match_id] = m; });
        merged = true;
      });
      if (merged) buildLinesFromMatches();

      if (periodSlips) {
        state.periodSlips = periodSlips.map(parsePicks);
        try { localStorage.setItem('epl2627_periodslips', JSON.stringify({ t: Date.now(), d: periodSlips })); } catch (e) {}
      }
      if (standings) state.standings = standings;
    } finally {
      state._fetchingPeriod = false;
    }
  }
  renderSummary();
}

// --- Toast ---
function showToast(msg, duration) {
  duration = duration || 3000;
  const toast = document.getElementById('toast');
  toast.textContent = msg;
  toast.classList.remove('hidden', 'toast-out');
  void toast.offsetWidth; // force reflow to restart animation
  clearTimeout(toast._hideTimer);
  toast._hideTimer = setTimeout(() => {
    toast.classList.add('toast-out');
    setTimeout(() => { toast.classList.add('hidden'); toast.classList.remove('toast-out'); }, 260);
  }, duration);
}

// --- Badge (admin: pending approve count) ---
function updateTabBadges() {
  const count = (state.isAdmin && state.allSlips.length)
    ? state.allSlips.filter(s => {
        if (s.player === state.currentPlayer) return false;
        const resolved = typeof resolveSlip === 'function' ? resolveSlip(s) : { status: s.status };
        const st = resolved.status;
        return (st === 'won' || st === 'lost') && s.status !== 'approved' && s.status !== 'cancelled';
      }).length
    : 0;
  document.querySelectorAll('.bet-badge').forEach(b => {
    if (count > 0) { b.textContent = count; b.classList.remove('hidden'); }
    else b.classList.add('hidden');
  });
}

// --- Loading ---
function showLoading() { document.getElementById('loading').classList.remove('hidden'); }
function hideLoading() { document.getElementById('loading').classList.add('hidden'); }

// --- Build tag in the header ---
//
// The client half is read from this file's own <script src="js/app.js?v=X">, so
// it can never drift from the cache-buster in index.html. The server half
// arrives with the bootstrap response — a Code.gs redeploy that silently did
// not land (Save instead of New version) is otherwise invisible.
function clientBuild() {
  const s = document.querySelector('script[src*="js/app.js"]');
  const m = s && /[?&]v=([^&"]+)/.exec(s.getAttribute('src') || '');
  return m ? m[1] : 'dev';
}

function renderBuildTag() {
  const el = document.getElementById('app-build');
  if (!el) return;
  el.textContent = 'v' + clientBuild() + (state.serverBuild ? ' · srv ' + state.serverBuild : '');
  el.title = state.serverBuild
    ? 'client ' + clientBuild() + ' / Code.gs ' + state.serverBuild
    : 'client ' + clientBuild() + ' (server has not answered yet)';
}

// --- Per-gameweek localStorage cache ---
//
// One key per gameweek. The old single key held only the gameweek last looked
// at and was overwritten on every switch, so stepping back to a round you had
// just seen paid the full ~1.5 s round trip again. Apps Script costs ~1.2 s per
// call before it even reads the Sheet, so anything we can paint from here is
// worth keeping.
const GW_CACHE_TTL = 10 * 60 * 1000;

function gwCacheKey(kind, gw) { return 'epl2627_' + kind + '_gw' + gw; }

function saveGwCache(kind, gw, d) {
  try { localStorage.setItem(gwCacheKey(kind, gw), JSON.stringify({ t: Date.now(), gw: gw, d: d })); } catch (e) {}
}

function loadGwCache(kind, gw, maxAge) {
  try {
    const c = JSON.parse(localStorage.getItem(gwCacheKey(kind, gw)) || 'null');
    if (c && c.gw === gw && Date.now() - c.t < (maxAge || GW_CACHE_TTL)) return c.d;
  } catch (e) {}
  return null;
}

// --- Init ---
function init() {
  console.log('init() called');
  const debugEl = document.getElementById('debug-msg');
  if (debugEl) debugEl.remove();

  // Open on the gameweek that still has a match to come — every fetch below is
  // scoped to it, which is what keeps a 380-match season as cheap as one round.
  state.gw = currentGw();

  const savedPlayer = localStorage.getItem('epl2627_player');
  if (savedPlayer) state.currentPlayer = savedPlayer;
  if (localStorage.getItem('epl2627_admin') === 'true') state.isAdmin = true;

  window.addEventListener('hashchange', () => {
    const hash = location.hash.slice(1) || 'schedule';
    navigate(hash);
  });

  document.getElementById('lang-toggle').addEventListener('click', toggleLang);
  document.getElementById('lang-toggle').textContent = currentLang.toUpperCase();

  applyTranslations();
  updateAdminUI();
  renderBuildTag();

  // Load cached matches + players for instant first render
  try {
    const cm = loadGwCache('matches', state.gw);
    if (cm) {
      cm.forEach(m => { state.matches[m.match_id] = m; });
      buildLinesFromMatches();
    }
    const cp = JSON.parse(localStorage.getItem('epl2627_players') || 'null');
    if (cp && Date.now() - cp.t < 60 * 60 * 1000) {
      state.players = cp.d;
    }
    const cs = loadGwCache('allslips', state.gw);
    if (cs) {
      state.allSlips = cs.map(parsePicks);
      state.slipsLoadedGw = state.gw;
      if (state.currentPlayer) state.slips = state.allSlips.filter(s => s.player === state.currentPlayer);
    }
  } catch(e) {}

  // Show immediately with hardcoded + cached data — don't wait for API
  const hash = location.hash.slice(1) || 'schedule';
  navigate(hash);

  // Fetch API data in background, then re-render
  refreshData().then(() => {
    buildLinesFromMatches();
    updateTabBadges();
    renderCurrentView();
  }).catch(e => {
    console.error('refreshData error:', e);
    showToast(currentLang === 'th' ? 'โหลดข้อมูลไม่ได้ — ใช้ข้อมูลเก่า' : 'Offline — showing cached data', 5000);
  });

}

async function refreshData(fresh) {
  if (typeof API_BASE_URL === 'undefined' || !API_BASE_URL) return;
  // The gameweek this call is for. switchGw no longer waits for the response,
  // so a slow answer for GW3 must not overwrite state after the user has
  // already moved on to GW4.
  const forGw = state.gw;
  try {
    // fresh=1 bypasses the server-side cache (manual ↻ refresh)
    const suffix = (fresh ? '&fresh=1' : '') + '&gw=' + state.gw;

    // ONE call, not three. Apps Script runs a user's executions one at a time,
    // so the Promise.all below was never parallel — it was three queued script
    // starts, measured at 6-15 s for a gameweek switch against ~1.5 s for a
    // single call. One gameweek = 10 matches and one round of slips, so the
    // bundle is a few KB.
    let data = null;
    const boot = state._noBootstrap ? null : await fetchAPI('bootstrap' + suffix);
    if (boot && !boot.error && boot.matches) {
      data = { matches: boot.matches, players: boot.players, allSlips: boot.allslips };
      if (boot.build && boot.build !== state.serverBuild) {
        state.serverBuild = boot.build;
        renderBuildTag();
      }
    } else {
      // Older deployment with no bootstrap action. Pages goes live the moment
      // it is pushed but Code.gs is redeployed by hand, so the client has to
      // keep working against both. A refusal is remembered for the session:
      // every probe is another queued script start, and on this backend a
      // failed call is retried three times before it gives up.
      if (boot && boot.error) state._noBootstrap = true;
      const calls = {
        matches: fetchAPI('matches' + suffix),
        players: fetchAPI('players'),
        allSlips: fetchAPI('allslips' + suffix),
      };
      const results = await Promise.all(Object.values(calls));
      const keys = Object.keys(calls);
      data = {};
      keys.forEach((k, i) => { data[k] = results[i]; });
    }

    // Cache it under the gw it was fetched for either way — it is still valid
    // data, just not for the gameweek on screen any more.
    if (data.matches) saveGwCache('matches', forGw, data.matches);
    if (data.allSlips) saveGwCache('allslips', forGw, data.allSlips);
    if (state.gw !== forGw) return;   // user moved on while this was in flight

    if (data.matches) {
      data.matches.forEach(m => { state.matches[m.match_id] = m; });
    }
    if (data.players) {
      state.players = data.players;
      try { localStorage.setItem('epl2627_players', JSON.stringify({ t: Date.now(), d: data.players })); } catch(e) {}
    }
    if (Array.isArray(data.allSlips)) {
      state.allSlips = data.allSlips.map(parsePicks);
      state.slipsLoadedGw = forGw;   // so renderBetting does not refetch an empty round
      // My slips derived from allSlips — no separate 'slips' call needed
      if (state.currentPlayer) state.slips = state.allSlips.filter(s => s.player === state.currentPlayer);
    }
  } catch (e) {
    console.warn('API unavailable, using cached data', e);
  }
}

// Move the whole app to another gameweek. Paints first from data.js + the
// per-gw cache and refetches in the background — the same trick init() uses.
// It used to block on the fetch behind a spinner, which meant ~1.5-2 s of dead
// screen on every ◀ ▶: Apps Script costs that much per call even when its own
// cache hits, so waiting for it was the slowest thing in the app.
async function switchGw(gw) {
  gw = Math.min(38, Math.max(1, Number(gw) || 1));
  if (gw === state.gw) return;
  state.gw = gw;
  // state.matches is deliberately NOT cleared: it is keyed by match_id and the
  // summary tab needs a whole month of scores in it, not just this gameweek's.
  const cachedMatches = loadGwCache('matches', gw);
  if (cachedMatches) cachedMatches.forEach(m => { state.matches[m.match_id] = m; });

  const cachedSlips = loadGwCache('allslips', gw);
  state.allSlips = cachedSlips ? cachedSlips.map(parsePicks) : [];
  state.slipsLoadedGw = cachedSlips ? gw : null;
  state.slips = state.currentPlayer
    ? state.allSlips.filter(s => s.player === state.currentPlayer)
    : [];

  // Set BEFORE the first render, which is the render that has to say it: a
  // gameweek with nothing cached has no odds yet and the betting tab hides
  // matches without lines, so it says so inline (see renderBetting) rather than
  // behind a blocking overlay. The overlay used to cover that gap, but the gap
  // is only ~2 s when the backend behaves and was measured at 88 s when it did
  // not — with the fixtures already drawn underneath the whole time.
  state.gwLoading = cachedMatches ? null : gw;

  buildLinesFromMatches();
  await renderCurrentView();
  updateTabBadges();
  refreshData().then(() => {
    if (state.gw !== gw) return;
    buildLinesFromMatches();
    updateTabBadges();
  }).catch(e => console.warn('switchGw background refresh failed', e))
    .finally(() => {
      if (state.gwLoading === gw) state.gwLoading = null;
      if (state.gw === gw) renderCurrentView();
    });
}

// --- Odds freshness ---
//
// Odds move during the day. The server is the one that decides the price at
// submit time (validatePicks in Code.gs); everything here just keeps the screen
// close enough that friends rarely get a "ราคาเปลี่ยน" rejection.

// Fingerprint of the odds currently in state, to tell whether a refetch moved anything
function oddsSignature() {
  return Object.keys(state.ahLines).sort().map(id =>
    [id, state.ahLines[id], state.ahOddsH[id], state.ahOddsA[id],
     state.ouLines[id], state.ouOddsO[id], state.ouOddsU[id]].join(':')
  ).join('|');
}

// Refetch just this gameweek's 10 match rows. Returns true if odds/lines moved.
async function refreshMatches(fresh) {
  if (typeof API_BASE_URL === 'undefined' || !API_BASE_URL) return false;
  const before = oddsSignature();
  const data = await fetchAPI('matches&gw=' + state.gw + (fresh ? '&fresh=1' : ''));
  if (!data || !data.length) return false;
  data.forEach(m => { state.matches[m.match_id] = m; });
  buildLinesFromMatches();
  saveGwCache('matches', state.gw, data);
  return oddsSignature() !== before;
}

// A tab left open all day was the worst case: it kept showing the morning price
// forever. Refetch whenever the tab comes back to the front (throttled).
async function onTabWake() {
  if (document.hidden) return;
  if (state._lastWake && Date.now() - state._lastWake < 30000) return;
  state._lastWake = Date.now();

  const moved = await refreshMatches();
  if (!moved) return;

  // Never re-render over unsaved input: picks the player just tapped, or the
  // half-filled dropdowns in the ราคา tab (alt-tabbing away to look a line up
  // and coming back is exactly how that tab gets used).
  const selected = document.querySelectorAll('#view-bet .bet-pick.selected').length;
  const editingOdds = state.currentView === 'odds';
  if (editingOdds || (state.currentView === 'bet' && selected)) {
    showToast(currentLang === 'th' ? 'ราคาเปลี่ยนแล้ว — กด ↻ เพื่อดูราคาใหม่' : 'Odds changed — tap ↻ to reload', 5000);
  } else {
    renderCurrentView();
    if (state.currentView === 'bet') {
      showToast(currentLang === 'th' ? 'ราคาอัปเดตแล้ว' : 'Odds updated');
    }
  }
}

async function manualRefresh() {
  const btn = document.getElementById('refresh-btn');
  btn.disabled = true;
  btn.textContent = '…';
  showLoading();
  try {
    state.periodSlips = [];   // force the summary tab to refetch standings + this month
    state.standings = [];
    await refreshData(true);
    buildLinesFromMatches();
    await renderCurrentView();
    updateTabBadges();
    showToast(currentLang === 'th' ? 'อัปเดตแล้ว' : 'Updated');
  } catch(e) {
    showToast(currentLang === 'th' ? 'โหลดไม่ได้ ลองใหม่อีกครั้ง' : 'Failed to load, try again', 5000);
  } finally {
    btn.disabled = false;
    btn.textContent = '↻';
    hideLoading();
  }
}

// --- Start ---
document.addEventListener('DOMContentLoaded', init);
document.addEventListener('visibilitychange', onTabWake);
window.addEventListener('focus', onTabWake);
window.addEventListener('scroll', () => {
  const btn = document.getElementById('scroll-top-btn');
  if (btn) btn.style.display = window.scrollY > 300 ? '' : 'none';
}, { passive: true });

function filterSlipCards(query) {
  const q = (query || '').trim().toLowerCase();
  document.querySelectorAll('#view-bet .slip-card').forEach(card => {
    card.style.display = (!q || (card.dataset.search || '').includes(q)) ? '' : 'none';
  });
}

function updateAdminUI() {
  document.querySelectorAll('.admin-only').forEach(el => {
    if (state.isAdmin) el.classList.remove('hidden');
    else el.classList.add('hidden');
  });
}
